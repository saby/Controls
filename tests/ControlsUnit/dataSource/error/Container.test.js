/* global define, beforeEach, afterEach, describe, it, assert, sinon */
define([
   'Controls/dataSource'
], function(dataSource) {
   describe('Controls/dataSource:error.Container', function() {
      const Container = dataSource.error.Container;
      let instance;

      function mockPopupHelper(popupId) {
         instance._popupHelper = {
            openDialog(config, opener, handlers) {
               this._onClose = handlers && handlers.onClose;
               return Promise.resolve(popupId);
            },
            closeDialog(id) {
               if (id === popupId && typeof this._onClose === 'function') {
                  this._onClose();
               }
            }
         };
      }

      function createInstance() {
         instance = new Container();
         sinon.stub(instance, '_notify');
         mockPopupHelper();
      }

      afterEach(() => {
         sinon.restore();
      });

      it('is defined', function() {
         assert.isDefined(Container);
      });

      it('is constructor', function() {
         assert.isFunction(Container);
         createInstance();
         assert.instanceOf(instance, Container);
      });

      describe('_openDialog()', function() {
         beforeEach(() => {
            createInstance();
         });

         it('closes previously opened dialog', function() {
            sinon.stub(instance, '_closeDialog');
            instance._popupId = 'test';

            return instance._openDialog({}).then(() => {
               assert.isTrue(instance._closeDialog.calledOnce, '_closeDialog called');
               assert.isNotOk(instance._popupId, '_closeDialog is empty');
            });
         });

         it('notifies "dialogClosed" on closing opened dialog', function() {
            const popupId = String(Date.now());
            const config = {};
            mockPopupHelper(popupId);
            return instance._openDialog(config).then(() => {
               assert.strictEqual(instance._popupId, popupId, 'saves popupId');

               // Диалог открылся. Теперь эмулируем закрытие диалога.
               instance._popupHelper.closeDialog(popupId);
               assert.isNotOk(instance._popupId, 'clears popupId');
               assert.isTrue(instance._notify.calledOnceWith('dialogClosed', []), 'notifies "dialogClosed"');
            });
         });
      });
   });
});
