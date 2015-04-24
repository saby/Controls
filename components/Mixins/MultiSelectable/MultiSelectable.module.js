define('js!SBIS3.CONTROLS.MultiSelectable', [], function() {

   /**
    * Миксин, добавляющий поведение хранения одного или нескольких выбранных элементов
    * @mixin SBIS3.CONTROLS.MultiSelectable
    * @public
    */

   var MultiSelectable = /**@lends SBIS3.CONTROLS.MultiSelectable.prototype  */{
      $protected: {
         _options: {
            /**
             * @cfg {Boolean} Разрешить множественный выбор
             * @example
             * <pre>
             *     <option name="multiselect">false</option>
             * </pre>
             * @see selectedItems
             */
            multiselect : true,
            /**
             * @cfg {String[]} Массив идентификаторов выбранных элементов
             * @example
             * <pre>
             *     <options name="selectedItems" type="array">
             *        <option type="string">1</option>
             *        <option type="string">2</option>
             *     </options>
             * </pre>
             * @see multiselect
             */
            selectedItems : [],
            allowEmptySelection : true
         }
      },

      $constructor: function() {
         this._publish('onSelectedItemsChange');
         if (this._options.selectedItems) {
            if (Object.prototype.toString.call(this._options.selectedItems) == '[object Array]' ) {
               if (!this._options.multiselect) {
                  this._options.selectedItems = this._options.selectedItems.slice(0, 1);
               }
            }
            else {
               throw new Error('Argument must be instance of Array');
            }
         }
         else {
            if (this._options.allowEmptySelection == false) {
               this._setFirstItemAsSelected();
            }
         }
      },

      /**
       * Метод-заглушка. Будет переделан на установку самих элементов, а не их id
       */
      setSelectedItems: function(idArray) {
         //TODO изменить логику на установку выбранных элементов
         console.log('c 3.7.3 метод setSelectedItems перестанет работать. Используйте метод setSelectedIndexes');
         this.setSelectedIndexes(idArray);
      },

      /**
       * Метод-заглушка. Будет переделан на получение самих элементов, а не их id
       */
      getSelectedItems: function() {
         //TODO изменить логику на получение выбранных элементов
         console.log('c 3.7.3 метод getSelectedItems перестанет работать. Используйте метод getSelectedIndexes');
         return this.getSelectedIndexes();
      },

      /**
       * Устанавливает выбранные элементы по id
       * @param idArray
       */
      setSelectedIndexes : function(idArray) {
         if (Object.prototype.toString.call(idArray) == '[object Array]' ) {
            if (idArray.length) {
               if (this._options.multiselect) {
                  this._options.selectedItems = idArray;
               }
               else {
                  this._options.selectedItems = idArray.slice(0, 1);
               }
            }
            else {
               this._options.selectedItems = [];
            }
            if (!this._options.selectedItems.length && this._options.allowEmptySelection == false) {
               this._setFirstItemAsSelected();
            }
            this._drawSelectedItems(this._options.selectedItems);
            this._notifySelectedItem(this._options.selectedItems);
         }
         else {
            throw new Error('Argument must be instance of Array');
         }
      },

      /**
       * Устанавливает все элементы выбранными
       */
      setSelectedItemsAll : function() {
         if (this._dataSet) {
            var items = [];
            this._dataSet.each(function(rec){
               items.push(rec.getKey())
            });
            this.setSelectedIndexes(items);
         }

      },

      /**
       * Получает индексы выбранных элементов
       */
      getSelectedIndexes : function() {
         return this._options.selectedItems;
      },

      /**
       * Добавить элементы в набор выбранных
       * @param idArray
       */
      addItemsSelection : function(idArray) {
         if (Object.prototype.toString.call(idArray) == '[object Array]' ) {
            if (idArray.length) {
               if (this._options.multiselect) {
                  for (var i = 0; i < idArray.length; i++) {
                     if (this._options.selectedItems.indexOf(idArray[i]) < 0) {
                        this._options.selectedItems.push(idArray[i]);
                     }
                  }
               }
               else {
                  this._options.selectedItems = idArray.slice(0, 1);
               }
            }
            if (!this._options.selectedItems.length && this._options.allowEmptySelection == false) {
               this._setFirstItemAsSelected();
            }
            this._drawSelectedItems(this._options.selectedItems);
            this._notifySelectedItem(this._options.selectedItems);
         }
         else {
            throw new Error('Argument must be instance of Array');
         }

      },

      /**
       * Удаляет элементы из набора выбранных
       * @param idArray
       */
      removeItemsSelection : function(idArray) {
         if (Object.prototype.toString.call(idArray) == '[object Array]' ) {
            for (var i = 0; i < idArray.length; i++) {
               var index = this._options.selectedItems.indexOf(idArray[i]);
               if (index >= 0) {
                  Array.remove(this._options.selectedItems, index);
               }
            }
            if (!this._options.selectedItems.length && this._options.allowEmptySelection == false) {
               this._setFirstItemAsSelected();
            }
            this._drawSelectedItems(this._options.selectedItems);
            this._notifySelectedItem(this._options.selectedItems);
         }
         else {
            throw new Error('Argument must be instance of Array');
         }
      },

      /**
       * Убрать все элементы из набора выбранных
       */
      removeItemsSelectionAll : function() {
         this.setSelectedIndexes([]);
      },

      /**
       * Меняет состояние элементов на противоположное
       * @param idArray
       */
      toggleItemsSelection : function(idArray) {
         if (Object.prototype.toString.call(idArray) == '[object Array]' ) {
            if (idArray.length) {
               if (this._options.multiselect) {
                  for (var i = 0; i < idArray.length; i++) {
                     if (this._options.selectedItems.indexOf(idArray[i]) < 0) {
                        this.addItemsSelection([idArray[i]]);
                     }
                     else {
                        this.removeItemsSelection([idArray[i]]);
                     }
                  }
               }
               else {
                  if (this._options.selectedItems.indexOf(idArray[0]) >= 0) {
                     this._options.selectedItems = [];
                  }
                  else {
                     this._options.selectedItems = idArray.slice(0, 1);
                  }
                  if (!this._options.selectedItems.length && this._options.allowEmptySelection == false) {
                     this._setFirstItemAsSelected();
                  }
                  this._drawSelectedItems(this._options.selectedItems);
                  this._notifySelectedItem(this._options.selectedItems);
               }
            }
         }
         else {
            throw new Error('Argument must be instance of Array');
         }
      },

      /**
       * Меняет состояние выбранности всех элементов на противоположное
       */
      toggleItemsSelectionAll : function() {
         if (this._dataSet) {
            var items = [];
            this._dataSet.each(function(rec){
               items.push(rec.getKey())
            });
            this.toggleItemsSelection(items);
         }
      },


      _drawSelectedItems : function() {
         /*Method must be implemented*/
      },

      _notifySelectedItem : function(idArray) {
         this._notify('onSelectedItemsChange', idArray);
      },

      _dataLoadedCallback : function(){
         if (!this._options.selectedItems.length && this._options.allowEmptySelection == false) {
            this._setFirstItemAsSelected();
         }
      },

      _setFirstItemAsSelected : function() {
         if (this._dataSet) {
            var firstKey = this._dataSet.at(0).getKey();
            this._options.selectedItems = [firstKey];
         }
      }
   };

   return MultiSelectable;

});