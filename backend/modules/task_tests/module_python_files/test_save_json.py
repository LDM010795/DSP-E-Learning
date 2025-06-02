import unittest
import sys
import tempfile
import os
import json

# Testet die Funktion save_json_data(filepath, data)

class SaveJsonTest(unittest.TestCase):

    def test_function_exists(self):
        """Prüft, ob die Funktion 'save_json_data' definiert wurde."""
        self.assertTrue(
            callable(globals().get('save_json_data')) or
            callable(locals().get('save_json_data')) or
            callable(getattr(sys.modules.get('__main__'), 'save_json_data', None)),
            "Die Funktion 'save_json_data' wurde nicht definiert oder ist nicht aufrufbar."
        )

    def _get_func(self):
        func = globals().get('save_json_data') or locals().get('save_json_data') or getattr(sys.modules.get('__main__'), 'save_json_data')
        if not callable(func):
            self.fail("Funktion 'save_json_data' nicht gefunden oder nicht aufrufbar.")
        return func

    def setUp(self):
        """Erstellt ein temporäres Verzeichnis und Dateipfad."""
        self.temp_dir = tempfile.TemporaryDirectory()
        self.temp_filepath = os.path.join(self.temp_dir.name, "output.json")
        self.test_data = {
            "id": 123,
            "values": ["a", "b", 10],
            "valid": True
        }

    def tearDown(self):
        """Bereinigt das temporäre Verzeichnis."""
        self.temp_dir.cleanup()

    def test_save_valid_data(self):
        """Testet das Speichern eines gültigen Python-Objekts als JSON."""
        save_json_data = self._get_func()
        try:
            save_json_data(self.temp_filepath, self.test_data)
        except Exception as e:
            self.fail(f"save_json_data schlug fehl: {e}")

        # Überprüfe den Dateiinhalt
        try:
            with open(self.temp_filepath, 'r', encoding='utf-8') as f:
                loaded_data = json.load(f)
            self.assertEqual(loaded_data, self.test_data, "Gespeicherte JSON-Daten stimmen nicht mit den Quelldaten überein.")
        except FileNotFoundError:
            self.fail(f"Datei wurde nicht erstellt unter: {self.temp_filepath}")
        except json.JSONDecodeError:
            self.fail(f"Gespeicherte Datei enthält ungültiges JSON: {self.temp_filepath}")

    def test_overwrite_existing_file(self):
        """Testet, ob eine bestehende Datei korrekt überschrieben wird."""
        save_json_data = self._get_func()
        initial_data = {"initial": True}
        # Schreibe initiale Daten
        with open(self.temp_filepath, 'w', encoding='utf-8') as f:
             json.dump(initial_data, f)

        # Überschreibe mit neuen Daten
        try:
            save_json_data(self.temp_filepath, self.test_data)
        except Exception as e:
            self.fail(f"save_json_data beim Überschreiben schlug fehl: {e}")

        # Überprüfe den neuen Inhalt
        try:
            with open(self.temp_filepath, 'r', encoding='utf-8') as f:
                loaded_data = json.load(f)
            self.assertEqual(loaded_data, self.test_data, "Dateiinhalt wurde nicht korrekt überschrieben.")
        except Exception as e:
             self.fail(f"Lesen der überschriebenen Datei schlug fehl: {e}")


if __name__ == '__main__':
    # Dummy implementation
    # def save_json_data(filepath, data):
    #     with open(filepath, 'w', encoding='utf-8') as f:
    #         json.dump(data, f, indent=4) # indent ist optional, aber gut für Lesbarkeit
    unittest.main() 