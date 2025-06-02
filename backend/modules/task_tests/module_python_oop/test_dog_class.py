import unittest
import sys

# Testet die Klasse Dog

class DogClassTest(unittest.TestCase):

    def test_class_exists(self):
        """Prüft, ob die Klasse 'Dog' definiert wurde."""
        self.assertTrue(
            isinstance(globals().get('Dog'), type) or
            isinstance(locals().get('Dog'), type) or
            (hasattr(sys.modules.get('__main__'), 'Dog') and isinstance(getattr(sys.modules.get('__main__'), 'Dog'), type)),
            "Die Klasse 'Dog' wurde nicht definiert."
        )

    def _get_class(self):
        DogClass = globals().get('Dog') or locals().get('Dog') or getattr(sys.modules.get('__main__'), 'Dog', None)
        if not isinstance(DogClass, type):
             self.fail("Klasse 'Dog' nicht gefunden oder ist kein Typ.")
        return DogClass

    def test_dog_instance_creation_and_attributes(self):
        """Testet die Instanzerstellung und die Attribute name und breed."""
        Dog = self._get_class()
        try:
            dog1 = Dog(name="Bello", breed="Schäferhund")
            dog2 = Dog(name="Lucy", breed="Labrador")
        except Exception as e:
            self.fail(f"Instanzerstellung von Dog schlug fehl: {e}")

        self.assertEqual(dog1.name, "Bello", "Attribut 'name' wurde nicht korrekt gesetzt.")
        self.assertEqual(dog1.breed, "Schäferhund", "Attribut 'breed' wurde nicht korrekt gesetzt.")
        self.assertEqual(dog2.name, "Lucy", "Attribut 'name' wurde nicht korrekt gesetzt.")
        self.assertEqual(dog2.breed, "Labrador", "Attribut 'breed' wurde nicht korrekt gesetzt.")

    def test_dog_bark_method(self):
        """Testet die bark() Methode."""
        Dog = self._get_class()
        dog = Dog(name="Rex", breed="Dackel")
        
        self.assertTrue(hasattr(dog, 'bark') and callable(dog.bark),
                        "Die Methode 'bark' fehlt oder ist nicht aufrufbar.")
        
        expected_bark = "Woof!"
        try:
            actual_bark = dog.bark()
            self.assertEqual(actual_bark, expected_bark,
                             f"Methode bark() sollte '{expected_bark}' zurückgeben, erhielt '{actual_bark}'")
        except Exception as e:
             self.fail(f"Aufruf von dog.bark() schlug fehl: {e}")


if __name__ == '__main__':
    # Dummy class for direct testing
    # class Dog:
    #     def __init__(self, name, breed):
    #         self.name = name
    #         self.breed = breed
    #     def bark(self):
    #         return "Woof!"
    unittest.main() 