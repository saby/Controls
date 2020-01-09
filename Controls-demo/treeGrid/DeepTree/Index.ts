import {Control, TemplateFunction} from "UI/Base"
import * as Template from "wml!Controls-demo/treeGrid/DeepTree/DeepTree"
import {Memory} from "Types/source"
import {Gadgets} from "../DemoHelpers/DataCatalog"
import * as elipsisTpl from 'wml!Controls-demo/treeGrid/DeepTree/elipsisTpl'

import 'css!Controls-demo/Controls-demo'

export default class extends Control {
    protected _template: TemplateFunction = Template;
    private _viewSource: Memory;
    private _columns = Gadgets.getColumnsWithFixedWidth().map((cur) => ({
        ...cur, template: elipsisTpl
    }));

    protected _beforeMount() {
        this._viewSource = new Memory({
            keyProperty: 'id',
            data: Gadgets.getDeepSet()
        });
    }
}
