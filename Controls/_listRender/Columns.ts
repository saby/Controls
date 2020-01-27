import { TemplateFunction, IControlOptions } from 'UI/Base';
import template = require('wml!Controls/_listRender/Columns/Columns');

import defaultItemTemplate = require('wml!Controls/_listRender/Columns/resources/ItemTemplate');

import { SyntheticEvent } from 'Vdom/Vdom';
import { CollectionItem, Collection } from 'Controls/display';
import {default as BaseRender, IRenderOptions} from './Render';

export interface IRenderOptions extends IControlOptions {
    listModel: Collection<unknown>;
    contextMenuEnabled?: boolean;
    contextMenuVisibility?: boolean;
    multiselectVisibility?: string;
    itemTemplate?: TemplateFunction;
}

export interface IRenderChildren {
    itemsContainer?: HTMLDivElement;
}

export default class Columns extends BaseRender {
    protected _template: TemplateFunction = template;
    protected _itemTemplate: TemplateFunction;

    protected _beforeMount(options: IRenderOptions): void {
        this._templateKeyPrefix = `columns-render-${this.getInstanceId()}`;
        this._itemTemplate = options.itemTemplate || defaultItemTemplate;

        this._subscribeToModelChanges(options.listModel);
    }

    protected _beforeUnmount(): void {
        this._unsubscribeFromModelChanges(this._options.listModel);
    }

    protected _onItemSwipe(e: SyntheticEvent<null>, item: CollectionItem<unknown>): void {
        e.stopPropagation();
        this._notify('itemSwipe', [item, e]);
    }

    // Обработка клавиатуры будет реализована по работам с маркером в ColumnsView
    protected _onItemKeyDown(e: SyntheticEvent<KeyboardEvent>, item: CollectionItem<unknown>): void {
        e.preventDefault();
        e.stopPropagation();
    }

    // Обработка клавиатуры будет реализована по работам с маркером в ColumnsView
    protected _keyDown(e: SyntheticEvent<KeyboardEvent>): void {
        e.preventDefault();
        e.stopPropagation();
    }
}
