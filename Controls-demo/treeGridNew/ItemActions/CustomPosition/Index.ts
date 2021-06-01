import {Control, TemplateFunction} from 'UI/Base';
import {Memory} from 'Types/source';
import {getActionsForContacts as getItemActions} from '../../../list_new/DemoHelpers/ItemActionsCatalog';
import {IItemAction} from 'Controls/itemActions';

import * as Template from 'wml!Controls-demo/treeGridNew/ItemActions/CustomPosition/CustomPosition';
import {Flat} from "Controls-demo/treeGridNew/DemoHelpers/Data/Flat";

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: Memory;
    protected _itemActions: IItemAction[] = getItemActions().slice(1);

    protected _beforeMount(): void {
        this._viewSource = new Memory({
            keyProperty: 'id',
            data: Flat.getData()
        });
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
