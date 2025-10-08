import { render, screen } from "@testing-library/react";
import ProtectedRoute from "@/components/utils/ProtectedRoute";
import { MemoryRouter, Routes, Route } from "react-router-dom";

const { useAuthMock } = vi.hoisted(() => ({
  useAuthMock: vi.fn(),
}));
vi.mock("@/context/AuthContext", async () => ({
  useAuth: useAuthMock,
}));

describe("ProtectedRoute", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  function renderWithRouter(initialPath = "/protected") {
    return render(
      <MemoryRouter initialEntries={[initialPath]}>
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route path="protected" element={<div>Protected Content</div>} />
          </Route>
          <Route path="/" element={<div>Login Page</div>} />
        </Routes>
      </MemoryRouter>,
    );
  }

  it("renders nothing while not initialized", () => {
    useAuthMock.mockReturnValue({
      isInitialized: false,
      isAuthenticated: false,
      isLoading: true,
    });

    const { container } = renderWithRouter();
    expect(container.firstChild).toBeNull();
  });

  it("shows blur overlay while authenticated and loading", () => {
    useAuthMock.mockReturnValue({
      isInitialized: true,
      isAuthenticated: true,
      isLoading: true,
    });

    renderWithRouter();
    expect(screen.getByText("Wird geladen …")).toBeInTheDocument();
  });

  it("redirects to login when not authenticated after init", () => {
    useAuthMock.mockReturnValue({
      isInitialized: true,
      isAuthenticated: false,
      isLoading: false,
    });

    renderWithRouter();
    expect(screen.getByText("Login Page")).toBeInTheDocument();
  });

  it("renders outlet when authenticated and not loading", () => {
    useAuthMock.mockReturnValue({
      isInitialized: true,
      isAuthenticated: true,
      isLoading: false,
    });

    renderWithRouter();
    expect(screen.getByText("Protected Content")).toBeInTheDocument();
  });
});
