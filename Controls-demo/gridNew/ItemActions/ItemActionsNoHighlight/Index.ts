import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/gridNew/ItemActions/ItemActionsNoHighlight/ItemActionsNoHighlight';
import {Memory} from 'Types/source';
import {getActionsForContacts as getItemActions} from 'Controls-demo/list_new/DemoHelpers/ItemActionsCatalog';
import { IColumn } from 'Controls/grid';
import { IItemAction } from 'Controls/itemActions';
import { Countries } from 'Controls-demo/gridNew/DemoHelpers/Data/Countries';

const MAXINDEX = 4;

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: Memory;
    protected _columns: IColumn[] = Countries.getColumnsWithFixedWidths().map((cur, i) => {
    // tslint:disable-next-line
    if (i === 5) {
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
            keyProperty: 'key',
            data: Countries.getData().slice(1, MAXINDEX)
        });
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
