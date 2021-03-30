import {Logger} from 'UI/Utils';
import {IItemsViewOptions} from 'Controls/list';
import {isFullGridSupport} from 'Controls/display';
import {TreeControl} from 'Controls/_tree/TreeControl';
import {ItemsView as ItemsGrid} from 'Controls/gridNew';
import TreeGridView from 'Controls/_treeGridNew/TreeGridView';
import {default as ITreeGrid, IOptions as ITreeGridOptions} from 'Controls/_treeGridNew/interface/ITreeGrid';
import TreeGridViewTable from 'Controls/_treeGridNew/TreeGridViewTable';

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
    readonly '[Controls/_treeGridNew/interface/ITreeGrid]': true;
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
