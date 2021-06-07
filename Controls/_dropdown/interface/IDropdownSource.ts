import {ICrudPlus} from 'Types/source';

export interface IDropdownSourceOptions {
    source?: ICrudPlus;
}

/**
 * Интерфейс для источника данных, который возвращает данные в формате, необходимом для контролов {@link Controls/dropdown:Selector} и {@link Controls/dropdown:Button}.
 *
 * @interface Controls/_dropdown/interface/IDropdownSource
 * @public
 * @author Золотова Э.Е.
 */
export default interface IDropdownSource {
    readonly '[Controls/_dropdown/interface/IDropdownSource]': boolean;
}