import {Control, TemplateFunction} from "UI/Base"
import * as Template from "wml!Controls-demo/grid/EditInPlace/Validation/Validation"
import {Memory} from "Types/source"
import {getEditing} from "../../DemoHelpers/DataCatalog"
import 'wml!Controls-demo/grid/EditInPlace/Validation/_cellEditor';
import 'wml!Controls-demo/grid/EditInPlace/Validation/_cellEditorDate';
import 'wml!Controls-demo/grid/EditInPlace/Validation/_cellEditorRequired';
import LengthChecker = require('Controls-demo/grid/EditInPlace/Validation/Custom');
import {getMoreActions} from "../../../list_new/DemoHelpers/ItemActionsCatalog"

import 'css!Controls-demo/Controls-demo'

export default class extends Control {
    protected _template: TemplateFunction = Template;
    private _viewSource: Memory;
    private _columns = getEditing().getEditingColumnsValidation();
    private _header = getEditing().getEditingHeaderValidations();
    protected _markedKey;
    protected _dataLoadCallback = this._dataCallback.bind(this);
    protected _items;
    protected _itemActions = [...getMoreActions()];

    protected _beforeMount() {
        this._viewSource = new Memory({
            keyProperty: 'id',
            data: getEditing().getEditingValidationData()
        });
    }

    private _dataCallback(items) {
        this._items = items;
    }

}

export {
    LengthChecker
}
