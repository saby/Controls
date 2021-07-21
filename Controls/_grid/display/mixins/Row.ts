import {TemplateFunction} from 'UI/Base';
import {create} from 'Types/di';
import {isEqual} from 'Types/object';
import {Model as EntityModel} from 'Types/entity';
import {IColspanParams, IColumn, TColumns, TColumnSeparatorSize} from '../interface/IColumn';
import {THeader} from '../interface/IHeaderCell';
import {Collection, ICollectionItemOptions as IBaseOptions, ILadderConfig, IStickyLadderConfig, TLadderElement} from 'Controls/display';
import Cell, {IOptions as ICellOptions} from '../Cell';
import {TResultsPosition} from '../ResultsRow';
import StickyLadderCell from '../StickyLadderCell';
import CheckboxCell from '../CheckboxCell';
import ItemActionsCell from './../ItemActionsCell';
import {TColspanCallback, TColspanCallbackResult} from './Grid';
import {DRAG_SCROLL_JS_SELECTORS} from 'Controls/columnScroll';

const DEFAULT_GRID_ROW_TEMPLATE = 'Controls/grid:ItemTemplate';

export interface IItemTemplateParams {
    highlightOnHover?: boolean;
    style?: string;
    cursor?: 'default' | 'pointer';
    theme: string;
    showItemActionsOnHover?: boolean;

    // Deprecated, use cursor
    clickable?: boolean;
}

export interface IInitializeColumnsOptions {
    shouldAddStickyLadderCells?: boolean;
    shouldAddMultiSelectCell?: boolean;
    addEmptyCellsForStickyLadder?: boolean;
    colspanStrategy?: 'skipColumns' | 'consistently';
    extensionCellsConstructors?: {
        stickyLadderCell?: new () => object
        multiSelectCell?: new () => object
        separatedActionsCell?: new () => object
    };
}

export interface IOptions<T> extends IBaseOptions<T> {
    columnsConfig: TColumns;
    gridColumnsConfig: TColumns;
    colspanCallback?: TColspanCallback;
    rowTemplate: TemplateFunction;
    rowTemplateOptions: object;
    columnSeparatorSize?: TColumnSeparatorSize;
    colspanGroup?: boolean;
    hasStickyGroup?: boolean;
    itemActionsPosition?: 'inside' | 'outside' | 'custom';
}

export default abstract class Row<T> {
    readonly '[Controls/_display/grid/mixins/Row]': boolean;

    protected _$owner: Collection<T>;
    protected _cellModule: string;

    protected _$columnItems: Array<Cell<T, Row<T>>>;
    protected _$colspanCallback: TColspanCallback;
    protected _$ladder: TLadderElement<ILadderConfig>;
    protected _$stickyLadder: TLadderElement<IStickyLadderConfig>;
    protected _$columnSeparatorSize: TColumnSeparatorSize;
    protected _$rowSeparatorSize: string;

    protected _$rowTemplate: TemplateFunction;
    protected _$rowTemplateOptions: object;
    protected _$columnsConfig: TColumns;
    protected _$gridColumnsConfig: TColumns;
    protected _$itemActionsPosition: 'inside' | 'outside' | 'custom';
    protected _$backgroundStyle: string;
    protected _$isBottomSeparatorEnabled: boolean;
    protected _$isTopSeparatorEnabled: boolean;
    protected _savedColumns: TColumns;

    protected constructor(options?: IOptions<T>) {
        if (this._$rowTemplate) {
            if (options.columns) {
                this._savedColumns = options.columns;
            }

            this._$columnsConfig = [{
                template: this._$rowTemplate,
                templateOptions: this._$rowTemplateOptions
            }];
        }
    }

    getDefaultTemplate(): string {
        return DEFAULT_GRID_ROW_TEMPLATE;
    }

    getItemSpacing(): { left: string, right: string, row: string } {
        return {
            left: this._$owner.getLeftPadding().toLowerCase(),
            right: this._$owner.getRightPadding().toLowerCase(),
            row: this._$owner.getTopPadding().toLowerCase()
        };
    }

