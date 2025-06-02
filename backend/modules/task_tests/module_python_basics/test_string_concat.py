import unittest
import sys

# Testet die Funktion string_concat(name)

class StringConcatTest(unittest.TestCase):

    def test_function_exists(self):
        """Prüft, ob die Funktion 'greet_user' definiert wurde."""
        self.assertTrue(
            callable(globals().get('greet_user')) or
            callable(locals().get('greet_user')) or
            callable(getattr(sys.modules.get('__main__'), 'greet_user', None)),
            "Die Funktion 'greet_user' wurde nicht definiert oder ist nicht aufrufbar."
        )

    def test_greet_alice(self):
        """Testet die Begrüßung mit 'Alice'."""
        greet_user = globals().get('greet_user') or locals().get('greet_user') or getattr(sys.modules.get('__main__'), 'greet_user')
        if not callable(greet_user):
            self.fail("Funktion 'greet_user' nicht gefunden oder nicht aufrufbar.")
        name = "Alice"
        expected = "Hallo, Alice!"
        self.assertEqual(greet_user(name), expected, f"Begrüßung für '{name}' sollte '{expected}' sein")

    def test_greet_bob(self):
        """Testet die Begrüßung mit 'Bob'."""
        greet_user = globals().get('greet_user') or locals().get('greet_user') or getattr(sys.modules.get('__main__'), 'greet_user')
        if not callable(greet_user):
            self.fail("Funktion 'greet_user' nicht gefunden oder nicht aufrufbar.")
        name = "Bob"
        expected = "Hallo, Bob!"
        self.assertEqual(greet_user(name), expected, f"Begrüßung für '{name}' sollte '{expected}' sein")

    def test_greet_empty_string(self):
        """Testet die Begrüßung mit einem leeren String."""
        greet_user = globals().get('greet_user') or locals().get('greet_user') or getattr(sys.modules.get('__main__'), 'greet_user')
        if not callable(greet_user):
            self.fail("Funktion 'greet_user' nicht gefunden oder nicht aufrufbar.")
        name = ""
        expected = "Hallo, !"
        self.assertEqual(greet_user(name), expected, f"Begrüßung für einen leeren String sollte '{expected}' sein")

if __name__ == '__main__':
    # def greet_user(name): return f"Hallo, {name}!" # Dummy
    unittest.main() 