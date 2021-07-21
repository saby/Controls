import {getModuleByName, loadModule} from 'Controls/_popup/utils/moduleHelper';
import {Control} from 'UI/Base';
import {IBasePopupOptions} from 'Controls/_popup/interface/IBasePopupOptions';
import {PageController as DSPageController, IPageConfig} from 'Controls/dataSource';

interface IPageTemplateOptions {
    pageTemplate: string;
    pageTemplateOptions: object;
    pageId: string;
    prefetchResult?: Promise<any>;
}

interface IPagePopupOptions extends IBasePopupOptions {
    templateOptions?: IPagePopupOptions;
}

class PageController {

    /**
     * Получение опций окна для открытия страницы
     * @param pageId
     * @param popupOptions
     */
    getPagePopupOptions(pageId: string, popupOptions: IBasePopupOptions): Promise<unknown> {
        const resultPopupOptions = {...popupOptions};
        return DSPageController.getPageConfig(pageId).then((pageData) => {
            const templateOptions = this._getTemplateOptions(pageData, resultPopupOptions);
            templateOptions.prefetchResult = DSPageController.loadData(pageData, templateOptions.pageTemplateOptions);
            resultPopupOptions.template = 'Controls/popupTemplate:Page';
            resultPopupOptions.templateOptions = templateOptions;
            return resultPopupOptions;
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
     *
     * @param pageData
     * @param popupOptions
     * @private
     */
    private _getTemplateOptions(
        pageData: IPageConfig,
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
