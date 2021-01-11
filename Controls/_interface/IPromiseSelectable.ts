import {TKey} from 'Controls/interface';

export interface IPromiseSelectableOptions {
    selectedKeys?: TKey[];
    excludedKeys?: TKey[];
}

/**
 * Интерфейс для контролов, где одновременно можно выбрать несколько элементов и количество выбранных элементов неизвестно.
 * @public
 * @author Авраменко А.С.
 * @see Controls/_interface/ISingleSelectable
 * @see Controls/interface/IMultiSelectable
 */
export default interface IPromiseSelectable {
    readonly '[Controls/_interface/IPromiseSelectable]': boolean;
}
