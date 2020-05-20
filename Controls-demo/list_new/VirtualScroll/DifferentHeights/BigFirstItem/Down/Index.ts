import {Control, TemplateFunction} from "UI/Base"
import * as Template from "wml!Controls-demo/list_new/VirtualScroll/DifferentHeights/BigFirstItem/Down/Down"
import {Memory} from "Types/source"
import {generateData} from "../../../../DemoHelpers/DataCatalog"

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: Memory;

    private _dataArray = generateData<{id: number, title: string}>({
        count: 1000,
        entityTemplate: {title: 'lorem'},
        beforeCreateItemCallback: (item) => {
            item.title = `Запись с id="${item.id}". ${item.title}`;
            if (item.id === 0) {
                item.title = 'Это очень большая запись!'
            }
        }
    });

    protected _beforeMount() {
        this._viewSource = new Memory({
            keyProperty: 'id',
            data: this._dataArray
        });
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
