import {Logger} from 'UI/Utils';
import {IItemsViewOptions} from 'Controls/baseList';
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
 * Контрол древовидной {@link /doc/platform/developmentapl/interface-development/controls/list/tree-column/ таблицы}, который умеет работать без {@link /doc/platform/developmentapl/interface-development/controls/list/source/ источника данных}.
 * В качестве данных ожидает {@link Types/collection:RecordSet} переданный в опцию {@link Controls/list:IItemsView#items items}.
 *
 * @demo Controls-demo/treeGridNew/ItemsView/Base/Index
 *
 * @class Controls/treeGrid:ItemsView
 * @extends Controls/grid:ItemsView
 * @implements Controls/list:IItemsView
 * @implements Controls/list:IVirtualScrollConfig
 * @implements Controls/list:IList
 * @implements Controls/list:IClickableView
 * @implements Controls/interface/IGridItemTemplate
 * @implements Controls/interface/IGroupedGrid
 * @implements Controls/interface/IGridItemTemplate
 * @implements Controls/interface:IHierarchy
 * @implements Controls/interface/IGroupedList
 * @implements Controls/interface:IMultiSelectable
 * @implements Controls/marker:IMarkerList
 * @implements Controls/itemActions:IItemActions
 * @implements Controls/grid:IGridControl
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
