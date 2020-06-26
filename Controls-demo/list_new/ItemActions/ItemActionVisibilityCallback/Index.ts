import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/list_new/ItemActions/ItemActionVisibilityCallback/ItemActionVisibilityCallback';
import {Memory} from 'Types/source';
import {Model} from 'Types/entity';
import {getContactsCatalog as getData} from '../../DemoHelpers/DataCatalog';
import {getActionsForContacts as getItemActions} from '../../DemoHelpers/ItemActionsCatalog';
import {showType} from 'Controls/Utils/Toolbar';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: Memory;
    protected _itemActions = getItemActions();

    protected _beforeMount() {
        this._viewSource = new Memory({
            keyProperty: 'id',
            data: getData()
        });
    }

    protected _itemActionVisibilityCallback(itemAction, item: any) {

        if (itemAction.title === 'Позвонить') {
            return false;
        } else if (itemAction.showType === showType.MENU && itemAction.id === 6) {
            return false;
        }

        const itemId = item.getId();
        if ((itemId === 0 || itemId === 2) && (itemAction.showType === showType.MENU || itemAction.showType === showType.MENU_TOOLBAR)) {
            return false;
        }

        return true;
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
