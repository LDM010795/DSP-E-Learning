/**
 * New Dashboard (mocked data first) - matches the provided design
 */
import React from "react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { getDashboard, type DashboardPayload } from "../util/apis/dashboardApi";
import { useModules, Task as ContextTask } from "../context/ModuleContext";
import {
  IoFlashOutline,
  IoTrophyOutline,
  IoRadioButtonOnOutline,
  IoCalendarOutline,
  IoBookOutline,
  IoTrendingUpOutline
} from "react-icons/io5";
import Breadcrumbs from "../components/ui_elements/breadcrumbs";
import LoadingSpinner from "../components/ui_elements/loading_spinner";
import SubBackground from "../components/layouts/SubBackground";

/* ───────────────────────── Helpers ───────────────────────── */

function daysUntil(dateIso: string) {
  const today = new Date();
  const d = new Date(dateIso + "T00:00:00");
  return Math.max(0, Math.ceil((d.getTime() - today.getTime()) / 86400000));
}

/* ───────────────────────── Small UI atoms ───────────────────────── */

function StreakBadge({ days }: { days: number }) {
  return (
    <div className="bg-[#fff1e9] border border-[var(--color-dsp-orange_light)] rounded-xl px-4 py-3 shadow-sm flex items-center gap-2">
      <IoTrendingUpOutline className="text-[var(--color-dsp-orange)] text-lg" />
      <div>
        <div className="text-[12px] text-[#e5642a] leading-none mb-0.5">
          Wochenstreak
        </div>
        <div className="font-semibold text-[var(--color-dsp-brown)]">
          {days} Tage
        </div>
      </div>
    </div>
  );
}

function StatPill({
  title,
  value,
  gradient,
  icon,
}: {
  title: string;
  value: string | number;
  gradient: "orange" | "green" | "yellow";
  icon?: React.ReactNode;
}) {
  const base =
    "text-white rounded-2xl p-6 shadow-sm flex items-center justify-between";
  const bg =
    gradient === "orange"
      ? "bg-gradient-to-br from-[var(--color-dsp-orange)] to-[var(--color-dsp-orange-gradient)]"
      : gradient === "green"
      ? "bg-gradient-to-br from-emerald-500 to-emerald-600"
      : "bg-gradient-to-br from-amber-500 to-amber-600";
  return (
    <div className={`${base} ${bg}`}>
      <div>
        <div className="opacity-90 text-sm">{title}</div>
        <div className="text-3xl font-extrabold mt-1">{value}</div>
      </div>
      <div className="opacity-90 text-2xl">{icon}</div>
    </div>
  );
}

function ActiveModuleCard({
  m,
}: {
  m: {
    id: string | number;
    title: string;
    study_time_hours?: number;
    lessons_done?: number;
    lessons_total?: number;
    progress_percent?: number;
    tasks_count?: number;
    contents_count?: number;
  };
}) {
  const progress = Math.min(100, Math.max(0, m.progress_percent ?? 0));
  return (
    <div className="bg-white border border-[var(--color-dsp-orange_light)]/40 rounded-2xl
    p-5 shadow-sm transition-all duration-200 hover:shadow-md hover:border-[var(--color-dsp-orange)]/60 hover:-translate-y-0.5">

      <div className="flex items-center justify-between gap-3">
        <h3 className="font-semibold text-[18px] text-[var(--color-dsp-brown)]">
          {m.title}
        </h3>
        <Link
            to={`/modules/${m.id}`}
            className="px-4 py-2 rounded-xl bg-[var(--color-dsp-orange)] text-white font-semibold transition-all duration-200 hover:brightness-110 hover:scale-[1.05] hover:shadow-md active:scale-[0.98]"
        >
            Fortfahren
        </Link>
      </div>

      <div className="flex items-center gap-3 text-sm text-gray-600 mt-2">
        <span>
          ⏱ {(m.study_time_hours ?? 0).toFixed(1)}h
        </span>
        <span>•</span>
        <span>
          {m.lessons_done ?? 0} von {m.lessons_total ?? 0} Lektionen
        </span>
      </div>

      <div className="mt-3">
        <div className="h-3 rounded-full bg-[var(--color-dsp-orange_light)]/60 overflow-hidden">
          <div
            className="h-full bg-[var(--color-dsp-orange)]"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="text-right text-xs text-[var(--color-dsp-orange)] mt-1">
          {progress}%
        </div>
      </div>
    </div>
  );
}

