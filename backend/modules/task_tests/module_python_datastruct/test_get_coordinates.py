import unittest
import sys

# Testet die Funktion get_coordinates()

class GetCoordinatesTest(unittest.TestCase):

    def test_function_exists(self):
        """Prüft, ob die Funktion 'get_coordinates' definiert wurde."""
        self.assertTrue(
            callable(globals().get('get_coordinates')) or
            callable(locals().get('get_coordinates')) or
            callable(getattr(sys.modules.get('__main__'), 'get_coordinates', None)),
            "Die Funktion 'get_coordinates' wurde nicht definiert oder ist nicht aufrufbar."
        )

    def test_return_value_and_type(self):
        """Testet den Rückgabewert und den Typ."""
        get_coordinates = globals().get('get_coordinates') or locals().get('get_coordinates') or getattr(sys.modules.get('__main__'), 'get_coordinates')
        if not callable(get_coordinates):
            self.fail("Funktion 'get_coordinates' nicht gefunden oder nicht aufrufbar.")
        
        result = get_coordinates()
        expected_value = (10, 25)
        expected_type = tuple

        self.assertEqual(result, expected_value, 
                         f"Erwarteter Rückgabewert: {expected_value}, erhalten: {result}")
        self.assertIsInstance(result, expected_type,
                              f"Erwarteter Rückgabetyp: {expected_type}, erhalten: {type(result)}")
        self.assertEqual(len(result), 2, f"Das Tupel sollte genau 2 Elemente haben, hat aber {len(result)}.")

if __name__ == '__main__':
    # def get_coordinates(): return (10, 25) # Dummy
    unittest.main() 