import {Control, TemplateFunction} from 'UI/Base';
import template = require('wml!Controls-demo/Tabs/Buttons/ItemRightTemplate/ItemRightTemplate');
import {Memory} from 'Types/source';
import 'wml!Controls-demo/Tabs/Buttons/resources/itemTemplate';
import 'wml!Controls-demo/Tabs/Buttons/resources/iconTemplate';
import 'wml!Controls-demo/Tabs/Buttons/resources/iconLeftTemplate';

export default class TabButtonsDemo extends Control {
    protected _template: TemplateFunction = template;

    protected SelectedKey: string = '1';
    protected _source: Memory | null = null;

    protected _beforeMount(): void {
        this._source = new Memory({
            keyProperty: 'id',
            data: [
                {
                    id: '1',
                    align: 'left',
                    text: 'Отпуск',
                    icon: 'icon-Vacation',
                    iconStyle: 'success',
                    itemTemplate: 'wml!Controls-demo/Tabs/Buttons/resources/itemTemplate',
                    leftTemplate: 'wml!Controls-demo/Tabs/Buttons/resources/iconLeftTemplate'
                },
                {
                    id: '2',
                    align: 'left',
                    text: 'Отгул',
                    icon: 'icon-SelfVacation',
                    iconStyle: 'warning',
                    itemTemplate: 'wml!Controls-demo/Tabs/Buttons/resources/itemTemplate',
                    leftTemplate: 'wml!Controls-demo/Tabs/Buttons/resources/iconLeftTemplate',
                    rightTemplate: 'wml!Controls-demo/Tabs/Buttons/resources/iconTemplate'
                },
                {
                    id: '3',
                    align: 'left',
                    text: 'Больничный',
                    icon: 'icon-Sick',
                    iconStyle: 'secondary',
                    itemTemplate: 'wml!Controls-demo/Tabs/Buttons/resources/itemTemplate',
                    rightTemplate: 'wml!Controls-demo/Tabs/Buttons/resources/iconTemplate'
                }
            ]
        });
    }

    static _styles: string[] = ['Controls-demo/Tabs/Buttons/Buttons', 'Controls-demo/Controls-demo'];
}
