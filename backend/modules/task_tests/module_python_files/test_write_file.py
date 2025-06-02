import unittest
import sys
import tempfile
import os

# Testet die Funktion write_to_file(filepath, text)

class WriteFileTest(unittest.TestCase):

    def test_function_exists(self):
        """Prüft, ob die Funktion 'write_to_file' definiert wurde."""
        self.assertTrue(
            callable(globals().get('write_to_file')) or
            callable(locals().get('write_to_file')) or
            callable(getattr(sys.modules.get('__main__'), 'write_to_file', None)),
            "Die Funktion 'write_to_file' wurde nicht definiert oder ist nicht aufrufbar."
        )

    def _get_func(self):
        func = globals().get('write_to_file') or locals().get('write_to_file') or getattr(sys.modules.get('__main__'), 'write_to_file')
        if not callable(func):
            self.fail("Funktion 'write_to_file' nicht gefunden oder nicht aufrufbar.")
        return func

    def setUp(self):
        """Erstellt ein temporäres Verzeichnis und Dateipfad."""
        self.temp_dir = tempfile.TemporaryDirectory()
        self.temp_filepath = os.path.join(self.temp_dir.name, "test_output.txt")

    def tearDown(self):
        """Bereinigt das temporäre Verzeichnis."""
        self.temp_dir.cleanup()

    def test_write_to_new_file(self):
        """Testet das Schreiben in eine neue Datei."""
        write_to_file = self._get_func()
        test_text = "Dies ist der erste Testtext."
        try:
            write_to_file(self.temp_filepath, test_text)
        except Exception as e:
            self.fail(f"write_to_file schlug fehl: {e}")
        
        # Überprüfe den Dateiinhalt
        try:
            with open(self.temp_filepath, 'r', encoding='utf-8') as f:
                content = f.read()
            self.assertEqual(content, test_text, "Der geschriebene Dateiinhalt stimmt nicht überein.")
        except FileNotFoundError:
            self.fail(f"Datei wurde nicht erstellt unter: {self.temp_filepath}")

    def test_overwrite_existing_file(self):
        """Testet, ob eine bestehende Datei überschrieben wird."""
        write_to_file = self._get_func()
        initial_text = "Anfangsinhalt."
        overwrite_text = "Dieser Text überschreibt alles."
        
        # Erstelle die Datei mit initialem Inhalt
        with open(self.temp_filepath, 'w', encoding='utf-8') as f:
            f.write(initial_text)
        
        # Führe die Funktion aus
        try:
            write_to_file(self.temp_filepath, overwrite_text)
        except Exception as e:
            self.fail(f"write_to_file schlug fehl: {e}")

        # Überprüfe den neuen Inhalt
        try:
            with open(self.temp_filepath, 'r', encoding='utf-8') as f:
                content = f.read()
            self.assertEqual(content, overwrite_text, "Der Dateiinhalt wurde nicht korrekt überschrieben.")
        except FileNotFoundError:
            self.fail(f"Datei ist nach dem Überschreiben nicht mehr vorhanden: {self.temp_filepath}")

if __name__ == '__main__':
    # Dummy implementation
    # def write_to_file(filepath, text):
    #     with open(filepath, 'w', encoding='utf-8') as f:
    #         f.write(text)
    unittest.main() 