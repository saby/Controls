define('Controls-demo/LoadingIndicator/IndicatorContainer', [
   'Core/Control',
   'wml!Controls-demo/LoadingIndicator/IndicatorContainer',
], function(Control, tmpl) {
   'use strict';

   var module = Control.extend({
      _template: tmpl,
      _styles: ['Controls-demo/LoadingIndicator/IndicatorContainer'],
      _open: function(e, time) {
         this._children.loadingIndicator.show({});
         setTimeout(function() {
            this._children.loadingIndicator.hide();
         }.bind(this), time);
      },
   });

   return module;
});
