import {IColumnsCalculator} from 'Controls/_list/interface/IColumnsCalculator';
import {ColumnsCollection} from 'Controls/display';

export class AutoColumns implements IColumnsCalculator {
    calcColumn(collection: ColumnsCollection<unknown>, index: number, columnsCount: number): number {
        return index % columnsCount;
    }
}
