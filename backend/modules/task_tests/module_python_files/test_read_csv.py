import unittest
import sys
import tempfile
import os
import csv

# Testet die Funktion read_csv_data(filepath)

class ReadCsvTest(unittest.TestCase):

    def test_function_exists(self):
        """Prüft, ob die Funktion 'read_csv_data' definiert wurde."""
        self.assertTrue(
            callable(globals().get('read_csv_data')) or
            callable(locals().get('read_csv_data')) or
            callable(getattr(sys.modules.get('__main__'), 'read_csv_data', None)),
            "Die Funktion 'read_csv_data' wurde nicht definiert oder ist nicht aufrufbar."
        )

    def _get_func(self):
        func = globals().get('read_csv_data') or locals().get('read_csv_data') or getattr(sys.modules.get('__main__'), 'read_csv_data')
        if not callable(func):
            self.fail("Funktion 'read_csv_data' nicht gefunden oder nicht aufrufbar.")
        return func

    def setUp(self):
        """Erstellt eine temporäre CSV-Datei."""
        self.temp_file = tempfile.NamedTemporaryFile(mode='w+', delete=False, newline='', encoding='utf-8')
        self.temp_filepath = self.temp_file.name
        # Beispieldaten
        self.header = ['Name', 'Stadt', 'Alter']
        self.data = [
            {'Name': 'Alice', 'Stadt': 'Berlin', 'Alter': '30'},
            {'Name': 'Bob', 'Stadt': 'München', 'Alter': '25'},
            {'Name': 'Charlie', 'Stadt': 'Hamburg', 'Alter': '35'}
        ]
        # Schreibe Daten in die temporäre Datei
        writer = csv.DictWriter(self.temp_file, fieldnames=self.header)
        writer.writeheader()
        writer.writerows(self.data)
        self.temp_file.close()

    def tearDown(self):
        """Löscht die temporäre Datei."""
        os.unlink(self.temp_filepath)

    def test_read_csv(self):
        """Testet das Lesen der CSV-Daten."""
        read_csv_data = self._get_func()
        try:
            result = read_csv_data(self.temp_filepath)
            self.assertIsInstance(result, list, "Ergebnis sollte eine Liste sein.")
            self.assertEqual(len(result), len(self.data), "Anzahl der gelesenen Zeilen stimmt nicht.")
            # Vergleiche die Dictionaries
            self.assertListEqual(result, self.data, "Gelesene Daten stimmen nicht mit den erwarteten Daten überein.")
        except FileNotFoundError:
            self.fail(f"Funktion warf FileNotFoundError für: {self.temp_filepath}")
        except Exception as e:
            self.fail(f"Lesen der CSV-Datei schlug fehl: {e}")

    def test_read_empty_csv(self):
        """Testet das Lesen einer leeren CSV (nur Header)."""
        # Erstelle leere Datei (nur Header)
        with open(self.temp_filepath, 'w', newline='', encoding='utf-8') as f:
            writer = csv.writer(f)
            writer.writerow(self.header)
        
        read_csv_data = self._get_func()
        result = read_csv_data(self.temp_filepath)
        self.assertListEqual(result, [], "Lesen einer leeren CSV sollte eine leere Liste ergeben.")

if __name__ == '__main__':
    # Dummy implementation
    # def read_csv_data(filepath):
    #     data = []
    #     try:
    #         with open(filepath, 'r', newline='', encoding='utf-8') as csvfile:
    #             reader = csv.DictReader(csvfile)
    #             for row in reader:
    #                 data.append(dict(row))
    #     except FileNotFoundError:
    #         raise # Re-raise for test
    #     return data
    unittest.main() 