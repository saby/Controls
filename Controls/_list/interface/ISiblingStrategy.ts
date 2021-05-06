import {Collection} from 'Controls/display';
import {Model} from 'Types/entity';
import {CrudEntityKey} from 'Types/source';

export interface ISiblingStrategyOptions {
    collection: Collection;
}

export interface ISiblingStrategy {
    getPrevByKey(key: CrudEntityKey): Model;
    getNextByKey(key: CrudEntityKey): Model;
}
