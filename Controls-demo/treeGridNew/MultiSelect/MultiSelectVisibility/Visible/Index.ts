import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/treeGridNew/MultiSelect/MultiSelectVisibility/Visible/Visible';
import {Memory} from 'Types/source';
import {Gadgets} from '../../../DemoHelpers/DataCatalog';
import { IColumn } from 'Controls/grid';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    // tslint:disable-next-line
    private _viewSource: Memory;
    // tslint:disable-next-line
    private _columns: IColumn[] = Gadgets.getGridColumnsForFlat();
    // tslint:disable-next-line
    private _selectedKeys: number[] = null;
    // tslint:disable-next-line
    private _excludedKeys: number[] = null;

    protected _beforeMount(): void {
        this._selectedKeys = [];
        this._excludedKeys = [];
        this._viewSource = new Memory({
            keyProperty: 'id',
            data: Gadgets.getFlatData()
        });
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
