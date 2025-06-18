import React, {
  createContext,
  useContext,
  ReactNode,
  useCallback,
} from "react";
import api from "../util/apis/api";
import { useAuth } from "./AuthContext"; // Direkte Verwendung des AuthContext
// Performance optimization imports
import { useShallowMemo, useCachedApi } from "../util/performance";

// --- Type Definitions (Derived from Backend Models) ---

export interface SupplementaryContentItem {
  label: string;
  url: string;
  order: number;
}

export interface Task {
  id: number;
  title: string;
  description: string;
  difficulty: string; // e.g., 'Einfach', 'Mittel', 'Schwer'
  hint?: string | null;
  order: number;
  test_file_path?: string; // Possibly needed for editor linking
  completed: boolean;
}

export interface Content {
  id: number;
  title: string;
  description: string;
  video_url?: string | null;
  order: number;
  supplementary_title?: string | null;
  supplementary_contents?: SupplementaryContentItem[];
}

export interface Module {
  id: number;
  title: string;
  category: string;
  is_public: boolean;
  contents?: Content[];
  tasks?: Task[];
}

// --- Context Type Definition ---
interface ModuleContextType {
  modules: Module[];
  loading: boolean;
  error: Error | null;
  fetchModules: () => Promise<void>; // Make it async for potential use
}

// --- Create Context ---
// Initialize with default values matching the type structure
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

export const ModuleProvider: React.FC<ModuleProviderProps> = ({ children }) => {
  const { isAuthenticated, user } = useAuth(); // Verwenden des AuthContext

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
          "ModuleContext: Nicht authentifiziert, setze Module zurück"
        );
        return [];
      }

      console.log("ModuleContext: Lade Module für authentifizierten Benutzer");
      const response = await api.get<Module[]>("/modules/user/");
      console.log(
        "ModuleContext: API-Antwort erhalten",
        response.data.length,
        "Module"
      );

      // Performance optimization: Memoized sorting to avoid repeated calculations
      const sortedModules = response.data
        .map((module) => ({
          ...module,
          contents: [...(module.contents || [])].sort(
            (a, b) => a.order - b.order
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
    }
  );

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
    [modules, loading, error, stableFetchModules]
  );

  return (
    <ModuleContext.Provider value={value}>{children}</ModuleContext.Provider>
  );
};

// --- Custom Hook for easy access ---
export const useModules = (): ModuleContextType => {
  const context = useContext(ModuleContext);
  // No need to check for undefined if context provides default values
  // if (context === undefined) {
  //     throw new Error('useModules must be used within a ModuleProvider');
  // }
  return context;
};
