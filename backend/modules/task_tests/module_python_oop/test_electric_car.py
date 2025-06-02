import unittest
import sys
import io
import contextlib

# Testet die Vererbung von ElectricCar von Car

# Annahme: Die Klasse Car muss hier verfügbar sein (entweder global definiert
# oder wir definieren eine Dummy-Klasse hier für den Test)
# Definieren wir eine Dummy-Car-Klasse für die Testumgebung
class Car:
    def __init__(self, make, model):
        self.make = make
        self.model = model
    def display_info(self):
        return f"Make: {self.make}, Model: {self.model}"

class ElectricCarTest(unittest.TestCase):

    def test_class_exists_and_inherits(self):
        """Prüft, ob die Klasse 'ElectricCar' definiert wurde und von Car erbt."""
        self.assertTrue(
            isinstance(globals().get('ElectricCar'), type) or
            isinstance(locals().get('ElectricCar'), type) or
            (hasattr(sys.modules.get('__main__'), 'ElectricCar') and isinstance(getattr(sys.modules.get('__main__'), 'ElectricCar'), type)),
            "Die Klasse 'ElectricCar' wurde nicht definiert."
        )
        ElectricCarClass = globals().get('ElectricCar') or locals().get('ElectricCar') or getattr(sys.modules.get('__main__'), 'ElectricCar')
        if not isinstance(ElectricCarClass, type):
             self.fail("'ElectricCar' ist keine Klasse.")
        # Prüfe Vererbung (geht davon aus, dass Car verfügbar ist)
        self.assertTrue(issubclass(ElectricCarClass, Car), "ElectricCar sollte von Car erben.")


    def _get_class(self):
        ElectricCarClass = globals().get('ElectricCar') or locals().get('ElectricCar') or getattr(sys.modules.get('__main__'), 'ElectricCar', None)
        if not isinstance(ElectricCarClass, type):
            self.fail("Klasse 'ElectricCar' nicht gefunden oder ist kein Typ.")
        return ElectricCarClass

    def test_instance_creation_and_attributes(self):
        """Testet Instanzerstellung und Attribute (make, model, battery_size)."""
        ElectricCar = self._get_class()
        try:
            # Annahme: __init__ nimmt make, model, battery_size
            ecar = ElectricCar(make="Tesla", model="Model 3", battery_size=75)
        except Exception as e:
            self.fail(f"Instanzerstellung von ElectricCar schlug fehl: {e}")

        self.assertEqual(ecar.make, "Tesla", "Attribut 'make' wurde nicht korrekt gesetzt oder geerbt.")
        self.assertEqual(ecar.model, "Model 3", "Attribut 'model' wurde nicht korrekt gesetzt oder geerbt.")
        self.assertEqual(ecar.battery_size, 75, "Attribut 'battery_size' wurde nicht korrekt gesetzt.")

    def test_overridden_display_info_method(self):
        """Testet die überschriebene display_info() Methode."""
        ElectricCar = self._get_class()
        ecar = ElectricCar(make="Nissan", model="Leaf", battery_size=40)

        self.assertTrue(hasattr(ecar, 'display_info') and callable(ecar.display_info),
                        "Die Methode 'display_info' fehlt oder ist nicht aufrufbar.")

        expected_output_part1 = "Make: Nissan, Model: Leaf"
        expected_output_part2 = "Battery: 40 kWh" # Annahme über Format

        # Teste Rückgabewert ODER print-Ausgabe
        try:
            result = ecar.display_info()
            if result is not None:
                 self.assertIn(expected_output_part1, result, "Überschriebene display_info() sollte Make/Model enthalten.")
                 self.assertIn(expected_output_part2, result, f"Überschriebene display_info() sollte '{expected_output_part2}' enthalten.")
            else:
                 fake_stdout = io.StringIO()
                 with contextlib.redirect_stdout(fake_stdout):
                      ecar.display_info()
                 actual_output = fake_stdout.getvalue().strip()
                 self.assertIn(expected_output_part1, actual_output, "Ausgabe von display_info() sollte Make/Model enthalten.")
                 self.assertIn(expected_output_part2, actual_output, f"Ausgabe von display_info() sollte '{expected_output_part2}' enthalten.")
        except Exception as e:
            self.fail(f"Aufruf von ecar.display_info() schlug fehl: {e}")

if __name__ == '__main__':
    # Dummy class for direct testing
    # class ElectricCar(Car):
    #     def __init__(self, make, model, battery_size):
    #         super().__init__(make, model)
    #         self.battery_size = battery_size
    #     def display_info(self):
    #         base_info = super().display_info()
    #         return f"{base_info}, Battery: {self.battery_size} kWh"
    unittest.main() 