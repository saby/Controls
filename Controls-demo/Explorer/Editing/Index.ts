import {Control, TemplateFunction} from "UI/Base"
import * as Template from "wml!Controls-demo/Explorer/Editing/Editing"
import Memory = require('Controls-demo/Explorer/ExplorerMemory')
import 'css!Controls-demo/Controls-demo'
import {Gadgets} from '../../Explorer_new/DataHelpers/DataCatalog';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    private _viewSource: Memory;
    private _columns = Gadgets.getGridEditingCol();


    _beforeMount() {
        this._viewSource = new Memory({
            keyProperty: 'id',
            data: Gadgets.getData(),
        });
    }
}
