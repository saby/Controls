import Control = require('Core/Control');
import template = require('wml!Controls/_filterPopup/Panel/PropertyGrid/PropertyGrid');
import Utils = require('Types/util');
import Clone = require('Core/core-clone');
import chain = require('Types/chain');
import {isEqual} from 'Types/object';
import 'css!theme?Controls/filterPopup';

/**
 * Control PropertyGrid
 * Provides a user interface for browsing and editing the properties of an object.
 *
 * @class Controls/_filterPopup/Panel/PropertyGrid
 * @extends Core/Control
 * @mixes Controls/interface/IPropertyGrid
 * @mixes Controls/_interface/ISource
 * @mixes Controls/interface/IItemTemplate
 * @control
 * @private
 * @author Золотова Э.Е.
 */

   const observableItemProps = ['value', 'textValue', 'visibility'];

   var _private = {
      cloneItems: function(items) {
         if (items['[Types/_entity/CloneableMixin]']) {
            return items.clone();
         }
         return Clone(items);
      },

      getIndexChangedVisibility: function(newItems, oldItems) {
         var result = -1;
         chain.factory(newItems).each(function(newItem, index) {
            // The items could change the order or quantity, so we find the same element by id
            var id = Utils.object.getPropertyValue(newItem, 'id'),
               visibility = Utils.object.getPropertyValue(newItem, 'visibility');

            if (visibility) {
               chain.factory(oldItems).each(function(oldItem) {
                  if (id === Utils.object.getPropertyValue(oldItem, 'id') &&
                     visibility !== Utils.object.getPropertyValue(oldItem, 'visibility')) {
                     result = index;
                  }
               });
            }
         });
         return result;
      },

      //Necessary for correct work of updating control, after update object in array.
      //Binding on object property in array does not update control, if this property is not versioned.
      observeProp: function(self, propName, obj) {
         var value = obj[propName];

         Object.defineProperty(obj, propName, {
            set(newValue) {
               value = newValue;
               _private.itemsChanged(self);
            },

            get() {
               return value;
            },
            // inputs notify valueChanged on afterMount, before "afterMount" hook of PG. Therefore observeItems will be called again.
            configurable: true
         });
      },

      observeItems: function(self, items) {
         chain.factory(items).each(function(item) {
            observableItemProps.forEach(function (propName) {
               _private.observeProp(self, propName, item);
            });
         });
      },

      setItems: function(self, items) {
         self._items = items;
         _private.observeItems(self, self._items);
      },

      itemsChanged(self): void {
         self._notify('itemsChanged', [self._items]);
      },

      getLastVisibleItemIndex: function (items) {
         let last_index = 0;
         items.forEach((item, i) => {
            if (Utils.object.getPropertyValue(item, 'visibility') === undefined || Utils.object.getPropertyValue(item, 'visibility')) {
               last_index = i;
            }
         });
         return last_index;
      }
   };

   var PropertyGrid = Control.extend({
      _template: template,

      _beforeMount: function(options) {
         this._items = _private.cloneItems(options.items);
         this._lastVisibleIndex = _private.getLastVisibleItemIndex(options.items);
      },

      _afterMount: function() {
         _private.observeItems(this, this._items);
      },

      _beforeUpdate: function(newOptions) {
         if (!isEqual(newOptions.items, this._items)) {
            this._changedIndex = _private.getIndexChangedVisibility(newOptions.items, this._items);
            _private.setItems(this, _private.cloneItems(newOptions.items));
         } else {
            this._changedIndex = -1;
         }
         this._lastVisibleIndex = _private.getLastVisibleItemIndex(newOptions.items);
      },

      _afterUpdate: function() {
         // Когда элемент перемещается из блока "Еще можно отобрать" в основной блок,
         // запоминаем индекс этого элемента в _changedIndex.
         // Когда основной блок перестроился, зовем activate, чтобы сфокусировать этот элемент.
         if (this._changedIndex !== -1) {
            this.activate();
         }
      },

      _isItemVisible: function(item) {
          return Utils.object.getPropertyValue(item, 'visibility') === undefined ||
              Utils.object.getPropertyValue(item, 'visibility');
      },

      _updateItem: function(index, field, value) {
         const items = _private.cloneItems(this._items);

         items[index][field] = value;
         _private.setItems(this, items);
         _private.itemsChanged(this);
      },

      _valueChangedHandler: function(event, index, value) {
         this._updateItem(index, 'value', value);
      },

      _rangeChangedHandler: function(event, index, start, end) {
         this._updateItem(index, 'value', [start, end]);
      },

      _textValueChangedHandler: function(event, index, textValue) {
         this._updateItem(index, 'textValue', textValue);
      },

      _visibilityChangedHandler: function(event, index, visibility) {
         if (!visibility) {
            this._items[index].value = this._items[index].resetValue;
         }
         this._updateItem(index, 'visibility', visibility);
      }
   });

   PropertyGrid._private = _private;

   export = PropertyGrid;


