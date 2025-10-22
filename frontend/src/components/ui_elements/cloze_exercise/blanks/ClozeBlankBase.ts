export interface ClozeBlankBaseProps {
  id: string;
  dataTestId?: string;
  display_mode: "text" | "code";
}

export const CLOZE_BLANK_STYLES: Record<
  NonNullable<ClozeBlankBaseProps["display_mode"]>,
  {
    bankWrap: string; // Hülle im Wordbank/Drag-Modus
    bankHover: string; // zusätzliche Klasse bei Hover
    chip: string; // Drag-Chip in der Lücke
    inputWrap: string; // Hülle im Eingabe-Modus
    input: string; // Input selbst
  }
> = {
  text: {
    bankWrap:
      "inline-flex items-center justify-center align-baseline min-w-[60px] min-h-[2.4rem] border-b-2 border-gray-400",
    bankHover: "bg-dsp-orange_light/50",
    chip: "px-2 py-[2px] rounded-lg cursor-grab select-none bg-dsp-orange_light/50 border border-dsp-orange_medium/60 text-base",
    inputWrap:
      "inline-flex items-center justify-center align-baseline border-b-2 border-gray-400 px-0.5",
    input:
      "bg-transparent focus:outline-none text-center text-gray-700 placeholder-gray-300 transition-[width] duration-150 ease-in-out",
  },
  code: {
    bankWrap:
      // exakt 24px wie die Code-Zeile, kein Wachstum
      "inline-flex items-center h-6 leading-6 min-w-[40px] mx-[1px] border-b border-dashed border-neutral-600/70 -mb-px",
    bankHover: "bg-neutral-800/50",
    chip:
      // kleiner Chip, passt in h-6
      "inline-flex items-center cursor-grab select-none rounded-md h-5 leading-5 px-1.5 text-[12px] bg-neutral-700/60 border border-neutral-600/80 font-mono",
    inputWrap:
      "inline-flex items-center h-6 leading-6 mx-[1px] border-b border-dashed border-neutral-600/70 -mb-px",
    input:
      "font-mono text-[13px] text-neutral-100 bg-transparent focus:outline-none h-6 leading-6 placeholder-neutral-500",
  },
};
