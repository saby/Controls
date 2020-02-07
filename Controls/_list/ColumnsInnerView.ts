import * as template from 'wml!Controls/_list/ColumnsInnerView';
import ColumnsController from './Controllers/ColumnsController';
import { TemplateFunction, Control } from 'UI/Base';
import {IList} from 'Controls/_list/interface/IList';
import { ColumnsCollection as Collection, ColumnsCollectionItem as CollectionItem} from 'Controls/display';
import { ICrudPlus } from 'Types/source';
import { SyntheticEvent } from 'Vdom/Vdom';
import { constants } from 'Env/Env';
import * as VirtualScrollController from 'Controls/_display/controllers/VirtualScroll';
import scrollToElement = require('Controls/Utils/scrollToElement');

export interface IColumnsInnerViewOptions extends IList {
    columnMinWidth: number;
    columnMaxWidth: number;
    listModel: Collection<unknown>;
    columnsMode: 'auto' | 'fixed';
    columnsCount: number;
    source: ICrudPlus;
}

const SPACING = 16;
const DEFAULT_MIN_WIDTH = 270;
const DEFAULT_MAX_WIDTH = 400;
const DEFAULT_COLUMNS_COUNT = 2;

export default class ColumnsInnerView extends Control {
    _template: TemplateFunction = template;
    private _itemsContainer: HTMLDivElement;
    private _columnsCount: number = DEFAULT_COLUMNS_COUNT;
    private _minWidth: number = DEFAULT_MIN_WIDTH;
    private _maxWidth: number = DEFAULT_MAX_WIDTH;
    private _columnsController: ColumnsController;
    private _columnsIndexes: number[][];
    private _model: Collection<unknown>;

    protected _options: IColumnsInnerViewOptions;

    protected _beforeMount(options: IColumnsInnerViewOptions): void {
        if (options.columnsCount) {
            this._columnsCount = options.columnsCount;
        }

        this._columnsController = new ColumnsController({columnsMode: options.columnsMode});
        this._onCollectionChange = this._onCollectionChange.bind(this);
        this._subscribeToModelChanges(options.listModel);
        this._resizeHandler = this._resizeHandler.bind(this);
        this._model = options.listModel;
        this.updateColumns();
    }

    protected _afterMount(): void {
       this._resizeHandler();
    }

    protected _beforeUpdate(options: IColumnsInnerViewOptions): void {
        if (options.columnsMode === 'fixed' &&  options.columnsCount !== this._options.columnsCount) {
            this._columnsCount = options.columnsCount;
        }
        if (this._model !== options.listModel) {
            this._model = options.listModel;
        }
    }
    private saveItemsContainer(e: SyntheticEvent<Event>, itemsContainer: HTMLDivElement): void {
        this._itemsContainer = itemsContainer;
    }
    protected _resizeHandler(): void {
        if (this._options.columnsMode === 'auto') {
            const width = this._itemsContainer.getBoundingClientRect().width;
            this._columnsCount = Math.floor(width / (this._options.columnMinWidth || DEFAULT_MIN_WIDTH + SPACING));
            this.updateColumns();
        }
    }
    private setColumnOnItem(item: CollectionItem<unknown>, index: number): void {
        const model = this._model;
        const column = this._columnsController.calcColumn(model, VirtualScrollController.getStartIndex(model) + index, this._columnsCount);
        item.setColumn(column);
        this._columnsIndexes[column].push(index);
    }
    private updateColumns(): void {
        this._columnsIndexes = new Array<[number]>(this._columnsCount);
        for (let i = 0; i < this._columnsCount; i++) {
            this._columnsIndexes[i] = [];
        }
        this._model.each(this.setColumnOnItem.bind(this));
    }

    private processRemoving(removedItemsIndex: number): void {
        const collection = this._options.listModel.getCollection();
        const source = this._options.source;
        const total = collection.getCount(removedItemsIndex);
        if (this._options.columnsMode === 'auto') {
            let currIndex = removedItemsIndex;
            while (currIndex + this._columnsCount - 1 < total) {
                collection.move(currIndex + this._columnsCount - 1, currIndex);
                source.move([currIndex + this._columnsCount - 1], currIndex);
                currIndex += this._columnsCount;
            }
        }
    }
    protected _onCollectionChange(_e: unknown,
                                  action: string,
                                  newItems: [CollectionItem<unknown>],
                                  newItemsIndex: number,
                                  removedItems: [CollectionItem<unknown>],
                                  removedItemsIndex: number): void {
        if (action === 'rm') {
            this.processRemoving(removedItemsIndex);
        }
        if (action === 'a') {
            newItems.forEach(this.setColumnOnItem.bind(this));
        }
        if (action !== 'ch') {
            this.updateColumns();
        }
    }

    protected _beforeUnmount(): void {
        this._unsubscribeFromModelChanges(this._options.listModel);
    }

    protected _unsubscribeFromModelChanges(model: Collection<unknown>): void {
        if (model && !model.destroyed) {
            this._options.listModel.unsubscribe('onCollectionChange', this._onCollectionChange);
        }
    }

