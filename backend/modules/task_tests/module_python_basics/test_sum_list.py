import unittest
import sys

# Testet die Funktion sum_list(numbers)

class SumListTest(unittest.TestCase):

    def test_function_exists(self):
        """Prüft, ob die Funktion 'sum_list' definiert wurde."""
        self.assertTrue(
            callable(globals().get('sum_list')) or
            callable(locals().get('sum_list')) or
            callable(getattr(sys.modules.get('__main__'), 'sum_list', None)),
            "Die Funktion 'sum_list' wurde nicht definiert oder ist nicht aufrufbar."
        )

    def test_positive_numbers(self):
        """Testet mit einer Liste positiver Zahlen."""
        sum_list = globals().get('sum_list') or locals().get('sum_list') or getattr(sys.modules.get('__main__'), 'sum_list')
        if not callable(sum_list):
            self.fail("Funktion 'sum_list' nicht gefunden oder nicht aufrufbar.")
        numbers = [1, 2, 3, 4, 5]
        expected = 15
        self.assertEqual(sum_list(numbers), expected, f"Summe von {numbers} sollte {expected} sein")

    def test_mixed_numbers(self):
        """Testet mit positiven, negativen Zahlen und Null."""
        sum_list = globals().get('sum_list') or locals().get('sum_list') or getattr(sys.modules.get('__main__'), 'sum_list')
        if not callable(sum_list):
            self.fail("Funktion 'sum_list' nicht gefunden oder nicht aufrufbar.")
        numbers = [-1, 0, 1, -2, 2]
        expected = 0
        self.assertEqual(sum_list(numbers), expected, f"Summe von {numbers} sollte {expected} sein")

    def test_empty_list(self):
        """Testet mit einer leeren Liste."""
        sum_list = globals().get('sum_list') or locals().get('sum_list') or getattr(sys.modules.get('__main__'), 'sum_list')
        if not callable(sum_list):
            self.fail("Funktion 'sum_list' nicht gefunden oder nicht aufrufbar.")
        numbers = []
        expected = 0
        self.assertEqual(sum_list(numbers), expected, "Summe von [] sollte 0 sein")

    def test_single_element_list(self):
        """Testet mit einer Liste, die nur ein Element enthält."""
        sum_list = globals().get('sum_list') or locals().get('sum_list') or getattr(sys.modules.get('__main__'), 'sum_list')
        if not callable(sum_list):
            self.fail("Funktion 'sum_list' nicht gefunden oder nicht aufrufbar.")
        numbers = [42]
        expected = 42
        self.assertEqual(sum_list(numbers), expected, f"Summe von {numbers} sollte {expected} sein")

if __name__ == '__main__':
    # def sum_list(numbers): return sum(numbers) # Dummy
    unittest.main() 