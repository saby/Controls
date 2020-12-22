import HeaderRow from './HeaderRow';

export default class TableHeaderRow<T> extends HeaderRow<T> {
    getItemClasses(): string {
        return '';
    }

    protected _addCheckBoxColumnIfNeed(): void {
        const factory = this._getColumnsFactory();
        if (this._$owner.needMultiSelectColumn() && this._$headerModel.getRowIndex(this) === 0) {
            const {start, end} = this._$headerModel.getBounds().row;
            this._$columnItems.unshift(factory({
                column: {
                    startRow: start,
                    endRow: end
                }
            }));
        }
    }
}

Object.assign(TableHeaderRow.prototype, {
    '[Controls/_display/grid/TableHeaderRow]': true
});
