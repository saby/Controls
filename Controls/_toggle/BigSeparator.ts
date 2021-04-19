import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import {ICheckable, ICheckableOptions} from './interface/ICheckable';
import BigSeparatorTemplate = require('wml!Controls/_toggle/BigSeparator/BigSeparator');
import {descriptor as EntityDescriptor} from 'Types/entity';
import {IIconSize, IIconSizeOptions} from 'Controls/interface';
import 'css!Controls/toggle';

/**
 * @typedef TViewMode
 * @variant ellipsis Иконка открытия отображатеся в виде троеточия
 * @variant arrow Иконка открытия отображатеся в виде стрелки
 */
type TViewMode = 'ellipsis' | 'arrow';

export interface IBigSeparatorOptions extends IControlOptions, ICheckableOptions, IIconSizeOptions {
    /**
     * Режим отображения иконки открытия.
     * @default ellipsis
     * @demo Controls-demo/toggle/BigSeparator/ViewMode/Index
     */
   viewMode?: TViewMode;
    /**
     * Определяет контрастность фона кнопки по отношению к ее окружению.
     * @default true
     * @demo Controls-demo/toggle/BigSeparator/ContrastBackground/Index
     */
    contrastBackground?: boolean;
    /**
     * Размер кнопки.
     * @default 'm'
     * @demo Controls-demo/toggle/BigSeparator/SeparatorSize/Index
     */
    iconSize?: string;
}

/**
 * Контрол служит для визуального ограничения контента. При клике на него отображаются скрытые записи, попавшие в ограничение.
 *
 * @remark
 * Полезные ссылки:
 * * {@link /materials/Controls-demo/app/Controls-demo%2Ftoggle%2FBigSeparator%2FIndex демо-пример}
 * * {@link https://github.com/saby/wasaby-controls/blob/69b02f939005820476d32a184ca50b72f9533076/Controls-default-theme/variables/_toggle.less переменные тем оформления}
 *
 * @class Controls/_toggle/BigSeparator
 * @extends UI/Base:Control
 *
 * @public
 * @author Красильников А.С.
 * @implements Controls/toggle:ICheckable
 *
 * @demo Controls-demo/toggle/BigSeparator/Index
 */

class BigSeparator extends Control<IBigSeparatorOptions> implements ICheckable, IIconSize {
   readonly '[Controls/_toggle/interface/ICheckable]': boolean = true;
   readonly '[Controls/_interface/IIconSize]': boolean = true;

   protected _template: TemplateFunction = BigSeparatorTemplate;

   protected _clickHandler(): void {
      this._notify('valueChanged', [!this._options.value]);
   }

   static getDefaultOptions(): IBigSeparatorOptions {
      return {
         value: false,
         iconSize: 'm',
         contrastBackground: true
      };
   }

   static getOptionTypes(): object {
      return {
         value: EntityDescriptor(Boolean)
      };
   }
}

Object.defineProperty(BigSeparator, 'defaultProps', {
   enumerable: true,
   configurable: true,

   get(): object {
      return BigSeparator.getDefaultOptions();
   }
});

/**
 * @name Controls/_toggle/Separator#value
 * @cfg {Boolean} Если значение - "true", то будет отображаться иконка открытия, иначе будет отображаться иконка закрытия.
 */

export default BigSeparator;
