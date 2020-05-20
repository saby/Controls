define('Controls-demo/FilterView/lookupTemplate',
   [
      'Core/Control',
      'wml!Controls-demo/FilterView/lookupTemplate/lookupTemplate',
   ],

   function(Control, template) {

      'use strict';
      var LookupTemplate = Control.extend({

         _template: template,

         _selectedKeysHandler: function(event, keys) {
            this._notify('selectedKeysChanged', [keys]);
         },

         _itemsChangedHandler: function(event, keys) {
            this._notify('itemsChanged', [keys]);
         },

         _textValueHandler: function(event, textValue) {
            this._notify('textValueChanged', [textValue]);
         }

      });

      LookupTemplate._styles = ['Controls-demo/Dropdown/Dropdown'];

      return LookupTemplate;
   });
