import {Control, TemplateFunction} from "UI/Base"
import * as Template from "wml!Controls-demo/treeGrid/ItemTemplate/ColspanNodes/ColspanNodes"
import {Memory} from "Types/source"
import {Gadgets} from "../../DemoHelpers/DataCatalog"


export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: Memory;
    protected _columns = Gadgets.getGridColumnsForFlat().slice(0, 2);

    protected _beforeMount() {
        this._viewSource = new Memory({
            keyProperty: 'id',
            data: Gadgets.getFlatData()
        });
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}