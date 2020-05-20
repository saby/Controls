define('Controls-demo/Dropdown/TreeStackTemplate', [
   'Core/Control',
   'wml!Controls-demo/Dropdown/TreeStackTemplate',
   'Types/source',

], function(Control, template, source) {

   'use strict';

   var DropdownDemo = Control.extend({
      _template: template,

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

         this._gridColumns = [
            {
               displayProperty: 'title',
               width: '1fr'
            }
         ];

         this._filter = {};
      },

      _selectedKeysChanged: function() {
         this._selectionChanged = true;
      },

      _selectComplete: function() {
         this._children.SelectorController._selectComplete();
      }

   });
   DropdownDemo._styles = ['Controls-demo/Input/Lookup/FlatListSelector/FlatListSelector'];

   return DropdownDemo;
});
