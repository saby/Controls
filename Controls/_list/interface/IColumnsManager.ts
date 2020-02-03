import {ColumnsCollection} from 'Controls/display';
export interface IColumnsManager {
    getColumn(collection: ColumnsCollection<unknown>, index: number, columnsCount?: number): number;
}
