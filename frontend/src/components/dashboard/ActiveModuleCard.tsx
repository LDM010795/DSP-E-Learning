/**
 *
 * Displays an individual “Active Module” card on the dashboard.
 * Each card shows the module title, learning progress, total lessons,
 * study time, and a button to continue learning.
 *
 * Props:
 * - m (DashboardModule): Module data fetched from the dashboard API.
 *
 * Visual details:
 * - The card includes hover animations for visual feedback.
 * - The progress bar reflects the user’s completion percentage.
 * - The “Fortfahren” button links directly to the corresponding module page.
 *
 * Author: DSP development team
 * Date: 29-10-2025
 */

import { Link } from "react-router-dom";
import type { DashboardModule } from "../../util/apis/dashboardApi";

export default function ActiveModuleCard({ m }: { m: DashboardModule }) {
  // Clamp progress to a 0–100% range to avoid overflow or negative values
  const progress = Math.min(100, Math.max(0, m.progress_percent ?? 0));

  return (
    <div className="bg-white border border-[var(--color-dsp-orange_light)]/40 rounded-2xl p-5 shadow-sm transition-all duration-200 hover:shadow-md hover:border-[var(--color-dsp-orange)]/60 hover:-translate-y-0.5">
      {/* Header: title and “Fortfahren” button */}
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

      {/* Study time and lesson progress */}
      <div className="flex items-center gap-3 text-sm text-gray-600 mt-2">
        <span>⏱ {m.study_time_hours.toFixed(1)}h</span>
        <span>•</span>
        <span>
          {m.lessons_done} von {m.lessons_total} Lektionen
        </span>
      </div>

      {/* Progress bar */}
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
