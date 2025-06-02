import unittest
import sys

# Testet die Funktion filter_even(numbers) mit List Comprehension

class FilterEvenCompTest(unittest.TestCase):

    def test_function_exists(self):
        """Prüft, ob die Funktion 'filter_even' definiert wurde."""
        self.assertTrue(
            callable(globals().get('filter_even')) or
            callable(locals().get('filter_even')) or
            callable(getattr(sys.modules.get('__main__'), 'filter_even', None)),
            "Die Funktion 'filter_even' wurde nicht definiert oder ist nicht aufrufbar."
        )

    def _get_func(self):
        func = globals().get('filter_even') or locals().get('filter_even') or getattr(sys.modules.get('__main__'), 'filter_even')
        if not callable(func):
            self.fail("Funktion 'filter_even' nicht gefunden oder nicht aufrufbar.")
        return func

    def test_filter_mixed_numbers(self):
        """Testet mit einer Liste gemischter Zahlen."""
        filter_even = self._get_func()
        numbers = [1, 2, 3, 4, 5, 6, 0, -2, -5]
        expected = [2, 4, 6, 0, -2] # Reihenfolge kann variieren, wenn nicht explizit sortiert
        result = filter_even(numbers)
        self.assertIsInstance(result, list, "Das Ergebnis sollte eine Liste sein.")
        # Prüfe Elemente, nicht die Reihenfolge direkt, außer List Comp garantiert sie
        self.assertCountEqual(result, expected, 
                              f"Gerade Zahlen von {numbers} sollten {expected} sein (Reihenfolge egal), erhielt {result}")

    def test_filter_only_odd_numbers(self):
        """Testet mit einer Liste nur ungerader Zahlen."""
        filter_even = self._get_func()
        numbers = [1, 3, 5, 7]
        expected = []
        result = filter_even(numbers)
        self.assertIsInstance(result, list, "Das Ergebnis sollte eine Liste sein.")
        self.assertListEqual(result, expected, 
                             f"Gerade Zahlen von {numbers} sollten [] sein, erhielt {result}")

    def test_filter_only_even_numbers(self):
        """Testet mit einer Liste nur gerader Zahlen."""
        filter_even = self._get_func()
        numbers = [2, 4, 0, -6]
        expected = [2, 4, 0, -6]
        result = filter_even(numbers)
        self.assertIsInstance(result, list, "Das Ergebnis sollte eine Liste sein.")
        self.assertCountEqual(result, expected,
                              f"Gerade Zahlen von {numbers} sollten {expected} sein (Reihenfolge egal), erhielt {result}")

    def test_filter_empty_list(self):
        """Testet mit einer leeren Liste."""
        filter_even = self._get_func()
        numbers = []
        expected = []
        result = filter_even(numbers)
        self.assertIsInstance(result, list, "Das Ergebnis sollte eine Liste sein.")
        self.assertListEqual(result, expected,
                             f"Gerade Zahlen von [] sollten [] sein, erhielt {result}")

if __name__ == '__main__':
    # def filter_even(numbers): return [n for n in numbers if n % 2 == 0] # Dummy
    unittest.main() 