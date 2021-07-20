import {Control, TemplateFunction, IControlOptions} from 'UI/Base';
import {SyntheticEvent} from 'Vdom/Vdom';
import TimeIntervalTemplate = require('wml!Controls/_propertyGrid/extendedEditors/TimeInterval');
import IEditor from 'Controls/_propertyGrid/IEditor';
import IEditorOptions from 'Controls/_propertyGrid/IEditorOptions';
import {StringValueConverter} from 'Controls/input';
import {Time} from 'Types/entity';

interface ITimeIntervalEditorOptions extends IEditorOptions, IControlOptions {
    mask: string;
}
/**
 * Редактор для временного интервала.
 * @extends UI/Base:Control
 * @implements Controls/propertyGrid:IEditor
 * @author Мельникова Е.А.
 * @demo Controls-demo/PropertyGridNew/Editors/TimeInterval/Index
 * @public
 */
class TimeIntervalEditor extends Control<ITimeIntervalEditorOptions> implements IEditor {
    protected _template: TemplateFunction = TimeIntervalTemplate;
    protected _value: unknown = null;
    private _stringValueConverter: typeof StringValueConverter = null;

    protected _beforeMount(options: ITimeIntervalEditorOptions): void {
        // StringValueConverter требуется, т.к. система типов не умеет определять и сериализовывать
        // значения типа TimeInterval, хотя такой тип там выделен
        // будет правиться по ошибке в 21.2100 https://online.sbis.ru/opendoc.html?guid=d7d07873-f7fc-4cb6-9e44-e681473530e5
        this._stringValueConverter = new StringValueConverter({
            replacer: ' ',
            mask: options.mask,
            dateConstructor: Time
        });
        this._updateValues(options.propertyValue);
    }

    protected _beforeUpdate(options: ITimeIntervalEditorOptions): void {
        if (this._options.propertyValue !== options.propertyValue) {
            this._updateValues(options.propertyValue);
        }
    }

    protected _handleInputCompleted(event: SyntheticEvent, value: Date): void {
        this._notify(
            'propertyValueChanged',
            [this._stringValueConverter.getStringByValue(value)],
            {bubbling: true}
        );
    }

    private _updateValues(newValue: unknown): void {
        this._value = typeof newValue === 'string' ? this._stringValueConverter.getValueByString(newValue) : newValue;
    }
}
export default TimeIntervalEditor;
