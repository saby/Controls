import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/treeGridNew/ItemActions/ItemActionsNoHighlight/ItemActionsNoHighlight';
import {Memory} from 'Types/source';
import {Model} from 'Types/entity';
import {Gadgets} from '../../DemoHelpers/DataCatalog';
import {getActionsForContacts as getItemActions} from '../../../list_new/DemoHelpers/ItemActionsCatalog';
import { IColumn } from 'Controls/grid';
import { IItemAction } from 'Controls/itemActions';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: Memory;
    protected _highlightOnHover: boolean = true;
    protected _expandedItems: any[] = [];
    protected _columns: IColumn[] = Gadgets.getColumnsWithFixedWidth().map((cur, i) => {
        // tslint:disable-next-line
        if (i === 2) {
            return {
                ...cur,
                width: '350px'
            };
        }
        return cur;
    });
    protected _itemActions: IItemAction[] = getItemActions();

    protected _beforeMount(): void {
        this._viewSource = new Memory({
            keyProperty: 'id',
            data: Gadgets.getFlatData()
        });
    }

    _valueChanged(e, attr) {
        console.log('МЕНЯЕМ ЗНАЧЕНИЕ', attr);
        this._highlightOnHover = attr;
    }

    protected _getHighlightOnHover(item: Model) {
        return item.getContents().getKey !== undefined && !this._expandedItems.includes(item.getContents().getKey());
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
