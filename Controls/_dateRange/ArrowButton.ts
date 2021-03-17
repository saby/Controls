import {Control, TemplateFunction} from 'UI/Base';
import * as template from 'wml!Controls/_dateRange/ArrowButton/ArrowButton';

/**
 * Контрол кнопка для переключения периода.
 * @class Controls/_dateRange/ArrowButton
 * @public
 * @author Красильников А.С.
 * @demo Controls-demo/dateRange/ButtonsController/Index
 * @see Controls/_dateRange/ButtonsController
 * @see Controls/_buttons/ArrowButton
 */

export default class ButtonsController extends Control {
    protected _template: TemplateFunction = template;

    protected _shiftPeriod(): void {
        this._notify('shiftDateRangePeriod', [this._options.direction], {bubbling: true});
    }
}
