import {ColumnsCollection} from 'Controls/display';
export interface IColumnsCalculator {
    calcColumn(collection: ColumnsCollection<unknown>, index: number, columnsCount?: number): number;
}
