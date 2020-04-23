import {Control, TemplateFunction} from "UI/Base"
import * as Template from "wml!Controls-demo/treeGrid/DeepTree/DeepTree"
import {Memory} from "Types/source"
import {Gadgets} from "../DemoHelpers/DataCatalog"
import * as elipsisTpl from 'wml!Controls-demo/treeGrid/DeepTree/elipsisTpl'


export default class extends Control {
    protected _template: TemplateFunction = Template;
    static _styles: string[] = ['Controls-demo/Controls-demo'];
    protected _viewSource: Memory;
    protected _columns = Gadgets.getColumnsWithFixedWidth().map((cur) => ({
        ...cur, template: elipsisTpl
    }));
    protected _expandedItems: number[] = [1, 11, 111, 1111, 11111, 111111, 2, 22, 222, 2222];

    protected _beforeMount() {
        this._viewSource = new Memory({
            keyProperty: 'id',
            data: Gadgets.getDeepSet()
        });
    }
}
