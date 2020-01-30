import {Control, TemplateFunction} from 'UI/Base';
import {Memory} from 'Types/source';
import {getCountriesStats} from '../../../DemoHelpers/DataCatalog';

import * as Template from 'wml!Controls-demo/grid/Results/SingleRecordResults/Visible/Visible';

import 'css!Controls-demo/Controls-demo';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    private _viewSource: Memory;
    private _header = getCountriesStats().getDefaultHeader();
    private _columns = getCountriesStats().getColumnsWithWidths().map((col) => {
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
