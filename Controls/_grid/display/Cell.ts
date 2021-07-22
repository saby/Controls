import { mixin } from 'Types/util';
import {
    OptionsToPropertyMixin,
    DestroyableMixin,
    InstantiableMixin,
    VersionableMixin,
    IInstantiable,
    IVersionable,
    Model
} from 'Types/entity';
import { TemplateFunction } from 'UI/Base';

import {IColumn, IColspanParams, TColumnSeparatorSize, ICellPadding} from './interface/IColumn';

import {IEditingConfig, IItemPadding, TMarkerClassName} from 'Controls/display';
import { COLUMN_SCROLL_JS_SELECTORS, DRAG_SCROLL_JS_SELECTORS } from 'Controls/columnScroll';

import Row from './Row';

const DEFAULT_CELL_TEMPLATE = 'Controls/grid:ColumnTemplate';
const MONEY_RENDER = 'Controls/grid:MoneyTypeRender';
const NUMBER_RENDER = 'Controls/grid:NumberTypeRender';
const STRING_RENDER = 'Controls/grid:StringTypeRender';
const STRING_SEARCH_RENDER = 'Controls/grid:StringSearchTypeRender';

export interface IOptions<T> extends IColspanParams {
    owner: Row<T>;
    column: IColumn;
    instanceId?: string;
    isHiddenForLadder?: boolean;
    startColumn?: number;
    endColumn?: number;
    colspan?: number;
    isFixed?: boolean;
    isLadderCell?: boolean;
    columnSeparatorSize?: string;
    backgroundStyle?: string;
    isSticked?: boolean;
    shadowVisibility?: string;
    rowSeparatorSize?: string;
    isFirstDataCell?: boolean;
    isTopSeparatorEnabled: boolean;
    isBottomSeparatorEnabled: boolean;
}

export default class Cell<T extends Model, TOwner extends Row<T>> extends mixin<
    DestroyableMixin,
    OptionsToPropertyMixin,
    InstantiableMixin,
    VersionableMixin
