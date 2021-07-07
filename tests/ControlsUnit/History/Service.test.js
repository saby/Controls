/* global assert */
define(['Controls/history', 'Core/Deferred', 'Env/Env', 'Application/Env', 'UI/Utils'], (history, Deferred, Env, ApplicationEnv, {Logger}) => {

   describe('Controls/history:Service', () => {
      let stores;
      const originalGetStore = ApplicationEnv.getStore;
      const originalSetStore = ApplicationEnv.setStore;
      beforeEach(() => {
         ApplicationEnv.getStore = (key) => {
            return stores[key];
         };
         ApplicationEnv.setStore = (key, value) => {
            stores[key] = value;
         };
         stores = {};
      });

      afterEach(() => {
         ApplicationEnv.getStore = originalGetStore;
         ApplicationEnv.setStore = originalSetStore;
      });

      it('query', (done) => {
         const isBrowser = Env.constants.isBrowserPlatform;
         Env.constants.isBrowserPlatform = true;

         const service = new history.Service({historyId: 'testId'});
         const loadDeferred = new Deferred();

         service._$historyDataSource = {call: () => loadDeferred};

         let queryDef = service.query();
         assert.isTrue(queryDef === loadDeferred);

         let nextQuery = service.query();
         const expectedData = 'test';
         service.saveHistory('testId', expectedData);
         nextQuery.addCallback((data) => {
            assert.equal(data.getRawData(), expectedData);
            done();
         });
         loadDeferred.callback();
         Env.constants.isBrowserPlatform = isBrowser;
      });

      it('query without history id', () => {
         const service = new history.Service({historyIds: []});
         const sandbox = sinon.createSandbox();
         let isSourceCalled = false;

         service._historyDataSource = {
            call: () => {
               isSourceCalled = false;
            }
         };

         return new Promise((resolve) => {
            sandbox.stub(Logger, 'error');
            service.query().then(null, () => {
               assert.isFalse(isSourceCalled);
               assert.isTrue(Logger.error.calledOnce);
               sandbox.restore();
               resolve();
            });
         });
      });

      it('query in offline application', (done) => {
         const service = new history.Service({ historyId: 'testId' });
         Env.detection.isDesktop = true;
         const result = service.query();
         Env.detection.isDesktop = false;
         result.then((res) => {
            assert.isTrue(res.getAll().getCount() === 0);
            Env.detection.isDesktop = true;
            service.update({$_addFromData: true}).then((updateRes) => {
               assert.isUndefined(updateRes);
               done();
            });
            Env.detection.isDesktop = false;
         });
      });

      it('destroy', () => {
         const service = new history.Service({ historyId: 'testId' });
         let methodName;
         let methodMeta;

         service._$historyDataSource = {call: (method, meta) => {
            methodName = method;
            methodMeta = meta;
         }};


         service.destroy('test');

         assert.equal(methodName, 'Delete');
         assert.deepEqual(methodMeta, {
            history_id: 'testId',
            object_id: 'test'
         });
      });

   });

});
