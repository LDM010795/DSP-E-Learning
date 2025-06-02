import unittest
import sys
import io
from functools import wraps

# Testet den Decorator @log_calls

# Wir müssen den Decorator hier definieren, um ihn testen zu können,
# da der User-Code ihn bereitstellen soll.
# Der Test prüft dann, ob der vom User bereitgestellte Decorator existiert
# und sich ähnlich verhält (bzgl. der dekorierten Funktion).

# Referenzimplementierung für den Test (nicht für die Lösung des Users)
def log_calls_reference(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        # Dies ist nur ein Platzhalter, die tatsächliche Logik wird
        # in der Lösung des Benutzers erwartet.
        # Der Test unten prüft hauptsächlich, ob der Decorator existiert
        # und die dekorierte Funktion noch funktioniert.
        # Ein vollständiger Test würde sys.stdout mocken und die Ausgabe prüfen.
        # print(f"Calling {func.__name__} with args={args}, kwargs={kwargs}")
        result = func(*args, **kwargs)
        # print(f"{func.__name__} returned {result}")
        return result
    return wrapper

class LoggingDecoratorTest(unittest.TestCase):

    def test_decorator_exists(self):
        """Prüft, ob der Decorator 'log_calls' definiert wurde."""
        self.assertTrue(
            callable(globals().get('log_calls')) or
            callable(locals().get('log_calls')) or
            callable(getattr(sys.modules.get('__main__'), 'log_calls', None)),
            "Der Decorator 'log_calls' wurde nicht definiert oder ist nicht aufrufbar."
        )

    def test_decorated_function_works(self):
        """Testet, ob eine dekorierte Funktion noch korrekt funktioniert."""
        log_calls = globals().get('log_calls') or locals().get('log_calls') or getattr(sys.modules.get('__main__'), 'log_calls', None)
        if not callable(log_calls):
            self.fail("Decorator 'log_calls' nicht gefunden oder nicht aufrufbar.")

        # Dummy-Funktion, die dekoriert wird
        @log_calls
        def sample_add(x, y):
            return x + y

        # Prüfen, ob das Ergebnis korrekt ist
        self.assertEqual(sample_add(10, 5), 15, "Dekorierte Funktion sample_add(10, 5) sollte 15 zurückgeben")
        self.assertEqual(sample_add(a=7, b=3), 10, "Dekorierte Funktion sample_add(a=7, b=3) sollte 10 zurückgeben (kwargs test)")

    def test_logging_output(self):
        """Testet, ob der Decorator Ausgaben nach sys.stdout schreibt (rudimentär)."""
        log_calls = globals().get('log_calls') or locals().get('log_calls') or getattr(sys.modules.get('__main__'), 'log_calls', None)
        if not callable(log_calls):
            self.fail("Decorator 'log_calls' nicht gefunden oder nicht aufrufbar.")

        @log_calls
        def simple_func(arg):
            return f"Processed: {arg}"

        # Fange stdout ab
        old_stdout = sys.stdout
        redirected_output = io.StringIO()
        sys.stdout = redirected_output

        try:
            result = simple_func("test")
        finally:
            sys.stdout = old_stdout # stdout wiederherstellen

        output = redirected_output.getvalue()

        # Einfache Prüfung: Enthält die Ausgabe den Funktionsnamen und das Ergebnis?
        # Dies ist KEIN vollständiger Test der Log-Nachrichten!
        self.assertIn("simple_func", output, "Die Ausgabe sollte den Funktionsnamen enthalten.")
        # self.assertIn("test", output, "Die Ausgabe sollte das Argument enthalten.") # Optional, genauer Test
        # self.assertIn("Processed: test", output, "Die Ausgabe sollte das Ergebnis enthalten.") # Optional, genauer Test
        self.assertTrue(len(output) > 0, "Der Decorator sollte Log-Ausgaben erzeugt haben.")
        self.assertEqual(result, "Processed: test", "Das Ergebnis der dekorierten Funktion sollte korrekt sein.")

if __name__ == '__main__':
    # Definiere einen Dummy-Decorator und eine Funktion für den direkten Test
    # def log_calls(func):
    #     @wraps(func)
    #     def wrapper(*args, **kwargs):
    #         print(f"Dummy log for {func.__name__}")
    #         return func(*args, **kwargs)
    #     return wrapper
    # @log_calls
    # def direct_test_func(x): return x * 2

    unittest.main() 