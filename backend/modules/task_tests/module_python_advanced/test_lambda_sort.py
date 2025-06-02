import unittest
import sys

# Testet die Funktion sort_by_age(data)

class LambdaSortTest(unittest.TestCase):

    def test_function_exists(self):
        """Prüft, ob die Funktion 'sort_by_age' definiert wurde."""
        self.assertTrue(
            callable(globals().get('sort_by_age')) or
            callable(locals().get('sort_by_age')) or
            callable(getattr(sys.modules.get('__main__'), 'sort_by_age', None)),
            "Die Funktion 'sort_by_age' wurde nicht definiert oder ist nicht aufrufbar."
        )

    def test_sort_mixed_ages(self):
        """Testet die Sortierung mit verschiedenen Altersangaben."""
        sort_by_age = globals().get('sort_by_age') or locals().get('sort_by_age') or getattr(sys.modules.get('__main__'), 'sort_by_age')
        if not callable(sort_by_age):
            self.fail("Funktion 'sort_by_age' nicht gefunden oder nicht aufrufbar.")

        data = [("Alice", 30), ("Bob", 25), ("Charlie", 35)]
        expected = [("Bob", 25), ("Alice", 30), ("Charlie", 35)]
        self.assertListEqual(sort_by_age(data), expected,
                             "Liste sollte nach Alter (zweites Element) sortiert sein.")

    def test_sort_same_ages(self):
        """Testet die Sortierung, wenn einige Alter gleich sind (Stabilität ist nicht gefordert)."""
        sort_by_age = globals().get('sort_by_age') or locals().get('sort_by_age') or getattr(sys.modules.get('__main__'), 'sort_by_age')
        if not callable(sort_by_age):
            self.fail("Funktion 'sort_by_age' nicht gefunden oder nicht aufrufbar.")

        data = [("Eve", 25), ("David", 30), ("Frank", 25)]
        # Die Reihenfolge von Eve und Frank ist nicht festgelegt, nur dass sie vor David kommen
        result = sort_by_age(data)
        # Prüfen, ob die Elemente mit 25 vor dem Element mit 30 kommen
        self.assertEqual(result[0][1], 25)
        self.assertEqual(result[1][1], 25)
        self.assertEqual(result[2][1], 30)
        # Sicherstellen, dass alle ursprünglichen Elemente vorhanden sind
        self.assertCountEqual(result, data, "Die resultierende Liste sollte dieselben Elemente wie die Eingabe enthalten.")


    def test_empty_list(self):
        """Testet mit einer leeren Liste."""
        sort_by_age = globals().get('sort_by_age') or locals().get('sort_by_age') or getattr(sys.modules.get('__main__'), 'sort_by_age')
        if not callable(sort_by_age):
            self.fail("Funktion 'sort_by_age' nicht gefunden oder nicht aufrufbar.")
        data = []
        expected = []
        self.assertListEqual(sort_by_age(data), expected, "Sortieren von [] sollte [] ergeben")

if __name__ == '__main__':
    # def sort_by_age(data): return sorted(data, key=lambda item: item[1]) # Dummy
    unittest.main() 