import {Control} from 'UI/Base';
import {TKeysSelection} from 'Controls/interface';

/**
 * Интерфейс контрола для удаления записей
 * @interface Controls/_list/interface/IRemover
 * @public
 * @author Аверкиев П.А.
 */

export interface IRemover extends Control {
    /**
     * Удаляет элементы из источника данных по идентификаторам элементов коллекции.
     * @function Controls/interface/IRemovable#removeItems
     * @param {Controls/interface:TKeysSelection} items Массив элементов для удаления.
     * @returns {Promise}
     * @see afterItemsRemove
     * @see beforeItemsRemove
     */

    /*
     * Removes items from the data source by identifiers of the items in the collection.
     * @function Controls/interface/IRemovable#removeItems
     * @param {Controls/interface:TKeysSelection} items Array of items to be removed.
     * @returns {Promise}
     * @see afterItemsRemove
     * @see beforeItemsRemove
     */
    removeItems(items: TKeysSelection): Promise<void>;
}
