import {Control, TemplateFunction} from "UI/Base"
import * as Template from "wml!Controls-demo/list_new/Navigation/DigitPaging/WithoutScroll/WithoutScroll"
import {Memory} from "Types/source"
import {generateData} from "../../../DemoHelpers/DataCatalog"
import 'css!Controls-demo/Controls-demo'

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: Memory;
    private _dataArray = generateData({
        count: 100,
        beforeCreateItemCallback: (item) => {
            item.title = `Запись с идентификатором ${item.id} и каким то не очень длинным текстом`;
        }
    });

    protected _beforeMount() {
        this._viewSource = new Memory({
            keyProperty: 'id',
            data: this._dataArray
        });
    }
}