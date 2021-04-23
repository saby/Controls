import {IOptions as ITabbedViewOptions} from '../TabbedView';
import {IPropertyGridOptions} from '../IPropertyGrid';

import {Memory} from 'Types/source';
import IPropertyGridProperty from 'Controls/_propertyGrid/IProperty';

export interface ISwitchableAreaItem {
    key: string;
    templateOptions: Partial<IPropertyGridOptions>;
}

export default class TabsController {
    private _tabsSource: Memory;
    private _switchableAreaItems: ISwitchableAreaItem[];

    constructor(private _options: Partial<ITabbedViewOptions>) {
        this._saveTabsConfig(_options);
    }

    updateOptions(options: Partial<ITabbedViewOptions>): boolean|void {
        let isChanged = false;

        if (
            this._options.source !== options.source ||
            this._options.tabProperty !== options.tabProperty
        ) {
            this._saveTabsConfig(options);

            isChanged = true;
        }

        this._options = options;

        return isChanged;
    }

    getTabsSource(): Memory {
        return this._tabsSource;
    }

    getSwitchableAreaItems(): ISwitchableAreaItem[] {
        return this._switchableAreaItems;
    }

    private _saveTabsConfig(options: Partial<ITabbedViewOptions>): void {
        const tabs: Record<string, IPropertyGridProperty[]> = {};
        const tabProperty = options.tabProperty;

        let tabsSource: Memory;
        let switchableAreaItems: ISwitchableAreaItem[];

        options.source.forEach((item) => {
            tabs[item[tabProperty]] = [...(tabs[item[tabProperty]] || []), item];
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

        this._tabsSource = tabsSource;
        this._switchableAreaItems = switchableAreaItems;
    }
}
