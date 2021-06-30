import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/treeGridNew/RowSeparator/WithHeaderAndGroups/WithHeaderAndGroups';
import {HierarchicalMemory} from 'Types/source';
import {createGroupingSource} from 'Controls-demo/treeGridNew/Grouping/Source';
import {IHeaderCell} from 'Controls/grid';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: HierarchicalMemory;
    protected _columns: unknown[] = [
        {
            width: '200px',
            displayProperty: 'title'
        }
    ];
    protected _header: IHeaderCell[] = [
        {
            caption: 'Наименование'
        }
    ];

    protected _beforeMount(): void {
        this._viewSource = new HierarchicalMemory({
            keyProperty: 'key',
            data: createGroupingSource({
                count: 6
            }),
            parentProperty: 'parent',
            filter: (): boolean => true
        });
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
