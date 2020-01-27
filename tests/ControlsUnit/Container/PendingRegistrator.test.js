define(
   [
      'Controls/Pending',
      'Core/Deferred'
   ],
   (PendingRegistrator, Deferred) => {
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
            Registrator.destroy();
         });
         it('register/unregister pending', () => {
            let Registrator = new PendingRegistrator();
            let def1 = new Deferred();
            let def2 = new Deferred();
            let def3 = new Deferred();

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
            Registrator._registerPendingHandler(null, def2, { showLoadingIndicator: true });
            Registrator._registerPendingHandler(null, def3, {});

            assert.equal(Object.keys(Registrator._pendings).length, 3);

            def1.callback();
            def2.callback();
            def3.callback();

            assert.equal(Object.keys(Registrator._pendings).length, 0);

            Registrator._beforeUnmount();
            Registrator.destroy();
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
            Registrator.destroy();
         });
      });
   }
);
