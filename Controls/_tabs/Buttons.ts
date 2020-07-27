/**
 * Created by kraynovdo on 25.01.2018.
 */
import {Control, TemplateFunction} from 'UI/Base';
import {Logger} from 'UI/Utils';
import {factory} from 'Types/chain';
import {CrudWrapper} from 'Controls/dataSource';
import * as cInstance from 'Core/core-instance';
import {RecordSet} from 'Types/collection';
import {Model} from 'Types/entity';
import {SbisService} from 'Types/source';
import {ITabsButtons, ITabsButtonsOptions} from './interface/ITabsButtons';

import TabButtonsTpl = require('wml!Controls/_tabs/Buttons/Buttons');
import ItemTemplate = require('wml!Controls/_tabs/Buttons/ItemTemplate');

/**
 * Контрол предоставляет пользователю возможность выбрать между двумя или более вкладками.
 *
 * @remark
 * Полезные ссылки:
 * * <a href="/materials/Controls-demo/app/Controls-demo%2FTabs%2FButtons">демо-пример</a>
 * * <a href="https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/aliases/_tabs.less">переменные тем оформления</a>
 *
 * @class Controls/_tabs/Buttons
 * @extends Core/Control
 * @mixes Controls/_interface/ISingleSelectable
 * @mixes Controls/_interface/ISource
 * @mixes Controls/_tabs/interface/ITabsButtons
 * @control
 * @public
 * @category List
 * @author Красильников А.С.
 * @demo Controls-demo/Tabs/Buttons
 * @cssModifier controls-Tabs__item-underline_theme-{{_options.theme}} Позволяет добавить горизонтальный разделитель к прикладному контенту, чтобы расположить его перед вкладками.
 */

interface IReceivedState {
    items: RecordSet;
    itemsOrder: number[];
    lastRightOrder: number;
}

class TabsButtons extends Control<ITabsButtonsOptions> implements ITabsButtons {
    readonly '[Controls/_tabs/interface/ITabsButtons]': boolean;

    protected _template: TemplateFunction = TabButtonsTpl;
    protected _defaultItemTemplate: TemplateFunction = ItemTemplate;
    private _itemsOrder: number[];
    private _lastRightOrder: number;
    private _items: RecordSet;
    private _crudWrapper: CrudWrapper;

    protected _beforeMount(options: ITabsButtonsOptions,
                           context: object,
                           receivedState: IReceivedState): void | Promise<IReceivedState> {
        if (receivedState && !TabsButtons._checkHasFunction(receivedState, this)) {
            this._prepareState(receivedState);
        } else if (options.source) {
            return this._initItems(options.source).then((result: IReceivedState) => {
                this._prepareState(result);
                return result;
            });
        }
    }

    protected _beforeUpdate(newOptions: ITabsButtonsOptions): void {
        if (newOptions.source && newOptions.source !== this._options.source) {
            this._initItems(newOptions.source).then((result) => {
                this._prepareState(result);
                this._forceUpdate();
            });
        }
    }

    protected _onItemClick(event: Event, key: string): void {
        this._notify('selectedKeyChanged', [key]);
    }

    protected _prepareItemClass(item: Model, index: number): string {
        const order: number = this._itemsOrder[index];
        const options: ITabsButtonsOptions = this._options;
        const classes: string[] = ['controls-Tabs__item controls-Tabs__item_theme_' + options.theme];

        const align: string = item.get('align') ? item.get('align') : 'right';
        const isLastItem: boolean = order === this._lastRightOrder;

        classes.push(`controls-Tabs__item_align_${align} ` +
            `controls-Tabs__item_align_${align}_theme_${options.theme}`);
        if (order === 1 || isLastItem) {
            classes.push('controls-Tabs__item_extreme controls-Tabs__item_extreme_theme_' + options.theme);
        }
        if (order === 1) {
            classes.push('controls-Tabs__item_extreme_first controls-Tabs__item_extreme_first_theme_' + options.theme);
        } else if (isLastItem) {
            classes.push('controls-Tabs__item_extreme_last controls-Tabs__item_extreme_last_theme_' + options.theme);
        } else {
            classes.push('controls-Tabs__item_default controls-Tabs__item_default_theme_' + options.theme);
        }
        if (item.get('type')) {
            classes.push('controls-Tabs__item_type_' + item.get('type') +
                ' controls-Tabs__item_type_' + item.get('type') + '_theme_' + options.theme);
        }

        // TODO: по поручению опишут как и что должно сжиматься.
        // Пока сжимаем только те вкладки, которые прикладники явно пометили
        // https://online.sbis.ru/opendoc.html?guid=cf3f0514-ac78-46cd-9d6a-beb17de3aed8
        if (item.get('isMainTab')) {
            classes.push('controls-Tabs__item_canShrink');
        } else {
            classes.push('controls-Tabs__item_notShrink');
        }
        return classes.join(' ');
    }

    protected _prepareItemSelectedClass(item: Model): string {
        const classes = [];
        const options = this._options;
        const style = TabsButtons._prepareStyle(options.style);
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

    protected _getTemplate(template: TemplateFunction, item: Model, itemTemplateProperty: string): TemplateFunction {
        if (itemTemplateProperty) {
            if (item.get(itemTemplateProperty)) {
                return item.get(itemTemplateProperty);
            }
        }
        return template;
    }

    private _initItems(source: SbisService): Promise<IReceivedState> {
        this._crudWrapper = new CrudWrapper({
            source
        });
        return this._crudWrapper.query({}).then((items: RecordSet) => {
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
        });
    }

    private _prepareState(data: IReceivedState): void {
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

    static _checkHasFunction(receivedState: IReceivedState, instance: TabsButtons): boolean {
        /* Функции, передаваемые с сервера на клиент в receivedState, не могут корректно десериализоваться.
        Поэтому, если есть функции в receivedState, заново делаем запрос за данными. */
        let hasFunction = false;
        if (receivedState.items) {
            factory(receivedState.items).each((item: Model) => {
                const value = cInstance.instanceOfModule(item, 'Types/entity:Record') ? item.getRawData() : item;

                if (!hasFunction) {
                    for (const key in value) {
                        // При рекваере шаблона, он возвращает массив, в 0 индексе которого лежит объект с функцией
                        if (typeof value[key] === 'function' ||
                            value[key] instanceof Array && typeof value[key][0].func === 'function') {
                            hasFunction = true;
                            Logger.warn(instance._moduleName + `
                         : Из источника данных вернулся набор записей с функцией в поле ${key}.
                         В наборе данных должны быть простые типы.
                         Для задания шаблона - нужно указать имя этого шаблона.`, instance);
                        }
                    }
                }
            });
        }

        return hasFunction;
    }

    static getDefaultOptions(): ITabsButtonsOptions {
        return {
            style: 'primary',
            displayProperty: 'title'
        };
    }
}

export default TabsButtons;
