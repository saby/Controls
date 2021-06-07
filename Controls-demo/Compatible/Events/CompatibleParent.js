define('Controls-demo/Compatible/Events/CompatibleParent', [
      'Lib/Control/CompoundControl/CompoundControl',
      'wml!Controls-demo/Compatible/Events/CompatibleParent',
      'UI/Base',
      'Controls-demo/Compatible/Events/WasabyContainer',
      'Core/helpers/Hcontrol/makeInstanceCompatible'
   ],
   
   function(CompoundControl, dotTplFn, Base, WasabyContainer, makeInstanceCompatible) {
      var moduleClass = CompoundControl.extend({
         _dotTplFn: dotTplFn,

         init: function() {
            var self = this;
            moduleClass.superclass.init.call(self);
            var wasaby = Base.Control.createControl(WasabyContainer, {}, document.getElementsByClassName('wasaby')[0]);
            makeInstanceCompatible(wasaby);
            this.subscribeTo(wasaby, 'myEvent', function() {
               wasaby.value = 'true';
            });
         }
      });
      return moduleClass;
   }
);
