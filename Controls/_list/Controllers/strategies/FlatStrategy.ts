import {Collection, CollectionItem} from 'Controls/display';
import {RecordSet} from 'Types/collection';

import {ISiblingStrategy, ISiblingStrategyOptions} from './ISiblingStrategy';

export class FlatStrategy implements ISiblingStrategy {

    _collection: Collection;

    constructor(options: ISiblingStrategyOptions) {
        this._collection = options.collection;
    }

    getNextByKey(key: string|number): CollectionItem {
        const collection = this._collection.getCollection() as undefined as RecordSet;
        const currentIndex = collection.getIndexByValue(collection.getKeyProperty(), key);
        let item: CollectionItem;
        if (currentIndex !== collection.getCount() - 1) {
            const nextRecord = collection.at(currentIndex + 1);
            item = this._collection.getItemBySourceKey(nextRecord.getKey());
        }
        return item;
    }

    getPrevByKey(key: string|number): CollectionItem {
        const collection = this._collection.getCollection() as undefined as RecordSet;
        const currentIndex = collection.getIndexByValue(collection.getKeyProperty(), key);
        let item: CollectionItem;
        if (currentIndex !== 0) {
            const prevRecord = collection.at(currentIndex - 1);
            item = this._collection.getItemBySourceKey(prevRecord.getKey());
        }
        return item;
    }

}
