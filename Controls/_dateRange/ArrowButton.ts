import {Control, TemplateFunction} from 'UI/Base';
import * as template from 'wml!Controls/_dateRange/ArrowButton/ArrowButton';
import {IArrowButtonOptions} from 'Controls/buttons';

interface IDateRangeArrowButton extends IArrowButtonOptions{
    shiftPeriod: Function;
}

export default class ButtonsController extends Control<IDateRangeArrowButton> {
    protected _template: TemplateFunction = template;

    protected _clickHandler(): void {
        const delta = this._options.direction === 'left' ? -1 : 1;
        this._options.shiftPeriod(delta);
    }
}
