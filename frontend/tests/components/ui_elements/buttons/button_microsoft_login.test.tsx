// MicrosoftLoginButton.test.tsx
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import MicrosoftLoginButton from "@components/ui_elements/buttons/button_microsoft_login.tsx";

// Mock the hook
const mockLoginWithMicrosoft = vi.fn();
const mockClearError = vi.fn();

vi.mock("@/hooks/use_microsoft_auth.ts", () => ({
  useMicrosoftAuth: vi.fn(() => ({
    isLoading: false,
    error: null,
    loginWithMicrosoft: mockLoginWithMicrosoft,
    clearError: mockClearError,
  })),
}));

import { useMicrosoftAuth} from "@/hooks/use_microsoft_auth.ts";

describe("MicrosoftLoginButton", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default mock return
    (useMicrosoftAuth as any).mockReturnValue({
      isLoading: false,
      error: null,
      loginWithMicrosoft: mockLoginWithMicrosoft,
      clearError: mockClearError,
    });
  });

  it("renders the button with correct text", () => {
    render(<MicrosoftLoginButton />);
    expect(screen.getByRole("button", { name: /mit microsoft anmelden/i })).toBeInTheDocument();
  });

  it("applies additional className", () => {
    render(<MicrosoftLoginButton className="custom-class" />);
    const button = screen.getByRole("button");
    expect(button).toHaveClass("custom-class");
  });

  it("disables the button if `disabled` prop is true", () => {
    render(<MicrosoftLoginButton disabled />);
    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
  });

  it("calls loginWithMicrosoft and onSuccess on click", async () => {
    mockLoginWithMicrosoft.mockResolvedValueOnce(undefined);
    const onSuccess = vi.fn();
    render(<MicrosoftLoginButton onSuccess={onSuccess} />);

    const button = screen.getByRole("button");
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockClearError).toHaveBeenCalled();
      expect(mockLoginWithMicrosoft).toHaveBeenCalled();
      expect(onSuccess).toHaveBeenCalled();
    });
  });

  it("calls onError if loginWithMicrosoft throws an error", async () => {
    mockLoginWithMicrosoft.mockRejectedValueOnce(new Error("Login failed"));
    const onError = vi.fn();
    render(<MicrosoftLoginButton onError={onError} />);

    const button = screen.getByRole("button");
    fireEvent.click(button);

    await waitFor(() => {
      expect(onError).toHaveBeenCalledWith("Login failed");
    });
  });

  it("calls onError if hook returns an error", async () => {
    (useMicrosoftAuth as any).mockReturnValue({
      isLoading: false,
      error: "Hook error",
      loginWithMicrosoft: mockLoginWithMicrosoft,
      clearError: mockClearError,
    });

    const onError = vi.fn();
    render(<MicrosoftLoginButton onError={onError} />);

    await waitFor(() => {
      expect(onError).toHaveBeenCalledWith("Hook error");
    });
  });

  it("shows loading state when isLoading is true", () => {
    (useMicrosoftAuth as any).mockReturnValue({
      isLoading: true,
      error: null,
      loginWithMicrosoft: mockLoginWithMicrosoft,
      clearError: mockClearError,
    });

    render(<MicrosoftLoginButton />);
    expect(screen.getByText(/anmeldung läuft/i)).toBeInTheDocument();
    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
  });
});