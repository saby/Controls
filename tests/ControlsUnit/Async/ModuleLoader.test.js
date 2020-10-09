define("ControlsUnit/Async/ModuleLoader.test", ["require", "exports", "chai", "Controls/Container/Async/ModuleLoader", "Core/IoC"], function (require, exports, chai_1, ModuleLoader, IoC) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    describe('Controls/Container/Async/ModuleLoader', function () {
        var logErrors = [];
        var originalLogger = IoC.resolve('ILogger');
        beforeEach(function () {
            logErrors = [];
            IoC.bind('ILogger', {
                warn: originalLogger.warn,
                error: function (error, message, originError) {
                    logErrors.push({ error: error, message: message, originError: originError });
                },
                log: originalLogger.log,
                info: originalLogger.info
            });
        });
        afterEach(function () {
            IoC.bind('ILogger', originalLogger);
        });
        it('loadAsync failed', function () {
            var ml = new ModuleLoader();
            return ml.loadAsync('ControlsUnit/Async/Fail/TestModule').then(function () {
                chai_1.assert.fail('Should not resolved promise successfull');
            }, function (err) {
                chai_1.assert.equal(err.message, 'У СБИС возникла проблема', 'Error message is wrong');
                chai_1.assert.equal(logErrors.length, 1);
            });
        });
        it('loadAsync failed with callback', function () {
            var ml = new ModuleLoader();
            var callbackCalled = false;
            var callbackParams = {};
            var errorCallback = function (viewConfig, error) {
                callbackCalled = true;
                callbackParams = { viewConfig: viewConfig, error: error };
            };
            return ml.loadAsync('ControlsUnit/Async/Fail/TestModule', errorCallback).then(function () {
                chai_1.assert.fail('Should not resolved promise successfull');
            }, function (err) {
                chai_1.assert.equal(err.message, 'У СБИС возникла проблема', 'Error message is wrong');
                chai_1.assert.equal(logErrors.length, 1);
                chai_1.assert.equal(callbackCalled, true, 'errorCallback не был вызван.');
                chai_1.assert.exists(callbackParams.error, 'Второй параметр errorCallback должен быть определен.');
                // далее проверки только на клиенте, т.к. в тестах на сервере require возвращает "непонятную" ошибку
                if (typeof window !== 'undefined') {
                    var expectedStatus = 404;
                    chai_1.assert.exists(callbackParams.viewConfig, 'Первый параметр errorCallback должен быть определен.');
                    chai_1.assert.equal(typeof callbackParams.viewConfig, 'object', 'Первый параметр errorCallback должен быть объектом.');
                    chai_1.assert.equal(callbackParams.viewConfig.status, expectedStatus, 'Первый параметр errorCallback имеет неправильную структуру.');
                }
            });
        });
        it('loadAsync faild found export control', function () {
            var ml = new ModuleLoader();
            return ml.loadAsync('ControlsUnit/Async/TestModuleAsync:NotFound').then(function (res) {
                chai_1.assert.notEqual(res, null, 'Старое поведение, когда возвращался модуль, если е найдено свойство из библиотеки');
            }, function (err) {
                chai_1.assert.equal(err.message, 'У СБИС возникла проблема', 'Error message is wrong');
                chai_1.assert.equal(logErrors.length, 1);
            });
        });
    });
});
