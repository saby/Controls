import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/treeGridNew/RowSeparator/WithHeaderAndResults/WithHeaderAndResults';
import {HierarchicalMemory} from 'Types/source';
import {Flat} from 'Controls-demo/treeGridNew/DemoHelpers/Data/Flat';
import {IColumn, IHeaderCell} from 'Controls/grid';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: HierarchicalMemory;
    protected _columns: IColumn[] = Flat.getColumns();
    protected _header: IHeaderCell[] = Flat.getHeader();

    protected _beforeMount(): void {
        this._viewSource = new HierarchicalMemory({
            keyProperty: 'key',
            data: Flat.getData(),
            parentProperty: 'parent',
            filter: (): boolean => true
        });
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
