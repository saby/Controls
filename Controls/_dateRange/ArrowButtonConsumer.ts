import {Control, TemplateFunction} from 'UI/Base';
import * as template from 'wml!Controls/_dateRange/ArrowButtonConsumer/ArrowButtonConsumer';
import {IArrowButtonOptions} from 'Controls/buttons';

/**
 * Контрол кнопка для переключения периода.
 * @class Controls/_dateRange/ArrowButtonConsumer
 * @public
 * @author Красильников А.С.
 * @demo Controls-demo/dateRange/ButtonsController/Index
 * @see Controls/_dateRange/ButtonsController
 * @see Controls/_buttons/ArrowButton
 */

interface IDateRangeArrowButton extends IArrowButtonOptions {
    shiftPeriod: Function;
}

export default class ButtonsController extends Control<IDateRangeArrowButton> {
    protected _template: TemplateFunction = template;

    protected _clickHandler(): void {
        const delta = this._options.direction === 'left' ? -1 : 1;
        this._children.consumer.shiftPeriod(delta);
    }
}
