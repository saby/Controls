import {Control, TemplateFunction} from 'UI/Base';
import {Memory} from 'Types/source';
import {getCountriesStats} from '../../../DemoHelpers/DataCatalog';
import { IColumn } from 'Controls/_grid/interface/IColumn';
import { IHeader } from 'Controls-demo/types';
import * as Template from 'wml!Controls-demo/grid/Results/SingleRecordResults/Visible/Visible';


export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: Memory;
    protected _header: IHeader[] = getCountriesStats().getDefaultHeader();
    protected _columns: IColumn[] = getCountriesStats().getColumnsWithWidths().map((col) => {
        switch (col.displayProperty) {
            case 'population':
                col.result = 143420300;
                break;
            case 'square':
                col.result = 17075200;
                break;
            case 'populationDensity':
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
