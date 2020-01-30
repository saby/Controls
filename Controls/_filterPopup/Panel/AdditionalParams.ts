import Control = require('Core/Control');
import Utils = require('Types/util');
import {isEqual} from 'Types/object';
import Clone = require('Core/core-clone');
import template = require('wml!Controls/_filterPopup/Panel/AdditionalParams/AdditionalParams');
import chain = require('Types/chain');
import 'css!theme?Controls/filterPopup';
/**
 * Control "Additional params". Used in the filter panel.
 * @class Controls/_filterPopup/Panel/AdditionalParams
 * @extends Core/Control
 * @control
 * @private
 * @author Герасимов А.М.
 */

   var MAX_NUMBER_ITEMS_COLUMN = 5;

   var _private = {

      cloneItems: function(items) {
         if (items['[Types/_entity/CloneableMixin]']) {
            return items.clone();
         }
         return Clone(items);
      },

      getVisibleItemsCount: function(items) {
         var count = 0;
         chain.factory(items).each(function(item) {
            if (Utils.object.getPropertyValue(item, 'visibility') !== undefined) {
               count++;
            }
         });
         return count;
      },

      getColumnsByItems: function(items) {
         var countItemsColumn = _private.getVisibleItemsCount(items) / 2;
         var columns = {
            leftColumn: [],
            rightColumn: []
         };
         chain.factory(items).each(function(item, index) {
            if (Utils.object.getPropertyValue(item, 'visibility') !== undefined) {
               if (columns.leftColumn.length < countItemsColumn) {
                  columns.leftColumn.push(index);
               } else {
                  columns.rightColumn.push(index);
               }
            }
         });
         return columns;
      },

      needShowArrow: function(items, countItems) {
         var countLeftItems = 0, countRightItems = 0;
         chain.factory(items).each(function(item, index) {
            if (Utils.object.getPropertyValue(item, 'visibility') === false) {
               if (countItems.leftColumn.indexOf(index) !== -1) {
                  countLeftItems++;
               } else {
                  countRightItems++;
               }
            }
         });
         if (countLeftItems > MAX_NUMBER_ITEMS_COLUMN || countRightItems > MAX_NUMBER_ITEMS_COLUMN) {
            return true;
         }
         return false;
      },

      onResize: function(self) {
         self._arrowVisible = _private.needShowArrow(self.items, self._columns);

         if (!self._arrowVisible) {
            self._isMaxHeight = true;
         }
         self._forceUpdate();
      }
   };

   var AdditionalParams = Control.extend({
      _template: template,
      _isMaxHeight: true,
      _arrowVisible: false,
      _columns: null,

      _beforeMount: function(options) {
         this.items = _private.cloneItems(options.items);
         this._columns = _private.getColumnsByItems(options.items);
      },

      _afterMount: function() {
         _private.onResize(this);
      },

      _beforeUpdate: function(newOptions) {
         if (!isEqual(this.items, newOptions.items)) {
            this.items = _private.cloneItems(newOptions.items);
            this._columns = _private.getColumnsByItems(newOptions.items);
            _private.onResize(this);
         }
      },

      _isItemVisible: function(item) {
         return Utils.object.getPropertyValue(item, 'visibility') === undefined ||
            Utils.object.getPropertyValue(item, 'visibility');
      },

      _textValueChangedHandler: function(event, index, textValue) {
         this._options.items[index].textValue = textValue;
         this._notify('itemsChanged', [this._options.items]);
      },

      _valueChangedHandler: function(event, index, value) {
         this._options.items[index].value = value;
         this._options.items[index].visibility = true;
         this._notify('itemsChanged', [this._options.items]);
      },

      _visibilityChangedHandler: function(event, index) {
         this._options.items[index].visibility = true;
         this._notify('itemsChanged', [this._options.items]);
      },

      _clickSeparatorHandler: function() {
         this._isMaxHeight = !this._isMaxHeight;
      }

   });

   AdditionalParams._private = _private;

   export = AdditionalParams;

