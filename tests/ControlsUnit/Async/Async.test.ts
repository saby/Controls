import { assert } from 'chai';
import { IoC, constants } from 'Env/Env';
import { default as Async } from 'Controls/Container/Async';

describe('Controls/Container/Async', () => {
    // переопределяем логгер, чтобы при ошибках загрузки не упали тесты из-за сообщений логгера
    const warns = [];
    const originalLogger = IoC.resolve('ILogger');

    // подправляем isBrowserPlatform, т.к. тесты Controls запускаются только под node,
    // но нам нужно проверить обработку ошибки асинхронной загрузки модуля/шаблона
    const oldIsBrowserPlatform = constants.isBrowserPlatform;

    beforeEach(() => {
        constants.isBrowserPlatform = true;
        IoC.bind('ILogger', {
            warn: (message) => {
                warns.push(message);
            },
            error: originalLogger.error,
            log: originalLogger.log,
            info: originalLogger.info
        });
    });
    afterEach(() => {
        constants.isBrowserPlatform = oldIsBrowserPlatform;
        IoC.bind('ILogger', originalLogger);
    });

    it('Loading asynchronous client-side failed with callback', () => {
        let callbackCalled = false;
        const options = {
            templateName: 'ControlsUnit/Async/FailCallback/TestControlAsync',
            templateOptions: {},
            errorCallback: (viewConfig, error) => {
                callbackCalled = true;
                assert.exists(error, 'Второй параметр errorCallback должен быть определен.');

                // далее проверки только на клиенте, т.к. в тестах на сервере require возвращает "непонятную" ошибку
                // и ParkingController не может ее распознать - возвращает пустой viewConfig
                // возможно когда-нибудь тесты Controls начнут прогонять на клиенте
                if (typeof window !== 'undefined') {
                    const expectedStatus = 404;
                    assert.exists(viewConfig, 'Первый параметр errorCallback должен быть определен.');
                    assert.equal(typeof viewConfig, 'object', 'Первый параметр errorCallback должен быть объектом.');
                    assert.equal(viewConfig.status, expectedStatus, 'Первый параметр errorCallback имеет неправильную структуру.');
                }
            }
        };

        const ERROR_TEXT = 'Ошибка загрузки контрола "ControlsUnit/Async/FailCallback/TestControlAsync"\n'
            + 'Возможны следующие причины:\n\t                   • '
            + 'Ошибка в самом контроле\n\t                   • '
            + 'Долго отвечал БЛ метод в _beforeUpdate\n\t                   • '
            + 'Контрола не существует';

        const async = new Async(options);
        async._beforeMount(options);
        async._beforeUpdate(options);
        async._afterUpdate();

        return new Promise((resolve) => {
            setTimeout(resolve, 2000);
        }).then(() => {
            assert.equal(async.error, ERROR_TEXT);
            assert.strictEqual(async.optionsForComponent.resolvedTemplate, undefined);
            assert.equal(callbackCalled, true, 'errorCallback не был вызван.');
        });
    }).timeout(4000);

});
