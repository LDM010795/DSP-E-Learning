import unittest
import sys

# Testet die Klasse Book mit __str__

class BookStrTest(unittest.TestCase):

    def test_class_exists(self):
        """Prüft, ob die Klasse 'Book' definiert wurde."""
        self.assertTrue(
            isinstance(globals().get('Book'), type) or
            isinstance(locals().get('Book'), type) or
            (hasattr(sys.modules.get('__main__'), 'Book') and isinstance(getattr(sys.modules.get('__main__'), 'Book'), type)),
            "Die Klasse 'Book' wurde nicht definiert."
        )

    def _get_class(self):
        BookClass = globals().get('Book') or locals().get('Book') or getattr(sys.modules.get('__main__'), 'Book', None)
        if not isinstance(BookClass, type):
            self.fail("Klasse 'Book' nicht gefunden oder ist kein Typ.")
        return BookClass

    def test_book_instance_and_str(self):
        """Testet die Instanzerstellung und die __str__ Methode."""
        Book = self._get_class()
        try:
            book1 = Book(title="Der Herr der Ringe", author="J.R.R. Tolkien")
            book2 = Book(title="Stolz und Vorurteil", author="Jane Austen")
        except Exception as e:
            self.fail(f"Instanzerstellung von Book schlug fehl: {e}")

        # Teste die __str__ Methode (indirekt über str())
        expected_str1 = "Der Herr der Ringe by J.R.R. Tolkien"
        expected_str2 = "Stolz und Vorurteil by Jane Austen"
        
        # Prüfe, ob __str__ implementiert ist
        self.assertTrue(hasattr(book1, '__str__') and callable(book1.__str__),
                        "Die spezielle Methode '__str__' fehlt oder ist nicht aufrufbar.")
        
        try:
             self.assertEqual(str(book1), expected_str1,
                             f"str(book1) sollte '{expected_str1}' sein, erhielt '{str(book1)}'")
             self.assertEqual(str(book2), expected_str2,
                             f"str(book2) sollte '{expected_str2}' sein, erhielt '{str(book2)}'")
        except Exception as e:
             self.fail(f"Aufruf von str(book) schlug fehl: {e}")

if __name__ == '__main__':
    # Dummy class for direct testing
    # class Book:
    #     def __init__(self, title, author):
    #         self.title = title
    #         self.author = author
    #     def __str__(self):
    #         return f"{self.title} by {self.author}"
    unittest.main() 