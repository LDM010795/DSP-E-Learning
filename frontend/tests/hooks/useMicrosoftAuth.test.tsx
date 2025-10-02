import {
  render,
  screen,
  cleanup,
  waitFor,
  fireEvent,
} from "@testing-library/react";
import { useMicrosoftAuth } from "../../src/hooks/useMicrosoftAuth";
import { MemoryRouter } from "react-router-dom";
import * as AuthModule from "@/context/AuthContext";
import {
  MicrosoftCallbackRequest,
  MicrosoftAuthResponse,
} from "@/util/apis/microsoft_auth";

// Mocking

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await import("react-router-dom");
  return { ...actual, useNavigate: () => mockNavigate };
});

const { authWithMs, startMsLogin, extractCallback, cleanupUrl } = vi.hoisted(
  () => ({
    authWithMs:
      vi.fn<
        (
          callbackData: MicrosoftCallbackRequest,
        ) => Promise<MicrosoftAuthResponse>
      >(),
    startMsLogin: vi.fn(),
    extractCallback:
      vi.fn<
        () => {
          code?: string;
          state?: string;
          error?: string;
          errorDescription?: string;
        }
      >(),
    cleanupUrl: vi.fn(),
  }),
);
vi.mock("@/util/apis/microsoft_auth", async () => ({
  authenticateWithMicrosoft: authWithMs,
  startMicrosoftLogin: startMsLogin,
  checkMicrosoftUserStatus: vi.fn(),
  extractCallbackFromUrl: extractCallback,
  cleanupUrlAfterAuth: cleanupUrl,
}));

// ---- test component that uses the hook ----

function MicrosoftAuthTestComponent() {
  const {
    isLoading,
    error,
    isAuthenticated,
    loginWithMicrosoft,
    handleMicrosoftCallback,
    clearError,
    resetOAuthSession,
  } = useMicrosoftAuth();

  return (
    <div>
      <div data-testid="isLoading">{String(isLoading)}</div>
      <div data-testid="error">{error ?? ""}</div>
      <div data-testid="isAuthenticated">{String(isAuthenticated)}</div>
      <button data-testid="login" onClick={loginWithMicrosoft}>
        loginWithMicrosoft
      </button>
      <button data-testid="callback" onClick={handleMicrosoftCallback}>
        handleMicrosoftCallback
      </button>
      <button data-testid="clearError" onClick={clearError}>
        clearError
      </button>
      <button data-testid="reset" onClick={resetOAuthSession}>
        resetOAuthSession
      </button>
    </div>
  );
}

function renderWithProviders() {
  render(
    <MemoryRouter>
      <AuthModule.AuthProvider>
        <MicrosoftAuthTestComponent />
      </AuthModule.AuthProvider>
    </MemoryRouter>,
  );
}

