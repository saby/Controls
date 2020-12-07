import { ListView } from 'Controls/list';
import { TemplateFunction } from 'UI/Base';
import { TouchContextField as isTouch } from 'Controls/context';
import { Logger} from 'UI/Utils';
import { GridLadderUtil, GridLayoutUtil } from 'Controls/display';
import * as GridTemplate from 'wml!Controls/_gridNew/Render/grid/GridView';
import * as GridItem from 'wml!Controls/_gridNew/Render/grid/Item';
import * as GroupTemplate from 'wml!Controls/_gridNew/Render/GroupTemplate';
import { prepareEmptyEditingColumns, prepareEmptyColumns } from 'Controls/Utils/GridEmptyTemplateUtil';
import * as GridIsEqualUtil from 'Controls/Utils/GridIsEqualUtil';

const GridView = ListView.extend({
    _template: GridTemplate,
    _hoveredCellIndex: null,
    _hoveredCellItem: null,
    _groupTemplate: GroupTemplate,

    _beforeMount(options): void {
        let result = GridView.superclass._beforeMount.apply(this, arguments);
        this._prepareColumnsForEmptyEditingTemplate = this._prepareColumnsForEmptyEditingTemplate.bind(this);
        this._prepareColumnsForEmptyTemplate = this._prepareColumnsForEmptyTemplate.bind(this);
        return result;
    },

    _beforeUpdate(newOptions): void {
        GridView.superclass._beforeUpdate.apply(this, arguments);
        const columnsChanged = !GridIsEqualUtil.isEqualWithSkip(this._options.columns, newOptions.columns,
            { template: true, resultTemplate: true });
        if (columnsChanged) {
            this._listModel.setColumns(newOptions.columns, false);
        }
    },

    _resolveItemTemplate(options): TemplateFunction {
        return options.itemTemplate || this._resolveBaseItemTemplate(options);
    },

    _resolveBaseItemTemplate(options): TemplateFunction {
        return GridItem;
    },

    _getGridTemplateColumns(columns: Array<{width?: string}>, hasMultiSelect: boolean): string {
        if (!columns) {
            Logger.warn('You must set "columns" option to make grid work correctly!', this);
            return '';
        }
        const initialWidths = columns.map(((column) => column.width || GridLayoutUtil.getDefaultColumnWidth()));
        let columnsWidths: string[] = [];
        columnsWidths = initialWidths;
        const ladderStickyColumn = GridLadderUtil.getStickyColumn({
            columns
        });
        if (ladderStickyColumn) {
            if (ladderStickyColumn.property.length === 2) {
                columnsWidths.splice(1, 0, '0px');
            }
            columnsWidths = ['0px'].concat(columnsWidths);
        }
        if (hasMultiSelect) {
            columnsWidths = ['max-content'].concat(columnsWidths);
        }
        return GridLayoutUtil.getTemplateColumnsStyle(columnsWidths);
    },

    _getGridViewClasses(options): string {
        let classes = `controls-Grid controls-Grid_${options.style}_theme-${options.theme}`;
        if (GridLadderUtil.isSupportLadder(options.ladderProperties)) {
            classes += ' controls-Grid_support-ladder';
        }
        return classes;
    },

    _getGridViewStyles(options): string {
        const hasMultiSelect = options.multiSelectVisibility !== 'hidden';
        return this._getGridTemplateColumns(options.columns, hasMultiSelect);
    },

    _onItemMouseMove(event, collectionItem) {
        GridView.superclass._onItemMouseMove.apply(this, arguments);
        this._setHoveredCell(collectionItem.item, event.nativeEvent);
    },

    _onItemMouseLeave() {
        GridView.superclass._onItemMouseLeave.apply(this, arguments);
        this._setHoveredCell(null, null);
    },

    _getCellIndexByEventTarget(event): number {
        if (!event) {
            return null;
        }
        const target = this._getCorrectElement(event.target);

        const gridRow = target.closest('.controls-Grid__row');
        if (!gridRow) {
            return null;
        }
        const gridCells = gridRow.querySelectorAll('.controls-Grid__row-cell');
        const currentCell = this._getCellByEventTarget(target);
        const multiSelectOffset = this._options.multiSelectVisibility !== 'hidden' ? 1 : 0;
        return Array.prototype.slice.call(gridCells).indexOf(currentCell) - multiSelectOffset;
    },

    _getCorrectElement(element: HTMLElement): HTMLElement {
        // В FF целью события может быть элемент #text, у которого нет метода closest, в этом случае рассматриваем как
        // цель его родителя.
        if (element && !element.closest && element.parentElement) {
            return element.parentElement;
        }
        return element;
    },
    _getCellByEventTarget(target: HTMLElement): HTMLElement {
        return target.closest('.controls-Grid__row-cell') as HTMLElement;
    },

    _setHoveredCell(item, nativeEvent): void {
        const hoveredCellIndex = this._getCellIndexByEventTarget(nativeEvent);
        if (item !== this._hoveredCellItem || hoveredCellIndex !== this._hoveredCellIndex) {
            this._hoveredCellItem = item;
            this._hoveredCellIndex = hoveredCellIndex;
            let container = null;
            let hoveredCellContainer = null;
            if (nativeEvent) {
                const target = this._getCorrectElement(nativeEvent.target);
                container = target.closest('.controls-ListView__itemV');
                hoveredCellContainer = this._getCellByEventTarget(target);
            }
            this._notify('hoveredCellChanged', [item, container, hoveredCellIndex, hoveredCellContainer]);
        }
    },

    // todo Переписать, сделать аналогично Footer/Header/Results
    _prepareColumnsForEmptyEditingTemplate(columns, topSpacing, bottomSpacing) {
        return prepareEmptyEditingColumns({
            gridColumns: this._options.columns,
            emptyTemplateSpacing: {
                top: topSpacing,
                bottom: bottomSpacing
            },
            isFullGridSupport: this._options.isFullGridSupport,
            hasMultiSelect: this._options.multiSelectVisibility !== 'hidden' && this._options.multiSelectPosition === 'default',
            colspanColumns: columns,
            itemPadding: this._options.itemPadding || {},
            theme: this._options.theme,
            editingBackgroundStyle: (this._options.editingConfig ? this._options.editingConfig.backgroundStyle : 'default')
        });
    },

    _prepareColumnsForEmptyTemplate(columns, content, topSpacing, bottomSpacing, theme) {
        const ladderStickyColumn = GridLadderUtil.getStickyColumn({
            columns: this._options.columns
        });
        let gridColumns;
        if (ladderStickyColumn) {
            gridColumns = (ladderStickyColumn.property.length === 2 ? [{}, {}] : [{}]).concat(this._options.columns);
        } else {
            gridColumns = this._options.columns;
        }

        return prepareEmptyColumns({
            gridColumns,
            emptyTemplateSpacing: {
                top: topSpacing,
                bottom: bottomSpacing
            },
            isFullGridSupport: this._options.isFullGridSupport,
            hasMultiSelect: this._options.multiSelectVisibility !== 'hidden' && this._options.multiSelectPosition === 'default',
            colspanColumns: content ? [{template: content}] : columns,
            itemPadding: this._options.itemPadding || {},
            theme: this._options.theme,
            afterPrepareCallback(column, index, columns): void {
                column.classes = 'controls-ListView__empty ' +
                    'controls-ListView__empty_theme-default ' +
                    `controls-ListView__empty_topSpacing_${topSpacing}_theme-${theme} ` +
                    `controls-ListView__empty_bottomSpacing_${bottomSpacing}_theme-${theme}`;
            }
        });
    },

    // region space before footer

    _getSpaceBeforeFooterClasses(theme: string): string {
        return `controls-itemActionsV_outside-spacing_theme-${theme}`;
    },

    _getSpaceBeforeFooterStyles(): string {
        const multiSelectOffset = this._options.multiSelectVisibility !== 'hidden' ? 1 : 0;
        const columnStart = 1 + multiSelectOffset;
        const columnEnd = this._listModel.getColumnsConfig().length + 1 + multiSelectOffset;
        return `grid-column: ${columnStart} / ${columnEnd}`;
    }

    // endregion space before footer
});

GridView._theme = ['Controls/grid', 'Controls/Classes'];

GridView.contextTypes = () => {
    return {
        isTouch
    };
};

export default GridView;
