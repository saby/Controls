define('Controls/Input/Lookup/Controller', [
   'Core/Control',
   'wml!Controls/Input/Lookup/Controller/Controller',
   'Core/core-clone',
   'Core/Deferred',
   'Controls/Controllers/SourceController',
   'Core/helpers/Object/isEqual',
   'WS.Data/Chain',
   'WS.Data/Collection/List',
   'Core/core-merge',
   'Controls/Utils/getWidth',
   'wml!Controls/SelectedCollection/CounterTemplate',
   'Controls/Utils/tmplNotify'
], function(Control, template, clone, Deferred, SourceController, isEqual, Chain, List, merge, GetWidth, CounterTemplate, tmplNotify) {

   var _private = {
      loadItems: function(self, filter, keyProperty, selectedKeys, source, sourceIsChanged) {
         var filter = clone(filter || {});
         var resultDef = new Deferred();

         filter[keyProperty] = selectedKeys;

         if (sourceIsChanged || !self.sourceController) {
            self.sourceController = new SourceController({
               source: source
            });
         }
         self.sourceController.load(filter)
            .addCallback(function(result) {
               resultDef.callback(self._items = result);
               return result;
            })
            .addErrback(function(result) {
               resultDef.callback(null);
               return result;
            });

         return resultDef;
      },

      notifyChanges: function(self, selectedKeys) {
         _private.notifySelectedKeys(self, selectedKeys);
         _private.notifyItemsChanged(self, _private.getItems(self));
         _private.notifyTextValueChanged(self, _private.getTextValue(self));
      },

      notifyItemsChanged: function(self, items) {
         self._notify('itemsChanged', [items]);
      },

      notifySelectedKeys: function(self, selectedKeys) {
         self._notify('selectedKeysChanged', [selectedKeys]);
      },

      notifyTextValueChanged: function(self, textValue) {
         // toDo Выписана задача на написание апи для события https://online.sbis.ru/opendoc.html?guid=cce8c706-a9e8-452e-bd44-5344f3c5fc72
         self._notify('textValueChanged', textValue);
      },

      addItem: function(self, item) {
         var
            selectedKeys = self._selectedKeys,
            key = item.get(self._options.keyProperty);

         if (self._selectedKeys.indexOf(key) === -1) {
            if (self._options.multiSelect) {
               selectedKeys.push(key);
               _private.setSelectedKeys(self, selectedKeys);
               _private.getItems(self).append([item]);
            } else {
               _private.setSelectedKeys(self, [key]);
               _private.getItems(self).assign([item]);
            }

            _private.notifyChanges(self, self._selectedKeys);
         }
      },

      removeItem: function(self, item) {
         var
            selectedKeys = self._selectedKeys.slice(),
            key = item.get(self._options.keyProperty),
            indexItem = self._selectedKeys.indexOf(key);

         if (indexItem !== -1) {
            selectedKeys.splice(indexItem, 1);
            _private.setSelectedKeys(self, selectedKeys);
            _private.getItems(self).remove(item);
            _private.notifyChanges(self, self._selectedKeys);
         }
      },

      setSelectedKeys: function(self, keys) {
         self._selectedKeys = keys;
         self._forceUpdate();
      },

      getTextValue: function(self) {
         var titleItems = [];

         _private.getItems(self).each(function(item) {
            titleItems.push(item.get(self._options.displayProperty));
         });

         return titleItems.join(', ');
      },

      getCounterWidth: function(itemsCount) {
         return  GetWidth.getWidth(CounterTemplate({
            itemsCount: itemsCount
         }));
      },

      getItems: function(self) {
         if (!self._items) {
            self._items = new List();
         }
         return self._items;
      }
   };

   var ControllerLookup = Control.extend({
      _template: template,
      _notifyHandler: tmplNotify,
      _selectedKeys: null,
      _items: null,

      _beforeMount: function(options, context, receivedState) {
         this._selectedKeys = options.selectedKeys.slice();

         if (this._selectedKeys.length) {
            if (receivedState) {
               this._items = receivedState;
            } else {
               return _private.loadItems(this, options.filter, options.keyProperty, options.selectedKeys, options.source);
            }
         }
      },

      _beforeUpdate: function(newOptions) {
         var
            self = this,
            newSelectedKeys,
            keysChanged = !isEqual(newOptions.selectedKeys, this._options.selectedKeys) &&
               !isEqual(newOptions.selectedKeys, this._selectedKeys),
            sourceIsChanged = newOptions.source !== this._options.source;

         if (keysChanged || sourceIsChanged) {
            newSelectedKeys = newOptions.selectedKeys.slice();
         } else if (newOptions.keyProperty !== this._options.keyProperty) {
            newSelectedKeys = [];
            _private.getItems(this).each(function(item) {
               newSelectedKeys.push(item.get(newOptions.keyProperty));
            });
         }

         newSelectedKeys && _private.setSelectedKeys(this, newSelectedKeys);
         this._counterWidth = _private.getCounterWidth(_private.getItems(this).getCount());

         if (sourceIsChanged || keysChanged && this._selectedKeys.length) {
            return _private.loadItems(this, newOptions.filter, newOptions.keyProperty, this._selectedKeys, newOptions.source, sourceIsChanged).addCallback(function(result) {
               _private.notifyItemsChanged(self, result);
               _private.notifyTextValueChanged(self, _private.getTextValue(self));
               return result;
            });
         }
      },

      _getItems: function() {
         return _private.getItems(this);
      },

      _setItems: function(items) {
         var
            selectedKeys = [],
            keyProperty = this._options.keyProperty;

         if (items && items.each) {
            items.each(function(item) {
               selectedKeys.push(item.get(keyProperty));
            });
         }

         _private.setSelectedKeys(this, selectedKeys);
         _private.getItems(this).assign(items);
         _private.notifyChanges(this, this._selectedKeys);
      },

      _onAddItemHandler: function(event, item) {
         _private.addItem(this, item);
         this._notify('choose', [item]);
      },

      _onRemoveItemHandler: function(event, item) {
         _private.removeItem(this, item);
      },

      _onUpdateItems: function(event, items) {
         this._setItems(items);
      }
   });

   ControllerLookup.getDefaultOptions = function() {
      return {
         selectedKeys: []
      };
   };

   return ControllerLookup;
});
