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

/**
 * @name Controls/_toggle/ButtonGroup#displayProperty
 * @cfg {String} Имя поля элемента, значение которого будет отображаться в названии кнопок тумблера.
 *
 * @example
 * Пример описания.
 * <pre>
 *    <Controls.toggle:ButtonGroup displayProperty="caption" items="{{_items1}}" bind:selectedKey="_selectedKey1"/>
 * </pre>
 *
 * <pre>
 *   new RecordSet({
            rawData: [
                {
                    id: '1',
                    caption: 'caption 1',
                    title: 'title 1'
                },
                {
                    id: '2',
                    caption: 'Caption 2',
                    title: 'title 2'
                }
            ],
            keyProperty: 'id'
        });
 * </pre>
 *
 * @demo Controls-demo/toggle/ButtonGroup/displayProperty/Index
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
