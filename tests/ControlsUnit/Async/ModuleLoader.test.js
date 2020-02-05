define([
   'require',
   'Controls/Container/Async/ModuleLoader',
   'Core/IoC',
   'ControlsUnit/Async/TestModuleSync'
], function(
   require,
   ModuleLoader,
   IoC,
   TestModuleSync
) {
   describe('Controls/Container/Async/ModuleLoader', function() {
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
      });

      afterEach(function() {
         IoC.bind('ILogger', originalLogger);
      });

      it('loadAsync success', function () {
         var ml = new ModuleLoader();
         var syncModule = ml.loadAsync('ControlsUnit/Async/TestLibraryAsync').then(function (res) {
            assert.notEqual(res, undefined, 'Module not loaded async');
         }, function () {
            assert.fail('Should not promise faild');
         });
      });

      it('loadAsync from library success', function () {
         var ml = new ModuleLoader();
         ml.loadAsync('ControlsUnit/Async/TestModuleAsync:exportFunction').then(function (exportFunction) {
            assert.notEqual(exportFunction, undefined, 'Module not loaded async');
            assert.equal(exportFunction('test'), 'test', 'Import from module is broken');
         }, function() {
            assert.fail('Should not promise faild');
         });
      });

      /**
       * Проверяем что повторный вызов тоже работает корректно.
       */
      it('loadAsync from library second is success', function () {
         var ml = new ModuleLoader();
         ml.loadAsync('ControlsUnit/Async/TestModuleAsync:exportFunction').then(function (exportFunction) {
            assert.notEqual(exportFunction, undefined, 'Module not loaded async');
            assert.equal(exportFunction('test'), 'test', 'Import from module is broken');
         }, function() {
            assert.fail('Should not promise faild');
         });
      });

      /* Хак. Потому что сломан require в юнит тестах
         @link https://online.sbis.ru/opendoc.html?guid=b2f93ecc-5b43-4bf1-a2c0-684cc621c314
      */
      require(['ControlsUnit/Async/Fail/TestModule'], function(){}, function(){});

      it('loadAsync faild', function () {
         var ml = new ModuleLoader();
         return ml.loadAsync('ControlsUnit/Async/Fail/TestModule').then(function () {
            assert.fail('Should not resolved promise successfull');
         }, function (err) {
            assert.equal(err.message, 'Couldn\'t load module ControlsUnit/Async/Fail/TestModule', 'Error message is wrong');
            assert.equal(logErrors.length, 1);
         });
      });

      it('loadAsync faild found export control', function (done) {
         var ml = new ModuleLoader();
         ml.loadAsync('ControlsUnit/Async/TestModuleAsync:NotFound').then(function(res) {
            assert.notEqual(res, null, 'Старое поведение, когда возвращался модуль, если е найдено свойство из библиотеки');
            done();
         }, function (err) {
            assert.equal(err.message, 'Couldn\'t load module ControlsUnit/Async/TestModuleFail', 'Error message is wrong');
            assert.equal(logErrors.length, 1);
            done();
         });
      });

      it('loadSync success', function () {
         var ml = new ModuleLoader();
         var syncModule = ml.loadSync('ControlsUnit/Async/TestModuleSync');
         assert.strictEqual(syncModule, TestModuleSync, 'Loaded module is wrong');
      });

      it('loadSync from library success', function () {
         var ml = new ModuleLoader();
         var syncFunction = ml.loadSync('ControlsUnit/Async/TestModuleSync:exportSyncFunction');
         assert.equal(syncFunction('test'), 'test', 'Import from module is broken');
      });

      it('loadSync faild', function () {
         var ml = new ModuleLoader();
         var error = ml.loadSync('ControlsUnit/Async/TestModuleSyncFail');
         assert.strictEqual(error, null, 'Failed loaded module must be null');
      });

   });
});
