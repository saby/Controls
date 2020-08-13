import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import ViewModel from './ViewModel';
import template = require('wml!Controls/_switchableArea/View');
import defaultItemTemplate from './ItemTpl';
import {factory} from 'Types/chain';
import {Logger} from 'UI/Utils';
import {SyntheticEvent} from 'Vdom/Vdom';
import {RegisterClass} from 'Controls/event';

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
 * Контрол для переключения контентных областей
 * @class Controls/_switchableArea/View
 * @extends Core/Control
 * @control
 * @public
 * @author Красильников А.С.
 * @demo Controls-demo/SwitchableArea/DemoSwitchableArea
 */

/**
 * @typedef {Object} SwitchableAreaItem
 * @property {String|Number} key Ключ элемента
 * @property {Function} itemTemplate Шаблон элемента
 * @property {templateOptions} templateOptions Опции шаблона элемента
 * @property {boolean} autofocus Определяет, установится ли фокус на контентную область. По умолчанию - true
 */

/**
 * @name Controls/_switchableArea/View#items
 * @cfg {Array.<SwitchableAreaItem>} Данные элементов
 */

/**
 * @name Controls/_switchableArea/View#selectedKey
 * @cfg {String} Ключ выбранного элемента.
 */

/**
 * @name Controls/_switchableArea/View#itemTemplate
 * @cfg {Function} Шаблон отображения элемента.
 */

class View extends Control<ISwitchableOptions> {
    protected _template: TemplateFunction = template;
    protected _viewModel: any; //TODO: заменить, когда переведем ViewModel на ts
    protected _selectedKey: number | string = null;
    protected _switchAreaRegister: RegisterClass;

    protected _beforeMount(options: ISwitchableOptions): void {
        this._correctSelectedKey(options);
        this._viewModel = new ViewModel(options.items, this._selectedKey);
        this._switchAreaRegister = new RegisterClass({register: 'switchArea'});
    }

    protected _beforeUpdate(newOptions: ISwitchableOptions): void {
        this._correctSelectedKey(newOptions);
        if (this._options.items !== newOptions.items) {
            this._viewModel.updateItems(newOptions.items, this);
        }
        if (this._options.selectedKey !== newOptions.selectedKey) {
            this._viewModel.updateSelectedKey(this._selectedKey);
            this._startSwitchArea();
        }
    }

    protected _beforeUnmount(): void {
        this._viewModel = null;
        if (this._switchAreaRegister) {
            this._switchAreaRegister.destroy();
            this._switchAreaRegister = null;
        }
    }

    _correctSelectedKey(options: ISwitchableOptions): void {
        let selectedKey;
        factory(options.items).each((item) => {
            if (item.get) {
                if (options.selectedKey === item.get('id') || options.selectedKey === item.get('key')) {
                    selectedKey = options.selectedKey;
                }
            } else {
                if (options.selectedKey === item.id || options.selectedKey === item.key) {
                    selectedKey = options.selectedKey;
                }
            }
        });

        if (selectedKey === undefined) {
            Logger.error('SwitchableArea: Incorrect selectedKey', this);
            if (options.items instanceof Array) {
                selectedKey = options.items[0].id || options.items[0].key;
            } else {
                selectedKey = options.items.at(0).get('id') || options.items.at(0).get('key');
            }
        }

        // Меняю состояние 1 раз, чтобы не вызывать лишних циклов синхронизации
        this._selectedKey = selectedKey;
    }
    // TODO https://online.sbis.ru/doc/a88a5697-5ba7-4ee0-a93a-221cce572430
    private _startSwitchArea(): void {
        const eventCfg = {
            type: 'switchArea',
            target: this._container,
            _bubbling: true
        };

        this._switchAreaRegister.start(new SyntheticEvent(null, eventCfg));
    }

    private _registerHandler(event: SyntheticEvent, registerType: string, component, callback, config): void {
        this._switchAreaRegister.register(event, registerType, component, callback, config);
    }
    protected _unregisterHandler(event: SyntheticEvent, registerType: string, component, config): void {
        this._switchAreaRegister.unregister(event, component, config);
    }

    static getDefaultOptions(): ISwitchableOptions {
        return {
            itemTemplate: defaultItemTemplate
        };
    }
}

export default View;
