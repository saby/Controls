import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/gridNew/Search/Search';
import {Memory} from 'Types/source';
import { IColumn } from 'Controls/grid';
import { Countries } from 'Controls-demo/gridNew/DemoHelpers/Data/Countries';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: Memory;
    protected _filter: Object = {};
    // private _searchStartingWith: string = 'country';
    protected _columns: IColumn[] = Countries.getColumnsWithFixedWidths();

    protected _beforeMount(): void {
        this._viewSource = new Memory({
            keyProperty: 'id',
            data: Countries.getData()
        });
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
