define('Controls-demo/CompatibleDemo/WasabyEnv/DemoControls/WS3Container', [
   'Lib/Control/CompoundControl/CompoundControl',
   'wml!Controls-demo/CompatibleDemo/WasabyEnv/DemoControls/WS3Container',
   'UI/Base',
   'Vdom/Vdom',
   'Controls-demo/CompatibleDemo/WasabyEnv/DemoControls/WasabyContainer',
   'Core/helpers/Hcontrol/makeInstanceCompatible'
], function(CompoundControl, template, Base, Vdom, WasabyContainer, makeInstanceCompatible) {

   var CompatibleDemoNext = CompoundControl.extend({
      _dotTplFn: template,
      _text: null,

      init: function() {
         CompatibleDemoNext.superclass.init.call(this);
         this.getChildControlByName('initStatusChild').setCaption('init');
         this.myTextBoxElement = this._container.find('.for__ws4');
         this.myTextBox = Base.Control.createControl(
            WasabyContainer,
            {
               name: 'myTextBox'
            },
            this.myTextBoxElement
         );
         var self = this;
         var myTextBox = this.getChildControlByName('TextBoxWrapper');
         myTextBox.subscribe('onTextChange', function() {
            self.getChildControlByName('initStatusChild').setCaption('update');
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
