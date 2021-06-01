import { mixin } from 'Types/util';
import { ITreeItemOptions, TreeItem as DisplayTreeItem } from 'Controls/display';
import TreeCollection from './TreeCollection';
import { Model } from 'Types/entity';

export interface IOptions<T extends Model> extends ITreeItemOptions<T> {
    owner: TreeCollection<T>;
}

export default class TreeItem<T extends Model = Model>
    extends mixin<DisplayTreeItem<any>>(DisplayTreeItem) {

    readonly '[Controls/_display/IEditableCollectionItem]': boolean = true;
    readonly DisplayItemActions: boolean = true;
    readonly DisplaySearchValue: boolean = true;
    readonly Markable: boolean = true;
    readonly SelectableItem: boolean = true;
    readonly LadderSupport: boolean = true;
    readonly DraggableItem: boolean = true;
    protected _$searchValue: string;
    protected _$hasStickyGroup: boolean;

    // region Expander

    shouldDisplayExpanderBlock(): boolean {
        return this._$owner.getExpanderVisibility() === 'hasChildren' ? this._$owner.hasNodeWithChildren() : true;
    }

    // endregion Expander
}

Object.assign(TreeItem.prototype, {
    '[Controls/tree:TreeItem]': true,
    '[Controls/_display/TreeItem]': true,
    _moduleName: 'Controls/tree:TreeItem',
    _$searchValue: '',
    _instancePrefix: 'tree-item-',
    _$hasStickyGroup: false
});
