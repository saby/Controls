import {IControlOptions, TemplateFunction} from 'UI/Base';
import {SyntheticEvent} from 'Vdom/Vdom';
import DropdownTemplate = require('wml!Controls/_filterPanel/Editors/Dropdown');
import {BaseEditor} from 'Controls/_filterPanel/Editors/Base';
import 'css!Controls/filterPanel';

interface IDropdownOptions extends IControlOptions {
    propertyValue: number[] | string[];
}

interface IDropdown {
    readonly '[Controls/_filterPanel/Editors/Dropdown]': boolean;
}

/**
 * Контрол используют в качестве редактора для выбора значения из выпадающего списка.
 * @class Controls/_filterPanel/Editors/Dropdown
 * @extends UI/Base:Control
 * @mixes Controls/filterPopup:Dropdown
 * @author Мельникова Е.А.
 * @public
 */

class DropdownEditor extends BaseEditor implements IDropdown {
    readonly '[Controls/_filterPanel/Editors/Dropdown]': boolean = true;
    protected _template: TemplateFunction = DropdownTemplate;
    protected _textValue: string = '';

    protected _handleSelectedKeysChanged(event: SyntheticEvent, value: number[] | string[]): void {
        const extendedValue = {
            value,
            textValue: this._textValue
        };
        this._notifyPropertyValueChanged(extendedValue);
    }

    protected _extendedCaptionClickHandler(): void {
        this._notifyPropertyValueChanged(this._options.value);
    }

    private _handleTextValueChanged(event: SyntheticEvent, value: string): void {
        this._textValue = value;
    }
}
export default DropdownEditor;
