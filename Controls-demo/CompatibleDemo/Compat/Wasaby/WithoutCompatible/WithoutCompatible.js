define('Controls-demo/CompatibleDemo/Compat/Wasaby/WithoutCompatible/WithoutCompatible',
   [
      'Lib/Control/CompoundControl/CompoundControl',
      'wml!Controls-demo/CompatibleDemo/Compat/Wasaby/WithoutCompatible/WithoutCompatible',
   ],
   function(CompoundControl, template) {
      'use strict';

      var WasabyWithoutCompatible = CompoundControl.extend({
         _dotTplFn: template,
         _styles: ['Controls-demo/CompatibleDemo/CompatibleDemo'],

         init: function() {
            WasabyWithoutCompatible.superclass.init.call(this);
         },
         destroy: function() {
            WasabyWithoutCompatible.superclass.destroy.apply(this, arguments);
         }

      });
      return WasabyWithoutCompatible;
   }
);
