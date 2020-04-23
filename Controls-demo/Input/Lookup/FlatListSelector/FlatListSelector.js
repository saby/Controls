define('Controls-demo/Input/Lookup/FlatListSelector/FlatListSelector', [
   'Core/Control',
   'wml!Controls-demo/Input/Lookup/FlatListSelector/FlatListSelector',
   'Controls-demo/Input/Lookup/LookupData',
   'Types/source',
   'Controls-demo/Utils/MemorySourceFilter',
   'Controls/list'
], function(Control, template, lookupData, source, MemorySourceFilter) {

   'use strict';

   var FlatListSelector = Control.extend({
      _template: template,
      _styles: ['Controls-demo/Input/Lookup/FlatListSelector/FlatListSelector'],
      _keyProperty: 'id',
      _selectionChanged: false,

      _beforeMount: function(newOptions) {
         var keyProperty = this._keyProperty;

         this._closeSelectorBind = this._closeSelector.bind(this);
         this._source = newOptions.source || new source.Memory({
            data: lookupData.names,
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
      },

      _closeSelector: function() {
         this._children.SelectorController._selectComplete();
      },

      _selectedKeysChanged: function() {
         this._selectionChanged = true;
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
