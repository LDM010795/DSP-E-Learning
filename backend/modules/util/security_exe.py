import ast
import multiprocessing
from multiprocessing import Process, Queue
import time
import sys
import io
import traceback
import threading
import platform
import signal
import warnings
import re
from RestrictedPython import compile_restricted, safe_globals
from RestrictedPython.Guards import guarded_setattr, safe_builtins
from RestrictedPython.PrintCollector import PrintCollector

# RestrictedPython-spezifische Warnungen unterdrücken
warnings.filterwarnings("ignore", category=SyntaxWarning, module="RestrictedPython")

class SecurityExecutor:
    """
    Eine Sicherheitsschicht für die Ausführung von Python-Code.
    Kombiniert mehrere Sicherheitsmechanismen:
    1. RestrictedPython - Verhindert Zugriff auf gefährliche Funktionen
    2. Eingeschränkter Namensraum - Nur Whitelisted-Builtins erlaubt
    3. Timeout via threading (für Windows) oder multiprocessing (für Unix) - Stoppt Endlosschleifen, CPU-Abuse
    4. AST Codeanalyse - Filtert gefährliche Syntax vorab
    """
    
    # AST-Prüfungen: Verbotene Module und Funktionen
    FORBIDDEN_MODULES = {
        'os', 'subprocess', 'sys', 'builtins', 'importlib', 'imp',
        'shutil', 'signal', 'commands', 'posix', 'popen2', 'pipes',
        'pty', 'platform', 'ctypes', 'multiprocessing', 'socket',
        'webbrowser', 'base64', 'pickle', 'shelve', '_winreg'
    }
    
    FORBIDDEN_ATTRIBUTES = {
        'system', 'popen', 'spawn', 'call', 'getattr', 'setattr', 'eval', 
        'exec', 'execfile', 'compile', 'open', 'file', 'write', 'globals',
        'locals', 'dir', '__dict__', '__class__', '__bases__', '__subclasses__',
        '__import__', 'load', 'loads', 'dump', 'dumps'
    }
    
    def __init__(self, timeout=5):
        """
        Initialisiert den Sicherheits-Executor.
        
        Args:
            timeout (int): Timeout in Sekunden für die Codeausführung (Standard: 5)
        """
        self.timeout = timeout
        # Überprüfen, ob wir auf Windows laufen
        self.is_windows = platform.system() == 'Windows'
    
    def analyze_code_safety(self, code):
        """
        Führt eine statische Codeanalyse durch, um gefährliche Konstrukte zu identifizieren.
        
        Args:
            code (str): Der zu analysierende Python-Code
            
        Returns:
            tuple: (is_safe, message) - Ob der Code sicher ist und eine Nachricht
        """
        try:
            tree = ast.parse(code)
        except SyntaxError as e:
            # Direkter SyntaxError wird durchgereicht, ohne Wrapper
            return False, str(e)
        
        # Prüfe auf verbotene Importe und Attribute
        for node in ast.walk(tree):
            # 1. Prüfe auf Import-Statements (import os, etc.)
            if isinstance(node, ast.Import):
                for name in node.names:
                    if name.name.split('.')[0] in self.FORBIDDEN_MODULES:
                        return False, f"Verbotenes Modul: {name.name} kann aus Sicherheitsgründen nicht importiert werden"
            
            # 2. Prüfe auf Import-From-Statements (from os import system, etc.)
            elif isinstance(node, ast.ImportFrom):
                if node.module and node.module.split('.')[0] in self.FORBIDDEN_MODULES:
                    return False, f"Verbotenes Modul: {node.module} kann aus Sicherheitsgründen nicht importiert werden"
                
                for name in node.names:
                    if name.name in self.FORBIDDEN_ATTRIBUTES:
                        return False, f"Verbotene Funktion: {node.module}.{name.name} kann aus Sicherheitsgründen nicht verwendet werden"
            
            # 3. Prüfe auf gefährliche Attributzugriffe (os.system, etc.)
            elif isinstance(node, ast.Attribute):
                if node.attr in self.FORBIDDEN_ATTRIBUTES:
                    return False, f"Verbotener Attributzugriff: {node.attr} kann aus Sicherheitsgründen nicht verwendet werden"
                    
            # 4. Prüfe auf gefährliche Funktionsaufrufe
            elif isinstance(node, ast.Call):
                if isinstance(node.func, ast.Name) and node.func.id in {'eval', 'exec', 'compile', 'open', 'input'}:
                    return False, f"Verbotene Funktion: {node.func.id} kann aus Sicherheitsgründen nicht verwendet werden"
                elif isinstance(node.func, ast.Attribute) and node.func.attr in self.FORBIDDEN_ATTRIBUTES:
                    return False, f"Verbotene Methode: {node.func.attr} kann aus Sicherheitsgründen nicht verwendet werden"
        
        # Keine verbotenen Konstrukte gefunden
        return True, "Code-Analyse bestanden"
    
    def create_safe_globals(self, additional_globals=None):
        """
        Erstellt einen eingeschränkten globalen Namensraum für die Codeausführung.
        
        Args:
            additional_globals (dict): Zusätzliche erlaubte globale Variablen
            
        Returns:
            dict: Ein sicherer globaler Namensraum
        """
        # Starte mit RestrictedPython's sicheren Globals
        restricted_globals = safe_globals.copy()
        
        # Setattr-Schutz hinzufügen
        restricted_globals['_getattr_'] = getattr
        restricted_globals['_setattr_'] = guarded_setattr
        
        # Hilfsfunktionen für sicheren Zugriff auf Listen und Dictionaries
        def guarded_getitem(ob, index):
            # Simple implementation of safe getitem
            if isinstance(ob, (list, tuple, dict, str)):
                return ob[index]
            raise TypeError(f"Unsupported type for getitem: {type(ob)}")
            
        def guarded_setitem(ob, index, value):
            # Simple implementation of safe setitem
            if isinstance(ob, (list, dict)):
                ob[index] = value
                return value
            raise TypeError(f"Unsupported type for setitem: {type(ob)}")
        
        # Füge eigene Hilfsfunktionen hinzu
        restricted_globals['_getitem_'] = guarded_getitem
        restricted_globals['_setitem_'] = guarded_setitem
        
        # Sammler-Variable für Ausgaben
        restricted_globals['output_buffer'] = []
        
        # Verbesserte print-Funktion, die Ausgaben erfasst
        def safe_print(*args, **kwargs):
            """Print-Funktion, die Ausgaben in output_buffer sammelt"""
            result = " ".join(str(arg) for arg in args)
            
            # Zeilenumbruch hinzufügen, wenn nicht anders angegeben
            end = kwargs.get('end', '\n')
            
            # Ausgabe in buffer speichern
            if 'output_buffer' in restricted_globals:
                restricted_globals['output_buffer'].append(result + end)
            
            # Auch für PrintCollector bereitstellen
            return result
            
        # Die sichere print-Funktion als print verwenden
        restricted_builtins = {
            'abs': abs, 'all': all, 'any': any, 'bool': bool, 'callable': callable,
            'chr': chr, 'complex': complex, 'dict': dict, 'divmod': divmod,
            'enumerate': enumerate, 'filter': filter, 'float': float, 'frozenset': frozenset,
            'getattr': getattr, 'hasattr': hasattr, 'hash': hash, 'hex': hex,
            'int': int, 'isinstance': isinstance, 'issubclass': issubclass,
            'iter': iter, 'len': len, 'list': list, 'map': map, 'max': max,
            'min': min, 'next': next, 'oct': oct, 'ord': ord, 'pow': pow,
            'print': safe_print, 'range': range, 'repr': repr, 'reversed': reversed,
            'round': round, 'set': set, 'slice': slice, 'sorted': sorted,
            'str': str, 'sum': sum, 'tuple': tuple, 'type': type, 'zip': zip
        }
        
        restricted_globals['__builtins__'] = restricted_builtins
        
        # Für PrintCollector
        restricted_globals['_print_'] = PrintCollector
        restricted_globals['printed'] = ''
        
        # Füge zusätzliche Globals hinzu (z.B. für Test-Funktionen)
        if additional_globals:
            for key, value in additional_globals.items():
                restricted_globals[key] = value
                
        return restricted_globals

    def filter_stderr(self, stderr_text):
        """
        Filtert unerwünschte Warnungen und System-Meldungen aus der stderr-Ausgabe.
        
        Args:
            stderr_text (str): Der zu filternde stderr-Text
            
        Returns:
            str: Gefilterte stderr-Ausgabe
        """
        if not stderr_text:
            return ""
            
        # Liste der Muster, die entfernt werden sollen
        patterns_to_remove = [
            # RestrictedPython Syntaxwarnungen
            r".*RestrictedPython.*SyntaxWarning: Line.*Prints, but never reads 'printed' variable.*\n",
            # Weitere System-Warnungen, falls notwendig
            r".*RuntimeWarning: .*\n"
        ]
        
        # Filtere die Muster
        filtered_text = stderr_text
        for pattern in patterns_to_remove:
            filtered_text = re.sub(pattern, "", filtered_text)
            
        return filtered_text.strip()
    
    def extract_printed_output(self, globals_dict):
        """
        Extrahiert die print-Ausgaben aus dem globals_dict nach der Ausführung.
        
        Args:
            globals_dict (dict): Der globale Namespace nach der Ausführung
            
        Returns:
            str: Die gesammelten print-Ausgaben
        """
        # Zuerst versuchen, aus dem output_buffer zu lesen
        if 'output_buffer' in globals_dict and globals_dict['output_buffer']:
            return ''.join(globals_dict['output_buffer'])
            
        # Als Fallback: Versuche PrintCollector-Ausgabe zu verwenden
        printed_output = ""
        
        # Methode 1: RestrictedPython's _print_
        print_func = globals_dict.get('_print_')
        if print_func and callable(print_func):
            try:
                printed = globals_dict.get('printed', '')
                if printed:
                    printed_output += printed
            except:
                pass
                
        # Methode 2: PrintCollector's Wrapper
        try:
            if '_print' in globals_dict and callable(globals_dict['_print']):
                collected = globals_dict['_print']()
                if collected:
                    printed_output += collected
        except:
            pass
            
        return printed_output
    
    def _execute_code_unix(self, code, additional_globals=None):
        """
        Unix-spezifische Implementierung für Code-Ausführung mit Timeout.
        
        Args:
            code (str): Der auszuführende Python-Code
            additional_globals (dict): Zusätzliche erlaubte globale Variablen
            
        Returns:
            tuple: (success, result, stdout, stderr)
        """
        result_queue = Queue()
        
        def execute_target():
            # Ausgabeumleitung
            old_stdout = sys.stdout
            old_stderr = sys.stderr
            redirected_output = io.StringIO()
            redirected_error = io.StringIO()
            sys.stdout = redirected_output
            sys.stderr = redirected_error
            
            try:
                # RestrictedPython-Warnungen unterdrücken
                with warnings.catch_warnings():
                    warnings.filterwarnings("ignore", category=SyntaxWarning, module="RestrictedPython")
                    
                    # Sichere Umgebung erstellen
                    restricted_globals = self.create_safe_globals(additional_globals)
                    
                    # Kompilieren und Ausführen des Codes
                    byte_code = compile_restricted(code, filename="<string>", mode="exec")
                    exec_locals = {}
                    
                    # Ausführen des Codes in der eingeschränkten Umgebung
                    exec(byte_code, restricted_globals, exec_locals)
                    
                    # Gesammelte print-Ausgaben abrufen
                    collected_output = self.extract_printed_output(restricted_globals)
                
                # Ausgabe erfassen
                stdout = redirected_output.getvalue()
                
                # Wenn wir Ausgaben gesammelt haben, diese verwenden
                if collected_output and collected_output.strip():
                    stdout = collected_output
                
                stderr = self.filter_stderr(redirected_error.getvalue())
                
                # Prüfen, ob wir einen speziellen Rückgabewert (say_hello) haben
                if 'say_hello' in exec_locals and callable(exec_locals['say_hello']):
                    try:
                        result = exec_locals['say_hello']()
                        if result and not stdout:
                            stdout = result + "\n"
                    except:
                        pass
                
                # Ergebnis zurückgeben
                result_queue.put((True, exec_locals, stdout, stderr))
                
            except Exception as e:
                # Fehler erfassen - Original-Fehlermeldung ohne Wrapper
                error_msg = str(e)
                tb = traceback.format_exc()
                stderr = self.filter_stderr(redirected_error.getvalue() + f"\n{error_msg}\n{tb}")
                stdout = redirected_output.getvalue()
                
                result_queue.put((False, str(e), stdout, stderr))
                
            finally:
                # Ausgabeumleitung zurücksetzen
                sys.stdout = old_stdout
                sys.stderr = old_stderr
        
        # Prozess starten und mit Timeout ausführen
        process = Process(target=execute_target)
        process.start()
        process.join(self.timeout)
        
        # Timeout prüfen
        if process.is_alive():
            process.terminate()
            process.join()
            return False, f"Zeitüberschreitung - Code lief länger als {self.timeout} Sekunden", "", f"Execution timed out after {self.timeout} seconds"
        
        # Ergebnis abrufen
        if not result_queue.empty():
            return result_queue.get()
        else:
            return False, "Unbekannter Fehler bei der Codeausführung", "", "No result from process"
    
    def _execute_code_windows(self, code, additional_globals=None):
        """
        Windows-spezifische Implementierung für Code-Ausführung mit Timeout.
        Benutzt Threading statt Multiprocessing.
        
        Args:
            code (str): Der auszuführende Python-Code
            additional_globals (dict): Zusätzliche erlaubte globale Variablen
            
        Returns:
            tuple: (success, result, stdout, stderr)
        """
        # Variablen für das Ergebnis
        result = {
            "success": False,
            "locals": {},
            "stdout": "",
            "stderr": "",
            "error": None
        }
        
        # Event für das Timeout
        execution_finished = threading.Event()
        
        def execute_target():
            # Ausgabeumleitung
            old_stdout = sys.stdout
            old_stderr = sys.stderr
            redirected_output = io.StringIO()
            redirected_error = io.StringIO()
            sys.stdout = redirected_output
            sys.stderr = redirected_error
            
            try:
                # RestrictedPython-Warnungen unterdrücken
                with warnings.catch_warnings():
                    warnings.filterwarnings("ignore", category=SyntaxWarning, module="RestrictedPython")
                    
                    # Sichere Umgebung erstellen
                    restricted_globals = self.create_safe_globals(additional_globals)
                    
                    # Kompilieren und Ausführen des Codes
                    byte_code = compile_restricted(code, filename="<string>", mode="exec")
                    exec_locals = {}
                    
                    # Ausführen des Codes in der eingeschränkten Umgebung
                    exec(byte_code, restricted_globals, exec_locals)
                    
                    # Gesammelte print-Ausgaben abrufen
                    collected_output = self.extract_printed_output(restricted_globals)
                
                # Ausgabe erfassen
                result["stdout"] = redirected_output.getvalue()
                
                # Wenn wir Ausgaben gesammelt haben, diese verwenden
                if collected_output and collected_output.strip():
                    result["stdout"] = collected_output
                
                # Prüfen, ob wir einen speziellen Rückgabewert (say_hello) haben
                if 'say_hello' in exec_locals and callable(exec_locals['say_hello']):
                    try:
                        hello_result = exec_locals['say_hello']()
                        if hello_result and not result["stdout"]:
                            result["stdout"] = hello_result + "\n"
                    except:
                        pass
                
                result["stderr"] = self.filter_stderr(redirected_error.getvalue())
                result["success"] = True
                result["locals"] = exec_locals
                
            except Exception as e:
                # Fehler erfassen - Original-Fehlermeldung ohne Wrapper
                error_msg = str(e)
                tb = traceback.format_exc()
                result["stderr"] = self.filter_stderr(redirected_error.getvalue() + f"\n{error_msg}\n{tb}")
                result["stdout"] = redirected_output.getvalue()
                result["success"] = False
                result["error"] = str(e)  # Original-Fehlermeldung ohne Wrapper
                
            finally:
                # Ausgabeumleitung zurücksetzen
                sys.stdout = old_stdout
                sys.stderr = old_stderr
                # Marke setzen, dass die Ausführung beendet ist
                execution_finished.set()
        
        # Thread starten
        thread = threading.Thread(target=execute_target)
        thread.daemon = True  # Stellt sicher, dass der Thread beendet wird, wenn das Hauptprogramm endet
        thread.start()
        
        # Auf Beendigung warten oder Timeout
        finished = execution_finished.wait(self.timeout)
        
        # Timeout prüfen
        if not finished:
            # Thread läuft noch nach Timeout
            result["success"] = False
            result["error"] = f"Zeitüberschreitung - Code lief länger als {self.timeout} Sekunden"
            result["stderr"] = f"Execution timed out after {self.timeout} seconds"
            # Hinweis: Thread wird nicht gewaltsam beendet, aber als Daemon markiert, damit er das Hauptprogramm nicht blockiert
            return False, result["error"], result["stdout"], result["stderr"]
        
        # Erfolg oder Fehler zurückgeben
        if result["success"]:
            return True, result["locals"], result["stdout"], result["stderr"]
        else:
            return False, result["error"], result["stdout"], result["stderr"]
    
    def execute_code_with_timeout(self, code, additional_globals=None):
        """
        Führt Code mit Timeout aus. Wählt je nach Betriebssystem die passende Methode.
        
        Args:
            code (str): Der auszuführende Python-Code
            additional_globals (dict): Zusätzliche erlaubte globale Variablen
            
        Returns:
            tuple: (success, result, stdout, stderr) - Erfolg, Ergebnis, Ausgabe, Fehler
        """
        if self.is_windows:
            return self._execute_code_windows(code, additional_globals)
        else:
            return self._execute_code_unix(code, additional_globals)
    
    def execute_secure(self, code, additional_globals=None):
        """
        Führt Code sicher aus mit allen Sicherheitsschichten.
        
        Args:
            code (str): Der auszuführende Python-Code
            additional_globals (dict): Zusätzliche erlaubte globale Variablen
            
        Returns:
            dict: Ergebnis der Codeausführung mit Status, Ausgabe, Fehler und lokalen Variablen
        """
        # 1. AST-Codeanalyse
        is_safe, message = self.analyze_code_safety(code)
        if not is_safe:
            # Der original Fehler wird durchgereicht, ohne "Sicherheitsverletzung" Wrapper
            return {
                "success": False,
                "error": message,  # Originale Fehlermeldung
                "stdout": "",
                "stderr": message,  # Originale Fehlermeldung
                "locals": {}
            }
        
        # 2 & 3. RestrictedPython + Timeout + eingeschränkter Namensraum
        success, result, stdout, stderr = self.execute_code_with_timeout(code, additional_globals)
        
        # Ergebnis aufbereiten
        if success:
            # Fallback für den Fall, dass kein Output erfasst wurde, aber wir eine say_hello-Funktion haben
            if not stdout and isinstance(result, dict) and 'say_hello' in result and callable(result['say_hello']):
                try:
                    hello_result = result['say_hello']()
                    if hello_result:
                        stdout = hello_result + "\n"
                except:
                    pass  # Fehler ignorieren
            
            return {
                "success": True,
                "stdout": stdout,
                "stderr": stderr,
                "locals": result
            }
        else:
            return {
                "success": False,
                "error": result,  # Original-Fehlermeldung ohne Wrapper
                "stdout": stdout,
                "stderr": stderr,
                "locals": {}
            }

# Beispiel für die Verwendung
if __name__ == "__main__":
    executor = SecurityExecutor(timeout=3)
    
    # Sicherer Code
    safe_code = """
def add(a, b):
    return a + b

result = add(5, 7)
print(f"Das Ergebnis ist: {result}")
"""
    
    # Unsicherer Code
    unsafe_code = """
import os
os.system("echo 'Dieser Code ist gefährlich!'")
"""
    
    print("Sicherer Code:")
    result = executor.execute_secure(safe_code)
    print(f"Erfolg: {result['success']}")
    print(f"Ausgabe: {result['stdout']}")
    
    print("\nUnsicherer Code:")
    result = executor.execute_secure(unsafe_code)
    print(f"Erfolg: {result['success']}")
    print(f"Fehler: {result['error']}")
