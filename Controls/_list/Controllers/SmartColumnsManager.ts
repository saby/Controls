import {IColumnsManager} from 'Controls/_list/interface/IColumnsManager';
import {ColumnsCollection} from 'Controls/display';

export class SmartColumnsManager implements IColumnsManager {
    getColumn(collection: ColumnsCollection<unknown>, index: number, columnsCount: number): number {
        return index % columnsCount;
    }
}
