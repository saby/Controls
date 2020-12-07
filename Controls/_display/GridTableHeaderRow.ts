import GridHeaderRow, {IOptions as IGridHeaderRowOptions} from './GridHeaderRow';

export default class GridTableHeaderRow<T> extends GridHeaderRow<T> {
    getItemClasses(): string {
        return '';
    }

    protected _addCheckBoxColumnIfNeed(): void {
        const factory = this._getColumnsFactory();
        if (this._$owner.getMultiSelectVisibility() !== 'hidden' && this._$headerModel.getRowIndex(this) === 0) {
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
