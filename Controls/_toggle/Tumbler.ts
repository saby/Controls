import * as template from 'wml!Controls/_toggle/Tumbler/Tumbler';
import {TemplateFunction} from 'UI/Base';
import {Model} from 'Types/entity';
import ButtonGroupBase, {IButtonGroupOptions} from 'Controls/_toggle/ButtonGroupBase';
import * as ItemTemplate from 'wml!Controls/_toggle/Tumbler/itemTemplate';

interface IBackgroundPosition {
    [key: number]: IBackgroundPositionData;
    isEmpty: boolean;
}

interface IBackgroundPositionData {
    width: number;
    left: number;
}

/**
 * @name Controls/_toggle/Tumbler#itemTemplate
 * @cfg {Function} Шаблон для рендеринга элемента.
 * @demo Controls-demo/toggle/Tumbler/ItemTemplate/Index
 * @default Base template
 * @remark
 * Чтобы определить шаблон, вы должны вызвать базовый шаблон.
 * Шаблон размещается в компоненте с использованием тега <ws:partial> с атрибутом "template".
 *
 * @example
 * Tumbler с itemTemplate.
 * <pre>
 *    <Controls.toggle:Tumbler ... >
 *       <ws:itemTemplate>
 *          <ws:partial template="Controls/toggle:tumblerItemTemplate"/>
 *       </ws:itemTemplate>
 *    </Controls.toggle:Tumbler>
 * </pre>
 * @see itemTemplateProperty
 */

/**
 * @name Controls/_toggle/Tumbler#itemTemplateProperty
 * @cfg {String} Имя свойства элемента, которое содержит шаблон для рендеринга элемента.
 * @default Если не установлено, вместо него используется itemTemplate.
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
    protected _defaultItemTemplate: TemplateFunction = ItemTemplate;
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
        item: IButtonGroupOptions,
        itemTemplateProperty: string
    ): TemplateFunction {
        if (itemTemplateProperty) {
            const templatePropertyByItem = item[itemTemplateProperty];
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
}

export default Tumbler;
