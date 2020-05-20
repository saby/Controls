import { TemplateFunction } from 'UI/Base';
import template = require('wml!Controls/_listRender/Columns/Columns');

import defaultItemTemplate = require('wml!Controls/_listRender/Columns/resources/ItemTemplate');

import { SyntheticEvent } from 'Vdom/Vdom';
import { ColumnsCollectionItem } from 'Controls/display';
import { default as BaseRender, IRenderOptions } from './Render';

export interface IColumnsRenderOptions extends IRenderOptions {
    columnMinWidth: number;
    columnMaxWidth: number;
    columnsMode: 'auto' | 'fixed';
    columnsCount: number;
    spacing: number;
}

export default class Columns extends BaseRender {
    protected _options: IColumnsRenderOptions;
    protected _template: TemplateFunction = template;

    protected _beforeMount(options: IColumnsRenderOptions): void {
        super._beforeMount(options);
        this._templateKeyPrefix = 'columns-render';
    }
    protected _beforeUnmount(): void {
        this._unsubscribeFromModelChanges(this._options.listModel);
    }
    protected _resizeHandler(): void {
        this._notify('resize', []);
    }

    protected _getItemsContainerStyle(): string {
        const minmax = `minmax(${this._options.columnMinWidth + this._options.spacing}px, ${this._options.columnMaxWidth  + this._options.spacing}px) `;
        const gridTemplate = minmax.repeat(this._options.columnsCount);
        return  `grid-template-columns: ${gridTemplate};
                 -ms-grid-columns: ${gridTemplate};`;
    }
    protected _getMinMaxMidthStyle(min: number, max: number): string {
        return  `min-width:${min}px; max-width:${max}px; `;
    }
    protected _getPlaceholderStyle(): string {
        return  this._getMinMaxMidthStyle(this._options.columnMinWidth, this._options.columnMaxWidth);
    }
    protected _getColumnStyle(index: number): string {
        return this._getMinMaxMidthStyle(this._options.columnMinWidth + this._options.spacing, this._options.columnMaxWidth + this._options.spacing) + `-ms-grid-column: ${index + 1};`
    }
    static getDefaultOptions(): Partial<IRenderOptions> {
        return {
            itemTemplate: defaultItemTemplate
        };
    }
}
