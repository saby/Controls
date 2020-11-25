import * as loader from 'WasabyLoader/ModulesLoader';
import { ParkingController, Controller, ViewConfig } from 'Controls/error';
import { IoC } from 'Env/Env';
import rk = require('i18n!Controls');

const ERROR_NOT_FOUND = 404;

class ModuleLoader {
    loadAsync<T = unknown>(
        name: string,
        errorCallback?: (viewConfig: void | ViewConfig, error: unknown) => void
    ): Promise<T> {
        return loader.loadAsync<T>(name).catch((error) => {
            IoC.resolve('ILogger').error(`Couldn't load module "${name}"`, error);

            return new ParkingController(
                {configField: Controller.CONFIG_FIELD}
            ).process({error, mode: 'include'}).then((viewConfig: ViewConfig<{message: string}>) => {
                if (errorCallback && typeof errorCallback === 'function') {
                    errorCallback(viewConfig, error);
                }

                if (!viewConfig?.status || viewConfig.status !== ERROR_NOT_FOUND) {
                    loader.unloadSync(name);
                }

                const message = viewConfig?.options?.message;
                throw new Error(message || rk('У СБИС возникла проблема'));
            });
        });
    }

    loadSync<T = unknown>(name: string): T {
        try {
            const loaded = loader.loadSync<T>(name);
            if (loaded) {
                return loaded;
            }
        } catch (err) {
            IoC.resolve('ILogger').error(`Couldn't load module "${name}"`, err);
        }
        return null;
    }

    isLoaded(name: string): boolean {
        return loader.isLoaded(name);
    }

    clearCache(): void {
        loader.clearCache();
    }
}

export = ModuleLoader;
