import {Control, TemplateFunction} from "UI/Base"
import * as Template from "wml!Controls-demo/grid/EditInPlace/EditingRow/EditingRow"
import {Memory} from "Types/source"
import {getPorts} from "../../DemoHelpers/DataCatalog"
import 'wml!Controls-demo/grid/EditInPlace/EditingRow/_rowEditor';


export default class extends Control {
    protected _template: TemplateFunction = Template;
    static _styles: string[] = ['Controls-demo/Controls-demo'];
    protected _viewSource: Memory;
    protected _columns = getPorts().getColumns();
    protected _documentSignMemory;

    private getData(data) {
        for (let key in data) {
            if (data[key]) {
                data[key] = '' + data[key];
            } else {
                data[key] = ''
            }

        }
        return data;
    }
    private data = getPorts().getData().map((cur) => this.getData(cur));
    private selectedKey = 1;

    protected _beforeMount() {
        console.log(this.data)
        this._viewSource = new Memory({
            keyProperty: 'id',
            data: this.data
        });

        this._documentSignMemory = new Memory({
            keyProperty: 'id',
            data: getPorts().getDocumentSigns()
        });


    }

    private onChange1 = (_, name, item, value) => {
        item.set(name, value);
    }

    private onChange2 = (_, key) => {
        this.selectedKey = key;
    }
}
