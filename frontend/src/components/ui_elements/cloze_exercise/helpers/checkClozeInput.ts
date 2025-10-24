export const userInputMatchesCorrectAnswer = (
  userInput: string,
  correct: string[],
) => {
  return correct.some((c) => {
    const normalizedCorrectAnswer = c.trim().toLowerCase();
    const normalizeUserAnswer = userInput.trim().toLowerCase();
    return normalizedCorrectAnswer === normalizeUserAnswer;
  });
};