    getStickyHeaderMode(stickyCallback: Function): string {
        return this.isSticked() ? 'stackable' :
            (stickyCallback ? 'replaceable' : 'notsticky');
    }

    getStickyHeaderPosition(stickyCallback: Function): {} {
        const stickyVerticalPosition = stickyCallback ? 'top' : 'topBottom';
        return {
            vertical: stickyVerticalPosition
        };
    }

    // @TODO https://online.sbis.ru/opendoc.html?guid=907731fd-b8a8-4b58-8958-61b5c8090188
    setBottomSeparatorEnabled(state: boolean): void {
        this._$isBottomSeparatorEnabled = state;
        this._reinitializeColumns();
        this._nextVersion();
    }

    // @TODO https://online.sbis.ru/opendoc.html?guid=907731fd-b8a8-4b58-8958-61b5c8090188
    setTopSeparatorEnabled(state: boolean): void {
        this._$isTopSeparatorEnabled = state;
        this._reinitializeColumns();
        this._nextVersion();
    }

    //region Аспект "Стилевое оформление. Классы и стили строки"
    getItemClasses(params: IItemTemplateParams = {theme: 'default'}): string {
        let itemClasses = `${this._getBaseItemClasses(params.style, params.theme)} `
            + `${this._getCursorClasses(params.cursor, params.clickable)} `
            + `${this._getItemHighlightClasses(params.style, params.theme, params.highlightOnHover)}`;

        if (params.showItemActionsOnHover !== false) {
            itemClasses += ' controls-ListView__item_showActions';
        }

        return itemClasses;
    }

    protected _getBaseItemClasses(style: string, theme: string): string {
        return `controls-ListView__itemV controls-Grid__row controls-Grid__row_${style}`;
    }

    protected _getItemHighlightClasses(style: string, theme: string, highlightOnHover?: boolean): string {
        if (highlightOnHover !== false && !this.isEditing()) {
            return `controls-Grid__row_highlightOnHover_${style}`;
        }
        return '';
    }

    getMultiSelectClasses(
        theme: string,
        backgroundColorStyle: string,
        cursor: string = 'pointer',
        templateHighlightOnHover: boolean = true
    ): string {
        // TODO должно быть super.getMultiSelectPosition, но мы внутри миксина
        const hoverBackgroundStyle = this.getHoverBackgroundStyle();

        let classes = 'js-controls-ListView__notEditable controls-List_DragNDrop__notDraggable';
        classes += ` js-controls-ListView__checkbox ${DRAG_SCROLL_JS_SELECTORS.NOT_DRAG_SCROLLABLE}`;
        classes += ' controls-CheckboxMarker_inList';

        if (this._$owner.getMultiSelectVisibility() === 'onhover' && this.isSelected() === false) {
            classes += ' controls-ListView__checkbox-onhover';
        }

        if (templateHighlightOnHover !== false && this.getEditingConfig()?.mode !== 'cell') {
            classes += ` controls-Grid__item_background-hover_${hoverBackgroundStyle}`;
        }

        classes += ' controls-GridView__checkbox';
        classes += ` controls-GridView__checkbox_position-${this.getOwner().getMultiSelectPosition()}`;

        if (this.isDragged()) {
            classes += ' controls-ListView__itemContent_dragging';
        }

        return classes;
    }

    //endregion

    //region Аспект "Лесенка"
    getStickyLadderCellsCount(): number {
        const stickyProperties = this.getStickyLadderProperties(this._$columnsConfig[0]);
        return stickyProperties ? stickyProperties.length : 0;
    }
    getStickyLadderProperties(column: IColumn): string[] {
        let stickyProperties = column && column.stickyProperty;
        if (stickyProperties && !(stickyProperties instanceof Array)) {
            stickyProperties = [stickyProperties];
        }
        return stickyProperties as string[];
    }

