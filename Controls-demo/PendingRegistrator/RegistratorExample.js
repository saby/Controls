define('Controls-demo/PendingRegistrator/RegistratorExample', [
   'Core/Control',
   'wml!Controls-demo/PendingRegistrator/RegistratorExample',
], function(Control, tmpl) {
   'use strict';

   var noPendings = 'no registered pendings';
   var pendingRegistered = 'pending registered';
   var pendingsRegistered = ' pendings registered';
   var pendingProcessFinishing = 'pending finishing with timeout = ';
   var pendingProcessFinished = 'pending finished';
   var pendingFinished = 'callback of finished pendings with result = ';
   var waitingPendings = 'waiting finish of pendings...';
   var cancelledPendings = 'finish pendings waiter cancelled';

   var module = Control.extend({
      _template: tmpl,
      _styles: ['Controls-demo/PendingRegistrator/RegistratorExample'],
      _message: noPendings,
      _pendingMessage: '',
      _pendingCount: 0,
      _finish: function() {
         var self = this;
         this._pendingMessage = waitingPendings;
         this._children.registrator.finishPendingOperations().addCallback(function(res) {
            self._pendingMessage = pendingFinished + '[' + res.toString() + ']';
            self._forceUpdate();
            return res;
         }).addErrback(function(err) {
            self._message = err.toString();
            self._forceUpdate();
            return err;
         });
      },
      _registerPending: function() {
         this._pendingCount++;
         this._message = this._pendingCount === 1 ? pendingRegistered : (this._pendingCount + pendingsRegistered);
         this._forceUpdate();
      },
      _finishingPendingProcess: function(e, timeout) {
         this._message = pendingProcessFinishing + timeout + 'ms';
         this._forceUpdate();
      },
      _finishedPendingProcess: function() {
         this._pendingCount--;
         this._message = pendingProcessFinished;
         this._forceUpdate();
      },
      _cancelFinishingPending: function() {
         this._pendingMessage = cancelledPendings;
         this._forceUpdate();
      }
   });

   return module;
});
