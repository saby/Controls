import {Control, TemplateFunction} from 'UI/Base';
import template = require("wml!Controls/_dateRange/ArrowButton/ArrowButton");
import IArrowButton from 'Controls/_dateRange/interfaces/IArrowButton';
/**
 * Контрол позволяет управлять выбранным периодом.
 *
 * @class Controls/_dateRange/Button
 * @extends Core/Control
 * @control
 * @public
 * @demo Controls-demo/dateRange/Button/Index
 */

class Component extends Control implements IArrowButton {
    readonly '[Controls/_dateRange/IArrowButton]': boolean = true;
    protected _template: TemplateFunction = template;

    private _clickHandler = (event: Event): void => {
        if (this._options.readOnly) {
            event.stopPropagation();
        }
    }
}

export default Component;
