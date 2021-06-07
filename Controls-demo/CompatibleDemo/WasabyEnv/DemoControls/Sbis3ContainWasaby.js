define('Controls-demo/CompatibleDemo/WasabyEnv/DemoControls/Sbis3ContainWasaby', [
   'Lib/Control/CompoundControl/CompoundControl',
   'wml!Controls-demo/CompatibleDemo/WasabyEnv/DemoControls/Sbis3ContainWasaby',
   'UI/Base',
   'Vdom/Vdom',
   'Controls/input',
   'Core/helpers/Hcontrol/makeInstanceCompatible'
], function(CompoundControl, template, Base, Vdom, input, makeInstanceCompatible) {

   var CompatibleDemoNext = CompoundControl.extend({
      _dotTplFn: template,
      _text: null,

      init: function(opts) {
         CompatibleDemoNext.superclass.init.call(this);
         this.getChildControlByName('initStatus').setCaption('init');
         this.myTextBoxElement = this._container.find('.for__ws4');
         this.myTextBox = Base.Control.createControl(
             input.Text,
            {
               name: 'myTextBoxWasaby',
            },
            this.myTextBoxElement
         );
         makeInstanceCompatible(this.myTextBox);
         var myTextBox = this.getChildControlByName('TextBoxWrapper');
         var self = this;
         myTextBox.subscribe('onTextChange', function() {
            self.getChildControlByName('initStatus').setCaption('update');
         });
      },

      setTest: function(){
         this.getContainer().find('.textBox');
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
