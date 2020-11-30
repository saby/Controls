/*  IHeaderCell
    Сделано:
    align Выравнивание содержимого ячейки по горизонтали.
    caption Текст заголовка ячейки.
    sortingProperty Свойство, по которому выполняется сортировка.
    template Шаблон заголовка ячейки.
    templateOptions Опции, передаваемые в шаблон ячейки заголовка.
    textOverflow Поведение текста, если он не умещается в ячейке
    valign Выравнивание содержимого ячейки по вертикали.

    Не сделано:
    isActionCell Поле, для определения ячейки действий
    startColumn Порядковый номер колонки, на которой начинается ячейка.
    startRow Порядковый номер строки, на которой начинается ячейка.
    endColumn Порядковый номер колонки, на которой заканчивается ячейка.
    endRow Порядковый номер строки, на которой заканчивается ячейка.
*/

import { TemplateFunction } from 'UI/Base';
import { IHeaderCell } from 'Controls/grid';
import GridHeaderRow from './GridHeaderRow';
import { IItemPadding } from './Collection';
import GridCell, {IOptions as IGridCellOptions} from './GridCell';

export interface IOptions<T> extends IGridCellOptions<T> {
    owner: GridHeaderRow<T>;
}

const DEFAULT_CELL_TEMPLATE = 'Controls/gridNew:HeaderContent';

export default class GridHeaderCell<T> extends GridCell<T, GridHeaderRow<T>> {
    protected _$owner: GridHeaderRow<T>;
    protected _$cellPadding: IItemPadding;

    constructor(options?: IOptions<T>) {
        super(options);
    }

    getWrapperClasses(theme: string, style: string = 'default'): string {
        let wrapperClasses = `controls-Grid__header-cell controls-Grid__cell_${style}`
                          + ` controls-Grid__header-cell_theme-${theme}`
                          + ` ${this._getWrapperPaddingClasses(theme)}`;

        const isMultiHeader = this._$owner.hasRowspan();
        const isStickySupport = this._$owner.isStickyHeader();

        if (isMultiHeader) {
            wrapperClasses += ` controls-Grid__multi-header-cell_min-height_theme-${theme}`;
        } else {
            wrapperClasses += ` controls-Grid__header-cell_min-height_theme-${theme}`;
        }
        if (!isStickySupport) {
            wrapperClasses += ' controls-Grid__header-cell_static';
        }

        if (!this.isMultiSelectColumn()) {
            wrapperClasses += ' controls-Grid__header-cell_min-width';
        }

        // _private.getBackgroundStyle(this._options, true);
        return wrapperClasses;
    }

    getContentClasses(theme: string): string {
        const isMultiHeader = false;
        const isFullGridSupport = true;
        let contentClasses = 'controls-Grid__header-cell__content';
        contentClasses += ` controls-Grid__header-cell__content_theme-${theme}`;
        if (isMultiHeader) {
            contentClasses += ` controls-Grid__row-multi-header__content_baseline_theme-${theme}`;
        } else {
            contentClasses += ` controls-Grid__row-header__content_baseline_theme-${theme}`;
        }
        if (this._$column.align) {
            contentClasses += ` controls-Grid__header-cell_justify_content_${this._$headerCell.align}`;
        }
        if (isFullGridSupport) {
            if (this._$column.valign) {
                contentClasses += ` controls-Grid__header-cell_align_items_${this._$headerCell.valign}`;
            }
        }
        return contentClasses;
    }

    getTemplate(): TemplateFunction|string {
        return this._$column.template || DEFAULT_CELL_TEMPLATE;
    }

    getCaption(): string {
        // todo "title" - is deprecated property, use "caption"
        return this._$column.caption || this._$column.title;
    }

    getSortingProperty(): string {
        return this._$column.sortingProperty;
    }

    getAlign(): string {
        return this._$column.align;
    }

    getVAlign(): string {
        return this._$column.valign;
    }

    getTextOverflow(): string {
        return this._$column.textOverflow;
    }

    // todo <<< START >>> compatible with old gridHeaderModel
    get column(): IHeaderCell {
        return this._$headerCell;
    }
    // todo <<< END >>>

    protected _getWrapperPaddingClasses(theme: string): string {
        let paddingClasses = '';
        const leftPadding = this._$owner.getLeftPadding();
        const rightPadding = this._$owner.getRightPadding();
        const isMultiSelectColumn = this.isMultiSelectColumn();
        const isFirstColumn = this.isFirstColumn();
        const isLastColumn = this.isLastColumn();
        const cellPadding = this._$cellPadding;
        const cellLeftPadding = cellPadding && cellPadding.left;
        const cellRightPadding = cellPadding && cellPadding.right;

        // todo <<< START >>> need refactor css classes names
        const compatibleLeftPadding = cellLeftPadding ? `_${cellLeftPadding}` : (leftPadding === 'default' ? '' : leftPadding);
        const compatibleRightPadding = cellRightPadding ? `_${cellRightPadding}` : (rightPadding === 'default' ? '' : rightPadding);
        // todo <<< END >>>

        if (!isMultiSelectColumn) {
            if (!isFirstColumn) {
                if (this._$owner.getMultiSelectVisibility() === 'hidden' || this.getColumnIndex() > 1) {
                    paddingClasses += ` controls-Grid__cell_spacingLeft${compatibleLeftPadding}_theme-${theme}`;
                }
            } else {
                paddingClasses += ` controls-Grid__cell_spacingFirstCol_${leftPadding}_theme-${theme}`;
            }
        }

        // right padding
        if (isLastColumn) {
            paddingClasses += ` controls-Grid__cell_spacingLastCol_${rightPadding}_theme-${theme}`;
        } else {
            paddingClasses += ` controls-Grid__cell_spacingRight${compatibleRightPadding}_theme-${theme}`;
        }

        return paddingClasses;
    }
}

Object.assign(GridHeaderCell.prototype, {
    _moduleName: 'Controls/display:GridHeaderCell',
    _instancePrefix: 'grid-header-cell-',
    _$cellPadding: null
});
