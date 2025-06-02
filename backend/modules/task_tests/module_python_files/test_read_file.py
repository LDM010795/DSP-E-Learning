import unittest
import sys
import tempfile
import os

# Testet die Funktion read_file_content(filepath)

class ReadFileTest(unittest.TestCase):

    def test_function_exists(self):
        """Prüft, ob die Funktion 'read_file_content' definiert wurde."""
        self.assertTrue(
            callable(globals().get('read_file_content')) or
            callable(locals().get('read_file_content')) or
            callable(getattr(sys.modules.get('__main__'), 'read_file_content', None)),
            "Die Funktion 'read_file_content' wurde nicht definiert oder ist nicht aufrufbar."
        )

    def _get_func(self):
        func = globals().get('read_file_content') or locals().get('read_file_content') or getattr(sys.modules.get('__main__'), 'read_file_content')
        if not callable(func):
            self.fail("Funktion 'read_file_content' nicht gefunden oder nicht aufrufbar.")
        return func

    def setUp(self):
        """Erstellt eine temporäre Datei für Tests."""
        # Create a temporary file
        self.temp_file = tempfile.NamedTemporaryFile(mode='w+', delete=False, encoding='utf-8')
        self.test_content = "Hallo Welt!\nZeile 2.\nLetzte Zeile."
        self.temp_file.write(self.test_content)
        self.temp_file.close() # Close it so the function can open it
        self.temp_filepath = self.temp_file.name

    def tearDown(self):
        """Löscht die temporäre Datei nach Tests."""
        os.unlink(self.temp_filepath)

    def test_read_existing_file(self):
        """Testet das Lesen einer existierenden Datei."""
        read_file_content = self._get_func()
        try:
            content = read_file_content(self.temp_filepath)
            self.assertEqual(content, self.test_content,
                             f"Inhalt der Datei sollte '{self.test_content}' sein, erhielt '{content}'")
        except FileNotFoundError:
            self.fail(f"Funktion warf FileNotFoundError für existierende Datei: {self.temp_filepath}")
        except Exception as e:
            self.fail(f"Lesen der Datei schlug fehl: {e}")

    def test_read_non_existing_file(self):
        """Testet das Lesen einer nicht existierenden Datei (sollte FileNotFoundError auslösen)."""
        read_file_content = self._get_func()
        non_existing_path = "hopefully_this_file_does_not_exist.txt"
        with self.assertRaises(FileNotFoundError, msg=f"Lesen von '{non_existing_path}' sollte FileNotFoundError auslösen"):
            read_file_content(non_existing_path)

if __name__ == '__main__':
    # Dummy implementation
    # def read_file_content(filepath):
    #     with open(filepath, 'r', encoding='utf-8') as f:
    #         return f.read()
    unittest.main() 