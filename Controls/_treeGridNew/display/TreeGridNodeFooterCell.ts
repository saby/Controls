import { TemplateFunction } from 'UI/Base';
import { GridCell } from 'Controls/gridNew';
import TreeGridNodeFooterRow from './TreeGridNodeFooterRow';

export default class TreeGridNodeFooterCell<T> extends GridCell<T, TreeGridNodeFooterRow<T>> {
    readonly '[Controls/treeGrid:TreeGridNodeFooterCell]': boolean;

    getTemplate(content?: TemplateFunction): TemplateFunction|string {
        // Возвращать шаблон кнопки "Ещё".
        // https://online.sbis.ru/opendoc.html?guid=15b9412b-159f-463c-9f4e-fa15a64fda4b
        return this._$owner.hasMoreStorage() ? null : content;
    }

    getContentClasses(
        theme: string,
        backgroundColorStyle: string,
        cursor: string = 'pointer',
        templateHighlightOnHover: boolean = true,
        colspan?: boolean
    ): string {
        const rowSeparatorSize = this._$owner.getRowSeparatorSize();

        let classes =
            'controls-TreeGrid__nodeFooterContent ' +
            `controls-TreeGrid__nodeFooterContent_theme-${theme} ` +
            `controls-TreeGrid__nodeFooterContent_rowSeparatorSize-${rowSeparatorSize}_theme-${theme} ` +
            'controls-Grid_columnScroll__fixed js-controls-ColumnScroll__notDraggable ';

        /*if (!this.isFirstColumn()) {
            classes += ` controls-TreeGrid__nodeFooterCell_columnSeparator-size_${current.getSeparatorForColumn(columns, index, current.columnSeparatorSize)}_theme-${theme}`;
        }*/

        if (!this._$owner.hasMultiSelectColumn() && this.isFirstColumn(colspan)) {
            classes += `controls-TreeGrid__nodeFooterContent_spacingLeft-${this._$owner.getLeftPadding()}_theme-${theme} `;
        }

        if (this.isLastColumn(colspan)) {
            classes += `controls-TreeGrid__nodeFooterContent_spacingRight-${this._$owner.getRightPadding()}_theme-${theme} `;
        }

        return classes;
    }

    getColspan(colspan?: boolean): string {
        return colspan !== false ? 'grid-column: 1 / ' + (this._$owner.getColumnsConfig().length + 1) : '';
    }
}

Object.assign(TreeGridNodeFooterCell.prototype, {
    '[Controls/treeGrid:TreeGridNodeFooterCell]': true,
    _moduleName: 'Controls/treeGrid:TreeGridNodeFooterCell',
    _instancePrefix: 'tree-grid-node-footer-cell-'
});
