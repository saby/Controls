interface IColumn {
    template: Function;
    startIndex?: number;
    endIndex?: number;
}

interface IPreparedColumn extends Required<IColumn> {}

interface IPrepareColumnsParams<T extends IPreparedColumn> {
    gridColumns: unknown[];
    colspanColumns: IColumn[];
    hasMultiSelect: boolean;
    afterPrepareCallback?(column: T, index: number, columns: T[]): void;
}

function prepareColumns<T extends IPreparedColumn>(params: IPrepareColumnsParams<T>): Array<T> {
    const result = [];
    const multiSelectOffset = +params.hasMultiSelect;
    const gridColumnsCount = params.gridColumns.length;

    let shouldInsertColumnBefore = false;
    let shouldInsertColumnAfter = false;

    params.colspanColumns.forEach((c, index) => {
        const newColumn: IColumn = { template: c.template };

        // Начальный индекс колонки
        if (typeof c.startIndex === 'number') {
            // Если задали индкс начала колонки, то оставляем его и проверям, нужно ли
            // вставить еще колонку до данной(если начальный индекс больше 1)
            newColumn.startIndex = c.startIndex;
            if (index === 0 && c.startIndex !== 1) {
                shouldInsertColumnBefore = true;
            }
        } else if (index === 0) {
            // Если не задали индкс начала колонки, то утанавливаем его как конец
            // предыдущей (или как начало, если это первая колонка)
            newColumn.startIndex = 1;
        } else {
            newColumn.startIndex = result[index - 1].endIndex;
        }

        // Конечный индекс колонки
        if (typeof c.endIndex === 'number') {
            // Если задали индкс конца колонки, то оставляем его и проверям, нужно ли
            // вставить еще колонку после данной(если это последняя колонка из шаблона, но ее
            // конечный индекс задан и он меньше чем индекс последней границы грида)
            newColumn.endIndex = c.endIndex;
            if (index === params.colspanColumns.length - 1 && newColumn.endIndex !== gridColumnsCount + 1) {
                shouldInsertColumnAfter = true;
            }
        } else {
            // Если не задали индкс конца колонки, то утанавливаем его либо как индекс последней границы грида,
            // либо как стартовый индекс колонки + 1(по умолчанию, колонка не будет растянута)
            if (index === params.colspanColumns.length - 1) {
                newColumn.endIndex = gridColumnsCount + 1;
            } else {
                newColumn.endIndex = newColumn.startIndex + 1;
            }
        }

        result.push(newColumn);
    });

    // Дополнительная колонка слева, если прикладные колонки показываются не сничала
    if (shouldInsertColumnBefore) {
        result.unshift({
            startIndex: 1,
            endIndex: result[0].startIndex
        });
    }

    // Дополнительная колонка справа, если прикладные колонки показываются не до конца
    if (shouldInsertColumnAfter) {
        result.push({
            startIndex: result[result.length - 1].endIndex,
            endIndex: gridColumnsCount + 1
        });
    }

    // Классы колонок и смещение индексов из за колонки под чекбокс.
    result.forEach((resultColumn, index) => {
        resultColumn.startIndex += multiSelectOffset;
        resultColumn.endIndex += multiSelectOffset;
        if (params.afterPrepareCallback) {
            params.afterPrepareCallback(resultColumn, index, result);
        }
    });

    return result;
}

export {
    IColumn,
    IPreparedColumn,
    IPrepareColumnsParams,
    prepareColumns
};