function UpcomingEventCard({
  e,
}: {
  e: { id: string; title: string; date_iso: string; type: "Meilenstein" | "Prüfung" | "Aufgabe" };
}) {
  const dStr = new Date(e.date_iso).toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
  const days = daysUntil(e.date_iso);

  const badgeBase =
    "text-[12px] px-2 py-1 rounded-full border inline-flex items-center";
  const badgeClass =
    e.type === "Meilenstein"
      ? "bg-[#ffe6df] text-[#d85c36] border-[#ffd6c7]"
      : e.type === "Prüfung"
      ? "bg-[#ffe6e6] text-[#d83a3a] border-[#ffd1d1]"
      : "bg-[#fff2cf] text-[#b07b00] border-[#ffe9ad]";

  return (
    <div className="rounded-2xl p-4 border border-[var(--color-dsp-orange_light)]/50 bg-[#fffaf5] shadow-sm flex gap-3">
      {/* Left icon chip */}
      <div className="shrink-0 w-10 h-10 rounded-xl bg-white border border-[var(--color-dsp-orange_light)]/60 flex items-center justify-center">
        <IoCalendarOutline className="text-[var(--color-dsp-orange)] text-xl" />
      </div>

      <div className="flex-1">
        {/* Title left, badge on the far right */}
        <div className="flex items-start justify-between gap-3">
          <div className="font-semibold text-[var(--color-dsp-brown)] leading-snug">
            {e.title}
          </div>
          <span className={`${badgeBase} ${badgeClass}`}>{e.type}</span>
        </div>

        <div className="text-sm text-gray-600 mt-1 flex items-center gap-3">
          <span>{dStr}</span>
          <span className="text-[#ff4d3d]">in {days} Tagen</span>
        </div>
      </div>
    </div>
  );
}

/* ───────────────────────── Page ───────────────────────── */

export default function Dashboard() {
  const { modules, loading, error } = useModules();

  // Dashboard payload from backend
  const [dash, setDash] = useState<DashboardPayload | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const payload = await getDashboard();
        setDash(payload);
      } catch {
        setDash(null);
      }
    })();
  }, []);


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <SubBackground>
          <div className="text-center">
            <LoadingSpinner message="Lade Dashboard..." />
          </div>
        </SubBackground>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-6">
        <SubBackground>
          <div className="p-6 text-center text-red-700">
            Fehler beim Laden: {error.message ?? "Unbekannter Fehler"}
          </div>
        </SubBackground>
      </div>
    );
  }

  // Wait for dashboard payload
  if (!dash) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <SubBackground>
          <div className="text-center">
            <LoadingSpinner message="Lade Dashboard..." />
          </div>
        </SubBackground>
      </div>
    );
  }

  // Live stats from API
  const greetingName = dash.greeting_name;
  const weekStreakDays = dash.week_streak_days;
  const weeklyLearningHours = dash.weekly_learning_hours;
  const modulesCompleted = dash.modules_completed;
  const currentGoalPercent = dash.current_goal_percent;


  // Live collections from API
  const topModules = dash.active_modules.slice(0, 3);
  const upcomingEvents = dash.upcoming_events;


  return (
    <div className="min-h-screen bg-[#fff7f1]">
      <div className="px-4 pt-4 pb-10 max-w-[1200px] mx-auto">
        <Breadcrumbs items={[{ label: "Dashboard" }]} className="mb-3" />

        {/* Greeting + Streak */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-[40px] font-extrabold text-[var(--color-dsp-brown)] leading-tight">
              Guten Morgen, {greetingName}!
            </h1>
            <p className="text-gray-600 mt-1">Bereit, heute weiterzulernen?</p>
          </div>
          <StreakBadge days={weekStreakDays} />
        </div>

        {/* Pills */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 mb-6">
          <StatPill
            title="Diese Woche"
            value={`${weeklyLearningHours}h`}
            gradient="orange"
            icon={<IoFlashOutline />}
          />
          <StatPill
            title="Module abgeschlossen"
            value={modulesCompleted}
            gradient="green"
            icon={<IoTrophyOutline />}
          />
          <StatPill
            title="Aktuelles Ziel"
            value={`${currentGoalPercent}%`}
            gradient="yellow"
            icon={<IoRadioButtonOnOutline />}
          />
        </div>

        {/* Main grid: Active Modules (left) + Upcoming (right) */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-5">
          <section>
            <h2 className="text-[22px] font-bold text-[var(--color-dsp-brown)] mb-3 flex items-center gap-2">
                <IoBookOutline className="text-[var(--color-dsp-orange)]" />
                Aktive Module
            </h2>

            <div className="grid gap-4">
              {topModules.map((m) => (
                <ActiveModuleCard key={m.id} m={m} />
              ))}
            </div>
          </section>

          <aside>
              <h2 className="text-[22px] font-bold text-[var(--color-dsp-brown)] mb-3 flex items-center gap-2">
                  <IoCalendarOutline className="text-[var(--color-dsp-orange)]" />
                  Anstehende Termine
              </h2>

              {/* Outer white container to match the reference */}
              <div className="bg-white rounded-2xl border border-[var(--color-dsp-orange_light)]/50 shadow-sm p-4">
                  <div className="grid gap-3">
                      {upcomingEvents.map((e) => (
                          <UpcomingEventCard key={e.id} e={e} />
                      ))}
                  </div>
              </div>
          </aside>

        </div>
      </div>
    </div>
  );
}
