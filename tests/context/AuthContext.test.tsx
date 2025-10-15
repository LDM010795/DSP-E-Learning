import { AuthProvider, useAuth } from "@/context/AuthContext";
import {
  act,
  render,
  renderHook,
  screen,
  waitFor,
} from "@testing-library/react";
import { mockUser } from "../testMocks";
import { describe, it } from "vitest";
import { http, HttpResponse } from "msw";
import { server } from "../testServer";

const DummyComponent = () => {
  const { isLoading, isAuthenticated, user } = useAuth();
  return (
    <div>
      <span>isLoading: {isLoading ? "true" : "false"}</span>
      <span>isAuthenticated: {isAuthenticated ? "true" : "false"}</span>
      <span>user: {user ? "defined" : "undefined"}</span>
    </div>
  );
};

const API = (path: string) => `http://127.0.0.1:8000/api/elearning/${path}`;

beforeEach(() => {
  vi.clearAllMocks();
});

describe("AuthContext", () => {
  it("useAuth throws Error if used outside of AuthProvider", () => {
    // Fehler abfangen
    expect(() => render(<DummyComponent />)).toThrow(
      "useAuth must be used within an AuthProvider",
    );
  });

  it("AuthProvider initializes isLoading, isAuthenticated and user correctly", () => {
    render(
      <AuthProvider>
        <DummyComponent />
      </AuthProvider>,
    );

    expect(screen.getByText(/isLoading: true/)).toBeDefined();
    expect(screen.getByText(/isAuthenticated: false/)).toBeDefined();
    expect(screen.getByText(/user: undefined/)).toBeDefined();
  });

  it("AuthProvider renders children", () => {
    render(
      <AuthProvider>
        <div data-testid="child">Child Component</div>
      </AuthProvider>,
    );
    expect(screen.getByTestId("child")).toBeDefined();
    expect(screen.getByText("Child Component")).toBeDefined();
  });

  it("Login happy path", async () => {
    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });

    let loginResult: any;
    await act(async () => {
      loginResult = await result.current.login({
        username: "testuser",
        password: "pass",
      });
    });

    expect(loginResult.success).toBe(true);
    expect(result.current.isAuthenticated).toBe(true);

    expect(result.current.user).toEqual(mockUser);
  });

  it("Login invalid credentials (401)", async () => {
    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });
    server.use(
      http.get(API("users/me"), async () => {
        return HttpResponse.json(mockUser, { status: 401 });
      }),
    );

    let loginResult: any;
    await act(async () => {
      loginResult = await result.current.login({
        username: "wrong",
        password: "wrong",
      });
    });

    expect(loginResult.success).toBe(false);
    expect(loginResult.error).toBe("Ungültige Anmeldedaten.");
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeUndefined();
  });

  it("Login endpoint is called only once", async () => {
    let loginCalled = 0;
    server.use(
      http.post(API("token/"), async ({}) => {
        loginCalled++;
        return HttpResponse.json({ token: 123 });
      }),
    );

    const { result } = await waitFor(() =>
      renderHook(() => useAuth(), { wrapper: AuthProvider }),
    );

    await act(async () => {
      await result.current.login({ username: "testuser", password: "pass" });
    });

    expect(loginCalled).toBe(1);
  });

  it("Login fails when Backend responds with 500", async () => {
    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });
    server.use(
      http.post(API("token/"), async () => {
        throw new Error("Network Error");
      }),
      http.get(API("users/me"), async () =>
        HttpResponse.json({ detail: "Unauthorized" }, { status: 401 }),
      ),
    );

    let loginResult: any;
    await act(async () => {
      loginResult = await result.current.login({
        username: "testuser",
        password: "pass",
      });
    });

    expect(loginResult.success).toBe(false);
    expect(loginResult.error).toBe(
      "Login fehlgeschlagen. Bitte versuchen Sie es später erneut.",
    );
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeUndefined();
    expect(result.current.isLoading).toBe(false);
  });

  it("Logout Happy Path", async () => {
    const { result } = await waitFor(async () =>
      renderHook(() => useAuth(), { wrapper: AuthProvider }),
    );

    await act(async () => {
      await result.current.logout();
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.isLoading).toBe(false);
    expect(sessionStorage.getItem("ms_oauth_processed")).toBeNull();
  });

  it("Logout endpoint is called only once", async () => {
    let logoutCalled = 0;
    server.use(
      http.post(API("users/logout"), async () => {
        logoutCalled++;
        return HttpResponse.json(
          { detail: "Successfully logged out." },
          { status: 205 },
        );
      }),
    );

    const { result } = await waitFor(() =>
      renderHook(() => useAuth(), { wrapper: AuthProvider }),
    );

    await act(async () => {
      await result.current.logout();
    });

    expect(logoutCalled).toBe(1);
  });

  it("successfully logs in via OAuth", async () => {
    const { result } = await waitFor(() =>
      renderHook(() => useAuth(), { wrapper: AuthProvider }),
    );

    await act(async () => {
      await result.current.setOAuthLogin(null);
    });

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user).toEqual(mockUser);
    expect(result.current.isLoading).toBe(false);
  });

  it("fails OAuth login when API returns error", async () => {
    server.use(
      http.get(API("users/me"), async () =>
        HttpResponse.json({ detail: "Unauthorized" }, { status: 401 }),
      ),
    );

    const { result } = await waitFor(() =>
      renderHook(() => useAuth(), { wrapper: AuthProvider }),
    );

    await act(async () => {
      await result.current.setOAuthLogin(null);
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeUndefined();
    expect(result.current.isLoading).toBe(false);
  });

  it("Login mit empty credentials fails", async () => {
    server.use(
      http.get(API("users/me"), async () =>
        HttpResponse.json({ detail: "Unauthorized" }, { status: 401 }),
      ),
    );

    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });

    let loginResult: any;
    await act(async () => {
      loginResult = await result.current.login({ username: "", password: "" });
    });

    expect(loginResult.success).toBe(false);
    expect(loginResult.error).toBe("Ungültige Anmeldedaten.");
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeUndefined();
  });
});
