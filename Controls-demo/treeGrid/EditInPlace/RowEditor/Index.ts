import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/treeGrid/EditInPlace/RowEditor/RowEditor';
import {Memory} from 'Types/source';
import {Gadgets} from '../../DemoHelpers/DataCatalog';


export default class extends Control {
    protected _template: TemplateFunction = Template;
    static _styles: string[] = ['Controls-demo/Controls-demo'];
    protected _viewSource: Memory;
    private _columns = Gadgets.getGridColumnsForFlat();

    protected _beforeMount() {
        this._viewSource = new Memory({
            keyProperty: 'id',
            data: Gadgets.getFlatData()
        });
    }
}
