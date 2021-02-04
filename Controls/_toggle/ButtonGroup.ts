import {TemplateFunction} from 'UI/Base';
import template = require('wml!Controls/_toggle/ButtonGroup/ButtonGroup');
import {ButtonTemplate} from 'Controls/buttons';
import ButtonGroupBase from 'Controls/_toggle/ButtonGroupBase';

/**
 * Контрол представляет собой набор из нескольких взаимосвязанных между собой кнопок. Используется, когда необходимо выбрать один из нескольких параметров.
 * @class Controls/_toggle/ButtonGroup
 * @extends Controls/_toggle/ButtonGroupBase
 * @public
 * @author Красильников А.С.
 * @demo Controls-demo/toggle/ButtonGroup/Index
 */

class ButtonGroup extends ButtonGroupBase {
    protected _template: TemplateFunction = template;
    protected _buttonTemplate: TemplateFunction = ButtonTemplate;
}

Object.defineProperty(ButtonGroup, 'defaultProps', {
   enumerable: true,
   configurable: true,

   get(): object {
      return ButtonGroup.getDefaultOptions();
   }
});

export default ButtonGroup;
