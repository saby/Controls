import {Control, TemplateFunction} from 'UI/Base';
import * as template from 'wml!Controls-demo/Browser/TwoLists/Index';
import {Memory} from 'Types/source';

export default class MultiSelectorCheckboxDemo extends Control {
    _template: TemplateFunction = template;
    _viewSource: Memory = null;
    _viewSource2: Memory = null;
    _panelSource: Memory = null;
    _listConfigs = {};
    _selectedKeys: string[] = [];
    _excludedKeys: string[] = [];

    _beforeMount(): void {
        this._listConfigs = {
            list1: {},
            list2: {}
        };
        this._viewSource = new Memory({
            keyProperty: 'id',
            data: [
                { id: 'list1.1', title: 'Moscow' },
                { id: 'list1.2', title: 'Tokyo' },
                { id: 'list1.3', title: 'New-York' },
                { id: 'list1.4', title: 'Beograd' },
                { id: 'list1.5', title: 'Paris' },
                { id: 'list1.6', title: 'Berlin' }
            ]
        });
        this._viewSource2 = new Memory({
            keyProperty: 'id',
            data: [
                { id: 'list2.1', title: 'Yaroslavl'},
                { id: 'list2.2', title: 'Moscow'},
                { id: 'list2.3', title: 'St-Petersburg'}
            ]
        });

        this._panelSource = new Memory({
            data: [{
                id: 'print',
                icon: 'icon-Print icon-medium',
                title: 'Распечатать'
            }, {
                id: 'save',
                icon: 'icon-Save',
                title: 'Выгрузить'
            }],
            keyProperty: 'id'
        });
    }
    _panelItemClick(event: Event, item): void {
        alert(`Click on ${item.getKey()}`);
    }

    static _styles: string[] = ['Controls-demo/Browser/TwoLists/Index'];
}
