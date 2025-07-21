/**
 * Exam Context - E-Learning DSP Frontend
 *
 * Context für Prüfungsverwaltung und -durchführung:
 * - Prüfungsdaten-Management (verfügbar, aktiv, abgeschlossen)
 * - Lehrer- und Schüler-Funktionalitäten
 * - Prüfungsdurchführung (Start, Submit, Bewertung)
 * - Performance-Optimierung mit Caching
 *
 * Features:
 * - Vollständige Prüfungsverwaltung
 * - Lehrer- und Schüler-Rollen
 * - Automatische Datenaktualisierung
 * - Error-Handling und Loading-States
 * - TypeScript-Typisierung
 *
 * Author: DSP Development Team
 * Created: 10.07.2025
 * Version: 1.0.0
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import api from "../util/apis/api";
import { useAuth } from "./AuthContext";
// Performance optimization imports (prepared for future use)
// import { useShallowMemo, debounce } from "../util/performance";

// --- Type Definitions ---

/**
 * Bewertungskriterium für Prüfungen
 */
export interface Criterion {
  id: number;
  title: string;
  description: string;
  max_points: number;
}

/**
 * Prüfungsanforderungen
 */
export interface ExamRequirement {
  id: number;
  description: string;
  order: number;
}

/**
 * Modul-Struktur für Prüfungen
 */
export interface Module {
  id: number;
  title: string;
  updated_at: string;
  modules: Module[];
  criteria: Criterion[];
  requirements: ExamRequirement[];
}

/**
 * Prüfungs-Struktur
 */
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
  requirements?: ExamRequirement[];
}

/**
 * Vereinfachter User-Typ
 */
interface SimpleUser {
  id: number;
  username: string;
  first_name?: string;
  last_name?: string;
  email?: string;
}

/**
 * Bewertung für einzelne Kriterien
 */
export interface CriterionScore {
  id: number;
  criterion: Criterion;
  achieved_points: number;
}

/**
 * Prüfungsanhang
 */
export interface ExamAttachment {
  id: number;
  file: string;
  uploaded_at?: string;
}

/**
 * Prüfungsversuch eines Benutzers
 */
export interface ExamAttempt {
  id: number;
  exam: Exam;
  user: SimpleUser;
  status: "started" | "submitted" | "graded";
  started_at: string;
  submitted_at: string | null;
  graded_at: string | null;
  score: number | string | null;
  feedback: string | null;
  due_date: string | null;
  remaining_days: number | null;
  processing_time_days: number | null;
  criterion_scores: CriterionScore[];
  attachments?: ExamAttachment[];
  graded_by?: SimpleUser | null;
}

/**
 * Context-Typ für Prüfungsverwaltung
 */
interface ExamContextType {
  // --- User-bezogene Daten ---
  availableExams: Exam[];
  activeExams: ExamAttempt[];
  completedExams: ExamAttempt[];
  loadingUserExams: boolean;
  errorUserExams: string | null;

  // --- Alle Prüfungen (für Übersichtstab) ---
  allExams: Exam[];
  loadingAllExams: boolean;
  errorAllExams: string | null;

  // --- Teacher-bezogene Daten ---
  teacherSubmissions: ExamAttempt[];
  loadingTeacherData: boolean;
  errorTeacherData: string | null;

  // --- Aktionen ---
  refreshUserExams: () => Promise<void>;
  refreshTeacherData: () => Promise<void>;
  startExam: (examId: number) => Promise<ExamAttempt | null>;
  submitExam: (attemptId: number, attachments?: File[]) => Promise<boolean>;
  gradeExam: (
    attemptId: number,
    scores: { criterion_id: number; achieved_points: number }[],
    feedback: string,
  ) => Promise<boolean>;
}

