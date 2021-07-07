/**
 * Слой совместимости с ListViewModel для элемента коллекции
 * @private
 * @author Авраменко А.С.
 */

export interface IItemCompatibilityListViewModel {
    item: {};
    key: string|number;
    metaData: {};
}

export class ItemCompatibilityListViewModel implements IItemCompatibilityListViewModel {
    get item(): {} {
        return this.getContents();
    }

    get key() {
        return this.item.getKey ? this.item.getKey() : this.item;
    }

    get metaData() {
        return this.getOwner().getMetaData();
    }
}
