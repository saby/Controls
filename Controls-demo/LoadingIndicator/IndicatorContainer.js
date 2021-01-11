define('Controls-demo/LoadingIndicator/IndicatorContainer', [
   'UI/Base',
   'wml!Controls-demo/LoadingIndicator/IndicatorContainer',
], function(Base, tmpl) {
   'use strict';

   var module = Base.Control.extend({
      _template: tmpl,
      _open: function(e, time) {
         this._children.loadingIndicator.show({});
         setTimeout(function() {
            this._children.loadingIndicator.hide();
         }.bind(this), time);
      },
   });

   module._styles = ['Controls-demo/LoadingIndicator/IndicatorContainer'];

   return module;
});
