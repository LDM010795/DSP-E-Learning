import unittest
import sys
import os

# This test assumes that the user's code, defining say_hello,
# has been executed in the same context before this test runs.
# The ExecutePythonCodeView handles this execution.

class HelloWorldTest(unittest.TestCase):

    def test_say_hello_exists(self):
        """Checks if the function 'say_hello' was defined."""
        # Check if say_hello exists in the global or local scope where exec was called
        # This is tricky as the scope isn't directly available here.
        # We rely on the execution environment of ExecutePythonCodeView.
        # A placeholder check - the real check happens during execution.
        # We might need to adjust how the view makes the function available.
        # For now, let's assume it's broadly available or check globals.
        self.assertTrue('say_hello' in globals() or 'say_hello' in locals() or hasattr(sys.modules.get('__main__'), 'say_hello'),
                        "Die Funktion 'say_hello' wurde nicht definiert.")

    def test_say_hello_output(self):
        """Checks if say_hello() returns the exact string 'Hallo Welt!'"""
        # Dynamically get the function if it exists
        say_hello_func = globals().get('say_hello') or locals().get('say_hello') or getattr(sys.modules.get('__main__'), 'say_hello', None)

        if not callable(say_hello_func):
             self.fail("'say_hello' ist keine aufrufbare Funktion.")
             return # Prevent further execution if not callable

        expected_output = "Hallo Welt!"
        actual_output = say_hello_func()
        self.assertEqual(actual_output, expected_output,
                         f"Erwartet: '{expected_output}', aber erhalten: '{actual_output}'")

# This allows running the test file directly for debugging if needed,
# although it will likely fail without the prior execution context.
if __name__ == '__main__':
    # Define a dummy function for direct execution if needed
    # def say_hello(): return "Test" 
    unittest.main() 