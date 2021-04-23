import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/treeGrid/DeepInside/DeepInside';
import {HierarchicalMemory, CrudEntityKey} from 'Types/source';
import {DeepInside} from '../DemoHelpers/DataCatalog';
import { IColumn } from 'Controls/gridOld';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: HierarchicalMemory;
    protected _columns: IColumn[] = DeepInside.getColumns();
    protected _expandedItems: CrudEntityKey[] = [null];
    // tslint:disable-next-line
    protected _collapsedItems: CrudEntityKey[] = [6];

    protected _beforeMount(): void {
        this._viewSource = new HierarchicalMemory({
            keyProperty: 'id',
            data: DeepInside.getData(),
            filter: (): boolean => true
        });
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
