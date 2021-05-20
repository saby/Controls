import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/grid/ColumnScroll/WithEditing/WithEditing';
import {Memory} from 'Types/source';
import {getCountriesStats} from '../../DemoHelpers/DataCatalog';
import 'wml!Controls-demo/grid/ColumnScroll/WithEditing/_cellEditor';
import { IHeaderCell } from 'Controls/grid';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: Memory;
    protected _columns: unknown = getCountriesStats().getColumnsWithWidths().map((cur, i) => {
        if (i > 1) {
            return { ...cur, template: 'wml!Controls-demo/grid/ColumnScroll/WithEditing/_cellEditor' };
        }
        return cur;
    });

    protected _header: IHeaderCell[] = getCountriesStats().getDefaultHeader();

    protected _beforeMount(): void {
        this._columns[2].width = '100px';
        this._columns[3].width = '100px';
        this._columns[4].width = '100px';
        this._columns[5].width = '200px';

        this._viewSource = new Memory({
            keyProperty: 'id',
            data: getCountriesStats().getData()
        });
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
