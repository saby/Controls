/* global define, $ws */
define('js!SBIS3.CONTROLS.Data.Collection.ObservableListMixin', [
   'js!SBIS3.CONTROLS.Data.Bind.ICollection'
], function (IBindCollection) {
   'use strict';

   /**
    * Миксин, поддерживающий отcлеживание изменений в списках
    * @mixin SBIS3.CONTROLS.Data.Collection.ObservableListMixin
    * @public
    * @ignoreMethods notifyCollectionChange notifyItemChange
    * @author Мальцев Алексей
    */

   var ObservableListMixin = /** @lends SBIS3.CONTROLS.Data.Collection.ObservableListMixin.prototype */{
      $protected: {
         /**
          * @member {Boolean} Генерация событий включена
          */
         _eventsEnabled: true,

         /**
          * @member {Object.<String, Boolean>} Есть подписчики на событие
          */
         _hasSubscription: {},

         /**
          * @member {Function} Обработчик изменения свойств элемента
          */
         _onItemPropertyChangeHandler: null,
         /**
          * @member {boolean} флаг показывает выполняется ли в данный момент событие изменения коллекции
          */
         _isChangingYet: false
      },

      $constructor: function () {
         this._publish('onCollectionChange', 'onCollectionItemChange');
         this._hasSubscription.onCollectionChange = this._handlers.hasOwnProperty('onCollectionChange');
         this._hasSubscription.onCollectionItemChange = this._handlers.hasOwnProperty('onCollectionItemChange');
         this._onItemPropertyChangeHandler = onItemPropertyChangeHandler.bind(this);

         this._setObservableItems(this._items);
      },

      before: {
         destroy: function() {
            this._unsetObservableItems(this._items);
         }
      },

      after: {
         subscribe: function(event) {
            var hasSubscription = this._hasSubscription[event];
            this._hasSubscription[event] = true;
            if (!hasSubscription) {
               this._setObservableItems(this._items);
            }
         },

         unsubscribe: function(event) {
            this._hasSubscription[event] = this._getChannel().hasEventHandlers(event);
         },

         unbind: function(event) {
            this._hasSubscription[event] = false;
         }
      },

      around: {

         //region SBIS3.CONTROLS.Data.Collection.List

         assign: function (parentFnc, items) {
            var oldItems = this._items.slice(),
               eventsWasEnabled = this._eventsEnabled;

            this._eventsEnabled = false;
            parentFnc.call(this, items);
            this._eventsEnabled = eventsWasEnabled;

            this._notifier(
               this.notifyCollectionChange,
               IBindCollection.ACTION_RESET,
               this._items.slice(),
               0,
               oldItems,
               0
            );
         },

         append: function (parentFnc, items) {
            var eventsWasEnabled = this._eventsEnabled;

            this._eventsEnabled = false;
            var count = this.getCount();
            parentFnc.call(this, items);
            this._eventsEnabled = eventsWasEnabled;

            this._notifier(
               this.notifyCollectionChange,
               IBindCollection.ACTION_ADD,
               this._items.slice(count, this._lenght),
               count,
               [],
               0
            );
         },

         prepend: function (parentFnc, items) {
            var eventsWasEnabled = this._eventsEnabled;

            this._eventsEnabled = false;
            var length = this.getCount();
            parentFnc.call(this, items);
            this._eventsEnabled = eventsWasEnabled;

            this._notifier(
               this.notifyCollectionChange,
               IBindCollection.ACTION_ADD,
               this._items.slice(0, this.getCount() - length),
               0,
               [],
               0
            );
         },

         clear: function (parentFnc) {
            var oldItems = this._items.slice(),
               eventsWasEnabled = this._eventsEnabled;

            this._eventsEnabled = false;
            parentFnc.call(this);
            this._eventsEnabled = eventsWasEnabled;

            this._notifier(
               this.notifyCollectionChange,
               IBindCollection.ACTION_RESET,
               this._items.slice(),
               0,
               oldItems,
               0
            );
         },

         add: function (parentFnc, item, at) {
            parentFnc.call(this, item, at);
            at = this._isValidIndex(at) ? at : this.getCount() - 1;
            this._notifier(
               this.notifyCollectionChange,
               IBindCollection.ACTION_ADD,
               [this._items[at]],
               at,
               [],
               0
            );
         },

         removeAt: function (parentFnc, index) {
            var item = this._items[index];
            parentFnc.call(this, index);
            this._notifier(
               this.notifyCollectionChange,
               IBindCollection.ACTION_REMOVE,
               [],
               0,
               [item],
               index
            );

         },

         replace: function (parentFnc, item, at) {
            var oldItem = this._items[at];
            parentFnc.call(this, item, at);
            this._notifier(
               this.notifyCollectionChange,
               IBindCollection.ACTION_REPLACE,
               [this._items[at]],
               at,
               [oldItem],
               at
            );
         }


         //endregion SBIS3.CONTROLS.Data.Collection.List

      },

      /**
       * Генерирует событие об изменении коллеции
       * @param {String} action Действие, приведшее к изменению.
       * @param {*[]} newItems Новые элементы коллеции.
       * @param {Number} newItemsIndex Индекс, в котором появились новые элементы.
       * @param {*[]} oldItems Удаленные элементы коллекции.
       * @param {Number} oldItemsIndex Индекс, в котором удалены элементы.
       */
      notifyCollectionChange: function (action, newItems, newItemsIndex, oldItems, oldItemsIndex) {
         if (!this._eventsEnabled) {
            return;
         }
         if (this._hasSubscription.onCollectionChange) {
            this._notify(
               'onCollectionChange',
               action,
               newItems,
               newItemsIndex,
               oldItems,
               oldItemsIndex
            );
         }
         if (this._hasSubscription.onCollectionItemChange) {
            this._checkWatchableOnCollectionChange(
               action,
               newItems,
               newItemsIndex,
               oldItems,
               oldItemsIndex
            );
         }
      },

      /**
       * Генерирует событие об изменении элемента
       * @param {*} item Элемент
       * @param {Object.<String, *>} properties Изменившиеся свойства
       */
      notifyItemChange: function (item, properties) {
         if (
            !this._eventsEnabled ||
            !this._hasSubscription.onCollectionItemChange
         ) {
            return;
         }

         var index = this.getIndex(item);
         this._notify(
            'onCollectionItemChange',
            this._items[index],
            index,
            properties
         );
      },

      //region Protected methods

      /**
       * При изменениях коллекции синхронизирует подписки на элементы
       * @param {String} action Действие, приведшее к изменению.
       * @param {*[]} newItems Новые элементы коллеции.
       * @param {Number} newItemsIndex Индекс, в котором появились новые элементы.
       * @param {*[]} oldItems Удаленные элементы коллекции.
       * @param {Number} oldItemsIndex Индекс, в котором удалены элементы.
       * @protected
       */
      _checkWatchableOnCollectionChange: function(action, newItems, newItemsIndex, oldItems) {
         switch (action){
            case IBindCollection.ACTION_ADD:
               this._setObservableItems(newItems);
               break;
            case IBindCollection.ACTION_REMOVE:
               this._unsetObservableItems(oldItems);
               break;
            case IBindCollection.ACTION_RESET:
            case IBindCollection.ACTION_REPLACE:
               this._unsetObservableItems(oldItems);
               this._setObservableItems(newItems);
               break;
         }
      },

      /**
       * Оформляет подписку на событие onPropertyChange для каждого из элементов массива, если на событие есть подписчики
       * @param items {Array} Элементы
       * @protected
       */
      _setObservableItems: function(items) {
         if (this._hasSubscription.onCollectionItemChange) {
            $ws.helpers.forEach(items, this._watchForChanges, this);
         }
      },

      /**
       * Отменяет подписку на событие onPropertyChange для каждого из элементов массива
       * @param items {Array} Элементы
       * @protected
       */
      _unsetObservableItems: function(items) {
         $ws.helpers.forEach(items, this._cancelWatchForChanges, this);
      },

      /**
       * Подписывается на событие onPropertyChange на содержимом элемента коллекции
       * @param item {*} Элемент коллекции
       * @protected
       */
      _watchForChanges: function(item) {
         if (this._needWatchForChanges(item)) {
            var handlers = item.getEventHandlers('onPropertyChange');
            if (Array.indexOf(handlers, this._onItemPropertyChangeHandler) === -1) {
               item.subscribe('onPropertyChange', this._onItemPropertyChangeHandler);
            }
         }
      },

      /**
       * Отписываетсят события onPropertyChange
       * @param item {*} Элемент коллекции
       * @protected
       */
      _cancelWatchForChanges: function(item) {
         if (this._needWatchForChanges(item)) {
            item.unsubscribe('onPropertyChange', this._onItemPropertyChangeHandler);
         }
      },

      /**
       * Проверяет нужно ли следить за изменением содержимого элемента коллекции
       * @param item {*} Содержимое элемента коллекции
       * @returns {Boolean}
       * @protected
       */
      _needWatchForChanges: function(item) {
         if (
            item &&
            $ws.helpers.instanceOfMixin(item, 'SBIS3.CONTROLS.Data.IObject')
         ) {
            return true;
         }
         return false;
      },

      _notifier: function (func /*, arguments*/) {
         var args = Array.prototype.slice.call(arguments, 1);
         if (this._isChangingYet) {
            var self = this;
            setTimeout(function (){
               func.apply(self, args);
            }, 0);
            return;
         }
         this._isChangingYet = true;
         func.apply(this, args);
         this._isChangingYet = false;
      }
      //endregion Protected methods
   };

   /**
    * Обработчк события изменения модели
    * @param {$ws.proto.EventObject} event Дескриптор события.
    * @param {Object.<String, *>} properties Названия и новые значения изменившихся свойств
    */
   var onItemPropertyChangeHandler = function (event, properties) {
      this._notifier(
         this.notifyItemChange,
         event.getTarget(),
         properties
      );
   };

   return ObservableListMixin;
});
