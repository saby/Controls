import CollectionItem, {IOptions as ICollectionItemOptions} from './CollectionItem';
import TreeItem from './TreeItem';
import Tree from './Tree';
import {register} from 'Types/di';
import TreeChildren from './TreeChildren';
import { object } from 'Types/util';
import {Model} from 'Types/entity';
import IGroupNode from './interface/IGroupNode';

export interface IOptions<T extends Model = Model> extends ICollectionItemOptions<T> {
    owner?: Tree<T>;
    last: TreeItem<T>;
}

/**
 * Хлебная крошка
 * @class Controls/_display/BreadcrumbsItem
 * @extends Controls/_display/CollectionItem
 * @private
 * @author Мальцев А.А.
 */
export default class BreadcrumbsItem<T extends Model = Model> extends CollectionItem<T> implements IGroupNode {
    readonly '[Controls/_display/IEditableCollectionItem]': boolean = false;
    readonly Markable: boolean = false;

    protected _instancePrefix: 'breadcrumbs-item-';
    protected _$owner: Tree<T>;

    /**
     * Последний элемент хлебной крошки
     */
    protected _$last: TreeItem<T>;

    protected get _first(): TreeItem<T> {
         const root = this._$owner ? this._$owner.getRoot() : {};
         let current = this._$last;

         while (current) {
              const parent = current.getParent();
              if (!parent || parent === root) {
                    break;
              }
              current = parent;
         }

         return current;
    }

    constructor(options?: IOptions<T>) {
        super(options);
    }

    // region Public methods

    getContents(): T {
        const root = this._$owner ? this._$owner.getRoot() : {};
        let current = this._$last;
        const contents = [];

        // Go up from last item until end
        while (current) {
            contents.unshift(current.getContents());
            current = current.getParent();
            if (current === root) {
                break;
            }
        }

        return contents as any;
    }

    setContents(): void {
        throw new ReferenceError('BreadcrumbsItem contents is read only.');
    }

    /**
    * Returns branch level in tree
    */
    getLevel(): number {
        const first = this._first;
        return first ? first.getLevel() : 0;
    }

    getLast(): TreeItem<T> {
        return this._$last;
    }

    getParent(): TreeItem<T> {
        // Родителем хлебной крошки всегда является корневой узел, т.к. хлебная крошка это путь до корневого узла
        return this._$owner.getRoot();
    }

    getChildren(withFilter: boolean = true): TreeChildren<T> {
        return this._$owner.getChildren(this, withFilter);
    }

    isHasChildren(): boolean {
        return this.getLast().isHasChildren();
    }

    isRoot(): boolean {
        // Хлебная крошка не может быть корнем
        return false;
    }

    isGroupNode(): boolean {
        return false;
    }

   protected _getMultiSelectAccessibility(): boolean|null {
      const value = object.getPropertyValue<boolean|null>(this.getLast().getContents(), this._$multiSelectAccessibilityProperty);
      return value === undefined ? true : value;
   }

    // endregion
}

Object.assign(BreadcrumbsItem.prototype, {
    '[Controls/_display/BreadcrumbsItem]': true,
    _moduleName: 'Controls/display:BreadcrumbsItem',
    _$last: null
});

register('Controls/display:BreadcrumbsItem', BreadcrumbsItem, {instantiate: false});
