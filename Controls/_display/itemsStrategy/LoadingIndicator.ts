import IItemsStrategy, {IOptions as IItemsStrategyOptions} from '../IItemsStrategy';
import Collection from '../Collection';
import CollectionItem from '../CollectionItem';
import {DestroyableMixin, Model} from 'Types/entity';
import {mixin} from 'Types/util';
import {default as LoadingIndicatorItem, TLoadingIndicatorPosition} from "Controls/_display/LoadingIndicator";

export const DEFAULT_TOP_TRIGGER_OFFSET = -1;
export const DEFAULT_BOTTOM_TRIGGER_OFFSET = 0;

interface IOptions<S extends Model, T extends CollectionItem<S>> {
    source: IItemsStrategy<S, T>;
    display: Collection<S, T>;
}

/**
 * Стратегия для создания индикаторов загрузки
 *
 * @author Панихин К.А.
 * @private
 */
export default class LoadingIndicator<
    S extends Model = Model,
    T extends CollectionItem<S> = CollectionItem<S>
> extends mixin<DestroyableMixin>(DestroyableMixin) implements IItemsStrategy<S, T> {
    protected _options: IOptions<S, T>;

    protected _topIndicator: LoadingIndicatorItem = null;
    protected _bottomIndicator: LoadingIndicatorItem = null;
    protected _globalIndicator: LoadingIndicatorItem = null;

    constructor(options: IOptions<S, T>) {
        super();
        this._options = options;
    }

    // region IItemsStrategy

    readonly '[Controls/_display/IItemsStrategy]': boolean = true;

    get options(): IItemsStrategyOptions<S, T> {
        return this.source.options;
    }

    get source(): IItemsStrategy<S, T> {
        return this._options.source;
    }

    get count(): number {
        return this.items.length;
    }

    get items(): T[] {
        const items = this.source.items.slice();

        if (this._topIndicator) {
            items.unshift(this._topIndicator as any as T);
        }
        if (this._bottomIndicator) {
            items.push(this._bottomIndicator as any as T);
        }

        return items;
    }

    at(index: number): T {
        return this.items[index];
    }

    splice(start: number, deleteCount: number, added?: S[]): T[] {
        return this.source.splice(
            start,
            deleteCount,
            added
        );
    }

    reset(): void {
        this._topIndicator = null;
        this._bottomIndicator = null;
        this._globalIndicator = null;
        return this.source.reset();
    }

    invalidate(): void {
        return this.source.invalidate();
    }

    getDisplayIndex(collectionIndex: number): number {
        const sourceIndex = this.source.getDisplayIndex(collectionIndex);
        // на индекс может повлиять только верхний индикатор, нижний всегда находится после всех элементов
        const itemIndex = this._topIndicator ? sourceIndex + 1 : sourceIndex;
        return itemIndex === -1 ? this.items.length : itemIndex;
    }

    getCollectionIndex(displayIndex: number): number {
        const sourceIndex = this.source.getCollectionIndex(displayIndex);
        // на индекс может повлиять только верхний индикатор, нижний всегда находится после всех элементов
        return this._topIndicator ? sourceIndex - 1 : sourceIndex;
    }

    // endregion

    // region LoadingIndicator

    showIndicator(position: TLoadingIndicatorPosition): boolean {
        const indicatorIsHidden  = !this._getIndicator(position);
        if (indicatorIsHidden) {
            const indicatorName = this._getIndicatorName(position);
            this[indicatorName] = this._createIndicator(position);
        }
        return indicatorIsHidden;
    }

    hideIndicator(position: TLoadingIndicatorPosition): boolean {
        const indicatorIsShowed = !!this._getIndicator(position);
        const indicatorName = this._getIndicatorName(position);
        this[indicatorName] = null;
        return indicatorIsShowed;
    }

    private _createIndicator(position: TLoadingIndicatorPosition): LoadingIndicatorItem {
        // У верхнего индикатора оффсет должен быть изначально -1, иначе обсервер сразу сработает
        // TODO LI а возможно и не нужен такой оффсет, ведь теперь обсервер пересоздавать придется. ПРОВЕРИТЬ.
        const triggerOffset = position === 'top' ? DEFAULT_TOP_TRIGGER_OFFSET : DEFAULT_BOTTOM_TRIGGER_OFFSET;
        return this.options.display.createItem({
            itemModule: 'Controls/display:LoadingIndicator',
            position,
            triggerOffset
        }) as any as LoadingIndicatorItem;
    }

    private _getIndicatorName(position: TLoadingIndicatorPosition): string {
        return `_${position}Indicator`;
    }

    private _getIndicator(position: TLoadingIndicatorPosition): LoadingIndicatorItem {
        const indicatorName = this._getIndicatorName(position);
        return this[indicatorName];
    }

    // endregion LoadingIndicator
}

Object.assign(LoadingIndicator.prototype, {
    '[Controls/_display/itemsStrategy/LoadingIndicator]': true,
    _moduleName: 'Controls/display:itemsStrategy.LoadingIndicator',
    _topIndicator: null,
    _bottomIndicator: null,
    _globalIndicator: null
});
