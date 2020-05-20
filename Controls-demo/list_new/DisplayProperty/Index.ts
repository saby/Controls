import {Control, TemplateFunction} from "UI/Base"
import * as Template from "wml!Controls-demo/list_new/DisplayProperty/DisplayProperty"
import {Memory} from "Types/source"
import {getFewCategories as getData} from "../DemoHelpers/DataCatalog"
import 'wml!Controls-demo/list_new/ItemTemplate/FromFile/itemTemplate'

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: Memory;

    protected _beforeMount() {
        this._viewSource = new Memory({
            keyProperty: 'id',
            data: getData()
        });
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}