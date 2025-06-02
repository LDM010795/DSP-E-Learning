import unittest
import sys
import os

# Testet die Funktion get_current_dir()

class GetCwdTest(unittest.TestCase):

    def test_function_exists(self):
        """Prüft, ob die Funktion 'get_current_dir' definiert wurde."""
        self.assertTrue(
            callable(globals().get('get_current_dir')) or
            callable(locals().get('get_current_dir')) or
            callable(getattr(sys.modules.get('__main__'), 'get_current_dir', None)),
            "Die Funktion 'get_current_dir' wurde nicht definiert oder ist nicht aufrufbar."
        )

    def _get_func(self):
        func = globals().get('get_current_dir') or locals().get('get_current_dir') or getattr(sys.modules.get('__main__'), 'get_current_dir')
        if not callable(func):
            self.fail("Funktion 'get_current_dir' nicht gefunden oder nicht aufrufbar.")
        return func

    def test_returns_string(self):
        """Testet, ob die Funktion einen String zurückgibt."""
        get_current_dir = self._get_func()
        result = get_current_dir()
        self.assertIsInstance(result, str, "Der Rückgabewert sollte ein String sein.")

    def test_returns_actual_cwd(self):
        """Testet, ob der zurückgegebene String dem tatsächlichen CWD entspricht."""
        get_current_dir = self._get_func()
        expected_cwd = os.getcwd()
        actual_cwd = get_current_dir()
        # Normalisiere Pfade, um kleine Unterschiede (z.B. / vs \) zu ignorieren
        self.assertEqual(os.path.normpath(actual_cwd), os.path.normpath(expected_cwd),
                         f"Erwartetes CWD: {expected_cwd}, erhalten: {actual_cwd}")

if __name__ == '__main__':
    # Dummy implementation
    # import os
    # def get_current_dir():
    #     return os.getcwd()
    unittest.main() 