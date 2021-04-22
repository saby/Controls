import { TemplateFunction } from 'UI/Base';
import template = require('wml!Controls/_columns/render/Columns');

import defaultItemTemplate = require('wml!Controls/_columns/render/resources/ItemTemplate');

import {ListView, IList} from 'Controls/list';
import Collection from 'Controls/_columns/display/Collection';
import {DEFAULT_COLUMNS_COUNT, DEFAULT_MAX_WIDTH, DEFAULT_MIN_WIDTH} from '../Constants';

export interface IColumnsRenderOptions extends IList {
    columnMinWidth: number;
    columnMaxWidth: number;
    columnsMode: 'auto' | 'fixed' | 'adaptive';
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
        if (options.columnsMode === 'fixed' || options.columnsMode === 'adaptive' &&
            options.columnsCount !== this._options.columnsCount
        ) {
            this._options.listModel.setColumnsCount(options.columnsCount);
        }
    }

    protected _resizeHandler(): void {
        const itemsContainer = this.getItemsContainer();
        const currentWidth = itemsContainer.getBoundingClientRect().width;
        this._options.listModel.setCurrentWidth(currentWidth, this._options.columnMinWidth);
    }

    protected _getItemsContainerStyle(): string {
        const columnsCount = this._options.listModel.getColumnsCount();
        const minmax = `minmax(${this._options.listModel.getColumnMinWidthStyle()}, ${this._options.listModel.getColumnMaxWidthStyle()}) `;
        const gridTemplate = minmax.repeat(columnsCount);
        return `grid-template-columns: ${gridTemplate};
                -ms-grid-columns: ${gridTemplate};`;
    }
    protected _getMinMaxWidthStyle(): string {
        return `min-width:${this._options.listModel.getColumnMinWidthStyle()}; max-width:${this._options.listModel.getColumnMaxWidthStyle()}; `;
    }
    protected _getItemStyle(): string {
        if (this._options.columnsMode === 'adaptive') {
            return 'width: 100%';
        } else {
            return `min-width:${this._options.listModel.getColumnMinWidth()}px; max-width:${this._options.listModel.getColumnMinWidth};`;
        }
    }
    protected _getPlaceholderStyle(): string {
        if (this._options.columnsMode !== 'adaptive') {
            return this._getMinMaxWidthStyle();
        } else {
            return 'width: 100%';
        }
    }

    protected _getColumnStyle(index: number): string {
        return `${this._options.columnsMode !== 'adaptive' ? this._getMinMaxWidthStyle() : 'width: 100%;'}' -ms-grid-column:' ${index + 1};`;
    }

    static getDefaultOptions(): Partial<IColumnsRenderOptions> {
        return {
            itemTemplate: defaultItemTemplate,
            columnMinWidth: DEFAULT_MIN_WIDTH,
            columnMaxWidth: DEFAULT_MAX_WIDTH,
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
