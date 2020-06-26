import {Control, TemplateFunction, IControlOptions } from 'UI/Base';
import { Controller, Mode, ViewConfig as ErrorViewConfig } from 'Controls/error';
import * as template from 'wml!Controls/_dataSource/_error/DataLoader';
import requestDataUtil, {ISourceConfig, IRequestDataResult} from 'Controls/_dataSource/requestDataUtil';
import {PrefetchProxy} from 'Types/source';
import {wrapTimeout} from 'Core/PromiseLib/PromiseLib';
import {fetch, HTTPStatus } from 'Browser/Transport';

interface IErrorContainerReceivedState {
   sources?: ISourceConfig[];
   errorViewConfig?: ErrorViewConfig;
}

interface IErrorContainerOptions extends IControlOptions {
   sources: ISourceConfig[];
   errorHandlingEnabled: boolean;
   requestTimeout: number;
   errorController: Controller;
}

/**
 * Контрол, позволяющий обработать загрузку из нескольких источников данных. В случае возникновения проблем получения
 * данных, будет выведена соответствующая ошибка.
 * @class Controls/_dataSource/_error/DataLoader
 * @extends UI/Base:Control
 * @implements Controls/_interface/IErrorController
 * @control
 * @public
 * @author Сухоручкин А.С.
 */

export default class DataLoader extends Control<IErrorContainerOptions, IErrorContainerReceivedState> {
   protected _template: TemplateFunction = template;
   protected _sources: ISourceConfig[];
   protected _errorViewConfig: ErrorViewConfig;
   private _errorController: Controller = new Controller({});

   protected _beforeMount({sources, errorHandlingEnabled, requestTimeout}: IErrorContainerOptions,
                          ctx?: unknown,
                          receivedState?: IErrorContainerReceivedState): Promise<IErrorContainerReceivedState> | void {
      if (receivedState) {
         this._sources = sources;
         this._errorViewConfig = receivedState.errorViewConfig;
      } else {
         return DataLoader.load(sources, requestTimeout).then(({sources, errors}) => {
            const errorsCount = errors.length;

            if (errorsCount === sources.length || errorHandlingEnabled && errorsCount !== 0) {
               return this._getErrorViewConfig(errors[0]).then((errorViewConfig: ErrorViewConfig) => {
                  this._errorViewConfig = errorViewConfig;
                  return { errorViewConfig };
               });
            } else {
               this._sources = sources;
               return {
                  errorViewConfig: null
               };
            }
         });
      }
   }

   private _getErrorViewConfig(error: Error): Promise<ErrorViewConfig | void> {
      return this._getErrorController().process({
         error,
         theme: this._options.theme,
         mode: Mode.include
      });
   }

   private _getErrorController(): Controller {
      return this._options.errorController || this._errorController;
   }

   static load(sources: ISourceConfig[],
               loadDataTimeout?: number,
               sourcesPromises?: Array<Promise<IRequestDataResult>>): Promise<{
      sources: ISourceConfig[],
      errors: Error[]
   }> {
      const sourcesResult: ISourceConfig[] = [];
      const errorsResult: Error[] = [];

      const waitSources = sources.map((sourceConfig: ISourceConfig, sourceIndex: number) => {
         const sourcePromise = sourcesPromises ? sourcesPromises[sourceIndex] : requestDataUtil(sourceConfig);

         return wrapTimeout(sourcePromise, loadDataTimeout).catch((err) => {
            // Если данные не получены за отведенное время, сами сгенерируем 504 ошибку
            const data = err instanceof Error ? err : new fetch.Errors.HTTP({
               httpError: HTTPStatus.GatewayTimeout,
               message: undefined,
               url: undefined
            });

            return {
               data
            };
         }).then((loadDataResult: IRequestDataResult) => {
            if (loadDataResult.data instanceof Error) {
               errorsResult.push(loadDataResult.data);
            }

            sourcesResult[sourceIndex] = DataLoader._createSourceConfig(sourceConfig, loadDataResult);
         });
      });

      return Promise.all(waitSources).then(() => {
         return {
            sources: sourcesResult,
            errors: errorsResult
         };
      });
   }

   static _createSourceConfig(
      sourceConfig: ISourceConfig,
      { data, historyItems, filter, sorting }: IRequestDataResult
   ): ISourceConfig {
      const result = {...sourceConfig, historyItems, filter, sorting};

      result.source = new PrefetchProxy({
         // Не делаем вложенность PrefetchProxy в PrefetchProxy, иначе прикладным программистам сложно получиить
         // оригинальный SbisService, а он им необходим для подписки на onBeforeProviderCall, который не стреляет
         // у PrefetchProxy.
         target: sourceConfig.source instanceof PrefetchProxy ? sourceConfig.source.getOriginal() : sourceConfig.source,
         data: {
            query: data
         }
      });

      return result;
   }

   static getDefaultOptions(): Partial<IErrorContainerOptions> {
      return {
         errorHandlingEnabled: true,
         requestTimeout: 5000
      };
   }
}

/**
 * @typedef {Object} ISourceConfig
 * @property {ICrud} source {@link Controls/list:DataContainer#source}
 * @property {Array|function|IList} fastFilterSource? {@link Controls/_filter/Controller#fastFilterSource}
 * @property {Object} navigation? {@link Controls/list:DataContainer#navigation}
 * @property {String} historyId? {@link Controls/_filter/Controller#historyId}
 * @property {Object} filter? {@link Controls/list#filter}
 * @property {Object} sorting? {@link Controls/list/ISorting#sorting}
 * @property {?Object[]} historyItems? {@link  Controls/_filter/Controller#historyItems}
 */

/**
 * @name Controls/_dataSource/_error/DataLoader#sources
 * @cfg {Array.<ISourceConfig>} Конфигурации осточников данных.
 */

/**
 * @name Controls/_dataSource/_error/DataLoader#errorHandlingEnabled
 * @cfg {Boolean} Автоматически показывать ошибку в случае возникновения проблем получения данных у любого из переданных
 * истоников.
 * @default true
 */

/**
 * @name Controls/_dataSource/_error/DataLoader#requestTimeout
 * @cfg {Number} Максимально допустимое время, за которое должен отработать запрос за данными.
 * @remark Если за отведенное время запрос не успеет успешно отработать, будет сгенерирована 504 ошибка и ожидание
 * ответа прекратится.
 * @default 5000
 */
