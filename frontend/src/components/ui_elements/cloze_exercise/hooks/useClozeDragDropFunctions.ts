import { useMemo, useState, useCallback } from "react";
import type { BlankWithId } from "./useClozeDragDropParts";

export type SolutionWord = { id: string; word: string; available: boolean };

function buildBaseWords(blanks: BlankWithId[], wrong: string[]) {
  const words = [
    ...blanks.map((b) => b.correct[0]).filter(Boolean),
    ...wrong,
  ].sort((a, z) => a.localeCompare(z, "de"));

  // stabile IDs: Wort + Vorkommnis
  const seen = new Map<string, number>();
  return words.map((w) => {
    const n = (seen.get(w) ?? 0) + 1;
    seen.set(w, n);
    return { id: `${w}#${n}`, word: w };
  });
}

export function useClozeDragDropFunctions(
  blanks: BlankWithId[],
  wrongSolutionWords: string[],
) {
  // Nur Antworten im State (blankId -> wordId)
  const [answers, setAnswers] = useState<Record<string, string>>({});

  // Basiseinträge (ohne available)
  const base = useMemo(
    () => buildBaseWords(blanks, wrongSolutionWords),
    [blanks, wrongSolutionWords],
  );

  // Bank inklusive "available" aus den Antworten abgeleitet
  const solutionWords: SolutionWord[] = useMemo(() => {
    const used = new Set(Object.values(answers));
    return base.map(({ id, word }) => ({ id, word, available: !used.has(id) }));
  }, [base, answers]);

  // Nutzertext (für Bewertung) — holt das Wort zur gewählten wordId
  const getUserAnswerText = useCallback(
    (blankId: string) => {
      const wordId = answers[blankId];
      if (!wordId) return "";
      // schneller Lookup:
      const found = base.find((w) => w.id === wordId);
      return found?.word ?? "";
    },
    [answers, base],
  );

  // Aktionen
  const dropIntoBlank = useCallback((blankId: string, wordId: string) => {
    setAnswers((prev) => {
      const next = { ...prev };
      // Wort ggf. aus anderer Lücke entfernen (ein Wort nur einmal)
      for (const [b, w] of Object.entries(prev)) {
        if (w === wordId) delete next[b];
      }
      next[blankId] = wordId;
      return next;
    });
  }, []);

  const clearBlank = useCallback((blankId: string) => {
    setAnswers((prev) => {
      if (!(blankId in prev)) return prev;
      const next = { ...prev };
      delete next[blankId];
      return next;
    });
  }, []);

  const returnToBank = useCallback((wordId: string) => {
    setAnswers((prev) => {
      const next = { ...prev };
      for (const [b, w] of Object.entries(prev)) {
        if (w === wordId) delete next[b];
      }
      return next;
    });
  }, []);

  const quickPlace = useCallback(
    (wordId: string) => {
      const firstEmpty = blanks.find((b) => !answers[b.id]);
      if (firstEmpty) dropIntoBlank(firstEmpty.id, wordId);
    },
    [answers, blanks, dropIntoBlank],
  );

  const allFilled = useMemo(
    () => blanks.every((b) => getUserAnswerText(b.id).trim().length > 0),
    [blanks, getUserAnswerText],
  );

  return {
    answers,
    solutionWords,
    actions: { dropIntoBlank, clearBlank, returnToBank, quickPlace },
    derived: { getUserAnswerText, allFilled },
  };
}
