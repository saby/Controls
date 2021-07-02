import {getModuleByName, loadModule} from 'Controls/_popup/utils/moduleHelper';

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
     * @param templateOptions
     */
    loadData(pageConfig: unknown, templateOptions: object): Promise<unknown> {
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
                            Добавляем templateOptions в аргументы лоадеров,
                            чтобы можно было вызывать методы в зависимости от данных переданных в опенер
                         */
                        ...templateOptions
                    }
                };
                DataLoader.loadData(prefetchConfig).then(resolve).catch(reject);
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
        const module = getModuleByName(moduleName);
        if (module) {
            callback(module);
        } else {
            loadModule(moduleName).then((loadedModule) => {
                callback(loadedModule);
            });
        }
    }
}

export default new PageController();
