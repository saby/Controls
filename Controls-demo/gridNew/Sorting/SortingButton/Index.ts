import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/gridNew/Sorting/SortingButton/SortingButton';
import {Memory} from 'Types/source';
import { IColumn } from 'Controls/grid';
import { IHeaderCell } from 'Controls/grid';
import {Sorting} from "Controls-demo/gridNew/DemoHelpers/Data/Sorting";
import { Countries } from 'Controls-demo/gridNew/DemoHelpers/Data/Countries';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: Memory;
    protected _header: IHeaderCell[] = Sorting.getHeader(undefined);
    protected _columns: IColumn[] = Sorting.getColumns();
    protected _sorting: unknown = [];

    protected _beforeMount(): void {
        this._viewSource = new Memory({
            keyProperty: 'key',
            data: Countries.getData()
        });
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