    shouldDrawLadderContent(ladderProperty: string, stickyProperty: string): boolean {
        const stickyLadder = this.getStickyLadder();
        const stickyProperties = this.getStickyLadderProperties(this._$columnsConfig[0]);

        if (!stickyLadder) {
            return true;
        }

        const index = stickyProperties.indexOf(stickyProperty);
        const hasMainCell = !!(stickyLadder[stickyProperties[0]].ladderLength);

        if (!this.getOwner().getItemsDragNDrop() && stickyProperty && ladderProperty && stickyProperty !== ladderProperty && (
            index === 1 && !hasMainCell || index === 0 && hasMainCell)) {
            return false;
        }
        return true;
    }

    getLadderWrapperClasses(ladderProperty: string, stickyProperty: string): string {
        let ladderWrapperClasses = 'controls-Grid__row-cell__ladder-content';
        const ladder = this.getLadder();
        const stickyLadder = this.getStickyLadder();
        const stickyProperties = this.getStickyLadderProperties(this._$columnsConfig[0]);
        const index = stickyProperties?.indexOf(stickyProperty);
        const hasMainCell = stickyLadder && !!(stickyLadder[stickyProperties[0]].ladderLength);

        if (stickyProperty && ladderProperty && stickyProperty !== ladderProperty && (
            index === 1 && !hasMainCell || index === 0 && hasMainCell)) {
            ladderWrapperClasses += ' controls-Grid__row-cell__ladder-content_displayNoneForLadder';
        }

        if (stickyProperty === ladderProperty && index === 1 && hasMainCell) {
            ladderWrapperClasses += ' controls-Grid__row-cell__ladder-content_additional-with-main';
        }

        if (!ladder || !ladder[ladderProperty] || (stickyProperty === ladderProperty || !stickyProperty) && ladder[ladderProperty].ladderLength >= 1) {

        } else {
            ladderWrapperClasses += ' controls-Grid__row-cell__ladder-content_hiddenForLadder';
        }
        return ladderWrapperClasses;
    }

    protected _getStickyLadderStyle(column: IColumn, stickyProperty: string): string {
        const stickyLadder = this.getStickyLadder();
        return stickyLadder && stickyLadder[stickyProperty].headingStyle;
    }

    updateLadder(newLadder: TLadderElement<ILadderConfig>, newStickyLadder: TLadderElement<IStickyLadderConfig>): void {
        if (this._$ladder !== newLadder) {
            const isLadderChanged = !isEqual(this._$ladder, newLadder);
            const isStickyLadderChanged = !isEqual(this._$stickyLadder, newStickyLadder);

            if (isLadderChanged || isStickyLadderChanged) {
                this._$ladder = newLadder;
                this._$stickyLadder = newStickyLadder;
                this._reinitializeColumns();
            }
        }
    }

    getLadder(): TLadderElement<ILadderConfig> {
        return this._$ladder;
    }

    getStickyLadder(): TLadderElement<IStickyLadderConfig> {
        return this._$stickyLadder;
    }

    //endregion

