import IItemsStrategy, {IOptions as IItemsStrategyOptions} from '../IItemsStrategy';
import {DestroyableMixin, SerializableMixin, ISerializableState, Model} from 'Types/entity';
import {mixin} from 'Types/util';
import TreeItem from 'Controls/_display/TreeItem';
import CollectionItem from 'Controls/_display/CollectionItem';
import GroupItem from 'Controls/_display/GroupItem';
import BreadcrumbsItem from 'Controls/_display/BreadcrumbsItem';

interface IOptions<S extends Model, T extends CollectionItem<S>> {
    source: IItemsStrategy<S, T>;
    item: T;
    addPosition: 'top' | 'bottom';
    groupMethod?: Function;
}

/**
 * Стратегия-декоратор для формирования корня дерева
 * @class Controls/_display/ItemsStrategy/Root
 * @mixes Types/_entity/DestroyableMixin
 * @mixes Types/_entity/SerializableMixin
 * @implements Controls/_display/IItemsStrategy
 * @author Мальцев А.А.
 * @private
 */
export default class Add<S extends Model, T extends CollectionItem<S>> extends mixin<
    DestroyableMixin,
    SerializableMixin
    >(
    DestroyableMixin,
    SerializableMixin
) implements IItemsStrategy<S, T> {

    protected _options: IOptions<S, T>;
    private _addingItemIndex?: number;

    constructor(options: IOptions<S, T>) {
        super();
        this._options = options;
    }

    // region IItemsStrategy

    readonly '[Controls/_display/IItemsStrategy]': boolean = true;

    get source(): IItemsStrategy<S, T> {
        return this._options.source;
    }

    get options(): IItemsStrategyOptions<S, T> {
        return this.source.options;
    }

    get count(): number {
        return this.source.count + 1;
    }

    get items(): T[] {
        const addItemIndex = this._getAddingItemIndex();

        if (addItemIndex === 0) {
            return [this._options.item].concat(this.source.items);
        } else if (addItemIndex === this.count) {
            return this.source.items.concat([this._options.item]);
        } else {
            return this.source.items.slice(0, addItemIndex)
                .concat([this._options.item])
                .concat(this.source.items.slice(addItemIndex, this.source.count));
        }
    }

    at(index: number): T {
        const addItemIndex = this._getAddingItemIndex();

        if (index === addItemIndex) {
            return this._options.item;
        } else if (index < addItemIndex) {
            return this.source.at(index);
        } else {
            return this.source.at(index - 1);
        }
    }

    splice(start: number, deleteCount: number, added?: S[]): T[] {
        this._addingItemIndex = undefined;
        return this.source.splice(start, deleteCount, added);
    }

    reset(): void {
        return this.source.reset();
    }

    invalidate(): void {
        this._addingItemIndex = undefined;
        return this.source.invalidate();
    }

    getDisplayIndex(index: number): number {
        const addItemIndex = this._getAddingItemIndex();

        if (index === addItemIndex) {
            return -1;
        } else if (index < addItemIndex) {
            return this.source.getDisplayIndex(index);
        } else {
            return this.source.getDisplayIndex(index - 1);
        }
    }

    getCollectionIndex(index: number): number {
        const addItemIndex = this._getAddingItemIndex();

        if (index === addItemIndex) {
            return -1;
        } else if (index < addItemIndex) {
            return this.source.getCollectionIndex(index);
        } else {
            return this.source.getCollectionIndex(index - 1);
        }
    }

    // endregion

    private _getAddingItemIndex(): number {
        if (this._addingItemIndex === undefined) {
            this._addingItemIndex = this._calculateIndex();
        }
        return this._addingItemIndex;
    }

    private _calculateIndex(): number {
        let index: number = -1;
        const getInRange = (start, end) => this._options.addPosition === 'top' ? start : end;

        // 3 варианта куда может добавляться элемент в порядке значимости:
        // - в родителя
        //      добавляем либо как первого ребенка, либо как последнего.
        // - в группу
        //      как первый элемент группы или как последний
        // - в корень
        //      в начало проеции либо в конец

        if (this._options.item instanceof TreeItem) {
            index = getInRange(0, this.source.count);
        } else if (this._options.groupMethod) {
            const groupId = this._options.groupMethod(this._options.item.contents);
            if (this._options.addPosition === 'top') {
                const groupIndex = this.source.items.indexOf(this.source.items.filter((item) => item.contents === groupId)[0]);
                index = groupIndex === -1 ? 0 : groupIndex + 1;
            } else {
                this.source.items.forEach((item, cIndex) => {
                    const isGroup = item instanceof GroupItem;
                    const isBreadcrumbs = item instanceof BreadcrumbsItem;
                    if (!isGroup && !isBreadcrumbs && this._options.groupMethod(item.contents) === groupId) {
                        index = cIndex + 1;
                    }
                });
                index = index === -1 ? this.source.count : index;
            }
        } else {
            index = getInRange(0, this.source.count);
        }
        return index;
    }

    // region SerializableMixin

    _getSerializableState(state: ISerializableState): ISerializableState {
        const resultState = SerializableMixin.prototype._getSerializableState.call(this, state);
        resultState.$options = this._options;
        return resultState;
    }

    // endregion
}

Object.assign(Add.prototype, {
    '[Controls/_display/itemsStrategy/Add]': true,
    _moduleName: 'Controls/display:itemsStrategy.Add'
});
