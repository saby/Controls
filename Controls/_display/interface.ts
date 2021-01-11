import IItemsStrategy from './IItemsStrategy';
import {ICollectionItem} from './interface/ICollectionItem';
import {ISourceCollection} from './interface/ICollection';

export type TItemKey = string | number;

export interface IBaseCollection<S, T extends ICollectionItem> {
    at(index: number): T;
    each(cb: (item: T) => void): void;
    getItemBySourceKey(key: TItemKey): T;
    find(predicate: (item: T) => boolean): T;
    nextVersion(): void;
    getCollection(): ISourceCollection<S>;
    getFirst(): T;
    getNextByKey(key: TItemKey): T;
    getPrevByKey(key: TItemKey): T;
    createItem(constructorOptions): T;
    setEventRaising?(enabled: boolean, analyze?: boolean): void;
    isEventRaising?(): boolean;
    getCount?(): number;
    getNext?(item: T): T;
    getPrevious?(item: T): T;
    getItemBySourceItem?(item: S): T;
}

export interface IStrategyCollection<T> {
    appendStrategy(strategy: Function, options?: object): void;
    getStrategyInstance(strategy: Function): IItemsStrategy<unknown, T>;
    removeStrategy(strategy: Function): void;
}
