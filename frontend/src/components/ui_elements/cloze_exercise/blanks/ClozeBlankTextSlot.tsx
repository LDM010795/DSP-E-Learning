import { memo } from "react";
import { CLOZE_BLANK_STYLES, ClozeBlankBaseProps } from "./ClozeBlankBase";

export interface ClozeBlankTextSlotProps extends ClozeBlankBaseProps{
  inputValue: string;
  onInputChange?: (value: string) => void;
}

const ClozeBlankTextSlot = memo<ClozeBlankTextSlotProps>(
  ({
    id,
    inputValue = "",
    onInputChange,
    display_mode: mode = "text",
  }) => {
    const s = CLOZE_BLANK_STYLES[mode];
       
    return (
      <span key={id} className={s.inputWrap}>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => {
            const value = e.currentTarget.value;
            onInputChange?.(value);
            e.currentTarget.style.width = `${Math.max(4, value.length)}ch`;
          }}
          style={{ width: `${Math.max(4, inputValue?.length ?? 0)}ch` }}
          className={s.input}
        />
      </span>
    );
  },
);

ClozeBlankTextSlot.displayName = "ClozeBlankTextSlot";
export default ClozeBlankTextSlot;
