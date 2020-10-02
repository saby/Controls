import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/grid/ShowEditArrow/ShowEditArrow';
import {Memory} from 'Types/source';
import {changeSourceData, getCountriesStats} from '../DemoHelpers/DataCatalog';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: Memory;
    protected _columns = getCountriesStats().getColumnsForLoad();

    protected _beforeMount(): void {
        this._viewSource = new Memory({
            keyProperty: 'id',
            data: changeSourceData().data
        });
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
