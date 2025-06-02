import unittest
import sys
import io
import contextlib

# Testet die Funktion countdown(start)

class CountdownTest(unittest.TestCase):

    def test_function_exists(self):
        """Prüft, ob die Funktion 'countdown' definiert wurde."""
        self.assertTrue(
            callable(globals().get('countdown')) or
            callable(locals().get('countdown')) or
            callable(getattr(sys.modules.get('__main__'), 'countdown', None)),
            "Die Funktion 'countdown' wurde nicht definiert oder ist nicht aufrufbar."
        )

    def _get_countdown_output(self, start_value):
        """Führt countdown aus und fängt die print-Ausgaben ab."""
        countdown_func = globals().get('countdown') or locals().get('countdown') or getattr(sys.modules.get('__main__'), 'countdown')
        if not callable(countdown_func):
            self.fail("Funktion 'countdown' nicht gefunden oder nicht aufrufbar.")
        
        fake_stdout = io.StringIO()
        with contextlib.redirect_stdout(fake_stdout):
            countdown_func(start_value)
        return fake_stdout.getvalue()

    def test_countdown_from_5(self):
        """Testet den Countdown ab 5."""
        output = self._get_countdown_output(5)
        expected_lines = ["5", "4", "3", "2", "1", "Start!"]
        actual_lines = output.strip().split('\n')
        self.assertListEqual(actual_lines, expected_lines, 
                             f"Erwartete Ausgabe für Countdown(5): {expected_lines}, erhalten: {actual_lines}")

    def test_countdown_from_1(self):
        """Testet den Countdown ab 1."""
        output = self._get_countdown_output(1)
        expected_lines = ["1", "Start!"]
        actual_lines = output.strip().split('\n')
        self.assertListEqual(actual_lines, expected_lines, 
                             f"Erwartete Ausgabe für Countdown(1): {expected_lines}, erhalten: {actual_lines}")

    def test_countdown_from_0(self):
        """Testet den Countdown ab 0 (sollte nur 'Start!' ausgeben)."""
        output = self._get_countdown_output(0)
        expected_lines = ["Start!"]
        actual_lines = output.strip().split('\n')
        # Check if output contains only 'Start!' or is empty depending on interpretation
        if not actual_lines or (len(actual_lines) == 1 and actual_lines[0] == ''):
            # Some might interpret countdown(0) as doing nothing before 'Start!'
            actual_lines = [] # Treat empty output as potentially valid before 'Start!' if logic implies
            self.fail("Countdown(0) erzeugte keine Ausgabe. Erwartet wurde zumindest 'Start!'.")
        elif actual_lines == ['Start!']:
             pass # Correct
        else:
             self.assertListEqual(actual_lines, expected_lines,
                                  f"Erwartete Ausgabe für Countdown(0): {expected_lines}, erhalten: {actual_lines}")


if __name__ == '__main__':
    # Dummy implementation for direct testing
    # def countdown(start):
    #     i = start
    #     while i > 0:
    #         print(i)
    #         i -= 1
    #     print("Start!")
    unittest.main() 