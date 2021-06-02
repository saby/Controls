import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/treeGrid/ColumnScroll/ColumnScroll';
import {HierarchicalMemory, CrudEntityKey} from 'Types/source';
import {Gadgets} from '../DemoHelpers/DataCatalog';
import {getActionsForContacts as getItemActions} from '../../list_new/DemoHelpers/ItemActionsCatalog';
import { IItemAction } from 'Controls/itemActions';
import { IColumn } from 'Controls/grid';
import { IHeaderCell } from 'Controls/grid';


export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: HierarchicalMemory;
    protected _itemActions: IItemAction[] = getItemActions();
    protected _columns: IColumn[] = Gadgets.getColumnsForColumnScroll();
    protected _header: IHeaderCell[] = Gadgets.getHeaderForColumnScroll();
    protected _expandedItems: CrudEntityKey[] = [1];

    protected _beforeMount(): void {
        const data = Gadgets.getFlatData();
        const country = 'Соединенные Штаты Америки';
        // tslint:disable-next-line
        data[2].country = `${country} ${country} ${country}`;

        this._viewSource = new HierarchicalMemory({
            keyProperty: 'id',
            parentProperty: 'parent',
            data
        });
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
