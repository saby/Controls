import { Control, TemplateFunction } from 'UI/Base';
import * as Template from 'wml!Controls-demo/list_new/EditInPlace/DifferentItemActions/DifferentItemActions';
import { Memory } from 'Types/source';
import { Model } from 'Types/entity';
import { getFewCategories as getData } from '../../DemoHelpers/DataCatalog';
import { getActionsForContacts as getItemActions } from '../../DemoHelpers/ItemActionsCatalog';
import { IItemAction } from 'Controls/itemActions';
import { showType } from 'Controls/toolbars';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    private _itemActions: IItemAction[] = getItemActions();
    private _viewSource: Memory;

    protected _beforeMount(): void {
        this._viewSource = new Memory({
            keyProperty: 'id',
            data: getData().slice(0, 5)
        });
    }

    protected _itemActionVisibilityCallback(action: IItemAction, item: Model, isEditing): boolean {
        if (isEditing) {
            return action.id === 2 || action.showType === showType.MENU
        } else {
            return true;
        }
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
