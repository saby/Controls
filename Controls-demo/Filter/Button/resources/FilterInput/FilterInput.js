define('Controls-demo/Filter/Button/resources/FilterInput/FilterInput', [
   'Core/Control',
   'wml!Controls-demo/Filter/Button/resources/FilterInput/FilterInput',
], function(Control, template) {

   'use strict';

   var FilterInputVDom = Control.extend({
      _template: template,

      _valueChanged: function(event, value) {
         this._notify('textValueChanged', [this._options.caption + ': ' + value]);
         this._notify('valueChanged', [value]);
      }
   });
   FilterInputVDom._styles = ['Controls-demo/Filter/Button/resources/FilterInput/FilterInput'];

   return FilterInputVDom;
});
