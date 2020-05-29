import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import {SyntheticEvent} from 'Vdom/Vdom';
import {isEqual} from 'Types/object';
import DateRangeTemplate = require('wml!Controls/_filter/Editors/DateRange');
import tmplNotify = require('Controls/Utils/tmplNotify');

/**
 * Контрол используют в качестве редактора для выбора периода дат на {@link https://wi.sbis.ru/doc/platform/developmentapl/interface-development/controls/list-environment/filter-search/filter-view/base-settings/#step-3 панели фильтров}.
 * 
 * @remark
 * Полезные ссылки:
 * * <a href="/doc/platform/developmentapl/interface-development/controls/list-environment/filter-search/filter-view/base-settings/#step-3">руководство разработчика</a>
 * * <a href="https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/aliases/_filter.less">переменные тем оформления</a>
 * 
 * @class Controls/_filter/Editors/DateRange
 * @mixes Controls/_dateRange/interfaces/ILinkView
 * @extends Core/Control
 * @author Герасимов А.М.
 * @see Controls/filter:View
 * @public
 */
class DateRangeEditor extends Control<IControlOptions> {
    protected _template: TemplateFunction = DateRangeTemplate;
    protected _tmplNotify: Function = tmplNotify;
    protected _templateName: string;
    protected _emptyCaption: string;
    protected _reseted: boolean = false;
    protected _fontColorStyle: string;

    protected _beforeMount(options: IControlOptions): Promise<void>|void {
        this._templateName = 'Controls/dateRange:' + (options.editorMode === 'Selector' ? 'RangeSelector' : 'RangeShortSelector');
        this._fontColorStyle = options.readOnly ? 'label' : options.fontColorStyle;
        if (options.emptyCaption) {
            this._emptyCaption = options.emptyCaption;
        } else if (options.resetValue) {
            if (isEqual(options.value, options.resetValue)) {
                this._reseted = true;
            }
            return this.getCaption(options.resetValue[0], options.resetValue[1]).then((caption) => {
                this._emptyCaption = caption;
            });
        }
    }

    protected _beforeUpdate(newOptions: IControlOptions): Promise<void>|void {
        if (this._options.value !== newOptions.value) {
            this._reseted = isEqual(newOptions.value, newOptions.resetValue);
        }
    }

    protected _rangeChanged(event: SyntheticEvent<'rangeChanged'>, startValue: Date, endValue: Date): Promise<void> {
        return this.getCaption(startValue, endValue).then((caption) => {
            this._notify('textValueChanged', [caption]);
            if (!startValue && !endValue && this._options.resetValue || isEqual([startValue, endValue], this._options.resetValue)) {
                this._notify('rangeChanged', [this._options.resetValue[0], this._options.resetValue[1]]);
                this._reseted = true;
            } else {
                this._notify('rangeChanged', [startValue, endValue]);
                this._reseted = false;
            }
        });
    }

    private getCaption(startValue, endValue) {
        return import('Controls/dateRange').then((dateRange) => {
            return dateRange.Utils.formatDateRangeCaption.call(null, startValue, endValue, this._options.emptyCaption);
        });
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
 * @variant Selector В качестве редактора используется {@link Controls/dateRange:Selector}.
 * @variant Lite В качестве редактора используется {@link Controls/dateRange:LiteSelector}.
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

