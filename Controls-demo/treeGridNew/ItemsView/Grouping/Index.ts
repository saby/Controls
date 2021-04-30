// tslint:disable-next-line:ban-ts-ignore
// @ts-ignore
import * as Template from 'wml!Controls-demo/treeGridNew/ItemsView/Grouping/Index';
import {Control, TemplateFunction} from 'UI/Base';
import {RecordSet} from 'Types/collection';
import {groupConstants} from 'Controls/display';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _items: RecordSet;
    protected _columns: unknown[] = [
        {
            displayProperty: 'title',
            width: ''
        }
    ];

    protected _beforeMount(): void {
        this._items = new RecordSet({
            keyProperty: 'id',
            rawData: [
                {
                    id: 1,
                    group: groupConstants.hiddenGroup,
                    node: null,
                    parent: null,
                    title: 'item 1',
                    hasChildren: false
                },
                {
                    id: 2,
                    group: 'group 1',
                    node: null,
                    parent: null,
                    title: 'item 2',
                    hasChildren: false
                },
                {
                    id: 3,
                    group: 'group 2',
                    node: null,
                    parent: null,
                    title: 'item 3',
                    hasChildren: false
                }
            ]
        });
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
