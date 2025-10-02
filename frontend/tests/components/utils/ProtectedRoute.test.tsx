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

  it("shows loading indicator when isLoading is true", () => {
    useAuthMock.mockReturnValue({
      isLoading: true,
    });

    renderWithRouter();
    expect(
      screen.getByText("Authentifizierung wird geprüft..."),
    ).toBeInTheDocument();
  });

  it("redirects to login when not authenticated", () => {
    useAuthMock.mockReturnValue({
      isAuthenticated: false,
    });

    renderWithRouter();
    expect(screen.getByText("Login Page")).toBeInTheDocument();
  });

  it("renders outlet when authenticated", () => {
    useAuthMock.mockReturnValue({
      isAuthenticated: true,
    });

    renderWithRouter();
    expect(screen.getByText("Protected Content")).toBeInTheDocument();
  });
});