    //region Аспект "Ячейки. Создание, обновление, перерисовка, colspan и т.д."
    protected _processStickyLadderCells(addEmptyCellsForStickyLadder: boolean = false,
                                        stickyLadderCellCtor: (new () => Cell) = StickyLadderCell): void {
        // todo Множественный stickyProperties можно поддержать здесь:
        const stickyLadderProperties = this.getStickyLadderProperties(this.getGridColumnsConfig()[0]);
        const stickyLadderCellsCount = stickyLadderProperties && stickyLadderProperties.length || 0;

        // Создание пустых ячеек, для строк, которые никогда не отображают лесенку, но обязаны выводить пустые ячейки
        // для поддержания работоспособности грида
        if (addEmptyCellsForStickyLadder) {
            if (stickyLadderCellsCount) {
                const params = {owner: this, isLadderCell: true, column: {}};
                this._$columnItems.splice(1, 0, new stickyLadderCellCtor(params));
                if (stickyLadderCellsCount === 2) {
                    this._$columnItems = ([new stickyLadderCellCtor(params)] as Array<Cell<T, Row<T>>>).concat(this._$columnItems);
                }
            }
            return;
        }

        const stickyLadderStyleForFirstProperty = stickyLadderProperties &&
            this._getStickyLadderStyle(this.getGridColumnsConfig()[0], stickyLadderProperties[0]);
        const stickyLadderStyleForSecondProperty = stickyLadderProperties && stickyLadderProperties.length === 2 &&
            this._getStickyLadderStyle(this.getGridColumnsConfig()[0], stickyLadderProperties[1]);

        if (stickyLadderStyleForSecondProperty || stickyLadderStyleForFirstProperty) {
            this._$columnItems[0].setHiddenForLadder(true);
        }

        if (stickyLadderStyleForSecondProperty) {
            this._$columnItems.splice(1, 0, new stickyLadderCellCtor({
                ...this._getColumnFactoryParams(this.getGridColumnsConfig()[0], 0),
                owner: this,
                instanceId: `${this.key}_column_secondSticky`,
                wrapperStyle: stickyLadderStyleForSecondProperty,
                contentStyle: `left: -${this.getGridColumnsConfig()[0].width}; right: 0;`,
                stickyProperty: stickyLadderProperties[1],
                isFixed: this.hasColumnScroll(),
                isPointerEventsDisabled: this._$itemActionsPosition === 'outside',
                stickyHeaderZIndex: 1
            }));
        }

        if (stickyLadderStyleForFirstProperty) {
            this._$columnItems = ([
                new stickyLadderCellCtor({
                    ...this._getColumnFactoryParams(this.getGridColumnsConfig()[0], 0),
                    owner: this,
                    instanceId: `${this.key}_column_firstSticky`,
                    wrapperStyle: stickyLadderStyleForFirstProperty,
                    contentStyle: stickyLadderStyleForSecondProperty ? `left: 0; right: -${this.getGridColumnsConfig()[0].width};` : '',
                    stickyProperty: stickyLadderProperties[0],
                    isFixed: this.hasColumnScroll(),
                    isPointerEventsDisabled: this._$itemActionsPosition === 'outside',
                    stickyHeaderZIndex: 2
                })
            ] as Array<Cell<T, Row<T>>>).concat(this._$columnItems);
        }
    }

    getColumns(): Array<Cell<T, Row<T>>> {
        if (!this._$columnItems) {
            this._initializeColumns();
        }
        return this._$columnItems;
    }

    setGridColumnsConfig(columns: TColumns): void {
        this._$gridColumnsConfig = columns;
        this._reinitializeColumns(true);
    }

    getColumnsCount(): number {
        return this.getColumns().length;
    }

    setBackgroundStyle(backgroundStyle: string): void {
        this._$backgroundStyle = backgroundStyle;
        this._reinitializeColumns();
    }

    getBackgroundStyle(): string {
        return this._$backgroundStyle;
    }

    /**
     * Получить индекс ячейки в строке.
     * @param {Cell} cell - Ячейка таблицы.
     * @param {Boolean} [takeIntoAccountColspans=false] - Учитывать ли колспаны ячеек, расположенных до искомой.
     * @returns {Number} Индекс ячейки в строке.
     */
    getColumnIndex(cell: Cell<T, Row<T>>, takeIntoAccountColspans: boolean = false): number {
        const columnItems = this.getColumns();
        let columnItemIndexWithColspan = 0;

        // Ищем индекс ячейки, попутно считаем колспаны предыдущих.
        const columnItemIndex = columnItems.findIndex((columnItem) => {
            if (columnItem.config === cell.config) {
                return true;
            }
            columnItemIndexWithColspan += columnItem.getColspan();
            return false;
        });

        // Отлов внутренних ошибок коллекции.
        if (columnItemIndex === -1) {
            throw Error('Fatal error! Expected column missing in columnItems.');
        }
        return takeIntoAccountColspans ? columnItemIndexWithColspan : columnItemIndex;
    }

