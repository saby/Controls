import { IBaseCollection } from '../interface';
import { IViewIterator } from '../Collection';
import { EnumeratorCallback } from 'Types/collection';

export interface IVirtualScrollEnumerator {
    setPosition(pos: number): void;
    moveNext(): boolean;
    getCurrentIndex(): number;
    getCurrent(): unknown;
}

export interface IVirtualScrollViewIterator extends IViewIterator {
    data: {
        startIndex: number;
        stopIndex: number;
    };
}

export interface IVirtualScrollCollection extends IBaseCollection<unknown> {
    setViewIterator(viewIterator: IVirtualScrollViewIterator): void;
    getViewIterator(): IVirtualScrollViewIterator;
    getCount(): number;
    getEnumerator(): IVirtualScrollEnumerator;
}

export function setup(collection: IVirtualScrollCollection): void {
    collection.setViewIterator({
        each: each.bind(null, collection),
        setIndices: setIndices.bind(null, collection),
        isItemAtIndexHidden: () => false,
        data: {
            startIndex: 0,
            stopIndex: collection.getCount()
        }
    });
}

export function setIndices(
    collection: IVirtualScrollCollection,
    startIndex: number,
    stopIndex: number
): boolean {
    const currentViewIterator = collection.getViewIterator();
    if (currentViewIterator.data &&
        (currentViewIterator.data.startIndex !== startIndex || currentViewIterator.data.stopIndex !== stopIndex)) {
        const viewIterator = {
            ...collection.getViewIterator(),
            data: {
                startIndex,
                stopIndex
            }
        };
        collection.setViewIterator(viewIterator);
        collection.nextVersion();
    }
    return true;
}

export function each(
    collection: IVirtualScrollCollection,
    callback: EnumeratorCallback<unknown>,
    context?: object
): void {
    const startIndex = getStartIndex(collection);
    const stopIndex = getStopIndex(collection);
    const enumerator = collection.getEnumerator();
    const count = collection.getCount();

    let styckyItemBefore = null;
    let styckyItemAfter = null;
    enumerator.setPosition(-1);
    while (enumerator.moveNext() && enumerator.getCurrentIndex() < startIndex) {
        let current = enumerator.getCurrent() as any;
        if (current && current.isSticked && current.isSticked()) {
            styckyItemBefore = { current, index: enumerator.getCurrentIndex() };
        }
    }
    enumerator.setPosition(stopIndex - 1);
    while (enumerator.moveNext() && enumerator.getCurrentIndex() < count) {
        let current = enumerator.getCurrent() as any;
        if (current && current.isSticked && current.isSticked()) {
            styckyItemAfter = { current, index: enumerator.getCurrentIndex() };
            break;
        }
    }

    if (styckyItemBefore) {
        callback.call(
            context,
            styckyItemBefore.current,
            styckyItemBefore.index
        );
    }
    enumerator.setPosition(startIndex - 1);

    while (enumerator.moveNext() && enumerator.getCurrentIndex() < stopIndex) {
        callback.call(
            context,
            enumerator.getCurrent(),
            enumerator.getCurrentIndex()
        );
    }

    if (styckyItemAfter) {
        callback.call(
            context,
            styckyItemAfter.current,
            styckyItemAfter.index
        );
    }
}

export function getStartIndex(collection: IVirtualScrollCollection): number {
    return collection.getViewIterator()?.data?.startIndex ?? 0;
}

export function getStopIndex(collection: IVirtualScrollCollection): number {
    // todo временный фикс, убрать по 
    // https://online.sbis.ru/opendoc.html?guid=5c0a021b-38a6-4d28-8c5c-cf9d9f27e651
    const collectionCount = collection.getCount();
    const iteratorCount = collection.getViewIterator()?.data?.stopIndex;
    return typeof iteratorCount === 'number' && iteratorCount <= collectionCount ? iteratorCount : collectionCount;
}
