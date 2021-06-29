import {Logger} from 'UI/Utils';
import {IItemsViewOptions} from 'Controls/list';
import {isFullGridSupport} from 'Controls/display';
import {ItemsView as ItemsGrid} from 'Controls/grid';
import { TreeControl } from 'Controls/tree';
import TreeGridView from 'Controls/_treeGrid/TreeGridView';
import TreeGridViewTable from 'Controls/_treeGrid/TreeGridViewTable';
import {default as ITreeGrid, IOptions as ITreeGridOptions} from 'Controls/_treeGrid/interface/ITreeGrid';

/**
 * Опции для контрола {@link Controls/treeGrid:ItemsView}
 *
 * @public
 * @author Уфимцев Д.Ю.
 */
export interface IItemsTreeGridOptions extends IItemsViewOptions, ITreeGridOptions {}

/**
 * Контрол древовидной таблицы, который умеет работать без источника данных.
 * В качестве данных ожидает {@link Types/collection:RecordSet} переданный в опцию
 * {@link Controls/_list/IItemsView#items}.
 *
 * @demo Controls-demo/treeGridNew/ItemsView/Base/Index
 *
 * @class Controls/treeGrid:ItemsView
 * @extends Controls/grid:ItemsView
 * @mixes Controls/list:IItemsView
 * @mixes Controls/interface/IGroupedList
 * @mixes Controls/list:IVirtualScrollConfig
 * @mixes Controls/list:IList
 * @mixes Controls/list:IClickableView
 * @mixes Controls/marker:IMarkerList
 * @mixes Controls/itemActions:IItemActions
 * @mixes Controls/grid:IGridControl
 * @mixes Controls/interface/IGridItemTemplate
 * @mixes Controls/interface/IGroupedGrid
 * @mixes Controls/interface/IGridItemTemplate
 * @mixes Controls/interface:IHierarchy
 *
 * @public
 * @author Уфимцев Д.Ю.
 */
export default class ItemsTreeGrid extends ItemsGrid<IItemsTreeGridOptions> implements ITreeGrid {
    //region override base template props
    protected _viewName: Function = null;
    protected _viewTemplate: Function = TreeControl;
    protected _viewModelConstructor: string = 'Controls/treeGrid:TreeGridCollection';
    //endregion

    //region implement ITreeGrid
    readonly '[Controls/_treeGrid/interface/ITreeGrid]': true;
    //endregion

    //region life circle hooks
    _beforeMount(options: IItemsTreeGridOptions): void | Promise<void> {
        if (options.groupProperty && options.nodeTypeProperty) {
            Logger.error('Нельзя одновременно задавать группировку через ' +
                'groupProperty и через nodeTypeProperty.', this);
        }

        const superResult = super._beforeMount(options);
        this._viewName = isFullGridSupport() ? TreeGridView : TreeGridViewTable;

        return superResult;
    }
    //endregion

}
