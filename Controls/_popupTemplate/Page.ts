import {Control, TemplateFunction, IControlOptions} from 'UI/Base';
import { SyntheticEvent } from 'UI/Vdom';
import * as template from 'wml!Controls/_popupTemplate/Page/Page';
import {PageController} from 'Controls/popup';
import {CancelablePromise} from 'Types/entity';

interface IPageTemplateOptions extends IControlOptions {
    dataLoaderResult: Promise<unknown>;
    pageTemplate: string;
    pageTemplateOptions: object;
    pageId: string;
}

type TPrefetchResult = Array<Record<string, unknown>>;

/**
 * Контрол, который отвечает за построение шаблона страницы в окне
 * @class Controls/_popupTemplate/Page
 * @extends UI/Base:Control
 * @control
 * @private
 * @author Онищук Д.В.
 */
export default class Template extends Control<IControlOptions> {
    protected _template: TemplateFunction = template;
    protected _prefetchData: Record<string, unknown>;
    protected _processingLoaders: Array<CancelablePromise<unknown>> = [];

    protected _beforeMount(options: IPageTemplateOptions): void {
        if (options.dataLoaderResult) {
            this._processPreloadResult(options.pageId, options.dataLoaderResult);
        }
    }

    protected _beforeUpdate(options: IPageTemplateOptions): void {
        if (options.dataLoaderResult && this._options.dataLoaderResult !== options.dataLoaderResult) {
            this._prefetchData = null;
            this._cancelCurrentLoading();
            this._processPreloadResult(options.pageId, options.dataLoaderResult, options.pageId);
        }
    }

    /**
     * Обработчик подгрузки новых страниц внутри попапа.
     * Загружаем для них данные и спускаем вместе с остальными.
     * @param event
     * @param pageKeys
     * @protected
     */
    protected _preloadItemsByKeysHandler(event: SyntheticEvent, pageKeys: string[]): void {
        const result = {};
        const configs = pageKeys.map((key) => {
            return PageController.getPageConfig(key).then((config) => {
                return PageController.loadData(config, this._options.pageTemplateOptions).then((loaderResult) => {
                    result[key] = loaderResult;
                });
            });
        });
        const cancellablePromise = new CancelablePromise(Promise.all(configs));
        this._processingLoaders.push(cancellablePromise);
        cancellablePromise.promise.then(() => {
            this._prefetchData = {
                ...this._prefetchData,
                ...result
            };
            this._processingLoaders.splice(this._processingLoaders.indexOf(cancellablePromise), 1);
        });
    }

    /**
     * Отменяем резульататы загрузок, которые не завершились, чтобы они не попапли в новые данные.
     * @protected
     */
    protected _cancelCurrentLoading(): void {
        if (this._processingLoaders) {
            this._processingLoaders.forEach((promise) => {
                promise.cancel();
            });
            this._processingLoaders = [];
        }
    }

    private _processPreloadResult(pageId: string, dataLoaderResult: Promise<unknown>): void {
        dataLoaderResult.then((result) => {
            this._prefetchData = this._getPrefetchData(pageId, result as TPrefetchResult);
        });
    }

    /**
     *
     * @param pageId
     * @param prefetchResult
     * @param additionalLoadedData
     * @private
     */
    private _getPrefetchData(
        pageId: string,
        prefetchResult: TPrefetchResult,
        additionalLoadedData: Record<string, unknown> = {}
    ): Record<string, unknown> {
        const result = {
            [pageId]: prefetchResult,
            ...additionalLoadedData
        };

        prefetchResult.forEach((data) => {
            if (data && data._isAdditionalDependencies) {
                Object.keys(data).forEach((key) => {
                    if (key !== '_isAdditionalDependencies') {
                        result[key] = data[key];
                    }
                });
            }
        });

        return result;
    }
}
