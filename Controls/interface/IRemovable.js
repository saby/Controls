/* eslint-disable */
define('Controls/interface/IRemovable', [], function() {


   /**
    * Интерфейс для удаления элементов в коллекциях.
    *
    * @interface Controls/interface/IRemovable
    * @public
    * @author Авраменко А.С.
    */

   /*
    * Interface for item removal in collections.
    *
    * @interface Controls/interface/IRemovable
    * @public
    * @author Авраменко А.С.
    */

   /**
    * @typedef {String} SelectionType
    * @variant {'all'} - все записи.
    * @variant {'leaf'} - листья.
    * @variant {'node'} - узлы.
    */

   /**
    * @typedef {String} SelectionType
    * @variant {'all'} - all records.
    * @variant {'leaf'} - leaves.
    * @variant {'node'} - nodes.
    */

   /**
    * @typedef {Object} Selection
    * @property {Number[] | String[]} selected Массив выбранных ключей.
    * @property {Number[] | String[]} excluded Массив исключенных из выборки ключей.
    * @property {SelectionType} type Тип элементов.
    */

   /*
    * @typedef {Object} Selection
    * @property {Number[] | String[]} selected Array of selected keys.
    * @property {Number[] | String[]} excluded Array of excluded keys.
    * @property {Selection} type Type of elements.
    */

   /**
    * @event Происходит перед удалением элемента.
    * @name Controls/interface/IRemovable#beforeItemsRemove
    * @param {Vdom/Vdom:SyntheticEvent} eventObject Дескриптор события.
    * @param {Array.<String>|Array.<Number>} idArray Массив элементов для удаления.
    * @returns {Core/Deferred} Если deferred был выполнен с false, то логика по умолчанию не будет выполнена.
    * @example
    * В следующем примере показано, как отобразить диалоговое окно с вопросом перед удалением элементов.
    * <pre class="brush: html">
    * <!-- WML -->
    * <Controls.list:Remover name="listRemover" on:beforeItemsRemove="_beforeItemsRemove()"/>
    * <Controls.popup:Confirmation name="popupOpener"/>
    * </pre>
    * <pre class="brush: js">
    * Control.extend({
    *    _beforeItemsRemove: function(eventObject, idArray) {
    *       return this._children.popupOpener.open({
    *          message: 'Are you sure you want to delete the items?',
    *          type: 'yesno'
    *       });
    *    }
    * });
    * </pre>
    * @see afterItemsRemove
    * @see removeItems
    */

   /*
    * @event Occurs before items are removed.
    * @name Controls/interface/IRemovable#beforeItemsRemove
    * @param {Vdom/Vdom:SyntheticEvent} eventObject The event descriptor.
    * @param {Array.<String>|Array.<Number>} idArray Array of items to be removed.
    * @returns {Core/Deferred} If deferred was fullfilled with false then default logic will not be executed.
    * @example
    * The following example shows how to display a dialog with a question before deleting items.
    * <pre class="brush: html">
    * <!-- WML -->
    * <Controls.list:Remover name="listRemover" on:beforeItemsRemove="_beforeItemsRemove()"/>
    * <Controls.popup:Confirmation name="popupOpener"/>
    * </pre>
    * <pre class="brush: js">
    * Control.extend({
    *    _beforeItemsRemove: function(eventObject, idArray) {
    *       return this._children.popupOpener.open({
    *          message: 'Are you sure you want to delete the items?',
    *          type: 'yesno'
    *       });
    *    }
    * });
    * </pre>
    * @see afterItemsRemove
    * @see removeItems
    */

   /**
    * @event Происходит после удаления элементов.
    * @name Controls/interface/IRemovable#afterItemsRemove
    * @param {Vdom/Vdom:SyntheticEvent} eventObject Дескриптор события.
    * @param {Array.<String>|Array.<Number>} idArray Массив удаленных элементов.
    * @param {*} result Результат удаления элемента из источника данных.
    * @returns {Boolean} Если возвращен false, то при ошибке удаления не будет показано всплывающее окно.
    * @remark
    * По отображению дружелюбных ошибок при удалении записей подробнее читайте <a href="/doc/platform/developmentapl/interface-development/pattern-and-practice/handling-errors/handling-errors-base/#list-features">здесь</a>.
    * @example
    * В следующем примере показано, как удалить элементы из списка после клика по кнопке.
    * <pre class="brush: html">
    * <!-- WML -->
    * <Controls.list:Remover name="listRemover" on:afterItemsRemove="_afterItemsRemove()"/>
    * <Controls.popup:Confirmation name="popupOpener"/>
    * </pre>
    *
    * <pre class="brush: js">
    * // JavaScript
    * Control.extend({
    *    _afterItemsRemove: function(eventObject, idArray, result) {
    *       if (result instanceof Error) {
    *          return this._children.popupOpener.open({
    *             message: 'Removing records failed.',
    *             style: 'error'
    *          });
    *       }
    *    }
    * });
    * </pre>
    * @see removeItems
    * @see beforeItemsRemove
    */

   /*
    * @event Occurs after removing items.
    * @name Controls/interface/IRemovable#afterItemsRemove
    * @param {Vdom/Vdom:SyntheticEvent} eventObject The event descriptor.
    * @param {Array.<String>|Array.<Number>} idArray Array of removed items
    * @param {*} result The result of item removal from the data source.
    * @example
    * The following example shows how to remove items from list after click on the button.
    * <pre class="brush: html">
    * <!-- WML -->
    * <Controls.list:Remover name="listRemover" on:afterItemsRemove="_afterItemsRemove()"/>
    * <Controls.popup:Confirmation name="popupOpener"/>
    * </pre>
    *
    * <pre class="brush: js">
    * // JavaScript
    * Control.extend({
    *    _afterItemsRemove: function(eventObject, idArray, result) {
    *       if (result instanceof Error) {
    *          return this._children.popupOpener.open({
    *             message: 'Removing records failed.',
    *             style: 'error'
    *          });
    *       }
    *    }
    * });
    * </pre>
    * @see removeItems
    * @see beforeItemsRemove
    */

   /**
    * Удаляет элементы из источника данных по идентификаторам элементов коллекции.
    * @function Controls/interface/IRemovable#removeItems
    * @param {Array.<String>|Array.<Number>|Selection} items Массив элементов для удаления.
    * @example
    * В следующем примере показано, как удалить элементы из списка после клика по кнопке.
    * <pre class="brush: html">
    * <!-- WML -->
    * <Controls.breadcrumbs:Path caption="RemoveItem" on:click="_onRemoveButtonClick()"/>
    * <Controls.list:Remover name="listRemover"/>
    * </pre>
    *
    * <pre class="brush: js">
    * // JavaScript
    * Control.extend({
    *    _keysForRemove: [...],
    *    _onRemoveButtonClick: function() {
    *       this._children.listRemover.removeItems(this._keysForRemove);
    *    }
    * });
    * </pre>
    * @see afterItemsRemove
    * @see beforeItemsRemove
    */

   /*
    * Removes items from the data source by identifiers of the items in the collection.
    * @function Controls/interface/IRemovable#removeItems
    * @param {Array.<String>|Array.<Number>|Selection} items Array of items to be removed.
    * @example
    * The following example shows how to remove items from list after click on the button.
    * <pre class="brush: html">
    * <!-- WML -->
    * <Controls.breadcrumbs:Path caption="RemoveItem" on:click="_onRemoveButtonClick()"/>
    * <Controls.list:Remover name="listRemover"/>
    * </pre>
    *
    * <pre class="brush: js">
    * // JavaScript
    * Control.extend({
    *    _keysForRemove: [...],
    *    _onRemoveButtonClick: function() {
    *       this._children.listRemover.removeItems(this._keysForRemove);
    *    }
    * });
    * </pre>
    * @see afterItemsRemove
    * @see beforeItemsRemove
    */
});
