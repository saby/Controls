import {RecordSet} from 'Types/collection';

export interface IItemsOptions<T> {
    items?: RecordSet<T>;
}

/**
 * Набор записей.
 *
 * @interface Controls/_interface/IItems
 * @public
 * @author Красильников А.С.
 */
export default interface IItems {
    readonly '[Controls/_interface/IItems]': boolean;
}
/**
 * @name Controls/_interface/IItems#items
 * @cfg {RecordSet.<Controls/_toolbars/IToolbarSource/Item.typedef>} Определяет набор записей по которым строится контрол.
 * @demo Controls-demo/Toolbar/Items/Index
 */
