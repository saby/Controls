import {Control, TemplateFunction} from 'UI/Base';
import {Memory} from 'Types/source';
import {getCountriesStats} from '../../DemoHelpers/DataCatalog';
import * as Template from 'wml!Controls-demo/grid/Results/SingleRecordResults/SingleRecordResults';
import 'css!Controls-demo/Controls-demo';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: Memory;
    private _showResultsVisibility = true;
    protected _header: unknown[] = getCountriesStats().getDefaultHeader();
    protected _columns: unknown[] = getCountriesStats().getColumnsWithWidths().map((col) => {
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
        const data = getCountriesStats().getData().slice(0, 1);
        this._viewSource = new Memory({
            keyProperty: 'id',
            data
        });
    }
}
