import unittest
import sys

# Testet die Funktion get_capital(country_dict, country)

class GetCapitalTest(unittest.TestCase):

    def test_function_exists(self):
        """Prüft, ob die Funktion 'get_capital' definiert wurde."""
        self.assertTrue(
            callable(globals().get('get_capital')) or
            callable(locals().get('get_capital')) or
            callable(getattr(sys.modules.get('__main__'), 'get_capital', None)),
            "Die Funktion 'get_capital' wurde nicht definiert oder ist nicht aufrufbar."
        )

    def _get_func(self):
        func = globals().get('get_capital') or locals().get('get_capital') or getattr(sys.modules.get('__main__'), 'get_capital')
        if not callable(func):
            self.fail("Funktion 'get_capital' nicht gefunden oder nicht aufrufbar.")
        return func

    def setUp(self):
        """Erstellt ein Beispiel-Dictionary für die Tests."""
        self.capitals = {
            "Deutschland": "Berlin",
            "Frankreich": "Paris",
            "Spanien": "Madrid"
        }

    def test_existing_country(self):
        """Testet den Zugriff auf ein vorhandenes Land."""
        get_capital = self._get_func()
        self.assertEqual(get_capital(self.capitals, "Deutschland"), "Berlin")
        self.assertEqual(get_capital(self.capitals, "Frankreich"), "Paris")

    def test_non_existing_country(self):
        """Testet den Zugriff auf ein nicht vorhandenes Land."""
        get_capital = self._get_func()
        self.assertEqual(get_capital(self.capitals, "Italien"), "Unbekannt")

    def test_case_sensitivity(self):
        """Testet die Groß-/Kleinschreibung (sollte sensitiv sein)."""
        get_capital = self._get_func()
        self.assertEqual(get_capital(self.capitals, "deutschland"), "Unbekannt", "Ländername sollte exakt übereinstimmen")

    def test_empty_dictionary(self):
        """Testet mit einem leeren Dictionary."""
        get_capital = self._get_func()
        self.assertEqual(get_capital({}, "Deutschland"), "Unbekannt")

if __name__ == '__main__':
    # def get_capital(country_dict, country): return country_dict.get(country, "Unbekannt") # Dummy
    unittest.main() 