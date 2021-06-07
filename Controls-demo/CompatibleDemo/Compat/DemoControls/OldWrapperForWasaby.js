define('Controls-demo/CompatibleDemo/Compat/DemoControls/OldWrapperForWasaby', [
   'Lib/Control/CompoundControl/CompoundControl',
   'wml!Controls-demo/CompatibleDemo/Compat/DemoControls/OldWrapperForWasaby',
   'UI/Base',
   'Vdom/Vdom',
   'Controls/input',
   'Core/helpers/Hcontrol/makeInstanceCompatible'
], function(CompoundControl, template, Base, Vdom, input, makeInstanceCompatible) {

   var CompatibleDemoNext = CompoundControl.extend({
      _dotTplFn: template,
      _text: null,

      init: function() {
         CompatibleDemoNext.superclass.init.call(this);
         this.myTextBoxElement = this._container.find('.for__ws4');
         this.myTextBox = Base.Control.createControl(
             input.Text,
            {
               name: 'myTextBox',
               value: this._text,
            },
            this.myTextBoxElement
         );
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
