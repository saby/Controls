import {Tree} from 'Controls/display';
import {Model} from 'Types/entity';
import {CrudEntityKey, LOCAL_MOVE_POSITION} from 'Types/source';
import {RecordSet} from 'Types/collection';
import {ISiblingStrategy, ISiblingStrategyOptions} from './ISiblingStrategy';

export interface ITreeStrategyOptions extends ISiblingStrategyOptions {
    collection: Tree;
}

export class TreeSiblingStrategy implements ISiblingStrategy {

    _collection: Tree;

    constructor(options: ITreeStrategyOptions): void {
        this._collection = options.collection;
    }

    getNextByKey(key: CrudEntityKey): Model {
        return this._getSibling(key, LOCAL_MOVE_POSITION.After);
    }

    getPrevByKey(key: CrudEntityKey): Model {
        return this._getSibling(key, LOCAL_MOVE_POSITION.Before);
    }

    private _getSibling(key: CrudEntityKey, direction: LOCAL_MOVE_POSITION): Model {
        const parent = this._getParentItem(key);
        const children = this._collection.getChildrenByRecordSet(parent);
        const currentChildIndex = children.findIndex((item) => item.getKey() === key);
        if ((direction === LOCAL_MOVE_POSITION.After && currentChildIndex === children.length - 1) ||
            (direction === LOCAL_MOVE_POSITION.Before && currentChildIndex === 0)) {
            return;
        }
        return children[currentChildIndex + (direction === LOCAL_MOVE_POSITION.After ? 1 : -1)];
    }

    private _getParentItem(key: CrudEntityKey): Model {
        const currentIndex = this._getCollection().getIndexByValue(this._getCollection().getKeyProperty(), key);
        return this._getCollection().at(currentIndex).get(this._collection.getParentProperty());
    }

    private _getCollection(): RecordSet {
        return this._collection.getCollection() as undefined as RecordSet;
    }
}
