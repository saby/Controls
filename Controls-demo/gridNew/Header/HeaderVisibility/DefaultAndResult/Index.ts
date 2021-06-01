import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/gridNew/Header/HeaderVisibility/DefaultAndResult/DefaultAndResult';
import {Memory} from 'Types/source';
import {getCountriesStats} from '../../../DemoHelpers/DataCatalog';
import { IHeaderCell } from 'Controls/grid';
import { IColumn } from 'Controls/grid';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: Memory;
    protected _header: IHeaderCell[] = getCountriesStats().getDefaultHeader();
    protected _columns: IColumn[] = getCountriesStats().getColumnsWithWidths();

    protected _beforeMount(): void {
        this._viewSource = new Memory({
            keyProperty: 'key',
            data: getCountriesStats().getData()[0]
        });
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
