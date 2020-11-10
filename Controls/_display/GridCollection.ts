import Collection, { ItemsFactory, IOptions as IBaseOptions } from './Collection';
import GridCollectionItem, { IOptions as IGridCollectionItemOptions } from './GridCollectionItem';
import { TemplateFunction } from 'UI/Base';
import GridHeader from './GridHeader';
import GridResults, { TResultsPosition } from './GridResults';
import GridFooter from './GridFooter';
import { TColumns, THeader } from 'Controls/grid';
import { GridLadderUtil } from 'Controls/gridNew';

export interface IOptions<
    S,
    T extends GridCollectionItem<S> = GridCollectionItem<S>
> extends IBaseOptions<S, T> {
    columns: TColumns;
    footerTemplate: TemplateFunction;
    header: THeader;
    resultsTemplate: TemplateFunction;
    resultsPosition: TResultsPosition;
    headerInEmptyListVisible: boolean;
    ladderProperties: string[];
    stickyColumn: {};
}

export default class GridCollection<
    S,
    T extends GridCollectionItem<S> = GridCollectionItem<S>
> extends Collection<S, T> {
    protected _$columns: TColumns;
    protected _$header: GridHeader<S>;
    protected _$footer: GridFooter<S>;
    protected _$results: GridResults<S>;
    protected _$ladder: {};
    protected _$ladderProperties: string[];
    protected _$stickyColumn: {};
    protected _$resultsPosition: TResultsPosition;
    protected _$headerInEmptyListVisible: boolean;

    constructor(options: IOptions<S, T>) {
        super(options);

        this._initializeLadder(this._$ladderProperties, this._$columns);

        this._$headerInEmptyListVisible = options.headerInEmptyListVisible;
        this._$resultsPosition = options.resultsPosition;

        if (this._headerIsVisible(options)) {
            this._$header = this._initializeHeader(options);
        }
        if (options.footerTemplate) {
            this._$footer = this._initializeFooter(options);
        }
        if (this._resultsIsVisible()) {
            this._$results = this._initializeResults(options);
        }
    }

    getColumns(): TColumns {
        return this._$columns;
    }

    getHeader(): GridHeader<S> {
        return this._$header;
    }

    getFooter(): GridFooter<S> {
        return this._$footer;
    }

    getResults(): GridResults<S> {
        return this._$results;
    }

    getResultsPosition(): TResultsPosition {
        return this._$resultsPosition;
    }

    getEmptyTemplateClasses(theme?: string): string {
        const rowSeparatorSize = this.getRowSeparatorSize();
        let emptyTemplateClasses = `controls-GridView__emptyTemplate js-controls-GridView__emptyTemplate`;
        emptyTemplateClasses += ` controls-Grid__row-cell_withRowSeparator_size-${rowSeparatorSize}`;
        emptyTemplateClasses += ` controls-Grid__row-cell_withRowSeparator_size-${rowSeparatorSize}_theme-${theme}`;
        return emptyTemplateClasses;
    }

    getLadder(item: T): {} {
        let result;
        if (this._$ladder && this._$ladder.ladder) {
            result = this._$ladder.ladder[this.getIndex(item)];
        }
        return result;
    }

    getStickyColumn(): GridLadderUtil.IStickyColumn {
        return GridLadderUtil.getStickyColumn({
            stickyColumn: this._$stickyColumn,
            columns: this._$columns
        });
    }

    getStickyLadder(item: T): {} {
        let result;
        if (this._$ladder && this._$ladder.stickyLadder) {
            result = this._$ladder.stickyLadder[this.getIndex(item)];
        }
        return result;
    }

    protected _initializeLadder(ladderProperties: string[], columns: TColumns): void {
        if (GridLadderUtil.isSupportLadder(ladderProperties)) {
            this._$ladder = GridLadderUtil.prepareLadder({
                columns: columns,
                ladderProperties: ladderProperties,
                startIndex: this.getStartIndex(),
                stopIndex: this.getStopIndex() || this.getCollectionCount(),
                display: this
            });
        }
    }

    protected _headerIsVisible(options: IOptions<S>): boolean {
        const hasHeader = options.header && options.header.length;
        return hasHeader && (this._$headerInEmptyListVisible || this.getCollectionCount() > 0);
    }

    protected _resultsIsVisible(): boolean {
        const hasResultsPosition = !!this._$resultsPosition;
        const hasMoreData = this.getHasMoreData();
        return hasResultsPosition && (hasMoreData || this.getCollectionCount() > 1);
    }

    protected _initializeHeader(options: IOptions<S>): GridHeader<S> {
        return new GridHeader({
            owner: this,
            header: options.header
        });
    }

    protected _initializeFooter(options: IOptions<S>): GridFooter<S> {
        return new GridFooter({
            owner: this,
            footerTemplate: options.footerTemplate
        });
    }

    protected _initializeResults(options: IOptions<S>): GridResults<S> {
        return new GridResults({
            owner: this,
            results: this.getMetaResults(),
            resultsTemplate: options.resultsTemplate
        });
    }

    protected _getItemsFactory(): ItemsFactory<T> {
        const superFactory = super._getItemsFactory();
        return function CollectionItemsFactory(options?: IGridCollectionItemOptions<S>): T {
            options.columns = this._$columns;
            return superFactory.call(this, options);
        };
    }
}

Object.assign(GridCollection.prototype, {
    '[Controls/_display/GridCollection]': true,
    _moduleName: 'Controls/display:GridCollection',
    _itemModule: 'Controls/display:GridCollectionItem',
    _$columns: null,
    _$headerInEmptyListVisible: false,
    _$resultsPosition: null,
    _$ladderProperties: null,
    _$stickyColumn: null
});
