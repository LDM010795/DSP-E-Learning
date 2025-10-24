import { ClozePartDragDrop, ClozePartTextInput } from "./ClozeExerciseBase";
import ClozeExerciseDragDrop from "./ClozeExerciseDragDrop";
import ClozeExerciseTextInput from "./ClozeExerciseTextInput";

// 1) NORMAL (minimal – nutzt defaults: mode='text')
export function FindErrorsExample() {
  const text: ClozePartTextInput[] = [
    {
      type: "text",
      text:
        'values = ["10", "3", "7", "x", "2"]\n' +
        "total = 0\n" +
        "converted: list[int] = []\n\n" +
        "for i, raw in ",
    },
    // FEHLER 1: 'range' → muss 'enumerate' sein
    { type: "blank", correct: ["enumerate"], initialValue: "range" },
    {
      type: "text",
      text: "(values):\n" + "    try:\n" + "        n = ",
    },
    // FEHLER 2: 'float' → muss 'int' sein (Retypisierung str→int)
    { type: "blank", correct: ["int"], initialValue: "float" },
    {
      type: "text",
      text:
        "(raw)\n" +
        "    except ValueError:\n" +
        "        continue\n" +
        "    total += n\n" +
        "    converted.",
    },
    // FEHLER 3: 'extend' → muss 'append' sein (sonst TypeError bei int)
    { type: "blank", correct: ["append"], initialValue: "extend" },
    {
      type: "text",
      text:
        "(n)\n\n" +
        "avg = total / len(converted) if converted else 0\n" +
        'print(f"sum={total}, avg={avg:.2f}")\n',
    },
  ];

  return (
    <ClozeExerciseTextInput
      title="Python: For-Schleife & Retypisierung – schwere Variante"
      display_mode="code"
      languageLabel="Python"
      clozeText={text}
      onSubmit={() => console.log("✅ Abgabe erfolgreich")}
    />
  );
}

// 2) NORMAL MIT LÖSUNGSWÖRTERN (inkl. falscher Kandidaten)
export function ExampleNormalWithBank() {
  const text: ClozePartDragDrop[] = [
    { type: "text", text: "Der schnellste Landlaufvogel ist der " },
    { type: "blank", correct: ["Strauß", "Ostrich"] },
    { type: "text", text: "." },
  ];

  return (
    <ClozeExerciseDragDrop
      title="Zieh das richtige Wort in die Lücke:"
      clozeText={text}
      wrongSolutionWords={["Pinguin", "Falke", "Emu"]}
      onSubmit={() => console.log("✔️ Normal mit Wordbank korrekt")}
    />
  );
}

// 3) NORMAL OHNE LÖSUNGSWÖRTER (explizit gesetzt)
export function ExampleNormalNoBank() {
  const text: ClozePartTextInput[] = [
    { type: "text", text: "2 + 2 = " },
    { type: "blank", correct: ["4", "vier"], initialValue: "" },
  ];

  return (
    <ClozeExerciseTextInput
      title="Trage das Ergebnis ein:"
      clozeText={text}
      onSubmit={() => console.log("✔️ Normal ohne Wordbank korrekt")}
    />
  );
}

// 4) CODE MIT LÖSUNGSWÖRTERN
export function ExampleCodeWithBank() {
  const code: ClozePartDragDrop[] = [
    { type: "text", text: "function add(a, b) {\n  " },
    { type: "blank", correct: ["return"] },
    { type: "text", text: " a + b;\n" },
    { type: "blank", correct: ["}"] },
    { type: "text", text: "// Nutzung:\n\n" },
    { type: "text", text: "const result = " },
    { type: "blank", correct: ["add"] },
    { type: "text", text: "(2, 3);" },
  ];

  return (
    <ClozeExerciseDragDrop
      title="Vervollständige die fehlenden Tokens:"
      clozeText={code}
      display_mode="code"
      languageLabel="JavaScript"
      wrongSolutionWords={["const", "let", "sum", "export"]}
      onSubmit={() => console.log("✔️ Code mit Wordbank korrekt")}
    />
  );
}

// 5) CODE OHNE LÖSUNGSWÖRTER
export function ExampleCodeNoBank() {
  const code: ClozePartTextInput[] = [
    { type: "text", text: "type Point = {\n  x: number;\n  y: number;\n}\n\n" },
    { type: "text", text: "function distance(p1: Point, p2: Point) {\n  " },
    { type: "blank", correct: ["const"], initialValue: "" },
    { type: "text", text: " dx = p1.x - p2.x;\n  " },
    { type: "blank", correct: ["const"], initialValue: "" },
    { type: "text", text: " dy = p1.y - p2.y;\n  " },
    { type: "blank", correct: ["return"], initialValue: "" },
    { type: "text", text: " Math.hypot(dx, dy);\n}\n" },
  ];

  return (
    <ClozeExerciseDragDrop
      title="Fülle fehlende Schlüsselwörter ein:"
      clozeText={code}
      display_mode="code"
      languageLabel="TypeScript"
      onSubmit={() => console.log("✔️ Code ohne Wordbank korrekt")}
    />
  );
}

