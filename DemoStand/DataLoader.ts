import { load as loadModule } from 'WasabyLoader/Library';
import { ISerializableState } from 'Application/Interface';

export interface ILoadConfig {
    module: string;
    params?: object;
    await?: boolean;
    dependencies?: string[];
    key?: string;
}

// TODO: Удалить после выполнения
// https://online.sbis.ru/opendoc.html?guid=925ac8e8-2e08-4c18-9502-3c805ec5f6db
interface ILoader extends ISerializableState {
    init(): Function;
    loadData(params?: object, depsData?: unknown[]): Function;
}

function getDataPromise(moduleName: string, params: object, depsData?: unknown[]): Promise<unknown> {
    return loadModule<ILoader>(moduleName).then((module: ILoader) => {
        module.init();
        return module.loadData(params, depsData);
    });
}

const load = (loaders: ILoadConfig[][]): Promise<Record<string, Promise<unknown>>> => {
    const loadPromises: Record<string, Promise<unknown>> = {};
    const awaitPromises: Array<Promise<unknown>> = [];

    loaders.forEach((currentStepLoaders) => {
        Promise.all(awaitPromises).then(() => {
            currentStepLoaders.forEach((loaderConfig) => {
                const dependencies = loaderConfig.dependencies || [];
                const readyLoaders = dependencies.map((moduleName) => {
                    return loadPromises[moduleName];
                });

                loadPromises[loaderConfig.key || loaderConfig.module] = Promise.all(readyLoaders).then((loadedData) => {
                    return getDataPromise(loaderConfig.module, loaderConfig.params, loadedData);
                });

                if (loaderConfig.await) {
                    awaitPromises.push(loadPromises[loaderConfig.key || loaderConfig.module]);
                }
            });
        });
    });

    return Promise.all(awaitPromises).then(() => {
        return loadPromises;
    });
};

export default {
    load
};
