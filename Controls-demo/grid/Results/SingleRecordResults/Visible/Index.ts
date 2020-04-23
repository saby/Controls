import {Control, TemplateFunction} from 'UI/Base';
import {Memory} from 'Types/source';
import {getCountriesStats} from '../../../DemoHelpers/DataCatalog';

import * as Template from 'wml!Controls-demo/grid/Results/SingleRecordResults/Visible/Visible';


export default class extends Control {
    protected _template: TemplateFunction = Template;
    static _styles: string[] = ['Controls-demo/Controls-demo'];
    protected _viewSource: Memory;
    protected _header = getCountriesStats().getDefaultHeader();
    protected _columns = getCountriesStats().getColumnsWithWidths().map((col) => {
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

    protected _beforeMount() {
        const data = getCountriesStats().getData();
        this._viewSource = new Memory({
            keyProperty: 'id',
            data: [data[0]]
        });
    }
}
