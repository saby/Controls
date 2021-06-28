import {Control, TemplateFunction, IControlOptions} from 'UI/Base';
import * as template from 'wml!Controls/_popupTemplate/Page/Page';

interface IPageTemplateOptions extends IControlOptions {
    dataLoaderResult: Promise<unknown>;
    pageTemplate: string;
    pageTemplateOptions: object;
}

interface IPrefetchResult {
    configError: unknown,
    data: Array<Record<string, unknown>>
}

/**
 * Контрол, который отвечает за построение шаблона страницы в окне
 * @class Controls/_popupTemplate/Page
 * @extends UI/Base:Control
 * @control
 * @private
 * @author Онищук Д.В.
 */
export default class Template extends Control<IControlOptions> {
    _template: TemplateFunction = template;
    protected _prefetchData: Record<string, unknown>;

    protected _beforeMount(options: IPageTemplateOptions): void {
        if (options.dataLoaderResult) {
            this._processPreloadResult(options.dataLoaderResult);
        }
    }

    protected _beforeUpdate(options: IPageTemplateOptions): void {
        if (options.dataLoaderResult && this._options.dataLoaderResult !== options.dataLoaderResult) {
            this._prefetchData = null;
            this._processPreloadResult(options.dataLoaderResult);
        }
    }

    private _processPreloadResult(dataLoaderResult: Promise<unknown>): void {
        dataLoaderResult.then((result) => {
            this._prefetchData = this._getPrefetchData(result as IPrefetchResult);
        });
    }

    private _getPrefetchData(prefetchResult: IPrefetchResult): Record<string, unknown> {
        if (prefetchResult.data) {
            const resultsMap = {};
            prefetchResult.data.forEach((loaderResult) => {
                resultsMap[loaderResult.id] = loaderResult;
            });
            return resultsMap;
        }
    }
}
