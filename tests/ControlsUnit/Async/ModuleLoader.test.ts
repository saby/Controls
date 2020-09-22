import { assert } from 'chai';
import ModuleLoader = require('Controls/Container/Async/ModuleLoader');
import { ViewConfig } from 'Controls/error';
import IoC = require('Core/IoC');

describe('Controls/Container/Async/ModuleLoader', () => {
    let logErrors = [];
    const originalLogger = IoC.resolve('ILogger');

    beforeEach(() => {
        logErrors = [];
        IoC.bind('ILogger', {
            warn: originalLogger.warn,
            error: (error, message, originError) => {
                logErrors.push({error, message, originError});
            },
            log: originalLogger.log,
            info: originalLogger.info
        });
    });

    afterEach(() => {
        IoC.bind('ILogger', originalLogger);
    });

    it('loadAsync failed', () => {
        const  ml = new ModuleLoader();
        return ml.loadAsync('ControlsUnit/Async/Fail/TestModule').then(() => {
            assert.fail('Should not resolved promise successfull');
        }, (err) => {
            assert.equal(err.message, 'У СБИС возникла проблема', 'Error message is wrong');
            assert.equal(logErrors.length, 1);
        });
    });

    it('loadAsync failed with callback', () => {
        const ml = new ModuleLoader();
        let callbackCalled = false;
        let callbackParams: {viewConfig?: ViewConfig, error?: Error} = {};
        const errorCallback = (viewConfig, error) => {
            callbackCalled = true;
            callbackParams = {viewConfig, error};
        };
        return ml.loadAsync('ControlsUnit/Async/Fail/TestModule', errorCallback).then(() => {
            assert.fail('Should not resolved promise successfull');
        }, (err) => {
            assert.equal(err.message, 'У СБИС возникла проблема', 'Error message is wrong');
            assert.equal(logErrors.length, 1);
            assert.equal(callbackCalled, true, 'errorCallback не был вызван.');
            assert.exists(callbackParams.error, 'Второй параметр errorCallback должен быть определен.');

            // далее проверки только на клиенте, т.к. в тестах на сервере require возвращает "непонятную" ошибку
            if (typeof window !== 'undefined') {
                const expectedStatus = 404;
                assert.exists(callbackParams.viewConfig, 'Первый параметр errorCallback должен быть определен.');
                assert.equal(typeof callbackParams.viewConfig, 'object', 'Первый параметр errorCallback должен быть объектом.');
                assert.equal(callbackParams.viewConfig.status, expectedStatus, 'Первый параметр errorCallback имеет неправильную структуру.');
            }
        });
    });

    it('loadAsync faild found export control', () => {
        const  ml = new ModuleLoader();
        return ml.loadAsync('ControlsUnit/Async/TestModuleAsync:NotFound').then((res) => {
            assert.notEqual(res, null, 'Старое поведение, когда возвращался модуль, если е найдено свойство из библиотеки');
        }, (err) => {
            assert.equal(err.message, 'У СБИС возникла проблема', 'Error message is wrong');
            assert.equal(logErrors.length, 1);
        });
    });
});
