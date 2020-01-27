define('Controls-demo/Dropdown/StackTemplate', [
   'Core/Control',
   'wml!Controls-demo/Dropdown/StackTemplate',
   'Types/source',
   'css!Controls-demo/Input/Lookup/FlatListSelector/FlatListSelector'

], function(Control, template, source) {

   'use strict';

   var DropdownDemo = Control.extend({
      _template: template,
      _selectionChanged: false,

      _beforeMount: function(options) {
         this._source = new source.Memory({
            idProperty: 'id',
            data: options.items,
            filter: function(item, queryFilter) {
               if (queryFilter.selection) {
                  var itemId = String(item.get('id'));
                  var marked = queryFilter.selection.get('marked');
                  var isSelected = false;
                  marked.forEach(function (selectedId) {
                     if (String(selectedId) === itemId) {
                        isSelected = true;
                     }
                  });
                  return isSelected;
               }
               return true;
            }
         });
         this._selectionChanged = options.selectedItems.getCount() > 0;
         this._filter = {};
      },

      _selectedKeysChanged: function() {
         this._selectionChanged = true;
      },

      _selectComplete: function() {
         this._children.SelectorController._selectComplete();
      }

   });
   return DropdownDemo;
});
