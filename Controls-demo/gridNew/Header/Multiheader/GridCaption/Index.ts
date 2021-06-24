import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/gridNew/Header/Multiheader/GridCaption/GridCaption';
import {Memory} from 'Types/source';
import {getCountriesStats} from '../../../DemoHelpers/DataCatalog';
import 'wml!Controls-demo/gridNew/Header/Multiheader/GridCaption/GridCaptionHeaderCell';
import { IColumn } from 'Controls/grid';
import { IHeaderCell } from 'Controls/grid';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: Memory;
    private _header: IHeaderCell[] = getCountriesStats().getMultiHeaderVar2();
    protected _columns: IColumn[] = getCountriesStats().getColumnsWithWidths().slice(1);

    protected _beforeMount(): void {
        // tslint:disable-next-line
        this._header[0].template = 'wml!Controls-demo/gridNew/Header/Multiheader/GridCaption/GridCaptionHeaderCell';
        this._viewSource = new Memory({
            keyProperty: 'id',
            data: getCountriesStats().getData()
        });
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
