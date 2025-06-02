import unittest
import sys
from types import GeneratorType

# Testet den Generator fibonacci_generator(limit=None)

class FibonacciGeneratorTest(unittest.TestCase):

    def test_function_exists(self):
        """Prüft, ob die Funktion 'fibonacci_generator' definiert wurde."""
        self.assertTrue(
            callable(globals().get('fibonacci_generator')) or
            callable(locals().get('fibonacci_generator')) or
            callable(getattr(sys.modules.get('__main__'), 'fibonacci_generator', None)),
            "Die Funktion 'fibonacci_generator' wurde nicht definiert oder ist nicht aufrufbar."
        )

    def _get_func(self):
        func = globals().get('fibonacci_generator') or locals().get('fibonacci_generator') or getattr(sys.modules.get('__main__'), 'fibonacci_generator')
        if not callable(func):
            self.fail("Funktion 'fibonacci_generator' nicht gefunden oder nicht aufrufbar.")
        return func

    def test_is_generator(self):
        """Testet, ob die Funktion einen Generator zurückgibt."""
        fibonacci_generator = self._get_func()
        gen = fibonacci_generator()
        self.assertIsInstance(gen, GeneratorType, "Die Funktion sollte einen Generator zurückgeben.")

    def test_sequence_without_limit(self):
        """Testet die ersten paar Elemente der Sequenz ohne Limit."""
        fibonacci_generator = self._get_func()
        gen = fibonacci_generator() # Ohne Limit
        expected_sequence = [0, 1, 1, 2, 3, 5, 8, 13, 21, 34]
        actual_sequence = [next(gen) for _ in range(len(expected_sequence))]
        self.assertListEqual(actual_sequence, expected_sequence,
                             f"Die ersten {len(expected_sequence)} Fibonacci-Zahlen sollten {expected_sequence} sein.")

    def test_sequence_with_limit(self):
        """Testet die Sequenz mit einem Limit."""
        fibonacci_generator = self._get_func()
        limit = 10
        expected_sequence = [0, 1, 1, 2, 3, 5, 8]
        # Konvertiere Generator direkt in Liste
        actual_sequence = list(fibonacci_generator(limit=limit))
        self.assertListEqual(actual_sequence, expected_sequence,
                             f"Fibonacci-Zahlen bis {limit} sollten {expected_sequence} sein.")

    def test_limit_zero(self):
        """Testet mit Limit 0."""
        fibonacci_generator = self._get_func()
        self.assertListEqual(list(fibonacci_generator(limit=0)), [0], "Limit 0 sollte [0] ergeben.")

    def test_limit_one(self):
        """Testet mit Limit 1."""
        fibonacci_generator = self._get_func()
        self.assertListEqual(list(fibonacci_generator(limit=1)), [0, 1, 1], "Limit 1 sollte [0, 1, 1] ergeben.")

    def test_negative_limit(self):
         """Testet mit negativem Limit (sollte leere Sequenz ergeben)."""
         fibonacci_generator = self._get_func()
         self.assertListEqual(list(fibonacci_generator(limit=-1)), [], "Negatives Limit sollte [] ergeben.")

if __name__ == '__main__':
    # Dummy implementation
    # def fibonacci_generator(limit=None):
    #     a, b = 0, 1
    #     while limit is None or a <= limit:
    #         yield a
    #         a, b = b, a + b
    unittest.main() 