import GridHeader, {IOptions as IGridHeaderOptions} from './GridHeader';
import GridTableHeaderRow from './GridHeaderRow';

export default class GridTableHeader<T> extends GridHeader<T> {

    getBodyClasses(theme: string = 'default'): string {
        return `controls-Grid__header controls-Grid__header_theme-${theme}`;
    }

    getRow(): never {
        throw Error('Method not implemented in GridTableHeader and shouldn\'t be used!');
    }

    getRows(): Array<GridTableHeaderRow<T>> {
        return this._$rows;
    }

    protected _buildRows(options: IGridHeaderOptions<T>): Array<GridTableHeaderRow<T>> {
        const factory = this._getRowsFactory();
        const rowsCount = this._$gridHeaderBounds.row.end - this._$gridHeaderBounds.row.start;
        if (rowsCount === 1) {
            return [new factory(options)];
        }

        /* Многострочный заголовок */
        const order: number[][] = [];
        options.header.forEach((column, index) => {

            // Строки в grid layout начинаются с 1, индексация строк - с нуля. Приводим индексы.
            let rowIndex = column.startRow - 1;

            // Если все ячейки в конфигурации начинаются не с первой строки, то мы игнорируем эти пустые строки, удаляя их.
            // Строки в grid layout начинаются с 1, компенсируем this._$gridHeaderBounds.row.start на 1.
            if (this._$gridHeaderBounds.row.start - 1 > 0) {
                rowIndex -= (this._$gridHeaderBounds.row.start - 1);
            }

            // Записываем индекс ячейки в строку.
            if (!order[rowIndex]) {
                order[rowIndex] = [];
            }
            order[rowIndex].push(index);
        });

        return order.map((rowCellsIndexes) => new factory({
            ...options,
            header: options.header.filter((h, i) => rowCellsIndexes.indexOf(i) !== -1)
        }));
    }
}

Object.assign(GridTableHeader.prototype, {
    _moduleName: 'Controls/display:GridTableHeader',
    _instancePrefix: 'grid-table-header-',
    _rowModule: 'Controls/display:GridTableHeaderRow',
});
