import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/list_new/ItemClick/WithEditing/WithEditing';
import {Memory} from 'Types/source';
import {getActionsForContacts as getItemActions} from '../DemoHelpers/ItemActionsCatalog';
import {getContactsCatalog} from '../DemoHelpers/DataCatalog';
import {IItemAction} from 'Controls/itemActions';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: Memory;
    protected _itemActions: IItemAction[];
    protected _hasMultiSelect: boolean = false;
    protected _textsInfo: string[] = [];
    protected _selectedKeys: number[] = [];

    protected _beforeMount(): void {
        this._itemActions = getItemActions();
        this._viewSource = new Memory({
            keyProperty: 'id',
            data: getContactsCatalog()
        });
    }

    protected _onItemClick(): void {
        this._textsInfo.push('itemClick()');
    }

    protected _onItemActivate(): void {
        this._textsInfo.push('itemActivate()');
    }

    protected _clear(): void {
        this._textsInfo = [];
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
