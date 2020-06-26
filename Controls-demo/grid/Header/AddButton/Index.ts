import {Control, TemplateFunction} from 'UI/Base';
import * as Template from "wml!Controls-demo/grid/Header/AddButton/AddButton";
import {Memory} from 'Types/source';
import {getCountriesStats} from "../../DemoHelpers/DataCatalog";
import 'wml!Controls-demo/grid/Header/AddButton/FirstHeaderCellTemplate';
import 'wml!Controls-demo/grid/Header/AddButton/Cell';
import { IColumn } from 'Controls/_grid/interface/IColumn';
import { IHeader } from 'Controls-demo/types';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: Memory;
    private _gridCaption: string = 'Характеристики стран';
    private _header: any = getCountriesStats().getDefaultHeader().slice(1);
    protected _columns: IColumn[] = getCountriesStats().getColumnsWithWidths().slice(1);

    protected _beforeMount(): void {

        this._header.forEach((hColumn) => {
            hColumn.template = 'wml!Controls-demo/grid/Header/AddButton/Cell';
        });

        this._header[0] = {
            ...this._header[0],
            template: 'wml!Controls-demo/grid/Header/AddButton/FirstHeaderCellTemplate',
            captionForGrid: this._gridCaption
        };


        this._viewSource = new Memory({
            keyProperty: 'id',
            data: getCountriesStats().getData().slice(0, 10)
        });
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
