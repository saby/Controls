define('Controls-demo/CompatibleDemo/WasabyEnv/WS3/WithoutCompatible',
   [
      'Core/Control',
      'wml!Controls-demo/CompatibleDemo/WasabyEnv/WS3/WithoutCompatible',
      'Lib/Control/LayerCompatible/LayerCompatible',
   ],
   function(Control, template, CompatibleLayer) {
      'use strict';

      var WithoutCompatible = Control.extend({
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

      });
      WithoutCompatible._styles = ['Controls-demo/CompatibleDemo/CompatibleDemo'];

      return WithoutCompatible;
   }
);
