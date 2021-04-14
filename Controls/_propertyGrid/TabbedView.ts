import {Control, TemplateFunction} from 'UI/Base';
import * as template from 'wml!Controls/_propertyGrid/TabbedView/TabbedView';

import {Memory} from 'Types/source';

import {IPropertyGridOptions} from './IPropertyGrid';
import IPropertyGridProperty from './IProperty';

import {ITabsButtonsOptions} from 'Controls/tabs';

interface IOptions extends IPropertyGridOptions {
    tabProperty: string;
    tabsConfig: ITabsButtonsOptions;
}

interface ISwitchableAreaItem {
    key: string;
    templateOptions: Partial<IPropertyGridOptions>;
}

/**
 * Контрол, который позволяет пользователям просматривать и редактировать свойства объекта с возможностью группировки по вкладкам
 * @author Герасимов А.М.
 * @control
 * @class Controls/_propertyGrid/TabbedView
 * @mixes Controls/_propertyGrid/IPropertyGrid
 * @demo Controls-demo/PropertyGridNew/TabbedView/Index
 * @extends UI/Base:Control
 */
export default class TabbedView extends Control<IOptions> {
    protected _template: TemplateFunction = template;

    protected _tabsSource: Memory;
    protected _switchableAreaItems: ISwitchableAreaItem[];

    protected _selectedKey: string;

    protected _beforeMount(options: IOptions): void {
        this._applyNewStateFromOptions(options);
    }

    protected _beforeUpdate(options: IOptions): void {
        if (this._options.source !== options.source) {
            this._applyNewStateFromOptions(options);
        }
    }

    protected _applyNewStateFromOptions(options: IOptions): void {
        const config = this._createTabsConfig(options);

        this._tabsSource = config.tabsSource;
        this._switchableAreaItems = config.switchableAreaItems;

        this._selectedKey = config.switchableAreaItems[0].key;
    }

    protected _handleObjectChange(_: Event, obj: object): void {
        this._notify('editingObjectChanged', [obj]);
    }

    protected _createTabsConfig(options: IOptions): {
        tabsSource: Memory,
        switchableAreaItems: ISwitchableAreaItem[]
    } {
        const tabs: Record<string, IPropertyGridProperty[]> = {};

        let tabsSource: Memory;
        let switchableAreaItems: ISwitchableAreaItem[];

        options.source.forEach((item) => {
            tabs[item.tab] = [...(tabs[item.tab] || []), item];
        });

        tabsSource = new Memory({
            data: Object.keys(tabs).map((item) => ({
                key: item,
                title: item,
                align: 'left'
            })),
            keyProperty: 'key'
        });

        switchableAreaItems = Object.entries(tabs).map(([key, source]) => {
            return {
                key,
                templateOptions: {
                    source
                }
            };
        });

        return {
            tabsSource,
            switchableAreaItems
        };
    }
}

/**
 * @name Controls/_propertyGrid/TabbedView#tabProperty
 * @cfg {string} Имя свойства, содержащего идентификатор таба элемента редактора свойств.
 */
