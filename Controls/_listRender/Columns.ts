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
}

export default class Columns extends BaseRender {
    protected _options: IColumnsRenderOptions;
    protected _template: TemplateFunction = template;

    protected _beforeMount(options: IRenderOptions): void {
        super._beforeMount(options);
        this._templateKeyPrefix = `columns-render-${this.getInstanceId()}`;
    }

    protected _beforeUnmount(): void {
        this._unsubscribeFromModelChanges(this._options.listModel);
    }

    protected _resizeHandler(): void {
        this._notify('resize', []);
    }
    protected _onItemSwipe(e: SyntheticEvent<null>, item: ColumnsCollectionItem<unknown>): void {
        e.stopPropagation();
        this._notify('itemSwipe', [item, e]);
    }

    static getDefaultOptions(): Partial<IRenderOptions> {
        return {
            itemTemplate: defaultItemTemplate
        };
    }
}
