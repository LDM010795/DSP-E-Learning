import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import api from "../util/apis/api";
import { useAuth } from "./AuthContext";

// Typ-Definitionen für Exam-bezogene Daten
export interface Criterion {
  id: number;
  title: string;
  description: string;
  max_points: number;
}

// NEU: Interface für Prüfungsanforderungen
export interface ExamRequirement {
  id: number;
  description: string;
  order: number;
}

export interface Module {
  id: number;
  title: string;
  updated_at: string;
  modules: Module[];
  criteria: Criterion[];
  requirements: ExamRequirement[]; // NEU: Anforderungen hinzufügen
}

export interface Exam {
  id: number;
  exam_title: string;
  exam_description: string;
  exam_difficulty: "easy" | "medium" | "hard";
  exam_duration_week: number;
  created_at: string;
  updated_at: string;
  modules: Module[];
  criteria: Criterion[];
  requirements?: ExamRequirement[]; // Hinzugefügt als optional
}

// Einfacher User-Typ entsprechend UserSerializer
interface SimpleUser {
  id: number;
  username: string;
  first_name?: string;
  last_name?: string;
  email?: string;
}

export interface CriterionScore {
  id: number;
  criterion: Criterion;
  achieved_points: number;
}

// NEU: ExamAttachment Typ (falls noch nicht global vorhanden)
export interface ExamAttachment {
  id: number;
  file: string;
  uploaded_at?: string;
}

export interface ExamAttempt {
  id: number;
  exam: Exam;
  user: SimpleUser; // Verwende SimpleUser
  status: "started" | "submitted" | "graded";
  started_at: string;
  submitted_at: string | null;
  graded_at: string | null;
  score: number | string | null; // Kann auch String sein, wie gesehen
  feedback: string | null;
  due_date: string | null;
  remaining_days: number | null;
  processing_time_days: number | null;
  criterion_scores: CriterionScore[];
  attachments?: ExamAttachment[]; // Optional machen
  graded_by?: SimpleUser | null; // NEU: Bewerter hinzugefügt (optional)
}

// Definition des Context-Typs
interface ExamContextType {
  // User-bezogene Daten
  availableExams: Exam[];
  activeExams: ExamAttempt[];
  completedExams: ExamAttempt[];
  loadingUserExams: boolean;
  errorUserExams: string | null;

  // NEU: Alle Prüfungen (für Übersichtstab)
  allExams: Exam[];
  loadingAllExams: boolean;
  errorAllExams: string | null;

  // Teacher-bezogene Daten
  teacherSubmissions: ExamAttempt[];
  loadingTeacherData: boolean;
  errorTeacherData: string | null;

  // Aktionen
  refreshUserExams: () => Promise<void>;
  refreshTeacherData: () => Promise<void>;
  startExam: (examId: number) => Promise<ExamAttempt | null>;
  submitExam: (attemptId: number, attachments?: File[]) => Promise<boolean>;
  gradeExam: (
    attemptId: number,
    scores: { criterion_id: number; achieved_points: number }[],
    feedback: string
  ) => Promise<boolean>;
}

// Default-Werte für den Context
const defaultContextValue: ExamContextType = {
  // User-bezogene Daten
  availableExams: [],
  activeExams: [],
  completedExams: [],
  loadingUserExams: false,
  errorUserExams: null,

  // NEU: Default-Werte für alle Prüfungen
  allExams: [],
  loadingAllExams: false,
  errorAllExams: null,

  // Teacher-bezogene Daten
  teacherSubmissions: [],
  loadingTeacherData: false,
  errorTeacherData: null,

  // Default-Implementierungen für Aktionen
  refreshUserExams: async () => {
    console.warn("ExamProvider nicht initialisiert");
  },
  refreshTeacherData: async () => {
    console.warn("ExamProvider nicht initialisiert");
  },
  startExam: async () => {
    console.warn("ExamProvider nicht initialisiert");
    return null;
  },
  submitExam: async () => {
    console.warn("ExamProvider nicht initialisiert");
    return false;
  },
  gradeExam: async () => {
    console.warn("ExamProvider nicht initialisiert");
    return false;
  },
};

// Context erstellen
const ExamContext = createContext<ExamContextType>(defaultContextValue);

// Custom Hook für einfachen Zugriff
export const useExams = () => {
  const context = useContext(ExamContext);
  if (!context) {
    throw new Error(
      "useExams muss innerhalb eines ExamProviders verwendet werden"
    );
  }
  return context;
};

// Provider-Komponente
interface ExamProviderProps {
  children: ReactNode;
}

