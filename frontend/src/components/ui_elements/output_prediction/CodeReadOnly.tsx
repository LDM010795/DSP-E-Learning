/**
 * CodeReadOnly
 * ---------------------------------------------------------------------
 * Read-only code block with Prism highlighting
 * aesthetics (header with filename + language, line numbers, dark theme).
 *
 * Author: DSP development team
 * Date: 30-10-2025
 */

import React, { useMemo } from "react";
import Prism from "prismjs";
import { mapLanguage } from "@/components/ui_elements/output_prediction/helpers/mapLanguage";

type CodeReadOnlyProps = {
    code: string;
    language: string;
    filename?: string;
    className?: string;
};

export default function CodeReadOnly({
    code,
    language = "typescript",
    filename = "snippet.ts",
    className,
}: CodeReadOnlyProps) {
    const lang = mapLanguage(language);
    const lines = useMemo(() => code.replace(/\r\n/g, "\n").split("\n"), [code]);

    const highlight = (src: string) => {
        const grammar = Prism.languages[lang] ?? Prism.languages.javascript;
        return Prism.highlight(src, grammar, lang);
    };

    return (
        <div
            className={[
                "rounded-xl overflow-hidden border border-neutral-800 bg-neutral-900 mb-4",
                className ?? "",
            ].join(" ")}
            data-testid="output-prediction-code"
        >
            {/* Header / Tabs */}
            <div className="flex items-center h-9 px-2 border-b border-neutral-800 bg-neutral-950/60">
                <div className="flex items-center gap-2 px-3 h-7 rounded-t-md bg-neutral-900 border border-neutral-800 border-b-transparent">
                    <span className="text-xs text-neutral-200">{filename}</span>
                </div>
                <div className="ml-auto pr-2 text-[11px] text-neutral-500">
                    {language}
                </div>
            </div>

            {/* Lines */}
            <div className="font-mono text-sm overflow-x-auto">
                <div className="grid grid-cols-[max-content_1fr] font-mono leading-6 min-w-max">
                    {lines.map((ln, i) => (
                        <React.Fragment key={`line-${i}`}>
                            <div className="select-none text-neutral-500/80 tabular-nums pr-4 pl-3 h-6 leading-6 flex items-center">
                                {i + 1}
                            </div>
                            <div
                                className="whitespace-pre text-neutral-100 px-3 h-6 leading-6 flex items-center"
                                dangerouslySetInnerHTML={{ __html: highlight(ln || "\u00A0") }}
                            />
                        </React.Fragment>
                    ))}
                </div>
            </div>
        </div>
    );
}
