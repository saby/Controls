import AbstractStrategy from './AbstractStrategy';
import {CrudEntityKey} from 'Types/source';

export default class SingleColumnMarkerStrategy extends AbstractStrategy {
    private _calculateNearbyItem(index: number, direction: string): CrudEntityKey {
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
    getMarkedKeyByDirection(index: number, direction: string): CrudEntityKey | void {
        const next = direction === 'Down' || direction === 'Forward';
        const resIndex = next ? index + 1 : index - 1;
        return this._calculateNearbyItem(resIndex,  direction);
    }

    getNextMarkedKey(index: number): CrudEntityKey | void {
        return this._calculateNearbyItem(index, 'Down');
    }

    getPrevMarkedKey(index: number): CrudEntityKey | void {
        return this._calculateNearbyItem(index, 'Left');
    }

    shouldMoveMarkerOnScrollPaging(): boolean {
        return true;
    }
}
