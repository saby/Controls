import { mixin } from 'Types/util';
import {
    OptionsToPropertyMixin,
    DestroyableMixin,
    InstantiableMixin,
    VersionableMixin,
    IInstantiable,
    IVersionable
} from 'Types/entity';
import GridCollectionItem from './GridCollectionItem';
import { TemplateFunction } from 'UI/Base';
import { IColumn } from 'Controls/grid';

const DEFAULT_CELL_TEMPLATE = 'Controls/gridNew:ColumnTemplate';

export interface IOptions<T> {
    owner: GridCollectionItem<T>;
    column: IColumn;
    hiddenForLadder?: boolean;
}

export default class GridColumn<T> extends mixin<
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
    protected _$owner: GridCollectionItem<T>;
    protected _$column: IColumn;
    protected _$hiddenForLadder: boolean;

    getInstanceId: () => string;

    constructor(options?: IOptions<T>) {
        super();
        OptionsToPropertyMixin.call(this, options);
    }

    setHiddenForLadder(value: boolean) {
        this._$hiddenForLadder = value;
    }

    getWrapperClasses(theme: string, backgroundColorStyle: string, style: string = 'default', templateHighlightOnHover: boolean): string {
        let wrapperClasses = '';
        const hasColumnScroll = false;

        wrapperClasses += this._getWrapperBaseClasses(theme, style, templateHighlightOnHover);
        wrapperClasses += this._getWrapperSeparatorClasses(theme);

        if (hasColumnScroll) {
        } else {
            wrapperClasses += ' controls-Grid__cell_fit';
        }

        /*const checkBoxCell = current.multiSelectVisibility !== 'hidden' && current.columnIndex === 0;
        const classLists = createClassListCollection('base', 'padding', 'columnScroll', 'columnContent');
+++     let style = current.style === 'masterClassic' || !current.style ? 'default' : current.style;
        const backgroundStyle = current.backgroundStyle || current.style || 'default';
        const isFullGridSupport = GridLayoutUtil.isFullGridSupport();

+++     // Стиль колонки
+++     if (current.itemPadding.top === 'null' && current.itemPadding.bottom === 'null') {
+++         classLists.base += `controls-Grid__row-cell_small_min_height-theme-${theme} `;
+++     } else {
+++         classLists.base += `controls-Grid__row-cell_default_min_height-theme-${theme} `;
+++     }
+++     classLists.base += `controls-Grid__row-cell controls-Grid__cell_${style} controls-Grid__row-cell_${style}_theme-${theme}`;
        _private.prepareSeparatorClasses(current, classLists, theme);

        if (backgroundColorStyle) {
            classLists.base += _private.getBackgroundStyle({backgroundStyle, theme, backgroundColorStyle}, true);
        }

        if (self._options.columnScroll) {
            classLists.columnScroll += _private.getColumnScrollCalculationCellClasses(current, theme);
            if (self._options.columnScrollVisibility) {
                classLists.columnScroll += _private.getColumnScrollCellClasses(current, theme);
            }
+++     } else if (!checkBoxCell) {
+++         classLists.base += ' controls-Grid__cell_fit';
+++     }

        if (current.isEditing()) {
            classLists.base += ` controls-Grid__row-cell-background-editing_theme-${theme}`;
        } else {
            let backgroundHoverStyle = current.hoverBackgroundStyle || 'default';
            classLists.base += ` controls-Grid__row-cell-background-hover-${backgroundHoverStyle}_theme-${theme}`;
        }

        if (current.columnScroll && !current.isEditing()) {
            classLists.columnScroll += _private.getBackgroundStyle({backgroundStyle, theme}, true);
        }

        // Если включен множественный выбор и рендерится первая колонка с чекбоксом
        if (checkBoxCell) {
            classLists.base += ` controls-Grid__row-cell-checkbox_theme-${theme}`;
            classLists.padding = createClassListCollection('top', 'bottom');
            classLists.padding.top = `controls-Grid__row-checkboxCell_rowSpacingTop_${current.itemPadding.top}_theme-${theme}`;
            classLists.padding.bottom =  `controls-Grid__row-cell_rowSpacingBottom_${current.itemPadding.bottom}_theme-${theme}`;
        } else {
            classLists.padding = _private.getPaddingCellClasses(current, theme);
        }

        if (current.dispItem.isMarked() && current.markerVisibility !== 'hidden') {
            style = current.style || 'default';
            classLists.marked = `controls-Grid__row-cell_selected controls-Grid__row-cell_selected-${style}_theme-${theme}`;

            // при отсутствии поддержки grid (например в IE, Edge) фон выделенной записи оказывается прозрачным,
            // нужно его принудительно установить как фон таблицы
            if (!isFullGridSupport && !current.isEditing()) {
                classLists.marked += _private.getBackgroundStyle({backgroundStyle, theme}, true);
            }

            if (current.columnIndex === 0) {
                classLists.marked += ` controls-Grid__row-cell_selected__first-${style}_theme-${theme}`;
            }
            if (current.columnIndex === current.getLastColumnIndex()) {
                classLists.marked += ` controls-Grid__row-cell_selected__last controls-Grid__row-cell_selected__last-${style}_theme-${theme}`;
            }
        } else if (current.columnIndex === current.getLastColumnIndex()) {
            classLists.base += ` controls-Grid__row-cell__last controls-Grid__row-cell__last-${style}_theme-${theme}`;
        }

        if (!GridLayoutUtil.isFullGridSupport() && !(current.columns.length === (current.hasMultiSelect ? 2 : 1)) && self._options.fixIEAutoHeight) {
            classLists.base += ' controls-Grid__row-cell__autoHeight';
        }
        return classLists;*/
        return wrapperClasses;
    }

    // Only for partial grid support
    getRelativeCellWrapperClasses(theme: string): string {
        const rowSeparatorSize = this._$owner.getRowSeparatorSize();

        // Единственная ячейка с данными сама формирует высоту строки и не нужно применять хак для растягивания контента ячеек по высоте ячеек.
        // Подробнее искать по #grid_relativeCell_td.
        const shouldFixAlignment = this._$owner.getColumns().length === (this._$owner.getMultiSelectVisibility() !== 'hidden' ? 2 : 1);

        return 'controls-Grid__table__relative-cell-wrapper ' +
               `controls-Grid__table__relative-cell-wrapper_rowSeparator-${rowSeparatorSize}_theme-${theme} ` +
               (shouldFixAlignment ? 'controls-Grid__table__relative-cell-wrapper_singleCell' : '');
    }

    getWrapperStyles(): string {
        return '';
    }

    getContentClasses(theme: string, cursor: string = 'pointer', templateHighlightOnHover: boolean = true): string {
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

        // todo {{backgroundColorStyle ? 'controls-Grid__row-cell__content_background_' + backgroundColorStyle + '_theme-' + _options.theme}}

        if (this._$hiddenForLadder) {
            contentClasses += ' controls-Grid__row-cell__content_hiddenForLadder';
            contentClasses += ` controls-Grid__row-cell__content_hiddenForLadder_theme-${theme}`;
        }

        if (this._$owner.isEditing()) {
            contentClasses += ` controls-Grid__row-cell-background-editing_theme-${theme}`;
        } else if (templateHighlightOnHover !== false) {
            contentClasses += ` controls-Grid__row-cell-background-hover-default_theme-${theme}`;
        }
        return contentClasses;
    }


    getContentStyles(): string {
        return '';
    }

    getColumnConfig(): IColumn {
        return this._$column;
    }

    getTemplate(multiSelectTemplate?: TemplateFunction): TemplateFunction|string {
        return this._$column.template || DEFAULT_CELL_TEMPLATE;
    }

    getDisplayProperty(): string {
        return this._$column.displayProperty;
    }

    getContents(): T {
        return this._$owner.getContents();
    }

    get contents(): T {
        return this._$owner.getContents();
    }

    getColumnIndex(): number {
        return this._$owner.getColumnIndex(this._$column);
    }

    isFirstColumn(): boolean {
        return this.getColumnIndex() === 0;
    }

    isLastColumn(): boolean {
        return this.getColumnIndex() === this._$owner.getColumnsCount() - 1;
    }

    shouldDisplayMarker(marker: boolean, markerPosition: 'left' | 'right' = 'left'): boolean {
        if (markerPosition === 'right') {
            return marker !== false && this._$owner.isMarked() && this.isLastColumn();
        } else {
            return marker !== false && this._$owner.isMarked() &&
                   this._$owner.getMultiSelectVisibility() === 'hidden' && this.isFirstColumn();
        }
    }

    shouldDisplayItemActions(): boolean {
        return this.isLastColumn() && (this._$owner.hasVisibleActions() || this._$owner.isEditing());
    }

    getMarkerClasses(theme: string, style: string = 'default', markerPosition: 'left' | 'right' = 'left'): string {
        return `
            controls-ListView__itemV_marker-${markerPosition}
            controls-ListView__itemV_marker controls-ListView__itemV_marker-${style}_theme-${theme}
            controls-GridView__itemV_marker controls-GridView__itemV_marker-${style}_theme-${theme}
        `;
    }

    nextVersion(): void {
        this._nextVersion();
    }

    protected _getWrapperBaseClasses(theme: string, style: string, templateHighlightOnHover: boolean): string {
        let classes = '';

        const topPadding = this._$owner.getTopPadding();
        const bottomPadding = this._$owner.getBottomPadding();
        const isEditing = this._$owner.isEditing();
        const isDragged = this._$owner.isDragged();
        const preparedStyle = style === 'masterClassic' ? 'default' : style;

        classes += ` controls-Grid__row-cell controls-Grid__cell_${preparedStyle}`;
        classes += ` controls-Grid__row-cell_${preparedStyle}_theme-${theme}`;

        if (isEditing) {
            classes += ` controls-ListView__item_editing_theme-${theme}`;
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
        const rowSeparatorSize = this._$owner.getRowSeparatorSize();
        let classes = '';

        if (rowSeparatorSize) {
            classes += ` controls-Grid__row-cell_withRowSeparator_size-${rowSeparatorSize}_theme-${theme}`;
            classes += ` controls-Grid__rowSeparator_size-${rowSeparatorSize}_theme-${theme}`;
        } else {
            // Вспомогательные классы, вешаются на ячейку. Обеспечивают отсутствие "скачков" при смене rowSeparatorSize.
            classes += ' controls-Grid__no-rowSeparator';
            classes += ' controls-Grid__row-cell_withRowSeparator_size-null';
        }

        /*if (current.columnIndex > current.hasMultiSelect ? 1 : 0) {
            const columnSeparatorSize = _private.getSeparatorForColumn(current.columns, current.columnIndex, current.columnSeparatorSize);

            if (columnSeparatorSize !== null) {
                classLists.base += ' controls-Grid__row-cell_withColumnSeparator';
                classLists.columnContent += ` controls-Grid__columnSeparator_size-${columnSeparatorSize}_theme-${theme}`;
            }
        }*/
        return classes;
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

        if (this._$owner.getMultiSelectVisibility() === 'hidden' && this.isFirstColumn()) {
            classes += ` controls-Grid__cell_spacingFirstCol_${leftPadding}_theme-${theme}`;
        } else if (!this.isFirstColumn()) {
            classes += ' controls-Grid__cell_spacingLeft';
            if (cellPadding?.left) {
                classes += `_${cellPadding.left}`;
            }
            classes += `_theme-${theme}`;
        }

        if (!this.isLastColumn()) {
            classes += ' controls-Grid__cell_spacingRight';
            if (cellPadding?.right) {
                classes += `_${cellPadding.right}`;
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
    getColspan(): number {
        // TODO: Полный колспан будет реализован в 21.1000 по плановой задаче
        //  https://online.sbis.ru/opendoc.html?guid=50811b1e-7362-4e56-b52c-96d63b917dc9
        return 1;
    }
}

Object.assign(GridColumn.prototype, {
    '[Controls/_display/GridColumn]': true,
    _moduleName: 'Controls/display:GridColumn',
    _instancePrefix: 'grid-column-',
    _$owner: null,
    _$column: null,
    _$hiddenForLadder: null
});
