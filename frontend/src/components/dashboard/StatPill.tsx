/**
 *
 * A reusable statistic card (or “pill”) component used to display
 * key performance indicators on the dashboard (e.g., learning hours,
 * completed modules, progress goals).
 *
 * Each pill displays a title, value, and optional icon with
 * a color-coded background gradient.
 *
 * Props:
 * - title (string): The label for the metric (e.g., "Diese Woche").
 * - value (string | number): The numeric or textual value to display.
 * - gradient ("orange" | "green" | "yellow"): Determines the background gradient style.
 * - icon (React.ReactNode, optional): Optional icon displayed on the right.
 *
 * Author: DSP development team
 * Date: 29-10-2025
 */

import React from "react";

type PillGradient = "orange" | "green" | "yellow";

export default function StatPill({
  title,
  value,
  gradient,
  icon,
}: {
  title: string;
  value: string | number;
  gradient: PillGradient;
  icon?: React.ReactNode;
}) {
  // Base styling applied to all variants
  const base =
    "text-white rounded-2xl p-6 shadow-sm flex items-center justify-between";

  // Conditional background gradient based on the selected theme
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
      <div
        className="opacity-90 text-2xl"
        data-testid="statpill-icon"
        aria-hidden="true"
      >
        {icon}
      </div>
    </div>
  );
}