>(
    DestroyableMixin,
    OptionsToPropertyMixin,
    InstantiableMixin,
    VersionableMixin
) implements IInstantiable, IVersionable {
    readonly '[Types/_entity/IInstantiable]': boolean;
    protected readonly _defaultCellTemplate: string = DEFAULT_CELL_TEMPLATE;
    protected readonly _$owner: TOwner;
    protected readonly _$column: IColumn;
    protected _$isHiddenForLadder: boolean;
    protected _$instanceId: string;
    protected _$colspan: number;
    protected _$rowspan: number;
    protected _$isFixed: boolean;
    protected _$isSingleColspanedCell: boolean;
    protected _$isActsAsRowTemplate: boolean;
    protected _$isLadderCell: boolean;
    protected _$columnSeparatorSize: TColumnSeparatorSize;
    protected _$rowSeparatorSize: string;
    protected _$isFirstDataCell: boolean;
    protected _$markerPosition: 'left' | 'right';
    protected _$isSticked: boolean;
    protected _$backgroundStyle: string;
    protected _$shadowVisibility?: string;
    protected _$isTopSeparatorEnabled?: string;
    protected _$isBottomSeparatorEnabled?: string;

    constructor(options?: IOptions<T>) {
        super();
        OptionsToPropertyMixin.call(this, options);
    }

    get shadowVisibility(): string {
        return this._$shadowVisibility;
    }

    getTemplate(): TemplateFunction | string {
        return this._$column.template || this._defaultCellTemplate;
    }

    hasCellContentRender(): boolean {
        return Boolean(
            this._$column.displayType ||
            this._$column.textOverflow ||
            this._$column.fontColorStyle ||
            this._$column.fontSize ||
            this.getSearchValue()
        );
    }

    getCellContentRender(): string {
        if (this.getSearchValue() &&
            this.getDisplayValue() &&
            this._$column.displayTypeOptions?.searchHighlight !== false) {
            return STRING_SEARCH_RENDER;
        }

        switch (this._$column.displayType) {
            case 'money': return MONEY_RENDER;
            case 'number': return NUMBER_RENDER;
            default: return STRING_RENDER;
        }
    }

    shouldDisplayItemActions(): boolean {
        if (this._$owner.hasItemActionsSeparatedCell()) {
            return false;
        }
        return this.isLastColumn() && (this._$owner.hasVisibleActions() || this._$owner.isEditing());
    }

    nextVersion(): void {
        this._nextVersion();
    }

    getOwner(): TOwner {
        return this._$owner;
    }

    getSearchValue(): string {
        return this.getOwner().getSearchValue();
    }

    getRowSeparatorSize(): string {
        return this._$rowSeparatorSize;
    }

    isEditing(): boolean {
        return false;
    }

    getEditingConfig(): IEditingConfig {
        return this._$owner.getEditingConfig();
    }

    // region Аспект "Colspan. Объединение ячеек по горизонтали"

    /**
     * Получить значение колспана для данной ячейки.
     * @return {Number} значение колспана для данной ячейки.
     */
    getColspan(): number {
        return this._$colspan || 1;
    }

    /**
     * Получить индексы начальной и конечной границы ячайки строки в контексте CssGridLayout.
     * @remark В CssGridLayout индексы границ начинаются с единицы.
     * @return {IColspanParams} индексы начальной и конечной границы ячайки.
     */
    // TODO: Нужно либо переименовать(чтобы было понятно что только для CssGrid),
    //  либо изменить метод(чтобы валидно работал для всех браузеров).
    protected _getColspanParams(): IColspanParams {
        if (this._$colspan) {
            const startColumn = this.getColumnIndex(true) + 1;
            const endColumn = startColumn + this._$colspan;
            return {
                startColumn,
                endColumn
            };
        }
    }

    /**
     * Получить стиль для колспана ячейки в CSSGridLayout.
     * @remark Для браузеров, не поддерживающих CSS Grid Layout, где Controls/grid:View для отрисовки использует HTMLTable,
     * метод возвращает пустую строку. В таком случае, для растягивания ячеек следует использовать метод {@link getColspan}.
     * @return {String} Стиль для колспана ячейки. Формат строки: gridColumn: x / y;
     * @see getColspan
     */
    getColspanStyles(): string {
        if (!this._$owner.isFullGridSupport()) {
            return '';
        }
        const colspanParams = this._getColspanParams();
        if (!colspanParams) {
            return '';
        }
        return `grid-column: ${colspanParams.startColumn} / ${colspanParams.endColumn};`;
    }
    // endregion

    getRowspan(): number {
        return this._$rowspan || 1;
    }

    getRowspanStyles(): string {
        return '';
    }

    // region Аспект "Лесенка"
    setHiddenForLadder(value: boolean): void {
        this._$isHiddenForLadder = value;
    }
    // endregion

    // region Аспект "Отображение данных"
    getDisplayProperty(): string {
        return this._$column.displayProperty;
    }

    getDisplayValue(): string {
        return this.getContents().get(this.getDisplayProperty());
    }

    getTooltipProperty(): string {
        return this._$column.tooltipProperty;
    }

    getContents(): T {
        return this._$owner.getContents();
    }

    get contents(): T {
        return this._$owner.getContents();
    }
    // endregion

    // region Аспект "Стилевое оформление. Классы и стили"
    getWrapperClasses(theme: string,
                      backgroundColorStyle: string,
                      style: string = 'default',
                      templateHighlightOnHover?: boolean,
                      templateHoverBackgroundStyle?: string): string {
        const hasColumnScroll = this._$owner.hasColumnScroll();
        const hoverBackgroundStyle = this._$column.hoverBackgroundStyle ||
            templateHoverBackgroundStyle || this._$owner.getHoverBackgroundStyle();

        let wrapperClasses = '';

        wrapperClasses += this._getWrapperBaseClasses(theme, style, templateHighlightOnHover);
        wrapperClasses += this._getWrapperSeparatorClasses(theme);

        if (hasColumnScroll) {
        } else {
            wrapperClasses += ' controls-Grid__cell_fit';
        }

        if (this.isEditing()) {
            wrapperClasses += ' controls-Grid__row-cell-editing';
        }

        wrapperClasses += ` ${this._getBackgroundColorWrapperClasses(theme, style, backgroundColorStyle, templateHighlightOnHover, hoverBackgroundStyle)}`;

        if (this._$owner.hasColumnScroll()) {
            wrapperClasses += ` ${this._getColumnScrollWrapperClasses(theme)}`;
        }

        wrapperClasses += ' js-controls-ListView__measurableContainer';

        return wrapperClasses;
    }

    protected _getBackgroundColorWrapperClasses(
       theme: string,
       style: string = 'default',
       backgroundColorStyle?: string,
       templateHighlightOnHover?: boolean,
       hoverBackgroundStyle?: string
    ): string {
        let wrapperClasses = '';

        const isCellEditMode = this._$owner.getEditingConfig()?.mode === 'cell';

        if (this.isEditing() && !isCellEditMode) {
            const editingBackgroundStyle = this._$owner.getEditingBackgroundStyle();
            return ` controls-Grid__row-cell-background-editing_${editingBackgroundStyle} `;
        }

        if (templateHighlightOnHover !== false && hoverBackgroundStyle !== 'transparent' && !isCellEditMode) {
            wrapperClasses += ` controls-Grid__row-cell-background-hover-${hoverBackgroundStyle} `;
        }

        const hasColumnScroll = this.getOwner().hasColumnScroll();

        // backgroundColorStyle имеет наивысший приоритет после isEditing
        if (backgroundColorStyle && backgroundColorStyle !== 'default') {
            wrapperClasses += ` controls-Grid__row-cell_background_${backgroundColorStyle}`;

        // Если на списке есть скролл колонок или ячейка застикана, то ей надо выставить backgroundStyle
        // Сюда же попадаем, если backgroundColorStyle = default
        } else if (hasColumnScroll || this._$isSticked) {
            wrapperClasses += this._getControlsBackgroundClass(style, backgroundColorStyle);
        }
        return wrapperClasses;
    }

    // Вынес в отдельный метод, чтобы не проверять editing для header/footer/results
    protected _getControlsBackgroundClass(style: string = 'default',
                                          backgroundColorStyle: string): string {
        let wrapperClasses = '';
        if (backgroundColorStyle) {
            wrapperClasses += ` controls-background-${backgroundColorStyle}`;
        }
        if (this._$backgroundStyle === 'default' && style !== 'default') {
            wrapperClasses += ` controls-background-${style}`;

        } else {
            wrapperClasses += ` controls-background-${this._$backgroundStyle || style}`;
        }
        return wrapperClasses;
    }

    // Only for partial grid support
    getRelativeCellWrapperClasses(): string {
        const rowSeparatorSize = this._$rowSeparatorSize;

        // Единственная ячейка с данными сама формирует высоту строки и не нужно применять хак для растягивания контента ячеек по высоте ячеек.
        // Подробнее искать по #grid_relativeCell_td.
        const shouldFixAlignment = this._$owner.getColumns().length === (this._$owner.hasMultiSelectColumn() ? 2 : 1);

        return 'controls-Grid__table__relative-cell-wrapper ' +
            `controls-Grid__table__relative-cell-wrapper_rowSeparator-${rowSeparatorSize} ` +
            (shouldFixAlignment ? 'controls-Grid__table__relative-cell-wrapper_singleCell' : '');
    }

    // Only for partial grid support
    getRelativeCellWrapperStyles(): string {
        let styles = '';
        if (this._$owner.hasColumnScroll() && this._$isFixed) {
            const width = this.config.compatibleWidth || this.config.width || '';
            if (width.endsWith('px')) {
                styles += `max-width: ${width};`;
            }
        }
        return styles;
    }

    getWrapperStyles(): string {
        let styles = '';
        if (this._$owner.isFullGridSupport()) {
            styles += this.getColspanStyles();
        }
        return styles;
    }

    getContentClasses(theme: string,
                      backgroundColorStyle: string = this._$column.backgroundColorStyle,
                      cursor: string = 'pointer',
                      templateHighlightOnHover: boolean = true): string {
        const hoverBackgroundStyle = this._$column.hoverBackgroundStyle || this._$owner.getHoverBackgroundStyle();

        // TODO: Убрать js-controls-ListView__editingTarget' по задаче
        //  https://online.sbis.ru/opendoc.html?guid=deef0d24-dd6a-4e24-8782-5092e949a3d9
        let contentClasses = 'controls-Grid__row-cell__content js-controls-ListView__editingTarget';

        contentClasses += ' controls-Grid__row-cell__content_baseline_default';
        contentClasses += ` controls-Grid__row-cell_cursor-${cursor}`;

        contentClasses += this._getHorizontalPaddingClasses(this._$column.cellPadding);
        contentClasses += this._getVerticalPaddingClasses(theme);

        contentClasses += ' controls-Grid__row-cell_withoutRowSeparator_size-null';

        contentClasses += this._getContentAlignClasses();

        if (this._$isHiddenForLadder) {
            contentClasses += ' controls-Grid__row-cell__content_hiddenForLadder';

            // Для лесенки критична установка этого стиля именно в Content
            contentClasses += ` controls-background-${this._$backgroundStyle}`;
        }

        if (this.getOwner().getStickyLadder()) {
            // Во время днд отключаем лесенку, а контент отображаем принудительно с помощью visibility: visible
            contentClasses += ' controls-Grid__row-cell__content_ladderHeader';
        }

        if (backgroundColorStyle) {
            contentClasses += ` controls-Grid__row-cell__content_background_${backgroundColorStyle}`;
        }

        if (templateHighlightOnHover !== false &&
            hoverBackgroundStyle !== 'transparent' &&
            this._$owner.getEditingConfig()?.mode !== 'cell') {
            contentClasses += ` controls-Grid__item_background-hover_${hoverBackgroundStyle}`;
        }

        if (this.getOwner().isDragged()) {
            contentClasses += ' controls-ListView__itemContent_dragging';
        }

        return contentClasses;
    }

    getContentStyles(): string {
        return '';
    }

    getZIndex(): number {
        return 2;
    }

    setColumnSeparatorSize(columnSeparatorSize: TColumnSeparatorSize): void {
        this._$columnSeparatorSize = columnSeparatorSize;
        this._nextVersion();
    }

    setRowSeparatorSize(rowSeparatorSize: string): void {
        this._$rowSeparatorSize = rowSeparatorSize;
        this._nextVersion();
    }

    protected _getWrapperBaseClasses(theme: string, style: string, templateHighlightOnHover: boolean): string {
        let classes = '';

        const topPadding = this._$owner.getTopPadding();
        const bottomPadding = this._$owner.getBottomPadding();
        const isEditing = this.isEditing();
        const isSingleCellEditing = this._$owner.getEditingConfig()?.mode === 'cell';
        const isDragged = this._$owner.isDragged();
        const preparedStyle = style;
        const editingBackgroundStyle = this._$owner.getEditingBackgroundStyle();

        classes += ` controls-Grid__row-cell controls-Grid__cell_${preparedStyle}`;
        classes += ` controls-Grid__row-cell_${preparedStyle}`;

        if (isEditing && !isSingleCellEditing) {
            classes += ' controls-ListView__item_editing';
            classes += ` controls-ListView__item_background-editing_${editingBackgroundStyle}`;
        }

        if (isDragged) {
            classes += ' controls-ListView__item_dragging';
        }

        if (this._$owner.isActive() && templateHighlightOnHover !== false) {
            classes += ' controls-GridView__item_active';
        }

        if (topPadding === 'null' && bottomPadding === 'null') {
            classes += ' controls-Grid__row-cell_small_min_height';
        } else {
            classes += ' controls-Grid__row-cell_default_min_height';
        }

        return classes;
    }

    // @TODO https://online.sbis.ru/opendoc.html?guid=907731fd-b8a8-4b58-8958-61b5c8090188
    protected _getWrapperSeparatorClasses(theme: string): string {
        const rowSeparatorSize = this._$rowSeparatorSize;
        let classes = '';

        if (rowSeparatorSize) {
            if (this._$isTopSeparatorEnabled) {
                classes += ` controls-Grid__row-cell_withRowSeparator_size-${rowSeparatorSize}`;
                classes += ` controls-Grid__rowSeparator_size-${rowSeparatorSize}`;
            }

            if (this._$isBottomSeparatorEnabled) {
                classes += ` controls-Grid__rowSeparator_bottom_size-${rowSeparatorSize}`;
            }
        }
        if (!rowSeparatorSize || !this._$isTopSeparatorEnabled) {
            // Вспомогательные классы, вешаются на ячейку. Обеспечивают отсутствие "скачков" при смене rowSeparatorSize.
            classes += ' controls-Grid__no-rowSeparator';
            classes += ' controls-Grid__row-cell_withRowSeparator_size-null';
        }

        classes += this._getColumnSeparatorClasses(theme);
        return classes;
    }

    protected _getColumnSeparatorClasses(theme: string): string {
        if (this.getColumnIndex() > (this._$owner.hasMultiSelectColumn() ? 1 : 0)) {
            const columnSeparatorSize = typeof this._$columnSeparatorSize === 'string' ?
                this._$columnSeparatorSize.toLowerCase() :
                null;
            return ` controls-Grid__columnSeparator_size-${columnSeparatorSize}`;
        }
        return '';
    }

    protected _getColumnScrollWrapperClasses(): string {
        if (this._$isFixed) {
            return ` ${COLUMN_SCROLL_JS_SELECTORS.FIXED_ELEMENT} ${DRAG_SCROLL_JS_SELECTORS.NOT_DRAG_SCROLLABLE} controls-GridView__cell_fixed`;
        }
        return ` ${COLUMN_SCROLL_JS_SELECTORS.SCROLLABLE_ELEMENT}`;
    }

    protected _getHorizontalPaddingClasses(cellPadding: ICellPadding): string {
        let classes = '';

        const leftPadding = this._$owner.getLeftPadding();
        const rightPadding = this._$owner.getRightPadding();
        const isFirstColumnAfterCheckbox = this.getColumnIndex() === 1 && this._$owner.hasMultiSelectColumn();

        if (!this._$owner.hasMultiSelectColumn() && this.isFirstColumn()) {
            classes += ` controls-Grid__cell_spacingFirstCol_${leftPadding}`;
        } else if (!this.isFirstColumn() && !isFirstColumnAfterCheckbox) {
            classes += ' controls-Grid__cell_spacingLeft';
            if (cellPadding?.left) {
                classes += `_${cellPadding.left.toLowerCase()}`;
            }
        }

        if (!this.isLastColumn()) {
            classes += ' controls-Grid__cell_spacingRight';
            if (cellPadding?.right) {
                classes += `_${cellPadding.right.toLowerCase()}`;
            }
        } else {
            classes += ` controls-Grid__cell_spacingLastCol_${rightPadding}`;
        }

        return classes;
    }

    protected _getVerticalPaddingClasses(theme: string): string {
        let classes = '';

        const topPadding = this._$owner.getTopPadding();
        const bottomPadding = this._$owner.getBottomPadding();

        // top <-> bottom
        classes += ` controls-Grid__row-cell_rowSpacingTop_${topPadding}`;
        classes += ` controls-Grid__row-cell_rowSpacingBottom_${bottomPadding}`;

        return classes;
    }

    protected _getContentAlignClasses(): string {
        let classes = '';
        if (this._$column.align) {
            classes += ` controls-Grid__row-cell__content_halign_${this._$column.align}`;
        }

        if (this._$column.valign) {
            classes += ` controls-Grid__cell_valign_${this._$column.valign} controls-Grid__cell-content_full-height`;
        }
        return classes;
    }
    // endregion

    // region Аспект "Ячейка"

    get config(): IColumn {
        return this._$column;
    }

    getColumnConfig(): IColumn {
        return this.config;
    }

    /**
     * Получить индекс данной ячейки в строке.
     * @param {Boolean} [takeIntoAccountColspans=false] - Учитывать ли колспаны ячеек, расположенных перед данной в строке.
     * @returns {Number} Индекс ячейки в строке.
     */
    getColumnIndex(takeIntoAccountColspans?: boolean = false): number {
        return this._$owner.getColumnIndex(this, takeIntoAccountColspans);
    }

    isLadderCell(): boolean {
        return false;
    }

    isFirstColumn(): boolean {
        return this.getColumnIndex() === 0;
    }

    isLastColumn(): boolean {
        let dataColumnsCount = this._$owner.getColumnsCount() - 1;
        if (this._$owner.hasItemActionsSeparatedCell()) {
            dataColumnsCount -= 1;
        }
        return this.getColumnIndex() === dataColumnsCount;
    }

    // endregion

    // region Аспект "Множественный выбор"
    isMultiSelectColumn(): boolean {
        return this._$owner.hasMultiSelectColumn() && this.isFirstColumn();
    }
    // endregion

    // region Аспект "Маркер"

    // По умолчанию для абстрактной ячейки маркер отключен.
    shouldDisplayMarker(marker: boolean): boolean {
        return false;
    }

    getMarkerClasses(theme: string,
                     style: string = 'default',
                     markerClassName: TMarkerClassName = 'default',
                     itemPadding: IItemPadding = {}): string {
        return this._$owner.getMarkerClasses(theme, style, markerClassName, itemPadding);
    }

    getMarkerPosition(): 'left' | 'right' {
        return this._$markerPosition;
    }
    // endregion

    // region Аспект "Тег"

    /**
     * Возвращает флаг, что надо или не надо показывать тег
     * @param tagStyle
     */
    shouldDisplayTag(tagStyle?: string): boolean {
        return false;
    }

    // endregion

    // region Аспект "Кнопка редактирования"

    shouldDisplayEditArrow(contentTemplate?: TemplateFunction): boolean {
        return false;
    }

    getInstanceId(): string {
        return this._$instanceId || super.getInstanceId();
    }

    // endregion
}

Object.assign(Cell.prototype, {
    '[Controls/_display/grid/Cell]': true,
    _moduleName: 'Controls/grid:GridCell',
    _instancePrefix: 'grid-cell-',
    _$owner: null,
    _$column: null,
    _$colspan: null,
    _$rowspan: null,
    _$instanceId: null,
    _$isFirstDataCell: false,
    _$rowSeparatorSize: null,
    _$columnSeparatorSize: null,
    _$markerPosition: undefined,
    _$backgroundStyle: 'default',
    _$isSticked: null,
    _$shadowVisibility: 'lastVisible',

    _$isFixed: null,
    _$isSingleColspanedCell: null,
    _$isActsAsRowTemplate: null,
    _$isLadderCell: null,
    _$isHiddenForLadder: null,
    _$isTopSeparatorEnabled: false,
    _$isBottomSeparatorEnabled: false
});
