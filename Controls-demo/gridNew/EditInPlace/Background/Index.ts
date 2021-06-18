import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/gridNew/EditInPlace/Background/Background';
import {Memory} from 'Types/source';
import {IColumn} from 'Controls/grid';
import 'wml!Controls-demo/gridNew/EditInPlace/Align/_cellEditor';
import {RecordSet} from 'Types/collection';
import { Editing } from 'Controls-demo/gridNew/DemoHelpers/Data/Editing';

import {IItemAction, TItemActionShowType} from 'Controls/itemActions';
export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: Memory;
    protected _itemActions: IItemAction[];
    protected _columns: IColumn[] = Editing.getEditingAlignColumns();    protected _items: RecordSet;

    protected _beforeMount(): void {
        const data = Editing.getEditingAlignData();
        this._viewSource = new Memory({
            keyProperty: 'key',
            data
        });
        this._itemActions = [{
            id: 1,
            icon: 'icon-Erase icon-error',
            title: 'delete',
            showType: TItemActionShowType.TOOLBAR
        }];
    }

    static _styles: string[] = [
        'Controls-demo/Controls-demo',
        'Controls-demo/gridNew/EditInPlace/Background/style'
    ];
}
