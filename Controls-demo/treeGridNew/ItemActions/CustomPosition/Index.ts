import {Control, TemplateFunction} from 'UI/Base';
import {HierarchicalMemory} from 'Types/source';
import {getActionsForContacts as getItemActions} from '../../../list_new/DemoHelpers/ItemActionsCatalog';
import {IItemAction} from 'Controls/itemActions';

import * as Template from 'wml!Controls-demo/treeGridNew/ItemActions/CustomPosition/CustomPosition';
import {Flat} from "Controls-demo/treeGridNew/DemoHelpers/Data/Flat";

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: HierarchicalMemory;
    protected _itemActions: IItemAction[] = getItemActions().slice(1);

    protected _beforeMount(): void {
        this._viewSource = new HierarchicalMemory({
            keyProperty: 'key',
            data: Flat.getData(),
            parentProperty: 'parent'
        });
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
