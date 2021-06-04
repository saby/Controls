import {IMarkerStrategy, IMarkerStrategyOptions} from '../interface';
import {Collection, CollectionItem} from 'Controls/display';
import {CrudEntityKey} from 'Types/source';
import {Model} from 'Types/entity';

export default abstract class AbstractMarkerStrategy implements IMarkerStrategy {
    protected _model: Collection<Model, CollectionItem<Model>>;

    constructor(options: IMarkerStrategyOptions) {
        this._model = options.model;
    }

    abstract getNextMarkedKey(index: number): CrudEntityKey | void;
    abstract getPrevMarkedKey(index: number): CrudEntityKey | void;
    abstract getMarkedKeyByDirection(index: number, direction: string): CrudEntityKey | void;
    abstract shouldMoveMarkerOnScrollPaging(): boolean;
}
