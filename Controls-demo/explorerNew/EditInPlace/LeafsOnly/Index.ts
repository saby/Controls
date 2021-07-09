import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/explorerNew/EditInPlace/LeafsOnly/LeafsOnly';
import {Gadgets} from '../../DataHelpers/DataCatalog';
import * as CellTemplate from 'wml!Controls-demo/explorerNew/EditInPlace/LeafsOnly/CellTemplate';
import { IColumn } from 'Controls/grid';
import {HierarchicalMemory} from 'Types/source';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: HierarchicalMemory;
    private _columns: IColumn[] = Gadgets.getColumns();

    protected _beforeMount(): void {
        this._columns[0].template = CellTemplate;
        this._viewSource = new HierarchicalMemory({
            keyProperty: 'id',
            parentProperty: 'parent',
            data: Gadgets.getData()
        });
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
