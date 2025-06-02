/**
 * Formatiert ein Datum (String oder Date-Objekt) in ein lesbares deutsches Format.
 * @param dateString Das zu formatierende Datum (ISO-String, Date-Objekt oder null).
 * @param options Formatierungsoptionen (optional).
 * @returns Formatierter Datumsstring oder "N/A".
 */
export const formatDate = (
  dateString: string | Date | null | undefined,
  options?: Intl.DateTimeFormatOptions
): string => {
  if (!dateString) return "N/A";

  const defaultOptions: Intl.DateTimeFormatOptions = {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    ...options, // Überschreibe Defaults mit spezifischen Optionen
  };

  try {
    const date =
      typeof dateString === "string" ? new Date(dateString) : dateString;
    // Prüfen ob das Datum gültig ist
    if (isNaN(date.getTime())) {
      console.warn("Ungültiges Datum übergeben:", dateString);
      return "Ungültig";
    }
    return new Intl.DateTimeFormat("de-DE", defaultOptions).format(date);
  } catch (e) {
    console.error("Fehler beim Formatieren des Datums:", dateString, e);
    return "Fehler";
  }
};
