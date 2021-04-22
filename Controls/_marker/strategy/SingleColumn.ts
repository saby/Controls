import AbstractStrategy from './AbstractStrategy';
import {CrudEntityKey} from 'Types/source';

export default class SingleColumnMarkerStrategy extends AbstractStrategy {
    getMarkedKeyByDirection(index: number, direction: string): CrudEntityKey | void {
        let item;
        const next = direction === 'Down';
        const count = this._model.getCount();
        const indexInBounds = (i) => next ? i < count : i >= 0;
        let resIndex = index;
        while (indexInBounds(resIndex)) {
            item = this._model.at(resIndex);
            if (item && item.Markable) { break; }
            resIndex += next ? 1 : -1;
        }

        if (item && item.Markable) {
            return item.getContents().getKey();
        }

        return null;
    }

    getNextMarkedKey(index: number): CrudEntityKey | void {
        return this.getMarkedKeyByDirection(index, 'Down');
    }

    getPrevMarkedKey(index: number): CrudEntityKey | void {
        return this.getMarkedKeyByDirection(index, 'Up');
    }

    shouldMoveMarkerOnScrollPaging(): boolean {
        return true;
    }
}
