import {Control, TemplateFunction} from "UI/Base"
import * as Template from "wml!Controls-demo/list_new/Grouped/WithoutSeparator/Right/Right"
import {Memory} from "Types/source"
import {Model} from "Types/entity"
import {getFewCategories as getData} from "../../../DemoHelpers/DataCatalog"
import 'css!Controls-demo/Controls-demo'

export default class extends Control {
    protected _template: TemplateFunction = Template;
    private _viewSource: Memory;

    protected _beforeMount() {
        this._viewSource = new Memory({
            keyProperty: 'id',
            data: getData()
        });
    }

    private _groupingKeyCallback(item: Model): string {
        return item.get('byDemand');
    }
}
