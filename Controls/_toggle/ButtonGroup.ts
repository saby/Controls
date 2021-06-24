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

/**
 * @name Controls/_toggle/ButtonGroup#itemTemplate
 * @cfg {TemplateFunction|String} Шаблон элемента кнопочного переключателя.
 * @demo Controls-demo/toggle/Chips/ItemTemplate/Index
 *
 * По умолчанию используется шаблон "Controls/toogle:chipsItemTemplate".
 * Также есть базовый шаблон для отображения записей со счетчиком Controls/toggle:chipsItemCounterTemplate
 *
 * Шаблон chipsItemCounterTemplate поддерживает следующие параметры:
 * - item {Types/entity:Record} — Отображаемый элемент;
 * - counterProperty {string} — Имя свойства элемента, содержимое которого будет отображаться в счетчике.
 *
 * @example
 * Отображение записей со счетчиками
 * JS:
 * <pre>
 * this._items = new Memory({
 *    keyProperty: 'key',
 *    data: [
 *       {key: 1, caption: 'Element 1', counter: 5},
 *       {key: 2, caption: 'Element 2', counter: 3},
 *       {key: 3, caption: 'Element 3', counter: 7}
 *    ]
 * });
 * </pre>
 *
 * WML
 * <pre>
 *    <Controls.toggle:ButtonGroup items="{{_items}}" >
 *       <ws:itemTemplate>
 *          <ws:partial template="Controls/toggle:chipsItemCounterTemplate" scope="{{itemTemplate}}" />
 *       </ws:itemTemplate>
 *    </Controls.toggle:ButtonGroup>
 * </pre>
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
