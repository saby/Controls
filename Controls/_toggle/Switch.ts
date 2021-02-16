import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import SwitchTemplate = require('wml!Controls/_toggle/Switch/Switch');
import {descriptor as EntityDescriptor} from 'Types/entity';
import {ICheckable, ICheckableOptions} from './interface/ICheckable';
import {ITooltip, ITooltipOptions, IValidationStatus, IValidationStatusOptions} from 'Controls/interface';
import 'css!Controls/toggle';
import 'css!Controls/CommonClasses';

export interface ISwitchOptions extends IControlOptions, ICheckableOptions, ITooltipOptions, IValidationStatusOptions {
   caption: string;
   captionPosition: string;
}
/**
 * Кнопка-переключатель с одним заголовком. Часто используется для настроек "вкл-выкл".
 * 
 * @remark
 * Полезные ссылки:
 * * {@link /materials/Controls-demo/app/Controls-demo%2ftoggle%2fSwitch%2fIndex демо-пример}
 * * {@link https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/aliases/_toggle.less переменные тем оформления}
 *
 * @class Controls/_toggle/Switch
 * @extends UI/Base:Control
 * @implements Controls/_toggle/interface/ICheckable
 * @implements Controls/_interface/ITooltip
 * 
 * @public
 * @author Красильников А.С.
 * @demo Controls-demo/toggle/Switch/Base/Index
 */

/*
 * Switch button with single caption. Frequently used for 'on-off' settings.
 *
 * <a href="/materials/Controls-demo/app/Controls-demo%2ftoggle%2fSwitch%2fIndex">Demo-example</a>.
 *
 * @class Controls/_toggle/Switch
 * @extends UI/Base:Control
 * @implements Controls/_toggle/interface/ICheckable
 * @implements Controls/_interface/ITooltip
 * 
 * @public
 * @author Красильников А.С.
 * @demo Controls-demo/toggle/Switch/Base/Index
 */

class Switch extends Control<ISwitchOptions> implements ITooltip, ICheckable, IValidationStatus {
   '[Controls/_interface/ITooltip]': true;
   '[Controls/_toggle/interface/ICheckable]': true;
   '[Controls/_interface/IValidationStatus]': true;

   // TODO https://online.sbis.ru/opendoc.html?guid=0e449eff-bd1e-4b59-8a48-5038e45cab22
   protected _template: TemplateFunction = SwitchTemplate;

   protected _clickHandler(): void {
      if (!this._options.readOnly) {
         this._notify('valueChanged', [!this._options.value]);
      }
   }

   static getDefaultOptions(): object {
      return {
         value: false,
         captionPosition: 'right',
         validationStatus: 'valid'
      };
   }
   static getOptionTypes(): object {
      return {
         value: EntityDescriptor(Boolean),
         captionPosition: EntityDescriptor(String).oneOf([
            'left',
            'right'
         ])
      };
   }
}

Object.defineProperty(Switch, 'defaultProps', {
   enumerable: true,
   configurable: true,

   get(): object {
      return Switch.getDefaultOptions();
   }
});

/**
 * @name Controls/_toggle/Switch#caption
 * @cfg {String} Текст заголовка кнопки.
 */

/*
 * @name Controls/_toggle/Switch#caption
 * @cfg {String} Caption text.
 */

/**
 * @name Controls/_toggle/Switch#captionPosition
 * @cfg {String} Определяет, с какой стороны расположен заголовок кнопки.
 * @variant left Заголовок расположен перед кнопкой.
 * @variant right Заголовок расположен после кнопки.
 * @default right
 */

/*
 * @name Controls/_toggle/Switch#captionPosition
 * @cfg {String} Determines on which side of the button caption is located.
 * @variant left Caption before toggle.
 * @variant right Toggle before caption.
 * @default right
 */
export default Switch;
