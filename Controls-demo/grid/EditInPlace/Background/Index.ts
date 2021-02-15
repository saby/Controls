import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/grid/EditInPlace/Background/Background';
import {Memory} from 'Types/source';
import {IItemAction, TItemActionShowType} from 'Controls/itemActions';
import {getEditing, IColumnRes} from '../../DemoHelpers/DataCatalog';
import 'wml!Controls-demo/grid/EditInPlace/Align/_cellEditor';
import {RecordSet} from 'Types/collection';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: Memory;
    protected _columns: IColumnRes[] = getEditing().getEditingAlignColumns();
    protected _items: RecordSet;
    protected _itemActions: IItemAction[];

    protected _beforeMount(): void {
        const data = getEditing().getEditingAlignData();
        this._itemActions = [{
            id: 1,
            icon: 'icon-Erase icon-error',
            title: 'delete',
            showType: TItemActionShowType.TOOLBAR
        }];
        this._viewSource = new Memory({
            keyProperty: 'id',
            data
        });
    }

    static _styles: string[] = [
        'Controls-demo/Controls-demo',
        'Controls-demo/grid/EditInPlace/Background/style'
    ];
}
