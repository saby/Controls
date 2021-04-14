import {Control, TemplateFunction} from "UI/Base"
import * as Template from "wml!Controls-demo/explorerNew/Editing/Editing"
import Memory = require('Controls-demo/explorerNew/ExplorerMemory')
import {Gadgets} from '../../Explorer_new/DataHelpers/DataCatalog';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: Memory;
    protected _columns = Gadgets.getGridEditingCol();


    _beforeMount() {
        this._viewSource = new Memory({
            keyProperty: 'id',
            data: Gadgets.getData(),
        });
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
