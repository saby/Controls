import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/gridNew/ShowEditArrow/ShowEditArrow';
import {Memory} from 'Types/source';
import {changeSourceData, getCountriesStats} from '../DemoHelpers/DataCatalog';
import { IColumn } from 'Controls/grid';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: Memory;
    protected _columns: IColumn[] = getCountriesStats().getColumnsForLoad();

    protected _beforeMount(): void {
        this._viewSource = new Memory({
            keyProperty: 'id',
            data: changeSourceData().data
        });
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
