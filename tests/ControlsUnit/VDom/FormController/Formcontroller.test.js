define([
   'Controls/form',
   'Core/Deferred',
   'Types/entity',
   'Core/polyfill/PromiseAPIDeferred'
], (form, Deferred, entity) => {
   'use strict';

   describe('FormController', () => {
      it('initializingWay', (done) => {
         let FC = new form.Controller();

         let baseReadRecordBeforeMount = form.Controller._readRecordBeforeMount;
         let baseCreateRecordBeforeMount = form.Controller._createRecordBeforeMount;
         let cfg = {
            record: new entity.Record(),
         };

         let isReading = false;
         let isCreating = false;

         FC._readRecordBeforeMount = () => {
            isReading = true;
            return Promise.resolve({ data: true });
         };

         FC._createRecordBeforeMount = () => {
            isCreating = true;
            return Promise.resolve({ data: true });
         };

         let p1 = new Promise((resolve) => {
            let beforeMountResult = FC._beforeMount(cfg);
            assert.equal(isReading, false);
            assert.equal(isCreating, false);
            assert.notEqual(beforeMountResult, true);
            resolve();
         });

         let p2 = new Promise((resolve) => {
            cfg.key = '123';
            let beforeMountResult = FC._beforeMount(cfg);
            assert.equal(isReading, true);
            assert.equal(isCreating, false);
            assert.notEqual(beforeMountResult, true);
            resolve();
         }).catch((error) => {
            done(error);
         });

         let p3 = new Promise((resolve) => {
            cfg = {
               key: 123
            };
            isReading = false;
            let beforeMountResult = FC._beforeMount(cfg);
            assert.equal(isReading, true);
            assert.equal(isCreating, false);
            assert.isTrue(
               beforeMountResult instanceof Deferred ||
               beforeMountResult instanceof Promise
            );
            beforeMountResult.then(({ data }) => {
               assert.equal(data, true);
               resolve();
            }).catch((error) => {
               done(error);
            });
         });
         let p4 = new Promise((resolve) => {
            isReading = false;
            isCreating = false;
            let beforeMountResult = FC._beforeMount({});
            assert.equal(isReading, false);
            assert.equal(isCreating, true);
            assert.isTrue(
               beforeMountResult instanceof Deferred ||
               beforeMountResult instanceof Promise
            );
            beforeMountResult.then(({ data }) => {
               assert.equal(data, true);
               resolve();
            });
         });

         Promise.all([p1, p2, p3, p4]).then(() => {
            form.Controller._readRecordBeforeMount = baseReadRecordBeforeMount;
            form.Controller._createRecordBeforeMount = baseCreateRecordBeforeMount;
            FC.destroy();
            done();
         });
      });

      it('registerPending', async () => {
         let updatePromise;
         let FC = new form.Controller();
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

      it('beforeUpdate', async () => {
         let FC = new form.Controller();
         let setRecordCalled = false;
         let readCalled = false;
         let createCalled = false;
         let createDeferred = new Deferred();
         let createPromiseResolver;
         let createPromiseResolverUpdate;
         let createPromiseResolverShow;
         let createPromiseResolverReed;
         let createPromiseResolverDelete;
         let createPromise;

         FC._setRecord = () => {
            setRecordCalled = true;
         };
         FC.read = () => {
            readCalled = true;
            return new Promise((res) => {
               createPromiseResolverReed = res;
            });
         };
         FC.create = () => {
            createCalled = true;
            createPromise = new Promise((res) => { createPromiseResolver = res; });
            return createPromise;
         };

         FC._beforeUpdate({
            record: 'record'
         });
         assert.equal(setRecordCalled, true);
         assert.equal(readCalled, false);
         assert.equal(createCalled, false);

         setRecordCalled = false;
         FC._beforeUpdate({
            record: {
               isChanged: () => false
            },
            key: 'key'
         });

         assert.equal(setRecordCalled, true);
         assert.equal(readCalled, true);
         assert.equal(createCalled, false);
         assert.equal(FC._isNewRecord, false);

         setRecordCalled = false;
         readCalled = false;
         FC._beforeUpdate({
            isNewRecord: true
         });

         assert.equal(setRecordCalled, false);
         assert.equal(readCalled, false);
         assert.equal(createCalled, true);
         assert.equal(FC._isNewRecord, false);

         await createPromiseResolver();

         assert.equal(FC._isNewRecord, true);

         createCalled = false;
         let updateCalled = false;
         let confirmPopupCalled = false;
         FC._showConfirmPopup = () => {
            confirmPopupCalled = true;
            return new Promise((res) => {
               createPromiseResolverShow = res;
            });
         };
         FC.update = () => {
            updateCalled = true;
            return new Promise((res) => {
               createPromiseResolverUpdate = res;
            });
         };
         let record = {
            isChanged: () => true
         };
         FC._options.record = record;
         FC._beforeUpdate({
            record: record,
            key: 'key'
         });
         await createPromiseResolverShow(true);
         await createPromiseResolverUpdate();
         await createPromiseResolverReed();

         assert.equal(setRecordCalled, false);
         assert.equal(confirmPopupCalled, true);
         assert.equal(readCalled, true);
         assert.equal(updateCalled, true);
         assert.equal(createCalled, false);
         assert.equal(FC._isNewRecord, true);

         FC._showConfirmPopup = () => {
            confirmPopupCalled = true;
            return new Promise((res) => {
               createPromiseResolverShow = res;
            });
         };

         updateCalled = false;
         readCalled = false;
         confirmPopupCalled = false;
         let isDeleteRecord = false;
         FC._tryDeleteNewRecord = () => {
            isDeleteRecord = true;
            return new Promise((res) => {
               createPromiseResolverDelete = res;
            });
         };
         FC._beforeUpdate({
            record: record,
            key: 'key'
         });
         await createPromiseResolverShow(false);
         await createPromiseResolverDelete();


         assert.equal(setRecordCalled, false);
         assert.equal(confirmPopupCalled, true);
         assert.equal(isDeleteRecord, true);
         assert.equal(readCalled, true);
         assert.equal(updateCalled, false);
         assert.equal(createCalled, false);

         FC.destroy();
      });

      it('FormController update', (done) => {
         let isUpdatedCalled = false;
         let FC = new form.Controller();
         let validation = {
            submit: () => Promise.resolve(true)
         };
         let crud = {
            update: () => Promise.resolve()
         };
         FC._children = { crud, validation };
         FC._processError = () => {};
         FC._update().then(() => {
            isUpdatedCalled = true;
            assert.isTrue(isUpdatedCalled);
            done();
            FC.destroy();
         });
      });

      it('FormController user operations', () => {
         const FC = new form.Controller();
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

      it('FormController update with Config', (done) => {
         let configData = {
            additionalData: {
               name: 'cat'
            }
         };
         let FC = new form.Controller();
         let Crud = new form.Crud();
         let validation = {
            submit: () => Promise.resolve(true)
         };
         let data;
         FC._record = {
            getId: () => 'id1',
            isChanged: () => true
         };
         FC._isNewRecord = true;
         let crud = {
            update: Crud.update,
            _dataSource: {
               update: () => (new Deferred()).callback('key')
            },
            _options: {
               showLoadingIndicator: 'true'
            }
         };
         let argsCorrectUpdate = {
            key: 'key',
            isNewRecord: true,
            name: 'cat'
         };
         crud._notify = (event, args, bubbling) => {
            if (event === 'updateSuccessed') {
               FC._notifyHandler(event, args);
            }
         };
         FC._notify = (event, arg) => {
            if (event === 'sendResult' && arg[0].formControllerEvent === 'update') {
               data = arg[0].additionalData;
            }
         };
         FC._children = {crud, validation };
         FC._processError = () => {};
         FC.update(configData).then(() => {
            assert.deepEqual(data, argsCorrectUpdate);
            done();
            FC.destroy();
         });
      });

      it('beforeUnmount', () => {
         let isDestroyCall = false;
         let dataSource = {
            destroy: (id) => {
               assert.equal(id, 'id1');
               isDestroyCall = true;
            }
         };
         let FC = new form.Controller();
         FC.saveOptions({ dataSource });
         FC._source = dataSource;
         FC._record = {
            getId: () => 'id1'
         };
         FC._beforeUnmount();
         assert.equal(isDestroyCall, false);

         FC._isNewRecord = true;
         FC._beforeUnmount();
         assert.equal(isDestroyCall, true);
         FC.destroy();
      });

      it('delete new record', () => {
         let FC = new form.Controller();
         let isDestroyCalled = false;
         FC._source = {
            destroy: () => {
               isDestroyCalled = true;
            }
         };
         FC._tryDeleteNewRecord();
         assert.equal(isDestroyCalled, false);

         FC._record = {
            getId: () => null
         };
         FC._isNewRecord = true;

         FC._tryDeleteNewRecord();
         assert.equal(isDestroyCalled, false);

         FC._record = {
            getId: () => 'key'
         };
         FC._tryDeleteNewRecord();
         assert.equal(isDestroyCalled, true);

         FC.destroy();
      });

      it('_notifyHandler', () => {
         let createComponent = function(Component) {
            return new Component.Controller();
         };
         let name = 'deletesuccessed',
            args = {},
            sandbox = sinon.sandbox.create(),
            component = createComponent(form);

         sandbox.stub(component, '_notifyToOpener');
         sandbox.stub(component, '_notify');
         component._notifyHandler(name, args);
         sinon.assert.callOrder(component._notifyToOpener, component._notify);
         sandbox.restore();
      });

      it('_confirmDialogResult', (done) => {
         let FC = new form.Controller();
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

      it('requestCustomUpdate isNewRecord', (done) => {
         let FC = new form.Controller();
         FC._isNewRecord = true;
         FC._notify = () => true;
         FC.update().then(() => {
            assert.equal(FC._isNewRecord, false);
            done();
            FC.destroy();
         });
      });
      it('requestCustomUpdate', () => {
         let FC = new form.Controller();
         let update = false;
         FC._notify = (event) => {
            if( event === 'requestCustomUpdate') {
               return false;
            }
            return true;
         };
         FC._notifyToOpener = (eventName) => {
            if ( eventName === 'updateStarted') {
               update = true;
               FC.destroy();
            }
         };
         let validation = {
            submit: () => Promise.resolve(true)
         };
         FC._isNewRecord = true;
         FC._requestCustomUpdate = function() {
            return false;
         };
         FC._record = {
            getId: () => 'id1',
            isChanged: () => true
         };
         let crud = {
            update: () => Promise.resolve()
         };
         FC._children = { crud, validation };
         FC._processError = () => {};
         FC.update();
         assert.equal(update, true);
         FC.destroy();
      });

       it('update with error', (done) => {
         let error = false;
         let FC = new form.Controller();
         let validation = {
            submit: () => Promise.reject('error')
         };
         let crud = {
            update: () => Promise.reject()
         };
         FC._record = {
            getId: () => 'id1',
            isChanged: () => true
         };
         FC._notify = (event) => {
            return false;
         };
         FC._children = { crud, validation };
         FC._processError = () => {};
         FC.update().catch( () => {
            error = true;
            assert.isTrue(error);
            FC.destroy();
            done();
         });
      });

      it('createHandler and readHandler ', () => {
         let FC = new form.Controller();
         FC._createHandler();
         assert.equal(FC._wasCreated, true);
         assert.equal(FC._isNewRecord, true);

         FC._readHandler();
         assert.equal(FC._wasRead, true);
         assert.equal(FC._isNewRecord, false);
         FC.destroy();
      });
   });
});
