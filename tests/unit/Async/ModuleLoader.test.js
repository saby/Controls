define([
   'Controls/Container/Async/ModuleLoader',
   'Core/IoC',
   'Core/ConsoleLogger'
], function(
   ModuleLoader,
   IoC
) {

   function checkError(logErrors, errorMessage, message, originErrorMessage) {
      assert.isTrue(logErrors.length !== 0);
      if (logErrors && logErrors.length) {
         var logged = logErrors.shift();

         logged.error && logged.error.message && assert.isTrue(!!~logged.error.message.indexOf(errorMessage));
         logged.message && logged.message.indexOf && assert.isTrue(!!~logged.message.indexOf(message));
         logged.originError && logged.originError.message && assert.isTrue(!!~logged.originError.message.indexOf(originErrorMessage));
      }
   }

   describe('Controls/Container/Async/ModuleLoader', function() {
      var ml;
      var logErrors = [];
      var originalLogger = IoC.resolve('ILogger');
      beforeEach(function() {
         logErrors = [];
         IoC.bind('ILogger', {
            warn: originalLogger.warn,
            error: function(error, message, originError) {
               logErrors.push({
                  error: error,
                  message: message,
                  originError: originError
               });
            },
            log: originalLogger.log,
            info: originalLogger.info
         });
         ml = new ModuleLoader();
         ml.loadedSync = {};
         ml.requireSync = function(name) {
            var res = {};
            this.loadedSync[name] = res;
            return res;
         };
         ml.loadedAsync = [];
         ml.requireAsync = function(name) {
            var self = this;
            var promiseResult = new Promise(function(resolve) {
               var res = {};
               self.loadedAsync[name] = res;
               resolve(res);
            });
            return promiseResult;
         };
      });
      afterEach(function() {
         ml.clearCache();
      });
      it('Load sync no cache', function() {
         var res = ml.loadSync('Controls/List');
         assert.equal(ml.loadedSync['Controls/List'], res);
      });
      it('Load sync with cache', function() {
         ml.loadedSync = [];
         ml.requireSync = function(name) {
            this.loadedSync.push(name);
            return {};
         };
         var res = ml.loadSync('Controls/List');
         var res2 = ml.loadSync('Controls/List');
         assert.equal(res, res2);
         assert.equal(ml.loadedSync.length, 1);
      });
      it('Load sync error', function() {
         ml.loadedSync = [];
         ml.requireSync = function(name) {
            throw new Error('test error');
         };
         var res = ml.loadSync('Controls/List');
         assert.equal(ml.loadedSync.length, 0);
         checkError(logErrors, 'Couldn\'t load module Controls/List', 'test error');
      });

      it('Load async no cache', function(done) {
         var promiseResult = ml.loadAsync('Controls/List');
         promiseResult.then(function(res) {
            assert.equal(ml.loadedAsync['Controls/List'], res);
            done();
         });
      });
      it('Load async with cached promise', function(done) {
         ml.loadedAsync = [];
         ml.requireAsync = function(name) {
            return new Promise(function(resolve) {
               ml.loadedAsync.push(name);
               resolve({});
            });
         };
         var res = ml.loadAsync('Controls/List');
         var res2 = ml.loadAsync('Controls/List');
         res2.then(function() {
            done();
         });
         assert.equal(res, res2);
         assert.equal(ml.loadedAsync.length, 1);
      });
      it('Load async with cached module', function(done) {
         ml.loadedAsync = [];
         ml.requireAsync = function(name) {
            return new Promise(function(resolve) {
               ml.loadedAsync.push(name);
               resolve({});
            });
         };
         var res = ml.loadAsync('Controls/List');
         res.then(function(loaded) {
            var res2 = ml.loadAsync('Controls/List');
            checkError(logErrors, 'Module Controls/List is already loaded.');
            res2.then(function(loaded2) {
               assert.equal(loaded, loaded2);
               assert.equal(ml.loadedAsync.length, 1);
               done();
            });
         });
      });
      it('Load async error', function(done) {
         ml.loadedAsync = [];
         ml.requireAsync = function(name) {
            return new Promise(function(resolve, reject) {
               reject('test error');
            });
         };
         var res = ml.loadAsync('Controls/List');
         res.catch(function(res) {
            assert.equal(ml.loadedAsync.length, 0);
            checkError(logErrors, 'Couldn\'t load module Controls/List', 'test error');
            done();
         });
      });
   });
});
