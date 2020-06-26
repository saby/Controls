import libHelper = require('Core/library');
import { IoC } from 'Env/Env';
import rk = require('i18n!Controls');
import { ParkingController, Controller, Handler } from 'Controls/error';

type Module = unknown;
let cache: Record<string, Promise<Module>> = {};
interface IParsedName {
    name: string;
    path: string[];
}

class ModuleLoader {
    /**
     * requirejs.defined работает не корректно. Возвращает true, хотя callback в defined(name, callback) ещё не был вызван.
     */
    private asyncLoadedModules: Record<string, boolean|void> = {};

    private getFromLib(lib: Module, parsedName: IParsedName): Module {
        let mod = lib;
        const processed = [];
        parsedName.path.forEach((property) => {
            processed.push(property);
            if (mod && typeof mod === 'object' && property in mod) {
                mod = mod[property];
            } else {
                IoC.resolve('ILogger').error('Async module loading error',
                    'Cannot find module "' + processed.join('.')
                    + '" in library "' + parsedName.name + '".');
            }
        });
        return mod;
    }

    loadAsync(name: string, errorHandler: Handler): Promise<Module> {
        if (this.isLoaded(name)) {
            return Promise.resolve(this.loadSync(name));
        }

        const parsedInfo: IParsedName = libHelper.parse(name);
        const loadFromModule = (res) => {
            return this.getFromLib(res, parsedInfo);
        };
        if (this.isCached(parsedInfo.name)) {
            return cache[parsedInfo.name].then(loadFromModule);
        }

        let promiseResult = this.requireAsync(parsedInfo.name);
        cache[parsedInfo.name] = promiseResult = promiseResult.then((res) => {
            delete cache[parsedInfo.name];
            this.asyncLoadedModules[parsedInfo.name] = true;
            return res;
        }, (error) => {
            delete cache[parsedInfo.name];
            const errorMessage = "Couldn't load module " + parsedInfo.name;
            IoC.resolve('ILogger').error(errorMessage, error);
            return new ParkingController({
                configField: Controller.CONFIG_FIELD,
                handlers: errorHandler !== undefined ? [errorHandler] : []})
                .process({error}).then((viewConfig) => {
                    const message = viewConfig?.options?.message;
                    throw new Error(message || rk('У СБИС возникла проблема'));
                });
        });

        return promiseResult.then(loadFromModule);
    }

    loadSync(name: string): Module {
        const parsedInfo = libHelper.parse(name);
        let loaded;
        try {
            loaded = this.requireSync(parsedInfo.name);
        } catch (e) {
            IoC.resolve('ILogger').error("Couldn't load module " + parsedInfo.name, e);
            return null;
        }
        if (!loaded) {
            return null;
        }
        return this.getFromLib(loaded, parsedInfo);
    }

    /**
     * Делаю проверку, что загруженный модуль имеет тип функции, т.к. может быть require уже реально загрузил.
     * Текущее решение, нужно для случая, когда модуль реально возвращает пустой объект, и нужно
     *   вернуть ответ, что модуль загружен.
     * @param name имя модуля
     */
    private isLoaded(name: string): boolean {
        const parsedInfo: IParsedName = libHelper.parse(name);
        if (this.asyncLoadedModules[parsedInfo.name]) {
            return true;
        }

        // Проверяем наличие, что бы не было сообщения в лог
        if (!require.defined(parsedInfo.name)) {
            return false;
        }

        const module = require(parsedInfo.name);
        if (module instanceof Function || Object.keys(module).length > 0) {
            this.asyncLoadedModules[parsedInfo.name] = true;
            return true;
        }
        return false;
    }

    private isCached(name: string): boolean {
        return !!cache[name];
    }

    private requireSync(name: string): Module {
        return require(name);
    }

    private requireAsync(name: string): Promise<undefined> {
        return new Promise((resolve, reject) => {
            require([name], resolve, reject);
        });
    }

    clearCache(): void {
        cache = {};
    }
}

export = ModuleLoader;
