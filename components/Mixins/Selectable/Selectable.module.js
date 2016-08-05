/**
 * Created by iv.cheremushkin on 14.08.2014.
 */

define('js!SBIS3.CONTROLS.Selectable', ['js!WS.Data/Utils', 'js!WS.Data/Collection/IBind'], function(Utils, IBindCollection) {

   /**
    * Миксин, добавляющий поведение хранения выбранного элемента. Всегда только одного.
    * @mixin SBIS3.CONTROLS.Selectable
    * @author Крайнов Дмитрий Олегович
    * @public
    */

   var Selectable = /**@lends SBIS3.CONTROLS.Selectable.prototype  */{
       /**
        * @event onSelectedItemChange Происходит при смене выбранного элемента коллекции.
        * @param {$ws.proto.EventObject} eventObject Дескриптор события.
        * @param {String|Number} id Идентификатор (значение поля первичного ключа) выбранного элемента коллекции.
        * @param {String} index Порядковый номер выбранного элемента коллекции среди других элементов источника данных.
        * @example
        * <pre>
        *     RadioButtonGroup.subscribe('onSelectedItemChange', function(event, id){
        *        TextBox.setText('Selected item id: ', id);
        *     })
        * </pre>
        * @see selectedKey
        * @see setSelectedKey
        * @see getSelectedKey
        * @see SBIS3.CONTROLS.DSMixin#keyField
        */
      $protected: {
          /*не различаются события move и remove/add при смене пор номеров, поэтому используем этот флаг, см ниже*/
          _isMove: false,
          _isMoveKey: null,
          _options: {
             /**
              * @cfg {String} Устанавливает выбранным элемент коллекции по переданному индексу (порядковому номеру).
              * @remark
              * <ol>
              *    <li>Элемент будет выбран по переданному идентификатору только при условии, что для контрола установлен источник данных в опции {@link SBIS3.CONTROLS.DSMixin#dataSource}.</li>
              *    <li>Установить новый идентификатор элемента коллекции можно с помощью метода {@link setSelectedIndex}, а получить идентификатор - с помощью метода {@link getSelectedIndex}.</li>
              * </ol>
              * @example
              * Производим связывание опции с полем контекста через атрибут bind. Подробнее о связывании значения опций контролов с полями контекста вы можете прочитать <a href="https://wi.sbis.ru/doc/platform/developmentapl/interfacedev/core/context/">здесь</a>.
              * <pre>
              *     <option name="selectedIndex" bind="record/Индекс"></option>
              * </pre>
              * @see setSelectedIndex
              * @see getSelectedIndex
              * @see onSelectedItemChange
              * @see selectedKey
              */
             selectedIndex: null,
             /**
              * @cfg {String|Number} Устанавливает выбранным элемент коллекции по переданному идентификатору - значению {@link SBIS3.CONTROLS.DSMixin#keyField ключевого поля} элемента коллекции.
              * @remark
              * <ol>
              *    <li>Элемент будет выбран по переданному идентификатору только при условии, что для контрола установлен источник данных в опции {@link SBIS3.CONTROLS.DSMixin#dataSource}.</li>
              *    <li>Установить новый идентификатор элемента коллекции можно с помощью метода {@link setSelectedKey}, а получить идентификатор - с помощью метода {@link getSelectedKey}.</li>
              * </ol>
              * @example
              * Производим связывание опции с полем контекста через атрибут bind. Подробнее о связывании значения опций контролов с полями контекста вы можете прочитать <a href="https://wi.sbis.ru/doc/platform/developmentapl/interfacedev/core/context/">здесь</a>.
              * <pre>
              *     <option name="selectedKey" bind="record/Идентификатор"></option>
              * </pre>
              * @see setSelectedKey
              * @see getSelectedKey
              * @see onSelectedItemChange
              * @see selectedIndex
              */
             selectedKey: null,
             /**
              * @cfg {Boolean} Разрешить отсутствие выбранного элемента в группе
              * @example
              * <pre>
              *     <option name="allowEmptySelection">false</option>
              * </pre>
              * @remark
              * Опция нужна, например, для создания пустой группы радиокнопок - без выбранного элемента.
              * При этом после задания значения вернуть коллекцию к состоянию без выбранного элемента можно только
              * методом {@link setSelectedKey}.
              * @see selectedKey
              * @see setSelectedKey
              * @see getSelectedKey
              * @see SBIS3.CONTROLS.DSMixin#keyField
              */
            allowEmptySelection : true
         }
      },

      $constructor: function() {
         this._publish('onSelectedItemChange');
      },


      _prepareSelectedConfig: function(index, key) {
         if (this._isEmptyIndex(index)) {
            if (this.getItems() && $ws.helpers.instanceOfModule(this.getItems(), 'WS.Data/Collection/RecordSet') && typeof key != 'undefined') {
               this._options.selectedIndex = this._getItemIndexByKey(key);
            }
         }
         else {
            if (this.getItems() && $ws.helpers.instanceOfModule(this.getItems(), 'WS.Data/Collection/RecordSet')) {
               this._options.selectedKey = this._getKeyByIndex(this._options.selectedIndex);
            }
         }
         if (!this._options.allowEmptySelection && this._isEmptyIndex(this._options.selectedIndex)) {
            if (this._getItemsProjection().getCount()) {
               this._options.selectedIndex = 0;
               this._options.selectedKey = this._getKeyByIndex(this._options.selectedIndex);
            }
         }
      },

      before : {
         setDataSource: function() {
            this._options.selectedIndex = -1;
         },
         setItems: function() {
            this._options.selectedIndex = -1;
         }
      },

      after : {
         _setItemsEventHandlers : function() {
            if (!this._onProjectionCurrentChange) {
               this._onProjectionCurrentChange = onProjectionCurrentChange.bind(this);
            }
            this.subscribeTo(this._getItemsProjection(), 'onCurrentChange', this._onProjectionCurrentChange);

            if (!this._onProjectionChange) {
               this._onProjectionChange = onCollectionChange.bind(this);
            }
            this.subscribeTo(this._getItemsProjection(), 'onCollectionChange', this._onProjectionChange);
         },
         _drawItemsCallback: function(lightVer) {
            this._drawSelectedItem(this._options.selectedKey, this._options.selectedIndex, lightVer);
         },
         _unsetItemsEventHandlers : function() {
            if (this._getItemsProjection() && this._onProjectionCurrentChange) {
               this.unsubscribeFrom(this._getItemsProjection(), 'onCurrentChange', this._onProjectionCurrentChange);
            }
            if (this._getItemsProjection() && this._onProjectionChange) {
               this.unsubscribeFrom(this._getItemsProjection(), 'onCollectionChange', this._onProjectionChange);
            }
         },
         _itemsReadyCallback: function() {
            this._prepareSelectedConfig(this._options.selectedIndex, this._options.selectedKey);
         }
      },


      //TODO переписать метод
      _setSelectedIndex: function(index, id) {
         this._drawSelectedItem(id, index);
         this._notifySelectedItem(id, index)
      },
      /**
       * Устанавливает выбранным элемент коллекции по переданному идентификатору.
       * @remark
       * Метод актуален для использования при условии, что для контрола установлен источник данных в опции {@link SBIS3.CONTROLS.DSMixin#dataSource} и поле первичного ключа в опции {@link SBIS3.CONTROLS.DSMixin#keyField}.
       * Для возвращения коллекции к состоянию без выбранного элемента нужно передать null.
       * При использовании метода происходит событие {@link onSelectedItemChange}.
       * @param {String|Number} id Идентификатор элемента, который нужно установить в качестве выбранного.
       * Идентификатором элемента коллекции служит значение его {@link SBIS3.CONTROLS.DSMixin#keyField ключевого поля}.
       * @example
       * <pre>
       *     var newKey = (someValue > 0) ? 'positive' : 'negative';
       *     myComboBox.setSelectedKey(newKey);
       * </pre>
       * @see selectedKey
       * @see getSelectedKey
       * @see SBIS3.CONTROLS.DSMixin#keyField
       * @see onSelectedItemChange
       */
      setSelectedKey : function(id) {
         this._options.selectedKey = id;
         this._prepareSelectedConfig(undefined, id);
         if (this._getItemsProjection()) {
            this._selectInProjection();
         }
      },

      /**
       * Устанавливает выбранным элемент коллекции по переданному индексу (порядковому номеру).
       * @remark
       * Метод актуален для использования при условии, что для контрола установлен источник данных в опции {@link SBIS3.CONTROLS.DSMixin#dataSource} и поле первичного ключа в опции {@link SBIS3.CONTROLS.DSMixin#keyField}.
       * @param {String|Number} index Индекс выбранного элемента коллекции.
       * @example
       * <pre>
       *    this._getControlOrdersList().setSelectedIndex(0);
       * </pre>
       * @see selectedIndex
       * @see getSelectedIndex
       */
      setSelectedIndex: function(index) {
         this._options.selectedIndex = index;
         this._prepareSelectedConfig(this._options.selectedIndex);
         if (this._getItemsProjection()) {
            this._selectInProjection();
         }
      },
      /**
       * Возвращает идентификатор выбранного элемента коллекции.
       * Идентификатором элемента коллекции служит значение его {@link SBIS3.CONTROLS.DSMixin#keyField ключевого поля}.
       * @return {String|Number} Первичный ключ выбранного элемента коллекции.
       * @example
       * <pre>
       *     var key = myComboBox.getSelectedKey();
       *     if (key !== 'old') {
       *        myComboBox.setSelectedKey('newKey');
       *     }
       * </pre>
       * @see selectedKey
       * @see setSelectedKey
       * @see onSelectedItemChange
       * @see SBIS3.CONTROLS.DSMixin#keyField
       */
      getSelectedKey : function() {
         return this._options.selectedKey;
      },

      /**
       * Возвращает индекс (порядковый номер) выбранного элемента коллекции.
       * @return {String|Number} Индекс выбранного элемента коллекции.
       * @example
       * <pre>
       *    index = list.getSelectedIndex();
       *    if (index > -1 && index < items.getCount()) {
       *       return items.at(index);
       *    }
       * </pre>
       * @see selectedIndex
       * @see setselectedIndex
       * @see onSelectedItemChange
       */
      getSelectedIndex : function() {
         return this._options.selectedIndex;
      },

      _drawSelectedItem : function() {
         /*Method must be implemented*/
      },

      _getItemValue: function(value, keyField) {
         if(value && typeof value === 'object') {
            return Utils.getItemPropertyValue(value, keyField );
         }
         return value;
      },

      _getItemIndexByKey: function(id) {
         var projItem = this._getItemProjectionByItemId(id);
         return this._getItemsProjection().getIndex(projItem);
      },

      _notifySelectedItem : function(id, index) {
         this._notifyOnPropertyChanged('selectedKey');
         this._notifyOnPropertyChanged('selectedIndex');
         this._notify('onSelectedItemChange', id, index);
      },

      _getKeyByIndex: function(index) {
         if(this._hasItemByIndex(index)) {
            var itemContents = this._getItemsProjection().at(index).getContents();
            if ($ws.helpers.instanceOfModule(itemContents, 'WS.Data/Entity/Model')) {
               return itemContents.getId();
            }
         }
      },

      _hasItemByIndex: function(index) {
         return (typeof index != 'undefined') && (index !== null) && (typeof this._getItemsProjection().at(index) != 'undefined');
      },

      _isEmptyIndex: function(index) {
         return index === null || typeof index == 'undefined' || index == -1;
      },

      _selectInProjection: function (){
         if (this._hasItemByIndex(this._options.selectedIndex)) {
            this._getItemsProjection().setCurrentPosition(this._options.selectedIndex);
         } else {
            this._getItemsProjection().setCurrentPosition(-1);
         }
      }
   };

   var onCollectionChange = function (event, action, newItems, newItemsIndex, oldItems) {
      switch (action) {
         case IBindCollection.ACTION_ADD:
         case IBindCollection.ACTION_REMOVE:
         case IBindCollection.ACTION_MOVE:
         case IBindCollection.ACTION_REPLACE:
         case IBindCollection.ACTION_RESET:
            var indexByKey = this._getItemIndexByKey(this._options.selectedKey),
                itemsProjection = this._getItemsProjection(),
                oldIndex = this._options.selectedIndex,
                oldKey = this._options.selectedKey,
                count;

            //В начале проверим наш хак на перемещение, а потом все остальное
            //суть в том что при удалении, мы ставим курсор на следующую запись
            //но при перемещении тоже происходит удаление - курсор перемещается на следующую, а должен устанавливаться на переносимую запись
            //в итоге если мы следующим событием после того, где поставили флаг получаем add той же записи, то это было перемещение и ставим курсор
            if (this._isMove && action == IBindCollection.ACTION_ADD && newItems.length == 1 && this._isMoveKey == newItems[0].getContents().getId()) {
               this._options.selectedKey = this._isMoveKey;
               this._options.selectedIndex = itemsProjection.getIndex(newItems[0]);
               this._isMove = false;
               this._isMoveKey = null;
            }
            else {
               this._isMove = false;
               this._isMoveKey = null;
               if (indexByKey >= 0) {
                  this._options.selectedIndex = indexByKey;
               } else {

                  count = itemsProjection.getCount();
                  if (count > 0) {
                     if (!this._isEmptyIndex(this._options.selectedIndex)) {
                        if (this._options.selectedIndex > count - 1) {
                           this._options.selectedIndex = 0;
                        }
                        if (oldItems.length == 1 && action == IBindCollection.ACTION_REMOVE && oldItems[0].getContents().getId() == this._options.selectedKey) {
                           this._isMove = true;
                           this._isMoveKey = this._options.selectedKey;
                        }
                        this._options.selectedKey = this._getKeyByIndex(this._options.selectedIndex);
                     } else if (!this._options.allowEmptySelection) {
                        this._options.selectedIndex = 0;
                        this._options.selectedKey = this._getKeyByIndex(this._options.selectedIndex);
                     }
                  } else {
                     this._options.selectedIndex = -1;
                     this._options.selectedKey = null;
                  }

               }
            }
            //TODO защита от логики деревянной проекции: добавил проверку на изменение selectedIndex и selectedKey, т.к. при вызове toggleNode
            //в узле стреляет либо action_remove, либо action_add листьев и мы всегда попадали сюда. и всегда делали _setSelectedIndex,
            //что приводило к лишнему событию onSelectedItemChanged, чего быть не должно.
            //Ошибка остается актуальной для rightNavigationPanel, где мы сначала делаем toggleNode, у нас меняется индекс и нижеописанная проверка проходит(хотя
            //по факту активный элемент не изменился) => стреляет onSelectedItemChanged, после из listView стреляет setSelectedKey из которого так же стреляет onSelectedItemChanged
            //выписал на это ошибку в 373.200

            if (action !== IBindCollection.ACTION_REPLACE && (this._options.selectedIndex !== oldIndex || this._options.selectedKey !== oldKey)) {
               this._setSelectedIndex(this._options.selectedIndex, this._options.selectedKey);
            }
      }
   };

   var onProjectionCurrentChange = function (event, newCurrent, oldCurrent, newPosition) {
      this._setSelectedIndex(
         newPosition,
         this._getKeyByIndex(newPosition)
      );
   };

   return Selectable;

});