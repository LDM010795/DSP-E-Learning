import unittest
import sys

# Testet die Funktion filter_positive(numbers)

class LambdaFilterTest(unittest.TestCase):

    def test_function_exists(self):
        """Prüft, ob die Funktion 'filter_positive' definiert wurde."""
        self.assertTrue(
            callable(globals().get('filter_positive')) or
            callable(locals().get('filter_positive')) or
            callable(getattr(sys.modules.get('__main__'), 'filter_positive', None)),
            "Die Funktion 'filter_positive' wurde nicht definiert oder ist nicht aufrufbar."
        )

    def _get_func(self):
        func = globals().get('filter_positive') or locals().get('filter_positive') or getattr(sys.modules.get('__main__'), 'filter_positive')
        if not callable(func):
            self.fail("Funktion 'filter_positive' nicht gefunden oder nicht aufrufbar.")
        return func

    def test_filter_mixed_list(self):
        """Testet mit einer Liste von positiven, negativen Zahlen und Null."""
        filter_positive = self._get_func()
        numbers = [-2, -1, 0, 1, 2, 3]
        expected = [1, 2, 3]
        result = filter_positive(numbers)
        self.assertIsInstance(result, list, "Das Ergebnis sollte eine Liste sein.")
        self.assertListEqual(result, expected, 
                             f"Positive Zahlen von {numbers} sollten {expected} sein, erhielt {result}")

    def test_filter_all_positive(self):
        """Testet mit einer Liste, die nur positive Zahlen enthält."""
        filter_positive = self._get_func()
        numbers = [10, 20, 5]
        expected = [10, 20, 5]
        result = filter_positive(numbers)
        self.assertIsInstance(result, list, "Das Ergebnis sollte eine Liste sein.")
        self.assertListEqual(result, expected,
                             f"Positive Zahlen von {numbers} sollten {expected} sein, erhielt {result}")

    def test_filter_all_non_positive(self):
        """Testet mit einer Liste ohne positive Zahlen."""
        filter_positive = self._get_func()
        numbers = [-1, 0, -5]
        expected = []
        result = filter_positive(numbers)
        self.assertIsInstance(result, list, "Das Ergebnis sollte eine Liste sein.")
        self.assertListEqual(result, expected,
                             f"Positive Zahlen von {numbers} sollten [] sein, erhielt {result}")

    def test_filter_empty_list(self):
        """Testet mit einer leeren Liste."""
        filter_positive = self._get_func()
        numbers = []
        expected = []
        result = filter_positive(numbers)
        self.assertIsInstance(result, list, "Das Ergebnis sollte eine Liste sein.")
        self.assertListEqual(result, expected,
                             f"Positive Zahlen von [] sollten [] sein, erhielt {result}")

if __name__ == '__main__':
    # def filter_positive(numbers): return list(filter(lambda x: x > 0, numbers)) # Dummy
    unittest.main() 