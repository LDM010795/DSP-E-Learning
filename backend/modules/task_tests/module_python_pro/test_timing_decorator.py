import unittest
import sys
import time
import io
import contextlib
from functools import wraps

# Testet den Decorator @time_it

class TimingDecoratorTest(unittest.TestCase):

    def test_decorator_exists(self):
        """Prüft, ob der Decorator 'time_it' definiert wurde."""
        self.assertTrue(
            callable(globals().get('time_it')) or
            callable(locals().get('time_it')) or
            callable(getattr(sys.modules.get('__main__'), 'time_it', None)),
            "Der Decorator 'time_it' wurde nicht definiert oder ist nicht aufrufbar."
        )

    def _get_decorator(self):
        decorator = globals().get('time_it') or locals().get('time_it') or getattr(sys.modules.get('__main__'), 'time_it', None)
        if not callable(decorator):
            self.fail("Decorator 'time_it' nicht gefunden oder nicht aufrufbar.")
        return decorator

    def test_decorated_function_works(self):
        """Testet, ob eine dekorierte Funktion noch korrekt funktioniert."""
        time_it = self._get_decorator()

        @time_it
        def slow_function(duration):
            time.sleep(duration)
            return f"Slept for {duration}s"

        result = slow_function(0.01) # Kurze Dauer für den Test
        self.assertEqual(result, "Slept for 0.01s", "Das Ergebnis der dekorierten Funktion ist nicht korrekt.")

    def test_timing_output(self):
        """Testet, ob der Decorator eine Zeitmessungs-Ausgabe erzeugt."""
        time_it = self._get_decorator()

        @time_it
        def another_slow_function():
            time.sleep(0.02)
            return "Done"

        fake_stdout = io.StringIO()
        with contextlib.redirect_stdout(fake_stdout):
            result = another_slow_function()
        
        output = fake_stdout.getvalue().strip()
        self.assertEqual(result, "Done", "Das Ergebnis der dekorierten Funktion ist nicht korrekt.")
        
        # Prüfe, ob die Ausgabe typische Timing-Informationen enthält
        self.assertIn("another_slow_function", output, "Ausgabe sollte Funktionsnamen enthalten.")
        self.assertIn("executed in", output.lower(), "Ausgabe sollte 'executed in' enthalten (Groß/Klein egal)." )
        self.assertRegex(output, r"\d+\.\d+s", "Ausgabe sollte eine Zeitangabe in Sekunden enthalten (z.B. 0.02s)." )
        self.assertTrue(len(output) > 0, "Der Decorator sollte eine Ausgabe erzeugt haben.")


if __name__ == '__main__':
    # Dummy implementation
    # def time_it(func):
    #     @wraps(func)
    #     def wrapper(*args, **kwargs):
    #         start_time = time.perf_counter()
    #         result = func(*args, **kwargs)
    #         end_time = time.perf_counter()
    #         run_time = end_time - start_time
    #         print(f"{func.__name__!r} executed in {run_time:.4f}s")
    #         return result
    #     return wrapper
    # 
    # @time_it
    # def example_func(delay): time.sleep(delay)
    # example_func(0.1)

    unittest.main() 