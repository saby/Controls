import {mixin} from 'Types/util';
import EmptyRow from './EmptyRow';
import Cell, {IOptions as IBaseCellOptions} from './Cell';
import CellCompatibility from './compatibility/DataCell';

class EmptyCell<T> extends mixin<Cell<T, EmptyRow<T>>, CellCompatibility>(Cell, CellCompatibility) {
    protected readonly _defaultCellTemplate: string = 'Controls/grid:EmptyColumnTemplate';

    //region Аспект "Стилевое оформление"
    getWrapperClasses(theme: string, backgroundColorStyle: string = 'default', style: string = 'default', highlightOnHover?: boolean): string {
        let classes;
        const columnScrollClasses = this._$owner.hasColumnScroll() ? this._getColumnScrollWrapperClasses() : '';

        // todo https://online.sbis.ru/opendoc.html?guid=024784a6-cc47-4d1a-9179-08c897edcf72
        const hasRowTemplate = this._$owner.getRowTemplate();

        if (this._$isSingleColspanedCell && hasRowTemplate) {
            classes = columnScrollClasses;
        } else if (this.isMultiSelectColumn()) {
            classes = 'controls-GridView__emptyTemplate__checkBoxCell '
                + 'controls-Grid__row-cell-editing '
                + `controls-Grid__row-cell-background-editing_${backgroundColorStyle} `
                + `${columnScrollClasses}`;
        } else {
            classes = super.getWrapperClasses(theme, backgroundColorStyle, style, highlightOnHover)
                + ' controls-Grid__row-cell-background-editing_default';
        }

        return classes;
    }

    getContentClasses(theme: string, topSpacing: string = 'default', bottomSpacing: string = 'default'): string {
        let classes;

        // todo https://online.sbis.ru/opendoc.html?guid=024784a6-cc47-4d1a-9179-08c897edcf72
        const hasRowTemplate = this._$owner.getRowTemplate();

        if (this._$isSingleColspanedCell && hasRowTemplate) {
            classes = 'controls-ListView__empty'
                + ` controls-ListView__empty_topSpacing_${topSpacing}`
                + ` controls-ListView__empty_bottomSpacing_${bottomSpacing}`;
        } else if (this.isMultiSelectColumn()) {
            classes = '';
        } else {
            classes = this._getHorizontalPaddingClasses(theme)
                + this._getVerticalPaddingClasses(theme)
                + ' controls-Grid__row-cell__content'
                + ' controls-GridView__emptyTemplate__cell'
                + ' controls-Grid__row-cell-editing'
                + ' controls-Grid__row-cell__content_baseline_default'
                + ' controls-Grid__row-cell-background-editing_default';
        }

        return classes;
    }

    getContentStyles(containerSize?: number): string {
        if (containerSize && this._$isActsAsRowTemplate) {
            return `width: ${containerSize}px;`;
        }
        return '';
    }

    //endregion
}

Object.assign(EmptyCell.prototype, {
    '[Controls/_display/grid/EmptyCell]': true,
    _moduleName: 'Controls/grid:GridEmptyCell',
    _instancePrefix: 'grid-empty-cell-'
});

export default EmptyCell;
export {
    EmptyCell,
    IBaseCellOptions as IEmptyCellOptions
};
