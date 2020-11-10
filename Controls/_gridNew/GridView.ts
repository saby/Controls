import { ListView } from 'Controls/list';
import { TemplateFunction } from 'UI/Base';
import { TouchContextField as isTouch } from 'Controls/context';
import { Logger} from 'UI/Utils';
import { GridLayoutUtil } from 'Controls/grid';
import * as GridTemplate from 'wml!Controls/_gridNew/Render/grid/GridView';
import * as TableTemplate from 'wml!Controls/_gridNew/Render/table/GridView';
import * as GridItem from 'wml!Controls/_gridNew/Render/grid/Item';
import * as TableItem from 'wml!Controls/_gridNew/Render/table/Item';
import { prepareEmptyEditingColumns } from '../_grid/utils/GridEmptyTemplateUtil';

const _private = {
    getGridTemplateColumns(self, columns: Array<{width?: string}>, hasMultiSelect: boolean): string {
        if (!columns) {
            Logger.warn('You must set "columns" option to make grid work correctly!', self);
            return '';
        }
        const initialWidths = columns.map(((column) => column.width || GridLayoutUtil.getDefaultColumnWidth()));
        let columnsWidths: string[] = [];
        columnsWidths = initialWidths;
        if (hasMultiSelect) {
            columnsWidths = ['max-content'].concat(columnsWidths);
        }
        return GridLayoutUtil.getTemplateColumnsStyle(columnsWidths);
    }
};

const GridView = ListView.extend({
    _template: null,
    _hoveredCellIndex: null,
    _hoveredCellItem: null,
    _isFullGridSupport: false,

    constructor(cfg) {
        this._isFullGridSupport = cfg.isFullGridSupport;
        this._template = this._isFullGridSupport ? GridTemplate : TableTemplate;

        GridView.superclass.constructor.apply(this, arguments);
    },

    _beforeMount(options): void {
        let result = GridView.superclass._beforeMount.apply(this, arguments);
        this._prepareColumnsForEmptyEditingTemplate = this._prepareColumnsForEmptyEditingTemplate.bind(this);
        return result;
    },

    _resolveItemTemplate(options): TemplateFunction {
        return options.itemTemplate || this._resolveBaseItemTemplate();
    },

    _resolveBaseItemTemplate(): TemplateFunction {
        return this._isFullGridSupport ? GridItem : TableItem;
    },

    _getGridViewClasses(): string {
        let classes = `controls-Grid controls-Grid_${this._options.style}_theme-${this._options.theme}`;

        if (!this._isFullGridSupport) {
            classes += ' controls-Grid_table-layout controls-Grid_table-layout_fixed';
        }
        return classes;
    },

    _getGridViewStyles(): string {
        let styles = '';
        if (this._isFullGridSupport) {
            const hasMultiSelect = this._options.multiSelectVisibility !== 'hidden';
            styles += _private.getGridTemplateColumns(this, this._options.columns, hasMultiSelect);
        }
        return styles;
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
            isFullGridSupport: GridLayoutUtil.isFullGridSupport(),
            hasMultiSelect: this._options.multiSelectVisibility !== 'hidden' && this._options.multiSelectPosition === 'default',
            emptyTemplateColumns: columns,
            itemPadding: this._options.itemPadding || {},
            theme: this._options.theme
        });
    }
});

GridView._private = _private;

GridView._theme = ['Controls/grid', 'Controls/Classes'];

GridView.contextTypes = () => {
    return {
        isTouch
    };
};

export = GridView;
