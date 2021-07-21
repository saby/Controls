import {Control, TemplateFunction} from 'UI/Base';
import {SyntheticEvent} from 'Vdom/Vdom';
import IEditor from 'Controls/_propertyGrid/IEditor';
import IEditorOptions from 'Controls/_propertyGrid/IEditorOptions';
import * as template from 'wml!Controls/_propertyGrid/defaultEditors/Date';

/**
 * Редактор для данных с типом "дата".
 * @extends UI/Base:Control
 * @author Герасимов А.М.
 * @public
 */
class DateEditor extends Control<IEditorOptions> implements IEditor {
    protected _template: TemplateFunction = template;
    protected _value: unknown = null;

    protected _beforeMount(options?: IEditorOptions): void {
        this._updateValue(options.propertyValue);
    }

    protected _beforeUpdate(options?: IEditorOptions): void {
        if (this._options.propertyValue !== options.propertyValue) {
            this._updateValue(options.propertyValue);
        }
    }

    protected _handleInputCompleted(event: SyntheticEvent, value: unknown): void {
        this._notify('propertyValueChanged', [value], {bubbling: true});
    }

    private _updateValue(newValue: unknown): void {
        this._value = newValue;
    }
}
export = DateEditor;
