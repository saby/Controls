import {Control, TemplateFunction, IControlOptions} from 'UI/Base';
import * as template from 'wml!Controls/_dateRange/WeekdayFormatter/WeekdayFormatter';
import {date as formatDate} from 'Types/formatter';
import 'css!Controls/dateRange';

/**
 * Контрол - день недели. Преобразует дату в день недели. Контрол используется для отображения для недели по
 * стандарту внутри шаблона {@link Controls/_dateRange/interfaces/IInput#rightFieldTemplate rightFieldTemplate}
 *
 * @class Controls/_dateRange/WeekdayFormatter
 * @public
 * @author Красильников А.С.
 * @demo Controls-demo/dateRange/WeekdayFormatter/Index
 *
 */

/**
 * @name Controls/_dateRange/WeekdayFormatter#value
 * @cfg {Date} Дата, которая будет отформатирована в день недели.
 */

export default class WeekdayFormatter extends Control {
    protected _template: TemplateFunction = template;
    protected _weekday: string;

    protected _beforeMount(options: IControlOptions): void {
        this._setWeekday(options.value);
    }

    protected _beforeUpdate(options: IControlOptions): void {
        if (this._options.value !== options.value) {
            this._setWeekday(options.value);
        }
    }

    private _setWeekday(value: Date): string {
        if (value instanceof Date && !isNaN(value.getTime())) {
            this._weekday = formatDate(value, 'ddl');
        } else {
            this._weekday = '';
        }
    }
}
