export interface IDragPosition<T> {
    index: number;
    position: 'after'|'before'|'on';
    dispItem: T;
}
