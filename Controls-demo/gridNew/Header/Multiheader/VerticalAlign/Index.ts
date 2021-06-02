import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/gridNew/Header/Multiheader/VerticalAlign/VerticalAlign';
import {Memory} from 'Types/source';
import 'wml!Controls-demo/gridNew/Header/Multiheader/VerticalAlign/VerticalAlignHeaderCell';
import { IColumn } from 'Controls/grid';
import { IHeaderCell } from 'Controls/grid';
import { Countries } from 'Controls-demo/gridNew/DemoHelpers/Data/Countries';
import {MultiHeader} from "Controls-demo/gridNew/DemoHelpers/Data/MultiHeader";

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: Memory;
    private _header: IHeaderCell[] = MultiHeader.getHeader3();
    protected _columns: IColumn[] = Countries.getColumnsWithWidths().slice(1);

    protected _beforeMount(): void {
        // tslint:disable-next-line
        this._header[0].template = 'wml!Controls-demo/gridNew/Header/Multiheader/VerticalAlign/VerticalAlignHeaderCell';
        this._viewSource = new Memory({
            keyProperty: 'key',
            data: Countries.getData()
        });
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
