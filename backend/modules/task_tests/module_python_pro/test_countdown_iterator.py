import unittest
import sys
from collections.abc import Iterable, Iterator

# Testet den CountdownIterator

class CountdownIteratorTest(unittest.TestCase):

    def test_class_exists(self):
        """Prüft, ob die Klasse 'CountdownIterator' definiert wurde."""
        self.assertTrue(
            isinstance(globals().get('CountdownIterator'), type) or
            isinstance(locals().get('CountdownIterator'), type) or
            (hasattr(sys.modules.get('__main__'), 'CountdownIterator') and isinstance(getattr(sys.modules.get('__main__'), 'CountdownIterator'), type)),
            "Die Klasse 'CountdownIterator' wurde nicht definiert."
        )

    def _get_class(self):
        IteratorClass = globals().get('CountdownIterator') or locals().get('CountdownIterator') or getattr(sys.modules.get('__main__'), 'CountdownIterator')
        if not isinstance(IteratorClass, type):
            self.fail("Klasse 'CountdownIterator' nicht gefunden oder ist kein Typ.")
        return IteratorClass

    def test_is_iterable_and_iterator(self):
        """Testet, ob die Klasse das Iterator-Protokoll implementiert."""
        CountdownIterator = self._get_class()
        try:
            instance = CountdownIterator(3)
            # Prüft auf __iter__
            self.assertTrue(isinstance(instance, Iterable), "CountdownIterator sollte iterable sein (__iter__ fehlt?).")
            iterator = iter(instance)
            # Prüft auf __next__
            self.assertTrue(isinstance(iterator, Iterator), "iter(CountdownIterator) sollte einen Iterator zurückgeben (__next__ fehlt?).")
            # Prüft, ob __iter__ sich selbst zurückgibt (typisch für Iteratoren)
            self.assertIs(iterator, iter(iterator), "__iter__ sollte self zurückgeben.")
        except Exception as e:
            self.fail(f"Fehler beim Prüfen des Iterator-Protokolls: {e}")

    def test_iteration_from_5(self):
        """Testet die Iteration von 5 bis 1."""
        CountdownIterator = self._get_class()
        expected = [5, 4, 3, 2, 1]
        actual = list(CountdownIterator(5))
        self.assertListEqual(actual, expected, f"Iteration von 5 sollte {expected} ergeben, erhielt {actual}")

    def test_iteration_from_1(self):
        """Testet die Iteration von 1 bis 1."""
        CountdownIterator = self._get_class()
        expected = [1]
        actual = list(CountdownIterator(1))
        self.assertListEqual(actual, expected, f"Iteration von 1 sollte {expected} ergeben, erhielt {actual}")

    def test_iteration_from_0(self):
        """Testet die Iteration von 0 (sollte leer sein)."""
        CountdownIterator = self._get_class()
        expected = []
        actual = list(CountdownIterator(0))
        self.assertListEqual(actual, expected, f"Iteration von 0 sollte {expected} ergeben, erhielt {actual}")

    def test_iteration_from_negative(self):
        """Testet die Iteration von einer negativen Zahl (sollte leer sein)."""
        CountdownIterator = self._get_class()
        expected = []
        actual = list(CountdownIterator(-3))
        self.assertListEqual(actual, expected, f"Iteration von -3 sollte {expected} ergeben, erhielt {actual}")

if __name__ == '__main__':
    # Dummy implementation
    # class CountdownIterator:
    #     def __init__(self, start):
    #         self.current = start
    # 
    #     def __iter__(self):
    #         return self
    # 
    #     def __next__(self):
    #         if self.current <= 0:
    #             raise StopIteration
    #         else:
    #             num = self.current
    #             self.current -= 1
    #             return num
    unittest.main() 