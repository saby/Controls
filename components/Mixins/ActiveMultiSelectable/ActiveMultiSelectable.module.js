/**
 * Created by am.gerasimov on 26.10.2015.
 */
define('js!SBIS3.CONTROLS.ActiveMultiSelectable', [], function() {

   function propertyUpdateWrapper(func) {
      return function() {
         return this.runInPropertiesUpdate(func, arguments);
      };
   }

   /**
    * Миксин, добавляющий поведение хранения одного или нескольких выбранных элементов
    * @mixin SBIS3.CONTROLS.ActiveMultiSelectable
    * @public
    * @author Крайнов Дмитрий Олегович
    */

   var ActiveMultiSelectable = /**@lends SBIS3.CONTROLS.ActiveMultiSelectable.prototype  */{
      $protected: {
         _options: {

         }
      },

      $constructor: function() {
         if(!$ws.helpers.instanceOfMixin(this, 'SBIS3.CONTROLS.MultiSelectable')) {
            throw new Error('MultiSelectable mixin is required');
         }
      },

      /**
       * Устанавливает набор выбранных элементов коллекции.
       * Опция актуальна, когда контрол находится в режиме {@link SBIS3.CONTROLS.MultiSelectable#multiselect множественного выбора значений}.
       * @param {Array|SBIS3.CONTROLS.Data.Collection.List} list Выбранные элементы коллекции.
       * @example
       * <pre>
       *    var selectedItems = myGrid.getSelectedItems();
       *
       *    if(selectedItems.getCount()) {
       *       myFieldLink.setSelectedItems(selectedItems)
       *    }
       * </pre>
       * @see SBIS3.CONTROLS.MultiSelectable#selectedItems
       * @see SBIS3.CONTROLS.MultiSelectable#selectedKeys
       * @see clearSelectedItems
       * @see addSelectedItems
       */
      setSelectedItems: propertyUpdateWrapper(function(list) {
         var newItems = [];

         list = this._prepareItems(list);

         if(this._options.selectedItems.equals(list)) {
            return;
         }

         if(list.getCount()) {
            if(this._options.multiselect) {
               list.each(function(rec) {
                  newItems.push(rec);
               });
            } else {
               newItems = [list.at(0)];
            }
         }

         this._options.selectedItems = this._makeList(newItems);
         this.setSelectedKeys(this._convertToKeys(this._options.selectedItems));
         this._notifyOnPropertyChanged('selectedItems');
      }),

      /**
       * Очищает набор выбранных элементов коллекции.
       * Опция актуальна, когда контрол находится в режиме {@link SBIS3.CONTROLS.MultiSelectable#multiselect множественного выбора значений}.
       * @see SBIS3.CONTROLS.MultiSelectable#multiselect
       * @see SBIS3.CONTROLS.MultiSelectable#selectedItems
       * @see SBIS3.CONTROLS.MultiSelectable#selectedKeys
       * @see setSelectedItems
       * @see addSelectedItems
       * @example
       * <pre>
       *    var selectedItems = myGrid.getSelectedItems();
       *
       *    if(selectedItems.getCount()) {
       *       myGrid.clearSelectedItems();
       *    }
       * </pre>
       */
      clearSelectedItems: function() {
         this.setSelectedItems([]);
      },

      /**
       * Инициализирует опцию selectedItems
       * @noShow
       */
      initializeSelectedItems: function() {
        this._options.selectedItems =  new List();
      },

      _prepareItems: function(items) {
         if(items instanceof Array) {
            items = this._makeList(items);
         }

         if(!$ws.helpers.instanceOfModule(items, 'SBIS3.CONTROLS.Data.Collection.List')) {
            throw new Error('ActiveMultiSelectable::setSelectedItems called with invalid argument');
         }

         return items;
      },

      /**
       * Добавляет новые элементы коллекции к набору выбранных.
       * Опция актуальна, когда контрол находится в режиме {@link SBIS3.CONTROLS.MultiSelectable#multiselect множественного выбора значений}.
       * @param {Array | SBIS3.CONTROLS.Data.Collection.List} items Массив элементов, которые нужно добавить в набор.
       * @see SBIS3.CONTROLS.MultiSelectable#multiselect
       * @see selectedItems
       * @see selectedKeys
       * @see setSelectedItems
       * @see clearSelectedItems
       * @example
       * <pre>
       *    var selectedItems = myGrid.getSelectedItems();
       *
       *    if(selectedItems.getCount()) {
       *       myFieldLink.addSelectedItems(selectedItems);
       *    }
       * </pre>
       */
      addSelectedItems: propertyUpdateWrapper(function(items) {
         var self = this,
             selItems = this._options.selectedItems,
             newItems = [];

         items = this._prepareItems(items);

         if(!items.getCount()) {
            return;
         }

         if(this._options.multiselect) {
            items.each(function(rec) {
               if(!self._isItemSelected(rec)) {
                  newItems.push(rec);
               }
            });
         } else if(!self._isItemSelected(items.at(0))) {
            newItems.push(items.at(0));
            selItems.clear();
         }

         if(newItems.length) {
            selItems.concat(newItems);
            this.setSelectedKeys(this._convertToKeys(selItems));
            this._notifyOnPropertyChanged('selectedItems');
         }
      })
   };

   return ActiveMultiSelectable;

});