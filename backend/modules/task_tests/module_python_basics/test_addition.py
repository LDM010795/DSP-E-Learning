import unittest
import sys

# Testet die Funktion add_two_numbers(a, b)

class AdditionTest(unittest.TestCase):

    def test_function_exists(self):
        """Prüft, ob die Funktion 'add_two_numbers' definiert wurde."""
        self.assertTrue(
            callable(globals().get('add_two_numbers')) or
            callable(locals().get('add_two_numbers')) or
            callable(getattr(sys.modules.get('__main__'), 'add_two_numbers', None)),
            "Die Funktion 'add_two_numbers' wurde nicht definiert oder ist nicht aufrufbar."
        )

    def test_positive_numbers(self):
        """Testet die Addition von positiven Zahlen."""
        add_two_numbers = globals().get('add_two_numbers') or locals().get('add_two_numbers') or getattr(sys.modules.get('__main__'), 'add_two_numbers')
        if not callable(add_two_numbers):
            self.fail("Funktion 'add_two_numbers' nicht gefunden oder nicht aufrufbar.")
        self.assertEqual(add_two_numbers(5, 3), 8, "5 + 3 sollte 8 ergeben")
        self.assertEqual(add_two_numbers(10, 20), 30, "10 + 20 sollte 30 ergeben")

    def test_negative_numbers(self):
        """Testet die Addition von negativen Zahlen."""
        add_two_numbers = globals().get('add_two_numbers') or locals().get('add_two_numbers') or getattr(sys.modules.get('__main__'), 'add_two_numbers')
        if not callable(add_two_numbers):
            self.fail("Funktion 'add_two_numbers' nicht gefunden oder nicht aufrufbar.")
        self.assertEqual(add_two_numbers(-5, -3), -8, "-5 + (-3) sollte -8 ergeben")
        self.assertEqual(add_two_numbers(-10, 5), -5, "-10 + 5 sollte -5 ergeben")

    def test_zero(self):
        """Testet die Addition mit Null."""
        add_two_numbers = globals().get('add_two_numbers') or locals().get('add_two_numbers') or getattr(sys.modules.get('__main__'), 'add_two_numbers')
        if not callable(add_two_numbers):
            self.fail("Funktion 'add_two_numbers' nicht gefunden oder nicht aufrufbar.")
        self.assertEqual(add_two_numbers(0, 0), 0, "0 + 0 sollte 0 ergeben")
        self.assertEqual(add_two_numbers(7, 0), 7, "7 + 0 sollte 7 ergeben")
        self.assertEqual(add_two_numbers(0, -4), -4, "0 + (-4) sollte -4 ergeben")

if __name__ == '__main__':
    # def add_two_numbers(a, b): return a + b # Dummy für direkten Test
    unittest.main() 