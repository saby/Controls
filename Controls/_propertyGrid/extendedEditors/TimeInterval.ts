import {Control, TemplateFunction} from 'UI/Base';
import {SyntheticEvent} from 'Vdom/Vdom';
import TimeIntervalTemplate = require('wml!Controls/_propertyGrid/extendedEditors/TimeInterval');
import IEditor from 'Controls/_propertyGrid/IEditor';
import IEditorOptions from 'Controls/_propertyGrid/IEditorOptions';

/**
 * Редактор для временного интервала.
 * @class Controls/_propertyGrid/extendedEditors/TimeInterval
 * @extends UI/Base:Control
 * @author Мельникова Е.А.
 * @public
 */
class TimeIntervalEditor extends Control implements IEditor {
    protected _template: TemplateFunction = TimeIntervalTemplate;
    protected _value: unknown = null;

    protected _beforeMount(options?: IEditorOptions): void {
        this._updateValues(options.propertyValue);
    }

    protected _beforeUpdate(options?: IEditorOptions): void {
        if (this._options.propertyValue !== options.propertyValue) {
            this._updateValues(options.propertyValue);
        }
    }

    protected _handleInputCompleted(event: SyntheticEvent, value: number): void {
        this._notify('propertyValueChanged', [value], {bubbling: true});
    }

    private _updateValues(newValue: unknown): void {
        this._value = newValue;
    }
}
export default TimeIntervalEditor;
