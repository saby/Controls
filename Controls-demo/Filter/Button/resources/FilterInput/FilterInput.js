define('Controls-demo/Filter/Button/resources/FilterInput/FilterInput', [
   'UI/Base',
   'wml!Controls-demo/Filter/Button/resources/FilterInput/FilterInput',
], function(Base, template) {

   'use strict';

   var FilterInputVDom = Base.Control.extend({
      _template: template,

      _valueChanged: function(event, value) {
         this._notify('textValueChanged', [this._options.caption + ': ' + value]);
         this._notify('valueChanged', [value]);
      }
   });
   FilterInputVDom._styles = ['Controls-demo/Filter/Button/resources/FilterInput/FilterInput'];

   return FilterInputVDom;
});
