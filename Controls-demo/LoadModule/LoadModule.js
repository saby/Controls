/**
 * https://online.sbis.ru/opendoc.html?guid=316f5d63-a4f5-4347-8a7b-d86e8630ad6b
 */
define('Controls-demo/LoadModule/LoadModule', [
   'Core/Control',
   'wml!Controls-demo/LoadModule/LoadModule',
   'Controls/toggle',
   'optional!SomeUnknownModules/foo/bar',
   'optional!Controls-demo/foo/bar'
], function(Control, template) {
   'use strict';

   var ModuleClass = Control.extend(
      {
         _template: template,
         _beforeMount: function() {
         }
      }
   );
   return ModuleClass;
});
