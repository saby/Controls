import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/gridNew/Header/AddButton/AddButton';
import {Memory} from 'Types/source';
import {getCountriesStats} from '../../DemoHelpers/DataCatalog';
import 'wml!Controls-demo/gridNew/Header/AddButton/FirstHeaderCellTemplate';
import 'wml!Controls-demo/gridNew/Header/AddButton/Cell';
import { IColumn } from 'Controls/grid';
import { IHeader } from 'Controls-demo/types';

const MAXITEM = 10;

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: Memory;
    private _gridCaption: string = 'Характеристики стран';
    private _header: IHeader[] = getCountriesStats().getDefaultHeader().slice(1);
    protected _columns: IColumn[] = getCountriesStats().getColumnsWithWidths().slice(1);

    protected _beforeMount(): void {

        this._header.forEach((hColumn) => {
            // tslint:disable-next-line
            hColumn.template = 'wml!Controls-demo/gridNew/Header/AddButton/Cell';
        });

        this._header[0] = {
            ...this._header[0],
            // tslint:disable-next-line
            template: 'wml!Controls-demo/gridNew/Header/AddButton/FirstHeaderCellTemplate',
            captionForGrid: this._gridCaption
        };

        this._viewSource = new Memory({
            keyProperty: 'id',
            data: getCountriesStats().getData().slice(0, MAXITEM)
        });
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
