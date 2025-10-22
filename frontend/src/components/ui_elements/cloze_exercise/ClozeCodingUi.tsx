import React, { useMemo } from "react";
import Prism from "prismjs";
import { mapLanguage } from "@/components/ui_elements/cloze_exercise/helpers/mapLanguage";

type ClozeCodingUiProps = {
    lines: Array<Array<string | React.ReactNode>>;
    language: string;
    filename?: string;
    className?: string;
};

export default function ClozeCodingUi({
    lines,
    language = "typescript",
    filename = "snippet.ts",
}: ClozeCodingUiProps) {

    // -------- intern: Sprache mappen --------
    const lang = mapLanguage(language)

    // -------- intern: Text-Segment highlighten --------
    const HighlightedChunk = ({ code }: { code: string }) => {
        if (!code || code === "\u00A0") return <span>{code || "\u00A0"}</span>;
        const html = useMemo(() => {
            const grammar = Prism.languages[lang] ?? Prism.languages.javascript;
            return Prism.highlight(code, grammar, lang);
        }, [code, lang]);
        return <span dangerouslySetInnerHTML={{ __html: html }} />;
    };

    return (
        <div
            className="rounded-xl overflow-hidden border border-neutral-800 bg-neutral-900 mb-4"
            data-testid="cloze-coding-ui"
        >
            {/* Header / Tabs */}
            <div className="flex items-center h-9 px-2 border-b border-neutral-800 bg-neutral-950/60">
                <div className="flex items-center gap-1">
                    <div className="flex items-center gap-2 px-3 h-7 rounded-t-md bg-neutral-900 border border-neutral-800 border-b-transparent">
                        <span className="text-xs text-neutral-200">{filename}</span>
                    </div>
                </div>
                <div className="ml-auto flex items-center gap-3 pr-2">
                    <span className="text-[11px] text-neutral-500">{language}</span>
                </div>
            </div>

            {/* Editorfläche */}
            <div className={"font-mono text-sm"}>
                {(
                    <div className="overflow-x-auto">
                        <div className="grid grid-cols-[max-content_1fr] font-mono leading-6 min-w-max">
                            {lines.map((line, i) => (
                                <React.Fragment key={`line-${i}`}>
                                    {/* Zeilennummer */}
                                    <div className="select-none text-neutral-500/80 tabular-nums pr-4 pl-3 h-6 leading-6 flex items-center">
                                        {i + 1}
                                    </div>
                                    {/* Code (kein Soft-Wrap) */}
                                    <div className="whitespace-pre text-neutral-100 px-3 h-6 leading-6 flex items-center">
                                        {line.length === 0
                                            ? "\u00A0"
                                            : line.map((seg, si) =>
                                                typeof seg === "string" ? (
                                                    <HighlightedChunk key={si} code={seg || "\u00A0"} />
                                                ) : (
                                                    seg
                                                ),
                                            )}
                                    </div>
                                </React.Fragment>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
