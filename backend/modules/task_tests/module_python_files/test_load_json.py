import unittest
import sys
import tempfile
import os
import json

# Testet die Funktion load_json_data(filepath)

class LoadJsonTest(unittest.TestCase):

    def test_function_exists(self):
        """Prüft, ob die Funktion 'load_json_data' definiert wurde."""
        self.assertTrue(
            callable(globals().get('load_json_data')) or
            callable(locals().get('load_json_data')) or
            callable(getattr(sys.modules.get('__main__'), 'load_json_data', None)),
            "Die Funktion 'load_json_data' wurde nicht definiert oder ist nicht aufrufbar."
        )

    def _get_func(self):
        func = globals().get('load_json_data') or locals().get('load_json_data') or getattr(sys.modules.get('__main__'), 'load_json_data')
        if not callable(func):
            self.fail("Funktion 'load_json_data' nicht gefunden oder nicht aufrufbar.")
        return func

    def setUp(self):
        """Erstellt eine temporäre JSON-Datei."""
        self.temp_file = tempfile.NamedTemporaryFile(mode='w+', delete=False, encoding='utf-8')
        self.temp_filepath = self.temp_file.name
        self.test_data = {
            "name": "TestData",
            "version": 1.0,
            "items": [1, "two", {"id": 3}]
        }
        json.dump(self.test_data, self.temp_file)
        self.temp_file.close()

    def tearDown(self):
        """Löscht die temporäre Datei."""
        os.unlink(self.temp_filepath)

    def test_load_valid_json(self):
        """Testet das Laden einer gültigen JSON-Datei."""
        load_json_data = self._get_func()
        try:
            data = load_json_data(self.temp_filepath)
            self.assertEqual(data, self.test_data, "Geladene JSON-Daten stimmen nicht überein.")
        except FileNotFoundError:
            self.fail(f"Funktion warf FileNotFoundError für: {self.temp_filepath}")
        except json.JSONDecodeError:
             self.fail(f"Datei enthält ungültiges JSON oder Funktion parst nicht korrekt: {self.temp_filepath}")
        except Exception as e:
            self.fail(f"Laden der JSON-Datei schlug fehl: {e}")

    def test_load_non_existing_file(self):
        """Testet das Laden einer nicht existierenden Datei."""
        load_json_data = self._get_func()
        non_existing_path = "non_existent_file.json"
        with self.assertRaises(FileNotFoundError):
            load_json_data(non_existing_path)

    def test_load_invalid_json(self):
        """Testet das Laden einer Datei mit ungültigem JSON-Inhalt."""
        # Schreibe ungültiges JSON
        with open(self.temp_filepath, 'w', encoding='utf-8') as f:
            f.write("Dies ist kein gültiges JSON{")
        
        load_json_data = self._get_func()
        with self.assertRaises(json.JSONDecodeError):
             load_json_data(self.temp_filepath)

if __name__ == '__main__':
    # Dummy implementation
    # def load_json_data(filepath):
    #     try:
    #         with open(filepath, 'r', encoding='utf-8') as f:
    #             return json.load(f)
    #     except FileNotFoundError:
    #         raise
    #     except json.JSONDecodeError:
    #         raise
    unittest.main() 