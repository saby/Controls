define('Controls-demo/Menu/Control/SelectorTemplate/StackTemplate', [
   'Core/Control',
   'wml!Controls-demo/Menu/Control/SelectorTemplate/StackTemplate',
   'Types/source',
   'css!Controls-demo/Input/Lookup/FlatListSelector/FlatListSelector'

], function(Control, template, source) {

   'use strict';

   var DropdownDemo = Control.extend({
      _template: template,
      _selectionChanged: false,

      _beforeMount: function(options) {
         this._source = new source.Memory({
            idProperty: 'key',
            data: options.items,
            filter: function(item, queryFilter) {
               if (queryFilter.selection) {
                  var itemId = String(item.get('key'));
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
