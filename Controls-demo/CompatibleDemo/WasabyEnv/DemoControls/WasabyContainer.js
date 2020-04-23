define('Controls-demo/CompatibleDemo/WasabyEnv/DemoControls/WasabyContainer',
   [
      'Core/Control',
      'wml!Controls-demo/CompatibleDemo/WasabyEnv/DemoControls/WasabyContainer',
      'Lib/Control/LayerCompatible/LayerCompatible',
   ],
   function(Control, template, CompatibleLayer) {
      'use strict';

      var WasabyContainer = Control.extend({
         _template: template,
         _styles: ['Controls-demo/CompatibleDemo/CompatibleDemo'],
         _compatibleReady: false,
         _text: null,

         _beforeMount: function() {
            this._text = 'Wait...';
         },

         _afterMount: function() {
            var self = this;
            CompatibleLayer.load()
               .addCallback(function() {
                  self._compatibleReady = true;
                  self._text = 'Init success!';
                  self._forceUpdate();
               });
         },
         _setText: function(e, value) {
            this._text = value;
         },

         _setTextOld: function(e, value) {
            this.getTopParent()._setText(e, value);
         },
      });
      return WasabyContainer;
   }
);
