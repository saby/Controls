import {Control, TemplateFunction} from "UI/Base"
import * as Template from "wml!Controls-demo/grid/ColumnScroll/WithEditing/WithEditing"
import {Memory} from "Types/source"
import {getCountriesStats} from "../../DemoHelpers/DataCatalog"
import 'wml!Controls-demo/grid/ColumnScroll/WithEditing/_cellEditor';



export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: Memory;
    protected _columns = getCountriesStats().getColumnsWithWidths().map((cur, i) => {
        if (i > 1) {
            return { ...cur, template: 'wml!Controls-demo/grid/ColumnScroll/WithEditing/_cellEditor' }
        }
        return cur;
    });
    protected _header = getCountriesStats().getDefaultHeader();

    protected _beforeMount() {
        this._viewSource = new Memory({
            keyProperty: 'id',
            data: getCountriesStats().getData()
        });
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
