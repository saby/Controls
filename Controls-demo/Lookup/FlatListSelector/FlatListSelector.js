define('Controls-demo/Lookup/FlatListSelector/FlatListSelector', [
   'Core/Control',
   'wml!Controls-demo/Lookup/FlatListSelector/FlatListSelector',
   'Controls-demo/Lookup/DemoHelpers/DataCatalog',
   'Types/source',
   'Types/entity',
   'Controls-demo/Utils/MemorySourceFilter',
   'css!Controls-demo/Controls-demo'
], function(Control, template, lookupData, source, entity, MemorySourceFilter) {

   'use strict';

   var FlatListSelector = Control.extend({
      _template: template,
      _keyProperty: 'id',
      _selectionChanged: false,

      _beforeMount: function(newOptions) {
         var keyProperty = this._keyProperty;
         this._filter = Object.assign({}, newOptions.filter);

         this._closeSelectorBind = this._closeSelector.bind(this);
         this._source = newOptions.source || new source.Memory({
            data: lookupData._companies,
            filter: function(item, queryFilter) {
               var selectionFilterFn = function(item, filter) {
                  var
                     isSelected = false,
                     itemId = item.get(keyProperty);

                  filter.selection.get('marked').forEach(function(selectedId) {
                     if (selectedId == itemId || (selectedId === null && filter.selection.get('excluded').indexOf(itemId) === -1)) {
                        isSelected = true;
                     }
                  });

                  return isSelected;
               };

               return queryFilter.selection ? selectionFilterFn(item, queryFilter) : MemorySourceFilter()(item, queryFilter);
            },

            keyProperty: keyProperty
         });
         if (newOptions.type) {
            this._filter.type = newOptions.type;
         }

         if (newOptions.parent) {
            this._filter.parent = newOptions.parent;
         }
      },
      _beforeUnmount: function() {
         delete this._filter;
      },

      _closeSelector: function() {
         this._children.SelectorController._selectComplete();
      },

      _selectedKeysChanged: function() {
         this._selectionChanged = true;
      },

      _sendResult: function(event, result) {
         // Строим дерево
         while (result.at(0).get('parent')) {
            lookupData._equipment.forEach(function(item) {
               if (item.id === result.at(0).get('parent')) {
                  result.add(new entity.Model({
                     rawData: item,
                     idProperty: 'id'
                  }), 0);
               }
            });
         }
      }
   });


   FlatListSelector.getDefaultOptions = function() {
      return {
         filter: {},
         multiSelect: false
      };
   };

   return FlatListSelector;
});
