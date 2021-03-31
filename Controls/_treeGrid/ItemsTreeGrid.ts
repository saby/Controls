import {Logger} from 'UI/Utils';
import {IItemsViewOptions} from 'Controls/list';
import {isFullGridSupport} from 'Controls/display';
import {ItemsView as ItemsGrid} from 'Controls/grid';
import { TreeControl } from 'Controls/tree';
import TreeGridView from 'Controls/_treeGrid/TreeGridView';
import TreeGridViewTable from 'Controls/_treeGrid/TreeGridViewTable';
import {default as ITreeGrid, IOptions as ITreeGridOptions} from 'Controls/_treeGrid/interface/ITreeGrid';

/**
 * Опции для контрола {@link ItemsTreeGrid}
 * @author Уфимцев Д.Ю.
 */
export interface IItemsTreeGridOptions extends IItemsViewOptions, ITreeGridOptions {}

/**
 * Контрол древовидной таблицы, который умеет работать по {@link RecordSet}
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
