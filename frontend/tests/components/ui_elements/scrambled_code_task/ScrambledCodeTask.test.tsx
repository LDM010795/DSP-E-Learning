import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

/**
 * Hilfsfunktion: Modul mit gewünschtem scramble-Mock laden.
 * Wir mocken *nur* ./helper/codeLinesHelper, um deterministisches Verhalten
 * zu bekommen (keine Flakiness durch Zufall). Der Rest wird normal gerendert.
 */
async function renderWithScrambleMock(
  mockImpl: (codeLines: string[]) => string[],
  props?: any,
) {
  vi.resetModules();
  vi.doMock(
    "@/components/ui_elements/scrambled_code_task/helper/codeLinesHelper",
    async () => {
      const actual = await vi.importActual<
        typeof import("@/components/ui_elements/scrambled_code_task/helper/codeLinesHelper")
      >("@/components/ui_elements/scrambled_code_task/helper/codeLinesHelper");

      // Nur scramble ersetzen, den Rest übernehmen
      return {
        ...actual,
        scramble: (codeLines: string[]) => mockImpl(codeLines),
      };
    },
  );

  const mod = await import(
    "@/components/ui_elements/scrambled_code_task/ScrambledCodeTask"
  );
  const ScrambledCodeTask = mod.default;

  const defaultProps = {
    title: "Ordne die Codezeilen in der korrekten Reihenfolge an:",
    codeToScramble: [
      "const a = 1;",
      "const b = 2;",
      "const sum = a + b;",
      "console.log(sum);",
    ],
    codeLanguage: "typescript",
  };

  return render(<ScrambledCodeTask {...defaultProps} {...props} />);
}

describe("ScrambledCodeTask", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rendert die wesentlichen Bestandteile (Header, Editor/Dateiname, Button)", async () => {
    // scramble = Reverse, damit wir später weitere Tests machen können
    await renderWithScrambleMock((codeLines: string[]) =>
      [...codeLines].reverse(),
    );

    // Header-Titel sichtbar
    expect(
      screen.getByText("Ordne die Codezeilen in der korrekten Reihenfolge an:"),
    ).toBeInTheDocument();

    // Der Editor zeigt den Dateinamen (gemäß Komponente filename="snippet.ts")
    expect(screen.getByText(/snippet\.ts/i)).toBeInTheDocument();

    // Ein Submit-Button ist vorhanden (TaskSubmitButton)
    const button = screen.getByTestId("task-submit");
    expect(button).toBeInTheDocument();
  });

  it("stellt sicher, dass die Zeilen initial NICHT in der korrekten Reihenfolge sind", async () => {
    // Reverse: garantiert andere Reihenfolge als Original
    const { container } = await renderWithScrambleMock((codeLines: string[]) =>
      [...codeLines].reverse(),
    );

    const text = container.textContent ?? "";

    // Wir prüfen, dass 'const a = 1;' NACH 'console.log(sum);' auftaucht (also vertauscht)
    const idxA = text.indexOf("const a = 1;");
    const idxLast = text.indexOf("console.log(sum);");

    expect(idxA).toBeGreaterThan(-1);
    expect(idxLast).toBeGreaterThan(-1);
    // in der korrekten Reihenfolge wäre idxA < idxLast; durch Reverse ist es andersherum
    expect(idxA).toBeGreaterThan(idxLast);
  });

  it("erkennt eine korrekte Lösung sofort als richtig und ruft onSubmit auf", async () => {
    const onSubmit = vi.fn();

    // Identität: keine Vertauschung -> bereits korrekt
    await renderWithScrambleMock(<T,>(codeLines: T[]) => [...codeLines], {
      onSubmit,
    });

    const button = screen.getByTestId("task-submit");
    await userEvent.click(button);

    // onSubmit wird bei Erfolg aufgerufen
    expect(onSubmit).toHaveBeenCalledTimes(1);

    // Es sollte KEINE Fehlermeldung (❌) erscheinen
    const errorIcon = screen.queryByText(/❌/);
    expect(errorIcon).toBeNull();
  });

  it("zeigt bei falscher Reihenfolge eine sinnvolle Fehlermeldung mit LIS/MinMoves an", async () => {
    // Reverse: bei 4 Zeilen ist LIS = 1, minMoves = 3
    await renderWithScrambleMock((codeLines: string[]) =>
      [...codeLines].reverse(),
    );

    const button = screen.getByTestId("task-submit");
    await userEvent.click(button);

    // Die Komponente erzeugt eine Fehlermeldung in der Form:
    // "❌ X von N Zeilen in korrekter Reihenfolge · mindestens Y Verschiebung(en) nötig."
    // Für Reverse bei 4 Zeilen: X=1, N=4, Y=3
    expect(
      await screen.findByText(
        /❌\s*1\s*von\s*4\s*Zeilen.*mindestens\s*3\s*Verschiebung/i,
      ),
    ).toBeInTheDocument();
  });

  it("arbeitet mit benutzerdefiniertem Titel und anderer Sprache", async () => {
    const title = "Sortiere das Snippet korrekt!";
    const codeLanguage = "javascript";

    await renderWithScrambleMock(
      <T,>(codeLines: T[]) => [...codeLines].reverse(),
      {
        title,
        codeLanguage,
      },
    );

    expect(screen.getByText(title)).toBeInTheDocument();
    // Wir prüfen hier nicht das Syntax-Highlighting, aber dass weiterhin der Dateiname sichtbar ist.
    expect(screen.getByText(/snippet\.ts/i)).toBeInTheDocument();
  });

  it("ruft onSubmit NICHT auf, wenn die Reihenfolge falsch ist", async () => {
    const onSubmit = vi.fn();
    await renderWithScrambleMock(
      (codeLines: string[]) => [...codeLines].reverse(),
      {
        onSubmit,
      },
    );

    const button = screen.getByTestId("task-submit");
    await userEvent.click(button);

    expect(onSubmit).not.toHaveBeenCalled();
  });
});

describe("LIS/MinMoves – Varianten", () => {
  const cases: { order: number[]; lis: number; minMoves: number }[] = [
    { order: [1, 2, 4, 3], lis: 3, minMoves: 1 },
    { order: [2, 3, 4, 1], lis: 3, minMoves: 1 },
    { order: [1, 3, 2, 4], lis: 3, minMoves: 1 },
    { order: [3, 1, 2, 4], lis: 3, minMoves: 1 },
    { order: [2, 1, 4, 3], lis: 2, minMoves: 2 },
    { order: [3, 4, 1, 2], lis: 2, minMoves: 2 },
    { order: [4, 3, 2, 1], lis: 1, minMoves: 3 },
  ];

  cases.forEach(({ order, lis, minMoves }) => {
    it("LIS/MinMoves – Varianten", async () => {
      // deterministisches scramble: nach 'order' anordnen
      await renderWithScrambleMock((lines: any[]) => {
        const byId: Record<string, any> = Object.fromEntries(
          lines.map((l: any) => [l.id, l]),
        );
        const ids = order.map((i) => `line-${i}`); // 1-basiert
        return ids.map((id) => byId[id]);
      });

      const button = screen.getByTestId("task-submit");
      await userEvent.click(button);

      // "❌ X von 4 Zeilen ... mindestens Y Verschiebung(en) nötig."
      const re = new RegExp(
        `❌\\s*${lis}\\s*von\\s*4\\s*Zeilen.*mindestens\\s*${minMoves}\\s*Verschiebung`,
        "i",
      );
      expect(await screen.findByText(re)).toBeInTheDocument();
    });
  });
});
