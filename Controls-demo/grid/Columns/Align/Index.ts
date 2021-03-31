import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/grid/Columns/Align/Align';
import {Memory} from 'Types/source';
import {getCountriesStats} from '../../DemoHelpers/DataCatalog';
import { IColumn } from 'Controls/gridOld';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: Memory;

    protected _columns: IColumn[] = getCountriesStats().getColumnsWithAlign();

    protected _beforeMount(): void {
        this._viewSource = new Memory({
            keyProperty: 'id',
            // tslint:disable-next-line
            data: getCountriesStats().getData().slice(0, 5)
        });
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