    protected _redrawColumns(target: 'first' | 'last' | 'all'): void {
        if (this._$columnItems) {
            switch (target) {
                case 'first':
                    this._$columnItems[0].nextVersion();
                    break;
                case 'last':
                    this._$columnItems[this.getColumnsCount() - 1].nextVersion();
                    break;
                case 'all':
                    this._$columnItems.forEach((column) => column.nextVersion());
                    break;
            }
        }
    }

    protected _reinitializeColumns(lazy: boolean = false): void {
        if (this._$columnItems) {
            this._$columnItems = null;
            if (!lazy) {
                this._initializeColumns();
            }
        }
        this._nextVersion();
    }

    private _$getColspan(column: IColumn, columnIndex: number): TColspanCallbackResult {
        if (this._$rowTemplate) {
            return 'end';
        }
        return this._getColspan(column, columnIndex);
    }

    protected _getColspan(column: IColumn, columnIndex: number): TColspanCallbackResult {
        const colspanCallback = this._$colspanCallback;
        if (colspanCallback) {
            return colspanCallback(this.getContents(), column, columnIndex, this.isEditing());
        }
        return undefined;
    }

    getColumnsFactory(staticOptions?: object): (options: Partial<ICellOptions<T>>) => Cell<T, Row<T>> {
        if (!this._cellModule) {
            throw new Error('Controls/_display/Row:getColumnsFactory can not resolve cell module!');
        }
        return (options) => {
            return create(this._cellModule, {
                owner: this,
                ...(staticOptions || {}),
                ...options
            } as ICellOptions<T>);
        };
    }

    protected _prepareColumnItems(columns: IColspanParams[],
                                  factory: (options: Partial<ICellOptions<T>>) => Cell<T, Row<T>>,
                                  shouldColspanWithMultiselect: boolean,
                                  shouldColspanWithStickyLadderCells: boolean,
                                  skipColumns: boolean = false): Array<Cell<T, Row<T>>> {

        const creatingColumnsParams = [];

        for (
            let columnIndex = 0, resultTotalLength = 0;
            (columnIndex < columns.length) && (skipColumns ? true : (resultTotalLength < this.getGridColumnsConfig().length));
            columnIndex++
        ) {
            const column = columns[columnIndex];
            let colspan = this._$getColspan(column, columnIndex);
            if (colspan === 'end') {
                colspan = this.getGridColumnsConfig().length - columnIndex;
            }
            if (this.hasMultiSelectColumn() && shouldColspanWithMultiselect) {
                colspan++;
            }
            if (shouldColspanWithStickyLadderCells && this.isFullGridSupport()) {
                const stickyLadderProperties = this.getStickyLadderProperties(this.getGridColumnsConfig()[0]);
                const stickyLadderCellsCount = stickyLadderProperties && stickyLadderProperties.length || 0;
                colspan += stickyLadderCellsCount;
            }
            if (skipColumns) {
                if (colspan === 1) {
                    colspan = 0;
                }
                if (colspan) {
                    columnIndex += colspan - 1;
                }
            } else {
                colspan = (colspan || 1);
                resultTotalLength += colspan;
            }
            creatingColumnsParams.push({
                ...this._getColumnFactoryParams(column, columnIndex),
                instanceId: `${this.key}_column_${columnIndex}`,
                colspan: colspan as number,
                isFixed: this.hasColumnScroll() ? ((skipColumns ? columnIndex : resultTotalLength - 1) < this.getStickyColumnsCount()) : false
            });
        }

        if (creatingColumnsParams.length === 1 && this.getGridColumnsConfig().length > 1) {
            creatingColumnsParams[0].isActsAsRowTemplate = true;
            if (this.hasColumnScroll()) {
                creatingColumnsParams[0].isFixed = true;
            }
        }

        // isSingleColspanedCell определяется и ипользуется не так как задумывалась и называется.
        // Флаг должен указывать, что ячейка по своей сути является шаблоном всей строки.
        // При этом не должно играть роли, как прикладной разработчик определил шаблон строки:
        // через rowTemplate или растянув первую ячейку до конца. Сейчас isSingleColspanedCell
        // смотрит на количество колонок не в таблице, а в строке. Флаг стал использоваться неправильно
        // из-за спутаности css классов, сейчас не все классы общие и многие ячейки дублируют логику,
        // например пустое представления. Места использования и css классы будут поправлены по существующей задаче
        // Будет править https://online.sbis.ru/opendoc.html?guid=024784a6-cc47-4d1a-9179-08c897edcf72
        // FIXME: Используйте isActsAsRowTemplate, в случае, если нужно понять, является ли ячейка шаблоном всей строки.
        if (creatingColumnsParams.length === 1 && (this._$rowTemplate || columns.length > 1)) {
            creatingColumnsParams[0].isSingleColspanedCell = true;
            if (this.hasColumnScroll()) {
                creatingColumnsParams[0].isFixed = true;
            }
        }

        if (creatingColumnsParams.length > 0) {
            creatingColumnsParams[0].isFirstDataCell = true;
        }

        return creatingColumnsParams.map((params) => factory(params));
    }

