import {isLoaded, loadSync, loadAsync} from 'WasabyLoader/ModulesLoader';

export interface IPageConfig {
    contentConfig?: IPageContentConfig;
}

interface IPageContentConfig {
    prefetchConfig?: IPrefetchConfig;
    workspaceConfig?: IWorkspaceConfig;
}

interface IPrefetchConfig {
    configLoader?: string;
    configLoaderArguments?: Record<string, unknown>;
}

interface IWorkspaceConfig {
    templateName?: string;
    templateOptions?: Record<string, unknown>;
}

/**
 * Модуль для загрузки конфигурации страницы и предзагрузки данных для неё
 */
class PageController {
    private _pageConfigLoaderModule: string;
    private _pageDataLoaderModule: string;

    /**
     * Задание модуля, который грузит конфиг страницы
     * @param module
     */
    setPageConfigLoaderModule(module: string): void {
        this._pageConfigLoaderModule = module;
    }

    /**
     * Задание модуля, который грузит данные для страницы
     * @param module
     */
    setDataLoaderModule(module: string): void {
        this._pageDataLoaderModule = module;
    }

    /**
     * Загрузка данных страницы
     * @param pageId
     */
    getPageConfig(pageId: string): Promise<unknown> {
        const configLoaderModule = this._pageConfigLoaderModule;
        if (!configLoaderModule) {
            const message = 'При попытке открыть страницу в окне произошла ошибка. ' +
                'На приложении не задан модуль для получения конфигурации страницы.';
            throw new Error(message);
        }
        return new Promise((resolve, reject) => {
            this._getModuleByModuleName(configLoaderModule, (ConfigLoader) => {
                ConfigLoader.getConfigById(pageId).then(resolve, reject);
            });
        });
    }

    /**
     * Загрузка данных по конфигу страницы
     * @param pageConfig
     * @param additionalOptions
     */
    loadData(pageConfig: unknown, additionalOptions: object): Promise<unknown> {
        const dataLoaderModule = this._pageDataLoaderModule;
        if (!dataLoaderModule) {
            const message = 'При попытке открыть страницу в окне произошла ошибка. ' +
                'На приложении не задан модуль для получения конфигурации страницы.';
            throw new Error(message);
        }
        return new Promise((resolve, reject) => {
            this._getModuleByModuleName(dataLoaderModule, (DataLoader) => {
                const pagePrefetchConfig = pageConfig?.contentConfig?.prefetchConfig;
                const prefetchConfig = {
                    ...pagePrefetchConfig,
                    configLoaderArguments: {
                        ...pagePrefetchConfig.configLoaderArguments,

                        /*
                            Добавляем опции в аргументы лоадера,
                            чтобы можно было дополнять статические опции динамикой нужно на попапах
                         */
                        ...additionalOptions
                    }
                };
                DataLoader.loadData(prefetchConfig).then((promises) => {
                    Promise.all(promises).then(resolve);
                }).catch(reject);
            });
        });
    }

    /**
     * Загрузка модуля по имени, если уже загружен, то получается синхронно
     * @param moduleName
     * @param callback
     * @private
     */
    private _getModuleByModuleName(moduleName: string, callback: Function): void {
        if (isLoaded(moduleName)) {
            callback(loadSync(moduleName));
        } else {
            loadAsync(moduleName).then((loadedModule) => {
                callback(loadedModule);
            });
        }
    }
}

export default new PageController();
