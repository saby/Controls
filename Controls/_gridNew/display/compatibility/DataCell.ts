
export default class DataCellCompatibility<T> {
    get item(): T {
        return this.getOwner().contents;
    }
    isActive(): boolean {
        return this.getOwner().isActive();
    }
    get searchValue() {
        return this.getOwner().searchValue;
    }
    get column() {
        return this._$column;
    }
}
