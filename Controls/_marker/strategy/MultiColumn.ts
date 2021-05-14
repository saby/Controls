import AbstractStrategy from './AbstractStrategy';
import {CrudEntityKey} from 'Types/source';

export default class MultiColumnMarkerStrategy extends AbstractStrategy {
    getMarkedKeyByDirection(index: number, direction: string): CrudEntityKey | void {
        const curMarkedItem = this._model.getItemBySourceIndex(index);
        const itemFromDirection = this._model[`getItemTo${direction}`](curMarkedItem);
        return itemFromDirection ? itemFromDirection.getContents().getKey() : null;
    }

    getNextMarkedKey(index: number): CrudEntityKey | void {
        const markedItem = this._model.find((item) => item.isMarked());
        let resIndex = index;
        if (!markedItem && this._model.getColumnsMode() !== 'fixed') {
            resIndex -= 1;
        }
        return this.getMarkedKeyByDirection(resIndex, 'Right');
    }

    getPrevMarkedKey(index: number): CrudEntityKey | void {
        return this.getMarkedKeyByDirection(index, 'Left');
    }

    shouldMoveMarkerOnScrollPaging(): boolean {
        return false;
    }
}
