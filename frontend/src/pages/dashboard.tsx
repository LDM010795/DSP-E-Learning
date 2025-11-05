import { useEffect, useState } from "react";
import {
  IoFlashOutline,
  IoTrophyOutline,
  IoRadioButtonOnOutline,
  IoCalendarOutline,
  IoBookOutline,
} from "react-icons/io5";
import Breadcrumbs from "../components/ui_elements/breadcrumbs";
import LoadingSpinner from "../components/ui_elements/loading_spinner";
import SubBackground from "../components/layouts/SubBackground";
import { getDashboard, type DashboardPayload } from "../util/apis/dashboardApi";
import {
  SectionTitle,
  StreakBadge,
  StatPill,
  ActiveModuleCard,
  UpcomingEventCard,
} from "../components/dashboard";

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Guten Morgen";
  if (hour < 18) return "Guten Tag";
  return "Guten Abend";
}

export default function Dashboard() {
  const [dash, setDash] = useState<DashboardPayload | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const payload = await getDashboard();
        setDash(payload);
      } catch (e: any) {
        setError(e?.message ?? "Fehler beim Laden des Dashboards");
      }
    })();
  }, []);

  if (error) {
    return (
      <div className="min-h-screen p-6">
        <SubBackground>
          <div className="p-6 text-center text-red-700">{error}</div>
        </SubBackground>
      </div>
    );
  }

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

  const {
    greeting_name,
    week_streak_days,
    weekly_learning_hours,
    modules_completed,
    current_goal_percent,
    active_modules,
    upcoming_events,
  } = dash;

  return (
    <div className="min-h-screen">
      <div className="px-4 pt-4 pb-10 max-w-[1200px] mx-auto">
        <Breadcrumbs items={[{ label: "Dashboard" }]} className="mb-3" />

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-[40px] font-extrabold text-[var(--color-dsp-brown)] leading-tight">
              {getGreeting()}, {greeting_name}!
            </h1>
            <p className="text-gray-600 mt-1">Bereit, heute weiterzulernen?</p>
          </div>
          <StreakBadge days={week_streak_days} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 mb-6">
          <StatPill
            title="Diese Woche"
            value={`${weekly_learning_hours}h`}
            gradient="orange"
            icon={<IoFlashOutline />}
          />
          <StatPill
            title="Module abgeschlossen"
            value={modules_completed}
            gradient="green"
            icon={<IoTrophyOutline />}
          />
          <StatPill
            title="Aktuelles Ziel"
            value={`${current_goal_percent}%`}
            gradient="yellow"
            icon={<IoRadioButtonOnOutline />}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-5">
          <section>
            <SectionTitle
              icon={<IoBookOutline className="text-[var(--color-dsp-orange)]" />}
            >
              Aktive Module
            </SectionTitle>
            <div className="grid gap-4">
              {active_modules.slice(0, 3).map((m) => (
                <ActiveModuleCard key={m.id} m={m} />
              ))}
            </div>
          </section>

          <aside>
            <SectionTitle
              icon={<IoCalendarOutline className="text-[var(--color-dsp-orange)]" />}
            >
              Anstehende Termine
            </SectionTitle>
            <div className="bg-white rounded-2xl border border-[var(--color-dsp-orange_light)]/50 shadow-sm p-4">
              <div className="grid gap-3">
                {upcoming_events.map((e) => (
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
