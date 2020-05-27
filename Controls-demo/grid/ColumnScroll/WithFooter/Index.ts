import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/grid/ColumnScroll/WithFooter/WithFooter';
import {Memory} from 'Types/source';
import {getCountriesStats} from '../../DemoHelpers/DataCatalog';


export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: Memory;
    protected _columns = getCountriesStats().getColumnsWithWidths();
    protected _header = getCountriesStats().getDefaultHeader();

    protected _beforeMount(): void {
        this._viewSource = new Memory({
            keyProperty: 'id',
            data: getCountriesStats().getData().slice(0, 3)
        });
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
