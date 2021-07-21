import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import {IItemsOptions, IMultiSelectableOptions} from 'Controls/interface';
import {ButtonTemplate} from 'Controls/buttons';
import {Model} from 'Types/entity';
import {SyntheticEvent} from 'Vdom/Vdom';
import * as template from 'wml!Controls/_toggle/ButtonGroup/ButtonGroup';
import * as itemTemplate from 'wml!Controls/_toggle/ButtonGroup/itemTemplate';
import {IItemTemplateOptions} from 'Controls/interface';
import 'css!Controls/buttons';
import 'css!Controls/toggle';
import 'css!Controls/CommonClasses';

export interface IChipsOptions extends IMultiSelectableOptions, IControlOptions, IItemsOptions<object>,
    IItemTemplateOptions {
}

/**
 * Контрол представляет собой набор из нескольких взаимосвязанных между собой кнопок. Используется, когда необходимо выбрать несколько параметров.
 * @class Controls/_toggle/Chips
 * @extends UI/Base:Control
 * @mixes Controls/interface:IMultiSelectable
 * @mixes Controls/interface:IItems
 * @public
 * @author Красильников А.С.
 * @demo Controls-demo/toggle/Chips/Index
 */

/**
 * @name Controls/_toggle/Chips#displayProperty
 * @cfg {String} Имя поля элемента, значение которого будет отображаться в названии кнопок тумблера.
 *
 * @example
 * Пример описания.
 * <pre>
 *    <Controls.toggle:Chips displayProperty="caption" items="{{_items1}}" bind:selectedKey="_selectedKey1"/>
 * </pre>
 *
 * <pre>
 *   new RecordSet({
 *          rawData: [
 *              {
 *                  id: '1',
 *                  caption: 'caption 1',
 *                  title: 'title 1'
 *              },
 *              {
 *                  id: '2',
 *                  caption: 'Caption 2',
 *                  title: 'title 2'
 *              }
 *          ],
 *          keyProperty: 'id'
 *      });
 * </pre>
 *
 * @demo Controls-demo/toggle/Chips/displayProperty/Index
 */

/**
 * @name Controls/_toggle/Chips#itemTemplate
 * @cfg {TemplateFunction|String} Шаблон элемента кнопочного переключателя.
 * @demo Controls-demo/toggle/Chips/ItemTemplate/Index
 *
 * По умолчанию используется шаблон "Controls/toogle:chipsItemTemplate".
 * Также есть базовый шаблон для отображения записей со счетчиком Controls/toggle:chipsItemCounterTemplate
 *
 * Шаблон chipsItemCounterTemplate поддерживает следующие параметры:
 * - item {Types/entity:Record} — Отображаемый элемент;
 * - counterProperty {string} — Имя свойства элемента, содержимое которого будет
 * отображаться в счетчике. По умолчанию counter;
 * - counterStyle {string} - Стиль цвета текста счетчика;
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
 *    <Controls.toggle:Chips items="{{_items}}" >
 *       <ws:itemTemplate>
 *          <ws:partial template="Controls/toggle:chipsItemCounterTemplate" scope="{{itemTemplate}}" />
 *       </ws:itemTemplate>
 *    </Controls.toggle:Chips>
 * </pre>
 */

class Chips extends Control<IChipsOptions> {
    protected _template: TemplateFunction = template;
    protected _buttonTemplate: TemplateFunction = ButtonTemplate;

    protected _getIconStyle(item: Model): string {
        if (this._isSelectedItem(item)) {
            return 'contrast';
        }
        return item.get('iconStyle') || 'default';
    }

    protected _isSelectedItem(item: Model): boolean {
        return this._options.selectedKeys.includes(item.get(this._options.keyProperty));
    }

    protected _onItemClick(event: SyntheticEvent<Event>, item: Model): void {
        const keyProperty = this._options.keyProperty;
        const selectedKeys = [...this._options.selectedKeys];
        const itemIndex = selectedKeys.indexOf(item.get(keyProperty));
        if (itemIndex === -1) {
            selectedKeys.push(item.get(keyProperty));
        } else {
            selectedKeys.splice(itemIndex, 1);
        }
        this._notify('selectedKeysChanged', [selectedKeys]);
    }

    static getDefaultOptions(): IChipsOptions {
        return {
            keyProperty: 'id',
            itemTemplate
        };
    }
}

Object.defineProperty(Chips, 'defaultProps', {
    enumerable: true,
    configurable: true,

    get(): object {
        return Chips.getDefaultOptions();
    }
});

export default Chips;
