/**
 *
 * Displays an individual upcoming event (e.g., milestone, exam, or task)
 * in the "Anstehende Termine" section of the dashboard.
 *
 * Each card shows:
 * - The event title
 * - The event type (Meilenstein, Prüfung, or Aufgabe)
 * - The date and the number of days remaining until the event
 *
 * Props:
 * - e: {
 *     id: string;
 *     title: string;
 *     date_iso: string;
 *     type: "Meilenstein" | "Prüfung" | "Aufgabe";
 *   }
 *
 * Author: DSP development team
 * Date: 29-10-2025
 */

import { IoCalendarOutline } from "react-icons/io5";

/**
 * Calculates the number of full days between today and a target ISO date.
 */
function daysUntil(dateIso: string) {
    const today = new Date();
    const d = new Date(dateIso + "T00:00:00");
    return Math.max(0, Math.ceil((d.getTime() - today.getTime()) / 86400000));
}

export default function UpcomingEventCard({
  e,
}: {
    e: { id: string; title: string; date_iso: string; type: "Meilenstein" | "Prüfung" | "Aufgabe" };
}) {
    // Format date for display (e.g., "28. November 2025")
    const dStr = new Date(e.date_iso).toLocaleDateString("de-DE", {
        day: "2-digit",
        month: "long",
        year: "numeric",
    });

    // Compute remaining days until the event
    const days = daysUntil(e.date_iso);

    // Define base and variant-specific styles for the type badge
    const badgeBase =
        "text-[12px] px-2 py-1 rounded-full border inline-flex items-center";
    const badgeClass =
        e.type === "Meilenstein"
            ? "bg-[#ffe6df] text-[#d85c36] border-[#ffd6c7]"
            : e.type === "Prüfung"
            ? "bg-[#ffe6e6] text-[#d83a3a] border-[#ffd1d1]"
            : "bg-[#fff2cf] text-[#b07b00] border-[#ffe9ad]";

    return (
        <div className="rounded-2xl p-4 border border-[var(--color-dsp-orange_light)]/50 bg-white shadow-sm flex gap-3">
            {/* Left icon chip */}
            <div className="shrink-0 w-10 h-10 rounded-xl bg-white border border-[var(--color-dsp-orange_light)]/60 flex items-center justify-center">
                <IoCalendarOutline className="text-[var(--color-dsp-orange)] text-xl" />
            </div>

            {/* Right: event information */}
            <div className="flex-1">
                {/* Title left, badge on the far right */}
                <div className="flex items-start justify-between gap-3">
                    <div className="font-semibold text-[var(--color-dsp-brown)] leading-snug">
                        {e.title}
                    </div>
                    <span className={`${badgeBase} ${badgeClass}`}>{e.type}</span>
                </div>

                {/* Date and countdown */}
                <div className="text-sm text-gray-600 mt-1 flex items-center gap-3">
                    <span>{dStr}</span>
                    <span className="text-[#ff4d3d]">in {days} Tagen</span>
                </div>
            </div>
        </div>
    );
}
