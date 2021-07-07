/* global define, beforeEach, afterEach, describe, it, assert, sinon */
define([
   'Controls/dataSource',
   'Controls/error'
], function(
   { error: { process } },
   { process: errorProcess }
) {
   describe('Controls/dataSource:error.process', () => {
      const popupId = '42';
      let _popupHelper;

      beforeEach(() => {
         _popupHelper = {
            preloadPopup: sinon.stub(),
            openConfirmation: sinon.stub().resolves(),
            openDialog: sinon.stub().resolves(popupId),
         };
      });

      afterEach(() => {
         sinon.restore();
      });

      it('is function', () => {
         assert.isFunction(process);
      });

      it('dataSource and error export the same function', () => {
         assert.strictEqual(process, errorProcess);
      });

      it('does nothing for unknown error', () => {
         const message = 'test message';
         const error = new Error(message);
         return process({
            error,
            _popupHelper
         }).then((result) => {
            assert.isUndefined(result, 'returns undefined');
            assert.isFalse(_popupHelper.openConfirmation.calledOnceWith({ message }), 'openConfirmation called');
            assert.isNotOk(_popupHelper.openDialog.called, 'openDialog was not called');
         });
      });

      it('returns popupId', () => {
         const opener = {};
         const dialogEventHandlers = {};
         const error = new Error();
         error.status = 0;

         return process({
            error,
            opener,
            dialogEventHandlers,
            _popupHelper
         }).then((result) => {
            assert.isTrue(_popupHelper.openDialog.calledOnce, 'openDialog called');
            const args = _popupHelper.openDialog.getCall(0).args;
            assert.strictEqual(args[1].opener, opener, 'opener was passed');
            assert.strictEqual(args[1].eventHandlers, dialogEventHandlers, 'dialogEventHandlers were passed');
            assert.strictEqual(result, popupId, 'returns popupId');
         });
      });

      it('calls custom handlers', () => {
         const error = new Error();
         const viewConfig = {
            template: {},
            options: {}
         };

         return process({
            error,
            handlers: [() => viewConfig],
            _popupHelper
         }).then((result) => {
            assert.isTrue(_popupHelper.openDialog.calledOnce, 'openDialog called');

            const args = _popupHelper.openDialog.getCall(0).args[0];
            assert.include(args, viewConfig, 'openDialog called with viewConfig');
            assert.strictEqual(result, popupId, 'returns popupId');
         });
      });

      it('calls custom post-handlers', () => {
         const error = new Error();
         const viewConfig = {
            template: {},
            options: {}
         };

         return process({
            error,
            postHandlers: [() => viewConfig],
            _popupHelper
         }).then((result) => {
            assert.isTrue(_popupHelper.openDialog.calledOnce, 'openDialog called');

            const args = _popupHelper.openDialog.getCall(0).args[0];
            assert.include(args, viewConfig, 'openDialog called with viewConfig');
            assert.strictEqual(result, popupId, 'returns popupId');
         });
      });

      it('calls beforeOpenDialogCallback', () => {
         const error = new Error();
         const viewConfig = {
            template: {},
            options: {}
         };
         const beforeOpenDialogCallback = sinon.stub();

         return process({
            error,
            handlers: [() => viewConfig],
            beforeOpenDialogCallback,
            _popupHelper
         }).then(() => {
            assert.isTrue(beforeOpenDialogCallback.calledOnce, 'callback called');

            const result = beforeOpenDialogCallback.getCall(0).args[0];
            assert.deepEqual(result.template, viewConfig.template, 'callback called with viewConfig');
            assert.deepEqual(result.options, viewConfig.options, 'callback called with viewConfig');
            assert.isTrue(
               beforeOpenDialogCallback.calledBefore(_popupHelper.openDialog),
               'callback called before openDialog');
         });
      });
   });
});