    setColumnsConfig(newColumns: TColumns): void {
        if (this._$rowTemplate) {
            // В данный момент строка выводит контент из rowTemplate. Он актуален, перестроение не требуется.
            // Однако, колонки сохраняются, чтобы при сбросе шаблона строки строка перерисовалась по ним.
            if (this._savedColumns !== newColumns) {
                this._savedColumns = newColumns;
                this._reinitializeColumns(true);
            }
        } else {
            if (this._$columnsConfig !== newColumns) {
                this._$columnsConfig = newColumns;
                this._reinitializeColumns(true);
            }
        }
    }

    resetColumns(): void {
        this._$columnItems = null;
        this._nextVersion();
    }

    setColspanCallback(colspanCallback: TColspanCallback): void {
        this._$colspanCallback = colspanCallback;
        this._reinitializeColumns();
    }

    protected _getColumnFactoryParams(column: IColumn, columnIndex: number): Partial<ICellOptions<T>> {
        return {
            column,
            rowSeparatorSize: this._$rowSeparatorSize,
            columnSeparatorSize: this._getColumnSeparatorSizeForColumn(column, columnIndex),
            backgroundStyle: this._$backgroundStyle,
            isSticked: this.isSticked(),
            shadowVisibility: this.getShadowVisibility(),
            isTopSeparatorEnabled: this._$isTopSeparatorEnabled,
            isBottomSeparatorEnabled: this._$isBottomSeparatorEnabled
        };
    }

    protected _initializeColumns(options: IInitializeColumnsOptions = {shouldAddStickyLadderCells: true, shouldAddMultiSelectCell: true}): void {
        if (this._$columnsConfig) {

            // Заполняем основные ячейки строки (данные), учитывая колспаны.
            this._$columnItems = this._prepareColumnItems(
                this._$columnsConfig,
                this.getColumnsFactory(),
                options.shouldAddMultiSelectCell === false,
                options.shouldAddStickyLadderCells === false,
                options.colspanStrategy === 'skipColumns'
            );

            // Заполняем ячейки для лесенки.
            // TODO: Не работает с колспаннутыми узлами. Нужно чтобы лесенка работала до колспана или сквозь него.
            if (options.shouldAddStickyLadderCells !== false && this.isFullGridSupport()) {
                this._processStickyLadderCells(options.addEmptyCellsForStickyLadder, options.extensionCellsConstructors?.stickyLadderCell);
            }

            // Ячейка под чекбокс множественного выбора.
            if (options.shouldAddMultiSelectCell !== false && this.hasMultiSelectColumn()) {
                const ctor = options.extensionCellsConstructors?.multiSelectCell || CheckboxCell;

                this._$columnItems.unshift(new ctor({
                    owner: this,
                    isFixed: true,
                    instanceId: `${this.key}_column_checkbox`,
                    ...this._getColumnFactoryParams({}, 0)
                }) as Array<Cell<T, Row<T>>>);
            }

            // Ячейка под операции над записью при горизонтальном скролле.
            if (this.hasItemActionsSeparatedCell()) {
                const ctor = options.extensionCellsConstructors?.separatedActionsCell || ItemActionsCell;

                this._$columnItems.push(new ctor({
                    owner: this,
                    instanceId: `${this.key}_column_separated-actions`,
                    // FIXME: Ну как же ноль, если это последняя ячейка.
                    ...this._getColumnFactoryParams({}, 0),
                    column: {}
                }));
            }
        }
    }

