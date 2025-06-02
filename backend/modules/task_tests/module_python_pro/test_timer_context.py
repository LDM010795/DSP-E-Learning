import unittest
import sys
import time
import io
import contextlib

# Testet den Context Manager TimerContext

class TimerContextTest(unittest.TestCase):

    def test_class_exists(self):
        """Prüft, ob die Klasse 'TimerContext' definiert wurde."""
        self.assertTrue(
            isinstance(globals().get('TimerContext'), type) or
            isinstance(locals().get('TimerContext'), type) or
            (hasattr(sys.modules.get('__main__'), 'TimerContext') and isinstance(getattr(sys.modules.get('__main__'), 'TimerContext'), type)),
            "Die Klasse 'TimerContext' wurde nicht definiert."
        )

    def _get_class(self):
        ContextClass = globals().get('TimerContext') or locals().get('TimerContext') or getattr(sys.modules.get('__main__'), 'TimerContext')
        if not isinstance(ContextClass, type):
            self.fail("Klasse 'TimerContext' nicht gefunden oder ist kein Typ.")
        return ContextClass

    def test_context_manager_protocol(self):
        """Testet, ob die Klasse das Context-Manager-Protokoll implementiert."""
        TimerContext = self._get_class()
        try:
            instance = TimerContext()
            self.assertTrue(hasattr(instance, '__enter__') and callable(instance.__enter__),
                            "Context Manager muss __enter__ implementieren.")
            self.assertTrue(hasattr(instance, '__exit__') and callable(instance.__exit__),
                            "Context Manager muss __exit__ implementieren.")
        except Exception as e:
            self.fail(f"Fehler beim Prüfen des Context Manager Protokolls: {e}")

    def test_timing_output_on_exit(self):
        """Testet, ob beim Verlassen des Kontexts eine Zeit ausgegeben wird."""
        TimerContext = self._get_class()
        sleep_duration = 0.02
        
        fake_stdout = io.StringIO()
        start_time = time.perf_counter()
        try:
            with contextlib.redirect_stdout(fake_stdout):
                with TimerContext():
                    time.sleep(sleep_duration)
            end_time = time.perf_counter()
        except Exception as e:
             self.fail(f"Ausführung des Context Managers schlug fehl: {e}")

        output = fake_stdout.getvalue().strip()
        elapsed_manual = end_time - start_time
        
        self.assertTrue(len(output) > 0, "Context Manager sollte eine Ausgabe erzeugt haben.")
        # Prüfe auf plausible Zeitangabe
        self.assertIn("elapsed", output.lower(), "Ausgabe sollte 'elapsed' enthalten.")
        # Extrahiere die Zahl aus der Ausgabe (vereinfacht)
        try:
             time_in_output = float(output.split()[-1].replace('s',''))
             # Erlaube kleine Abweichung
             self.assertAlmostEqual(time_in_output, elapsed_manual, delta=0.01,
                                    msg=f"Ausgegebene Zeit ({time_in_output:.4f}s) weicht stark von gemessener Zeit ({elapsed_manual:.4f}s) ab.")
        except (ValueError, IndexError):
             self.fail(f"Konnte keine plausible Zeitangabe aus der Ausgabe extrahieren: '{output}'")


if __name__ == '__main__':
    # Dummy implementation
    # import time
    # class TimerContext:
    #     def __enter__(self):
    #         self.start_time = time.perf_counter()
    #         return self # optional, kann auch None zurückgeben
    # 
    #     def __exit__(self, exc_type, exc_val, exc_tb):
    #         end_time = time.perf_counter()
    #         elapsed_time = end_time - self.start_time
    #         print(f"Block executed in {elapsed_time:.4f}s elapsed")
    #         # return False # Exceptions nicht unterdrücken
    # 
    # with TimerContext():
    #      time.sleep(0.1)

    unittest.main() 