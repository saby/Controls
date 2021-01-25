import IPaste from "./IPaste";
import {IInputPlaceholder, IInputTag} from 'Controls/interface';
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
        style: 'info' | 'invalid' | 'danger' | 'success' | 'warning' | 'primary'; //Todo нет такой опции больше
        autoComplete: 'on' | 'off' | 'username' | 'current-password';
    }
};

export default IInputBase;
