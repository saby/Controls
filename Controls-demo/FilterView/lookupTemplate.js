define('Controls-demo/FilterView/lookupTemplate',
   [
      'UI/Base',
      'wml!Controls-demo/FilterView/lookupTemplate/lookupTemplate',
   ],

   function(Base, template) {

      'use strict';
      var LookupTemplate = Base.Control.extend({

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

      return LookupTemplate;
   });
