import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import ViewModel from './ViewModel';
import template = require('wml!Controls/_switchableArea/View');
import defaultItemTemplate from './ItemTpl';
import {factory} from 'Types/chain';
import {Logger} from 'UI/Utils';

export interface ISwitchableOptions extends IControlOptions{
    itemTemplate: TemplateFunction;
    selectedKey?: string| number;
    items?: ISwitchableAreaItem;
}

interface ISwitchableAreaItem {
    key: string| number;
    itemTemplate?: TemplateFunction;
    templateOptions?: object;
}

/**
 * Контрол для переключения контентных областей.
 * @class Controls/_switchableArea/View
 * @extends UI/Base:Control
 * 
 * @public
 * @author Красильников А.С.
 * @demo Controls-demo/SwitchableArea/DemoSwitchableArea
 */

class View extends Control<ISwitchableOptions> {
    protected _template: TemplateFunction = template;
    protected _viewModel: any; //TODO: заменить, когда переведем ViewModel на ts
    protected _selectedKey: number | string = null;

    protected _beforeMount(options: ISwitchableOptions): void {
        this._correctSelectedKey(options);
        this._viewModel = new ViewModel(options.items, this._selectedKey);
    }

    protected _beforeUpdate(newOptions: ISwitchableOptions): void {
        this._correctSelectedKey(newOptions);
        if (this._options.items !== newOptions.items) {
            this._viewModel.updateItems(newOptions.items, this);
        }
        if (this._options.selectedKey !== newOptions.selectedKey) {
            this._viewModel.updateSelectedKey(this._selectedKey);
        }
    }

    protected _beforeUnmount(): void {
        this._viewModel = null;
    }

    _correctSelectedKey(options: ISwitchableOptions): void {
        let selectedKey;
        factory(options.items).each((item) => {
            if (item.get) {
                if (options.selectedKey === item.get('key')) {
                    selectedKey = options.selectedKey;
                }
            } else {
                if (options.selectedKey === item.key) {
                    selectedKey = options.selectedKey;
                }
            }
        });

        if (selectedKey === undefined) {
            Logger.error('SwitchableArea: Incorrect selectedKey', this);
            if (options.items instanceof Array) {
                selectedKey = options.items[0].key;
            } else {
                selectedKey = options.items.at(0).get('key');
            }
        }

        // Меняю состояние 1 раз, чтобы не вызывать лишних циклов синхронизации
        this._selectedKey = selectedKey;
    }

    static getDefaultOptions(): ISwitchableOptions {
        return {
            itemTemplate: defaultItemTemplate
        };
    }
}
/**
 * @typedef {Object} SwitchableAreaItem
 * @property {String|Number} key Ключ элемента.
 * @property {Function} itemTemplate Шаблон элемента (контентной области).
 * 
 * Шаблон, который указан в настройках этого свойства, нужно предварительно импортировать в родительский контрол.
 * Т.к. загрузка шаблонов происходит синхронно, то длительность инициализации контрола может быть увеличена.
 * 
 * Чтобы инициализация контрола происходила быстрее, шаблоны можно подгружать по необходимости, т.е. только при переключении на шаблон.
 * Для этого в конфигурации свойства **itemTemplate** рекомендуется использовать контрол-контейнер {@link Controls/Container/Async}.
 * Он позволяет реализовать отложенную загрузку шаблонов для {@link Controls/switchableArea:View}.
 * Это поведение показано в <a href="/materials/Controls-demo/app/Controls-demo%2FSwitchableArea%2FDemoSwitchableArea">демо-примере</a>.
 * Подробнее об использовании Controls/Container/Async можно прочитать <a href="/doc/platform/developmentapl/interface-development/pattern-and-practice/async-load/">здесь</a>.
 * @property {Object} templateOptions Опции, передаваемые в itemTemplate.
 * @property {Boolean} [autofocus=true] Определяет, установится ли фокус на контентную область.
 */

/**
 * @name Controls/_switchableArea/View#items
 * @cfg {Array.<SwitchableAreaItem>} Данные элементов.
 */

/**
 * @name Controls/_switchableArea/View#selectedKey
 * @cfg {String} Ключ выбранного элемента.
 */

/**
 * @name Controls/_switchableArea/View#itemTemplate
 * @cfg {Function} Шаблон отображения элемента.
 */
export default View;
