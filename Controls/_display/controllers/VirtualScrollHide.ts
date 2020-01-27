import * as VirtualScroll from './VirtualScroll';
import { EnumeratorCallback } from 'Types/collection';

export interface IVirtualScrollHideItem {
    setRendered(rendered: boolean): void;
    isRendered(): boolean;
}

export interface IVirtualScrollHideEnumerator extends VirtualScroll.IVirtualScrollEnumerator {
    getCurrent(): IVirtualScrollHideItem;
}

export interface IVirtualScrollHideCollection extends VirtualScroll.IVirtualScrollCollection {
    at(pos: number): IVirtualScrollHideItem;
    getEnumerator(): IVirtualScrollHideEnumerator;
}

export function setup(collection: IVirtualScrollHideCollection): void {
    VirtualScroll.setup(collection);
    collection.setViewIterator({
        ...collection.getViewIterator(),
        each: each.bind(null, collection),
        setIndices: setIndices.bind(null, collection),
        isItemAtIndexHidden: isItemAtIndexHidden.bind(null, collection)
    });
    collection.nextVersion();
}

export function setIndices(
    collection: IVirtualScrollHideCollection,
    startIndex: number,
    stopIndex: number
): boolean {
    const indicesChanged = VirtualScroll.setIndices(
        collection,
        startIndex,
        stopIndex
    );
    _applyRenderedItems(collection);
    collection.nextVersion();
    return indicesChanged;
}

export function each(
    collection: IVirtualScrollHideCollection,
    callback: EnumeratorCallback<unknown>,
    context?: object
): void {
    const enumerator = collection.getEnumerator();

    enumerator.setPosition(-1);

    while (enumerator.moveNext()) {
        const item = enumerator.getCurrent();
        if (item.isRendered()) {
            callback.call(context, item, enumerator.getCurrentIndex());
        }
    }
}

export function isItemAtIndexHidden(
    collection: IVirtualScrollHideCollection,
    index: number
): boolean {
    return (
        index < VirtualScroll.getStartIndex(collection) ||
        index >= VirtualScroll.getStopIndex(collection)
    );
}

function _applyRenderedItems(collection: IVirtualScrollHideCollection): void {
    const renderedStart = VirtualScroll.getStartIndex(collection);
    const renderedStop = VirtualScroll.getStopIndex(collection);
    for (let i = renderedStart; i < renderedStop; i++) {
        collection.at(i).setRendered(true);
    }
}
