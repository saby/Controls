import TreeItem from './TreeItem';
import {List, IListOptions} from 'Types/collection';
import BreadcrumbsItem from './BreadcrumbsItem';

export interface IOptions<T> extends IListOptions<T> {
    owner?: T;
}

/**
 * Список дочерних элементов узла дерева.
 * @class Controls/_display/TreeChildren
 * @extends Types/_collection/List
 * @public
 * @author Мальцев А.А.
 */
export default class TreeChildren<S, T = TreeItem<S>> extends List<T> {
    /**
     * Узел-владелец
     */
    _$owner: T;

    constructor(options: IOptions<T>) {
        super(options);

        if (!(this._$owner instanceof Object)) {
            throw new TypeError('Tree children owner should be an object');
        }
        if (!(this._$owner instanceof TreeItem) && !(this._$owner instanceof BreadcrumbsItem) && !(this._$owner['[Controls/_display/grid/Row]'])) {
            throw new TypeError('Tree children owner should be an instance of Controls/display:TreeItem or Controls/display:BreadcrumbsItem');
        }
    }

    /**
     * Возвращает узел-владелец
     * @return {Controls/_display/TreeItem}
     */
    getOwner(): T {
        return this._$owner;
    }

}

TreeChildren.prototype['[Controls/_display/TreeChildren]'] = true;
TreeChildren.prototype._$owner = null;