export const ExamProvider: React.FC<ExamProviderProps> = ({ children }) => {
  const { isAuthenticated, user } = useAuth();

  // State für User-bezogene Daten
  const [availableExams, setAvailableExams] = useState<Exam[]>([]);
  const [activeExams, setActiveExams] = useState<ExamAttempt[]>([]);
  const [completedExams, setCompletedExams] = useState<ExamAttempt[]>([]);
  const [loadingUserExams, setLoadingUserExams] = useState<boolean>(false);
  const [errorUserExams, setErrorUserExams] = useState<string | null>(null);

  // NEU: State für alle Prüfungen
  const [allExams, setAllExams] = useState<Exam[]>([]);
  const [loadingAllExams, setLoadingAllExams] = useState<boolean>(false);
  const [errorAllExams, setErrorAllExams] = useState<string | null>(null);

  // State für Teacher-bezogene Daten
  const [teacherSubmissions, setTeacherSubmissions] = useState<ExamAttempt[]>(
    []
  );
  const [loadingTeacherData, setLoadingTeacherData] = useState<boolean>(false);
  const [errorTeacherData, setErrorTeacherData] = useState<string | null>(null);

  // API-Anfragen für User-bezogene Daten
  const fetchUserExams = async () => {
    if (!isAuthenticated) {
      console.log("ExamContext: Nicht authentifiziert, lade keine Prüfungen");
      return;
    }

    console.log("ExamContext: Starte Abruf der Prüfungsdaten");
    setLoadingUserExams(true);
    setErrorUserExams(null);

    try {
      // Parallele Anfragen für verschiedene Prüfungstypen
      console.log("ExamContext: Sende parallele API-Anfragen");
      const [availableRes, activeRes, completedRes] = await Promise.all([
        api.get("exams/my-exams/available/"),
        api.get("exams/my-exams/active/"),
        api.get("exams/my-exams/completed/"),
      ]);

      console.log(
        "ExamContext: Verfügbare Prüfungen API-Antwort:",
        availableRes
      );
      console.log(
        "ExamContext: Verfügbare Prüfungen Daten:",
        availableRes.data
      );

      if (availableRes.data && availableRes.data.length > 0) {
        console.log("ExamContext: Erste verfügbare Prüfung:", {
          id: availableRes.data[0].id,
          title: availableRes.data[0].exam_title,
          beschreibung: availableRes.data[0].exam_description,
          kompletteDaten: availableRes.data[0],
        });
      }

      console.log("ExamContext: Daten erhalten:", {
        available: availableRes.data.length,
        active: activeRes.data.length,
        completed: completedRes.data.length,
      });

      // Prüfen, ob Titel in den empfangenen Daten vorhanden sind
      if (availableRes.data && availableRes.data.length > 0) {
        const missingTitles = availableRes.data.filter(
          (exam: Exam) => !exam.exam_title || exam.exam_title === ""
        );
        if (missingTitles.length > 0) {
          console.warn(
            "ExamContext: WARNUNG - Einige Prüfungen haben keinen Titel:",
            missingTitles
          );
        }
      }

      setAvailableExams(availableRes.data);
      setActiveExams(activeRes.data);
      setCompletedExams(completedRes.data);

      // Nach dem Setzen der Daten überprüfen, ob die Daten korrekt im State sind
      console.log(
        "ExamContext: Gespeicherte verfügbare Prüfungen:",
        availableExams
      );
    } catch (error) {
      console.error("Fehler beim Laden der Prüfungsdaten:", error);
      setErrorUserExams(
        "Die Prüfungsdaten konnten nicht geladen werden. Bitte versuche es später erneut."
      );
    } finally {
      setLoadingUserExams(false);
    }
  };

  // NEU: API-Anfrage für ALLE Prüfungen
  const fetchAllExams = async () => {
    if (!isAuthenticated) return; // Nur für eingeloggte User relevant?

    console.log("ExamContext: Starte Abruf ALLER Prüfungen");
    setLoadingAllExams(true);
    setErrorAllExams(null);

    try {
      // Annahme: Endpunkt /api/exams/all/ existiert oder wird erstellt
      const response = await api.get("exams/all/");
      console.log("ExamContext: Alle Prüfungen API-Antwort:", response);
      setAllExams(response.data);
      console.log(
        "ExamContext: Alle Prüfungen Daten gesetzt:",
        response.data.length
      );
    } catch (error) {
      console.error("Fehler beim Laden aller Prüfungen:", error);
      setErrorAllExams(
        "Die Liste aller Prüfungen konnte nicht geladen werden."
      );
    } finally {
      setLoadingAllExams(false);
    }
  };

  // API-Anfragen für Teacher-bezogene Daten
  const fetchTeacherSubmissions = async () => {
    if (!isAuthenticated || !user?.is_staff) return;

    setLoadingTeacherData(true);
    setErrorTeacherData(null);

    try {
      const response = await api.get("exams/teacher/submissions/");
      console.log("ExamContext: Lehrer-Submissions geladen:", response.data);
      setTeacherSubmissions(response.data);
    } catch (error) {
      console.error("Fehler beim Laden der Lehrer-Ansicht:", error);
      setErrorTeacherData(
        "Die Daten konnten nicht geladen werden. Bitte versuche es später erneut."
      );
    } finally {
      setLoadingTeacherData(false);
    }
  };

  // Aktionen
  const startExam = async (examId: number): Promise<ExamAttempt | null> => {
    if (!isAuthenticated) return null;

    try {
      console.log(`ExamContext: Starte Prüfung mit ID ${examId}`);
      // POST-Anfrage zum Starten einer Prüfung
      const response = await api.post(`exams/${examId}/start/`);
      console.log("ExamContext: Prüfung starten - Antwort:", response.data);

      // Daten aktualisieren
      await refreshUserExams();

      return response.data;
    } catch (error) {
      console.error("Fehler beim Starten der Prüfung:", error);
      return null;
    }
  };

  const submitExam = async (
    attemptId: number,
    attachments?: File[]
  ): Promise<boolean> => {
    if (!isAuthenticated) return false;

    try {
      console.log(`ExamContext: Reiche Prüfungsversuch ${attemptId} ein`);
      let formData: FormData | null = null;

      // Wenn Anhänge vorhanden sind, FormData für Multipart-Request verwenden
      if (attachments && attachments.length > 0) {
        formData = new FormData();
        attachments.forEach((file, index) => {
          if (formData) {
            // TypeScript-Check für FormData
            formData.append(`attachment_${index}`, file);
          }
        });
      }

      // POST-Anfrage zum Abgeben einer Prüfung
      const response = await api.post(
        `exams/attempts/${attemptId}/submit/`,
        formData,
        {
          headers: formData
            ? { "Content-Type": "multipart/form-data" }
            : undefined,
        }
      );
      console.log("ExamContext: Prüfung abgeben - Antwort:", response.data);

      // Daten aktualisieren
      await refreshUserExams();

      return true;
    } catch (error) {
      console.error("Fehler beim Abgeben der Prüfung:", error);
      return false;
    }
  };

  const gradeExam = async (
    attemptId: number,
    scores: { criterion_id: number; achieved_points: number }[],
    feedback: string
  ): Promise<boolean> => {
    if (!isAuthenticated || !user?.is_staff) return false;

    try {
      console.log(`ExamContext: Bewerte Prüfungsversuch ${attemptId}`);
      // POST-Anfrage zum Bewerten einer Prüfung
      const payload = {
        scores: scores,
        feedback,
      };
      console.log("ExamContext: Bewertungsdaten:", payload);

      const response = await api.post(
        `exams/teacher/submissions/${attemptId}/grade/`,
        payload
      );
      console.log("ExamContext: Prüfung bewerten - Antwort:", response.data);

      // Daten aktualisieren
      await refreshTeacherData();

      return true;
    } catch (error) {
      console.error("Fehler beim Bewerten der Prüfung:", error);
      return false;
    }
  };

  // Funktionen memoisiert mit useCallback
  const refreshUserExams = useCallback(async () => {
    if (!isAuthenticated) return; // Abhängigkeit: isAuthenticated
    await fetchUserExams();
    await fetchAllExams();
  }, [isAuthenticated]); // Abhängigkeit hinzugefügt

  const refreshTeacherData = useCallback(async () => {
    if (!isAuthenticated || !user?.is_staff) return; // Abhängigkeiten: isAuthenticated, user.is_staff
    await fetchTeacherSubmissions();
  }, [isAuthenticated, user?.is_staff]); // Abhängigkeiten hinzugefügt

  // Effect zum Aktualisieren der State-Daten
  useEffect(() => {
    if (availableExams.length > 0) {
      console.log("ExamContext: availableExams wurden aktualisiert:", {
        anzahl: availableExams.length,
        erstesPruefungsID: availableExams[0]?.id,
        erstesPruefungsTitel: availableExams[0]?.exam_title,
      });
    }
  }, [availableExams]);

  // Initialer Datenload und Reaktion auf Auth-Änderungen
  useEffect(() => {
    console.log(
      "ExamContext: Auth-Status geändert, isAuthenticated =",
      isAuthenticated,
      "user =",
      user?.username
    );
    if (isAuthenticated) {
      fetchUserExams();
      // NEU: Auch alle Prüfungen laden
      fetchAllExams();

      if (user?.is_staff) {
        console.log("ExamContext: Benutzer ist Staff, lade auch Teacher-Daten");
        fetchTeacherSubmissions();
      }
    } else {
      // Zurücksetzen der Daten bei Logout
      console.log("ExamContext: Nicht authentifiziert, setze Daten zurück");
      setAvailableExams([]);
      setActiveExams([]);
      setCompletedExams([]);
      // NEU: Auch alle Prüfungen zurücksetzen
      setAllExams([]);
      setTeacherSubmissions([]);
    }
  }, [isAuthenticated, user]); // Direkte Abhängigkeit vom Auth-Status

  // Context-Value
  const value: ExamContextType = {
    // User-bezogene Daten
    availableExams,
    activeExams,
    completedExams,
    loadingUserExams,
    errorUserExams,

    // NEU: Alle Prüfungen bereitstellen
    allExams,
    loadingAllExams,
    errorAllExams,

    // Teacher-bezogene Daten
    teacherSubmissions,
    loadingTeacherData,
    errorTeacherData,

    // Aktionen
    refreshUserExams,
    refreshTeacherData,
    startExam,
    submitExam,
    gradeExam,
  };

  return <ExamContext.Provider value={value}>{children}</ExamContext.Provider>;
};
