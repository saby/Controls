import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/treeGrid/ColumnScroll/ColumnScroll';
import {Memory} from 'Types/source';
import {Gadgets} from '../DemoHelpers/DataCatalog';
import {getActionsForContacts as getItemActions} from '../../list_new/DemoHelpers/ItemActionsCatalog';
import { IItemAction } from 'Controls/itemActions';
import { IColumn } from 'Controls/_grid/interface/IColumn';
import { IHeader, TExpandOrColapsItems } from 'Controls-demo/types';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: Memory;
    protected _itemActions: IItemAction[] = getItemActions();
    protected _columns: IColumn[] = Gadgets.getColumnsForColumnScroll();
    protected _header: IHeader[] = Gadgets.getHeaderForColumnScroll();
    protected _expandedItems: TExpandOrColapsItems = [1];

    protected _beforeMount(): void {
        const data = Gadgets.getFlatData();
        const country = 'Соединенные Штаты Америки';
        data[2].country = `${country} ${country} ${country}`;

        this._viewSource = new Memory({
            keyProperty: 'id',
            data
        });
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
