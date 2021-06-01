import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/treeGridNew/DeepInside/DeepInside';
import {CrudEntityKey, HierarchicalMemory} from 'Types/source';
import { IColumn } from 'Controls/grid';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: HierarchicalMemory;
    protected _columns: IColumn[] = [
        { displayProperty: 'title' }
    ];
    protected _expandedItems: CrudEntityKey[] = [null];
    // tslint:disable-next-line
    protected _collapsedItems: CrudEntityKey[] = [6];

    protected _beforeMount(): void {
        const data = [
            { id: 1, title: 'Узел 1', parent: null, nodeType: true },
            { id: 11, title: 'Узел 1-1', parent: 1, nodeType: true },
            { id: 111, title: 'Узел 1-1-1', parent: 11, nodeType: true },
            { id: 1111, title: 'Лист 1-1-1-1', parent: 111, nodeType: null },
            { id: 1112, title: 'Лист 1-1-1-2', parent: 111, nodeType: null },
            { id: 1113, title: 'Лист 1-1-1-3', parent: 111, nodeType: null },
            { id: 112, title: 'Узел 1-1-2', parent: 11, nodeType: true },
            { id: 113, title: 'Узел 1-1-3', parent: 11, nodeType: true },

            { id: 12, title: 'Узел 1-2', parent: 1, nodeType: true },
            { id: 121, title: 'Узел 1-2-1', parent: 12, nodeType: true },
            { id: 1211, title: 'Лист 1-2-1-1', parent: 121, nodeType: null },
            { id: 12111, title: 'Лист 1-2-1-1-1', parent: 1211, nodeType: null },
            { id: 121111, title: 'Лист 1-2-1-1-1-1', parent: 12111, nodeType: null },
            { id: 1211111, title: 'Лист 1-2-1-1-1-1-1', parent: 121111, nodeType: null },
            { id: 2, title: 'Узел 2', parent: null, nodeType: true },
            { id: 3, title: 'Скрытый узел 3', parent: null, nodeType: false },
            { id: 4, title: 'Скрытый узел 4', parent: null, nodeType: false },
            { id: 5, title: 'Лист 5', parent: null, nodeType: null },
            { id: 6, title: 'Лист 6', parent: null, nodeType: null },
            { id: 7, title: 'Лист 7', parent: null, nodeType: null },
            { id: 8, title: 'Лист 8', parent: null, nodeType: null }
        ];
        this._viewSource = new HierarchicalMemory({
            keyProperty: 'key',
            data,
            filter: (): boolean => true
        });
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
