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

import { IColumn, IColspanParams, TColumnSeparatorSize } from 'Controls/interface';

import { IItemPadding, TMarkerClassName } from 'Controls/display';
import { COLUMN_SCROLL_JS_SELECTORS } from 'Controls/columnScroll';

import Row from './Row';

const DEFAULT_CELL_TEMPLATE = 'Controls/gridNew:ColumnTemplate';
const MONEY_RENDER = 'Controls/gridNew:MoneyTypeRender';
const NUMBER_RENDER = 'Controls/gridNew:NumberTypeRender';
const STRING_RENDER = 'Controls/gridNew:StringTypeRender';
const STRING_SEARCH_RENDER = 'Controls/gridNew:StringSearchTypeRender';

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
    rowSeparatorSize?: string;
    backgroundStyle: string;
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
    protected _$isFixed: boolean;
    protected _$isSingleCell: boolean;
    protected _$isLadderCell: boolean;
    protected _$columnSeparatorSize: TColumnSeparatorSize;
    protected _$rowSeparatorSize: string;
    protected _$markerPosition: 'left' | 'right';
    protected _$backgroundStyle: string;

    constructor(options?: IOptions<T>) {
        super();
        OptionsToPropertyMixin.call(this, options);
    }

    getTemplate(multiSelectTemplate?: TemplateFunction): TemplateFunction | string {
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
        if (this.getSearchValue() && this.getDisplayValue()) {
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
        return 1;
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
    getWrapperClasses(theme: string, backgroundColorStyle: string, style: string = 'default', templateHighlightOnHover: boolean): string {
        const hasColumnScroll = this._$owner.hasColumnScroll();
        const hoverBackgroundStyle = this._$owner.getHoverBackgroundStyle();

        let wrapperClasses = '';

        wrapperClasses += this._getWrapperBaseClasses(theme, style, templateHighlightOnHover);
        wrapperClasses += this._getWrapperSeparatorClasses(theme);

        if (hasColumnScroll) {
        } else {
            wrapperClasses += ' controls-Grid__cell_fit';
        }

        if (this._$owner.isEditing()) {
            wrapperClasses += ' controls-Grid__row-cell-editing';
        }

        wrapperClasses += ` ${this._getBackgroundColorWrapperClasses(theme, style, templateHighlightOnHover, backgroundColorStyle, hoverBackgroundStyle)}`;

        if (this._$owner.hasColumnScroll()) {
            wrapperClasses += ` ${this._getColumnScrollWrapperClasses(theme)}`;
        }

        return wrapperClasses;
    }

    protected _getBackgroundColorWrapperClasses(
       theme: string,
       style: string,
       templateHighlightOnHover?: boolean,
       backgroundColorStyle?: string,
       hoverBackgroundStyle?: string
    ): string {
        let wrapperClasses = '';
        const isSingleCellEditableMode = this._$owner.getEditingConfig()?.mode === 'cell';
        if (!isSingleCellEditableMode) {
            if (this._$owner.isEditing()) {
                const editingBackgroundStyle = this._$owner.getEditingBackgroundStyle();
                wrapperClasses += ` controls-Grid__row-cell-background-editing_${editingBackgroundStyle} `;
            } else {
                // Если в шаблоне установили стиль для строки или колонки
                if (backgroundColorStyle && backgroundColorStyle !== 'default') {
                    wrapperClasses += ` controls-Grid__row-cell_background_${backgroundColorStyle} `;
                }

                // Если  шаблоне установили любой стиль для строки или колонки, или зафиксирована колонка
                if (backgroundColorStyle || (this.getOwner().hasColumnScroll() && this._$isFixed)) {
                    wrapperClasses += ` controls-background-${this._resolveBackgroundStyle(backgroundColorStyle, style)}`;
                }

                // Если есть подсветка по ховеру
                if (templateHighlightOnHover !== false) {
                    wrapperClasses += ` controls-Grid__row-cell-background-hover-${hoverBackgroundStyle} `;
                }
            }
        }
        return wrapperClasses;
    }

    private _resolveBackgroundStyle(backgroundColorStyle: string = 'default', style: string = 'default'): string {
        let result: string;
        // Если указан backgroundColorStyle, он должен быть и тут
        if (backgroundColorStyle !== 'default') {
            result = backgroundColorStyle;

        // Если стиль списка default, но указан backgroundStyle, то возвращаем backgroundStyle
        } else if (style === 'default' && this._$backgroundStyle !== 'default') {
            result = this._$backgroundStyle;

        // Если стиль списка не default, то он имеет больший приоритет, чем backgroundStyle
        } else {
            result = style;
        }
        return result;
    }

    // Only for partial grid support
    getRelativeCellWrapperClasses(theme: string): string {
        const rowSeparatorSize = this._$rowSeparatorSize;

        // Единственная ячейка с данными сама формирует высоту строки и не нужно применять хак для растягивания контента ячеек по высоте ячеек.
        // Подробнее искать по #grid_relativeCell_td.
        const shouldFixAlignment = this._$owner.getColumns().length === (this._$owner.hasMultiSelectColumn() ? 2 : 1);

        return 'controls-Grid__table__relative-cell-wrapper ' +
            `controls-Grid__table__relative-cell-wrapper_rowSeparator-${rowSeparatorSize} ` +
            (shouldFixAlignment ? 'controls-Grid__table__relative-cell-wrapper_singleCell' : '');
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

        let contentClasses = 'controls-Grid__row-cell__content';

        contentClasses += ' controls-Grid__row-cell__content_baseline_default';
        contentClasses += ` controls-Grid__row-cell_cursor-${cursor}`;

        contentClasses += this._getHorizontalPaddingClasses(theme);
        contentClasses += this._getVerticalPaddingClasses(theme);

        contentClasses += ' controls-Grid__row-cell_withoutRowSeparator_size-null';

        contentClasses += this._getContentAlignClasses();

        // todo Чтобы работало многоточие - нужна ещё одна обертка над contentTemplate. Задача пересекается с настройкой
        //      шаблона колонки (например, cursor на демо CellNoClickable)
        if (this._$column.textOverflow) {
            contentClasses += ` controls-Grid__cell_${this._$column.textOverflow}`;
        }

        if (this._$isHiddenForLadder) {
            contentClasses += ' controls-Grid__row-cell__content_hiddenForLadder';
            // Фон лесенки должен быть именно у контента, т.к. класс hiddenForLadder задаёт необходимыйц z-index
            contentClasses += ` controls-background-${this._resolveBackgroundStyle(backgroundColorStyle)}`;
        }

        if (backgroundColorStyle) {
            contentClasses += ` controls-Grid__row-cell__content_background_${backgroundColorStyle}`;
        }

        if (templateHighlightOnHover !== false && this._$owner.getEditingConfig()?.mode !== 'cell') {
            contentClasses += ` controls-Grid__item_background-hover_${hoverBackgroundStyle}`;
        }

        if (this.getOwner().isDragged()) {
            contentClasses += ' controls-ListView__itemContent_dragging';
        }

        contentClasses += ' js-controls-ListView__measurableContainer';

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
        const isEditing = this._$owner.isEditing();
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

    protected _getWrapperSeparatorClasses(theme: string): string {
        const rowSeparatorSize = this._$rowSeparatorSize;
        let classes = '';

        if (rowSeparatorSize) {
            classes += ` controls-Grid__row-cell_withRowSeparator_size-${rowSeparatorSize}`;
            classes += ` controls-Grid__rowSeparator_size-${rowSeparatorSize}`;
        } else {
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

    protected _getColumnScrollWrapperClasses(theme: string): string {
        if (this._$isFixed) {
            return `${COLUMN_SCROLL_JS_SELECTORS.FIXED_ELEMENT} js-controls-ColumnScroll__notDraggable controls-GridNew__cell_fixed`;
        }
        return COLUMN_SCROLL_JS_SELECTORS.SCROLLABLE_ELEMENT;
    }

    protected _getHorizontalPaddingClasses(theme: string): string {
        let classes = '';

        const leftPadding = this._$owner.getLeftPadding();
        const rightPadding = this._$owner.getRightPadding();

        // left <-> right
        const cellPadding = this._$column.cellPadding;

        const isFirstColumnAfterCheckbox = this.getColumnIndex() === 1 && this._$owner.hasMultiSelectColumn();
        if (this._$owner.getMultiSelectVisibility() === 'hidden' && this.isFirstColumn()) {
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
    _moduleName: 'Controls/gridNew:GridCell',
    _instancePrefix: 'grid-cell-',
    _$owner: null,
    _$column: null,
    _$colspan: null,
    _$instanceId: null,
    _$rowSeparatorSize: null,
    _$columnSeparatorSize: null,
    _$markerPosition: undefined,
    _$backgroundStyle: 'default',
    _$isFixed: null,
    _$isSingleCell: null,
    _$isLadderCell: null,
    _$isHiddenForLadder: null
});
