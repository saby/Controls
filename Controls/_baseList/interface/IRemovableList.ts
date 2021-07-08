import {ISelectionObject} from 'Controls/interface';

/**
 * Интерфейс контрола для удаления записей
 * @interface Controls/_list/interface/IRemovableList
 * @public
 * @author Аверкиев П.А.
 */

export interface IRemovableList {
    /**
     * Удаляет элементы из источника данных по идентификаторам элементов коллекции.
     * @function Controls/_list/interface/IRemovableList#removeItems
     * @param {Controls/interface:ISelectionObject} items Массив элементов для удаления.
     * @returns {Promise}
     */

    /*
     * Removes items from the data source by identifiers of the items in the collection.
     * @function Controls/_list/interface/IRemovableList#removeItems
     * @param {Controls/interface:ISelectionObject} items Array of items to be removed.
     * @returns {Promise}
     */
    removeItems(items: ISelectionObject): Promise<void>;

    /**
     * Удаляет с подтверждением элементы из источника данных по идентификаторам элементов коллекции.
     * @function Controls/_list/interface/IRemovableList#removeItemsWithConfirmation
     * @param {Controls/interface:ISelectionObject} items Массив элементов для удаления.
     * @returns {Promise}
     */

    /*
     * Removes items with confirmation from the data source by identifiers of the items in the collection.
     * @function Controls/_list/interface/IRemovableList#removeItemsWithConfirmation
     * @param {Controls/interface:ISelectionObject} items Array of items to be removed.
     * @returns {Promise}
     */
    removeItemsWithConfirmation(items: ISelectionObject): Promise<void>;
}
