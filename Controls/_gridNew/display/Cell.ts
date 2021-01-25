import { mixin } from 'Types/util';
import {
    OptionsToPropertyMixin,
    DestroyableMixin,
    InstantiableMixin,
    VersionableMixin,
    IInstantiable,
    IVersionable
} from 'Types/entity';
import { TemplateFunction } from 'UI/Base';

import { IColumn, IColspanParams, IRowspanParams, TColumnSeparatorSize } from 'Controls/grid';

import {TMarkerClassName} from 'Controls/_grid/interface/ColumnTemplate';
import {IItemPadding} from 'Controls/_list/interface/IList';
import {COLUMN_SCROLL_JS_SELECTORS} from 'Controls/columnScroll';

import Row from './Row';

const DEFAULT_CELL_TEMPLATE = 'Controls/gridNew:ColumnTemplate';
const MONEY_RENDER = 'Controls/gridNew:MoneyTypeRender';
const NUMBER_RENDER = 'Controls/gridNew:NumberTypeRender';
const STRING_RENDER = 'Controls/gridNew:StringTypeRender';

export interface IOptions<T> extends IColspanParams, IRowspanParams {
    owner: Row<T>;
    column: IColumn;
    instanceId?: string;
    hiddenForLadder?: boolean;
    startColumn?: number;
    endColumn?: number;
    colspan?: number;
    isFixed?: boolean;
    ladderCell?: boolean;
    columnSeparatorSize?: string;
    rowSeparatorSize?: string;
}

