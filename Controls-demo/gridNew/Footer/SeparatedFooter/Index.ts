import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/gridNew/Footer/SeparatedFooter/SeparatedFooter';
import {Memory} from 'Types/source';
import { IColumn } from 'Controls/grid';
import {IItemAction} from "Controls/_itemActions/interface/IItemAction";
import {
    getActionsForContacts as getItemActions,
    getMoreActions
} from "Controls-demo/list_new/DemoHelpers/ItemActionsCatalog";
import { Countries } from 'Controls-demo/gridNew/DemoHelpers/Data/Countries';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: Memory;
    protected _fullColumns: IColumn[] = Countries.getColumns();
    protected _smallColumns: IColumn[] = Countries.getColumns().slice(0, 4);
    protected _itemActions: IItemAction[] = [...getItemActions(), ...getMoreActions()];

    protected _beforeMount(): void {
        this._smallColumns[0].width = '30px';

        this._fullColumns[0].width = '30px';
        this._fullColumns[1].cellPadding = {
            left: 'S',
            right: 'null'
        };
        this._fullColumns[2].width = '80px';
        this._fullColumns[3].width = '100px';
        this._fullColumns[4].width = '80px';
        this._fullColumns[5].width = '80px';

        this._viewSource = new Memory({
            keyProperty: 'id',
            data: Countries.getData().slice(0, 7)
        });
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
