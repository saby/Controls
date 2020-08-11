define([
   'Controls/form',
   'UI/Vdom',
   'Core/Deferred',
   'Types/entity',
   'Controls/_form/CrudController',
   'Core/polyfill/PromiseAPIDeferred'
], (form, Vdom, Deferred, entity, CrudController) => {
   'use strict';

   describe('FormController', () => {
      it('initializingWay', (done) => {
         let FC = new form.Controller();

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
            Vdom.Synchronizer.unMountControlFromDOM(FC, {});
            done();
         });
      });

      it('registerPending', async () => {
         let updatePromise;
         let FC = new form.Controller();
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
         Vdom.Synchronizer.unMountControlFromDOM(FC, {});
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
         const record = {
            isChanged: () => false
         };

         FC._setRecord = (record) => {
            FC._record = record;
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
         FC._crudController = {
            setDataSource() {}
         };

         FC._beforeUpdate({
            record: 'record'
         });
         assert.equal(setRecordCalled, true);
         assert.equal(readCalled, false);
         assert.equal(createCalled, false);

         setRecordCalled = false;
         FC._beforeUpdate({
            record: record,
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
         record.isChanged = () => true;
         FC._options.record = record;
         FC._record = record;
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

         readCalled = false;
         createCalled = false;
         setRecordCalled = false;
         updateCalled = false;
         confirmPopupCalled = false;
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
         let oldRecord = {
            isChanged: () => true
         };
         FC._options.record = oldRecord;
         FC._beforeUpdate({
            record: null
         });
         await createPromiseResolverShow(true);
         await createPromiseResolverUpdate();
         await createPromiseResolverReed();

         assert.equal(setRecordCalled, false);
         assert.equal(confirmPopupCalled, true);
         assert.equal(readCalled, false);
         assert.equal(updateCalled, true);
         assert.equal(createCalled, true);
         assert.equal(FC._isNewRecord, true);

         Vdom.Synchronizer.unMountControlFromDOM(FC, {});
      });

      it('calcInitializingWay', () => {
         let FC = new form.Controller();
         const options = {};
         let initializingWay = FC._calcInitializingWay(options);
         assert.equal(initializingWay, 'create');

         options.key = 123;
         initializingWay = FC._calcInitializingWay(options);
         assert.equal(initializingWay, 'read');

         options.record = 123;
         initializingWay = FC._calcInitializingWay(options);
         assert.equal(initializingWay, 'delayedRead');

         delete options.key;
         initializingWay = FC._calcInitializingWay(options);
         assert.equal(initializingWay, 'local');

         options.initializingWay = 'test';
         initializingWay = FC._calcInitializingWay(options);
         assert.equal(initializingWay, 'test');
         Vdom.Synchronizer.unMountControlFromDOM(FC, {});
      });

      it('FormController update', (done) => {
         let isUpdatedCalled = false;
         let FC = new form.Controller();
         FC._forceUpdate = () => {
            setTimeout(FC._afterUpdate.bind(FC));
         };
         let validation = {
            submit: () => Promise.resolve(true)
         };
         FC._children = { validation };

         FC._crudController = {
            update() {}
         };
         var sandbox = sinon.createSandbox();
         let stubUpdate = sandbox.spy(FC._crudController, 'update');

         FC._update().then(() => {
            assert.equal(stubUpdate.callCount, 1);
            done();
            Vdom.Synchronizer.unMountControlFromDOM(FC, {});
         });
      });

      it('FormController _confirmRecordChangeHandler', async() => {
         let FC = new form.Controller();
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
         Vdom.Synchronizer.unMountControlFromDOM(FC, {});
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

         Vdom.Synchronizer.unMountControlFromDOM(FC, {});
      });

      it('FormController update with Config', (done) => {
         let configData = {
            additionalData: {
               name: 'cat'
            }
         };
         let FC = new form.Controller();
         let validation = {
            submit: () => Promise.resolve(true)
         };
         let data;
         FC._record = {
            getId: () => 'id1',
            isChanged: () => true
         };
         FC._isNewRecord = true;
         let dataSource = {
            update: () => (new Deferred()).callback('key')
         };
         let argsCorrectUpdate = {
            key: 'key',
            isNewRecord: true,
            name: 'cat'
         };
         FC._notify = (event, arg) => {
            if (event === 'sendResult' && arg[0].formControllerEvent === 'update') {
               data = arg[0].additionalData;
            }
         };
         FC._children = { validation };
         FC._processError = () => {};
         FC._crudController = new CrudController.default(dataSource,
             FC._notifyHandler.bind(FC), FC.registerPendingNotifier.bind(FC), FC.indicatorNotifier.bind(FC));
         FC._forceUpdate = () => {
            setTimeout(FC._afterUpdate.bind(FC));
         };
         FC.update(configData).then(() => {
            assert.deepEqual(data, argsCorrectUpdate);
            done();
            Vdom.Synchronizer.unMountControlFromDOM(FC, {});
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
         const createFC = () => {
            let FC = new form.Controller();
            FC.saveOptions({ dataSource });
            FC._source = dataSource;
            FC._record = {
               getId: () => 'id1'
            };
            FC._crudController = {
               hideIndicator () {}
            };
            return FC;
         }
         let FC = createFC();
         FC._beforeUnmount();
         Vdom.Synchronizer.unMountControlFromDOM(FC, {});

         assert.equal(isDestroyCall, false);

         let FC2 = createFC();
         FC2._isNewRecord = true;
         FC2._crudController = {
            hideIndicator () {}
         };
         FC2._beforeUnmount();
         assert.equal(isDestroyCall, true);
         Vdom.Synchronizer.unMountControlFromDOM(FC, {});
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

         Vdom.Synchronizer.unMountControlFromDOM(FC, {});
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
            Vdom.Synchronizer.unMountControlFromDOM(FC, {});
            done();
         })
      });
      it('_needShowConfirmation', () => {
         let FC = new form.Controller();
         FC._record = {
            isChanged: () => true
         };
         let result = FC._needShowConfirmation();
         assert.isTrue(result);

         FC._record = {
            isChanged: () => false
         };
         FC._options.confirmationShowingCallback = () => {
            return true;
         };
         assert.isTrue(result);
      });

      it('requestCustomUpdate isNewRecord', (done) => {
         let FC = new form.Controller();
         FC._isNewRecord = true;
         FC._notify = () => true;
         FC.update().then(() => {
            assert.equal(FC._isNewRecord, false);
            done();
            Vdom.Synchronizer.unMountControlFromDOM(FC, {});
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
               Vdom.Synchronizer.unMountControlFromDOM(FC, {});
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
         Vdom.Synchronizer.unMountControlFromDOM(FC, {});
      });

      it('update with error', (done) => {
         let error = false;
         let FC = new form.Controller();
         FC._record = {
            getId: () => 'id1',
            isChanged: () => true
         };
         FC._notify = (event) => {
            return false;
         };
         FC._validateController = {
            submit: () => Promise.reject('error'),
            resolveSubmit: () => Promise.reject('error'),
            deferSubmit: () => Promise.reject('error'),
         };
         FC._crudController = {
            update: () => Promise.reject()
         };
         FC._processError = () => {
         };
         FC._forceUpdate = () => {
            setTimeout(FC._afterUpdate.bind(FC));
         };
         FC.update().catch(() => {
            error = true;
            assert.isTrue(error);
            Vdom.Synchronizer.unMountControlFromDOM(FC, {});
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
         Vdom.Synchronizer.unMountControlFromDOM(FC, {});
      });
   });
});
