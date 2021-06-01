import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/treeGridNew/ColumnScroll/ColumnScroll';
import {CrudEntityKey, HierarchicalMemory} from 'Types/source';
import {getActionsForContacts as getItemActions} from '../../list_new/DemoHelpers/ItemActionsCatalog';
import { IItemAction } from 'Controls/itemActions';
import { IColumn } from 'Controls/grid';
import { IHeaderCell } from 'Controls/grid';
import {Flat} from "Controls-demo/treeGridNew/DemoHelpers/Data/Flat";

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: HierarchicalMemory;
    protected _itemActions: IItemAction[] = getItemActions();
    protected _columns: IColumn[] = [
        {
            displayProperty: 'id',
            width: '60px'
        },
        {
            displayProperty: 'title',
            width: '200px'
        },
        {
            displayProperty: 'country',
            width: '150px'
        },
        {
            displayProperty: 'rating',
            width: '60px'
        },
        {
            displayProperty: 'hasChild',
            width: '120px'
        },
        {
            displayProperty: 'country',
            width: '120px'
        },
        {
            displayProperty: 'rating',
            width: '120px'
        }
    ];
    protected _header: IHeaderCell[] = [
        {
            title: '#'
        },
        {
            title: 'Бренд'
        },
        {
            title: 'Страна производителя'
        },
        {
            title: 'Рейтинг'
        },
        {
            title: 'Есть товары?'
        },
        {
            title: 'Еще раз страна'
        },
        {
            title: 'Еще раз рейтинг'
        }
    ];
    protected _expandedItems: CrudEntityKey[] = [1];

    protected _beforeMount(): void {
        const data = Flat.getData();
        const country = 'Соединенные Штаты Америки';
        // tslint:disable-next-line
        data[2].country = `${country} ${country} ${country}`;

        this._viewSource = new HierarchicalMemory({
            keyProperty: 'key',
            parentProperty: 'parent',
            data
        });
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
