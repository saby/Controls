import HeaderRow from './HeaderRow';

export default class TableHeaderRow<T> extends HeaderRow<T> {
    getItemClasses(): string {
        return '';
    }
    hasMultiSelectColumn(): boolean {
        return this._$owner.hasMultiSelectColumn() && this._$headerModel.getRowIndex(this) === 0;
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

Object.assign(TableHeaderRow.prototype, {
    '[Controls/_display/grid/TableHeaderRow]': true
});
