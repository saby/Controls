import {Control, TemplateFunction} from 'UI/Base';
import {Memory} from 'Types/source';
import {getCountriesStats} from '../../../DemoHelpers/DataCatalog';

import * as Template from 'wml!Controls-demo/grid/Results/SingleRecordResults/Simple/Simple';


export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: Memory;
    protected _header = getCountriesStats().getDefaultHeader();
    protected _columns = getCountriesStats().getColumnsWithWidths();

    protected _beforeMount() {
        const data = getCountriesStats().getData();
        this._viewSource = new Memory({
            keyProperty: 'id',
            data: [data[0]]
        });
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
