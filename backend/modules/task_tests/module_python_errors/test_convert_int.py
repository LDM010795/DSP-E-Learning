import unittest
import sys

# Testet die Funktion convert_to_int(value)

class ConvertIntTest(unittest.TestCase):

    def test_function_exists(self):
        """Prüft, ob die Funktion 'convert_to_int' definiert wurde."""
        self.assertTrue(
            callable(globals().get('convert_to_int')) or
            callable(locals().get('convert_to_int')) or
            callable(getattr(sys.modules.get('__main__'), 'convert_to_int', None)),
            "Die Funktion 'convert_to_int' wurde nicht definiert oder ist nicht aufrufbar."
        )

    def _get_func(self):
        func = globals().get('convert_to_int') or locals().get('convert_to_int') or getattr(sys.modules.get('__main__'), 'convert_to_int')
        if not callable(func):
            self.fail("Funktion 'convert_to_int' nicht gefunden oder nicht aufrufbar.")
        return func

    def test_valid_integer_string(self):
        """Testet mit einem gültigen Integer-String."""
        convert_to_int = self._get_func()
        self.assertEqual(convert_to_int("123"), 123)
        self.assertEqual(convert_to_int("-45"), -45)
        self.assertEqual(convert_to_int("0"), 0)

    def test_valid_integer_number(self):
        """Testet mit einer Integer-Zahl (sollte sich selbst zurückgeben)."""
        convert_to_int = self._get_func()
        self.assertEqual(convert_to_int(123), 123)
        self.assertEqual(convert_to_int(-45), -45)
        self.assertEqual(convert_to_int(0), 0)

    def test_float_string(self):
        """Testet mit einem Float-String (sollte None zurückgeben)."""
        convert_to_int = self._get_func()
        self.assertIsNone(convert_to_int("123.45"), "Float-String sollte None ergeben.")

    def test_non_numeric_string(self):
        """Testet mit einem nicht-numerischen String (sollte None zurückgeben)."""
        convert_to_int = self._get_func()
        self.assertIsNone(convert_to_int("abc"), "Nicht-numerischer String sollte None ergeben.")
        self.assertIsNone(convert_to_int(""), "Leerer String sollte None ergeben.")

    def test_other_types(self):
        """Testet mit anderen inkompatiblen Typen (sollte None zurückgeben)."""
        convert_to_int = self._get_func()
        self.assertIsNone(convert_to_int(None), "None sollte None ergeben.")
        self.assertIsNone(convert_to_int([1, 2]), "Liste sollte None ergeben.")
        self.assertIsNone(convert_to_int({'a': 1}), "Dictionary sollte None ergeben.")
        self.assertIsNone(convert_to_int(12.5), "Float sollte None ergeben (oder int(12.5) -> 12? Aufgabe präzisieren!). Annahme: Nur ganze Zahlen als Strings/ints.")


if __name__ == '__main__':
    # Dummy implementation
    # def convert_to_int(value):
    #     try:
    #         # Erlaube nur direkte Integer oder Strings, die wie Integer aussehen
    #         if isinstance(value, int):
    #             return value
    #         # Prüfe, ob der String nur aus Ziffern besteht (und optional einem Minus)
    #         if isinstance(value, str) and value.strip().lstrip('-').isdigit():
    #              return int(value)
    #         else:
    #             # Behandle alle anderen Fälle (Float-Strings, andere Typen) als Fehler
    #              return None
    #     except (ValueError, TypeError):
    #         return None
    unittest.main() 