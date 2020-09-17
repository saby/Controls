import { isLoaded, loadAsync, loadSync, clearCache } from 'Controls/Application/modulesLoader';
import { ParkingController, Controller, ViewConfig } from 'Controls/error';
import { IoC } from 'Env/Env';
import rk = require('i18n!Controls');

class ModuleLoader {
    loadAsync<T = unknown>(
        name: string,
        errorCallback?: (viewConfig: void | ViewConfig, error: unknown) => void
    ): Promise<T> {
        return loadAsync<T>(name).then((res) => {
            return res;
        }).catch((err) => {
            IoC.resolve('ILogger').error(`Couldn't load module "${name}"`, err);

            return new ParkingController(
                {configField: Controller.CONFIG_FIELD}
            ).process({err, mode: 'include'}).then((viewConfig: ViewConfig<{message: string}>) => {
                if (errorCallback && typeof errorCallback === 'function') {
                    errorCallback(viewConfig, err);
                }
                const message = viewConfig?.options?.message;
                throw new Error(message || rk('У СБИС возникла проблема'));
            });
        });
    }

    loadSync<T = unknown>(name: string): T {
        try {
            const loaded = loadSync<T>(name);
            if (!loaded) {
                return null;
            }
        } catch (err) {
            IoC.resolve('ILogger').error(`Couldn't load module "${name}"`, err);
        }
        return null;
    }

    isLoaded(name: string): boolean {
        return isLoaded(name);
    }

    clearCache(): void {
        clearCache();
    }
}

export = ModuleLoader;
