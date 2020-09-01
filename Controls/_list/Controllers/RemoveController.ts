import { RecordSet } from 'Types/collection';
import { ICrud } from 'Types/source';
import { IHashMap } from 'Types/declarations';
import { ISelectionObject, TKeysSelection, TSelectionRecord, TSelectionType } from 'Controls/interface';
import { getItemsBySelection } from '../resources/utils/getItemsBySelection';



/**
 * Контроллер для удаления элементов списка в recordSet и dataSource.
 *
 * @remark
 * Полезные ссылки:
 * * <a href="/materials/Controls-demo/app/Controls-demo%2FList%2FRemove">демо-пример</a>
 * * <a href="/doc/platform/developmentapl/interface-development/controls/list-environment/actions/remover/">руководство разработчика</a>
 * * <a href="https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/aliases/_list.less">переменные тем оформления</a>
 *
 * @class Controls/_list/Controllers/RemoveController
 * @control
 * @public
 * @author Авраменко А.С.
 * @category List
 */

/*
 * Сontrol to remove the list items in recordSet and dataSource.
 * Сontrol must be in one Controls.Container.Data with a list.
 * <a href="/materials/Controls-demo/app/Controls-demo%2FOperationsPanel%2FDemo">Demo examples</a>.
 * @class Controls/_list/Controllers/RemoveController
 * @control
 * @public
 * @author Авраменко А.С.
 * @category List
 */

export class RemoveController {
    private _source: ICrud;
    private _items: RecordSet;
    private _filter: IHashMap<any>;
    private _selectionType: TSelectionType

    constructor(source: ICrud, items: RecordSet, filter: IHashMap<any>, selectionType?: TSelectionType) {
        this.update(source, items, filter, selectionType);
    }

    /**
     * Обновляет поля контроллера
     * @function Controls/_list/Controllers/RemoveController#update
     * @param {Types/source:ICrud} source
     * @param {Types/collection:RecordSet} items
     * @param {Types/declarations:HashMap} filter
     * @param {Controls/interface:TSelectionType} selectionType
     */
    /*
     * Updates controller properties
     * @function Controls/_list/Controllers/RemoveController#update
     * @param {Types/source:ICrud} source
     * @param {Types/collection:RecordSet} items
     * @param {Types/declarations:HashMap} filter
     * @param {Controls/interface:TSelectionType} selectionType
     */
    update(source: ICrud, items: RecordSet, filter: IHashMap<any>, selectionType?: TSelectionType): void {
        this._source = source;
        this._items = items;
        this._filter = filter
        this._selectionType = selectionType;
    }

    /**
     * Удаляет элементы из источника данных по идентификаторам элементов коллекции.
     * @function Controls/interface/IRemovable#removeItems
     * @param {Controls/interface:TKeysSelection|Controls/interface:ISelectionObject} items Массив элементов для удаления.
     * @returns {Promise}
     * @example
     * В следующем примере показано, как удалить элементы из списка после клика по кнопке.
     * <pre>
     *    <Controls.breadcrumbs:Path caption="RemoveItem" on:click="_onRemoveButtonClick()"/>
     * </pre>
     *
     * <pre>
     *    import {Control} from 'Base/UI';
     *    import {RemoveController} from 'Controls/list';
     *    export default class extends Control {
     *       ...
     *       _keysForRemove: [...];
     *       _remover: RemoveController;
     *
     *       _beforeMount(options) {
     *           this._updateRemover(options.source, options.items, options.filter, options.selectionTypeForAllSelected);
     *       }
     *
     *       _beforeUpdate(options) {
     *           this._updateRemover(options.source, options.items, options.filter, options.selectionTypeForAllSelected);
     *       }
     *
     *       _onRemoveButtonClick() {
     *          this._remover.removeItems(this._keysForRemove).then(() => {
     *              alert('Items were removed from source as well from items!');
     *          });
     *       }
     *
     *       _updateRemover(source: ICrud, items: RecordSet, filter: IHashMap, selectionType: TSelectionType) {
     *          if (!this._remover) {
     *              this._remover = new RemoveController(source, items, filter, selectionType);
     *          } else {
     *              this._remover.update(source, items, filter, selectionType);
     *          }
     *       }
     *       ...
     *    });
     * </pre>
     * @see afterItemsRemove
     * @see beforeItemsRemove
     */

