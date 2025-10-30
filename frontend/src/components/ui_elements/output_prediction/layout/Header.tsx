/**
 * Header
 *
 * Displays a consistent exercise header with icon and title.
 *
 * Author: DSP development team
 * Date: 30-10-2025
 */

import { memo } from "react";
import { FaCode } from "react-icons/fa6";

export const Header = memo(function Header({
  title = "Output vorhersagen",
}: {
    title?: string;
}) {
    return (
        <div className="inline-flex items-center gap-2 mb-4" data-testid="outpred-header">
            <div className="p-3 rounded-xl bg-dsp-orange_light">
                <FaCode className="w-5 h-5 text-dsp-orange" />
            </div>
            <h1 className="text-lg text-gray-600 font-medium">{title}</h1>
        </div>
    );
});
Header.displayName = "Header";
