define('Controls-demo/PendingRegistrator/Content2', [
   'UI/Base',
   'wml!Controls-demo/PendingRegistrator/Content2',
   'Env/Env',
   'Core/Deferred',
], function(Base, tmpl, Env, Deferred) {
   'use strict';

   var timeout = 3000;

   var module = Base.Control.extend({
      _template: tmpl,
      _register: function() {
         if (!this._def) {
            var def = new Deferred();
            this._notify('registerPending', [def], { bubbling: true });
            this._def = def;
         } else {
            Env.IoC.resolve('ILogger').error('Controls-demo/PendingRegistrator/Content2', 'Pending registered already.');
         }
      },
      _finish: function() {
         var self = this;
         self._notify('finishingPendingProcess', [timeout], { bubbling: true });
         setTimeout(function() {
            if (!self._def.isReady()) {
               self._notify('finishedPendingProcess', [timeout], { bubbling: true });
               self._def.callback(true);
            }
            self._def = null;
         }, timeout);
      },
      _cancel: function() {
         this._notify('cancelFinishingPending', [], { bubbling: true });
      }
   });

   module._styles = ['Controls-demo/PendingRegistrator/Content2'];

   return module;
});
