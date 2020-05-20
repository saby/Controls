define('Controls-demo/Search/SearchVDom', [
   'Core/Control',
   'wml!Controls-demo/Search/SearchVDom',
   'Controls/search'
], function (Control, template) {
   'use strict';

   var ModuleClass = Control.extend(
      {
         _template: template,
         _value: '',
         textValue: '',
         textSearchValue: '',

         _changeValueSearchHandler: function () {
            this.textSearchValue += 'search\n';
         },
         _changeValuesHandler: function () {
            this.textValue += 'valueChanged\n';
         }

      });
   ModuleClass._styles = ['Controls-demo/Search/SearchVDOM'];

   return ModuleClass;
});