import unittest
import sys

# Testet die Funktion max_of_three(a, b, c)

class MaxOfThreeTest(unittest.TestCase):

    def test_function_exists(self):
        """Prüft, ob die Funktion 'max_of_three' definiert wurde."""
        self.assertTrue(
            callable(globals().get('max_of_three')) or
            callable(locals().get('max_of_three')) or
            callable(getattr(sys.modules.get('__main__'), 'max_of_three', None)),
            "Die Funktion 'max_of_three' wurde nicht definiert oder ist nicht aufrufbar."
        )

    def _get_func(self):
        func = globals().get('max_of_three') or locals().get('max_of_three') or getattr(sys.modules.get('__main__'), 'max_of_three')
        if not callable(func):
            self.fail("Funktion 'max_of_three' nicht gefunden oder nicht aufrufbar.")
        return func

    def test_first_is_max(self):
        """Testet, wenn die erste Zahl die größte ist."""
        max_of_three = self._get_func()
        self.assertEqual(max_of_three(5, 3, 1), 5, "max_of_three(5, 3, 1) sollte 5 sein")

    def test_second_is_max(self):
        """Testet, wenn die zweite Zahl die größte ist."""
        max_of_three = self._get_func()
        self.assertEqual(max_of_three(3, 5, 1), 5, "max_of_three(3, 5, 1) sollte 5 sein")

    def test_third_is_max(self):
        """Testet, wenn die dritte Zahl die größte ist."""
        max_of_three = self._get_func()
        self.assertEqual(max_of_three(1, 3, 5), 5, "max_of_three(1, 3, 5) sollte 5 sein")

    def test_equal_numbers(self):
        """Testet, wenn alle Zahlen gleich sind."""
        max_of_three = self._get_func()
        self.assertEqual(max_of_three(7, 7, 7), 7, "max_of_three(7, 7, 7) sollte 7 sein")

    def test_negative_numbers(self):
        """Testet mit negativen Zahlen."""
        max_of_three = self._get_func()
        self.assertEqual(max_of_three(-5, -1, -3), -1, "max_of_three(-5, -1, -3) sollte -1 sein")

    def test_mixed_numbers(self):
        """Testet mit gemischten positiven und negativen Zahlen."""
        max_of_three = self._get_func()
        self.assertEqual(max_of_three(-5, 0, 5), 5, "max_of_three(-5, 0, 5) sollte 5 sein")

if __name__ == '__main__':
    # def max_of_three(a, b, c): return max(a, b, c) # Dummy
    unittest.main() 