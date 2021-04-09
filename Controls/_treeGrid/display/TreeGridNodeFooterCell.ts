import { TemplateFunction } from 'UI/Base';
import { GridCell } from 'Controls/grid';
import TreeGridNodeFooterRow from './TreeGridNodeFooterRow';

export default class TreeGridNodeFooterCell extends GridCell<null, TreeGridNodeFooterRow> {
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
            `controls-TreeGrid__nodeFooterContent_rowSeparatorSize-${rowSeparatorSize} ` +
            'controls-Grid_columnScroll__fixed js-controls-ColumnScroll__notDraggable ';

        /*if (!this.isFirstColumn()) {
            classes += ` controls-TreeGrid__nodeFooterCell_columnSeparator-size_${current.getSeparatorForColumn(columns, index, current.columnSeparatorSize)}`;
        }*/

        if (!this._$owner.hasMultiSelectColumn() && this.isFirstColumn(colspan)) {
            classes += `controls-TreeGrid__nodeFooterContent_spacingLeft-${this._$owner.getLeftPadding()} `;
        }

        if (this.isLastColumn(colspan)) {
            classes += `controls-TreeGrid__nodeFooterContent_spacingRight-${this._$owner.getRightPadding()} `;
        }

        return classes;
    }

    // TODO нужно удалить, когда перепишем колспан для футеров узлов
    getColspanStyles(colspan?: boolean): string {
        if (this.getOwner().isSupportLadder()) {
            return colspan !== false ? 'grid-column: 2 / ' + (this._$owner.getColumnsConfig().length + 2) : '';
        } else {
            return colspan !== false ? 'grid-column: 1 / ' + (this._$owner.getColumnsConfig().length + 1) : '';
        }
    }
}

Object.assign(TreeGridNodeFooterCell.prototype, {
    '[Controls/treeGrid:TreeGridNodeFooterCell]': true,
    _moduleName: 'Controls/treeGrid:TreeGridNodeFooterCell',
    _instancePrefix: 'tree-grid-node-footer-cell-'
});
