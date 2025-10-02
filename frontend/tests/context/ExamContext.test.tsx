/**
 * ExamContext tests
 *
 * Verifies:
 * - No fetching when unauthenticated
 * - Initial fetching when authenticated (user vs. staff)
 * - State updates for available/active/completed/all/teacher data
 * - refreshUserExams / refreshTeacherData actions
 * - startExam triggers POST and refresh
 * - submitExam triggers POST (FormData) and refresh
 * - gradeExam triggers POST and teacher refresh
 * - Error paths set error strings and stop loading flags
 */

// --- HOISTED SPIES ---
const { getSpy, postSpy } = vi.hoisted(() => ({
  getSpy: vi.fn(),
  postSpy: vi.fn(),
}));

vi.mock("../../src/util/apis/api", () => ({
  default: {
    get: (...args: any[]) => getSpy(...args),
    post: (...args: any[]) => postSpy(...args),
  },
}));

// ---- auth mock we can mutate per test ----
const authState: {
  isAuthenticated: boolean;
  user: null | { is_staff?: boolean };
} = {
  isAuthenticated: false,
  user: null,
};

vi.mock("../../src/context/AuthContext", () => ({
  useAuth: () => authState,
}));

// ---- imports AFTER mocks ----
import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import {
  ExamProvider,
  useExams,
  type Exam,
  type ExamAttempt,
} from "../../src/context/ExamContext";

// ---- helper consumer to read/use context ----
const Consumer: React.FC = () => {
  const ctx = useExams();
  return (
    <div>
      <div data-testid="available">{ctx.availableExams.length}</div>
      <div data-testid="active">{ctx.activeExams.length}</div>
      <div data-testid="completed">{ctx.completedExams.length}</div>
      <div data-testid="all">{ctx.allExams.length}</div>
      <div data-testid="teacher">{ctx.teacherSubmissions.length}</div>

      <div data-testid="loading-user">{String(ctx.loadingUserExams)}</div>
      <div data-testid="loading-all">{String(ctx.loadingAllExams)}</div>
      <div data-testid="loading-teacher">{String(ctx.loadingTeacherData)}</div>

      <div data-testid="err-user">{ctx.errorUserExams ?? ""}</div>
      <div data-testid="err-all">{ctx.errorAllExams ?? ""}</div>
      <div data-testid="err-teacher">{ctx.errorTeacherData ?? ""}</div>

      <button onClick={ctx.refreshUserExams}>refresh-user</button>
      <button onClick={ctx.refreshTeacherData}>refresh-teacher</button>
      <button onClick={() => ctx.startExam(5)}>start-5</button>
      <button onClick={() => ctx.submitExam(77)}>submit-77</button>
      <button
        onClick={() =>
          ctx.gradeExam(88, [{ criterion_id: 1, achieved_points: 10 }], "fb")
        }
      >
        grade-88
      </button>
    </div>
  );
};

// ---- fixtures ----
const mkExam = (id: number): Exam => ({
  id,
  exam_title: `Exam ${id}`,
  exam_description: "desc",
  exam_difficulty: "medium",
  exam_duration_week: 2,
  created_at: "2025-01-01T00:00:00.000Z",
  updated_at: "2025-01-02T00:00:00.000Z",
  modules: [],
  criteria: [],
  requirements: [],
});

const mkAttempt = (id: number): ExamAttempt => ({
  id,
  exam: mkExam(id),
  user: { id: 1, username: "u" },
  status: "started",
  started_at: "2025-09-01T00:00:00.000Z",
  submitted_at: null,
  graded_at: null,
  score: null,
  feedback: null,
  due_date: null,
  remaining_days: null,
  processing_time_days: null,
  criterion_scores: [],
  attachments: [],
  graded_by: null,
});

// ---- render helper ----
const renderProvider = () =>
  render(
    <ExamProvider>
      <Consumer />
    </ExamProvider>,
  );

