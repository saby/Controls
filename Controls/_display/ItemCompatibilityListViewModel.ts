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
        // Когда вызывается destroy, то сперва дестроится getContents, а после этого item
        // Но typeof this.item сперва вызывает item, а потом только срабатывает typeof, из-за этого падает ошибка
        if (this.destroyed) {
            return undefined;
        }
        return this.getContents();
    }

    get key() {
        if (this.destroyed) {
            return undefined;
        }
        return this.item.getKey ? this.item.getKey() : this.item;
    }

    get metaData() {
        if (this.destroyed) {
            return undefined;
        }
        return this.getOwner().getMetaData();
    }

    get searchValue() {
        if (this.destroyed) {
            return undefined;
        }
        return this.getOwner().getSearchValue();
    }

    get index(): number {
        if (this.destroyed) {
            return undefined;
        }
        return this.getOwner().getIndex(this);
    }
}