describe("useMicrosoftAuth", () => {
  it("should render the initial hook state correctly", async () => {
    extractCallback.mockReturnValueOnce({});
    renderWithProviders();

    // Booleans
    await waitFor(() => {
      expect(screen.getByTestId("isLoading").textContent).toBe("false");
      expect(screen.getByTestId("isAuthenticated").textContent).toBe("false");

      // Error
      expect(screen.getByTestId("error").textContent).toBe("");

      expect(screen.getByTestId("login")).toBeInTheDocument();
      expect(screen.getByTestId("callback")).toBeInTheDocument();
      expect(screen.getByTestId("clearError")).toBeInTheDocument();
      expect(screen.getByTestId("reset")).toBeInTheDocument();
    });
  });

  it("sets isLoading true, clears error, and calls startMicrosoftLogin", async () => {
    extractCallback.mockReturnValueOnce({});
    renderWithProviders();

    // Vorher: isLoading = false, error = ""
    expect(screen.getByTestId("isLoading").textContent).toBe("false");
    expect(screen.getByTestId("error").textContent).toBe("");

    // Klick auf den Login-Button
    await waitFor(() => fireEvent.click(screen.getByTestId("login")));

    // Sofort nach Klick sollte der State aktualisiert sein
    expect(screen.getByTestId("isLoading").textContent).toBe("true");
    expect(screen.getByTestId("error").textContent).toBe("");

    // startMicrosoftLogin wurde aufgerufen
    expect(startMsLogin).toHaveBeenCalled();
  });

  it("should handle successful OAuth callback", async () => {
    extractCallback.mockReturnValue({ code: "abc123", state: "xyz456" });
    authWithMs.mockResolvedValueOnce({
      success: true,
    } as MicrosoftAuthResponse);

    renderWithProviders();
    fireEvent.click(screen.getByTestId("callback"));

    // Warten bis der State aktualisiert wurde
    await waitFor(() => {
      expect(screen.getByTestId("isLoading").textContent).toBe("false");
    });

    expect(authWithMs).toHaveBeenCalledWith({
      code: "abc123",
      state: "xyz456",
      tool_slug: "e-learning",
    });
    expect(extractCallback).toHaveBeenCalled();
    expect(cleanupUrl).toHaveBeenCalled();
    // prüfung, dass setOAuthLogin() gecallt wird wäre hier schön,
    // aber ich kriege es nicht gemockt.
  });

  it("handles OAuth callback error from URL", async () => {
    extractCallback.mockReturnValue({
      code: "abc",
      state: "xyz",
      error: "some_error",
    });
    renderWithProviders();
    fireEvent.click(screen.getByTestId("callback"));
    await waitFor(() => {
      expect(screen.getByTestId("error").textContent).toContain("some_error");
      // ggf. prüfen, dass navigate("/login") aufgerufen wurde
    });

    // also test clearErrorState
    fireEvent.click(screen.getByTestId("clearError"));
    await waitFor(() => {
      expect(screen.getByTestId("error").textContent).toBe("");
    });
  });

  it("handles authentication failure", async () => {
    extractCallback.mockReturnValue({ code: "abc123", state: "xyz123" });
    authWithMs.mockResolvedValueOnce({
      success: false,
      message: "Auth failed",
    } as any);
    renderWithProviders();
    fireEvent.click(screen.getByTestId("callback"));
    await waitFor(() => {
      expect(screen.getByTestId("error").textContent).toBe("Auth failed");
    });
  });

  it("does not process callback twice", async () => {
    extractCallback.mockReturnValue({ code: "abc123", state: "xyz123" });
    authWithMs.mockResolvedValueOnce({ success: true } as any);
    renderWithProviders();
    const button = screen.getByTestId("callback");
    fireEvent.click(button);
    fireEvent.click(button); // zweite Ausführung
    await waitFor(() => {
      expect(authWithMs).toHaveBeenCalledTimes(1);
    });
  });

  it("clears error state", async () => {
    extractCallback.mockReturnValue({});
    renderWithProviders();
    fireEvent.click(screen.getByTestId("clearError"));
    expect(screen.getByTestId("error").textContent).toBe("");
  });

  it("does not process callback when extractCallbackFromUrl returns incomplete data", async () => {
    // Szenarien: leer, nur code, nur state
    const scenarios = [
      {}, // leer
      { code: "abc123" }, // nur code
      { state: "xyz456" }, // nur state
    ];

    for (const scenario of scenarios) {
      extractCallback.mockReturnValue(scenario);

      renderWithProviders();
      fireEvent.click(screen.getByTestId("callback"));

      await waitFor(() => {
        expect(authWithMs).not.toHaveBeenCalled();
        expect(cleanupUrl).not.toHaveBeenCalled();
      });

      cleanup();
      vi.clearAllMocks();
    }
  });

  it("navigates to /dashboard after successful auth", async () => {
    extractCallback.mockReturnValue({ code: "abc123", state: "xyz456" });
    authWithMs.mockResolvedValueOnce({ success: true } as any);

    renderWithProviders();
    fireEvent.click(screen.getByTestId("callback"));

    await waitFor(() => {
      expect(authWithMs).toHaveBeenCalledWith({
        code: "abc123",
        state: "xyz456",
        tool_slug: "e-learning",
      });
      expect(mockNavigate).toHaveBeenCalledWith("/dashboard");
    });
  });

  it("navigates to /login on error", async () => {
    extractCallback.mockReturnValue({ code: "abc123", state: "xyz456" });
    authWithMs.mockRejectedValueOnce(new Error("invalid grant"));

    renderWithProviders();
    fireEvent.click(screen.getByTestId("callback"));

    await waitFor(() => {
      expect(authWithMs).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith("/login");
    });
  });
});
