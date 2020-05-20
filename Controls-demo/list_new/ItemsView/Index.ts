import {Control, TemplateFunction} from "UI/Base"
import * as Template from "wml!Controls-demo/list_new/ItemsView/ItemsView"
import collection = require('Types/collection');
import {getFewCategories as getData} from "../DemoHelpers/DataCatalog"

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _items: collection.RecordSet;

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

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
