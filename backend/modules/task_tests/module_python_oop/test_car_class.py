import unittest
import sys
import io
import contextlib

# Testet die Klasse Car

class CarClassTest(unittest.TestCase):

    def test_class_exists(self):
        """Prüft, ob die Klasse 'Car' definiert wurde."""
        self.assertTrue(
            isinstance(globals().get('Car'), type) or
            isinstance(locals().get('Car'), type) or
            (hasattr(sys.modules.get('__main__'), 'Car') and isinstance(getattr(sys.modules.get('__main__'), 'Car'), type)),
            "Die Klasse 'Car' wurde nicht definiert."
        )

    def _get_class(self):
        CarClass = globals().get('Car') or locals().get('Car') or getattr(sys.modules.get('__main__'), 'Car', None)
        if not isinstance(CarClass, type):
            self.fail("Klasse 'Car' nicht gefunden oder ist kein Typ.")
        return CarClass

    def test_car_instance_creation_and_attributes(self):
        """Testet die Instanzerstellung und die Attribute make und model."""
        Car = self._get_class()
        try:
            car1 = Car(make="Toyota", model="Camry")
            car2 = Car(make="Honda", model="Civic")
        except Exception as e:
            self.fail(f"Instanzerstellung von Car schlug fehl: {e}")

        self.assertEqual(car1.make, "Toyota", "Attribut 'make' wurde nicht korrekt gesetzt.")
        self.assertEqual(car1.model, "Camry", "Attribut 'model' wurde nicht korrekt gesetzt.")
        self.assertEqual(car2.make, "Honda", "Attribut 'make' wurde nicht korrekt gesetzt.")
        self.assertEqual(car2.model, "Civic", "Attribut 'model' wurde nicht korrekt gesetzt.")

    def test_car_display_info_method(self):
        """Testet die display_info() Methode."""
        Car = self._get_class()
        car = Car(make="Ford", model="Mustang")

        self.assertTrue(hasattr(car, 'display_info') and callable(car.display_info),
                        "Die Methode 'display_info' fehlt oder ist nicht aufrufbar.")

        expected_output = "Make: Ford, Model: Mustang"
        # Teste Rückgabewert ODER print-Ausgabe
        # Annahme 1: Methode gibt String zurück
        try:
            result = car.display_info()
            if result is not None:
                 self.assertEqual(result, expected_output,
                                  f"Methode display_info() sollte '{expected_output}' zurückgeben, erhielt '{result}'")
            else:
                 # Annahme 2: Methode printet nur
                 fake_stdout = io.StringIO()
                 with contextlib.redirect_stdout(fake_stdout):
                      car.display_info()
                 actual_output = fake_stdout.getvalue().strip()
                 self.assertEqual(actual_output, expected_output,
                                   f"Methode display_info() sollte '{expected_output}' ausgeben, gab aber '{actual_output}' aus.")
        except Exception as e:
            self.fail(f"Aufruf von car.display_info() schlug fehl: {e}")


if __name__ == '__main__':
    # Dummy class for direct testing
    # class Car:
    #     def __init__(self, make, model):
    #         self.make = make
    #         self.model = model
    #     def display_info(self):
    #         return f"Make: {self.make}, Model: {self.model}"
    unittest.main() 