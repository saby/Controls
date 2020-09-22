import { assert } from 'chai';
import { loadAsync, loadSync } from 'Controls/Application/modulesLoader';
import TestModuleSync = require('ControlsUnit/Async/TestModuleSync');

describe('Controls/Application/modulesLoader', () => {
    describe('loadAsync()', () => {
        it('should load module', () => {
            return loadAsync('ControlsUnit/Async/TestLibraryAsync').then((res) => {
                assert.notEqual(res, undefined, 'Module not loaded async');
            });
        });

        it('should load library', () => {
            return loadAsync<Function>('ControlsUnit/Async/TestModuleAsync:exportFunction').then((exportFunction) => {
                assert.notEqual(exportFunction, undefined, 'Module not loaded async');
                assert.equal(exportFunction('test'), 'test', 'Import from module is broken');
            });
        });

        /**
         * Проверяем что повторный вызов тоже работает корректно.
         */
        it('should load library twice', () => {
            return loadAsync<Function>('ControlsUnit/Async/TestModuleAsync:exportFunction').then((exportFunction) => {
                assert.notEqual(exportFunction, undefined, 'Module not loaded async');
                assert.equal(exportFunction('test'), 'test', 'Import from module is broken');
            });
        });

        /**
         * Проверяем что загрузка модуля по другому пути в библиотеке загружает корректный модуль.
         */
        it('should load different modules from same library', () => {
            const one = loadAsync<Function>(
                'ControlsUnit/Async/TestModuleAsyncTwice:exportFunction'
            ).then((exportFunction) => {
                assert.notEqual(exportFunction, undefined, 'Module not loaded async');
                assert.equal(exportFunction('test'), 'test', 'Import from module is broken');
            });
            const two =  loadAsync<Function>(
                'ControlsUnit/Async/TestModuleAsyncTwice:exportFunctionTwice'
            ).then((exportFunction) => {
                assert.notEqual(exportFunction, undefined, 'Module not loaded async');
                assert.equal(exportFunction('test'), 'testtest', 'Import from module is broken');
            });

            return Promise.all([one, two]);
        });

        it('should throw an error of module does not exist', () => {
            return loadAsync('ControlsUnit/Async/TestModuleSyncFail').catch((err) => {
                assert.include(err.message, 'Cannot find module');
            });
        });

        it('should throw an error if a path within the library is not exists', () => {
            return loadAsync('ControlsUnit/Async/TestModuleAsync:NotFound').then((res) => {
                assert.notEqual(res, null, 'Старое поведение, когда возвращался модуль, если е найдено свойство из библиотеки');
            }, (err) => {
                assert.include(
                    err.message,
                    'Cannot find module "NotFound" in library "ControlsUnit/Async/TestModuleAsync"',
                    'Error message is wrong'
                );
            });
        });
    });

    describe('loadSync()', () => {
        it('should return previously loaded module', () => {
            const syncModule = loadSync('ControlsUnit/Async/TestModuleSync');
            assert.strictEqual(syncModule, TestModuleSync, 'Loaded module is wrong');
        });

        it('should return a module from previously loaded library', () => {
            const syncFunction = loadSync<Function>('ControlsUnit/Async/TestModuleSync:exportSyncFunction');
            assert.equal(syncFunction('test'), 'test', 'Import from module is broken');
        });

        it('should return undefined of module does not exist', () => {
            assert.isUndefined(loadSync('ControlsUnit/Async/TestModuleSyncFail'));
        });
    });
});
