define('Controls-demo/Decorators/WrapURLs/WrapURLs',
   [
      'Core/Control',
      'wml!Controls-demo/Decorators/WrapURLs/WrapURLs',

      'Controls/input',
      'Controls/decorator',
   ],
   function(Control, template) {

      'use strict';

      var ModuleClass = Control.extend({
         _template: template,

         _wrapText: null,

         _inputCompletedHandler: function(event, value) {
            this._wrapText = value;
         }
      });
   
      ModuleClass._styles = ['Controls-demo/Decorators/WrapURLs/WrapURLs'];

      return ModuleClass;
}
);