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
    collection.nextVersion();
}

export function setIndices(
    collection: IVirtualScrollCollection,
    startIndex: number,
    stopIndex: number
): boolean {
    const oldStart = getStartIndex(collection);
    const oldStop = getStopIndex(collection);

    const newStart = Math.max(startIndex, 0);
    const newStop = Math.min(stopIndex, collection.getCount());

    if (newStart !== oldStart || newStop !== oldStop) {
        const viewIterator = {
            ...collection.getViewIterator(),
            data: {
                startIndex: newStart,
                stopIndex: newStop
            }
        };
        collection.setViewIterator(viewIterator);
        collection.nextVersion();
        return true;
    }

    return false;
}

export function each(
    collection: IVirtualScrollCollection,
    callback: EnumeratorCallback<unknown>,
    context?: object
): void {
    const startIndex = getStartIndex(collection);
    const stopIndex = getStopIndex(collection);
    const enumerator = collection.getEnumerator();

    enumerator.setPosition(startIndex - 1);

    while (enumerator.moveNext() && enumerator.getCurrentIndex() < stopIndex) {
        callback.call(
            context,
            enumerator.getCurrent(),
            enumerator.getCurrentIndex()
        );
    }
}

export function getStartIndex(collection: IVirtualScrollCollection): number {
    return collection.getViewIterator()?.data?.startIndex ?? 0;
}

export function getStopIndex(collection: IVirtualScrollCollection): number {
    return collection.getViewIterator()?.data?.stopIndex ?? collection.getCount();
}