    //endregion

    //region TMP. Проброс от owner'a
    hasMultiSelectColumn(): boolean {
        return this._$owner.hasMultiSelectColumn();
    }

    getIndex(): number {
        return this._$owner.getRowIndex(this);
    }

    hasColumnScroll(): boolean {
        return this._$owner.hasColumnScroll();
    }

    getStickyColumnsCount(): number {
        return this._$owner.getStickyColumnsCount();
    }

    setStickyColumnsCount(): void {
        this._reinitializeColumns(true);
    }

    hasItemActionsSeparatedCell(): boolean {
        return this._$owner.hasItemActionsSeparatedCell();
    }

    isFullGridSupport(): boolean {
        return this._$owner.isFullGridSupport();
    }

    getGridColumnsConfig(): TColumns {
        return this._$owner.getGridColumnsConfig();
    }

    getHeaderConfig(): THeader {
        return this._$owner.getHeaderConfig();
    }

    getTopPadding(): string {
        return this._$owner.getTopPadding().toLowerCase();
    }

    getBottomPadding(): string {
        return this._$owner.getBottomPadding().toLowerCase();
    }

    getLeftPadding(): string {
        return this._$owner.getLeftPadding().toLowerCase();
    }

    getRightPadding(): string {
        return this._$owner.getRightPadding().toLowerCase();
    }

    getHoverBackgroundStyle(): string {
        return this._$owner.getHoverBackgroundStyle();
    }

    getEditingBackgroundStyle(): string {
        return this._$owner.getEditingBackgroundStyle();
    }

    hasHeader(): boolean {
        return this._$owner.hasHeader();
    }

    getResultsPosition(): TResultsPosition {
        return this._$owner.getResultsPosition();
    }

    getSearchValue(): string {
        return this.getOwner().getSearchValue();
    }

    editArrowIsVisible(item: EntityModel): boolean {
        return this._$owner.editArrowIsVisible(item);
    }

    //endregion

    //region Аспект "Разделители строк и колонок"
    getColumnSeparatorSize(): TColumnSeparatorSize {
        return this._$columnSeparatorSize;
    }

    setColumnSeparatorSize(columnSeparatorSize: TColumnSeparatorSize): void {
        const changed = this._$columnSeparatorSize !== columnSeparatorSize;
        this._$columnSeparatorSize = columnSeparatorSize;
        if (changed && this._$columnItems) {
            this._updateSeparatorSizeInColumns('Column');
        }
        this._nextVersion();
    }

    protected _updateSeparatorSizeInColumns(separatorName: 'Column' | 'Row'): void {
        const multiSelectOffset = this.hasMultiSelectColumn() ? 1 : 0;
        this._$columnItems.forEach((cell, cellIndex) => {
            const column = cell.config;
            const columnIndex = cellIndex - multiSelectOffset;
            cell[`set${separatorName}SeparatorSize`](
                this[`_get${separatorName}SeparatorSizeForColumn`](column, columnIndex)
            );
        });
    }

