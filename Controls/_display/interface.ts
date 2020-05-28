import IItemsStrategy from './IItemsStrategy';

export type TItemKey = string | number;

export interface IBaseCollection<T> {
    each(cb: (item: T) => void): void;
    getItemBySourceKey(key: TItemKey): T;
    getCount(): number;
    find(predicate: (item: T) => boolean): T;
    some(predicate: (item: T) => boolean): boolean;
    getNext(item: T): T;
    getPrevious(item: T): T;
    nextVersion(): void;
}

export interface IStrategyCollection<T> {
    appendStrategy(strategy: Function, options?: object): void;
    getStrategyInstance(strategy: Function): IItemsStrategy<unknown, T>;
    removeStrategy(strategy: Function): void;
}

export interface ICollectionCommand<T> {
    execute(collection: IBaseCollection<T>): void;
}
