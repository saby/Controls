import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/gridNew/Marker/PositionRight/PositionRight';
import {Memory} from 'Types/source';
import {IColumn} from 'Controls/grid';
import {IItemAction} from 'Controls/_itemActions/interface/IItemAction';
import {
    getActionsForContacts as getItemActions,
    getMoreActions
} from 'Controls-demo/list_new/DemoHelpers/ItemActionsCatalog';
import { Countries } from 'Controls-demo/gridNew/DemoHelpers/Data/Countries';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: Memory;
    protected _columns: IColumn[] = Countries.getColumns();
    // @ts-ignore
    protected _itemActions: IItemAction[] = [...getItemActions(), ...getMoreActions()];

    protected _beforeMount(): void {
        this._viewSource = new Memory({
            keyProperty: 'id',
            data: Countries.getData()
        });
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
