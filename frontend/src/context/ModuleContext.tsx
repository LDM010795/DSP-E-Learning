/**
 * Module Context - E-Learning DSP Frontend
 *
 * Context für Modul-Verwaltung und -daten:
 * - Modul-Daten-Management mit Caching
 * - Performance-Optimierung mit React Query
 * - Benutzer-spezifische Modul-Anzeige
 * - Automatische Sortierung und Strukturierung
 *
 * Features:
 * - Cached API-Calls für bessere Performance
 * - Benutzer-spezifische Modul-Filterung
 * - Automatische Sortierung nach Reihenfolge
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
  ReactNode,
  useCallback,
} from "react";
import api from "../util/apis/api";
import { useAuth } from "./AuthContext";
// Performance optimization imports
import { useShallowMemo, useCachedApi } from "../util/performance";

// --- Type Definitions (Derived from Backend Models) ---

/**
 * Ergänzender Inhalt für Module
 */
export interface SupplementaryContentItem {
  label: string;
  url: string;
  order: number;
}

export interface MultipleChoiceConfig {
  options: { answer: string }[];
  correct_answer: number; // 0-based index
  explanation?: string;
}

export interface ProgrammingConfig {
  test_file_path?: string;
  has_automated_tests?: boolean;
}

export type TaskConfig = MultipleChoiceConfig | ProgrammingConfig | null;
export type TaskType = "multiple_choice" | "programming";

/**
 * Aufgaben innerhalb eines Moduls
 */
export interface Task {
  id: number;
  title: string;
  description: string;
  difficulty: string; // e.g., 'Einfach', 'Mittel', 'Schwer'
  hint?: string | null;
  order: number;
  test_file_path?: string; // Possibly needed for editor linking
  task_type: TaskType;
  task_config?: TaskConfig;
  completed: boolean;
}

/**
 * Inhalt innerhalb eines Moduls
 */
export interface Content {
  id: number;
  title: string;
  description: string;
  video_url?: string | null;
  order: number;
  supplementary_title?: string | null;
  supplementary_contents?: SupplementaryContentItem[];
}

/**
 * Kategorie-Struktur
 */
export interface ModuleCategory {
  id: number;
  name: string;
}

/**
 * Modul-Struktur
 */
export interface Module {
  id: number;
  title: string;
  category: ModuleCategory;
  is_public: boolean;
  contents?: Content[];
  tasks?: Task[];
}

// --- Context Type Definition ---
interface ModuleContextType {
  modules: Module[];
  loading: boolean;
  error: Error | null;
  fetchModules: () => Promise<void>;
}

// --- Create Context ---
const ModuleContext = createContext<ModuleContextType>({
  modules: [],
  loading: true,
  error: null,
  fetchModules: async () => {
    console.warn("ModuleProvider not initialized");
  },
});

// --- Provider Component ---
interface ModuleProviderProps {
  children: ReactNode;
}

/**
 * Module Provider Komponente
 *
 * Verwaltet den globalen Modul-Zustand mit Performance-Optimierung
 * und benutzer-spezifischer Datenverwaltung.
 */
export const ModuleProvider: React.FC<ModuleProviderProps> = ({ children }) => {
  const { isAuthenticated, user } = useAuth();

  // --- Performance-optimierte API-Calls ---

  // Performance optimization: Use cached API for modules with user-specific cache key
  const {
    data: modules,
    isLoading: loading,
    error,
    refresh: fetchModules,
  } = useCachedApi(
    `modules-${user?.user_id || "anonymous"}`, // User-specific cache key
    async () => {
      if (!isAuthenticated) {
        console.log(
          "ModuleContext: Nicht authentifiziert, setze Module zurück",
        );
        return [];
      }

      console.log("ModuleContext: Lade Module für authentifizierten Benutzer");
      const response = await api.get<Module[]>("/modules/user/");
      console.log(
        "ModuleContext: API-Antwort erhalten",
        response.data.length,
        "Module",
      );

      // Performance optimization: Memoized sorting to avoid repeated calculations
      const sortedModules = response.data
        .map((module) => ({
          ...module,
          contents: [...(module.contents || [])].sort(
            (a, b) => a.order - b.order,
          ),
          tasks: [...(module.tasks || [])].sort((a, b) => a.order - b.order),
        }))
        .sort((a, b) => {
          return a.title.localeCompare(b.title);
        });

      console.log("ModuleContext: Module sortiert und gesetzt");
      return sortedModules;
    },
    {
      ttl: 300000, // 5 Minuten Cache
      enabled: true, // Immer aktiviert
    },
  );

  // --- Performance-optimierte Callbacks ---

  // Performance optimization: Stable callback for fetchModules
  const stableFetchModules = useCallback(async () => {
    await fetchModules();
  }, [fetchModules]);

  // Performance optimization: Memoize context value to prevent unnecessary re-renders
  const value = useShallowMemo(
    () => ({
      modules: modules || [],
      loading,
      error,
      fetchModules: stableFetchModules,
    }),
    [modules, loading, error, stableFetchModules],
  );

  return (
    <ModuleContext.Provider value={value}>{children}</ModuleContext.Provider>
  );
};

// --- Custom Hook for easy access ---
export const useModules = (): ModuleContextType => {
  const context = useContext(ModuleContext);
  return context;
};
