import {Control, TemplateFunction} from 'UI/Base';
import {Memory} from 'Types/source';
import {getCountriesStats} from '../../../DemoHelpers/DataCatalog';
import { IColumn } from 'Controls/gridOld';
import { IHeaderCell } from 'Controls/gridOld';
import * as Template from 'wml!Controls-demo/grid/Results/SingleRecordResults/Visible/Visible';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: Memory;
    protected _header: IHeaderCell[] = getCountriesStats().getDefaultHeader();
    protected _columns: IColumn[] = getCountriesStats().getColumnsWithWidths().map((col) => {
        switch (col.displayProperty) {
            case 'population':
                // tslint:disable-next-line
                col.result = 143420300;
                break;
            case 'square':
                // tslint:disable-next-line
                col.result = 17075200;
                break;
            case 'populationDensity':
                // tslint:disable-next-line
                col.result = 8;
                break;
        }
        return col;
    });

    protected _beforeMount(): void {
        const data = getCountriesStats().getData();
        this._viewSource = new Memory({
            keyProperty: 'id',
            data: [data[0]]
        });
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
