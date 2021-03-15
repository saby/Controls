define([
   'Controls/form',
   'Types/entity',
   'Core/Deferred'
], (form, entity, Deferred) => {
   'use strict';
   const { ControllerBase } = form;
   const { Model } = entity;

   describe('Controls/_form/ControllerBase', () => {

      it('registerPending', async () => {
         let updatePromise;
         let FC = new ControllerBase();
         FC._crudController = {
            hideIndicator() {}
         };
         FC._createChangeRecordPending();
         assert.isTrue(FC._pendingPromise !== undefined);
         FC.update = () => new Promise((res) => updatePromise = res);
         FC._confirmDialogResult(true, new Deferred());
         await updatePromise({});
         assert.isTrue(FC._pendingPromise === null);

         FC._createChangeRecordPending();
         FC._beforeUnmount();
         assert.isTrue(FC._pendingPromise === null);
         FC.destroy();
      });

      it('_confirmRecordChangeHandler', async() => {
         let FC = new ControllerBase();
         let isDefaultCalled = false;
         let isNegativeCalled = false;
         let showConfirmPopupResult = false;
         const defaultAnswerCallback = () => isDefaultCalled = true;
         const negativeAnswerCallback = () => isNegativeCalled = true;
         const mokePromiseFunction = () => {
            return {
               then: (thenCallback) => thenCallback(showConfirmPopupResult)
            };
         };

         FC._needShowConfirmation = () => false;
         FC._confirmRecordChangeHandler(defaultAnswerCallback, negativeAnswerCallback);
         assert.equal(isDefaultCalled, true);
         assert.equal(isNegativeCalled, false);
         isDefaultCalled = false;

         FC._needShowConfirmation = () => true;
         FC._showConfirmPopup = mokePromiseFunction;
         FC._confirmRecordChangeHandler(defaultAnswerCallback, negativeAnswerCallback);
         assert.equal(isDefaultCalled, false);
         assert.equal(isNegativeCalled, true);
         isNegativeCalled = false;

         showConfirmPopupResult = true;
         FC.update = mokePromiseFunction;
         FC._confirmRecordChangeHandler(defaultAnswerCallback, negativeAnswerCallback);
         assert.equal(isDefaultCalled, true);
         assert.equal(isNegativeCalled, false);
         FC.destroy();
      });

      it('formOperations', () => {
         const FC = new ControllerBase();
         let isSaveCalled = false;
         let isCancelCalled = false;
         let isDestroyed = false;
         const operation = {
            save() {
               isSaveCalled = true;
            },
            cancel() {
               isCancelCalled = true;
            },
            isDestroyed() {
               return isDestroyed;
            }
         };
         FC._registerFormOperationHandler(null, operation);
         FC._registerFormOperationHandler(null, operation);
         assert.equal(FC._formOperationsStorage.length, 2);

         FC._startFormOperations('save');
         assert.equal(isSaveCalled, true);
         assert.equal(isCancelCalled, false);

         isSaveCalled = false;
         FC._startFormOperations('cancel');
         assert.equal(isSaveCalled, false);
         assert.equal(isCancelCalled, true);
         isCancelCalled = false;

         isDestroyed = true;
         FC._startFormOperations('cancel');
         assert.equal(isSaveCalled, false);
         assert.equal(isCancelCalled, false);
         assert.equal(FC._formOperationsStorage.length, 0);

         FC.destroy();
      });

      it('_confirmDialogResult', (done) => {
         let FC = new ControllerBase();
         let promise = new Promise((resolve, reject) => {
            reject('update error');
         });
         FC.update = () => promise;
         let calledEventName;
         FC._notify = (event) => {
            calledEventName = event;
         };
         FC._confirmDialogResult(true, new Promise(()=>{}));
         promise.catch(() => {
            assert.equal(calledEventName, 'cancelFinishingPending');
            FC.destroy();
            done();
         })
      });

      it('_needShowConfirmation', () => {
         let FC = new ControllerBase();
         FC._record = new Model({
            rawData: {
               someField: ''
            }
         });
         FC._record.set('someField', 'newValue');

         let result = FC._needShowConfirmation();
         assert.isTrue(result);
         FC._record.acceptChanges();
         FC._options.confirmationShowingCallback = () => {
            return true;
         };
         assert.isTrue(result);
      });
   });
});
