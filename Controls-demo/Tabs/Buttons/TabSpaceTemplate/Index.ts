import {Control, TemplateFunction} from 'UI/Base';
import template = require('wml!Controls-demo/Tabs/Buttons/TabSpaceTemplate/TabSpaceTemplate');
import spaceTemplate = require('wml!Controls-demo/Tabs/Buttons/resources/spaceTemplate');
import {Memory} from 'Types/source';

export default class TabButtonsDemo extends Control {
    protected _template: TemplateFunction = template;
    protected _spaceTemplate: TemplateFunction = spaceTemplate;

    protected SelectedKey: string = '1';
    protected _source: Memory | null = null;
    protected _source1: Memory | null = null;

    protected _beforeMount(): void {
        this._source = new Memory({
            keyProperty: 'id',
            data: [
                {
                    id: '1',
                    title: 'Meetings',
                    align: 'left'
                },
                {
                    id: '2',
                    title: 'Groups'
                },
                {
                    id: '3',
                    title: 'Documents'
                }
            ]
        });
        this._source1 = new Memory({
            keyProperty: 'id',
            data: [
                {
                    id: '1',
                    title: 'Document',
                    align: 'left',
                    contentTab: true

                },
                {
                    id: '2',
                    title: 'Files',
                    align: 'left'
                },
                {
                    id: '3',
                    title: 'Orders',
                    align: 'left'
                }
            ]
        });
    }

    static _styles: string[] = ['Controls-demo/Tabs/Buttons/Buttons', 'Controls-demo/Controls-demo'];
}
