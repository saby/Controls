/* global assert */
define(['Controls/history', 'Core/Deferred', 'Env/Env', 'Application/Env'], (history, Deferred, Env, ApplicationEnv) => {

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

         service._historyDataSource = {call: () => loadDeferred};

         let queryDef = service.query();
         assert.isTrue(queryDef === loadDeferred);

         let nextQuery = service.query();
         const expectedData = 'test';
         service.saveHistory('testId', expectedData);
         nextQuery.addCallback((data) => {
            assert.equal(data, expectedData);
            done();
         });
         loadDeferred.callback();
         Env.constants.isBrowserPlatform = isBrowser;
      });

      it('destroy', () => {
         const service = new history.Service({ historyId: 'testId' });
         let methodName;
         let methodMeta;

         service._historyDataSource = {call: (method, meta) => {
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
