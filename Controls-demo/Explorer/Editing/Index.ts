import {Control, TemplateFunction} from "UI/Base"
import * as Template from "wml!Controls-demo/Explorer/Editing/Editing"
import Memory = require('Controls-demo/Explorer/ExplorerMemory')
import {Gadgets} from '../../Explorer_new/DataHelpers/DataCatalog';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    static _styles: string[] = ['Controls-demo/Controls-demo'];
    protected _viewSource: Memory;
    protected _columns = Gadgets.getGridEditingCol();


    _beforeMount() {
        this._viewSource = new Memory({
            keyProperty: 'id',
            data: Gadgets.getData(),
        });
    }
}