// --- Default Context Values ---
const defaultContextValue: ExamContextType = {
  availableExams: [],
  activeExams: [],
  completedExams: [],
  loadingUserExams: false,
  errorUserExams: null,
  allExams: [],
  loadingAllExams: false,
  errorAllExams: null,
  teacherSubmissions: [],
  loadingTeacherData: false,
  errorTeacherData: null,
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

// --- Context Creation ---
const ExamContext = createContext<ExamContextType>(defaultContextValue);

/**
 * Custom Hook für einfachen Zugriff auf Exam Context
 */
export const useExams = () => {
  const context = useContext(ExamContext);
  if (!context) {
    throw new Error(
      "useExams muss innerhalb eines ExamProviders verwendet werden",
    );
  }
  return context;
};

// --- Provider Component ---
interface ExamProviderProps {
  children: ReactNode;
}

/**
 * Exam Provider Komponente
 *
 * Verwaltet den globalen Prüfungszustand und stellt
 * Funktionen für Prüfungsverwaltung bereit.
 */
export const ExamProvider: React.FC<ExamProviderProps> = ({ children }) => {
  const { isAuthenticated, user } = useAuth();

  // --- State Management ---

  // User-bezogene Daten
  const [availableExams, setAvailableExams] = useState<Exam[]>([]);
  const [activeExams, setActiveExams] = useState<ExamAttempt[]>([]);
  const [completedExams, setCompletedExams] = useState<ExamAttempt[]>([]);
  const [loadingUserExams, setLoadingUserExams] = useState<boolean>(false);
  const [errorUserExams, setErrorUserExams] = useState<string | null>(null);

  // Alle Prüfungen
  const [allExams, setAllExams] = useState<Exam[]>([]);
  const [loadingAllExams, setLoadingAllExams] = useState<boolean>(false);
  const [errorAllExams, setErrorAllExams] = useState<string | null>(null);

  // Teacher-bezogene Daten
  const [teacherSubmissions, setTeacherSubmissions] = useState<ExamAttempt[]>(
    [],
  );
  const [loadingTeacherData, setLoadingTeacherData] = useState<boolean>(false);
  const [errorTeacherData, setErrorTeacherData] = useState<string | null>(null);

  // --- API Functions ---

  /**
   * Lädt Prüfungsdaten für den aktuellen Benutzer
   */
  const fetchUserExams = async () => {
    if (!isAuthenticated) return;

    setLoadingUserExams(true);
    setErrorUserExams(null);

    try {
      const [availableResponse, activeResponse, completedResponse] =
        await Promise.all([
          api.get("/exams/my-exams/available/"),
          api.get("/exams/my-exams/active/"),
          api.get("/exams/my-exams/completed/"),
        ]);

      setAvailableExams(availableResponse.data);
      setActiveExams(activeResponse.data);
      setCompletedExams(completedResponse.data);
    } catch (error) {
      console.error("Fehler beim Laden der Prüfungsdaten:", error);
      setErrorUserExams("Fehler beim Laden der Prüfungsdaten");
    } finally {
      setLoadingUserExams(false);
    }
  };

  /**
   * Lädt alle verfügbaren Prüfungen
   */
  const fetchAllExams = async () => {
    setLoadingAllExams(true);
    setErrorAllExams(null);

    try {
      const response = await api.get("/exams/all/");
      setAllExams(response.data);
    } catch (error) {
      console.error("Fehler beim Laden aller Prüfungen:", error);
      setErrorAllExams("Fehler beim Laden der Prüfungen");
    } finally {
      setLoadingAllExams(false);
    }
  };

  /**
   * Lädt Prüfungsdaten für Lehrer
   */
  const fetchTeacherSubmissions = async () => {
    if (!isAuthenticated || !user?.is_staff) return;

    setLoadingTeacherData(true);
    setErrorTeacherData(null);

    try {
      const response = await api.get("/exams/teacher/submissions/");
      setTeacherSubmissions(response.data);
    } catch (error) {
      console.error("Fehler beim Laden der Lehrer-Daten:", error);
      setErrorTeacherData("Fehler beim Laden der Lehrer-Daten");
    } finally {
      setLoadingTeacherData(false);
    }
  };

  /**
   * Startet eine Prüfung
   */
  const startExam = async (examId: number): Promise<ExamAttempt | null> => {
    try {
      const response = await api.post(`/exams/${examId}/start/`);
      await fetchUserExams(); // Aktualisiere die Daten
      return response.data;
    } catch (error) {
      console.error("Fehler beim Starten der Prüfung:", error);
      return null;
    }
  };

  /**
   * Reicht eine Prüfung ein
   */
  const submitExam = async (
    attemptId: number,
    attachments?: File[],
  ): Promise<boolean> => {
    try {
      const formData = new FormData();
      if (attachments) {
        attachments.forEach((file) => {
          formData.append("attachments", file);
        });
      }

      await api.post(`/exams/attempts/${attemptId}/submit/`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      await fetchUserExams(); // Aktualisiere die Daten
      return true;
    } catch (error) {
      console.error("Fehler beim Einreichen der Prüfung:", error);
      return false;
    }
  };

  /**
   * Bewertet eine Prüfung (nur für Lehrer)
   */
  const gradeExam = async (
    attemptId: number,
    scores: { criterion_id: number; achieved_points: number }[],
    feedback: string,
  ): Promise<boolean> => {
    try {
      await api.post(`/exams/teacher/submissions/${attemptId}/grade/`, {
        criterion_scores: scores,
        feedback,
      });

      await fetchTeacherSubmissions(); // Aktualisiere Lehrer-Daten
      return true;
    } catch (error) {
      console.error("Fehler beim Bewerten der Prüfung:", error);
      return false;
    }
  };

  // --- Effect Hooks ---

  // Lade Daten bei Authentifizierung
  useEffect(() => {
    if (isAuthenticated) {
      fetchUserExams();
      fetchAllExams();
      if (user?.is_staff) {
        fetchTeacherSubmissions();
      }
    }
  }, [isAuthenticated, user?.is_staff]);

  // --- Context Value ---
  const contextValue: ExamContextType = {
    availableExams,
    activeExams,
    completedExams,
    loadingUserExams,
    errorUserExams,
    allExams,
    loadingAllExams,
    errorAllExams,
    teacherSubmissions,
    loadingTeacherData,
    errorTeacherData,
    refreshUserExams: fetchUserExams,
    refreshTeacherData: fetchTeacherSubmissions,
    startExam,
    submitExam,
    gradeExam,
  };

  return (
    <ExamContext.Provider value={contextValue}>{children}</ExamContext.Provider>
  );
};
