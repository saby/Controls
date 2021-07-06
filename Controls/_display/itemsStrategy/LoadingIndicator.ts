import IItemsStrategy, {IOptions as IItemsStrategyOptions} from '../IItemsStrategy';
import Collection from '../Collection';
import CollectionItem from '../CollectionItem';
import {DestroyableMixin, Model} from 'Types/entity';
import {mixin} from 'Types/util';
import {default as LoadingIndicatorItem, TLoadingIndicatorPosition} from '../LoadingIndicator';
import {ITriggerOffset} from '../LoadingIndicatorMixin';
import LoadingTrigger, {TLoadingTriggerPosition} from '../LoadingTrigger';

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

    protected _topTrigger: LoadingTrigger = null;
    protected _bottomTrigger: LoadingTrigger = null;

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

        if (this._getTrigger('top')) {
            items.unshift(this._getTrigger('top') as any as T);
        }
        if (this._getIndicator('top')) {
            items.unshift(this._getIndicator('top') as any as T);
        }

        if (this._getTrigger('bottom')) {
            items.push(this._getTrigger('bottom') as any as T);
        }
        if (this._getIndicator('bottom')) {
            items.push(this._getIndicator('bottom') as any as T);
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

        this._topTrigger = null;
        this._bottomTrigger = null;

        return this.source.reset();
    }

    invalidate(): void {
        return this.source.invalidate();
    }

    getDisplayIndex(collectionIndex: number): number {
        const sourceIndex = this.source.getDisplayIndex(collectionIndex);
        const offset = this._getIndexOffset();
        const itemIndex = sourceIndex + offset;
        return itemIndex === -1 ? this.items.length : itemIndex;
    }

    getCollectionIndex(displayIndex: number): number {
        const sourceIndex = this.source.getCollectionIndex(displayIndex);
        const offset = this._getIndexOffset();
        return sourceIndex - offset;
    }

    private _getIndexOffset(): number {
        let offset = 0;

        // на индекс может повлиять только верхний индикатор и триггер, нижний всегда находится после всех элементов
        if (this._getIndicator('top')) {
            offset++;
        }
        if (this._getTrigger('top')) {
            offset++;
        }

        return offset;
    }

    // endregion

    // region Indicator

    showIndicator(position: TLoadingIndicatorPosition): boolean {
        const indicatorIsHidden  = !this._getIndicator(position);
        if (indicatorIsHidden) {
            this._createIndicator(position);
        }
        return indicatorIsHidden;
    }

    hideIndicator(position: TLoadingIndicatorPosition): boolean {
        const indicatorIsShowed = !!this._getIndicator(position);
        const indicatorName = this._getIndicatorName(position);
        this[indicatorName] = null;
        return indicatorIsShowed;
    }

    getIndicator(position: TLoadingIndicatorPosition): LoadingIndicatorItem {
        return this._getIndicator(position);
    }

    private _getIndicatorName(position: TLoadingIndicatorPosition): string {
        return `_${position}Indicator`;
    }

    private _getIndicator(position: TLoadingIndicatorPosition): LoadingIndicatorItem {
        const indicatorName = this._getIndicatorName(position);
        return this[indicatorName];
    }

    private _createIndicator(position: TLoadingIndicatorPosition): void {
        const indicator = this.options.display.createItem({
            itemModule: 'Controls/display:LoadingIndicator',
            position
        }) as any as LoadingIndicatorItem;

        const indicatorName = this._getIndicatorName(position);
        this[indicatorName] = indicator;
    }

    // endregion Indicator

    // region Trigger

    showTrigger(position: TLoadingTriggerPosition): boolean {
        const trigger = this._getTrigger(position);
        return trigger.show();
    }

    setTriggerOffset(offset: ITriggerOffset): boolean {
        let changed = false;
        if (this._topTrigger) {
            const topOffsetChanged = this._topTrigger.setOffset(offset.top);
            changed = changed || topOffsetChanged;
        }
        if (this._bottomTrigger) {
            const bottomOffsetChanged = this._bottomTrigger.setOffset(offset.bottom);
            changed = changed || bottomOffsetChanged;
        }
        return changed;
    }

    private _getTriggerName(position: TLoadingTriggerPosition): string {
        return `_${position}Trigger`;
    }

    private _getTrigger(position: TLoadingTriggerPosition): LoadingTrigger {
        const triggerName = this._getTriggerName(position);

        let trigger = this[triggerName];
        if (!trigger) {
            this._createTrigger(position);
        }
        return this[triggerName];
    }

    private _createTrigger(position: TLoadingTriggerPosition): void {
        const isTopTrigger = position === 'top';
        // У верхнего триггера оффсет должен быть изначально -1, иначе обсервер сразу сработает
        const offset = isTopTrigger ? -1 : 0;
        const visible = !isTopTrigger;
        const trigger = this.options.display.createItem({
            itemModule: 'Controls/display:LoadingTrigger',
            position,
            offset,
            visible
        }) as any as LoadingTrigger;

        const triggerName = this._getTriggerName(position);
        this[triggerName] = trigger;
    }

    // endregion Trigger
}

Object.assign(LoadingIndicator.prototype, {
    '[Controls/_display/itemsStrategy/LoadingIndicator]': true,
    _moduleName: 'Controls/display:itemsStrategy.LoadingIndicator',
    _topIndicator: null,
    _bottomIndicator: null,
    _globalIndicator: null
});
