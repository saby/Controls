import { TemplateFunction } from 'UI/Base';
import template = require('wml!Controls/_listRender/Columns/Columns');

import defaultItemTemplate = require('wml!Controls/_listRender/Columns/resources/ItemTemplate');

import { SyntheticEvent } from 'Vdom/Vdom';
import {ColumnsCollectionItem } from 'Controls/display';
import {default as BaseRender, IRenderOptions} from './Render';
import {IColumnsContainerOptions} from "../_list/ColumnsContainer";

export interface IColumnsRenderOptions extends IRenderOptions {
    minWidth: number;
    columnsMode: 'auto' | 'fixed';
    columnsCount: number;
}

const DEFAULT_COLUMNS_COUNT = 2;

export default class Columns extends BaseRender {
    protected _options: IColumnsRenderOptions;
    protected _template: TemplateFunction = template;
    protected _itemTemplate: TemplateFunction;
    private _columnsCount: number = DEFAULT_COLUMNS_COUNT;

    protected _beforeMount(options: IColumnsRenderOptions): void {
        super._beforeMount.apply(this, arguments);
        this._templateKeyPrefix = `columns-render-${this.getInstanceId()}`;
        this._itemTemplate = options.itemTemplate || defaultItemTemplate;
        if (options.columnsCount) {
            this._columnsCount = options.columnsCount;
        }
    }

    protected _beforeUpdate(options: IColumnsContainerOptions): void {
        if (options.columnsCount !== this._options.columnsCount) {
            this._columnsCount = options.columnsCount;
        }
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
}
