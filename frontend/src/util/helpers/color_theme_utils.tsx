// Gibt den Hexcode für eine in index.css definierte Color-Variable zurück
// (z.B. #ff6d25 für "--color-dsp-orange")
export function getDspThemeColorCode(colorName: string): string {
  return getComputedStyle(document.documentElement)
    .getPropertyValue(`--color-${colorName}`)
    .trim();
}
