import {Control, TemplateFunction} from "UI/Base"
import * as Template from "wml!Controls-demo/list_new/ItemsView/ItemsView"
import {Memory} from "Types/source"
import collection = require('Types/collection');
import {getFewCategories as getData} from "../DemoHelpers/DataCatalog"
import 'css!Controls-demo/Controls-demo'

export default class extends Control {
    protected _template: TemplateFunction = Template;
    private _items: collection.RecordSet;

    protected _beforeMount() {
        // this._viewSource = new Memory({
        //     keyProperty: 'id',
        //     data: getData()
        // });
        this._items = new collection.RecordSet({
            rawData: getData(),
            keyProperty: 'id'
        });
    }
}
