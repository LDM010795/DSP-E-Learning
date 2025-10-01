import { ModuleProvider, useModules } from "@/context/ModuleContext";
import * as authHook from "@/context/AuthContext";

import {
    act,
    render,
    renderHook,
    screen,
    waitFor,
    within,
} from "@testing-library/react";
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
                <div>Modul: {m.title}, Id: {m.id}</div>
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
    isLoading: false
});

describe("ModuleContext", () => {
    it("ModuleProvider initializes modules, isLoading and error correctly", async () => {
        server.use(
            http.get(API("modules/user/"), () => {
                return HttpResponse.json(
                    [
                        {
                            id: 1,
                            title: "Python Grundlagen",
                            category: "Programmierung",
                            is_public: true
                        },
                        {
                            id: 2,
                            title: "Python, fortgeschritten",
                            category: "Programmierung",
                            is_public: false
                        }
                    ]
                )
            })
        )

        render(
            <AuthProvider>
                <ModuleProvider>
                    <DummyComponent />
                </ModuleProvider>,
            </AuthProvider>
        );

        await waitFor(() => {
            expect(screen.getByText("modules count: 2")).toBeDefined();
            expect(screen.getByText("Modul: Python Grundlagen, Id: 1")).toBeDefined();
            expect(screen.getByText("Modul: Python, fortgeschritten, Id: 2")).toBeDefined();
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
            </AuthProvider>
        );
        expect(screen.getByTestId("child")).toBeDefined();
        expect(screen.getByText("Child Component")).toBeDefined();
    });

    it("ModuleContext sorts modules, chapters, contents and tasks", async () => {
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
                                    { id: 1001, title: "C2", order: 2, description: "", video_url: undefined },
                                    { id: 1000, title: "C1", order: 1, description: "", video_url: undefined },
                                ],
                                tasks: [
                                    { id: 2001, title: "T2", description: "", difficulty: "Mittel", order: 2, task_type: "multiple_choice", completed: false },
                                    { id: 2000, title: "T1", description: "", difficulty: "Mittel", order: 1, task_type: "multiple_choice", completed: false },
                                ],
                                description: "",
                                is_active: true,
                            },
                            {
                                id: 100,
                                title: "Kapitel 1",
                                order: 1,
                                contents: [
                                    { id: 1002, title: "C3", order: 1, description: "", video_url: undefined },
                                ],
                                tasks: [],
                                description: "",
                                is_active: true,
                            },
                        ],
                        contents: [{ id: 3000, title: "Old Content", order: 1, description: "", video_url: undefined }],
                        tasks: [{ id: 4000, title: "Old Task", order: 1, description: "", difficulty: "Mittel", task_type: "multiple_choice", completed: false }],
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
                                contents: [{ id: 1003, title: "C4", order: 1, description: "", video_url: undefined }],
                                tasks: [
                                    { id: 2002, title: "T3", description: "", difficulty: "Mittel", order: 1, task_type: "multiple_choice", completed: false },
                                ],
                                description: "",
                                is_active: true,
                            },
                        ],
                        contents: [],
                        tasks: [],
                    },
                ])
            )
        );

        const wrapper = ({ children }: any) => (
            <AuthProvider>
                <ModuleProvider>{children}</ModuleProvider>
            </AuthProvider>
        );

        const { result } = renderHook(() => useModules(), { wrapper });
        await result.current.fetchModules();

        // Warten, bis modules State gefüllt ist
        await waitFor(() => {
            expect(result.current.modules.length).toBeGreaterThan(0);
        });

        const sortedModules = result.current.modules;

        // Module-Titel sortiert
        expect(sortedModules.map((m) => m.title)).toEqual(["Python Fortgeschritten", "Python Grundlagen"]);

        // Chapters "Python Grundlagen"
        const chapters = sortedModules.find((m) => m.title === "Python Grundlagen")!.chapters!;
        expect(chapters.map((c) => c.title)).toEqual(["Kapitel 1", "Kapitel 2"]);

        // Contents Kapitel 2
        const chapter2Contents = chapters.find((c) => c.title === "Kapitel 2")!.contents!;
        expect(chapter2Contents.map((c) => c.title)).toEqual(["C1", "C2"]);

        // Tasks Kapitel 2
        const chapter2Tasks = chapters.find((c) => c.title === "Kapitel 2")!.tasks!;
        expect(chapter2Tasks.map((t) => t.title)).toEqual(["T1", "T2"]);
    });

    it("sorts fallback contents and tasks correctly", async () => {
        server.use(
            http.get(API("modules/user/"), () =>
                HttpResponse.json([
                    {
                        id: 1,
                        title: "Python Grundlagen",
                        category: { id: 1, name: "Programmierung" },
                        is_public: true,
                        // fallback arrays direkt im Modul
                        contents: [
                            { id: 3002, title: "Content C", order: 3, description: "", video_url: undefined },
                            { id: 3000, title: "Content A", order: 1, description: "", video_url: undefined },
                            { id: 3001, title: "Content B", order: 2, description: "", video_url: undefined },
                        ],
                        tasks: [
                            { id: 4002, title: "Task C", description: "", difficulty: "Mittel", order: 3, task_type: "multiple_choice", completed: false },
                            { id: 4000, title: "Task A", description: "", difficulty: "Mittel", order: 1, task_type: "multiple_choice", completed: false },
                            { id: 4001, title: "Task B", description: "", difficulty: "Mittel", order: 2, task_type: "multiple_choice", completed: false },
                        ],
                    },
                ])
            )
        );

        const wrapper = ({ children }: any) => (
            <AuthProvider>
                <ModuleProvider>{children}</ModuleProvider>
            </AuthProvider>
        );

        const { result } = renderHook(() => useModules(), { wrapper });
        await result.current.fetchModules();

        await waitFor(() => {
            expect(result.current.modules.length).toBe(1);
        });

        const module = result.current.modules[0];

        // Prüfe, dass Fallback contents korrekt sortiert wurden
        expect(module.contents!.map((c) => c.title)).toEqual(["Content A", "Content B", "Content C"]);

        // Prüfe, dass Fallback tasks korrekt sortiert wurden
        expect(module.tasks!.map((t) => t.title)).toEqual(["Task A", "Task B", "Task C"]);
    });

    it("sets error when API call fails", async () => {
        server.use(
            http.get(API("modules/user/"), () => {
                return HttpResponse.json({ message: "Server Error" }, { status: 500 });
            })
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

        await waitFor(() => expect(result.current.loading).toBe(false))
    });

    it("does not fetch modules if not authenticated", async () => {
        //mock isAuthenticated: false
        vi.spyOn(authHook, "useAuth").mockReturnValue({
            user: mockUser,
            isAuthenticated: false,
            login: vi.fn(),
            logout: vi.fn(),
            setOAuthLogin: vi.fn(),
            isLoading: false
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
});