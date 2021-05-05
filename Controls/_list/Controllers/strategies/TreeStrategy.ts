import {Tree, TreeItem} from 'Controls/display';
import {Model} from 'Types/entity';
import {CrudEntityKey} from 'Types/source';
import {RecordSet} from 'Types/collection';
import {ISiblingStrategy, ISiblingStrategyOptions} from './ISiblingStrategy';

export interface ITreeStrategyOptions extends ISiblingStrategyOptions {
    collection: Tree;
}

export class TreeStrategy implements ISiblingStrategy {

    _collection: Tree;

    constructor(options: ITreeStrategyOptions): void {
        this._collection = options.collection;
    }

    getNextByKey(key: string|number): TreeItem {
        const projection = this._getRecordSetProjection(null, this._collection.getExpandedItems());
        const nextItemIndex = projection.findIndex((record) => record.getKey() === key) + 1;
        return this._collection.getItemBySourceKey(projection[nextItemIndex].getKey());
    }

    getPrevByKey(key: string|number): TreeItem {
        const projection = this._getRecordSetProjection(null, this._collection.getExpandedItems());
        const prevItemIndex = projection.findIndex((record) => record.getKey() === key) - 1;
        return this._collection.getItemBySourceKey(projection[prevItemIndex].getKey());
    }

    private _getRecordSetProjection(root: CrudEntityKey | null = null, expandedItems: CrudEntityKey[] = []): Model[] {
        const collection = this._collection.getCollection() as unknown as RecordSet;
        if (!collection || !collection.getCount()) {
            return [];
        }
        const projection = [];
        const isExpandAll = expandedItems.indexOf(null) !== -1;
        const children = this._collection.getChildrenByRecordSet(root);
        for (let i = 0; i < children.length; i++) {
            projection.push(children[i]);
            if (isExpandAll || expandedItems.indexOf(children[i].getKey()) !== -1) {
                projection.push(...this._getRecordSetProjection(children[i].getKey(), expandedItems));
            }
        }
        return projection;
    }
}
