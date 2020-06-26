import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/treeGrid/MultiSelect/MultiSelectVisibility/Visible/Visible';
import {Memory} from 'Types/source';
import {Gadgets} from '../../../DemoHelpers/DataCatalog';
import { IColumn } from 'Controls/_grid/interface/IColumn';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    // @ts-ignore template usage
    private _viewSource: Memory;
    // @ts-ignore
    private _columns: IColumn[] = Gadgets.getGridColumnsForFlat();
    // @ts-ignore template usage
    private _selectedKeys: number[] = null;
    // @ts-ignore template usage
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
