import { ModuleProvider, useModules } from "@/context/ModuleContext";
import * as authHook from "@/context/AuthContext";

import { render, renderHook, screen, waitFor } from "@testing-library/react";
import { describe, it } from "vitest";
import { http, HttpResponse } from "msw";
import { server } from "../testServer";
import { AuthProvider } from "@/context/AuthContext";
import { mockUser } from "../testMocks";

const DummyComponent = () => {
  const { modules, loading, error } = useModules();
  return (
    <div>
      <span>modules count: {modules.length}</span>
      {modules.map((m) => (
        <div>
          Modul: {m.title}, Id: {m.id}
        </div>
      ))}
      <span>isLoading: {loading ? "true" : "false"}</span>
      <span>error: {error?.message}</span>
    </div>
  );
};

const API = (path: string) => `http://127.0.0.1:8000/api/elearning/${path}`;

beforeEach(() => {
  vi.clearAllMocks();
});

vi.spyOn(authHook, "useAuth").mockReturnValue({
  user: mockUser,
  isAuthenticated: true,
  login: vi.fn(),
  logout: vi.fn(),
  setOAuthLogin: vi.fn(),
  isLoading: false,
  isInitialized: true,
});

describe("ModuleContext", () => {
  it("ModuleProvider initializes modules, isLoading and error correctly", async () => {
    server.use(
      http.get(API("modules/user/"), () => {
        return HttpResponse.json([
          {
            id: 1,
            title: "Python Grundlagen",
            category: "Programmierung",
            is_public: true,
          },
          {
            id: 2,
            title: "Python, fortgeschritten",
            category: "Programmierung",
            is_public: false,
          },
        ]);
      }),
    );

    render(
      <AuthProvider>
        <ModuleProvider>
          <DummyComponent />
        </ModuleProvider>
        ,
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText("modules count: 2")).toBeDefined();
      expect(screen.getByText("Modul: Python Grundlagen, Id: 1")).toBeDefined();
      expect(
        screen.getByText("Modul: Python, fortgeschritten, Id: 2"),
      ).toBeDefined();
      expect(screen.getByText("isLoading: false")).toBeDefined();
      expect(screen.getByText("error:")).toBeDefined();
    });
  });

  it("ModuleProvider renders children", () => {
    render(
      <AuthProvider>
        <ModuleProvider>
          <div data-testid="child">Child Component</div>
        </ModuleProvider>
      </AuthProvider>,
    );
    expect(screen.getByTestId("child")).toBeDefined();
    expect(screen.getByText("Child Component")).toBeDefined();
  });

  it("ModuleContext sorts modules, chapters, contents, tasks and articles", async () => {
    server.use(
      http.get(API("modules/user/"), () =>
        HttpResponse.json([
          {
            id: 1,
            title: "Python Grundlagen",
            category: { id: 1, name: "Programmierung" },
            is_public: true,
            chapters: [
              {
                id: 101,
                title: "Kapitel 2",
                order: 2,
                contents: [
                  {
                    id: 1001,
                    title: "C2",
                    order: 2,
                    description: "",
                    video_url: undefined,
                  },
                  {
                    id: 1000,
                    title: "C1",
                    order: 1,
                    description: "",
                    video_url: undefined,
                  },
                ],
                tasks: [
                  {
                    id: 2001,
                    title: "T2",
                    description: "",
                    difficulty: "Mittel",
                    order: 2,
                    task_type: "multiple_choice",
                    completed: false,
                  },
                  {
                    id: 2000,
                    title: "T1",
                    description: "",
                    difficulty: "Mittel",
                    order: 1,
                    task_type: "multiple_choice",
                    completed: false,
                  },
                ],
                articles: [
                  {
                    id: 3001,
                    title: "Testartikel 2",
                    order: 1,
                    url: null,
                    json_content: null,
                  },
                  {
                    id: 3000,
                    title: "Testartikel 1",
                    order: 0,
                    url: null,
                    json_content: null,
                  },
                ],
                description: "",
                is_active: true,
              },
              {
                id: 100,
                title: "Kapitel 1",
                order: 1,
                contents: [
                  {
                    id: 1002,
                    title: "C3",
                    order: 1,
                    description: "",
                    video_url: undefined,
                  },
                ],
                tasks: [],
                articles: [],
                description: "",
                is_active: true,
              },
            ],
          },
          {
            id: 2,
            title: "Python Fortgeschritten",
            category: { id: 1, name: "Programmierung" },
            is_public: false,
            chapters: [
              {
                id: 102,
                title: "Kapitel 1",
                order: 1,
                contents: [
                  {
                    id: 1003,
                    title: "C4",
                    order: 1,
                    description: "",
                    video_url: undefined,
                  },
                ],
                tasks: [
                  {
                    id: 2002,
                    title: "T3",
                    description: "",
                    difficulty: "Mittel",
                    order: 1,
                    task_type: "multiple_choice",
                    completed: false,
                  },
                ],
                articles: [],
                description: "",
                is_active: true,
              },
            ],
          },
        ]),
      ),
    );

    const wrapper = ({ children }: any) => (
      <AuthProvider>
        <ModuleProvider>{children}</ModuleProvider>
      </AuthProvider>
    );

    const { result } = renderHook(() => useModules(), { wrapper });

    // Warten, bis Module geladen sind
    await waitFor(() => expect(result.current.loading).toBe(false));

    const sortedModules = result.current.modules;

    // ✅ Module sortiert nach Titel
    expect(sortedModules.map((m) => m.title)).toEqual([
      "Python Fortgeschritten",
      "Python Grundlagen",
    ]);

    // ✅ Kapitel sortiert nach order (Kapitel 1, Kapitel 2)
    const grundlagen = sortedModules.find(
      (m) => m.title === "Python Grundlagen",
    )!;
    expect(grundlagen.chapters.map((c) => c.title)).toEqual([
      "Kapitel 1",
      "Kapitel 2",
    ]);
    expect(grundlagen.chapters.map((c) => c.order)).toEqual([1, 2]);

    // ✅ Inhalte in Kapitel 2 sortiert
    const kapitel2 = grundlagen.chapters.find((c) => c.title === "Kapitel 2")!;
    expect(kapitel2.contents.map((c) => c.title)).toEqual(["C1", "C2"]);
    expect(kapitel2.contents.map((c) => c.order)).toEqual([1, 2]);

    // ✅ Aufgaben in Kapitel 2 sortiert
    expect(kapitel2.tasks.map((t) => t.title)).toEqual(["T1", "T2"]);
    expect(kapitel2.tasks.map((t) => t.order)).toEqual([1, 2]);

    // ✅ Artikel in Kapitel 2 sortiert
    expect(kapitel2.articles.map((a) => a.title)).toEqual([
      "Testartikel 1",
      "Testartikel 2",
    ]);
    expect(kapitel2.articles.map((a) => a.order)).toEqual([0, 1]);

    // ✅ Überprüfen, dass Artikel korrekt im Mapping vorhanden sind
    const { getAllModuleArticles } = result.current;
    const moduleArticles = getAllModuleArticles(grundlagen.id);
    expect(moduleArticles.map((a) => a.title)).toEqual([
      "Testartikel 1",
      "Testartikel 2",
    ]);

    // ✅ Inhalte und Tasks auch über die Getter abrufbar
    const { getAllModuleContents, getAllModuleTasks } = result.current;
    const moduleContents = getAllModuleContents(grundlagen.id);
    const moduleTasks = getAllModuleTasks(grundlagen.id);

    expect(moduleContents.length).toBeGreaterThan(0);
    expect(moduleTasks.length).toBeGreaterThan(0);
  });

  it("sets error when API call fails", async () => {
    server.use(
      http.get(API("modules/user/"), () => {
        return HttpResponse.json({ message: "Server Error" }, { status: 500 });
      }),
    );

    const wrapper = ({ children }: any) => (
      <AuthProvider>
        <ModuleProvider>{children}</ModuleProvider>
      </AuthProvider>
    );

    const { result } = renderHook(() => useModules(), { wrapper });

    await result.current.fetchModules();

    await waitFor(() => {
      expect(result.current.error).toBeDefined();
      expect(result.current.loading).toBe(false);
      expect(result.current.modules.length).toBe(0);
    });
  });

  it("sets loading correctly during fetchModules", async () => {
    const wrapper = ({ children }: any) => (
      <AuthProvider>
        <ModuleProvider>{children}</ModuleProvider>
      </AuthProvider>
    );

    const { result } = renderHook(() => useModules(), { wrapper });

    // Trigger fetchModules, prüfe sofort loading
    expect(result.current.loading).toBe(true);

    await waitFor(() => expect(result.current.loading).toBe(false));
  });

  it("does not fetch modules if not authenticated", async () => {
    //mock isAuthenticated: false
    vi.spyOn(authHook, "useAuth").mockReturnValue({
      user: mockUser,
      isAuthenticated: false,
      login: vi.fn(),
      logout: vi.fn(),
      setOAuthLogin: vi.fn(),
      isLoading: false,
      isInitialized: true,
    });

    const wrapper = ({ children }: any) => (
      <AuthProvider>
        <ModuleProvider>{children}</ModuleProvider>
      </AuthProvider>
    );

    const { result } = renderHook(() => useModules(), { wrapper });

    await result.current.fetchModules();

    await waitFor(() => {
      expect(result.current.modules).toEqual([]);
      expect(result.current.loading).toBe(false);
    });
  });

  it("handles empty module list", async () => {
    const wrapper = ({ children }: any) => (
      <AuthProvider>
        <ModuleProvider>{children}</ModuleProvider>
      </AuthProvider>
    );

    const { result } = renderHook(() => useModules(), { wrapper });
    await result.current.fetchModules();

    await waitFor(() => {
      expect(result.current.modules).toEqual([]);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
    });
  });

  it("sammelt und sortiert contents, tasks und articles über mehrere Chapter hinweg", async () => {
    server.use(
      http.get(API("modules/user/"), () =>
        HttpResponse.json([
          {
            id: 1,
            title: "Mod A",
            category: { id: 1, name: "Cat" },
            is_public: true,
            chapters: [
              // K2 hat order=1 -> kommt in der Flatten-Order zuerst
              {
                id: 11,
                title: "K2",
                order: 1,
                description: "",
                is_active: true,
                contents: [
                  {
                    id: 1102,
                    chapter: 11,
                    title: "K2-C2",
                    order: 2,
                    description: "",
                  },
                  {
                    id: 1101,
                    chapter: 11,
                    title: "K2-C1",
                    order: 1,
                    description: "",
                  },
                ],
                tasks: [
                  {
                    id: 2102,
                    chapter: 11,
                    title: "K2-T2",
                    order: 2,
                    task_type: "multiple_choice",
                    description: "",
                    difficulty: "Mittel",
                    completed: false,
                  },
                  {
                    id: 2101,
                    chapter: 11,
                    title: "K2-T1",
                    order: 1,
                    task_type: "multiple_choice",
                    description: "",
                    difficulty: "Mittel",
                    completed: false,
                  },
                ],
                articles: [
                  {
                    id: 3102,
                    title: "K2-A2",
                    order: 2,
                    url: null,
                    json_content: null,
                  },
                  {
                    id: 3101,
                    title: "K2-A1",
                    order: 1,
                    url: null,
                    json_content: null,
                  },
                ],
              },
              // K1 hat order=2 -> kommt in der Flatten-Order danach
              {
                id: 10,
                title: "K1",
                order: 2,
                description: "",
                is_active: true,
                contents: [
                  {
                    id: 1002,
                    chapter: 10,
                    title: "K1-C2",
                    order: 2,
                    description: "",
                  },
                  {
                    id: 1001,
                    chapter: 10,
                    title: "K1-C1",
                    order: 1,
                    description: "",
                  },
                ],
                tasks: [
                  {
                    id: 2002,
                    chapter: 10,
                    title: "K1-T2",
                    order: 2,
                    task_type: "multiple_choice",
                    description: "",
                    difficulty: "Mittel",
                    completed: false,
                  },
                  {
                    id: 2001,
                    chapter: 10,
                    title: "K1-T1",
                    order: 1,
                    task_type: "multiple_choice",
                    description: "",
                    difficulty: "Mittel",
                    completed: false,
                  },
                ],
                articles: [
                  {
                    id: 3002,
                    title: "K1-A2",
                    order: 2,
                    url: null,
                    json_content: null,
                  },
                  {
                    id: 3001,
                    title: "K1-A1",
                    order: 1,
                    url: null,
                    json_content: null,
                  },
                ],
              },
            ],
            article_images: {},
          },
        ]),
      ),
    );

    const wrapper = ({ children }: any) => (
      <AuthProvider>
        <ModuleProvider>{children}</ModuleProvider>
      </AuthProvider>
    );

    const { result } = renderHook(() => useModules(), { wrapper });

    // Aufgeladenen Zustand abwarten (robuster als nur auf length zu prüfen)
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.modules).toHaveLength(1);

    const mod = result.current.modules[0];

    // 🔽 flatten über Chapter in der Reihenfolge der Kapitel (K2, dann K1)
    const contents = result.current.getAllModuleContents(mod.id);
    const tasks = result.current.getAllModuleTasks(mod.id);
    const articles = result.current.getAllModuleArticles(mod.id);

    // ✅ Contents: erst K2 (nach order: C1, C2), dann K1 (C1, C2)
    expect(contents.map((c) => c.title)).toEqual([
      "K2-C1",
      "K2-C2",
      "K1-C1",
      "K1-C2",
    ]);
    expect(contents.map((c) => c.order)).toEqual([1, 2, 1, 2]);

    // ✅ Tasks: erst K2 (T1, T2), dann K1 (T1, T2)
    expect(tasks.map((t) => t.title)).toEqual([
      "K2-T1",
      "K2-T2",
      "K1-T1",
      "K1-T2",
    ]);
    expect(tasks.map((t) => t.order)).toEqual([1, 2, 1, 2]);

    // ✅ Articles: erst K2 (A1, A2), dann K1 (A1, A2)
    expect(articles.map((a) => a.title)).toEqual([
      "K2-A1",
      "K2-A2",
      "K1-A1",
      "K1-A2",
    ]);
    expect(articles.map((a) => a.order)).toEqual([1, 2, 1, 2]);
  });

  /**
   * 3) Unbekannte Modul-ID → leere Arrays
   */
  it("getAllModuleTasks und getAllModuleContents gibt leeres Array zurück, wenn Modul nicht existiert", async () => {
    server.use(
      http.get(API("modules/user/"), () =>
        HttpResponse.json([
          {
            id: 1,
            title: "Mod",
            category: { id: 1, name: "Cat" },
            is_public: true,
            chapters: [],
            articles: [],
            article_images: {},
          },
        ]),
      ),
    );

    const wrapper = ({ children }: any) => (
      <AuthProvider>
        <ModuleProvider>{children}</ModuleProvider>
      </AuthProvider>
    );
    const { result } = renderHook(() => useModules(), { wrapper });

    await result.current.fetchModules();
    await waitFor(() => expect(result.current.modules.length).toBe(1));

    expect(result.current.getAllModuleTasks(999)).toEqual([]);
    expect(result.current.getAllModuleContents(999)).toEqual([]);
  });

  /**
   * 4) Stabilität: gleiche Referenz bei mehrfacher Abfrage ohne Datenänderung
   */
  it("getAllModuleTasks und getAllModuleContents liefert stabile Array-Referenzen innerhalb derselben Datenlage", async () => {
    server.use(
      http.get(API("modules/user/"), () =>
        HttpResponse.json([
          {
            id: 1,
            title: "Mod Stable",
            category: { id: 1, name: "Cat" },
            is_public: true,
            chapters: [
              {
                id: 10,
                title: "K1",
                order: 1,
                description: "",
                is_active: true,
                contents: [
                  {
                    id: 1000,
                    chapter: 10,
                    title: "C1",
                    order: 1,
                    description: "",
                  },
                ],
                tasks: [
                  {
                    id: 2000,
                    chapter: 10,
                    title: "T1",
                    order: 1,
                    task_type: "multiple_choice",
                    description: "",
                    difficulty: "Mittel",
                    completed: false,
                  },
                ],
              },
            ],
            articles: [],
            article_images: {},
          },
        ]),
      ),
    );

    const wrapper = ({ children }: any) => (
      <AuthProvider>
        <ModuleProvider>{children}</ModuleProvider>
      </AuthProvider>
    );
    const { result } = renderHook(() => useModules(), { wrapper });

    await result.current.fetchModules();
    await waitFor(() => expect(result.current.modules.length).toBe(1));

    const mod = result.current.modules[0];

    const tasksA = result.current.getAllModuleTasks(mod.id);
    const tasksB = result.current.getAllModuleTasks(mod.id);
    const contentsA = result.current.getAllModuleContents(mod.id);
    const contentsB = result.current.getAllModuleContents(mod.id);

    // gleiche Referenz -> kein unnötiger Neuaufbau
    expect(tasksA).toBe(tasksB);
    expect(contentsA).toBe(contentsB);
  });
});
