import {Model} from 'Types/entity';
import TreeItem from './TreeItem';
import Tree from './Tree';
import CollectionItem, {IOptions as ICollectionItemOptions} from './CollectionItem';
import {register} from "Types/di";

export interface IOptions<T> extends ICollectionItemOptions<T> {
    source: TreeItem<T>;
}

export default class SearchSeparator<T> extends CollectionItem<T>  {
    readonly '[Controls/_display/SearchSeparator]': boolean = true;
    readonly '[Controls/_display/IEditableCollectionItem]': boolean = false;
    readonly '[Controls/_itemActions/interface/IItemActionsItem]': boolean = false;

    readonly Markable: boolean = false;
    readonly SelectableItem: boolean = false;

    protected _instancePrefix: 'search-separator-item-';

    protected readonly _$source: TreeItem<T>;

    constructor(options?: IOptions<T>) {
        super(options);
        this._$source = options && options.source;
    }

    getSource(): TreeItem<T> {
        return this._$source;
    }

    // region CollectionItem

    getOwner(): Tree<T> {
        return this._$source && this._$source.getOwner();
    }

    setOwner(owner: Tree<T>): void {
        return this._$source && this._$source.setOwner(owner);
    }

    getContents(): T {
        return this._$source && this._$source.getContents();
    }

    setContents(contents: T, silent?: boolean): void {
        return this._$source && this._$source.setContents(contents, silent);
    }

    getUid(): string {
        return 'searchSeparator';
    }

    isSelected(): boolean {
        return this._$source && this._$source.isSelected();
    }

    setSelected(selected: boolean, silent?: boolean): void {
        return this._$source && this._$source.setSelected(selected, silent);
    }

    // endregion

    isRoot(): boolean {
        return this._$source && this._$source.isRoot();
    }

    /**
     * Returns branch level in tree
     */
    getLevel(): number {
        return 0;
    }
}

Object.assign(SearchSeparator.prototype, {
    '[Controls/_display/SearchSeparator]': true,
    _moduleName: 'Controls/display:SearchSeparator',
    _$source: undefined
});

register('Controls/display:SearchSeparator', SearchSeparator, {instantiate: false});
