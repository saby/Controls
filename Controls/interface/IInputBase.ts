import IPaste from "./IPaste";
import IInputTag from "./IInputTag";
import IInputPlaceholder from "./IInputPlaceholder";
import ISelectableInput from "./ISelectableInput";
import IInputTooltip from "./IInputTooltip";
import IInputStyle from "./IInputStyle";
import IInputField from "./IInputField";

type IInputBase =
    IPaste
    & IInputTag
    & IInputField
    & IInputPlaceholder
    & ISelectableInput
    & IInputTooltip
    & IInputStyle
    & {
    readonly _options: {
        textAlign: 'left' | 'right' | 'center';
        autoComplete: 'on' | 'off' | 'username' | 'current-password';
    }
};

export default IInputBase;
