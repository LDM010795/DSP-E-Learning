/**
 *
 * This component renders a styled section title with an optional leading icon.
 * It is used to maintain a consistent heading style across the dashboard
 * (for example: "Aktive Module", "Anstehende Termine").
 *
 * Props:
 * - icon (React.ReactNode, optional): Icon element displayed before the title.
 * - children (React.ReactNode): The title text or elements to be rendered.
 *
 * Author: DSP development team
 * Date: 29-10-2025
 */

import React from "react";

export default function SectionTitle({
  icon,
  children,
}: {
    icon?: React.ReactNode;
    children: React.ReactNode;
}) {
    return (
        <h2 className="text-[22px] font-bold text-[var(--color-dsp-brown)] mb-3 flex items-center gap-2">
            {icon && <span data-testid="section-icon">{icon}</span>}
            {children}
        </h2>
    );
}

