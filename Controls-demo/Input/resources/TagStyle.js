define('Controls-demo/Input/resources/TagStyle', [
   'UI/Base',
   'wml!Controls-demo/Input/resources/TagStyle',
   'Types/source'
],
function(
   BaseMod, template, source
) {
   'use strict';
   var TagStyle = BaseMod.Control.extend({
      _template: template,
      _empty: 'none',
      _placeholder: 'select',
      _items: null,
      _beforeMount: function() {
         this._items = [
            { id: '1', title: 'warning' },
            { id: '2', title: 'success' },
            { id: '3', title: 'danger' },
            { id: '4', title: 'primary' },
            { id: '5', title: 'info' },
            { id: '6', title: 'secondary' }
         ];
      },
      _createMemory: function() {
         return new source.Memory({
            keyProperty: 'id',
            data: this._items
         });
      },
      _tagStyleChangedHandler: function(event, tmp) {
         if (!tmp) {
            this._notify('tagStyleValueChanged', undefined);
         } else {
            this._notify('tagStyleValueChanged', [tmp]);
         }
      }
   });
   return TagStyle;
});
