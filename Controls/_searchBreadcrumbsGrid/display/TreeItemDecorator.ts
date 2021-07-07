import BreadcrumbsItem from './BreadcrumbsItem';
import SearchGridDataRow from './SearchGridDataRow';
import SearchGridCollection from './SearchGridCollection';
import {register} from 'Types/di';
import { Model } from 'Types/entity';

export interface IOptions<T extends Model> {
    source: SearchGridDataRow<T>;
    parent?: SearchGridDataRow<T> | BreadcrumbsItem<T>;
    multiSelectVisibility: string;
}

/**
 * Tree item which is just a decorator for another one
 * @class Controls/_display/TreeItemDecorator
 * @extends Controls/_display/SearchGridDataRow
 * @author Мальцев А.А.
 * @private
 */
export default class TreeItemDecorator<T extends Model> extends SearchGridDataRow<T> {
    protected _$source: SearchGridDataRow<T>;

    constructor(options?: IOptions<T>) {
        super({
            contents: options?.source?.contents,
            multiSelectVisibility: options?.multiSelectVisibility
        });
        this._$source = options?.source;
        this._$parent = options?.parent;

        for(let property in this._$source) {
            if(typeof this._$source[property] == "function") {
                this[property] = this._$source[property].bind(this._$source)
            }
        }
    }

    getSource(): SearchGridDataRow<T> {
        return this._$source;
    }

    // region CollectionItem

    getOwner(): SearchGridCollection<T> {
        return this._$source && this._$source.getOwner();
    }

    setOwner(owner: SearchGridCollection<T>): void {
        return this._$source && this._$source.setOwner(owner);
    }

    getContents(): T {
        return this._$source && this._$source.getContents();
    }

    setContents(contents: T, silent?: boolean): void {
        return this._$source && this._$source.setContents(contents, silent);
    }

    getUid(): string {
        return this._$source && this._$source.getUid();
    }

    isSelected(): boolean {
        return this._$source && this._$source.isSelected();
    }

    setSelected(selected: boolean, silent?: boolean): void {
        return this._$source && this._$source.setSelected(selected, silent);
    }

    isEditing(): boolean {
        return this._$source && this._$source.isEditing();
    }

    setEditing(editing: boolean, editingContents?: T, silent?: boolean): void {
        this._$source && this._$source.setEditing(editing, editingContents, silent);
    }

    acceptChanges(): void {
        this._$source && this._$source.acceptChanges();
    }

    // endregion

    // region TreeItem

    getRoot(): SearchGridDataRow<T> {
        return this._$source && this._$source.getRoot();
    }

    isRoot(): boolean {
        return this._$source && this._$source.isRoot();
    }

    isNode(): boolean {
        return this._$source && this._$source.isNode();
    }

    setNode(node: boolean): void {
        return this._$source && this._$source.setNode(node);
    }

    isExpanded(): boolean {
        return this._$source && this._$source.isExpanded();
    }

    setExpanded(expanded: boolean, silent?: boolean): void {
        return this._$source && this._$source.setExpanded(expanded, silent);
    }

    toggleExpanded(): void {
        return this._$source && this._$source.toggleExpanded();
    }

    isHasChildren(): boolean {
        return this._$source && this._$source.isHasChildren();
    }

    setHasChildren(value: boolean): void {
        return this._$source && this._$source.setHasChildren(value);
    }

    getChildrenProperty(): string {
        return this._$source && this._$source.getChildrenProperty();
    }

    // endregion
}

Object.assign(TreeItemDecorator.prototype, {
    '[Controls/_display/TreeItemDecorator]': true,
    _moduleName: 'Controls/display:TreeItemDecorator',
    _$source: undefined
});

register('Controls/display:TreeItemDecorator', TreeItemDecorator, {instantiate: false});
