import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/grid/EditInPlace/WithSearch/WithSearch';
import {Memory} from 'Types/source';
import {getCountriesStats} from '../../DemoHelpers/DataCatalog';
import { IColumn } from 'Controls/grid';
import * as cellTemplate from 'wml!Controls-demo/grid/EditInPlace/WithSearch/cellTemplate';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: Memory;
    protected _filter: Object = {};

    protected _columns: IColumn[] = getCountriesStats().getColumnsWithFixedWidths().map((c, index) => ({
        ...c,
        template: index > 2 ? cellTemplate : c.template
    }));


    protected _beforeMount(): void {
        this._viewSource = new Memory({
            keyProperty: 'id',
            data: getCountriesStats().getData()
        });
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