    protected _getColumnSeparatorSizeForColumn(column: IColumn, columnIndex: number): TColumnSeparatorSize {
        if (columnIndex > 0) {
            const columns = this.getGridColumnsConfig();
            const previousColumn = columns[columnIndex - 1];
            return this._resolveColumnSeparatorSize(column, previousColumn);
        }
        return null;
    }

    protected _getRowSeparatorSizeForColumn(column: IColumn, columnIndex: number): string {
        return this._$rowSeparatorSize;
    }

    protected _resolveColumnSeparatorSize(currentColumn: IColumn, previousColumn: IColumn): TColumnSeparatorSize {
        let columnSeparatorSize: TColumnSeparatorSize = this.getColumnSeparatorSize();
        if (currentColumn?.columnSeparatorSize?.hasOwnProperty('left')) {
            columnSeparatorSize = currentColumn.columnSeparatorSize.left;
        } else if (previousColumn?.columnSeparatorSize?.hasOwnProperty('right')) {
            columnSeparatorSize = previousColumn.columnSeparatorSize.right;
        }
        return columnSeparatorSize;
    }

    //endregion

    //region Аспект "Шаблон всей строки. Состояние, когда в строке одна ячейка, растянутая на все колонки"

    // todo https://online.sbis.ru/opendoc.html?guid=024784a6-cc47-4d1a-9179-08c897edcf72
    getRowTemplate(): TemplateFunction {
        return this._$rowTemplate;
    }

    setRowTemplate(rowTemplate: TemplateFunction): void {
        if (rowTemplate) {
            // Произошла установка шаблона стрки. Если строка рисовалась по колонкам, сохраним их,
            // чтобы при сбросе шаблона строки вернуться к ним.
            if (!this._$rowTemplate && this._$columnsConfig) {
                this._savedColumns = this._$columnsConfig;
            }
            this._$rowTemplate = rowTemplate;
            this._$columnsConfig = [{
                template: this._$rowTemplate,
                templateOptions: this._$rowTemplateOptions || {}
            }];
        } else if (this._$rowTemplate) {
            this._$rowTemplate = rowTemplate;
            this._$columnsConfig = this._savedColumns ? this._savedColumns : null;
        } else {
            return;
        }

        this._reinitializeColumns(true);
    }

    setRowTemplateOptions(rowTemplateOptions: object): void {
        if (!isEqual(this._$rowTemplateOptions, rowTemplateOptions)) {
            this._$rowTemplateOptions = rowTemplateOptions;
            if (this._$rowTemplate && this._$columnsConfig) {
                this._$columnsConfig[this._$columnsConfig.length - 1].templateOptions = this._$rowTemplateOptions;
            }
            this._reinitializeColumns(true);
        }
    }

    //endregion

    //region Абстрактные методы
    abstract getContents(): T;

    abstract getOwner(): Collection<T>;

    abstract getMultiSelectVisibility(): string;

    abstract getTemplate(): TemplateFunction | string;

    abstract isEditing(): boolean;

    abstract isSelected(): boolean;

    abstract isDragged(): boolean;

    abstract isSticked(): boolean;

    abstract getShadowVisibility(): string;

    protected abstract _getCursorClasses(cursor: string, clickable: boolean): string;

    protected abstract _nextVersion(): void;

    //endregion
}

// Статические свойства базовой строки и опции, которые будут переписаны из опций в всойства строки
Object.assign(Row.prototype, {
    '[Controls/_display/grid/mixins/Row]': true,
    _cellModule: null,
    _$columnsConfig: null,
    _$gridColumnsConfig: null,
    _$rowTemplate: null,
    _$rowTemplateOptions: null,
    _$colspanCallback: null,
    _$columnSeparatorSize: null,
    _$backgroundStyle: 'default',
    _$itemActionsPosition: 'inside',
    _$isBottomSeparatorEnabled: false,
    _$isTopSeparatorEnabled: false,
    _$editingColumnIndex: null
});
