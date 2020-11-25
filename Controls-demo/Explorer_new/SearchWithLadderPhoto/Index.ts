import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/Explorer_new/SearchWithLadderPhoto/SearchWithLadderPhoto';
import {Gadgets} from '../DataHelpers/DataCatalog';
import {Memory} from 'Types/source';
import {IItemAction} from 'Controls/itemActions';
import {IRemovableList} from 'Controls/list';
import * as MemorySource from 'Controls-demo/Explorer/ExplorerMemory';
import {IColumn} from 'Controls/_grid/interface/IColumn';
import {TRoot} from 'Controls-demo/types';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: MemorySource;
    protected _columns: IColumn[] = Gadgets.getSearchColumnsWithLadderPhoto();
    protected _root: TRoot = null;
    protected _searchStartingWith: string = 'root';
    protected _searchStartingWithSource: Memory = null;
    // tslint:disable-next-line
    protected _filter: object = {demo: 123};
    protected _ladderProperties: string[] = ['image'];

    protected _itemActions: IItemAction[] = [
        {
            id: 0,
            icon: 'icon-Erase',
            iconStyle: 'danger',
            title: 'delete pls',
            showType: 0,
            handler: (item) => {
                (this._children.view as IRemovableList).removeItemsWithConfirmation({
                    selected: [item.getKey()],
                    excluded: []
                }).then(() => {
                    this._children.view.reload();
                });
            }
        },
    ];

    protected _beforeMount(): void {
        this._viewSource = new MemorySource({
            keyProperty: 'id',
            data: Gadgets.getSearchData()
        });
        this._searchStartingWithSource = new Memory({
            keyProperty: 'id',
            data: [
                {
                    id: 'root', title: 'root'
                },
                {
                    id: 'current', title: 'current'
                }
            ]
        });
    }

    static _styles: string[] = [
        'Controls-demo/Controls-demo',
        'Controls-demo/Explorer_new/SearchWithLadderPhoto/styles'
    ];
}
