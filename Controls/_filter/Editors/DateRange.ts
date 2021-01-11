import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import {SyntheticEvent} from 'Vdom/Vdom';
import {isEqual} from 'Types/object';
import DateRangeTemplate = require('wml!Controls/_filter/Editors/DateRange');
import {EventUtils} from 'UI/Events';

/**
 * Контрол используют в качестве редактора для выбора периода дат на {@link /doc/platform/developmentapl/interface-development/controls/list/filter-and-search/filter-view/base-settings/#step-3 панели фильтров}.
 * @remark
 * Подробнее о настройке объединенного фильтра с выбором периода читайте {@link /doc/platform/developmentapl/interface-development/controls/list/filter-and-search/filter-view/base-settings/#step-3 здесь}.
 * @class Controls/_filter/Editors/DateRange
 * @extends UI/Base:Control
 * @mixes Controls/_dateRange/interfaces/ILinkView
 * @mixes Controls/_dateRange/interfaces/IDateRange
 * @public
 * @author Герасимов А.М.
 *
 * @see Controls/filter:View
 *
 */
class DateRangeEditor extends Control<IControlOptions> {
    protected _template: TemplateFunction = DateRangeTemplate;
    protected _tmplNotify: Function = EventUtils.tmplNotify;
    protected _templateName: string;
    protected _dateRangeModule: Record<string, any> = null;
    protected _emptyCaption: string;
    protected _reseted: boolean = false;
    protected _fontColorStyle: string;

    protected _beforeMount(options: IControlOptions): Promise<void>|void {
        this._templateName = 'Controls/dateRange:' + (options.editorMode === 'Selector' ? 'RangeSelector' : 'RangeShortSelector');
        this._fontColorStyle = options.readOnly ? 'label' : options.fontColorStyle;
        this._reseted = isEqual(options.value, options.resetValue);
        return import('Controls/dateRange').then((dateRange) => {
            this._dateRangeModule = dateRange;
            if (options.emptyCaption) {
                this._emptyCaption = options.emptyCaption;
            } else if (options.resetValue) {
                this._emptyCaption = this.getCaption(options.resetValue[0], options.resetValue[1]);
            }
        });
    }

    protected _beforeUpdate(newOptions: IControlOptions): Promise<void>|void {
        if (this._options.value !== newOptions.value) {
            this._reseted = isEqual(newOptions.value, newOptions.resetValue);
        }
    }

    protected _rangeChanged(event: SyntheticEvent<'rangeChanged'>, startValue: Date, endValue: Date): Promise<void> {
        event.stopPropagation();
        const caption = this.getCaption(startValue, endValue);
        this._notify('textValueChanged', [caption]);
        if (!startValue && !endValue && this._options.resetValue || isEqual([startValue, endValue], this._options.resetValue)) {
            this._notify('rangeChanged', [this._options.resetValue[0], this._options.resetValue[1]]);
            this._reseted = true;
        } else {
            this._notify('rangeChanged', [startValue, endValue]);
            this._reseted = false;
        }
    }

    private getCaption(startValue, endValue): string {
        const captionFormatter = this._options.captionFormatter || this._dateRangeModule.Utils.formatDateRangeCaption;
        return captionFormatter(startValue, endValue, this._options.emptyCaption);
    }

    static getDefaultOptions() {
        return {
            editorMode: 'Lite',
            fontColorStyle: 'filterPanelItem'
        };
    }
}
/**
 * @event Происходит при изменении выбранного значения.
 * @name Controls/_filter/Editors/DateRange#textValueChanged
 * @param {Vdom/Vdom:SyntheticEvent} eventObject Дескриптор события.
 * @param {String} caption Строковое представление периода дат.
 */

/**
 * @name Controls/_filter/Editors/DateRange#editorMode
 * @cfg {String} Режим отображения редактора.
 * @variant Selector В качестве редактора используется {@link Controls/dateRange:RangeSelector}.
 * @variant Lite В качестве редактора используется {@link Controls/dateRange:RangeShortSelector}.
 * @default Lite
 */
export default DateRangeEditor;

/**
 * @name Controls/_filter/Editors/DateRange#value
 * @cfg {Array<Date>} Массив из двух значений - дата "от" и дата "до".
 * @see resetValue
 */

/**
 * @name Controls/_filter/Editors/DateRange#resetValue
 * @cfg {Array<Date>} Массив из двух значений - дата "от" и дата "до", которые применятся при сбросе.
 * @see value
 */
