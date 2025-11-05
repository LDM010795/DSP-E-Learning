import api from "./api";

export type DashboardEventType = "Meilenstein" | "Prüfung" | "Aufgabe";

export interface DashboardEvent {
  id: string;
  title: string;
  date_iso: string; // YYYY-MM-DD
  type: DashboardEventType;
}

export interface DashboardModule {
  id: string | number;
  title: string;
  study_time_hours: number;
  lessons_done: number;
  lessons_total: number;
  progress_percent: number;
}

export interface DashboardPayload {
  greeting_name: string;
  week_streak_days: number;
  weekly_learning_hours: number;
  modules_completed: number;
  current_goal_percent: number;
  active_modules: DashboardModule[];
  upcoming_events: DashboardEvent[];
}

export async function getDashboard(): Promise<DashboardPayload> {
  // baseURL from api.ts
  const { data } = await api.get<DashboardPayload>("/dashboard/");
  return data;
}
