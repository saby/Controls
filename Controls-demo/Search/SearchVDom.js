define('Controls-demo/Search/SearchVDom', [
   'UI/Base',
   'wml!Controls-demo/Search/SearchVDom',
   'Controls/search'
], function (Base, template) {
   'use strict';

   var ModuleClass = Base.Control.extend(
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