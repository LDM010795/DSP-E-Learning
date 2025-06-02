import unittest
import sys

# Testet die Funktion safe_divide(a, b)

class SafeDivideTest(unittest.TestCase):

    def test_function_exists(self):
        """Prüft, ob die Funktion 'safe_divide' definiert wurde."""
        self.assertTrue(
            callable(globals().get('safe_divide')) or
            callable(locals().get('safe_divide')) or
            callable(getattr(sys.modules.get('__main__'), 'safe_divide', None)),
            "Die Funktion 'safe_divide' wurde nicht definiert oder ist nicht aufrufbar."
        )

    def _get_func(self):
        func = globals().get('safe_divide') or locals().get('safe_divide') or getattr(sys.modules.get('__main__'), 'safe_divide')
        if not callable(func):
            self.fail("Funktion 'safe_divide' nicht gefunden oder nicht aufrufbar.")
        return func

    def test_valid_division(self):
        """Testet eine normale Division."""
        safe_divide = self._get_func()
        self.assertEqual(safe_divide(10, 2), 5.0)
        self.assertEqual(safe_divide(9, 3), 3.0)
        self.assertEqual(safe_divide(7, 2), 3.5)
        self.assertEqual(safe_divide(-10, 2), -5.0)
        self.assertEqual(safe_divide(0, 5), 0.0)

    def test_division_by_zero(self):
        """Testet die Division durch Null (sollte None zurückgeben)."""
        safe_divide = self._get_func()
        self.assertIsNone(safe_divide(10, 0), "Division durch Null sollte None zurückgeben.")
        self.assertIsNone(safe_divide(0, 0), "Division 0 durch 0 sollte None zurückgeben.")
        self.assertIsNone(safe_divide(-5, 0), "Division durch Null sollte None zurückgeben.")

    def test_non_numeric_input(self):
        """Testet mit nicht-numerischen Eingaben (sollte TypeError auslösen)."""
        safe_divide = self._get_func()
        with self.assertRaises(TypeError, msg="Division mit nicht-numerischen Typen sollte TypeError auslösen."):
            safe_divide(10, "a")
        with self.assertRaises(TypeError, msg="Division mit nicht-numerischen Typen sollte TypeError auslösen."):
            safe_divide("b", 2)

if __name__ == '__main__':
    # Dummy implementation
    # def safe_divide(a, b):
    #     try:
    #         return a / b
    #     except ZeroDivisionError:
    #         return None
    #     # TypeError wird standardmäßig ausgelöst, falls nicht abgefangen
    unittest.main() 