export default class Cell<T, TOwner extends Row<T>> extends mixin<
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
    protected _$owner: TOwner;
    protected _$column: IColumn;
    protected _$hiddenForLadder: boolean;
    protected _$startColumn: number;
    protected _$endColumn: number;
    protected _$instanceId: string;
    protected _$colspan: number;
    protected _$isFixed: boolean;
    protected _$ladderCell: boolean;
    protected _$columnSeparatorSize: TColumnSeparatorSize;
    protected _$rowSeparatorSize: string;

    constructor(options?: IOptions<T>) {
        super();
        OptionsToPropertyMixin.call(this, options);
    }

    getTemplate(multiSelectTemplate?: TemplateFunction): TemplateFunction|string {
        return this._$column.template || DEFAULT_CELL_TEMPLATE;
    }

    hasCellContentRender(): boolean {
        return Boolean(
            this._$column.displayType ||
            this._$column.textOverflow ||
            this._$column.fontColorStyle ||
            this._$column.fontSize
        );
    }

    getCellContentRender(): string {
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

    // region Аспект "Объединение колонок"
    _getColspanParams(): IColspanParams {
        if (this._$colspan) {
            const startColumn = this.getColumnIndex() + 1;
            const endColumn = startColumn + this._$colspan;
            return {
                startColumn,
                endColumn
            };
        }
    }

    getColspan(): string {
        const colspanParams = this._getColspanParams();
        if (!colspanParams) {
            return '';
        }
        if (!this._$owner.isFullGridSupport()) {
            return '' + this._$colspan;
        }
        return `grid-column: ${colspanParams.startColumn} / ${colspanParams.endColumn};`;
    }

    getRowspan(): string {
        return '';
    }
    // endregion

    // region Аспект "Лесенка"
    setHiddenForLadder(value: boolean): void {
        this._$hiddenForLadder = value;
    }
    // endregion

    // region Аспект "Отображение данных"
    getDisplayProperty(): string {
        return this._$column.displayProperty;
    }

    getContents(): T {
        return this._$owner.getContents();
    }

    get contents(): T {
        return this._$owner.getContents();
    }
    // endregion

    // region Аспект "Стилевое оформление"
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
            wrapperClasses += ` controls-Grid__row-cell-editing_theme-${theme}`;
        }

        wrapperClasses += ` ${this._getBackgroundColorWrapperClasses(theme, templateHighlightOnHover, backgroundColorStyle, hoverBackgroundStyle)}`;

        if (this._$owner.hasColumnScroll()) {
            wrapperClasses += ` ${this._getColumnScrollWrapperClasses(theme)}`;

        }

        return wrapperClasses;
    }

    protected _getBackgroundColorColumnScrollClasses(backgroundColorStyle: string, theme: string): string {
        // TODO: Брать от родителя
        // return options.backgroundStyle || options.style || 'default';
        return `controls-background-${'default'}_theme-${theme}`;
    }
    protected _getBackgroundColorWrapperClasses(
       theme: string,
       templateHighlightOnHover?: boolean,
       backgroundColorStyle?: string,
       hoverBackgroundStyle?: string
    ): string {
        let wrapperClasses = '';
        if (this._$owner.isEditing()) {
            const editingBackgroundStyle = this._$owner.getEditingBackgroundStyle();
            wrapperClasses += ` controls-Grid__row-cell-background-editing_${editingBackgroundStyle}_theme-${theme} `;
        } else if (templateHighlightOnHover !== false) {
            wrapperClasses += `controls-Grid__row-cell-background-hover-${hoverBackgroundStyle}_theme-${theme} `;

            if (backgroundColorStyle !== 'default') {
                wrapperClasses += `controls-Grid__row-cell_background_${backgroundColorStyle}_theme-${theme} `;
            }
            if (this._$owner.hasColumnScroll()) {
                wrapperClasses += ` ${this._getBackgroundColorColumnScrollClasses(backgroundColorStyle, theme)}`;
            }
        }
        return wrapperClasses;
    }

    // Only for partial grid support
    getRelativeCellWrapperClasses(theme: string): string {
        const rowSeparatorSize = this._$rowSeparatorSize;

        // Единственная ячейка с данными сама формирует высоту строки и не нужно применять хак для растягивания контента ячеек по высоте ячеек.
        // Подробнее искать по #grid_relativeCell_td.
        const shouldFixAlignment = this._$owner.getColumns().length === (this._$owner.hasMultiSelectColumn() ? 2 : 1);

        return 'controls-Grid__table__relative-cell-wrapper ' +
            `controls-Grid__table__relative-cell-wrapper_rowSeparator-${rowSeparatorSize}_theme-${theme} ` +
            (shouldFixAlignment ? 'controls-Grid__table__relative-cell-wrapper_singleCell' : '');
    }

    getWrapperStyles(): string {
        let styles = '';
        if (this._$owner.isFullGridSupport()) {
            styles += this.getColspan();
        }
        return styles;
    }

    getContentClasses(theme: string,
                      backgroundColorStyle: string = this._$column.backgroundColorStyle,
                      cursor: string = 'pointer',
                      templateHighlightOnHover: boolean = true): string {
        const hoverBackgroundStyle = this._$column.hoverBackgroundStyle || this._$owner.getHoverBackgroundStyle();

        let contentClasses = 'controls-Grid__row-cell__content';

        contentClasses += ` controls-Grid__row-cell__content_baseline_default_theme-${theme}`;
        contentClasses += ` controls-Grid__row-cell_cursor-${cursor}`;

        contentClasses += this._getContentPaddingClasses(theme);

        contentClasses += ' controls-Grid__row-cell_withoutRowSeparator_size-null_theme-default';

        if (this._$column.align) {
            contentClasses += ` controls-Grid__row-cell__content_halign_${this._$column.align}`;
        }

        if (this._$column.valign) {
            contentClasses += ` controls-Grid__cell_valign_${this._$column.valign} controls-Grid__cell-content_full-height`;
        }

        // todo Чтобы работало многоточие - нужна ещё одна обертка над contentTemplate. Задача пересекается с настройкой
        //      шаблона колонки (например, cursor на демо CellNoClickable)
        if (this._$column.textOverflow) {
            contentClasses += ` controls-Grid__cell_${this._$column.textOverflow}`;
        }

        if (this._$hiddenForLadder) {
            contentClasses += ' controls-Grid__row-cell__content_hiddenForLadder';
            contentClasses += ` controls-Grid__row-cell__content_hiddenForLadder_theme-${theme}`;
        }

        if (backgroundColorStyle) {
            contentClasses += ` controls-Grid__row-cell__content_background_${backgroundColorStyle}_theme-${theme}`;
        }

        if (templateHighlightOnHover !== false) {
            contentClasses += ` controls-Grid__item_background-hover_${hoverBackgroundStyle}_theme-${theme}`;
        }

        return contentClasses;
    }

    getContentStyles(): string {
        return '';
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
        const isDragged = this._$owner.isDragged();
        const preparedStyle = style;
        const editingBackgroundStyle = this._$owner.getEditingBackgroundStyle();

        classes += ` controls-Grid__row-cell controls-Grid__cell_${preparedStyle}`;
        classes += ` controls-Grid__row-cell_${preparedStyle}_theme-${theme}`;

        if (isEditing) {
            classes += ` controls-ListView__item_editing_theme-${theme}`;
            classes += ` controls-ListView__item_background-editing_${editingBackgroundStyle}_theme-${theme}`;
        }

        if (isDragged) {
            classes += ` controls-ListView__item_dragging_theme-${theme}`;
        }

        if (this._$owner.isActive() && templateHighlightOnHover !== false) {
            classes += ` controls-GridView__item_active_theme-${theme}`;
        }

        if (topPadding === 'null' && bottomPadding === 'null') {
            classes += `controls-Grid__row-cell_small_min_height-theme-${theme} `;
        } else {
            classes += ` controls-Grid__row-cell_default_min_height-theme-${theme}`;
        }

        return classes;
    }

    protected _getWrapperSeparatorClasses(theme: string): string {
        const rowSeparatorSize = this._$rowSeparatorSize;
        let classes = '';

        if (rowSeparatorSize) {
            classes += ` controls-Grid__row-cell_withRowSeparator_size-${rowSeparatorSize}_theme-${theme}`;
            classes += ` controls-Grid__rowSeparator_size-${rowSeparatorSize}_theme-${theme}`;
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
            return ` controls-Grid__columnSeparator_size-${columnSeparatorSize}_theme-${theme}`;
        }
        return '';
    }

    protected _getColumnScrollWrapperClasses(theme: string): string {
        if (this._$isFixed) {
            return `${COLUMN_SCROLL_JS_SELECTORS.FIXED_ELEMENT} js-controls-ColumnScroll__notDraggable controls-GridNew__cell_fixed controls-GridNew__cell_fixed_theme-${theme}`;
        }
        return COLUMN_SCROLL_JS_SELECTORS.SCROLLABLE_ELEMENT;
    }

    protected _getContentPaddingClasses(theme: string): string {
        let classes = '';

        const topPadding = this._$owner.getTopPadding();
        const bottomPadding = this._$owner.getBottomPadding();
        const leftPadding = this._$owner.getLeftPadding();
        const rightPadding = this._$owner.getRightPadding();

        /*if (columns[columnIndex].isActionCell) {
            return classLists;
        }*/
        // TODO: удалить isBreadcrumbs после https://online.sbis.ru/opendoc.html?guid=b3647c3e-ac44-489c-958f-12fe6118892f
        /*if (params.isBreadCrumbs) {
            classLists.left += ` controls-Grid__cell_spacingFirstCol_null_theme-${theme}`;
        }*/

        // left <-> right
        const cellPadding = this._$column.cellPadding;

        const isFirstColumnAfterCheckbox = this.getColumnIndex() === 1 && this._$owner.hasMultiSelectColumn();
        if (this._$owner.getMultiSelectVisibility() === 'hidden' && this.isFirstColumn()) {
            classes += ` controls-Grid__cell_spacingFirstCol_${leftPadding}_theme-${theme}`;
        } else if (!this.isFirstColumn() && !isFirstColumnAfterCheckbox) {
            classes += ' controls-Grid__cell_spacingLeft';
            if (cellPadding?.left) {
                classes += `_${cellPadding.left.toLowerCase()}`;
            }
            classes += `_theme-${theme}`;
        }

        if (!this.isLastColumn()) {
            classes += ' controls-Grid__cell_spacingRight';
            if (cellPadding?.right) {
                classes += `_${cellPadding.right.toLowerCase()}`;
            }
            classes += `_theme-${theme}`;
        } else {
            classes += ` controls-Grid__cell_spacingLastCol_${rightPadding}_theme-${theme}`;
        }

        // top <-> bottom
        classes += ` controls-Grid__row-cell_rowSpacingTop_${topPadding}_theme-${theme}`;
        classes += ` controls-Grid__row-cell_rowSpacingBottom_${bottomPadding}_theme-${theme}`;

        return classes;
    }
    // endregion

    // region Аспект "Ячейка"
    getColumnConfig(): IColumn {
        return this._$column;
    }

    getColumnIndex(): number {
        return this._$owner.getColumnIndex(this);
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
    shouldDisplayMarker(marker: boolean, markerPosition: 'left' | 'right' = 'left'): boolean {
        return false;
    }

    getMarkerClasses(theme: string,
                     style: string = 'default',
                     markerClassName: TMarkerClassName = 'default',
                     itemPadding: IItemPadding = {},
                     markerPosition: 'left' | 'right' = 'left'): string {
        return this._$owner.getMarkerClasses(theme, style, markerClassName, itemPadding, markerPosition);
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

    shouldDisplayEditArrow(): boolean {
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
    _$hiddenForLadder: null,
    _$startColumn: null,
    _$endColumn: null,
    _$colspan: null,
    _$isFixed: null,
    _$instanceId: null,
    _$ladderCell: null,
    _$columnSeparatorSize: null,
    _$rowSeparatorSize: null
});