export function ExampleComplexCodeWithBank() {
  const code: ClozePartDragDrop[] = [
    { type: "text", text: "export " },
    { type: "blank", correct: ["async"] },
    { type: "text", text: " function fetchUsers(): " },
    { type: "blank", correct: ["Promise"] },
    { type: "text", text: "<" },
    { type: "blank", correct: ["User"] },
    { type: "text", text: "[]> {\n  " },

    { type: "blank", correct: ["try"] },
    { type: "text", text: " {\n    " },

    { type: "blank", correct: ["const"] },
    { type: "text", text: " res = " },

    { type: "blank", correct: ["await"] },
    { type: "text", text: " " },

    { type: "blank", correct: ["fetch"] },
    { type: "text", text: "('/api/users');\n    if (!res.ok) { " },

    { type: "blank", correct: ["throw"] },
    { type: "text", text: " new " },

    { type: "blank", correct: ["Error"] },
    { type: "text", text: "('Request failed'); }\n    " },

    { type: "blank", correct: ["const"] },
    { type: "text", text: " data = " },

    { type: "blank", correct: ["await"] },
    { type: "text", text: " res." },

    { type: "blank", correct: ["json"] },
    { type: "text", text: "();\n    " },

    { type: "blank", correct: ["return"] },
    { type: "text", text: " data." },

    { type: "blank", correct: ["map"] },
    { type: "text", text: "(u => ({ id: u.id, name: u.name }));\n  } " },

    { type: "blank", correct: ["catch"] },
    { type: "text", text: " (e) {\n    console.error(e);\n    " },

    { type: "blank", correct: ["return"] },
    { type: "text", text: " [];\n  }\n}\n\n" },

    { type: "text", text: "type " },
    { type: "blank", correct: ["User"] },
    { type: "text", text: " = { id: number; name: string };\n" },
  ];

  return (
    <ClozeExerciseDragDrop
      title="Komplex: API-Call mit Fehlerbehandlung (TypeScript)"
      clozeText={code}
      display_mode="code"
      languageLabel="TypeScript"
      wrongSolutionWords={[]}
      onSubmit={() => console.log("✔️ Komplexes Code-Cloze korrekt")}
    />
  );
}

export function HL_JavaScript() {
  const code: ClozePartDragDrop[] = [
    { type: "text", text: "function add(a, b) {\n  " },
    { type: "blank", correct: ["return"] },
    { type: "text", text: " a + b;\n}\n" },
  ];
  return (
    <ClozeExerciseDragDrop
      title="JS Highlight: return"
      clozeText={code}
      display_mode="code"
      languageLabel="JavaScript"
      wrongSolutionWords={["const", "let", "export"]}
      onSubmit={() => console.log("JS ok")}
    />
  );
}

/* 2) TypeScript */
export function HL_TypeScript() {
  const code: ClozePartDragDrop[] = [
    { type: "text", text: "type Point = { x: number; y: number };\n" },
    { type: "text", text: "function dist(p1: Point, p2: Point): " },
    { type: "blank", correct: ["number"] },
    { type: "text", text: " {\n  " },
    { type: "blank", correct: ["return"] },
    { type: "text", text: " Math.hypot(p1.x - p2.x, p1.y - p2.y);\n}\n" },
  ];
  return (
    <ClozeExerciseDragDrop
      title="TS Highlight: number/return"
      clozeText={code}
      display_mode="code"
      languageLabel="TypeScript"
      wrongSolutionWords={["string", "boolean", "const"]}
      onSubmit={() => console.log("TS ok")}
    />
  );
}

/* 3) TSX (React + TypeScript) */
export function HL_TSX() {
  const code: ClozePartDragDrop[] = [
    { type: "text", text: "type Props = { label: string };\n" },
    {
      type: "text",
      text: "export default function Button({ label }: Props) {\n  ",
    },
    { type: "blank", correct: ["return"] },
    { type: "text", text: " (<button>{label}</button>);\n}\n" },
  ];
  return (
    <ClozeExerciseDragDrop
      title="TSX Highlight: JSX + return"
      clozeText={code}
      display_mode="code"
      languageLabel="TSX"
      wrongSolutionWords={["const", "type", "interface"]}
      onSubmit={() => console.log("TSX ok")}
    />
  );
}

/* 4) JSX (React + JavaScript) */
export function HL_JSX() {
  const code: ClozePartDragDrop[] = [
    { type: "text", text: "function Hello() {\n  " },
    { type: "blank", correct: ["return"] },
    { type: "text", text: " (<h1>Hello World</h1>);\n}\n" },
  ];
  return (
    <ClozeExerciseDragDrop
      title="JSX Highlight: JSX + return"
      clozeText={code}
      display_mode="code"
      languageLabel="JSX"
      wrongSolutionWords={["const", "export", "class"]}
      onSubmit={() => console.log("JSX ok")}
    />
  );
}

/* 5) Python */
export function HL_Python() {
  const code: ClozePartDragDrop[] = [
    { type: "text", text: "def add(a, b):\n    " },
    { type: "blank", correct: ["return"] },
    { type: "text", text: " a + b\n" },
  ];
  return (
    <ClozeExerciseDragDrop
      title="Python Highlight: return"
      clozeText={code}
      display_mode="code"
      languageLabel="Python"
      wrongSolutionWords={["pass", "yield", "class"]}
      onSubmit={() => console.log("Python ok")}
    />
  );
}

/* 6) CSS */
export function HL_CSS() {
  const code: ClozePartDragDrop[] = [
    { type: "text", text: ".btn {\n  " },
    { type: "blank", correct: ["display"] },
    { type: "text", text: ": " },
    { type: "blank", correct: ["flex"] },
    { type: "text", text: ";\n}\n" },
  ];
  return (
    <ClozeExerciseDragDrop
      title="CSS Highlight: property + value"
      clozeText={code}
      display_mode="code"
      languageLabel="CSS"
      wrongSolutionWords={["grid", "color", "background"]}
      onSubmit={() => console.log("CSS ok")}
    />
  );
}
