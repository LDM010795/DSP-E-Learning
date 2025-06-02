import unittest
import sys

# Testet die Funktion find_unique(elements)

class FindUniqueTest(unittest.TestCase):

    def test_function_exists(self):
        """Prüft, ob die Funktion 'find_unique' definiert wurde."""
        self.assertTrue(
            callable(globals().get('find_unique')) or
            callable(locals().get('find_unique')) or
            callable(getattr(sys.modules.get('__main__'), 'find_unique', None)),
            "Die Funktion 'find_unique' wurde nicht definiert oder ist nicht aufrufbar."
        )

    def _get_func(self):
        func = globals().get('find_unique') or locals().get('find_unique') or getattr(sys.modules.get('__main__'), 'find_unique')
        if not callable(func):
            self.fail("Funktion 'find_unique' nicht gefunden oder nicht aufrufbar.")
        return func

    def test_list_with_duplicates(self):
        """Testet mit einer Liste, die Duplikate enthält."""
        find_unique = self._get_func()
        elements = [1, 2, 2, 3, 4, 4, 4, 5]
        expected = {1, 2, 3, 4, 5}
        result = find_unique(elements)
        self.assertIsInstance(result, set, "Das Ergebnis sollte ein Set sein.")
        self.assertSetEqual(result, expected, f"Eindeutige Elemente von {elements} sollten {expected} sein, erhielt {result}")

    def test_list_without_duplicates(self):
        """Testet mit einer Liste ohne Duplikate."""
        find_unique = self._get_func()
        elements = [10, 20, 30]
        expected = {10, 20, 30}
        result = find_unique(elements)
        self.assertIsInstance(result, set, "Das Ergebnis sollte ein Set sein.")
        self.assertSetEqual(result, expected, f"Eindeutige Elemente von {elements} sollten {expected} sein, erhielt {result}")

    def test_empty_list(self):
        """Testet mit einer leeren Liste."""
        find_unique = self._get_func()
        elements = []
        expected = set()
        result = find_unique(elements)
        self.assertIsInstance(result, set, "Das Ergebnis sollte ein Set sein.")
        self.assertSetEqual(result, expected, f"Eindeutige Elemente von [] sollten set() sein, erhielt {result}")

    def test_list_with_mixed_types(self):
        """Testet mit einer Liste verschiedener (hashbarer) Typen."""
        find_unique = self._get_func()
        elements = [1, "a", 1, "b", "a", 2]
        expected = {1, "a", "b", 2}
        result = find_unique(elements)
        self.assertIsInstance(result, set, "Das Ergebnis sollte ein Set sein.")
        self.assertSetEqual(result, expected, f"Eindeutige Elemente von {elements} sollten {expected} sein, erhielt {result}")

if __name__ == '__main__':
    # def find_unique(elements): return set(elements) # Dummy
    unittest.main() 