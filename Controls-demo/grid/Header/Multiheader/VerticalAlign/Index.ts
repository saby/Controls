import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/grid/Header/Multiheader/VerticalAlign/VerticalAlign';
import {Memory} from 'Types/source';
import {getCountriesStats} from '../../../DemoHelpers/DataCatalog';
import 'wml!Controls-demo/grid/Header/Multiheader/VerticalAlign/VerticalAlignHeaderCell';
import { IColumn } from 'Controls/grid';
import { IHeader } from 'Controls-demo/types';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: Memory;
    private _header: IHeader[] = getCountriesStats().getMultiHeaderVar3();
    protected _columns: IColumn[] = getCountriesStats().getColumnsWithWidths().slice(1);

    protected _beforeMount(): void {
        // tslint:disable-next-line
        this._header[0].template = 'wml!Controls-demo/grid/Header/Multiheader/VerticalAlign/VerticalAlignHeaderCell';
        this._viewSource = new Memory({
            keyProperty: 'id',
            data: getCountriesStats().getData()
        });
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
