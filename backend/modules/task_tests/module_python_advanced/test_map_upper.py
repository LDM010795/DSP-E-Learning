import unittest
import sys

# Testet die Funktion uppercase_strings(strings)

class MapUpperTest(unittest.TestCase):

    def test_function_exists(self):
        """Prüft, ob die Funktion 'uppercase_strings' definiert wurde."""
        self.assertTrue(
            callable(globals().get('uppercase_strings')) or
            callable(locals().get('uppercase_strings')) or
            callable(getattr(sys.modules.get('__main__'), 'uppercase_strings', None)),
            "Die Funktion 'uppercase_strings' wurde nicht definiert oder ist nicht aufrufbar."
        )

    def _get_func(self):
        func = globals().get('uppercase_strings') or locals().get('uppercase_strings') or getattr(sys.modules.get('__main__'), 'uppercase_strings')
        if not callable(func):
            self.fail("Funktion 'uppercase_strings' nicht gefunden oder nicht aufrufbar.")
        return func

    def test_mixed_case_strings(self):
        """Testet mit einer Liste von Strings in gemischter Groß-/Kleinschreibung."""
        uppercase_strings = self._get_func()
        strings = ["hello", "World", "PyThOn"]
        expected = ["HELLO", "WORLD", "PYTHON"]
        result = uppercase_strings(strings)
        self.assertIsInstance(result, list, "Das Ergebnis sollte eine Liste sein.")
        self.assertListEqual(result, expected, 
                             f"Uppercase von {strings} sollte {expected} sein, erhielt {result}")

    def test_already_uppercase_strings(self):
        """Testet mit einer Liste, die bereits nur Großbuchstaben enthält."""
        uppercase_strings = self._get_func()
        strings = ["TEST", "DRIVEN"]
        expected = ["TEST", "DRIVEN"]
        result = uppercase_strings(strings)
        self.assertIsInstance(result, list, "Das Ergebnis sollte eine Liste sein.")
        self.assertListEqual(result, expected,
                             f"Uppercase von {strings} sollte {expected} sein, erhielt {result}")

    def test_empty_strings(self):
        """Testet mit einer Liste, die leere Strings enthält."""
        uppercase_strings = self._get_func()
        strings = ["", "abc", ""]
        expected = ["", "ABC", ""]
        result = uppercase_strings(strings)
        self.assertIsInstance(result, list, "Das Ergebnis sollte eine Liste sein.")
        self.assertListEqual(result, expected,
                             f"Uppercase von {strings} sollte {expected} sein, erhielt {result}")

    def test_empty_list(self):
        """Testet mit einer leeren Liste."""
        uppercase_strings = self._get_func()
        strings = []
        expected = []
        result = uppercase_strings(strings)
        self.assertIsInstance(result, list, "Das Ergebnis sollte eine Liste sein.")
        self.assertListEqual(result, expected,
                             f"Uppercase von [] sollte [] sein, erhielt {result}")

if __name__ == '__main__':
    # def uppercase_strings(strings): return list(map(str.upper, strings)) # Dummy
    unittest.main() 