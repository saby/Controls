import IItemsStrategy, {IOptions as IItemsStrategyOptions} from '../IItemsStrategy';
import Collection from '../Collection';
import CollectionItem from '../CollectionItem';
import {DestroyableMixin, Model} from 'Types/entity';
import {mixin} from 'Types/util';
import PortionedSearchIndicator, { TPortionedSearchIndicatorPosition } from '../PortionedSearchIndicator';
import {TemplateFunction} from "UI/Base";

interface IOptions<S extends Model, T extends CollectionItem<S>> extends IItemsStrategyOptions<S, T> {
    source: IItemsStrategy<S, T>;
    portionedSearchTemplate: TemplateFunction|string;
    continueSearchTemplate: TemplateFunction|string;
}

/**
 * Стратегия для создания индикаторов порционного поиска
 *
 * @author Панихин К.А.
 * @private
 */
export default class PortionedSearch<
    S extends Model = Model,
    T extends CollectionItem<S> = CollectionItem<S>
> extends mixin<DestroyableMixin>(DestroyableMixin) implements IItemsStrategy<S, T> {
    protected _options: IOptions<S, T>;

    protected _topIndicator: PortionedSearchIndicator = null;
    protected _bottomIndicator: PortionedSearchIndicator = null;

    constructor(options: IOptions<S, T>) {
        super();
        this._options = options;
    }

    // region IItemsStrategy

    readonly '[Controls/_display/IItemsStrategy]': boolean = true;

    get options(): IOptions<S, T> {
        return this._options;
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

        // на индекс может повлиять только верхний индикатор, нижний всегда находится после всех элементов
        if (this._getIndicator('top')) {
            offset++;
        }

        return offset;
    }

    // endregion

    // region Indicator

    showIndicator(position: TPortionedSearchIndicatorPosition): boolean {
        const indicatorIsHidden  = !this._getIndicator(position);
        if (indicatorIsHidden) {
            this._createIndicator(position);
        }
        return indicatorIsHidden;
    }

    hideIndicator(position: TPortionedSearchIndicatorPosition): boolean {
        const indicatorIsShowed = !!this._getIndicator(position);
        const indicatorName = this._getIndicatorName(position);
        this[indicatorName] = null;
        return indicatorIsShowed;
    }

    showPortionedSearch(position: TPortionedSearchIndicatorPosition): void {
        const indicator = this._getIndicator(position);
        indicator.showPortionedSearch();
    }

    showContinueSearch(position: TPortionedSearchIndicatorPosition): void {
        const indicator = this._getIndicator(position);
        indicator.showContinueSearch();
    }

    private _getIndicatorName(position: TPortionedSearchIndicatorPosition): string {
        return `_${position}Indicator`;
    }

    private _getIndicator(position: TPortionedSearchIndicatorPosition): PortionedSearchIndicator {
        const indicatorName = this._getIndicatorName(position);
        return this[indicatorName];
    }

    private _createIndicator(position: TPortionedSearchIndicatorPosition): void {
        const indicator = this.options.display.createItem({
            itemModule: 'Controls/display:PortionedSearchIndicator',
            position,
            portionedSearchTemplate: this.options.portionedSearchTemplate,
            continueSearchTemplate: this.options.continueSearchTemplate
        }) as any as PortionedSearchIndicator;

        const indicatorName = this._getIndicatorName(position);
        this[indicatorName] = indicator;
    }

    // endregion Indicator
}

Object.assign(PortionedSearch.prototype, {
    '[Controls/_display/itemsStrategy/PortionedSearch]': true,
    _moduleName: 'Controls/display:itemsStrategy.PortionedSearch',
    _topIndicator: null,
    _bottomIndicator: null
});
