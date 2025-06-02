import unittest
import sys

# Testet die Funktion get_squared_numbers(numbers)

class ListComprehensionTest(unittest.TestCase):

    def test_function_exists(self):
        """Prüft, ob die Funktion 'get_squared_numbers' definiert wurde."""
        self.assertTrue(
            callable(globals().get('get_squared_numbers')) or
            callable(locals().get('get_squared_numbers')) or
            callable(getattr(sys.modules.get('__main__'), 'get_squared_numbers', None)),
            "Die Funktion 'get_squared_numbers' wurde nicht definiert oder ist nicht aufrufbar."
        )

    def test_list_with_positive_numbers(self):
        """Testet mit einer Liste positiver Zahlen."""
        get_squared_numbers = globals().get('get_squared_numbers') or locals().get('get_squared_numbers') or getattr(sys.modules.get('__main__'), 'get_squared_numbers')
        if not callable(get_squared_numbers):
            self.fail("Funktion 'get_squared_numbers' nicht gefunden oder nicht aufrufbar.")
        numbers = [1, 2, 3, 4, 5]
        expected = [1, 4, 9, 16, 25]
        self.assertListEqual(get_squared_numbers(numbers), expected, f"Quadrate von {numbers} sollten {expected} sein")

    def test_list_with_mixed_numbers(self):
        """Testet mit einer Liste von positiven, negativen Zahlen und Null."""
        get_squared_numbers = globals().get('get_squared_numbers') or locals().get('get_squared_numbers') or getattr(sys.modules.get('__main__'), 'get_squared_numbers')
        if not callable(get_squared_numbers):
            self.fail("Funktion 'get_squared_numbers' nicht gefunden oder nicht aufrufbar.")
        numbers = [-2, -1, 0, 1, 2]
        expected = [4, 1, 0, 1, 4]
        self.assertListEqual(get_squared_numbers(numbers), expected, f"Quadrate von {numbers} sollten {expected} sein")

    def test_empty_list(self):
        """Testet mit einer leeren Liste."""
        get_squared_numbers = globals().get('get_squared_numbers') or locals().get('get_squared_numbers') or getattr(sys.modules.get('__main__'), 'get_squared_numbers')
        if not callable(get_squared_numbers):
            self.fail("Funktion 'get_squared_numbers' nicht gefunden oder nicht aufrufbar.")
        numbers = []
        expected = []
        self.assertListEqual(get_squared_numbers(numbers), expected, "Quadrate von [] sollten [] sein")

if __name__ == '__main__':
    # def get_squared_numbers(numbers): return [x*x for x in numbers] # Dummy
    unittest.main() 