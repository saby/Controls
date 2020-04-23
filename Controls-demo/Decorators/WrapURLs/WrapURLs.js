define('Controls-demo/Decorators/WrapURLs/WrapURLs',
   [
      'Core/Control',
      'wml!Controls-demo/Decorators/WrapURLs/WrapURLs',

      'Controls/input',
      'Controls/decorator',
   ],
   function(Control, template) {

      'use strict';

      return Control.extend({
         _template: template,
         _styles: ['Controls-demo/Decorators/WrapURLs/WrapURLs'],

         _wrapText: null,

         _inputCompletedHandler: function(event, value) {
            this._wrapText = value;
         }
      });
   }
);