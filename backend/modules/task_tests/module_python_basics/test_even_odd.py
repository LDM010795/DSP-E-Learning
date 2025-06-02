import unittest
import sys

# Testet die Funktion is_even(number)

class EvenOddTest(unittest.TestCase):

    def test_function_exists(self):
        """Prüft, ob die Funktion 'is_even' definiert wurde."""
        self.assertTrue(
            callable(globals().get('is_even')) or
            callable(locals().get('is_even')) or
            callable(getattr(sys.modules.get('__main__'), 'is_even', None)),
            "Die Funktion 'is_even' wurde nicht definiert oder ist nicht aufrufbar."
        )

    def test_even_numbers(self):
        """Testet mit geraden Zahlen."""
        is_even = globals().get('is_even') or locals().get('is_even') or getattr(sys.modules.get('__main__'), 'is_even')
        if not callable(is_even):
            self.fail("Funktion 'is_even' nicht gefunden oder nicht aufrufbar.")
        self.assertTrue(is_even(2), "2 sollte als gerade erkannt werden")
        self.assertTrue(is_even(0), "0 sollte als gerade erkannt werden")
        self.assertTrue(is_even(-4), "-4 sollte als gerade erkannt werden")
        self.assertTrue(is_even(100), "100 sollte als gerade erkannt werden")

    def test_odd_numbers(self):
        """Testet mit ungeraden Zahlen."""
        is_even = globals().get('is_even') or locals().get('is_even') or getattr(sys.modules.get('__main__'), 'is_even')
        if not callable(is_even):
            self.fail("Funktion 'is_even' nicht gefunden oder nicht aufrufbar.")
        self.assertFalse(is_even(1), "1 sollte als ungerade erkannt werden")
        self.assertFalse(is_even(3), "3 sollte als ungerade erkannt werden")
        self.assertFalse(is_even(-5), "-5 sollte als ungerade erkannt werden")
        self.assertFalse(is_even(99), "99 sollte als ungerade erkannt werden")

if __name__ == '__main__':
    # def is_even(n): return n % 2 == 0 # Dummy
    unittest.main() 