import unittest
import sys

# Testet die Funktion sum_all(*args)

class SumArgsTest(unittest.TestCase):

    def test_function_exists(self):
        """Prüft, ob die Funktion 'sum_all' definiert wurde."""
        self.assertTrue(
            callable(globals().get('sum_all')) or
            callable(locals().get('sum_all')) or
            callable(getattr(sys.modules.get('__main__'), 'sum_all', None)),
            "Die Funktion 'sum_all' wurde nicht definiert oder ist nicht aufrufbar."
        )

    def _get_func(self):
        func = globals().get('sum_all') or locals().get('sum_all') or getattr(sys.modules.get('__main__'), 'sum_all')
        if not callable(func):
            self.fail("Funktion 'sum_all' nicht gefunden oder nicht aufrufbar.")
        return func

    def test_sum_positive_numbers(self):
        """Testet mit mehreren positiven Zahlen."""
        sum_all = self._get_func()
        self.assertEqual(sum_all(1, 2, 3, 4, 5), 15, "sum_all(1, 2, 3, 4, 5) sollte 15 sein")

    def test_sum_mixed_numbers(self):
        """Testet mit positiven, negativen Zahlen und Null."""
        sum_all = self._get_func()
        self.assertEqual(sum_all(-1, 0, 1, -2, 2), 0, "sum_all(-1, 0, 1, -2, 2) sollte 0 sein")

    def test_sum_single_number(self):
        """Testet mit nur einer Zahl."""
        sum_all = self._get_func()
        self.assertEqual(sum_all(42), 42, "sum_all(42) sollte 42 sein")

    def test_sum_no_arguments(self):
        """Testet ohne Argumente (Summe sollte 0 sein)."""
        sum_all = self._get_func()
        # Die Summe von nichts ist typischerweise 0
        self.assertEqual(sum_all(), 0, "sum_all() sollte 0 sein")

if __name__ == '__main__':
    # def sum_all(*args): return sum(args) # Dummy
    unittest.main() 