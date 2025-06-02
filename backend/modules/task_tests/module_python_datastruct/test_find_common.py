import unittest
import sys

# Testet die Funktion find_common(list1, list2)

class FindCommonTest(unittest.TestCase):

    def test_function_exists(self):
        """Prüft, ob die Funktion 'find_common' definiert wurde."""
        self.assertTrue(
            callable(globals().get('find_common')) or
            callable(locals().get('find_common')) or
            callable(getattr(sys.modules.get('__main__'), 'find_common', None)),
            "Die Funktion 'find_common' wurde nicht definiert oder ist nicht aufrufbar."
        )

    def _get_func(self):
        func = globals().get('find_common') or locals().get('find_common') or getattr(sys.modules.get('__main__'), 'find_common')
        if not callable(func):
            self.fail("Funktion 'find_common' nicht gefunden oder nicht aufrufbar.")
        return func

    def test_common_elements_exist(self):
        """Testet, wenn es gemeinsame Elemente gibt."""
        find_common = self._get_func()
        list1 = [1, 2, 3, 4, 5]
        list2 = [4, 5, 6, 7, 8]
        expected = {4, 5}
        result = find_common(list1, list2)
        self.assertIsInstance(result, set, "Das Ergebnis sollte ein Set sein.")
        self.assertSetEqual(result, expected, f"Gemeinsame Elemente von {list1} und {list2} sollten {expected} sein, erhielt {result}")

    def test_no_common_elements(self):
        """Testet, wenn es keine gemeinsamen Elemente gibt."""
        find_common = self._get_func()
        list1 = [1, 2, 3]
        list2 = [4, 5, 6]
        expected = set()
        result = find_common(list1, list2)
        self.assertIsInstance(result, set, "Das Ergebnis sollte ein Set sein.")
        self.assertSetEqual(result, expected, f"Gemeinsame Elemente von {list1} und {list2} sollten set() sein, erhielt {result}")

    def test_one_list_empty(self):
        """Testet, wenn eine der Listen leer ist."""
        find_common = self._get_func()
        list1 = [1, 2, 3]
        list2 = []
        expected = set()
        result = find_common(list1, list2)
        self.assertIsInstance(result, set, "Das Ergebnis sollte ein Set sein.")
        self.assertSetEqual(result, expected, f"Gemeinsame Elemente von {list1} und {list2} sollten set() sein, erhielt {result}")
        result = find_common(list2, list1)
        self.assertSetEqual(result, expected, f"Gemeinsame Elemente von {list2} und {list1} sollten set() sein, erhielt {result}")

    def test_both_lists_empty(self):
        """Testet, wenn beide Listen leer sind."""
        find_common = self._get_func()
        list1 = []
        list2 = []
        expected = set()
        result = find_common(list1, list2)
        self.assertIsInstance(result, set, "Das Ergebnis sollte ein Set sein.")
        self.assertSetEqual(result, expected, f"Gemeinsame Elemente von [] und [] sollten set() sein, erhielt {result}")

    def test_with_duplicates(self):
        """Testet, wenn die Listen Duplikate enthalten."""
        find_common = self._get_func()
        list1 = [1, 2, 2, 3, 4]
        list2 = [2, 3, 3, 5, 4]
        expected = {2, 3, 4}
        result = find_common(list1, list2)
        self.assertIsInstance(result, set, "Das Ergebnis sollte ein Set sein.")
        self.assertSetEqual(result, expected, f"Gemeinsame Elemente von {list1} und {list2} sollten {expected} sein, erhielt {result}")

if __name__ == '__main__':
    # def find_common(list1, list2): return set(list1) & set(list2) # Dummy
    unittest.main() 