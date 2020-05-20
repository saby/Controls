import {Control, TemplateFunction} from "UI/Base"
import * as Template from "wml!Controls-demo/grid/ItemActions/All/All"
import {Memory} from "Types/source"
import {getCountriesStats} from "../../DemoHelpers/DataCatalog"
import {getActionsForContacts as getItemActions, getMoreActions} from "../../../list_new/DemoHelpers/ItemActionsCatalog"


export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: Memory;
    protected _columns = getCountriesStats().getColumnsWithFixedWidths().map((cur, i) => {
    if (i === 5) {
        return {
            ...cur,
                width: '350px'
            };
        }
    return cur;
    });
    protected _itemActions = [...getItemActions(), ...getMoreActions()];

    protected _beforeMount() {
        this._viewSource = new Memory({
            keyProperty: 'id',
            data: getCountriesStats().getData().slice(1, 4)
        });
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