    /*
     * Removes items from the data source by identifiers of the items in the collection.
     * @function Controls/interface/IRemovable#removeItems
     * @param {Controls/interface:TKeysSelection|Controls/interface:ISelectionObject} items Array of items to be removed.
     * @returns {Promise}
     * @example
     * The following example shows how to remove items from list after click on the button.
     * <pre>
     *    <Controls.breadcrumbs:Path caption="RemoveItem" on:click="_onRemoveButtonClick()"/>
     * </pre>
     *
     * <pre>
     *    import {Control} from 'Base/UI';
     *    import {RemoveController} from 'Controls/list';
     *    export default class extends Control {
     *       ...
     *       _keysForRemove: [...];
     *       _remover: RemoveController;
     *
     *       _beforeMount(options) {
     *           this._updateRemover(options.source, options.items, options.filter, options.selectionTypeForAllSelected);
     *       }
     *
     *       _beforeUpdate(options) {
     *           this._updateRemover(options.source, options.items, options.filter, options.selectionTypeForAllSelected);
     *       }
     *
     *       _onRemoveButtonClick() {
     *          this._remover.removeItems(this._keysForRemove).then(() => {
     *              alert('Items were removed from source as well from items!');
     *          });
     *       }
     *
     *       _updateRemover(source: ICrud, items: RecordSet, filter: IHashMap, selectionType: TSelectionType) {
     *          if (!this._remover) {
     *              this._remover = new RemoveController(source, items, filter, selectionType);
     *          } else {
     *              this._remover.update(source, items, filter, selectionType);
     *          }
     *       }
     *       ...
     *    });
     * </pre>
     * @see afterItemsRemove
     * @see beforeItemsRemove
     */
    removeItems(items: TKeysSelection|ISelectionObject): Promise<TKeysSelection> {
        return this.getSelectedItems(items).then((selectedItems: TKeysSelection) => (
            this._removeFromSource(selectedItems).then((result) => (
                this._removeFromItems(selectedItems)
            ))
        ));
    }

    /**
     * Возвращает Promise с массивом выбранных записей для удаления
     * Метод сделан public для совместимости с HOC
     * @function
     * @returns {Promise}
     * @private
     * @param {Controls/interface:TKeysSelection|Controls/interface:ISelectionObject|Controls/interface:TSelectionRecord} items
     */
    /*
     * Returns Promise with array of selected records to delete them
     * @function
     * @returns {Promise}
     * @private
     * @param {Controls/interface:TKeysSelection|Controls/interface:ISelectionObject|Controls/interface:TSelectionRecord} items
     */
    getSelectedItems(items: TKeysSelection|ISelectionObject|TSelectionRecord): Promise<TKeysSelection> {
        // Support removing with mass selection.
        // Full transition to selection will be made by:
        // https://online.sbis.ru/opendoc.html?guid=080d3dd9-36ac-4210-8dfa-3f1ef33439aa
        return items instanceof Array
            ? Promise.resolve(items)
            : getItemsBySelection(items, this._source, this._items, this._filter, null, this._selectionType);
    }

    private _removeFromSource(items: TKeysSelection): Promise<void> {
        return this._source.destroy(items);
    }

    private _removeFromItems(items: TKeysSelection): TKeysSelection {
        let item;
        this._items.setEventRaising(false, true);
        for (let i = 0; i < items.length; i++) {
            item = this._items.getRecordById(items[i]);
            if (item) {
                this._items.remove(item);
            }
        }
        this._items.setEventRaising(true, true);
        return items;
    }
}
