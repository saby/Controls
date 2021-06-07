import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/list_new/ItemActions/Base/Base';
import {Memory} from 'Types/source';
import {getActionsForContacts as getItemActions} from '../../DemoHelpers/ItemActionsCatalog';
import { IItemAction } from 'Controls/itemActions';
import {getContactsCatalog} from '../../DemoHelpers/DataCatalog';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: Memory;
    protected _itemActions: IItemAction[];

    protected _beforeMount(): void {
        this._itemActions = getItemActions();
        this._viewSource = new Memory({
            keyProperty: 'id',
            data: getContactsCatalog()
        });
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
