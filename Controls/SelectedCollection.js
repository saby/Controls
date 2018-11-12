define('Controls/SelectedCollection',
   [
      'Core/Control',
      'wml!Controls/SelectedCollection/SelectedCollection',
      'wml!Controls/SelectedCollection/ItemTemplate',
      'WS.Data/Chain',
      'css!Controls/SelectedCollection/SelectedCollection'
   ],

   function(Control, template, ItemTemplate, Chain) {
      'use strict';

      /**
       * Control, that display collection of items.
       *
       * @class Controls/SelectedCollection
       * @extends Core/Control
       * @mixes Controls/SelectedCollection/SelectedCollectionStyles
       * @control
       * @public
       */

      var _private = {
         onResult: function(eventType, item) {
            if (eventType === 'crossClick') {
               this._notify('crossClick', [item]);
            } else if (eventType === 'itemClick') {
               this._notify('itemClick', [item]);
            }
         },

         getVisibleItems: function(items, maxVisibleItems) {
            return maxVisibleItems ? Chain(items).last(maxVisibleItems).value() : items;
         }
      };

      var Collection = Control.extend({
         _template: template,
         _templateOptions: null,

         _beforeMount: function(options) {
            this._onResult = _private.onResult.bind(this);
            this._visibleItems = _private.getVisibleItems(options.items, options.maxVisibleItems);
         },

         _beforeUpdate: function(newOptions) {
            if (this._options.items !== newOptions.items) {
               this._visibleItems = _private.getVisibleItems(newOptions.items, newOptions.maxVisibleItems);
               this._templateOptions.items = newOptions.items;
            }
         },

         _afterUpdate: function() {
            if (this._templateOptions.width !== this._container.offsetWidth) {
               this._templateOptions.width = this._container.offsetWidth;
            }
         },

         _afterMount: function() {
            this._templateOptions = {
               items: this._options.items,
               displayProperty: this._options.displayProperty,
               width: this._container && this._container.offsetWidth,
               clickCallback: this._onResult.bind(this)
            };
            this._forceUpdate();
         },

         _onResult: function(event, item) {
            if (event === 'itemClick') {
               this._itemClick(event, item);
            } else if (event === 'crossClick') {
               this._crossClick(event, item);
            }
         },

         _itemClick: function(event, item) {
            this._notify('itemClick', [item]);
         },

         _crossClick: function(event, index) {
            var
               items = this._options.items,
               currentItem = items.at ? items.at(index) : items[index];

            this._notify('crossClick', [currentItem]);
         }
      });

      Collection.getDefaultOptions = function() {
         return {
            itemTemplate: ItemTemplate,
            itemsLayout: 'default'
         };
      };

      return Collection;
   });
