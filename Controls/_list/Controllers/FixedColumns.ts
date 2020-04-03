import {IColumnsCalculator} from 'Controls/_list/interface/IColumnsCalculator';
import {ColumnsCollection} from 'Controls/display';

export class FixedColumns implements IColumnsCalculator {
    calcColumn(collection: ColumnsCollection<unknown>, index: number): number {
        if (index < collection.getCount()) {
            const item = collection.at(index);
            return item.getContents().get && item.getContents().get(collection.getColumnProperty() || 'column') || 0;
        }
        return 0;
    }
}
