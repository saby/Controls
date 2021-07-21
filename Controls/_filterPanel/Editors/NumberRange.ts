import {IControlOptions, TemplateFunction} from 'UI/Base';
import {SyntheticEvent} from 'Vdom/Vdom';
import DateRangeTemplate = require('wml!Controls/_filterPanel/Editors/NumberRange');
import {BaseEditor} from 'Controls/_filterPanel/Editors/Base';
import 'css!Controls/filterPanel';

interface INumberRangeOptions extends IControlOptions {
    propertyValue: number[];
    afterEditorTemplate: TemplateFunction;
    minValueInputPlaceholder: string;
    maxValueInputPlaceholder: string;
}

interface INumberRange {
    readonly '[Controls/_filterPanel/Editors/NumberRange]': boolean;
}

/**
 * Контрол используют в качестве редактора для выбора диапазона чисел на {@link Controls/filterPanel:View панели фильтров}.
 * @class Controls/_filterPanel/Editors/NumberRange
 * @extends UI/Base:Control
 * @mixes Controls/input:Number
 * @author Мельникова Е.А.
 * @public
 */

/**
 * @name Controls/_filterPanel/Editors/NumberRange#minValueInputPlaceholder
 * @cfg {String} Устанавливает placeholder для поля ввода минимального значения.
 */

/**
 * @name Controls/_filterPanel/Editors/NumberRange#maxValueInputPlaceholder
 * @cfg {String} Устанавливает placeholder для поля ввода максимального значения.
 */

/**
 * @name Controls/_filterPanel/Editors/NumberRange#afterEditorTemplate
 * @cfg {TemplateFunction|String} Шаблон, который отобразится справа от редактора.
 * @demo Controls-demo/filterPanel/NumberRangeEditor/Index
 * @example
 * Создаем шаблон, который передадим в afterEditorTemplate:
 * MyAfterEditorTemplate.wml:
 * <pre class="brush: html">
 *    <span class="myClass"> руб. </span>
 * </pre>
 * JS:
 * <pre class="brush: js">
 *    this._sourse = [{
 *      group: 'Стоимость товара',
 *      name: 'amount',
 *      editorTemplateName: 'Controls/filterPanel:NumberRangeEditor',
 *      value: [],
 *      editorOptions: {
 *          afterEditorTemplate: 'wml!MyAfterEditorTemplate'
 *      }
 *    }];
 * </pre>
 */

class NumberRangeEditor extends BaseEditor implements INumberRange {
    readonly '[Controls/_filterPanel/Editors/NumberRange]': boolean = true;
    protected _template: TemplateFunction = DateRangeTemplate;
    protected _minValue: number|null = null;
    protected _maxValue: number|null = null;

    protected _beforeMount(options?: INumberRangeOptions): void {
        this._updateValues(options.propertyValue);
    }

    protected _beforeUpdate(options?: INumberRangeOptions): void {
        if (this._options.propertyValue !== options.propertyValue) {
            this._updateValues(options.propertyValue);
        }
    }

    protected _handleMinValueChanged(event: SyntheticEvent, value: number): void {
        if (value <= this._maxValue || !this._maxValue) {
            this._minValue = value;
        } else {
            this._processPropertyValueChanged(event, [this._minValue, this._maxValue]);
        }
    }

    protected _handleMaxValueChanged(event: SyntheticEvent, value: number): void {
        this._maxValue = value;
    }

    protected _handleInputCompleted(event: SyntheticEvent, value: number): void {
        if (this._needReplaceMinMaxValues()) {
            this._replaceMinMaxValues(this._minValue, this._maxValue);
        }
        this._processPropertyValueChanged(event, [this._minValue, this._maxValue]);
    }

    protected _getExtendedValue(): object {
        const value = [this._minValue, this._maxValue];
        return {
            value,
            textValue: !this._isValueEmpty(value) ? this._getTextValue(value) : ''
        };
    }

    private _updateValues(newValue: number[]): void {
        this._minValue = newValue[0] !== undefined ? newValue[0] : null;
        this._maxValue = newValue[1] !== undefined ? newValue[1] : null;
    }

    private _processPropertyValueChanged(event: SyntheticEvent, value: number[]): void {
        if (this._needNotifyChanges(value)) {
            this._notifyPropertyValueChanged();
        }
    }

    private _needReplaceMinMaxValues(): boolean {
        return this._minValue && this._maxValue && this._minValue > this._maxValue;
    }

    private _replaceMinMaxValues(minValue: number, maxValue: number): void {
        this._minValue = maxValue;
        this._maxValue = minValue;
    }

    private _needNotifyChanges(values: number[]): boolean {
        const minValue = values[0];
        const maxValue = values[1];
        return minValue <= maxValue || !minValue || !maxValue;
    }

    private _isValueEmpty(value: number[]): boolean {
        return value[0] === null || value[1] === null;
    }

    private _getTextValue(value: number[]): string|number {
        return value[0] + ' - ' + value[1];
    }

    static getDefaultOptions(): object {
        return {
            contrastBackground: false,
            borderVisibility: 'partial',
            horizontalPadding: 'null'
        };
    }
}
export default NumberRangeEditor;

/**
 * @name Controls/_filterPanel/Editors/NumberRange#value
 * @cfg {Array<Date>} Массив из двух значений - число "от" и число "до".
 * @see resetValue
 */

/**
 * @name Controls/_filterPanel/Editors/NumberRange#resetValue
 * @cfg {Array<Date>} Массив из двух значений - число "от" и число "до", которые применятся при сбросе.
 * @see value
 */
