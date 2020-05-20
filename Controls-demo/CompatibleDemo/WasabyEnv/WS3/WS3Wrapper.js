define('Controls-demo/CompatibleDemo/WasabyEnv/WS3/WS3Wrapper',
   [
      'Core/Control',
      'wml!Controls-demo/CompatibleDemo/WasabyEnv/WS3/WS3Wrapper',
      'Lib/Control/LayerCompatible/LayerCompatible',
   ],
   function(Control, template, CompatibleLayer) {
      'use strict';

      var WS3Wrapper = Control.extend({
         _template: template,
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
            this.getTopParent()._logicParent._setText(e, value);
         },
      });
      WS3Wrapper._styles = ['Controls-demo/CompatibleDemo/CompatibleDemo'];

      return WS3Wrapper;
   }
);
