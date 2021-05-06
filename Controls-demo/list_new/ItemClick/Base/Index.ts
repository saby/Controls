import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/list_new/ItemClick/Base/ItemClick';
import {Memory} from 'Types/source';
import {Model} from 'Types/entity';
import {SyntheticEvent} from 'Vdom/Vdom';
import {getActionsForContacts as getItemActions} from '../DemoHelpers/ItemActionsCatalog';
import {getContactsCatalog} from '../DemoHelpers/DataCatalog';
import {IItemAction} from 'Controls/itemActions';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: Memory;
    protected _itemActions: IItemAction[];
    protected _hasMultiSelect: boolean = false;
    protected _selectedKeys: number[] = [];
    protected _currentItem: string;

    protected _beforeMount(): void {
        this._itemActions = getItemActions();
        this._viewSource = new Memory({
            keyProperty: 'id',
            data: getContactsCatalog()
        });
    }

    protected _onItemClick(event: SyntheticEvent, item: Model): void {
        this._currentItem = item ? ('key: ' + item.getKey()) : null;
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
