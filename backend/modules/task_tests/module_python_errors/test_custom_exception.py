import unittest
import sys

# Testet die Funktion validate_age(age) und die Exception InvalidAgeError

# Annahme: Die Exception InvalidAgeError muss hier verfügbar sein.
# Wir definieren sie hier für die Testumgebung.
class InvalidAgeError(Exception):
    pass

class CustomExceptionTest(unittest.TestCase):

    def test_exception_exists(self):
        """Prüft, ob die Exception 'InvalidAgeError' definiert wurde."""
        self.assertTrue(
            isinstance(globals().get('InvalidAgeError'), type) or
            isinstance(locals().get('InvalidAgeError'), type) or
            (hasattr(sys.modules.get('__main__'), 'InvalidAgeError') and isinstance(getattr(sys.modules.get('__main__'), 'InvalidAgeError'), type)),
            "Die Exception 'InvalidAgeError' wurde nicht definiert."
        )
        # Prüfen, ob sie von Exception erbt
        InvalidAgeErrorClass = globals().get('InvalidAgeError') or locals().get('InvalidAgeError') or getattr(sys.modules.get('__main__'), 'InvalidAgeError')
        if isinstance(InvalidAgeErrorClass, type):
             self.assertTrue(issubclass(InvalidAgeErrorClass, Exception), "InvalidAgeError sollte von Exception erben.")

    def test_function_exists(self):
        """Prüft, ob die Funktion 'validate_age' definiert wurde."""
        self.assertTrue(
            callable(globals().get('validate_age')) or
            callable(locals().get('validate_age')) or
            callable(getattr(sys.modules.get('__main__'), 'validate_age', None)),
            "Die Funktion 'validate_age' wurde nicht definiert oder ist nicht aufrufbar."
        )

    def _get_func(self):
        func = globals().get('validate_age') or locals().get('validate_age') or getattr(sys.modules.get('__main__'), 'validate_age')
        if not callable(func):
            self.fail("Funktion 'validate_age' nicht gefunden oder nicht aufrufbar.")
        return func

    def _get_exception_class(self):
        exc = globals().get('InvalidAgeError') or locals().get('InvalidAgeError') or getattr(sys.modules.get('__main__'), 'InvalidAgeError')
        if not isinstance(exc, type) or not issubclass(exc, Exception):
             self.fail("Exception 'InvalidAgeError' nicht gefunden oder ist keine Exception-Klasse.")
        return exc

    def test_valid_age(self):
        """Testet mit gültigem Alter (sollte keine Exception auslösen)."""
        validate_age = self._get_func()
        try:
            validate_age(30)
            validate_age(0)
            validate_age(150) # Oberes Limit? Nicht spezifiziert.
        except Exception as e:
            self.fail(f"validate_age() löste unerwartet eine Exception aus für gültiges Alter: {e}")

    def test_negative_age(self):
        """Testet mit negativem Alter (sollte InvalidAgeError auslösen)."""
        validate_age = self._get_func()
        InvalidAgeErrorClass = self._get_exception_class()
        with self.assertRaises(InvalidAgeErrorClass, msg="validate_age(-5) sollte InvalidAgeError auslösen"):
            validate_age(-5)
        with self.assertRaises(InvalidAgeErrorClass, msg="validate_age(-1) sollte InvalidAgeError auslösen"):
            validate_age(-1)

    def test_non_integer_age(self):
        """Testet mit nicht-Integer Alter (sollte TypeError auslösen)."""
        validate_age = self._get_func()
        with self.assertRaises(TypeError, msg="validate_age('abc') sollte TypeError auslösen"):
            validate_age("abc")
        with self.assertRaises(TypeError, msg="validate_age(10.5) sollte TypeError auslösen"):
             validate_age(10.5)

if __name__ == '__main__':
    # Dummy implementation
    # class InvalidAgeError(Exception):
    #     pass
    # def validate_age(age):
    #     if not isinstance(age, int):
    #         raise TypeError("Age must be an integer.")
    #     if age < 0:
    #         raise InvalidAgeError("Age cannot be negative.")
    #     # Kein return, validiert nur
    unittest.main() 