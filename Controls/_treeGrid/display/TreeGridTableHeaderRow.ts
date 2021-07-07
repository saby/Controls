import TreeGridHeaderRow from "Controls/_treeGrid/display/TreeGridHeaderRow";
import { GridHeaderRow } from "Controls/grid";

export default class TreeGridTableHeaderRow extends TreeGridHeaderRow {
    getItemClasses(): string {
        return '';
    }

    hasMultiSelectColumn(): boolean {
        return this._$owner.hasMultiSelectColumn() && this._$headerModel.getRowIndex(this as GridHeaderRow<null>) === 0;
    }

    protected _addCheckBoxColumnIfNeed(): void {
        const factory = this.getColumnsFactory();
        if (this.hasMultiSelectColumn()) {
            const {start, end} = this._$headerModel.getBounds().row;
            this._$columnItems.unshift(factory({
                column: {
                    startRow: start,
                    endRow: end
                },
                isFixed: true
            }));
        }
    }
}

Object.assign(TreeGridTableHeaderRow.prototype, {
    'Controls/treeGrid:TreeGridTableHeaderRow': true
});
