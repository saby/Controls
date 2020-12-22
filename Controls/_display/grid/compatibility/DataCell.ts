
export default class DataCellCompatibility<T> {
    get item(): T {
        return this.getOwner().contents;
    }
    isEditing(): boolean {
        return this.getOwner().isEditing();
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
