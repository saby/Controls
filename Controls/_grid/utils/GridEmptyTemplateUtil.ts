interface IEmptyTemplateColumn {
    template: Function;
    startIndex?: number;
    endIndex?: number;
}

interface IPreparedEmptyTemplateColumn extends Required<IEmptyTemplateColumn> {
    classes: string;
}

interface IPrepareEmptyEditingColumnsParams {
    hasMultiSelect: boolean;
    gridColumns: Array<{ cellPadding?: {left?: string; right?: string} }>;
    emptyTemplateColumns: IEmptyTemplateColumn[];
    emptyTemplateSpacing?: {
        top?: string;
        bottom?: string;
    };
    isFullGridSupport: boolean;
    theme: string;
    itemPadding: {
        top: string;
        bottom: string;
        left: string;
        right: string
    };
}

export function prepareEmptyEditingColumns(params: IPrepareEmptyEditingColumnsParams): IPreparedEmptyTemplateColumn[] {
    const result = [];
    const multiSelectOffset = +params.hasMultiSelect;
    const gridColumnsCount = params.gridColumns.length;

    let shouldInsertColumnBefore = false;
    let shouldInsertColumnAfter = false;

    params.emptyTemplateColumns.forEach((c, index) => {
        const newColumn: IEmptyTemplateColumn & { classes: string } = { template: c.template, classes: '' };

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
            if (index === params.emptyTemplateColumns.length - 1 && newColumn.endIndex !== gridColumnsCount + 1) {
                shouldInsertColumnAfter = true;
            }
        } else {
            // Если не задали индкс конца колонки, то утанавливаем его либо как индекс последней границы грида,
            // либо как стартовый индекс колонки + 1(по умолчанию, колонка не будет растянута)
            if (index === params.emptyTemplateColumns.length - 1) {
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
        prepareEmptyColumnClasses({
            ...params,
            emptyColumn: resultColumn,
            emptyColumnIndex: index,
            emptyColumnsLength: result.length
        });
        resultColumn.startIndex += multiSelectOffset;
        resultColumn.endIndex += multiSelectOffset;
    });

    return result;
}

function prepareEmptyColumnClasses(params: IPrepareEmptyEditingColumnsParams & {
    emptyColumn: IPreparedEmptyTemplateColumn;
    emptyColumnIndex: number;
    emptyColumnsLength: number;
}): void {
    const isFirst = params.emptyColumnIndex === 0 && !params.hasMultiSelect;
    const isLast = params.emptyColumnIndex === params.emptyColumnsLength - 1;
    const cellPadding = params.gridColumns[params.emptyColumn.startIndex].cellPadding;
    const getCellPadding = (side) => cellPadding && cellPadding[side] ? `_${cellPadding[side].toLowerCase()}` : '';
    const itemPadding = {
        top: (params.itemPadding.top || 'default').toLowerCase(),
        bottom: (params.itemPadding.bottom || 'default').toLowerCase(),
        left: (params.itemPadding.left || 'default').toLowerCase(),
        right: (params.itemPadding.right || 'default').toLowerCase()
    };
    const theme = params.theme;

    let classes = 'controls-GridView__emptyTemplate__cell ';
    classes += `controls-Grid__row-cell-background-editing_theme-${theme} `;

    if (params.isFullGridSupport) {
        classes += `controls-Grid__row-cell__content_baseline_default_theme-${theme} `;
    }

    // Вертикальные отступы шаблона путого списка
    classes +=  `controls-ListView__empty_topSpacing_${params.emptyTemplateSpacing.top || 'default'}_theme-${theme} `;
    classes += `controls-ListView__empty_bottomSpacing_${params.emptyTemplateSpacing.bottom || 'default'}_theme-${theme} `;

    // Вертикальные отступы внутри ячеек
    classes += `controls-Grid__row-cell_rowSpacingTop_${itemPadding.top}_theme-${theme} `;
    classes += `controls-Grid__row-cell_rowSpacingBottom_${itemPadding.bottom}_theme-${theme} `;

    // Левый отступ ячейки
    if (!(params.emptyColumnIndex === 0 && params.hasMultiSelect)) {
        if (isFirst) {
            classes += `controls-Grid__cell_spacingFirstCol_${itemPadding.left}_theme-${theme} `;
        } else {
            classes += `controls-Grid__cell_spacingLeft${getCellPadding('left')}_theme-${theme} `;
        }
    }

    // Правый отступ ячейки
    if (isLast) {
        classes += `controls-Grid__cell_spacingLastCol_${itemPadding.right}_theme-${theme}`;
    } else {
        classes += `controls-Grid__cell_spacingRight${getCellPadding('right')}_theme-${theme}`;
    }

    params.emptyColumn.classes = classes;
}
