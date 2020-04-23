import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/list_new/EditInPlace/EditingOnMounting/EditingOnMounting';
import {Memory} from 'Types/source';
import {getFewCategories as getData} from '../../DemoHelpers/DataCatalog';
import {getActionsForContacts as getItemActions} from '../../DemoHelpers/ItemActionsCatalog';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    static _styles: string[] = ['Controls-demo/Controls-demo'];
    private _itemActions = getItemActions();
    private _viewSource: Memory;
    private _newData = getData().slice(0, 1);
    private _editingConfig = null;
    protected _beforeMount() {
        this._newData[0].id = 1;

        this._viewSource = new Memory({
            keyProperty: 'id',
            data: this._newData
        });
        return this._viewSource.read(1).then((res) => {
            this._editingConfig = {
                toolbarVisibility: true,
                item: res,
                editOnClick: true
            };
        });
    }
}
