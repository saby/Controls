import {getModuleByName, loadModule} from 'Controls/_popup/utils/moduleHelper';
import {Control} from 'UI/Base';
import {IBasePopupOptions} from 'Controls/_popup/interface/IBasePopupOptions';

interface IPageTemplateOptions {
    pageTemplate: string;
    pageTemplateOptions: object;
    pageId: string;
    dataLoaderResult?: Promise<any>;
}

interface IPagePopupOptions extends IBasePopupOptions {
    templateOptions?: IPagePopupOptions;
}

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
     * Получение опций окна для открытия страницы
     * @param pageId
     * @param popupOptions
     */
    getPagePopupOptions(pageId: string, popupOptions: IBasePopupOptions): Promise<unknown> {
        const resultPopupOptions = {...popupOptions};
        return this.getPageConfig(pageId).then((pageData) => {
            const templateOptions = this._getTemplateOptions(pageData, resultPopupOptions);
            templateOptions.dataLoaderResult = this.loadData(pageData, templateOptions.pageTemplateOptions);
            resultPopupOptions.template = 'Controls/popupTemplate:Page';
            resultPopupOptions.templateOptions = templateOptions;
            return resultPopupOptions;
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
                DataLoader.loadData(prefetchConfig).then((promises) => {
                    Promise.all(promises).then(resolve);
                }).catch(reject);
            });
        });
    }

    /**
     * Предзагрузка статики необходимая для открытия страницы на панели
     * @param popupOptions
     */
    loadModules(popupOptions: IBasePopupOptions): Promise<Control> {
        const templateOptions = popupOptions.templateOptions as IPageTemplateOptions;
        return loadModule(templateOptions.pageTemplate);
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

    /**
     *
     * @param pageData
     * @param popupOptions
     * @private
     */
    private _getTemplateOptions(
        pageData: object,
        popupOptions: IBasePopupOptions
    ): IPageTemplateOptions {
        const workspaceConfig = pageData?.contentConfig?.workspaceConfig;
        if (workspaceConfig?.templateName) {
            return {
                pageTemplate: workspaceConfig.templateName,
                pageTemplateOptions: {
                    ...workspaceConfig.templateOptions,
                    ...(popupOptions?.templateOptions as object || {})
                },
                pageId: popupOptions.pageId
            };
        } else {
            throw new Error(`
                Страница с указанным идентификатором имеет некорректное описание.
                В описании должен быть workspaceConfig с заданным templateName.
            `);
        }
    }
}

export default new PageController();
