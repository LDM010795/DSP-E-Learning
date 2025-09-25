/**
 * These tests verify that TableUserList correctly:
 *  - Renders user rows and top statistics
 *  - Shows StatusBadge (Aktiv/Inaktiv) and RoleBadge (User/Staff/Admin)
 *  - Delete button appears only for non-staff/non-admin users and calls onDelete
 *  - Sorts by columns (e.g., Username) when clicking headers
 *  - Loading and empty states
 *
 * Approach:
 *  - Provide simple user fixtures and stats
 *  - Mock `formatDate` to keep output deterministic
 *  - Assert visible text and button behavior from a user perspective
 *
 * Authors: DSP Development Team
 * Date: 23-09-2025
 */

import { render, screen, fireEvent, within } from "@testing-library/react";
import TableUserList from "../../../src/components/tables/table_user_list.tsx";

// Mock formatDate to return a simple ISO-like string so tests are stable
vi.mock("../../../src/util/helpers/formatDate.ts", () => ({
  formatDate: (iso: string, _opts?: unknown) => {
    // return YYYY-MM-DD if possible
    const d = new Date(iso);
    if (isNaN(d.getTime())) return "Invalid";
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
  },
}));

type User = {
  id: number;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  is_active: boolean;
  is_staff: boolean;
  is_superuser: boolean;
  date_joined: string;
  last_login: string | null;
};

type UserStats = {
  totalUsers: number;
  staffUsers: number;
  superUsers: number;
  activeUsers: number;
  inactiveUsers: number;
};

function makeUser(
  id: number,
  username: string,
  {
    email = `${username}@example.com`,
    first_name = "",
    last_name = "",
    is_active = true,
    is_staff = false,
    is_superuser = false,
    date_joined = "2025-01-01T00:00:00Z",
    last_login = "2025-01-02T12:00:00Z",
  }: Partial<User> = {},
): User {
  return {
    id,
    username,
    email,
    first_name,
    last_name,
    is_active,
    is_staff,
    is_superuser,
    date_joined,
    last_login,
  };
}

const baseStats: UserStats = {
  totalUsers: 3,
  staffUsers: 1,
  superUsers: 1,
  activeUsers: 2,
  inactiveUsers: 1,
};

