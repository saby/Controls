import {Control, TemplateFunction} from "UI/Base"
import * as Template from "wml!Controls-demo/list_new/VirtualScroll/ConstantHeights/OneLoadOnInit/Up/Up"
import {Memory} from "Types/source"
import {generateData} from "../../../../DemoHelpers/DataCatalog"

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: Memory;

    private dataArray = generateData({
        keyProperty: 'id',
        count: 1000,
        beforeCreateItemCallback: item => {
            item.title = `Запись с ключом ${item.id}.`
        }
    });

    protected _beforeMount() {
        this._viewSource = new Memory({
            keyProperty: 'id',
            data: this.dataArray
        });
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}