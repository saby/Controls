import * as template from 'wml!Controls/_list/ColumnsContainer';
import ColumnsController from './Controllers/ColumnsController';
import { TemplateFunction, Control } from 'UI/Base';
import {IList} from 'Controls/_list/interface/IList';
import { ColumnsCollection as Collection, ColumnsCollectionItem as CollectionItem} from 'Controls/display';
import { Memory } from 'Types/source';
import { SyntheticEvent } from 'Vdom/Vdom';
import scrollToElement = require('Controls/Utils/scrollToElement');

export interface IColumnsContainerOptions extends IList {
    minWidth: number;
    maxWidth: number;
    listModel: Collection<unknown>;
    columnsMode: 'auto' | 'fixed';
    columnsCount: number;
    source: Memory;
}

const SPACING = 16;
const DEFAULT_MIN_WIDTH = 270;
const DEFAULT_MAX_WIDTH = 400;
const DEFAULT_COLUMNS_COUNT = 2;

const KEY_CODES = {
    37: 'Left',
    38: 'Up',
    39: 'Right',
    40: 'Down'
};

export default class ColumnsContainer extends Control {
    _template: TemplateFunction = template;
    private _itemsContainer: HTMLDivElement;
    private _columnsCount: number = DEFAULT_COLUMNS_COUNT;
    private _minWidth: number = DEFAULT_MIN_WIDTH;
    private _maxWidth: number = DEFAULT_MAX_WIDTH;
    private columnsController: ColumnsController;
    private _columnsIndexes: number[][];

    protected _options: IColumnsContainerOptions;

    protected _beforeMount(options: IColumnsContainerOptions): void {
        if (options.columnsMode === 'fixed' && options.columnsCount) {
            this._columnsCount = options.columnsCount;
        }
        if (options.minWidth) {
            this._minWidth = options.minWidth;
        }
        if (options.maxWidth) {
            this._maxWidth = options.maxWidth;
        }

        this.columnsController = new ColumnsController({columnsMode: options.columnsMode});
        this._onCollectionChange = this._onCollectionChange.bind(this);
        this._subscribeToModelChanges(options.listModel);
        this._resizeHandler = this._resizeHandler.bind(this);

        this.updateColumns(options.listModel);
    }

    protected _afterMount(): void {
       this._resizeHandler();
    }

    protected _beforeUpdate(options: IColumnsContainerOptions): void {
        if (options.columnsMode === 'fixed' &&  options.columnsCount !== this._options.columnsCount) {
            this._columnsCount = options.columnsCount;
        }
        if (options.minWidth !== this._options.minWidth) {
            this._minWidth = options.minWidth;
        }
        if (options.maxWidth !== this._options.maxWidth) {
            this._maxWidth = options.maxWidth;
        }
    }
    private saveItemsContainer(e: SyntheticEvent<Event>, itemsContainer: HTMLDivElement): void {
        this._itemsContainer = itemsContainer;
    }
    protected _resizeHandler(): void {
        if (this._options.columnsMode === 'auto') {
            const width = this._itemsContainer.getBoundingClientRect().width;
            this._columnsCount = Math.floor(width / (this._options.minWidth || DEFAULT_MIN_WIDTH + SPACING));
        }
        this.updateColumns(this._options.listModel);
    }
    private updateColumns(model: Collection<unknown>): void {
        this._columnsIndexes = new Array<[number]>(this._columnsCount);
        for (let i = 0; i < this._columnsCount; i++) {
            this._columnsIndexes[i] = [];
        }
        const setColumns = (item: CollectionItem<unknown>, index: number) => {
            const column = this.columnsController.getColumn(model, model.getStartIndex() + index, this._columnsCount);
            item.setColumn(column);
            this._columnsIndexes[column].push(index);
        };
        model.each(setColumns);
    }

    protected _onCollectionChange(_e: unknown,
                                  action: string,
                                  newItems: [CollectionItem<unknown>],
                                  newItemsIndex: number,
                                  removedItems: [CollectionItem<unknown>],
                                  removedItemsIndex: number): void {
        const collection = this._options.listModel.getCollection();
        const source = this._options.source;
        const total = collection.getCount();
        if (action === 'rm') {
            if (this._options.columnsMode === 'auto') {
                let currIndex = removedItemsIndex;
                while (currIndex + this._columnsCount - 1 < total) {
                    collection.move(currIndex + this._columnsCount - 1, currIndex);
                    source.move(currIndex + this._columnsCount - 1, currIndex);
                    currIndex += this._columnsCount;
                }
            }
        }
        if (action === 'a') {
            newItems.forEach((item, index) => {
                item.setColumn(this.columnsController.getColumn(this._options.listModel,
                                                                newItemsIndex + index,
                                                                this._columnsCount));
            });
        }
        if (action !== 'ch') {
            this.updateColumns(this._options.listModel);
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
        const direction = KEY_CODES[e.nativeEvent.keyCode];
        if (direction) {
            this.moveMarker(direction);
            e.stopPropagation();
            e.preventDefault();
        }
    }
}