describe("ExamContext", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authState.isAuthenticated = false;
    authState.user = null;
  });

  test("does not fetch when unauthenticated", () => {
    renderProvider();
    expect(getSpy).not.toHaveBeenCalled();
    expect(screen.getByTestId("available").textContent).toBe("0");
    expect(screen.getByTestId("all").textContent).toBe("0");
  });

  test("fetches user + all exams when authenticated (non-staff)", async () => {
    authState.isAuthenticated = true;
    authState.user = { is_staff: false };

    getSpy.mockImplementation((url: string) => {
      if (url.endsWith("/exams/my-exams/available/")) {
        return Promise.resolve({ data: [mkExam(1)] });
      }
      if (url.endsWith("/exams/my-exams/active/")) {
        return Promise.resolve({ data: [mkAttempt(2)] });
      }
      if (url.endsWith("/exams/my-exams/completed/")) {
        return Promise.resolve({ data: [mkAttempt(3)] });
      }
      if (url.endsWith("/exams/all/")) {
        return Promise.resolve({ data: [mkExam(9), mkExam(10)] });
      }
      return Promise.reject(new Error("unexpected url " + url));
    });

    renderProvider();

    await waitFor(() => {
      expect(screen.getByTestId("available").textContent).toBe("1");
      expect(screen.getByTestId("active").textContent).toBe("1");
      expect(screen.getByTestId("completed").textContent).toBe("1");
      expect(screen.getByTestId("all").textContent).toBe("2");
    });

    expect(getSpy).toHaveBeenCalledTimes(4);
  });

  test("also fetches teacher submissions when staff", async () => {
    authState.isAuthenticated = true;
    authState.user = { is_staff: true };

    getSpy.mockImplementation((url: string) => {
      if (url.endsWith("/exams/my-exams/available/"))
        return Promise.resolve({ data: [] });
      if (url.endsWith("/exams/my-exams/active/"))
        return Promise.resolve({ data: [] });
      if (url.endsWith("/exams/my-exams/completed/"))
        return Promise.resolve({ data: [] });
      if (url.endsWith("/exams/all/"))
        return Promise.resolve({ data: [mkExam(1)] });
      if (url.endsWith("/exams/teacher/submissions/"))
        return Promise.resolve({ data: [mkAttempt(50)] });
      return Promise.reject(new Error("unexpected url " + url));
    });

    renderProvider();

    await waitFor(() => {
      expect(screen.getByTestId("all").textContent).toBe("1");
      expect(screen.getByTestId("teacher").textContent).toBe("1");
    });

    expect(getSpy).toHaveBeenCalledTimes(5);
  });

  test("refreshUserExams triggers the three my-exams endpoints again", async () => {
    authState.isAuthenticated = true;
    authState.user = { is_staff: false };

    getSpy
      .mockResolvedValueOnce({ data: [] }) // available (mount)
      .mockResolvedValueOnce({ data: [] }) // active (mount)
      .mockResolvedValueOnce({ data: [] }) // completed (mount)
      .mockResolvedValueOnce({ data: [] }) // all (mount)
      // refresh sequence (3 calls)
      .mockResolvedValueOnce({ data: [mkExam(2)] }) // available
      .mockResolvedValueOnce({ data: [mkAttempt(22)] }) // active
      .mockResolvedValueOnce({ data: [mkAttempt(33)] }); // completed

    renderProvider();

    fireEvent.click(screen.getByText("refresh-user"));

    await waitFor(() => {
      expect(screen.getByTestId("available").textContent).toBe("1");
      expect(screen.getByTestId("active").textContent).toBe("1");
      expect(screen.getByTestId("completed").textContent).toBe("1");
    });

    expect(getSpy).toHaveBeenCalledTimes(7); // 4 on mount + 3 on refresh
  });

  test("startExam posts and then refreshes user exams", async () => {
    authState.isAuthenticated = true;
    authState.user = { is_staff: false };

    // initial fetch
    getSpy
      .mockResolvedValueOnce({ data: [] }) // available
      .mockResolvedValueOnce({ data: [] }) // active
      .mockResolvedValueOnce({ data: [] }) // completed
      .mockResolvedValueOnce({ data: [] }); // all

    // start POST
    postSpy.mockResolvedValueOnce({ data: mkAttempt(123) });

    // refresh after start
    getSpy
      .mockResolvedValueOnce({ data: [mkExam(1)] }) // available
      .mockResolvedValueOnce({ data: [mkAttempt(2)] }) // active
      .mockResolvedValueOnce({ data: [] }); // completed

    renderProvider();

    fireEvent.click(screen.getByText("start-5"));

    await waitFor(() => {
      expect(postSpy).toHaveBeenCalledWith("/exams/5/start/");
      expect(screen.getByTestId("available").textContent).toBe("1");
      expect(screen.getByTestId("active").textContent).toBe("1");
    });
  });

  test("submitExam posts form-data and refreshes user exams", async () => {
    authState.isAuthenticated = true;
    authState.user = { is_staff: false };

    // initial fetch
    getSpy
      .mockResolvedValueOnce({ data: [] })
      .mockResolvedValueOnce({ data: [] })
      .mockResolvedValueOnce({ data: [] })
      .mockResolvedValueOnce({ data: [] });

    postSpy.mockResolvedValueOnce({}); // submit

    // refresh after submit
    getSpy
      .mockResolvedValueOnce({ data: [] })
      .mockResolvedValueOnce({ data: [mkAttempt(99)] })
      .mockResolvedValueOnce({ data: [] });

    renderProvider();

    fireEvent.click(screen.getByText("submit-77"));

    await waitFor(() => {
      expect(postSpy.mock.calls[0][0]).toBe("/exams/attempts/77/submit/");
      expect(screen.getByTestId("active").textContent).toBe("1");
    });
  });

  test("gradeExam posts and refreshes teacher submissions", async () => {
    authState.isAuthenticated = true;
    authState.user = { is_staff: true };

    // initial fetch (includes teacher)
    getSpy
      .mockResolvedValueOnce({ data: [] })
      .mockResolvedValueOnce({ data: [] })
      .mockResolvedValueOnce({ data: [] })
      .mockResolvedValueOnce({ data: [] })
      .mockResolvedValueOnce({ data: [] });

    postSpy.mockResolvedValueOnce({}); // grade

    // refresh teacher after grade
    getSpy.mockResolvedValueOnce({ data: [mkAttempt(7)] });

    renderProvider();

    fireEvent.click(screen.getByText("grade-88"));

    await waitFor(() => {
      expect(postSpy).toHaveBeenCalledWith(
        "/exams/teacher/submissions/88/grade/",
        {
          criterion_scores: [{ criterion_id: 1, achieved_points: 10 }],
          feedback: "fb",
        },
      );
      expect(getSpy).toHaveBeenLastCalledWith("/exams/teacher/submissions/");
      expect(screen.getByTestId("teacher").textContent).toBe("1");
    });
  });

  test("error handling: sets error strings and ends loading", async () => {
    authState.isAuthenticated = true;
    authState.user = { is_staff: false };

    // Fail "available" and "all"
    getSpy.mockImplementation((url: string) => {
      if (url.endsWith("/exams/my-exams/available/")) {
        return Promise.reject(new Error("boom available"));
      }
      if (url.endsWith("/exams/my-exams/active/")) {
        return Promise.resolve({ data: [] });
      }
      if (url.endsWith("/exams/my-exams/completed/")) {
        return Promise.resolve({ data: [] });
      }
      if (url.endsWith("/exams/all/")) {
        return Promise.reject(new Error("boom all"));
      }
      return Promise.reject(new Error("unexpected url " + url));
    });

    renderProvider();

    await waitFor(() => {
      expect(screen.getByTestId("err-user").textContent).toMatch(
        /Fehler beim Laden der Prüfungsdaten/,
      );
      expect(screen.getByTestId("err-all").textContent).toMatch(
        /Fehler beim Laden der Prüfungen/,
      );
      expect(screen.getByTestId("loading-user").textContent).toBe("false");
      expect(screen.getByTestId("loading-all").textContent).toBe("false");
    });
  });
});
