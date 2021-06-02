import {Control, TemplateFunction} from 'UI/Base';
import {Memory} from 'Types/source';
import {IItemAction} from 'Controls/itemActions';
import {getActionsForContacts as getItemActions} from 'Controls-demo/list_new/DemoHelpers/ItemActionsCatalog';
import {TColspanCallbackResult} from 'Controls/display';

import * as Template from 'wml!Controls-demo/gridNew/ItemActions/CustomHoverArea/CustomHoverArea';
import { Countries } from 'Controls-demo/gridNew/DemoHelpers/Data/Countries';

const MAXINDEX = 4;

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: Memory;
    protected _itemActions: IItemAction[] = getItemActions();

    protected _beforeMount(): void {
        this._viewSource = new Memory({
            keyProperty: 'key',
            data: Countries.getData().slice(1, MAXINDEX)
        });
    }

    protected _colspanCallback(item, column, columnIndex, isEditing): TColspanCallbackResult {
        return 'end';
    }

    static _styles: string[] = ['Controls-demo/Controls-demo', 'Controls-demo/gridNew/ItemActions/CustomHoverArea/CustomHoverArea'];
}