describe("TableUserList", () => {
  test("renders stats and user rows with badges and dates", () => {
    const users: User[] = [
      makeUser(1, "alice", {
        first_name: "Alice",
        last_name: "A",
        is_active: true,
        is_staff: false,
        is_superuser: false,
      }),
      makeUser(2, "bob", {
        first_name: "Bob",
        last_name: "B",
        is_active: false,
        is_staff: true,
        is_superuser: false,
      }),
      makeUser(3, "admin", {
        first_name: "Root",
        last_name: "User",
        is_active: true,
        is_staff: true,
        is_superuser: true,
      }),
    ];

    render(
      <TableUserList
        users={users}
        isLoading={false}
        onDelete={() => {}}
        stats={baseStats}
      />,
    );

    // Top stats (labels exist)
    // Gesamt card
    const grid = screen.getByText("Gesamt").parentElement!
      .parentElement as HTMLElement;

    // Gesamt card
    const gesamtLabel = within(grid).getByText("Gesamt");
    const totalCard = gesamtLabel.parentElement as HTMLElement;
    expect(
      within(totalCard).getByText(String(baseStats.totalUsers)),
    ).toBeInTheDocument();

    // Aktiv card
    const aktivLabel = within(grid).getAllByText("Aktiv")[0];
    const aktivCard = aktivLabel.parentElement as HTMLElement;
    expect(
      within(aktivCard).getByText(String(baseStats.activeUsers)),
    ).toBeInTheDocument();

    // Inaktiv card
    const inaktivLabel = within(grid).getAllByText("Inaktiv")[0];
    const inaktivCard = inaktivLabel.parentElement as HTMLElement;
    expect(
      within(inaktivCard).getByText(String(baseStats.inactiveUsers)),
    ).toBeInTheDocument();

    // Staff card
    const staffLabel = within(grid).getByText("Staff");
    const staffCard = staffLabel.parentElement as HTMLElement;
    expect(
      within(staffCard).getByText(String(baseStats.staffUsers)),
    ).toBeInTheDocument();

    // Admins card
    const adminLabel = within(grid).getByText("Admins");
    const adminCard = adminLabel.parentElement as HTMLElement;
    expect(
      within(adminCard).getByText(String(baseStats.superUsers)),
    ).toBeInTheDocument();

    // Usernames and emails
    expect(screen.getByText("alice")).toBeInTheDocument();
    expect(screen.getByText("alice@example.com")).toBeInTheDocument();
    expect(screen.getByText("bob")).toBeInTheDocument();
    expect(screen.getByText("bob@example.com")).toBeInTheDocument();
    expect(screen.getByText("admin")).toBeInTheDocument();
    expect(screen.getByText("admin@example.com")).toBeInTheDocument();

    // Full names or placeholder for empty
    expect(screen.getByText("Alice A")).toBeInTheDocument();
    expect(screen.getByText("Bob B")).toBeInTheDocument();
    // admin full name shown:
    expect(screen.getByText("Root User")).toBeInTheDocument();

    // Status badges (Aktiv/Inaktiv)
    expect(screen.getAllByText("Aktiv").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Inaktiv").length).toBeGreaterThan(0);

    // Role badges (User/Staff/Admin)
    expect(screen.getAllByText("Staff").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Admin").length).toBeGreaterThan(0);
    expect(screen.getAllByText("User").length).toBeGreaterThan(0);

    // Dates (formatted by mocked formatDate)
    // date_joined uses options -> still mocked to YYYY-MM-DD
    expect(screen.getAllByText("2025-01-01").length).toBeGreaterThan(0);
    // last_login -> string or "Nie"
    expect(screen.getAllByText("2025-01-02").length).toBeGreaterThan(0);
  });

  test("shows delete button only for non-staff/non-admin and calls onDelete", () => {
    const users: User[] = [
      makeUser(1, "alice", { is_staff: false, is_superuser: false }),
      makeUser(2, "bob", { is_staff: true, is_superuser: false }),
      makeUser(3, "root", { is_staff: true, is_superuser: true }),
    ];
    const onDelete = vi.fn();

    render(
      <TableUserList
        users={users}
        isLoading={false}
        onDelete={onDelete}
        stats={baseStats}
      />,
    );

    // There should be a delete button for alice, but not for bob or root
    const rows = screen.getAllByRole("row");
    // skip header row
    const dataRows = rows.slice(1);

    // Find row containing 'alice'
    const aliceRow = dataRows.find((r) => within(r).queryByText("alice"));
    expect(aliceRow).toBeTruthy();
    const aliceDelete = within(aliceRow as HTMLElement).getByTitle(
      "Benutzer löschen",
    );
    fireEvent.click(aliceDelete);
    expect(onDelete).toHaveBeenCalledWith(1);

    // Bob row: no delete button
    const bobRow = dataRows.find((r) => within(r).queryByText("bob"));
    expect(bobRow).toBeTruthy();
    expect(
      within(bobRow as HTMLElement).queryByTitle("Benutzer löschen"),
    ).toBeNull();

    // Root row: no delete button
    const rootRow = dataRows.find((r) => within(r).queryByText("root"));
    expect(rootRow).toBeTruthy();
    expect(
      within(rootRow as HTMLElement).queryByTitle("Benutzer löschen"),
    ).toBeNull();
  });

  test("renders loading state", () => {
    render(
      <TableUserList
        users={[]}
        isLoading={true}
        onDelete={() => {}}
        stats={{ ...baseStats, totalUsers: 0 }}
      />,
    );
    expect(screen.getByText("Lade Benutzer...")).toBeInTheDocument();
  });

  test("renders empty state when no users", () => {
    render(
      <TableUserList
        users={[]}
        isLoading={false}
        onDelete={() => {}}
        stats={{
          ...baseStats,
          totalUsers: 0,
          activeUsers: 0,
          inactiveUsers: 0,
          staffUsers: 0,
          superUsers: 0,
        }}
      />,
    );
    expect(screen.getByText("Keine Benutzer gefunden.")).toBeInTheDocument();
  });

  test("sorts by Username when header is clicked (asc/desc)", () => {
    const users: User[] = [
      makeUser(1, "charlie", {}),
      makeUser(2, "alice", {}),
      makeUser(3, "bob", {}),
    ];
    render(
      <TableUserList
        users={users}
        isLoading={false}
        onDelete={() => {}}
        stats={baseStats}
      />,
    );

    // Click "Username" to sort ascending
    fireEvent.click(screen.getByText("Username"));

    // grab the first column text content order
    const usernameCellsAsc = screen
      .getAllByRole("row")
      .slice(1)
      .map((row) => within(row).getAllByRole("cell")[0].textContent);
    expect(usernameCellsAsc).toEqual(["alice", "bob", "charlie"]);

    // Click again -> desc
    fireEvent.click(screen.getByText("Username"));
    const usernameCellsDesc = screen
      .getAllByRole("row")
      .slice(1)
      .map((row) => within(row).getAllByRole("cell")[0].textContent);
    expect(usernameCellsDesc).toEqual(["charlie", "bob", "alice"]);
  });
});
