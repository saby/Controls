import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import template = require('wml!Controls/_buttons/ArrowButton/ArrowButton');

type TArrowButtonDirection = 'right' | 'left' | 'up' | 'down';

export interface IArrowButtonOptions extends IControlOptions {
    direction?: TArrowButtonDirection;
    inlineHeight?: string;
}

/**
 * Графический контрол в виде стрелки, который предоставляет пользователю возможность простого запуска события при нажатии на него.
 * @class Controls/_buttons/ArrowButton
 * @extends UI/Base:Control
 * @public
 * @author Красильников А.С.
 * @demo Controls-demo/Buttons/ArrowButton/Index
 */

class ArrowButton extends Control<IArrowButtonOptions>  {
    protected _template: TemplateFunction = template;

    private _clickHandler = (event: Event): void => {
        if (this._options.readOnly) {
            event.stopPropagation();
        }
    }
    static getDefaultOptions(): object {
        return {
            inlineHeight: 's'
        };
    }

    static _theme: string[] = ['Controls/buttons', 'Controls/Classes'];
}

Object.defineProperty(ArrowButton, 'defaultProps', {
   enumerable: true,
   configurable: true,

   get(): object {
      return ArrowButton.getDefaultOptions();
   }
});

/**
 * @typedef {String} TArrowButtonDirection
 * @variant left Влево.
 * @variant right Вправо.
 * @variant up Вверх.
 * @variant down Вниз.
 */

/**
 * @name Controls/_buttons/ArrowButton#direction
 * @cfg {TArrowButtonDirection} Выбор стороны, куда будет указывтаь стрелка в кнопке.
 * @example
 * <pre class="brush: html">
 * <Controls.Buttons:ArrowButton direction="left"/>
 * </pre>
 * @demo Controls-demo/Buttons/ArrowButton/Direction/Index
 */

/**
 * @name Controls/_buttons/ArrowButton#inlineHeight
 * @cfg {Enum} Высота контрола.
 * @variant s
 * @variant l
 * @variant s
 * @demo Controls-demo/Buttons/ArrowButton/InlineHeight/Index
 * @example
 * Кнопка большого размера (l).
 * <pre class="brush: html">
 * <!-- WML -->
 * <Controls.buttons:ArrowButton direction="down" inlineHeight="l"/>
 * </pre>
 */

export default ArrowButton;
