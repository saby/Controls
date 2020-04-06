import {Control, TemplateFunction} from 'UI/Base';
import template = require("wml!Controls/_buttons/ArrowButton/ArrowButton");
import IArrowButton from 'Controls/_buttons/interfaces/IArrowButton';
/**
 * Графический контрол в виде стрелки, который предоставляет пользователю возможность простого запуска события при
 * нажатии на него.
 * @class Controls/_buttons/interface/ArrowButton
 * @extends Core/Control
 * @control
 * @public
 * @demo Controls-demo/Buttons/ArrowButton/Index
 */
class Component extends Control implements IArrowButton {
    readonly '[Controls/_buttons/interface/IArrowButton]': boolean = true;
    protected _template: TemplateFunction = template;

    private _clickHandler = (event: Event): void => {
        if (this._options.readOnly) {
            event.stopPropagation();
        }
    }

    static _theme: string[] = ['Controls/buttons', 'Controls/Classes'];
}

export default Component;
