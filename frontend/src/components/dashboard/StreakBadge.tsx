/**
 *
 * Displays the user's current weekly learning streak (in days)
 * with a small trending-up icon. Used in the dashboard header area
 * next to the greeting text.
 *
 * Props:
 * - days (number): The number of consecutive learning days to display.
 *
 * Author: DSP development team
 * Date: 29-10-2025
 */

import { IoTrendingUpOutline } from "react-icons/io5";

export default function StreakBadge({ days }: { days: number }) {
  return (
    <div className="bg-[#fff1e9] border border-[var(--color-dsp-orange_light)] rounded-xl px-4 py-3 shadow-sm flex items-center gap-2">
      {/* Icon indicating progress or streak */}
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
