define(
   [
      'Controls/Pending',
      'UI/Vdom',
      'Core/Deferred'
   ],
   (PendingRegistrator, Vdom, Deferred) => {
      'use strict';

      describe('Controls/Container/PendingRegistrator', () => {
         it('finishPendingOperations', () => {
            let Registrator = new PendingRegistrator();
            let def1 = new Deferred();
            let def2 = new Deferred();
            let def3 = new Deferred();
            const callPendingFail = [];

            Registrator._beforeMount();
            Registrator._registerPendingHandler(null, def1, {
               onPendingFail: function() {
                  callPendingFail.push(1);
               }
            });
            Registrator._registerPendingHandler(null, def2, {
               validate: function() {
                  return false;
               },
               onPendingFail: function() {
                  callPendingFail.push(2);
               }
            });
            Registrator._registerPendingHandler(null, def3, {
               onPendingFail: function() {
                  callPendingFail.push(3);
               }
            });

            Registrator.finishPendingOperations();

            assert.deepEqual(callPendingFail, [1, 3]);

            Registrator._beforeUnmount();
            Vdom.Synchronizer.unMountControlFromDOM(Registrator, {});
         });
         it('register/unregister pending', () => {
            let Registrator = new PendingRegistrator();
            let def1 = new Deferred();
            let def2 = new Deferred();
            let def3 = new Deferred();
            const baseRoot = null;
            const firstRoot = 1;

            Registrator._beforeMount();
            Registrator._children = {
               loadingIndicator: {
                  show: () => 'id1',
                  hide: (id) => {
                     assert.equal(id, 'id1');
                  }
               }
            };
            Registrator._registerPendingHandler(null, def1, {});
            Registrator._registerPendingHandler(null, def2, { showLoadingIndicator: true, root: firstRoot });
            Registrator._registerPendingHandler(null, def3, {});
            assert.equal(Object.keys(Registrator._pendingController._pendings).length, 2);
            assert.equal(Object.keys(Registrator._pendingController._pendings[baseRoot]).length, 2);
            assert.equal(Object.keys(Registrator._pendingController._pendings[firstRoot]).length, 1);

            def1.callback();
            def2.callback();
            def3.callback();

            Promise.all([def1, def2, def3]).then(() => {
               assert.equal(Object.keys(Registrator._pendingController._pendings[baseRoot]).length, 0);
               assert.equal(Object.keys(Registrator._pendingController._pendings[firstRoot]).length, 0);
            });

            Registrator._beforeUnmount();
            Vdom.Synchronizer.unMountControlFromDOM(Registrator, {});
         });

         it('hasRegisteredPendings', () => {
            let Registrator = new PendingRegistrator();
            Registrator._beforeMount();
            let pendingCfg1 = {
               validate: () => false
            };
            let pendingCfg2 = {
               validateCompatible: () => true
            };
            Registrator._registerPendingHandler(null, new Deferred(), pendingCfg1);
            assert.equal(Registrator._hasRegisteredPendings(), false);

            Registrator._registerPendingHandler(null, new Deferred(), pendingCfg2);
            assert.equal(Registrator._hasRegisteredPendings(), false);

            Registrator._registerPendingHandler(null, new Deferred(), {});
            assert.equal(Registrator._hasRegisteredPendings(), true);

            Registrator._beforeUnmount();
            Vdom.Synchronizer.unMountControlFromDOM(Registrator, {});
         });

         it('should call unregisterPending1', (done) => {
            let sandbox = sinon.sandbox.create();
            let resolver;
            const Registrator = new PendingRegistrator();
            Registrator._beforeMount();
            const promise = new Promise((resolve) => {
               resolver = resolve;
            });

            let stub = sandbox.stub(Registrator._pendingController, 'unregisterPending');
            Registrator._registerPendingHandler(null, promise, {});
            promise.then(() => {
               sinon.assert.calledOnce(stub);
               done();
               Registrator._beforeUnmount();
               Vdom.Synchronizer.unMountControlFromDOM(Registrator, {});
               sandbox.restore();
            }).catch(done);
            resolver();
         });

         it('should call unregisterPending2', (done) => {
            let sandbox = sinon.sandbox.create();
            let rejector;
            const Registrator = new PendingRegistrator();
            Registrator._beforeMount();
            const promise = new Promise((resolve, reject) => {
               rejector = reject;
            });

            let stub = sandbox.stub(Registrator._pendingController, 'unregisterPending');
            Registrator._registerPendingHandler(null, promise, {});
            promise.then(done)
               .catch(() => {
                  sinon.assert.calledOnce(stub);
                  done();
                  Registrator._beforeUnmount();
                  Vdom.Synchronizer.unMountControlFromDOM(Registrator, {});
                  sandbox.restore();
               });
            rejector();
         });
         [{
            pendingCounter: 0
         }, {
            pendingCounter: 10
         }].forEach((test, testNumber) => {
            it('should use correct _pendingsCounter ' + testNumber, (done) => {
               let sandbox = sinon.sandbox.create();
               let resolver;
               const Registrator = new PendingRegistrator();
               Registrator._beforeMount();
               const promise = new Promise((resolve) => {
                  resolver = resolve;
               });

               Registrator._pendingController._pendingsCounter = test.pendingCounter;

               let stub = sandbox.stub(Registrator._pendingController, 'unregisterPending');
               Registrator._registerPendingHandler(null, promise, {});
               promise.then(() => {
                  sinon.assert.calledWith(stub, null, test.pendingCounter);
                  done();
                  Registrator._beforeUnmount();
                  Vdom.Synchronizer.unMountControlFromDOM(Registrator, {});
                  sandbox.restore();
               }).catch(done);
               resolver();
            });
         });
      });
   }
);
