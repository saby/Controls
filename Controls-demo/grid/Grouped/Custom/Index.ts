import {Control, TemplateFunction} from "UI/Base"
import * as Template from "wml!Controls-demo/grid/Grouped/Custom/Custom"
import {Memory} from "Types/source"
import {getTasks} from "../../DemoHelpers/DataCatalog";


export default class extends Control {
    protected _template: TemplateFunction = Template;
    static _styles: string[] = ['Controls-demo/Controls-demo'];
    protected _viewSource: Memory;
    protected _columns = getTasks().getDefaultColumns();
    protected _groupingKeyCallback = (item) => {
        return item.get('fullName');
    }

    protected _beforeMount(): void {
        this._viewSource = new Memory({
            keyProperty: 'id',
            data: getTasks().getData()
        });
    }
}
