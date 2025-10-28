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
  useMemo,
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
  chapter: number;
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
 * Inhalt innerhalb eines Kapitels
 */
export interface Content {
  id: number;
  chapter: number;
  title: string;
  description: string;
  video_url?: string | null;
  order: number;
  supplementary_title?: string | null;
  supplementary_contents?: SupplementaryContentItem[];
}

/**
 * Kapitel innerhalb eines Moduls
 */
export interface Chapter {
  id: number;
  title: string;
  description: string;
  order: number;
  is_active: boolean;
  contents: Content[];
  tasks: Task[];
}

/**
 * Kategorie-Struktur
 */
export interface ModuleCategory {
  id: number;
  name: string;
}

/**
 * Artikel/Lernbeiträge innerhalb eines Moduls
 */
export interface Article {
  id: number;
  title: string;
  order: number;
  url?: string | null;
  // JSON content as produced by backend; we only care that it has a 'content' array
  json_content?: { content?: unknown[] } | null;
}

// Modulstruktur, wie wir sie im Frontend verwenden wollen
export interface Module {
  id: number;
  title: string;
  category: ModuleCategory;
  is_public: boolean;
  chapters: Chapter[]; // Contents und Tasks sind in den Chapter-Objekten
  articles: Article[];
  article_images: Record<string, string>; // Mapping image_name -> cloud_url
}

// Modulstruktur, wie wir sie vom Backend bekommen
export interface ModuleApiDto {
  id: number;
  title: string;
  category: ModuleCategory;
  is_public: boolean;
  chapters?: Chapter[];
  contents?: Content[];
  tasks?: Task[];
  articles?: Article[]; // Lernbeiträge
  article_images?: Record<string, string>; // Mapping image_name -> cloud_url
}

// --- Context Type Definition ---
interface ModuleContextType {
  modules: Module[];
  loading: boolean;
  error: Error | null;
  fetchModules: () => Promise<void>;
  getAllModuleTasks: (moduleId: number) => Task[];    // Tasks pro Modul cachen
  getAllModuleContents: (moduleId: number) => Content[]; // Contents pro Modul cachen
}

// --- Create Context ---
const ModuleContext = createContext<ModuleContextType>({
  modules: [],
  loading: true,
  error: null,
  fetchModules: async () => {
    console.warn("ModuleProvider not initialized");
  },
  getAllModuleTasks: () => [],
  getAllModuleContents: () => [],
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
  const { isAuthenticated } = useAuth();

  // --- Performance-optimierte API-Calls ---

  // Performance optimization: Use cached API for modules with user-specific cache key
  const {
    data: modules,
    isLoading: loading,
    error,
    refresh: fetchModules,
  } = useCachedApi(
    `modules-${isAuthenticated}`, // User-specific cache key
    async () => {
      if (!isAuthenticated) {
        console.log(
          "ModuleContext: Nicht authentifiziert, setze Module zurück",
        );
        return [];
      }

      console.log("ModuleContext: Lade Module für authentifizierten Benutzer");
      const response = await api.get<ModuleApiDto[]>("/modules/user/");
      console.log(
        "ModuleContext: API-Antwort erhalten",
        response.data.length,
        "Module",
      );

      const byOrder = <T extends { order: number }>(a: T, b: T) => a.order - b.order;
      const modules = response.data;

      const articlesByModuleId: Record<number, Article[]> = Object.fromEntries(
        modules.map(m => [m.id, m.articles ?? []] as const)
      );

      const chaptersByModuleId: Record<number, Chapter[]> = Object.fromEntries(
        modules.map(module => [
          module.id,
          (module.chapters ?? []).map(chapter => {
            const chapterContents =
              chapter.contents?.length // Backend liefert (noch) alte und neue Struktur, daher entscheiden
                ? [...chapter.contents].sort(byOrder) // neue Struktur 
                : (module.contents ?? []) // alte Struktur
                  .filter(content => content.chapter === chapter.id)
                  .slice()
                  .sort(byOrder);

            const chapterTasks =
              chapter.tasks?.length // Backend liefert (noch) alte und neue Struktur, daher entscheiden
                ? [...chapter.tasks].sort(byOrder) // neue Struktur 
                : (module.tasks ?? []) // alte Struktur
                  .filter(task => task.chapter === chapter.id)
                  .slice()
                  .sort(byOrder);

            return {
              ...chapter,
              contents: chapterContents,
              tasks: chapterTasks,
            };
          }),
        ])
      );

      // Performance optimization: Memoized sorting to avoid repeated calculations
      const sortedModules: Module[] = modules.map(module => ({
        id: module.id,
        title: module.title,
        category: module.category,
        is_public: module.is_public,
        chapters: chaptersByModuleId[module.id].sort(byOrder),
        articles: articlesByModuleId[module.id].sort(byOrder),
        article_images: module.article_images ?? {}
      }))
        .sort((module1, module2) => module1.title.localeCompare(module2.title));

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

  const tasksByModuleId = useMemo(() => {
    const map = new Map<number, Task[]>();
    for (const m of modules ?? []) {
      const tasks = m.chapters?.flatMap(ch => ch.tasks ?? []) ?? [];
      map.set(m.id, tasks);
    }
    return map;
  }, [modules]);

  const contentsByModuleId = useMemo(() => {
    const map = new Map<number, Content[]>();
    for (const m of modules ?? []) {
      const contents = m.chapters?.flatMap(ch => ch.contents ?? []) ?? [];
      map.set(m.id, contents);
    }
    return map;
  }, [modules]);

  const getAllModuleTasks = useCallback(
    (moduleId: number) => tasksByModuleId.get(moduleId) ?? [],
    [tasksByModuleId]
  );

  const getAllModuleContents = useCallback(
    (moduleId: number) => contentsByModuleId.get(moduleId) ?? [],
    [contentsByModuleId]
  );

  // Performance optimization: Memoize context value to prevent unnecessary re-renders
  const value = useShallowMemo(
    () => ({
      modules: modules || [],
      loading,
      error,
      fetchModules: stableFetchModules,
      getAllModuleTasks,
      getAllModuleContents,
    }),
    [modules, loading, error, stableFetchModules, getAllModuleTasks, getAllModuleContents],
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
