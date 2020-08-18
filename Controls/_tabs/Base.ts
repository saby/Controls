import {Control, TemplateFunction} from 'UI/Base';
import {CrudWrapper} from 'Controls/dataSource';
import * as cInstance from 'Core/core-instance';
import {RecordSet} from 'Types/collection';
import {Model} from 'Types/entity';
import {SbisService} from 'Types/source';
import {ITabsButtonsOptions} from './interface/ITabsButtons';
import { constants } from 'Env/Env';
import {IAdaptiveTabsOptions} from './interface/IAdaptiveTabs';
import {isLeftMouseButton} from 'Controls/Utils/FastOpen';
import {SyntheticEvent} from 'Vdom/Vdom';

interface IReceivedState {
    items: RecordSet;
    itemsOrder: number[];
    lastRightOrder: number;
}

class Base extends Control<ITabsButtonsOptions> {

    protected _itemsOrder: number[];
    protected _lastRightOrder: number;
    protected _items: RecordSet;
    private _crudWrapper: CrudWrapper;

    protected _prepareBeforeMountItems(options: ITabsButtonsOptions | IAdaptiveTabsOptions, receivedState: IReceivedState): void | Promise<IReceivedState> {
        if (receivedState) {
            this._prepareState(receivedState);
        } else if (options.items) {
            const itemsData = this._prepareItems(options.items);
            this._prepareState(itemsData);
        } else if (options.source) {
            return this._initItems(options.source).then((result: IReceivedState) => {
                // TODO https://online.sbis.ru/opendoc.html?guid=527e3f4b-b5cd-407f-a474-be33391873d5
                if (!Base._checkHasFunction(result)) {
                    this._prepareState(result);
                    return result;
                }
            });
        }
    }

    protected _prepareBeforeUpdateItems(newOptions: ITabsButtonsOptions | IAdaptiveTabsOptions): void {
        if (newOptions.source && newOptions.source !== this._options.source) {
            this._initItems(newOptions.source).then((result) => {
                this._prepareState(result);
            });
        }
        if (newOptions.items && newOptions.items !== this._options.items) {
            const itemsData = this._prepareItems(newOptions.items);
            this._prepareState(itemsData);
        }
    }

    protected _onItemClick(event: SyntheticEvent<MouseEvent>, key: string): void {
        if (isLeftMouseButton(event)) {
            this._notify('selectedKeyChanged', [key]);
        }
    }

    protected _prepareItemSelectedClass(item: Model): string {
        const classes = [];
        const options = this._options;
        const style = Base._prepareStyle(options.style);
        if (item.get(options.keyProperty) === options.selectedKey) {
            classes.push(`controls-Tabs_style_${style}__item_state_selected ` +
                `controls-Tabs_style_${style}__item_state_selected_theme_${options.theme}`);
            classes.push('controls-Tabs__item_state_selected ' +
                `controls-Tabs__item_state_selected_theme_${options.theme}`);
        } else {
            classes.push('controls-Tabs__item_state_default controls-Tabs__item_state_default_theme_' + options.theme);
        }
        return classes.join(' ');
    }

    protected _prepareItemOrder(index: number): string {
        const order = this._itemsOrder[index];
        return '-ms-flex-order:' + order + '; order:' + order;
    }

    private _prepareItems(items: RecordSet): IReceivedState {
        let leftOrder: number = 1;
        let rightOrder: number = 30;
        const itemsOrder: number[] = [];

        items.each((item: Model) => {
            if (item.get('align') === 'left') {
                itemsOrder.push(leftOrder++);
            } else {
                itemsOrder.push(rightOrder++);
            }
        });

        // save last right order
        rightOrder--;
        this._lastRightOrder = rightOrder;

        return {
            items,
            itemsOrder,
            lastRightOrder: rightOrder
        };
    }

    private _initItems(source: SbisService): Promise<IReceivedState> {
        this._crudWrapper = new CrudWrapper({
            source
        });
        return this._crudWrapper.query({}).then((items: RecordSet) => {
            return this._prepareItems(items);
        });
    }

    protected _prepareState(data: IReceivedState): void {
        this._items = data.items;
        this._itemsOrder = data.itemsOrder;
        this._lastRightOrder = data.lastRightOrder;
    }

    static _theme: string[] = ['Controls/tabs'];

    static _prepareStyle(style: string): string {
        if (style === 'default') {
            // 'Tabs/Buttons: Используются устаревшие стили. Используйте style = primary вместо style = default'
            return 'primary';
        } else if (style === 'additional') {
            // Tabs/Buttons: Используются устаревшие стили. Используйте style = secondary вместо style = additional'
            return 'secondary';
        } else {
            return style;
        }
    }

    static _checkHasFunction(receivedState: IReceivedState): boolean {
        // Функции, передаваемые с сервера на клиент в receivedState, не могут корректно десериализоваться.
        // Поэтому, если есть функции в receivedState, заново делаем запрос за данными.
        // Если в записи есть функции, то итемы в receivedState не передаем, на клиенте перезапрашивает данные
        if (constants.isServerSide && receivedState?.items?.getCount) {
            const count = receivedState.items.getCount();
            for (let i = 0; i < count; i++) {
                const item = receivedState.items.at(i);
                const value = cInstance.instanceOfModule(item, 'Types/entity:Record') ? item.getRawData() : item;
                for (const key in value) {
                    // При рекваере шаблона, он возвращает массив, в 0 индексе которого лежит объект с функцией
                    if (typeof value[key] === 'function' ||
                        value[key] instanceof Array && typeof value[key][0].func === 'function') {
                        return true;
                    }
                }
            }
        }

        return false;
    }

    static getDefaultOptions(): ITabsButtonsOptions {
        return {
            style: 'primary',
            displayProperty: 'title'
        };
    }
}

export default Base;
