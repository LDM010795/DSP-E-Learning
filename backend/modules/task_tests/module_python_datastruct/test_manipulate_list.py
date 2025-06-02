import unittest
import sys

# Testet die Funktion manipulate_list(input_list)

class ManipulateListTest(unittest.TestCase):

    def test_function_exists(self):
        """Prüft, ob die Funktion 'manipulate_list' definiert wurde."""
        self.assertTrue(
            callable(globals().get('manipulate_list')) or
            callable(locals().get('manipulate_list')) or
            callable(getattr(sys.modules.get('__main__'), 'manipulate_list', None)),
            "Die Funktion 'manipulate_list' wurde nicht definiert oder ist nicht aufrufbar."
        )

    def _get_func(self):
        func = globals().get('manipulate_list') or locals().get('manipulate_list') or getattr(sys.modules.get('__main__'), 'manipulate_list')
        if not callable(func):
            self.fail("Funktion 'manipulate_list' nicht gefunden oder nicht aufrufbar.")
        return func

    def test_manipulate_standard_list(self):
        """Testet mit einer normalen Liste."""
        manipulate_list = self._get_func()
        input_list = [1, 2, 3, 4]
        expected = [2, 3, 4, 100]
        # Wichtig: Die Funktion soll die Liste *verändern* und zurückgeben.
        # Oder soll sie eine *neue* Liste zurückgeben? Aufgabe präzisieren!
        # Annahme: Sie gibt die *veränderte* Original-Liste zurück.
        # Daher prüfen wir NICHT input_list selbst, sondern das Ergebnis.
        result = manipulate_list(input_list[:]) # Kopie übergeben, um Original zu schützen
        self.assertListEqual(result, expected, 
                             f"manipulate_list([1, 2, 3, 4]) sollte {expected} zurückgeben, erhielt {result}")

    def test_manipulate_single_element_list(self):
        """Testet mit einer Liste, die nur ein Element hat."""
        manipulate_list = self._get_func()
        input_list = [5]
        expected = [100] # Erstes Element entfernt, 100 hinzugefügt
        result = manipulate_list(input_list[:])
        self.assertListEqual(result, expected,
                             f"manipulate_list([5]) sollte {expected} zurückgeben, erhielt {result}")

    def test_manipulate_empty_list(self):
        """Testet mit einer leeren Liste (kann das erste Element nicht entfernen)."""
        manipulate_list = self._get_func()
        input_list = []
        expected = [100] # Nur 100 hinzugefügt
        # Handle mögliche IndexError
        try:
            result = manipulate_list(input_list[:])
            self.assertListEqual(result, expected, 
                                 f"manipulate_list([]) sollte {expected} zurückgeben, erhielt {result}")
        except IndexError:
            self.fail("manipulate_list([]) warf einen unerwarteten IndexError. Leere Listen behandeln!")


if __name__ == '__main__':
    # Dummy implementation
    # def manipulate_list(input_list):
    #     if input_list:
    #         input_list.pop(0)
    #     input_list.append(100)
    #     return input_list
    unittest.main() 