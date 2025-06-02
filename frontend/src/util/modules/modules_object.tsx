// pages/Modules.tsx

const modulesObj = [
  // Python Module
  {
    id: "javascript_essentials",
    title: "JavaScript Grundlagen",
    progress: 20,
    content: [
      {
        contentId: "1",
        videoUrl: "https://www.youtube.com/embed/hdI2bqOjy3c",
        title: "Einführung in JavaScript",
        description:
          "Dieses Video bietet einen umfassenden Überblick über die Grundlagen von JavaScript, einschließlich Variablen, Datentypen, Operatoren und grundlegenden Kontrollstrukturen. Ideal für Anfänger, die ihre ersten Schritte in der Webentwicklung machen.",
        supplementaryTitle: "Nützliche Ressourcen",
        supplementaryContent: [
          {
            label: "JavaScript Guide (MDN)",
            url: "https://developer.mozilla.org/de/docs/Web/JavaScript/Guide",
          },
          {
            label: "Eloquent JavaScript (Online Buch)",
            url: "https://eloquentjavascript.net/",
          },
          {
            label: "JavaScript.info Tutorial",
            url: "https://javascript.info/",
          },
        ],
      },
      {
        contentId: "2",
        videoUrl: "https://www.youtube.com/embed/W6NZfCO5SIk",
        title: "JS Variablen und Datentypen",
        description:
          "Erfahren Sie detailliert die Unterschiede zwischen `var`, `let` und `const` für die Variablendeklaration in JavaScript. Verstehen Sie Scope, Hoisting und wann welche Deklarationsart am besten geeignet ist.",
        supplementaryTitle: "Vertiefende Erklärungen",
        supplementaryContent: [
          {
            label: "MDN: let vs const",
            url: "https://developer.mozilla.org/de/docs/Web/JavaScript/Reference/Statements/let#zeitliche_totzone_tdz",
          },
          {
            label: "freeCodeCamp: var, let, const",
            url: "https://www.freecodecamp.org/news/var-let-and-const-whats-the-difference/",
          },
        ],
      },
    ],
    tasks: [
      {
        id: "task1",
        title: "Zähler mit JS",
        description: "Erstelle einen Klickzähler in HTML und JS.",
        difficulty: "Einfach",
        hint: "Du benötigst einen Button in HTML und eine JavaScript-Funktion, die eine Variable bei jedem Klick erhöht und den neuen Wert anzeigt.",
      },
      {
        id: "task2",
        title: "Taschenrechner bauen",
        description: "Programmiere einen kleinen JS-Taschenrechner.",
        difficulty: "Einfach",
        hint: "Erstelle Buttons für Zahlen und Operatoren. Speichere die aktuelle Eingabe und führe die Berechnung durch, wenn ein Operator oder Gleichheitszeichen geklickt wird.",
      },
      {
        id: "task3",
        title: "DOM Manipulation",
        description:
          "Wähle HTML-Elemente aus und ändere deren Inhalt oder Stil.",
        difficulty: "Einfach",
        hint: "Verwende `document.getElementById` oder `document.querySelector`, um Elemente zu finden, und ändere dann Eigenschaften wie `.innerHTML` oder `.style`.",
      },
      {
        id: "task4",
        title: "Event Handling",
        description:
          "Reagiere auf Benutzerinteraktionen wie Klicks oder Tastatureingaben.",
        difficulty: "Mittel",
        hint: "Füge Event Listener zu HTML-Elementen hinzu, z.B. mit `element.addEventListener('click', deineFunktion);`.",
      },
      {
        id: "task5",
        title: "Arrays und Schleifen",
        description: "Iteriere über eine Liste von Daten und zeige sie an.",
        difficulty: "Mittel",
        hint: "Verwende eine `for`-Schleife oder die `forEach`-Methode, um durch die Elemente eines Arrays zu gehen.",
      },
      {
        id: "task6",
        title: "Objekte erstellen",
        description:
          "Definiere eigene Datenstrukturen mithilfe von JavaScript-Objekten.",
        difficulty: "Mittel",
        hint: "Ein Objekt wird mit geschweiften Klammern `{}` definiert und enthält Schlüssel-Wert-Paare, z.B. `{ name: 'Max', alter: 30 }`.",
      },
      {
        id: "task7",
        title: "API-Aufruf mit Fetch",
        description: "Rufe Daten von einer einfachen öffentlichen API ab.",
        difficulty: "Mittel",
        hint: "Nutze die `fetch()`-Funktion, um eine Anfrage zu senden. Denke daran, die Antwort mit `.then(res => res.json())` zu verarbeiten.",
      },
      {
        id: "task8",
        title: "Formularvalidierung",
        description: "Überprüfe Benutzereingaben in einem HTML-Formular.",
        difficulty: "Schwer",
        hint: "Greife auf die Werte der Formularfelder zu und prüfe sie mit JavaScript, bevor das Formular abgeschickt wird. Zeige Fehlermeldungen an.",
      },
      {
        id: "task9",
        title: "Lokaler Speicher",
        description:
          "Speichere und lies einfache Daten im Local Storage des Browsers.",
        difficulty: "Schwer",
        hint: "Verwende `localStorage.setItem('schluessel', 'wert')` zum Speichern und `localStorage.getItem('schluessel')` zum Lesen.",
      },
      {
        id: "task10",
        title: "Asynchrones JavaScript",
        description:
          "Verwende Promises oder async/await, um asynchrone Operationen zu handhaben.",
        difficulty: "Schwer",
        hint: "`async/await` vereinfacht die Arbeit mit Promises. Markiere die Funktion mit `async` und verwende `await` vor dem Promise (z.B. `await fetch(...)`).",
      },
    ],
  },

  {
    id: "data_science_intro",
    title: "Einführung in Data Science",
    progress: 10,
    content: [
      {
        contentId: "1",
        videoUrl: "https://www.youtube.com/embed/X3paOmcrTjQ",
        title: "Was ist Data Science?",
        description:
          "Eine Einführung in das interdisziplinäre Feld der Data Science. Das Video erklärt die wichtigsten Konzepte, Werkzeuge und Anwendungsbereiche, von der Datenanalyse bis zum maschinellen Lernen.",
        supplementaryTitle: "Grundlagen und Startpunkte",
        supplementaryContent: [
          {
            label: "Kaggle: Was ist Data Science?",
            url: "https://www.kaggle.com/code/getting-started/530527",
          },
          {
            label: "DataCamp: Einführung Data Science",
            url: "https://www.datacamp.com/tracks/data-scientist-with-python",
          },
        ],
      },
      {
        contentId: "2",
        videoUrl: "https://www.youtube.com/embed/RaC3fBtfDUc",
        title: "Numpy Crashkurs",
        description:
          "Ein schneller Einstieg in NumPy, die fundamentale Bibliothek für numerische Berechnungen in Python. Lernen Sie Arrays, Vektoroperationen und grundlegende Funktionen für die Datenanalyse kennen.",
        supplementaryTitle: "Numpy Dokumentation & Tutorials",
        supplementaryContent: [
          {
            label: "Offizielle Numpy Dokumentation",
            url: "https://numpy.org/doc/stable/",
          },
          {
            label: "Numpy Tutorial (W3Schools)",
            url: "https://www.w3schools.com/python/numpy/default.asp",
          },
        ],
      },
      {
        contentId: "3",
        videoUrl: "https://www.youtube.com/embed/0oTh1CXRaQ0",
        title: "Datenvisualisierung mit Matplotlib",
        description:
          "Lernen Sie, wie Sie mit Matplotlib, der beliebten Python-Bibliothek, aussagekräftige Diagramme und Plots erstellen können. Behandelt werden Linien-, Streu- und Balkendiagramme.",
        supplementaryTitle: "Matplotlib Ressourcen",
        supplementaryContent: [
          {
            label: "Matplotlib Offizielle Tutorials",
            url: "https://matplotlib.org/stable/tutorials/index.html",
          },
          {
            label: "Matplotlib Beispielgalerie",
            url: "https://matplotlib.org/stable/gallery/index.html",
          },
          {
            label: "Python Graph Gallery",
            url: "https://python-graph-gallery.com/matplotlib/",
          },
        ],
      },
    ],
    tasks: [
      {
        id: "task1",
        title: "Datensatz analysieren",
        description: "Analysiere CSV-Daten mit Pandas.",
        difficulty: "Einfach",
        hint: "Importiere Pandas (`import pandas as pd`). Lade die CSV mit `pd.read_csv('datei.csv')`. Verwende `.head()`, `.describe()` oder `.info()` zur ersten Analyse.",
      },
      {
        id: "task2",
        title: "Diagramm erstellen",
        description: "Zeichne einen Plot mit Matplotlib.",
        difficulty: "Einfach",
        hint: "Importiere Matplotlib (`import matplotlib.pyplot as plt`). Verwende `plt.plot(x_werte, y_werte)` oder andere Plot-Funktionen und zeige es mit `plt.show()` an.",
      },
      {
        id: "task3",
        title: "Pandas DataFrame erstellen",
        description: "Erstelle manuell ein einfaches Pandas DataFrame.",
        difficulty: "Einfach",
        hint: "Verwende `pd.DataFrame()` und übergebe ein Dictionary, wobei die Schlüssel die Spaltennamen und die Werte Listen sind.",
      },
      {
        id: "task4",
        title: "Datenbereinigung",
        description:
          "Identifiziere und behandle fehlende Werte in einem Datensatz.",
        difficulty: "Mittel",
        hint: "Verwende `.isnull().sum()` um fehlende Werte zu finden. Nutze `.dropna()` zum Entfernen oder `.fillna()` zum Ersetzen.",
      },
      {
        id: "task5",
        title: "Datenaggregation",
        description:
          "Gruppiere Daten nach einer Kategorie und berechne Mittelwerte.",
        difficulty: "Mittel",
        hint: "Nutze die `.groupby('spaltenname')`-Methode gefolgt von einer Aggregationsfunktion wie `.mean()`, `.sum()` oder `.count()`.",
      },
      {
        id: "task6",
        title: "Numpy Array Operationen",
        description:
          "Führe grundlegende mathematische Operationen auf Numpy Arrays durch.",
        difficulty: "Mittel",
        hint: "Importiere Numpy (`import numpy as np`). Erstelle Arrays mit `np.array([...])`. Mathematische Operationen (+, -, *, /) funktionieren elementweise.",
      },
      {
        id: "task7",
        title: "Einfache lineare Regression",
        description:
          "Trainiere ein einfaches lineares Regressionsmodell mit scikit-learn.",
        difficulty: "Schwer",
        hint: "Importiere `LinearRegression` aus `sklearn.linear_model`. Erstelle ein Modell-Objekt, trainiere es mit `.fit(X, y)` und mache Vorhersagen mit `.predict(X_neu)`.",
      },
      {
        id: "task8",
        title: "Daten aus CSV laden",
        description: "Lade Daten aus einer CSV-Datei in ein Pandas DataFrame.",
        difficulty: "Einfach",
        hint: "Der Befehl `pandas.read_csv('pfad/zur/datei.csv')` ist hierfür zentral.",
      },
      {
        id: "task9",
        title: "Verschiedene Plot-Typen",
        description:
          "Erstelle ein Histogramm und ein Streudiagramm mit Matplotlib.",
        difficulty: "Mittel",
        hint: "Verwende `plt.hist()` für Histogramme und `plt.scatter()` für Streudiagramme.",
      },
      {
        id: "task10",
        title: "Datenbeschreibung",
        description:
          "Berechne grundlegende statistische Kennzahlen für einen Datensatz.",
        difficulty: "Mittel",
        hint: "Die `.describe()`-Methode eines Pandas DataFrames liefert viele nützliche statistische Kennzahlen auf einmal.",
      },
    ],
  },
  {
    id: "frontend_basics",
    title: "Frontend Grundlagen",
    progress: 20,
    content: [
      {
        contentId: "1",
        videoUrl: "https://www.youtube.com/embed/UB1O30fR-EE",
        title: "HTML Basics",
        description:
          "Dieses Video führt in die Grundlagen von HTML (HyperText Markup Language) ein. Sie lernen die grundlegende Struktur eines HTML-Dokuments, wichtige Tags wie Überschriften, Paragraphen, Listen und Links kennen.",
        supplementaryTitle: "HTML Referenzen",
        supplementaryContent: [
          {
            label: "MDN: HTML Grundlagen",
            url: "https://developer.mozilla.org/de/docs/Learn/Getting_started_with_the_web/HTML_basics",
          },
          {
            label: "W3Schools HTML Tutorial",
            url: "https://www.w3schools.com/html/",
          },
        ],
      },
    ],
    tasks: [
      {
        id: "task1",
        title: "HTML Grundgerüst erstellen",
        description: "Baue ein Grundgerüst für eine Webseite mit HTML.",
        difficulty: "Einfach",
        hint: "Jedes HTML-Dokument braucht `<html>`, `<head>` und `<body>`. Im `<head>` stehen Metadaten wie der `<title>`.",
      },
      {
        id: "task2",
        title: "HTML Listen",
        description:
          "Erstelle eine geordnete und eine ungeordnete Liste in HTML.",
        difficulty: "Einfach",
      },
      {
        id: "task3",
        title: "HTML Tabellen",
        description:
          "Stelle tabellarische Daten mit dem `<table>`-Element dar.",
        difficulty: "Einfach",
      },
      {
        id: "task4",
        title: "HTML Formulare",
        description:
          "Erstelle ein einfaches Formular mit Eingabefeldern und einem Button.",
        difficulty: "Einfach",
      },
      {
        id: "task5",
        title: "Bilder einfügen",
        description:
          "Füge ein Bild mit dem `<img>`-Tag in deine HTML-Seite ein.",
        difficulty: "Einfach",
      },
      {
        id: "task6",
        title: "Links erstellen",
        description: "Verlinke zu einer anderen Webseite mit dem `<a>`-Tag.",
        difficulty: "Einfach",
      },
      {
        id: "task7",
        title: "Semantisches HTML",
        description:
          "Strukturiere deine Seite mit `<header>`, `<nav>` und `<footer>`.",
        difficulty: "Mittel",
      },
      {
        id: "task8",
        title: "HTML Kommentare",
        description: "Füge Kommentare zu deinem HTML-Code hinzu.",
        difficulty: "Einfach",
      },
      {
        id: "task9",
        title: "HTML Attribute",
        description:
          "Verwende `class`- und `id`-Attribute zur Identifizierung von Elementen.",
        difficulty: "Mittel",
      },
      {
        id: "task10",
        title: "Grundlegende CSS Selektoren",
        description:
          "Style Elemente basierend auf ihrem Tag-Namen, ihrer Klasse oder ID.",
        difficulty: "Mittel",
        hint: "Tag-Selektor: `p { ... }`, Klassen-Selektor: `.meine-klasse { ... }`, ID-Selektor: `#meine-id { ... }`",
      },
    ],
  },
  {
    id: "css_layouts",
    title: "CSS Layouts",
    progress: 30,
    content: [
      {
        contentId: "1",
        videoUrl: "https://www.youtube.com/embed/1Rs2ND1ryYc",
        title: "CSS Box Model & Flexbox",
        description:
          "Ein tiefgehender Blick auf das CSS Box Model (Margin, Border, Padding, Content) und eine Einführung in Flexbox, ein leistungsstarkes Layout-Modul zur Gestaltung flexibler und responsiver Webseiten.",
        supplementaryTitle: "Layout-Techniken",
        supplementaryContent: [
          {
            label: "MDN: Box Model",
            url: "https://developer.mozilla.org/de/docs/Learn/CSS/Building_blocks/The_box_model",
          },
          {
            label: "CSS-Tricks: A Complete Guide to Flexbox",
            url: "https://css-tricks.com/snippets/css/a-guide-to-flexbox/",
          },
          {
            label: "Flexbox Froggy (Spielerisches Lernen)",
            url: "https://flexboxfroggy.com/#de",
          },
        ],
      },
    ],
    tasks: [
      {
        id: "task1",
        title: "Flexbox-Layout erstellen",
        description: "Nutze Flexbox, um eine einfache Navigation zu layouten.",
        difficulty: "Mittel",
      },
      {
        id: "task2",
        title: "CSS Grid Layout",
        description: "Erstelle ein zweispaltiges Layout mit CSS Grid.",
        difficulty: "Mittel",
      },
      {
        id: "task3",
        title: "Responsive Design",
        description:
          "Passe das Layout für verschiedene Bildschirmgrößen mit Media Queries an.",
        difficulty: "Schwer",
      },
      {
        id: "task4",
        title: "Positionierung",
        description:
          "Experimentiere mit `position: relative`, `absolute` und `fixed`.",
        difficulty: "Mittel",
      },
      {
        id: "task5",
        title: "Box Model Details",
        description:
          "Verstehe und manipuliere `padding`, `border` und `margin`.",
        difficulty: "Einfach",
      },
      {
        id: "task6",
        title: "CSS Einheiten",
        description: "Verwende `px`, `em`, `rem` und `%` für Größenangaben.",
        difficulty: "Einfach",
      },
      {
        id: "task7",
        title: "Pseudo-Klassen",
        description: "Style Elemente im `:hover`- oder `:focus`-Zustand.",
        difficulty: "Mittel",
      },
      {
        id: "task8",
        title: "Pseudo-Elemente",
        description: "Füge Inhalte mit `::before` oder `::after` hinzu.",
        difficulty: "Mittel",
      },
      {
        id: "task9",
        title: "CSS Variablen",
        description:
          "Definiere und verwende CSS Custom Properties (Variablen).",
        difficulty: "Schwer",
      },
      {
        id: "task10",
        title: "Formulare stylen",
        description: "Passe das Aussehen von Input-Feldern und Buttons an.",
        difficulty: "Mittel",
      },
    ],
  },
  {
    id: "javascript_fundamentals",
    title: "JavaScript Grundlagen",
    progress: 15,
    content: [
      {
        contentId: "1",
        videoUrl: "https://www.youtube.com/embed/W6NZfCO5SIk",
        title: "JavaScript Basics",
        description:
          "Eine Wiederholung und Vertiefung der JavaScript-Grundlagen, einschließlich Variablentypen, Operatoren, Funktionen, Kontrollfluss (if/else, Schleifen) und grundlegender Datenstrukturen.",
        supplementaryTitle: "JS Kernkonzepte",
        supplementaryContent: [
          {
            label: "MDN: JavaScript Grundlagen",
            url: "https://developer.mozilla.org/de/docs/Learn/JavaScript/First_steps",
          },
          {
            label: "JavaScript Cheatsheet",
            url: "https://htmlcheatsheet.com/js/",
          },
        ],
      },
    ],
    tasks: [
      {
        id: "task1",
        title: "Einfache Interaktionen",
        description: "Füge interaktive Elemente mit JavaScript hinzu.",
        difficulty: "Einfach",
      },
      {
        id: "task2",
        title: "Variablendeklaration",
        description:
          "Verstehe den Unterschied zwischen `var`, `let` und `const`.",
        difficulty: "Einfach",
      },
      {
        id: "task3",
        title: "Datentypen prüfen",
        description:
          "Verwende `typeof`, um den Datentyp einer Variablen zu bestimmen.",
        difficulty: "Einfach",
      },
      {
        id: "task4",
        title: "Funktionen definieren",
        description: "Schreibe eine Funktion als Deklaration und als Ausdruck.",
        difficulty: "Einfach",
      },
      {
        id: "task5",
        title: "Bedingte Anweisungen",
        description: "Implementiere Logik mit `if/else` und `switch`.",
        difficulty: "Einfach",
      },
      {
        id: "task6",
        title: "Schleifen",
        description:
          "Verwende `for`- und `while`-Schleifen zur Wiederholung von Code.",
        difficulty: "Einfach",
      },
      {
        id: "task7",
        title: "Scope verstehen",
        description:
          "Erkläre den Unterschied zwischen globalem und lokalem Scope.",
        difficulty: "Mittel",
      },
      {
        id: "task8",
        title: "String Manipulation",
        description:
          "Verwende Methoden wie `slice`, `toUpperCase` und `split`.",
        difficulty: "Mittel",
      },
      {
        id: "task9",
        title: "Number Methoden",
        description:
          "Arbeite mit Zahlen und Methoden wie `toFixed` oder `parseInt`.",
        difficulty: "Mittel",
      },
      {
        id: "task10",
        title: "Boolean Logik",
        description: "Verwende logische Operatoren (`&&`, `||`, `!`).",
        difficulty: "Einfach",
      },
    ],
  },
  {
    id: "version_control",
    title: "Version Control mit Git",
    progress: 40,
    content: [
      {
        contentId: "1",
        videoUrl: "https://www.youtube.com/embed/RGOj5yH7evk",
        title: "Einführung in Git",
        description:
          "Verstehen Sie die Notwendigkeit von Versionskontrollsystemen und lernen Sie die grundlegenden Konzepte und Befehle von Git kennen, wie Repository, Commit, Branch und Merge.",
        supplementaryTitle: "Git Lernressourcen",
        supplementaryContent: [
          {
            label: "Offizielles Git Buch (Pro Git)",
            url: "https://git-scm.com/book/de/v2",
          },
          {
            label: "GitHub Git Cheatsheet",
            url: "https://training.github.com/downloads/de/github-git-cheat-sheet/",
          },
          {
            label: "Learn Git Branching (Interaktiv)",
            url: "https://learngitbranching.js.org/?locale=de_DE",
          },
        ],
      },
    ],
    tasks: [
      {
        id: "task1",
        title: "Git Repository erstellen",
        description:
          "Initialisiere ein neues Git Repository und mache erste Commits.",
        difficulty: "Einfach",
      },
      {
        id: "task2",
        title: "Staging Area nutzen",
        description: "Füge Dateien gezielt mit `git add` zum Staging hinzu.",
        difficulty: "Einfach",
      },
      {
        id: "task3",
        title: "Änderungen committen",
        description: "Schreibe aussagekräftige Commit-Nachrichten.",
        difficulty: "Einfach",
      },
      {
        id: "task4",
        title: "Commit-Historie anzeigen",
        description: "Navigiere durch die Historie mit `git log`.",
        difficulty: "Einfach",
      },
      {
        id: "task5",
        title: "Branching",
        description:
          "Erstelle einen neuen Branch, wechsle zu ihm und arbeite daran.",
        difficulty: "Mittel",
      },
      {
        id: "task6",
        title: "Merging",
        description:
          "Führe Änderungen aus einem Branch in einen anderen zusammen.",
        difficulty: "Mittel",
      },
      {
        id: "task7",
        title: "Remote Repository",
        description: "Füge ein Remote Repository (z.B. auf GitHub) hinzu.",
        difficulty: "Mittel",
      },
      {
        id: "task8",
        title: "Pushing",
        description:
          "Lade deine lokalen Commits auf das Remote Repository hoch.",
        difficulty: "Mittel",
      },
      {
        id: "task9",
        title: "Pulling",
        description: "Hole Änderungen vom Remote Repository.",
        difficulty: "Mittel",
      },
      {
        id: "task10",
        title: ".gitignore",
        description:
          "Erstelle eine `.gitignore`-Datei, um bestimmte Dateien zu ignorieren.",
        difficulty: "Einfach",
      },
    ],
  },
  {
    id: "data_analysis",
    title: "Datenanalyse mit Python",
    progress: 50,
    content: [
      {
        contentId: "1",
        videoUrl: "https://www.youtube.com/embed/X3paOmcrTjQ",
        title: "Grundlagen der Datenanalyse",
        description:
          "Eine Einführung in die Datenanalyse mit den Python-Bibliotheken Pandas und NumPy. Lernen Sie, wie Sie Daten laden, bereinigen, transformieren, analysieren und erste Visualisierungen erstellen.",
        supplementaryTitle: "Pandas & Numpy",
        supplementaryContent: [
          {
            label: "Pandas Dokumentation",
            url: "https://pandas.pydata.org/docs/",
          },
          {
            label: "Numpy Dokumentation",
            url: "https://numpy.org/doc/stable/",
          },
          {
            label: "10 minutes to pandas",
            url: "https://pandas.pydata.org/docs/user_guide/10min.html",
          },
        ],
      },
    ],
    tasks: [
      {
        id: "task1",
        title: "Einfaches DataFrame erstellen",
        description:
          "Erstelle ein DataFrame mit Pandas und analysiere die Daten.",
        difficulty: "Einfach",
      },
      {
        id: "task2",
        title: "Daten aus Datei laden",
        description: "Lade Daten aus einer CSV-Datei mit `pandas.read_csv`.",
        difficulty: "Einfach",
      },
      {
        id: "task3",
        title: "Daten filtern",
        description:
          "Wende Boolean Indexing an, um Zeilen im DataFrame zu filtern.",
        difficulty: "Mittel",
      },
      {
        id: "task4",
        title: "Spalten auswählen/umbenennen",
        description: "Wähle spezifische Spalten aus und benenne sie um.",
        difficulty: "Einfach",
      },
      {
        id: "task5",
        title: "Fehlende Daten behandeln",
        description:
          "Verwende `dropna` oder `fillna`, um mit NaN-Werten umzugehen.",
        difficulty: "Mittel",
      },
      {
        id: "task6",
        title: "Daten gruppieren",
        description: "Nutze die `groupby`-Methode zur Gruppierung von Daten.",
        difficulty: "Mittel",
      },
      {
        id: "task7",
        title: "Daten aggregieren",
        description:
          "Berechne `sum`, `mean` oder `count` für gruppierte Daten.",
        difficulty: "Mittel",
      },
      {
        id: "task8",
        title: "Daten visualisieren",
        description: "Erstelle einfache Plots direkt aus Pandas DataFrames.",
        difficulty: "Mittel",
      },
      {
        id: "task9",
        title: "Numpy Array Manipulation",
        description: "Erstelle Numpy Arrays und führe Vektoroperationen durch.",
        difficulty: "Einfach",
      },
      {
        id: "task10",
        title: "Statistische Analyse",
        description:
          "Verwende die `describe`-Methode für eine statistische Übersicht.",
        difficulty: "Mittel",
      },
    ],
  },
  {
    id: "api_basics",
    title: "API Grundlagen",
    progress: 35,
    content: [
      {
        contentId: "1",
        videoUrl: "https://www.youtube.com/embed/-MTSQjw5DrM",
        title: "Was sind APIs?",
        description:
          "Dieses Video erklärt das Konzept von APIs (Application Programming Interfaces), insbesondere Web-APIs. Sie erfahren, wie APIs die Kommunikation zwischen verschiedenen Software-Systemen ermöglichen und welche Rolle HTTP, URLs und Datenformate wie JSON spielen.",
        supplementaryTitle: "API Konzepte",
        supplementaryContent: [
          {
            label: "MDN: Einführung in Web APIs",
            url: "https://developer.mozilla.org/de/docs/Learn/JavaScript/Client-side_web_APIs/Introduction",
          },
          {
            label: "REST API Tutorial (RESTful)",
            url: "https://restfulapi.net/",
          },
          {
            label: "Public APIs Liste",
            url: "https://github.com/public-apis/public-apis",
          },
        ],
      },
    ],
    tasks: [
      {
        id: "task1",
        title: "Eine API-Anfrage stellen",
        description:
          "Rufe Daten von einer öffentlichen API ab und zeige sie an.",
        difficulty: "Einfach",
      },
      {
        id: "task2",
        title: "REST vs SOAP",
        description:
          "Erkläre die Hauptunterschiede zwischen REST- und SOAP-APIs.",
        difficulty: "Mittel",
      },
      {
        id: "task3",
        title: "HTTP Methoden",
        description: "Beschreibe den Zweck von GET, POST, PUT und DELETE.",
        difficulty: "Einfach",
      },
      {
        id: "task4",
        title: "Status Codes",
        description:
          "Interpretiere gängige HTTP Status Codes wie 200, 404, 500.",
        difficulty: "Einfach",
      },
      {
        id: "task5",
        title: "JSON parsen",
        description:
          "Verarbeite eine JSON-Antwort von einer API in JavaScript oder Python.",
        difficulty: "Mittel",
      },
      {
        id: "task6",
        title: "API Keys",
        description:
          "Verwende einen API-Schlüssel zur Authentifizierung bei einer Anfrage.",
        difficulty: "Mittel",
      },
      {
        id: "task7",
        title: "Public APIs nutzen",
        description:
          "Finde eine öffentliche API (z.B. Wetter) und stelle eine Anfrage.",
        difficulty: "Mittel",
      },
      {
        id: "task8",
        title: "POST-Request senden",
        description: "Sende Daten an eine API mithilfe einer POST-Anfrage.",
        difficulty: "Mittel",
      },
      {
        id: "task9",
        title: "Request Header",
        description:
          "Setze benutzerdefinierte Header (z.B. `Content-Type`) in einer Anfrage.",
        difficulty: "Schwer",
      },
      {
        id: "task10",
        title: "Fehlerbehandlung",
        description:
          "Implementiere eine Fehlerbehandlung für fehlgeschlagene API-Aufrufe.",
        difficulty: "Schwer",
      },
    ],
  },
  {
    id: "python_basics",
    title: "Python Grundlagen",
    progress: 100,
    content: [
      {
        contentId: "1",
        videoUrl: "https://www.youtube.com/embed/rfscVS0vtbw",
        title: "Python für Anfänger",
        description:
          "Ein umfassender Einstieg in die Python-Programmierung. Behandelt werden grundlegende Syntax, Variablen, Datentypen, Listen, Dictionaries, Schleifen, Bedingungen und Funktionen.",
        supplementaryTitle: "Python Lernmaterialien",
        supplementaryContent: [
          {
            label: "Offizielles Python Tutorial",
            url: "https://docs.python.org/3/tutorial/index.html",
          },
          {
            label: "Python für Anfänger (Buch, kostenlos)",
            url: "https://www.python-lernen.de/python-fuer-anfaenger.htm",
          },
          {
            label: "Google's Python Class",
            url: "https://developers.google.com/edu/python",
          },
        ],
      },
      {
        contentId: "2",
        videoUrl: "https://www.youtube.com/embed/vmEHCJofslg",
        title: "Python Pandas und Numpy Einführung",
        description:
          "Dieses Video gibt eine Einführung in die zwei wichtigsten Python-Bibliotheken für Data Science: NumPy für numerische Operationen und Pandas für Datenmanipulation und -analyse mit DataFrames.",
        supplementaryTitle: "Pandas & Numpy Ressourcen",
        supplementaryContent: [
          {
            label: "Pandas Dokumentation",
            url: "https://pandas.pydata.org/docs/",
          },
          {
            label: "Numpy Dokumentation",
            url: "https://numpy.org/doc/stable/",
          },
          {
            label: "DataCamp: Pandas Einführung",
            url: "https://www.datacamp.com/community/tutorials/pandas-tutorial-data-analysis-python",
          },
        ],
      },
    ],
    tasks: [
      {
        id: "task1",
        title: "Hello World Programm",
        description: "Schreiben Sie ein Programm, das 'Hello, World!' ausgibt.",
        difficulty: "Einfach",
      },
      {
        id: "task2",
        title: "Einfache Berechnungen",
        description: "Erstellen Sie ein Programm, das zwei Zahlen addiert.",
        difficulty: "Einfach",
      },
      {
        id: "task3",
        title: "Variablen und Datentypen",
        description:
          "Deklariere Variablen verschiedener Typen (int, float, str, bool).",
        difficulty: "Einfach",
      },
      {
        id: "task4",
        title: "Listen",
        description: "Erstelle eine Liste und greife auf ihre Elemente zu.",
        difficulty: "Einfach",
      },
      {
        id: "task5",
        title: "Dictionaries",
        description:
          "Erstelle ein Dictionary und greife auf Werte über Schlüssel zu.",
        difficulty: "Einfach",
      },
      {
        id: "task6",
        title: "Kontrollstrukturen",
        description:
          "Verwende `if`, `elif` und `else` zur Steuerung des Programmflusses.",
        difficulty: "Einfach",
      },
      {
        id: "task7",
        title: "Schleifen",
        description: "Iteriere über eine Liste mit einer `for`-Schleife.",
        difficulty: "Einfach",
      },
      {
        id: "task8",
        title: "Funktionen definieren",
        description:
          "Schreibe eine Funktion, die einen Parameter entgegennimmt und einen Wert zurückgibt.",
        difficulty: "Mittel",
      },
      {
        id: "task9",
        title: "Module importieren",
        description:
          "Importiere das `math`-Modul und verwende eine Funktion daraus.",
        difficulty: "Mittel",
      },
      {
        id: "task10",
        title: "Dateieingabe/-ausgabe",
        description: "Schreibe Text in eine Datei und lies ihn wieder aus.",
        difficulty: "Mittel",
      },
    ],
  },
  {
    id: "python_advanced",
    title: "Fortgeschrittenes Python",
    progress: 75,
    content: [
      {
        contentId: "1",
        videoUrl: "https://www.youtube.com/embed/HGOBQPFzWKo",
        title: "Fortgeschrittene Python-Konzepte",
        description:
          "Vertiefen Sie Ihr Python-Wissen mit fortgeschrittenen Themen wie Dekoratoren, Generatoren, Kontextmanagern, List Comprehensions und funktionalen Programmierkonzepten.",
        supplementaryTitle: "Weiterführende Python-Themen",
        supplementaryContent: [
          {
            label: "Real Python (Viele fortgeschrittene Artikel)",
            url: "https://realpython.com/",
          },
          {
            label: "Fluent Python (Buch)",
            url: "https://www.oreilly.com/library/view/fluent-python-2nd/9781492056348/",
          },
          {
            label: "Python Decorators - Real Python",
            url: "https://realpython.com/primer-on-python-decorators/",
          },
        ],
      },
    ],
    tasks: [
      {
        id: "task1",
        title: "Dekoratoren implementieren",
        description: "Erstellen Sie einen eigenen Dekorator in Python.",
        difficulty: "Schwer",
      },
      {
        id: "task2",
        title: "Generatoren anwenden",
        description: "Schreiben Sie eine Funktion, die Generatoren nutzt.",
        difficulty: "Schwer",
      },
      {
        id: "task3",
        title: "List Comprehensions",
        description:
          "Erstelle eine neue Liste effizient mithilfe von List Comprehensions.",
        difficulty: "Mittel",
      },
      {
        id: "task4",
        title: "Lambda Funktionen",
        description:
          "Verwende anonyme Lambda-Funktionen für einfache Operationen.",
        difficulty: "Mittel",
      },
      {
        id: "task5",
        title: "Fehlerbehandlung",
        description:
          "Implementiere `try`/`except`/`finally`-Blöcke zur Fehlerbehandlung.",
        difficulty: "Mittel",
      },
      {
        id: "task6",
        title: "OOP Grundlagen",
        description: "Definiere eine Klasse mit Attributen und Methoden.",
        difficulty: "Mittel",
      },
      {
        id: "task7",
        title: "Vererbung",
        description:
          "Erstelle eine Unterklasse, die von einer Oberklasse erbt.",
        difficulty: "Schwer",
      },
      {
        id: "task8",
        title: "Kontextmanager",
        description:
          "Schreibe eine Funktion, die das `with`-Statement verwendet (z.B. für Dateien).",
        difficulty: "Schwer",
      },
      {
        id: "task9",
        title: "Module erstellen",
        description:
          "Erstelle ein einfaches Python-Modul und importiere es in einem anderen Skript.",
        difficulty: "Mittel",
      },
      {
        id: "task10",
        title: "Virtuelle Umgebungen",
        description:
          "Erstelle und aktiviere eine virtuelle Umgebung mit `venv`.",
        difficulty: "Einfach",
      },
    ],
  },
  // Excel Module
  {
    id: "excel_basics",
    title: "Excel Grundlagen",
    progress: 90,
    content: {
      videoUrl: "https://www.youtube.com/embed/0nbkaYsR94c",
      title: "Excel für Einsteiger",
      description:
        "Ein umfassender Leitfaden für Excel-Anfänger. Lernen Sie die Benutzeroberfläche kennen, wie Sie Daten eingeben und formatieren, grundlegende Formeln (SUMME, MITTELWERT etc.) anwenden und einfache Diagramme erstellen.",
      supplementaryTitle: "Excel Lernressourcen",
      supplementaryContent: [
        {
          label: "Microsoft Excel Hilfe & Lernen",
          url: "https://support.microsoft.com/de-de/excel",
        },
        {
          label: "Excel Easy (Tutorials)",
          url: "https://www.excel-easy.com/",
        },
        {
          label: "GCFGlobal Excel Tutorial (Englisch)",
          url: "https://edu.gcfglobal.org/en/excel/",
        },
      ],
    },
    tasks: [
      {
        id: "task1",
        title: "Basisformeln anwenden",
        description: "Erstellen Sie Tabellen mit grundlegenden Formeln.",
        difficulty: "Einfach",
      },
      {
        id: "task2",
        title: "Diagramme erstellen",
        description: "Visualisieren Sie Daten mit verschiedenen Diagrammtypen.",
        difficulty: "Einfach",
      },
      {
        id: "task3",
        title: "Zellen formatieren",
        description: "Wende Zahlen-, Datums- und Textformate auf Zellen an.",
        difficulty: "Einfach",
      },
      {
        id: "task4",
        title: "Bedingte Formatierung",
        description: "Hebe Zellen hervor, die bestimmte Kriterien erfüllen.",
        difficulty: "Mittel",
      },
      {
        id: "task5",
        title: "Daten sortieren",
        description: "Sortiere eine Tabelle nach einer oder mehreren Spalten.",
        difficulty: "Einfach",
      },
      {
        id: "task6",
        title: "Daten filtern",
        description: "Verwende AutoFilter, um bestimmte Daten anzuzeigen.",
        difficulty: "Einfach",
      },
      {
        id: "task7",
        title: "Einfache Tabellen",
        description: "Strukturiere Daten in einer einfachen Excel-Tabelle.",
        difficulty: "Einfach",
      },
      {
        id: "task8",
        title: "Arbeitsblätter verwalten",
        description: "Füge neue Arbeitsblätter hinzu und benenne sie um.",
        difficulty: "Einfach",
      },
      {
        id: "task9",
        title: "Druckbereich festlegen",
        description: "Definiere den Bereich, der gedruckt werden soll.",
        difficulty: "Einfach",
      },
      {
        id: "task10",
        title: "SUMMEWENN / ZÄHLENWENN",
        description:
          "Verwende SUMMEWENN oder ZÄHLENWENN, um bedingte Berechnungen durchzuführen.",
        difficulty: "Mittel",
      },
    ],
  },
  {
    id: "excel_advanced",
    title: "Fortgeschrittenes Excel",
    progress: 60,
    content: {
      videoUrl: "https://www.youtube.com/embed/9NUjHBNWe9M",
      title: "Excel Pivot-Tabellen und -Diagramme",
      description:
        "Meistern Sie Pivot-Tabellen zur schnellen Zusammenfassung und Analyse großer Datensätze. Lernen Sie, wie Sie Daten gruppieren, filtern, berechnete Felder hinzufügen und Pivot-Diagramme erstellen.",
      supplementaryTitle: "Pivot-Tabellen & mehr",
      supplementaryContent: [
        {
          label: "Microsoft: Erstellen einer PivotTable",
          url: "https://support.microsoft.com/de-de/office/erstellen-einer-pivottable-zum-analysieren-von-arbeitsblattdaten-a9a84538-bfe9-40a9-a8e9-f99134456576",
        },
        {
          label: "Exceljet: Pivot Table Guide",
          url: "https://exceljet.net/pivot-tables",
        },
        {
          label: "Contextures Excel Tips",
          url: "https://www.contextures.com/tiptech.html",
        },
      ],
    },
    tasks: [
      {
        id: "task1",
        title: "Pivot-Tabelle erstellen",
        description: "Erstellen Sie eine Pivot-Tabelle mit einem Datensatz.",
        difficulty: "Mittel",
      },
      {
        id: "task2",
        title: "Datenanalyse durchführen",
        description:
          "Analysieren Sie komplexe Datensätze mithilfe von Excel-Tools.",
        difficulty: "Mittel",
      },
      {
        id: "task3",
        title: "SVERWEIS / WVERWEIS",
        description:
          "Suche nach Werten in Tabellen mit SVERWEIS oder WVERWEIS.",
        difficulty: "Mittel",
      },
      {
        id: "task4",
        title: "INDEX / VERGLEICH",
        description:
          "Verwende die Kombination aus INDEX und VERGLEICH für flexible Suchen.",
        difficulty: "Schwer",
      },
      {
        id: "task5",
        title: "Datentools",
        description: "Nutze 'Text in Spalten' oder 'Duplikate entfernen'.",
        difficulty: "Einfach",
      },
      {
        id: "task6",
        title: "Was-wäre-wenn-Analyse",
        description: "Verwende die Zielwertsuche oder Szenarien.",
        difficulty: "Schwer",
      },
      {
        id: "task7",
        title: "Makros aufzeichnen",
        description:
          "Zeichne ein einfaches Makro auf, um wiederkehrende Aufgaben zu automatisieren.",
        difficulty: "Schwer",
      },
      {
        id: "task8",
        title: "Datenüberprüfung",
        description: "Richte Regeln für die Dateneingabe in Zellen ein.",
        difficulty: "Mittel",
      },
      {
        id: "task9",
        title: "Power Query Grundlagen",
        description:
          "Importiere und transformiere Daten mit dem Power Query Editor.",
        difficulty: "Schwer",
      },
      {
        id: "task10",
        title: "Sparklines erstellen",
        description: "Füge kleine Diagramme direkt in Zellen ein (Sparklines).",
        difficulty: "Einfach",
      },
    ],
  },
  // Power BI Module
  {
    id: "powerbi_intro",
    title: "Einführung in Power BI",
    progress: 80,
    content: {
      videoUrl: "https://www.youtube.com/embed/AGrl-H87pRU",
      title: "Power BI für Anfänger",
      description:
        "Ein erster Einblick in Microsoft Power BI Desktop. Lernen Sie, wie Sie Daten aus verschiedenen Quellen importieren, im Power Query Editor transformieren, ein Datenmodell erstellen und interaktive Berichte mit verschiedenen Visualisierungen bauen.",
      supplementaryTitle: "Power BI Startleitfäden",
      supplementaryContent: [
        {
          label: "Microsoft Power BI Geführtes Lernen",
          url: "https://learn.microsoft.com/de-de/power-bi/learning-catalog/",
        },
        {
          label: "Power BI Grundlagen (Microsoft Learn)",
          url: "https://learn.microsoft.com/de-de/training/paths/power-bi-fundamentals/",
        },
        {
          label: "SQLBI Power BI Guides",
          url: "https://www.sqlbi.com/guides/powerbi/",
        },
      ],
    },
    tasks: [
      {
        id: "task1",
        title: "Bericht erstellen",
        description: "Erstellen Sie einen interaktiven Bericht in Power BI.",
        difficulty: "Einfach",
      },
      {
        id: "task2",
        title: "Datenmodellierung",
        description:
          "Modellieren Sie Daten und erstellen Sie Beziehungen zwischen Tabellen.",
        difficulty: "Mittel",
      },
      {
        id: "task3",
        title: "Daten aus Excel importieren",
        description: "Lade Daten aus einer Excel-Datei in Power BI.",
        difficulty: "Einfach",
      },
      {
        id: "task4",
        title: "Daten aus Datenbank importieren",
        description: "Verbinde Power BI mit einer SQL-Datenbank.",
        difficulty: "Einfach",
      },
      {
        id: "task5",
        title: "Einfache Transformationen",
        description:
          "Führe grundlegende Datenbereinigungen im Power Query Editor durch.",
        difficulty: "Mittel",
      },
      {
        id: "task6",
        title: "Visualisierungen erstellen",
        description: "Erstelle Balken-, Linien- und Tortendiagramme.",
        difficulty: "Einfach",
      },
      {
        id: "task7",
        title: "Filter und Slicer",
        description: "Füge interaktive Filter zu deinem Bericht hinzu.",
        difficulty: "Einfach",
      },
      {
        id: "task8",
        title: "Hierarchien erstellen",
        description: "Erstelle Datumshierarchien für Drilldown-Analysen.",
        difficulty: "Mittel",
      },
      {
        id: "task9",
        title: "Einfache Measures",
        description: "Schreibe einfache DAX-Measures wie SUM oder AVERAGE.",
        difficulty: "Mittel",
      },
      {
        id: "task10",
        title: "Bericht veröffentlichen",
        description: "Veröffentliche deinen Bericht im Power BI Service.",
        difficulty: "Einfach",
      },
    ],
  },
  {
    id: "powerbi_advanced",
    title: "Fortgeschrittenes Power BI",
    progress: 50,
    content: {
      videoUrl: "https://www.youtube.com/embed/lVx4nbDmz1w",
      title: "DAX und Datenmodellierung in Power BI",
      description:
        "Vertiefen Sie Ihr Power BI Wissen mit Fokus auf DAX (Data Analysis Expressions) zur Erstellung komplexer Berechnungen und Measures. Behandelt außerdem fortgeschrittene Techniken der Datenmodellierung für optimale Performance und Analyse.",
      supplementaryTitle: "DAX & Modellierung",
      supplementaryContent: [
        {
          label: "DAX Guide (SQLBI)",
          url: "https://dax.guide/",
        },
        {
          label: "Microsoft DAX Referenz",
          url: "https://learn.microsoft.com/de-de/dax/dax-function-reference",
        },
        {
          label: "Datenmodellierung in Power BI (RADACAD)",
          url: "https://radacad.com/data-modeling-in-power-bi",
        },
      ],
    },
    tasks: [
      {
        id: "task1",
        title: "DAX Formeln schreiben",
        description:
          "Schreiben Sie DAX Formeln zur Berechnung komplexer Kennzahlen.",
        difficulty: "Mittel",
      },
      {
        id: "task2",
        title: "Erweiterte Datenmodellierung",
        description: "Erstellen Sie ein optimiertes Datenmodell in Power BI.",
        difficulty: "Schwer",
      },
      {
        id: "task3",
        title: "CALCULATE Funktion",
        description: "Verstehe und wende die mächtige CALCULATE-Funktion an.",
        difficulty: "Schwer",
      },
      {
        id: "task4",
        title: "Time Intelligence",
        description: "Nutze Zeitintelligenzfunktionen wie SAMEPERIODLASTYEAR.",
        difficulty: "Schwer",
      },
      {
        id: "task5",
        title: "Row-Level Security",
        description: "Implementiere Sicherheit auf Zeilenebene.",
        difficulty: "Schwer",
      },
      {
        id: "task6",
        title: "Erweiterte Power Query",
        description:
          "Führe komplexere Transformationen im Power Query Editor durch.",
        difficulty: "Mittel",
      },
      {
        id: "task7",
        title: "Bookmarks verwenden",
        description:
          "Erstelle Bookmarks, um bestimmte Ansichten im Bericht zu speichern.",
        difficulty: "Mittel",
      },
      {
        id: "task8",
        title: "Benutzerdefinierte Visuals",
        description:
          "Importiere und verwende Visualisierungen aus dem Marketplace.",
        difficulty: "Mittel",
      },
      {
        id: "task9",
        title: "Dataflows erstellen",
        description:
          "Erstelle und nutze Dataflows zur Wiederverwendung von Daten.",
        difficulty: "Schwer",
      },
      {
        id: "task10",
        title: "Performance Tuning",
        description: "Analysiere und optimiere die Leistung deines Berichts.",
        difficulty: "Schwer",
      },
    ],
  },
  // SQL Module
  {
    id: "sql_basics",
    title: "SQL Grundlagen",
    progress: 85,
    content: {
      videoUrl: "https://www.youtube.com/embed/7S_tz1z_5bA",
      title: "SQL für Einsteiger",
      description:
        "Lernen Sie die Grundlagen von SQL (Structured Query Language), der Standardsprache für die Kommunikation mit relationalen Datenbanken. Behandelt werden SELECT-Anweisungen, WHERE-Klauseln, ORDER BY, grundlegende Aggregatfunktionen und einfache JOINs.",
      supplementaryTitle: "SQL Tutorials",
      supplementaryContent: [
        {
          label: "SQLBolt (Interaktives Lernen)",
          url: "https://sqlbolt.com/",
        },
        {
          label: "W3Schools SQL Tutorial",
          url: "https://www.w3schools.com/sql/",
        },
        {
          label: "SQLZoo (Interaktives Lernen)",
          url: "https://sqlzoo.net/wiki/SQL_Tutorial",
        },
      ],
    },
    tasks: [
      {
        id: "task1",
        title: "Grundlegende SELECT-Abfrage",
        description: "Schreiben Sie eine einfache SELECT-Abfrage.",
        difficulty: "Einfach",
      },
      {
        id: "task2",
        title: "Daten filtern",
        description: "Verwenden Sie WHERE-Klauseln, um Daten zu filtern.",
        difficulty: "Einfach",
      },
      {
        id: "task3",
        title: "ORDER BY",
        description: "Sortiere die Ergebnisse einer Abfrage.",
        difficulty: "Einfach",
      },
      {
        id: "task4",
        title: "Aggregatfunktionen",
        description: "Verwende COUNT, SUM, AVG, MIN, MAX.",
        difficulty: "Einfach",
      },
      {
        id: "task5",
        title: "GROUP BY",
        description: "Gruppiere Zeilen basierend auf Werten in Spalten.",
        difficulty: "Mittel",
      },
      {
        id: "task6",
        title: "HAVING",
        description: "Filtere gruppierte Ergebnisse.",
        difficulty: "Mittel",
      },
      {
        id: "task7",
        title: "INNER JOIN",
        description:
          "Kombiniere Zeilen aus zwei Tabellen basierend auf einer Bedingung.",
        difficulty: "Mittel",
      },
      {
        id: "task8",
        title: "Alias",
        description: "Verwende AS, um Tabellen oder Spalten umzubenennen.",
        difficulty: "Einfach",
      },
      {
        id: "task9",
        title: "DISTINCT",
        description: "Entferne doppelte Zeilen aus den Ergebnissen.",
        difficulty: "Einfach",
      },
      {
        id: "task10",
        title: "LIKE Operator",
        description: "Suche nach Mustern in Zeichenketten.",
        difficulty: "Mittel",
      },
    ],
  },
  {
    id: "sql_advanced",
    title: "Fortgeschrittenes SQL",
    progress: 70,
    content: {
      videoUrl: "https://www.youtube.com/embed/p3qvj9hO_Bo",
      title: "Komplexe Abfragen und Optimierung",
      description:
        "Erweitern Sie Ihre SQL-Kenntnisse mit fortgeschrittenen Themen wie verschiedenen JOIN-Typen (LEFT, RIGHT, FULL), Subqueries, Common Table Expressions (CTEs), Window Functions und Grundlagen der Abfrageoptimierung.",
      supplementaryTitle: "Fortgeschrittene SQL-Techniken",
      supplementaryContent: [
        {
          label: "Mode Analytics: Advanced SQL Tutorial",
          url: "https://mode.com/sql-tutorial/advanced-sql/",
        },
        {
          label: "PostgreSQL Tutorial: Window Functions",
          url: "https://www.postgresqltutorial.com/postgresql-window-function/",
        },
        {
          label: "Use The Index, Luke! (SQL Indexing)",
          url: "https://use-the-index-luke.com/",
        },
      ],
    },
    tasks: [
      {
        id: "task1",
        title: "Komplexe Joins",
        description: "Erstellen Sie Abfragen mit mehreren Joins.",
        difficulty: "Mittel",
      },
      {
        id: "task2",
        title: "Index-Optimierung",
        description: "Optimieren Sie Abfragen durch den Einsatz von Indizes.",
        difficulty: "Schwer",
      },
      {
        id: "task3",
        title: "Weitere JOIN Typen",
        description: "Verwende LEFT JOIN, RIGHT JOIN und FULL OUTER JOIN.",
        difficulty: "Mittel",
      },
      {
        id: "task4",
        title: "Subqueries",
        description: "Schreibe Abfragen innerhalb von anderen Abfragen.",
        difficulty: "Schwer",
      },
      {
        id: "task5",
        title: "Common Table Expressions (CTEs)",
        description: "Verwende die WITH-Klausel für lesbarere Abfragen.",
        difficulty: "Schwer",
      },
      {
        id: "task6",
        title: "Window Functions",
        description: "Nutze Fensterfunktionen wie ROW_NUMBER oder RANK.",
        difficulty: "Schwer",
      },
      {
        id: "task7",
        title: "Stored Procedures",
        description: "Erstelle eine einfache Stored Procedure.",
        difficulty: "Mittel",
      },
      {
        id: "task8",
        title: "Transaktionen",
        description: "Verstehe BEGIN, COMMIT und ROLLBACK.",
        difficulty: "Mittel",
      },
      {
        id: "task9",
        title: "Views",
        description:
          "Erstelle eine View, um eine komplexe Abfrage zu speichern.",
        difficulty: "Mittel",
      },
      {
        id: "task10",
        title: "CASE Anweisungen",
        description:
          "Implementiere bedingte Logik innerhalb einer SELECT-Anweisung.",
        difficulty: "Mittel",
      },
    ],
  },
  {
    id: "webdev_intro",
    title: "Einführung in Webentwicklung",
    progress: 30,
    content: [
      {
        contentId: "1",
        videoUrl: "https://www.youtube.com/embed/pQN-pnXPaVg",
        title: "Was ist HTML, CSS und JS?",
        description:
          "Ein grundlegender Überblick über die drei Kerntechnologien des Frontends: HTML für die Struktur, CSS für das Styling und JavaScript für die Interaktivität von Webseiten.",
        supplementaryTitle: "Grundlegende Web-Dokumentation",
        supplementaryContent: [
          {
            label: "MDN Web Docs: Erste Schritte",
            url: "https://developer.mozilla.org/de/docs/Learn/Getting_started_with_the_web",
          },
          {
            label: "freeCodeCamp: Responsive Web Design",
            url: "https://www.freecodecamp.org/learn/responsive-web-design/",
          },
        ],
      },
      {
        contentId: "2",
        videoUrl: "https://www.youtube.com/embed/UB1O30fR-EE",
        title: "Erste Website mit HTML",
        description:
          "Eine praktische Anleitung zum Erstellen Ihrer ersten einfachen Webseite nur mit HTML. Lernen Sie die wichtigsten Tags und wie man ein grundlegendes Dokument strukturiert.",
        supplementaryTitle: "HTML Praxis",
        supplementaryContent: [
          {
            label: "MDN: Dein erstes HTML Dokument",
            url: "https://developer.mozilla.org/de/docs/Learn/HTML/Introduction_to_HTML/Getting_started",
          },
          {
            label: "HTML Cheatsheet",
            url: "https://htmlcheatsheet.com/",
          },
        ],
      },
      {
        contentId: "3",
        videoUrl: "https://www.youtube.com/embed/yfoY53QXEnI",
        title: "CSS Grundlagen",
        description:
          "Einführung in Cascading Style Sheets (CSS). Lernen Sie, wie Sie CSS verwenden, um das Aussehen Ihrer HTML-Elemente zu gestalten, einschließlich Farben, Schriftarten, Abständen und dem Box Model.",
        supplementaryTitle: "CSS Styling Ressourcen",
        supplementaryContent: [
          {
            label: "MDN: CSS Erste Schritte",
            url: "https://developer.mozilla.org/de/docs/Learn/CSS/First_steps",
          },
          {
            label: "CSS Reference (Codrops)",
            url: "https://tympanus.net/codrops/css_reference/",
          },
          {
            label: "W3Schools CSS Tutorial",
            url: "https://www.w3schools.com/css/",
          },
        ],
      },
    ],
    tasks: [
      {
        id: "task1",
        title: "HTML Grundgerüst bauen",
        description: "Baue ein Grundgerüst für eine Webseite mit HTML.",
        difficulty: "Einfach",
      },
      {
        id: "task2",
        title: "HTML Listen",
        description:
          "Erstelle eine geordnete und eine ungeordnete Liste in HTML.",
        difficulty: "Einfach",
      },
      {
        id: "task3",
        title: "HTML Tabellen",
        description:
          "Stelle tabellarische Daten mit dem `<table>`-Element dar.",
        difficulty: "Einfach",
      },
      {
        id: "task4",
        title: "HTML Formulare",
        description:
          "Erstelle ein einfaches Formular mit Eingabefeldern und einem Button.",
        difficulty: "Einfach",
      },
      {
        id: "task5",
        title: "Bilder einfügen",
        description:
          "Füge ein Bild mit dem `<img>`-Tag in deine HTML-Seite ein.",
        difficulty: "Einfach",
      },
      {
        id: "task6",
        title: "Links erstellen",
        description: "Verlinke zu einer anderen Webseite mit dem `<a>`-Tag.",
        difficulty: "Einfach",
      },
      {
        id: "task7",
        title: "Semantisches HTML",
        description:
          "Strukturiere deine Seite mit `<header>`, `<nav>` und `<footer>`.",
        difficulty: "Mittel",
      },
      {
        id: "task8",
        title: "HTML Kommentare",
        description: "Füge Kommentare zu deinem HTML-Code hinzu.",
        difficulty: "Einfach",
      },
      {
        id: "task9",
        title: "HTML Attribute",
        description:
          "Verwende `class`- und `id`-Attribute zur Identifizierung von Elementen.",
        difficulty: "Mittel",
      },
      {
        id: "task10",
        title: "Grundlegende CSS Selektoren",
        description:
          "Style Elemente basierend auf ihrem Tag-Namen, ihrer Klasse oder ID.",
        difficulty: "Mittel",
      },
    ],
  },
];

export default modulesObj;
