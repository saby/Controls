define('Controls-demo/CompatibleDemo/Compat/DemoControls/OldWrapperForWasabyCreator', [
   'Lib/Control/CompoundControl/CompoundControl',
   'wml!Controls-demo/CompatibleDemo/Compat/DemoControls/OldWrapperForWasabyCreator',
   'UI/Base',
   'Vdom/Vdom',
   'Controls/input',
   'Core/Creator'
], function(CompoundControl, template, Base, Vdom, input, CoreCreator) {

   var CompatibleDemoNext = CompoundControl.extend({
      _dotTplFn: template,
      _text: null,

      init: function() {
         CompatibleDemoNext.superclass.init.call(this);
         this.myTextBoxElement = this._container.find('.for__ws4');
         this.myTextBox = null;
         var self = this;
         CoreCreator(
            input.Text,
            {
               name: 'myTextBox',
            },
            this.myTextBoxElement
         ).then(function(inst) {
            self.myTextBox = inst;
         }).catch(function(e) {

         });

      },

      destroy: function() {
         if (this.myTextBox) {
            Vdom.Synchronizer.unMountControlFromDOM(
               this.myTextBox,
               this.myTextBoxElement
            );
            this.myTextBox = null;
            this.myTextBoxElement = null;
         }
         CompatibleDemoNext.superclass.destroy.apply(this, arguments);
      }
   });

   return CompatibleDemoNext;
});
