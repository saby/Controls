import {Collection, CollectionItem} from 'Controls/display';
import {CrudEntityKey} from 'Types/source';

export interface ISiblingStrategyOptions {
    collection: Collection;
}

export interface ISiblingStrategy {
    getPrevByKey(key: CrudEntityKey): CollectionItem;
    getNextByKey(key: CrudEntityKey): CollectionItem;
}
