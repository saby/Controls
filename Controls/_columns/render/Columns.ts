import { TemplateFunction } from 'UI/Base';
import template = require('wml!Controls/_columns/render/Columns');

import defaultItemTemplate = require('wml!Controls/_columns/render/resources/ItemTemplate');

import {ListView, IList} from 'Controls/list';
import Collection from 'Controls/_columns/display/Collection';

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
    protected _resizeHandler(): void {
        this._notify('controlResize', []);
    }

    protected _getItemsContainerStyle(): string {
        const spacing = this._options.listModel.getSpacing();
        const columnsCount = this._options.listModel.getColumnsCount();
        const minmax = `minmax(${this._options.columnMinWidth + spacing}px, ${this._options.columnMaxWidth + spacing}px) `;
        const gridTemplate = minmax.repeat(columnsCount);
        return `grid-template-columns: ${gridTemplate};
                -ms-grid-columns: ${gridTemplate};`;
    }
    protected _getMinMaxMidthStyle(min: number, max: number): string {
        return `min-width:${min}px; max-width:${max}px; `;
    }
    protected _getPlaceholderStyle(): string {
        return this._getMinMaxMidthStyle(this._options.columnMinWidth, this._options.columnMaxWidth);
    }
    protected _getColumnStyle(index: number): string {
        const spacing = this._options.listModel.getSpacing();
        return this._getMinMaxMidthStyle(this._options.columnMinWidth + spacing, this._options.columnMaxWidth + spacing) + `-ms-grid-column: ${index + 1};`
    }
    static getDefaultOptions(): Partial<IColumnsRenderOptions> {
        return {
            itemTemplate: defaultItemTemplate
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
