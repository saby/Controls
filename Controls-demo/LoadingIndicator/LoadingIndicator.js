define('Controls-demo/LoadingIndicator/LoadingIndicator', [
   'UI/Base',
   'wml!Controls-demo/LoadingIndicator/LoadingIndicator'
], function(Base, tmpl) {
   'use strict';

   var module = Base.Control.extend({
      _template: tmpl,
      _firstId: null,
      _secondId: null,
      _thirdId: null,
      _firstOpen: function () {
         var cfg = {
            id: this._firstId,
            overlay: 'none',
            message: 'Текст первого индикатора'
         };
         this._firstId = this._notify('showIndicator', [cfg], { bubbling: true });
      },
      _secondOpen: function() {
         var cfg = {
            id: this._secondId,
            overlay: 'none',
            message: 'Текст второго индикатора'
         };
         this._secondId = this._notify('showIndicator', [cfg], { bubbling: true });
      },
      _thirdOpen: function() {
         var cfg = {
            id: this._thirdId,
            overlay: 'none',
            message: 'Текст третьего индикатора'
         };
         this._thirdId = this._notify('showIndicator', [cfg], { bubbling: true });
      },

      _close: function(event, name) {
         var indicatorName = '_' + name + 'Id';
         if (this[indicatorName]) {
            this._notify('hideIndicator', [this[indicatorName]], { bubbling: true });
            this[indicatorName] = null;
         }
      },

      _overlay: function () {
         var delay = 3000;
         var promise = new Promise(function (resolve) {
            setTimeout(function() {
               resolve();
            }, delay);
         });
         var cfg = {
            message: 'Индикатор закроется через ' + delay / 1000,
            overlay: 'dark',
            delay: 0
         };
         var id = this._notify('showIndicator', [cfg, promise], { bubbling: true });
         this._interval(id, delay);
      },

      _interval: function(id, delay) {
         var self = this;
         setInterval(function() {
            if (delay > 1000) {
               delay -= 1000;
               var cfg = {
                  id: id,
                  overlay: 'dark',
                  message: 'Индикатор закроется через ' + delay / 1000,
                  delay: 0
               };
               self._notify('showIndicator', [cfg], { bubbling: true });
               self._interval(id, delay);
            }
         }, 1000);
      },

      _singletonOpen: function() {
         require(['Core/Indicator'], function(Indicator) {
            Indicator.setMessage('Синглтон индикатор. Закроется через 3 секунды');
            setTimeout(function() {
               Indicator.hide();
            }, 5000);
         });
      },

      _compatibleOpen: function() {
         requirejs(['Lib/Control/LoadingIndicator/LoadingIndicator'], function(Indicator) {
            var inst = new Indicator();
            inst.setMessage('Индикатор в слое совместимости. закроется через 3 секунды');
            setTimeout(function() {
               inst.destroy();
            }, 5000);
         });
      }
   });

   return module;
});
