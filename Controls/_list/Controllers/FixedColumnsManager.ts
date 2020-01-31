import {IColumnsManager} from 'Controls/_list/interface/IColumnsManager';
import {ColumnsCollection} from 'Controls/display';

export class FixedColumnsManager implements IColumnsManager {
    getColumn(collection: ColumnsCollection<unknown>, index: number): number {
        if (index < collection.getCount()) {
            const item = collection.at(index);
            return item.getFixedColumn();
        }
        return 0;
    }
}
