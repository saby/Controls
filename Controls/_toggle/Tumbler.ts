import * as template from 'wml!Controls/_toggle/Tumbler/Tumbler';
import {TemplateFunction} from 'UI/Base';
import {Model} from 'Types/entity';
import ButtonGroupBase, {IButtonGroupOptions} from 'Controls/_toggle/ButtonGroupBase';
import * as ItemTemplate from 'wml!Controls/_toggle/Tumbler/itemTemplate';
import {IItemTemplateOptions} from 'Controls/interface';
import {Record} from 'Types/entity';

interface IBackgroundPosition {
    [key: number]: IBackgroundPositionData;
    isEmpty: boolean;
}

interface IBackgroundPositionData {
    width: number;
    left: number;
}

interface ITumblerOptions extends IButtonGroupOptions, IItemTemplateOptions {}

/**
 * @name Controls/_toggle/Tumbler#keyProperty
 * @cfg {string} Имя свойства, содержащего информацию об идентификаторе текущего элемента.
 * @example
 * <pre class="brush: html">
 *      <!-- WML -->
 *      <Controls.toggle:Tumbler items="{{_items}}" keyProperty="id"/>
 * </pre>
 * <pre class="brush: js">
 *     // TypeScript
 *     new RecordSet({
            rawData: [
                {
                   id: '1',
                   caption: 'Название 1'
                },
                {
                    id: '2',
                    caption: 'Название 2'
                }
            ],
            keyProperty: 'id'
        });
 * </pre>
 */

/**
 * @name Controls/_toggle/Tumbler#itemTemplate
 * @cfg {TemplateFunction|String} Шаблон элемента кнопочного переключателя.
 * @demo Controls-demo/toggle/Tumbler/ItemTemplate/Index
 *
 * По умолчанию используется шаблон "Controls/toogle:tumblerItemTemplate".
 * Также есть базовый шаблон для отображения записей со счетчиком Controls/toggle:tumblerItemCounterTemplate
 *
 * Шаблон tumblerItemCounterTemplate поддерживает следующие параметры:
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
 *    <Controls.toggle:Tumbler items="{{_items}}" >
 *       <ws:itemTemplate>
 *          <ws:partial template="Controls/toggle:tumblerItemCounterTemplate" scope="{{itemTemplate}}" />
 *       </ws:itemTemplate>
 *    </Controls.toggle:Tumbler>
 * </pre>
 * @see itemTemplateProperty
 */

/**
 * @name Controls/_toggle/Tumbler#itemTemplateProperty
 * @cfg {String} Имя свойства, содержащего ссылку на шаблон элемента. Если значение свойства не передано, то для отрисовки используется itemTemplate.
 * @remark
 * Чтобы определить шаблон, вы должны вызвать базовый шаблон.
 * Шаблон размещается в компоненте с использованием тега <ws:partial> с атрибутом "template".
 *
 * @example
 * Пример описания.
 * <pre>
 *    <Controls.toggle:Tumbler itemTemplateProperty="myTemplate" source="{{_source}}...>
 *    </Controls.toggle:Tumbler>
 * </pre>
 * myTemplate
 * <pre>
 *    <ws:partial template="Controls/toggle:tumblerItemTemplate"/>
 * </pre>
 * <pre>
 *    _source: new Memory({
 *       keyProperty: 'id',
 *       data: [
 *          {id: 1, title: 'I agree'},
 *          {id: 2, title: 'I not decide'},
 *          {id: 4, title: 'Will not seem', caption: 'I not agree',  myTemplate: 'wml!.../myTemplate'}
 *       ]
 *    })
 * </pre>
 * @see itemTemplate
 */

/**
 * @name Controls/_toggle/Tumbler#displayProperty
 * @cfg {String} Имя поля элемента, значение которого будет отображаться в названии кнопок тумблера.
 *
 * @example
 * Пример описания.
 * <pre>
 *    <Controls.toggle:Tumbler displayProperty="caption" items="{{_items1}}" bind:selectedKey="_selectedKey1"/>
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
 * @demo Controls-demo/toggle/Tumbler/displayProperty/Index
 */

/**
 * Контрол представляет собой кнопочный переключатель. Используется, когда на странице необходимо разместить
 * неакцентный выбор из одного или нескольких параметров.
 * @class Controls/_toggle/Tumbler
 * @extends Controls/_toggle/ButtonGroupBase
 * @public
 * @author Красильников А.С.
 * @demo Controls-demo/toggle/Tumbler/Index
 */

/**
 * @name Controls/_toggle/Tumbler#readOnly
 * @cfg
 * @demo Controls-demo/toggle/Tumbler/ReadOnly/Index
 */

class Tumbler extends ButtonGroupBase {
    protected _template: TemplateFunction = template;
    protected _backgroundPosition: IBackgroundPosition = {isEmpty: true};

    protected _beforeUpdate(newOptions: IButtonGroupOptions): void {
        if (this._options.items !== newOptions.items) {
            this._backgroundPosition = {isEmpty: true};
        }
    }

    protected _mouseEnterHandler(): void {
        this._setBackgroundPosition();
    }

    protected _touchStartHandler(): void {
        this._setBackgroundPosition();
    }

    protected _getTemplate(
        template: TemplateFunction,
        item: Record,
        itemTemplateProperty: string
    ): TemplateFunction {
        if (itemTemplateProperty) {
            const templatePropertyByItem = item.get(itemTemplateProperty);
            if (templatePropertyByItem) {
                return templatePropertyByItem;
            }
        }
        return template;
    }

    private _setBackgroundPosition(): void {
        if (this._backgroundPosition.isEmpty) {
            this._backgroundPosition = {isEmpty: false};
            this._options.items.forEach((item: Model, index: number) => {
                const key = item.get(this._options.keyProperty);
                this._backgroundPosition[key] = {
                    width: (this._children['TumblerButton' + index] as HTMLDivElement).offsetWidth,
                    left: (this._children['TumblerButton' + index] as HTMLDivElement).offsetLeft
                };
            });
        }
    }
    static getDefaultOptions(): ITumblerOptions {
        return {
            keyProperty: 'id',
            itemTemplate: ItemTemplate
        };
    }
}

export default Tumbler;
