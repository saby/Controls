import {Control, TemplateFunction} from "UI/Base"
import * as Template from "wml!Controls-demo/list_new/Grouped/CaptionAlign/Left/Left"
import {Memory} from "Types/source"
import {Model} from "Types/entity"
import {getFewCategories as getData} from "../../../DemoHelpers/DataCatalog"
import 'css!Controls-demo/Controls-demo'

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: Memory;

    protected _beforeMount() {
        this._viewSource = new Memory({
            keyProperty: 'id',
            data: getData()
        });
    }

    protected _groupingKeyCallback(item: Model): string {
        return item.get('byDemand');
    }
}