    protected _subscribeToModelChanges(model: Collection<unknown>): void {
        this._unsubscribeFromModelChanges(this._options.listModel);
        if (model && !model.destroyed) {
            model.subscribe('onCollectionChange', this._onCollectionChange);
        }
    }
    private getItemToLeft(model: Collection<unknown>, item: CollectionItem<unknown>): CollectionItem<unknown> {
        const curIndex = model.getIndex(item);
        let newIndex: number = curIndex;
        if (this._options.columnsMode === 'auto') {
            if (curIndex > 0) {
                newIndex = curIndex - 1;
            }
        } else {
            const curColumn = item.getColumn();
            const curColumnIndex = this._columnsIndexes[curColumn].indexOf(curIndex);
            if (curColumn > 0 ) {
                const prevColumn = this._columnsIndexes.slice().reverse().find((col: number[], index: number) => index > this._columnsCount - curColumn - 1 && col.length > 0);
                if (prevColumn instanceof Array) {
                    newIndex = prevColumn[Math.min(prevColumn.length - 1, curColumnIndex)];
                }
            }
        }
        return model.at(newIndex);
    }
    private getItemToRight(model: Collection<unknown>, item: CollectionItem<unknown>): CollectionItem<unknown> {
        const curIndex = model.getIndex(item);
        let newIndex: number = curIndex;
        if (this._options.columnsMode === 'auto') {
            if (curIndex < model.getCount() - 1) {
                newIndex = curIndex + 1;
            } else if (curIndex > this._columnsCount) {
                newIndex = curIndex + 1 - this._columnsCount;
            }
        } else {
            const curColumn = item.getColumn();
            const curColumnIndex = this._columnsIndexes[curColumn].indexOf(curIndex);
            if (curColumn < this._columnsCount - 1) {
               const nextColumn = this._columnsIndexes.find((col: number[], index: number) => index > curColumn && col.length > 0);
               if (nextColumn instanceof Array) {
                   newIndex = nextColumn[Math.min(nextColumn.length - 1, curColumnIndex)];
               }
            }
        }
        return model.at(newIndex);
    }
    private getItemToUp(model: Collection<unknown>, item: CollectionItem<unknown>): CollectionItem<unknown> {
        const curIndex = model.getIndex(item);
        let newIndex: number = curIndex;
        if (this._options.columnsMode === 'auto') {
            if (Math.round(curIndex / this._columnsCount) > 0) {
                newIndex = curIndex - this._columnsCount;
            }
        } else {
            const curColumn = item.getColumn();
            const curColumnIndex = this._columnsIndexes[curColumn].indexOf(curIndex);
            if (curColumnIndex > 0) {
                newIndex = this._columnsIndexes[curColumn][curColumnIndex - 1];
            } else {
                newIndex = curIndex;
            }
        }
        return model.at(newIndex);
    }
    private getItemToDown(model: Collection<unknown>, item: CollectionItem<unknown>): CollectionItem<unknown> {
        const curIndex = model.getIndex(item);
        let newIndex: number = curIndex;
        if (this._options.columnsMode === 'auto') {
            if (curIndex + this._columnsCount < model.getCount()) {
                newIndex = curIndex + this._columnsCount;
            }
        } else {
            const curColumn = item.getColumn();
            const curColumnIndex = this._columnsIndexes[curColumn].indexOf(curIndex);
            if (curColumnIndex < this._columnsIndexes[curColumn].length - 1) {
                newIndex = this._columnsIndexes[curColumn][curColumnIndex + 1];
            } else {
                newIndex = curIndex;
            }
        }
        return model.at(newIndex);
    }

    private moveMarker(direction: string): void {
        const model = this._options.listModel;
        if (model && this._options.markerVisibility !== 'hidden') {
            const curMarkedItem = model.getMarkedItem() as CollectionItem<unknown>;
            let newMarkedItem: CollectionItem<unknown>;
            newMarkedItem = this[`getItemTo${direction}`](model, curMarkedItem);
            if (newMarkedItem && curMarkedItem !== newMarkedItem) {
                model.setMarkedItem(newMarkedItem);
                const column = newMarkedItem.getColumn();
                const curIndex = model.getIndex(newMarkedItem);
                const columnIndex = this._columnsIndexes[column].indexOf(curIndex);
                const elem = this._itemsContainer.children[column].children[columnIndex + 1] as HTMLElement;
                scrollToElement(elem, direction === 'Down');
            }
        }
    }
    protected _keyDownHandler(e: SyntheticEvent<KeyboardEvent>): void {
        let direction = '';
        switch (e.nativeEvent.keyCode) {
            case constants.key.left: direction = 'Left'; break;
            case constants.key.up: direction = 'Up'; break;
            case constants.key.right: direction = 'Right'; break;
            case constants.key.down: direction = 'Down'; break;
        }
        if (direction) {
            this.moveMarker(direction);
            e.stopPropagation();
            e.preventDefault();
        }
    }
    static getDefaultOptions(): Partial<IColumnsInnerViewOptions> {
        return {
            columnMinWidth: DEFAULT_MIN_WIDTH,
            columnMaxWidth: DEFAULT_MAX_WIDTH,
            columnsMode: 'auto',
            columnsCount: DEFAULT_COLUMNS_COUNT
        };
    }
}
