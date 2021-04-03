import { IPreparedColumn, IPrepareColumnsParams, prepareColumns } from './GridColumnsColspanUtil';

interface IPreparedEmptyTemplateColumn extends IPreparedColumn {
    classes: string;
}

interface IPrepareEmptyEditingColumnsParams extends IPrepareColumnsParams<IPreparedEmptyTemplateColumn> {
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
    editingBackgroundStyle?: string;
}

export function prepareEmptyEditingColumns(params: IPrepareEmptyEditingColumnsParams): IPreparedEmptyTemplateColumn[] {
    return prepareColumns<IPreparedEmptyTemplateColumn>({
        ...params,
        afterPrepareCallback(column, index, columns): void {
            column.classes = getEmptyColumnClasses({
                ...params,
                emptyColumn: column,
                emptyColumnIndex: index,
                emptyColumnsLength: columns.length
            });
        }
    });
}

export function prepareEmptyColumns(params: IPrepareEmptyEditingColumnsParams): IPreparedEmptyTemplateColumn[] {
    return prepareColumns<IPreparedEmptyTemplateColumn>({...params});
}

function getEmptyColumnClasses(params: IPrepareEmptyEditingColumnsParams & {
    emptyColumn: IPreparedEmptyTemplateColumn;
    emptyColumnIndex: number;
    emptyColumnsLength: number;
}): string {
    const isFirst = params.emptyColumnIndex === 0 && !params.hasMultiSelect;
    const isLast = params.emptyColumnIndex === params.emptyColumnsLength - 1;
    const cellPadding = params.gridColumns[params.emptyColumn.startColumn].cellPadding;
    const getCellPadding = (side) => cellPadding && cellPadding[side] ? `_${cellPadding[side].toLowerCase()}` : '';
    const editingBackgroundStyle = params.editingBackgroundStyle || 'default';
    const itemPadding = {
        top: (params.itemPadding.top || 'default').toLowerCase(),
        bottom: (params.itemPadding.bottom || 'default').toLowerCase(),
        left: (params.itemPadding.left || 'default').toLowerCase(),
        right: (params.itemPadding.right || 'default').toLowerCase()
    };
    const theme = params.theme;

    if (params.emptyColumnIndex === 0 && params.hasMultiSelect) {
        return `controls-GridView__emptyTemplate__checkBoxCell controls-Grid__row-cell-editing
        controls-Grid__row-cell-background-editing_${editingBackgroundStyle}`;
    }

    let classes = 'controls-GridView__emptyTemplate__cell ';
    classes += `controls-Grid__row-cell-editing `;
    classes += `controls-Grid__row-cell-background-editing_${editingBackgroundStyle} `;

    if (params.isFullGridSupport) {
        classes += `controls-Grid__row-cell__content_baseline_default `;
    }

    // Вертикальные отступы шаблона путого списка
    classes +=  `controls-ListView__empty_topSpacing_${params.emptyTemplateSpacing.top || 'default'} `;
    classes += `controls-ListView__empty_bottomSpacing_${params.emptyTemplateSpacing.bottom || 'default'} `;

    // Вертикальные отступы внутри ячеек
    classes += `controls-Grid__row-cell_rowSpacingTop_${itemPadding.top} `;
    classes += `controls-Grid__row-cell_rowSpacingBottom_${itemPadding.bottom} `;

    // Левый отступ ячейки
    if (!(params.emptyColumnIndex < 2 && params.hasMultiSelect)) {
        if (isFirst) {
            classes += `controls-Grid__cell_spacingFirstCol_${itemPadding.left} `;
        } else {
            classes += `controls-Grid__cell_spacingLeft${getCellPadding('left')} `;
        }
    }

    // Правый отступ ячейки
    if (isLast) {
        classes += `controls-Grid__cell_spacingLastCol_${itemPadding.right}`;
    } else {
        classes += `controls-Grid__cell_spacingRight${getCellPadding('right')}`;
    }

    return classes;
}
