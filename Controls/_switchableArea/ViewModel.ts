import SimpleExtend = require('Core/core-simpleExtend');
import {factory} from 'Types/chain';
import cClone = require('Core/core-clone');

var _private = {
   updateLoadStatus: function(selectedKey, self) {
      self._items.find(function(item) {
         return selectedKey === item.key;
      }).loaded = true;
   },

   updateItems: function(items, self) {
      var loadedItems = [];

      // TODO https://online.sbis.ru/opendoc.html?guid=c206e7a9-9d96-4a20-b386-d44d0f8ef4dc. Запоминаем все загруженные вкладки
      if (self._items) {
         factory(self._items).each(function(item) {
            if (item.get) {
               if (item.get('loaded')) {
                  loadedItems.push(item.get('key'));
               }
            } else {
               if (item.loaded) {
                  loadedItems.push(item.key);
               }
            }
         });
      }

      self._items = cClone(items);

      // TODO https://online.sbis.ru/opendoc.html?guid=c206e7a9-9d96-4a20-b386-d44d0f8ef4dc. Восстанавливаем все загруженные вкладки
      factory(self._items).each(function(item) {
         if (item.get) {
            if (loadedItems.indexOf(item.get('key')) > -1) {
               item.set('loaded', true);
            }
         } else {
            if (loadedItems.indexOf(item.key) > -1) {
               item.loaded = true;
            }
         }
      });

   }
};

var ViewModel = SimpleExtend.extend({
   constructor: function(items, selectedKey) {
      ViewModel.superclass.constructor.apply(this, arguments);
      _private.updateItems(items, this);
      _private.updateLoadStatus(selectedKey, this);
   },
   updateSelectedKey: function(selectedKey) {
      _private.updateLoadStatus(selectedKey, this);
   },
   updateItems: function(items) {
      _private.updateItems(items, this);
   }
});

export default ViewModel;
