import { TemplateFunction } from 'UI/Base';
import template = require('wml!Controls/_columns/render/Columns');

import defaultItemTemplate = require('wml!Controls/_columns/render/resources/ItemTemplate');

import {ListView, IList} from 'Controls/list';
import Collection from 'Controls/_columns/display/Collection';
import {DEFAULT_COLUMNS_COUNT} from '../Constants';

export interface IColumnsRenderOptions extends IList {
    columnMinWidth: number;
    columnMaxWidth: number;
    columnsMode: 'auto' | 'fixed';
    columnsCount: number;
    spacing: number;
    listModel: Collection;
}

export default class Columns extends ListView {
    protected _options: IColumnsRenderOptions;
    protected _template: TemplateFunction = template;
    protected _templateKeyPrefix: string;

    protected _beforeMount(options: IColumnsRenderOptions): void {
        super._beforeMount(options);
        this._templateKeyPrefix = 'columns-render';
    }

    protected _afterMount(options: IColumnsRenderOptions): void {
        super._afterMount(options);
        this._resizeHandler();
    }

    protected _beforeUpdate(options: IColumnsRenderOptions): void {
        super._beforeUpdate(options);
        if (options.columnsMode === 'fixed' && options.columnsCount !== this._options.columnsCount) {
            this._options.listModel.setColumnsCount(options.columnsCount);
        }
    }

    protected _resizeHandler(): void {
        const itemsContainer = this.getItemsContainer();
        const currentWidth = itemsContainer.getBoundingClientRect().width;
        this._options.listModel.setCurrentWidth(currentWidth, this._options.columnMinWidth);
    }

    protected _getColumnMinWidth(columnMinWidth: number | void, spacing: number = 0, columnsCount: number): string {
        if (columnMinWidth) {
            return `${columnMinWidth + spacing}px`;
        } else {
            return `calc(${Math.round(100 / columnsCount)}%)`;
        }
    }

    protected _getColumnMaxWidth(columnMaxWidth: number | void, spacing: number): string {
        if (columnMaxWidth) {
            return `${columnMaxWidth + spacing}px`;
        } else {
            return '100%';
        }
    }

    protected _getItemsContainerStyle(): string {
        const spacing = this._options.listModel.getSpacing();
        const columnsCount = this._options.listModel.getColumnsCount();
        const columnMinWidth = this._getColumnMinWidth(this._options.columnMinWidth, spacing, columnsCount);
        const columnMaxWidth = this._getColumnMaxWidth(this._options.columnMaxWidth, spacing);
        const minmax = `minmax(${columnMinWidth}, ${columnMaxWidth}) `;
        const gridTemplate = minmax.repeat(columnsCount);
        return `grid-template-columns: ${gridTemplate};
                -ms-grid-columns: ${gridTemplate};`;
    }
    protected _getMinMaxWidthStyle(min: number, max: number): string {
        const spacing = this._options.listModel.getSpacing();
        const columnsCount = this._options.listModel.getColumnsCount();
        const columnMinWidth = this._getColumnMinWidth(min, spacing, columnsCount);
        const columnMaxWidth = this._getColumnMaxWidth(max, spacing);
        return `min-width:${columnMinWidth}; max-width:${columnMaxWidth}px; `;
    }
    protected _getPlaceholderStyle(): string {
        return this._getMinMaxWidthStyle(this._options.columnMinWidth, this._options.columnMaxWidth);
    }

    protected _getColumnStyle(index: number): string {
        return this._getMinMaxWidthStyle(this._options.columnMinWidth, this._options.columnMaxWidth)
               + `-ms-grid-column: ${index + 1};`;
    }

    static getDefaultOptions(): Partial<IColumnsRenderOptions> {
        return {
            itemTemplate: defaultItemTemplate,
            columnsMode: 'auto',
            columnsCount: DEFAULT_COLUMNS_COUNT
        };
    }
}

Object.defineProperty(Columns, 'defaultProps', {
   enumerable: true,
   configurable: true,

   get(): object {
      return Columns.getDefaultOptions();
   }
});
