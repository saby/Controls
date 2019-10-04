import {Control, TemplateFunction, IControlOptions } from 'UI/Base';
import Controller from 'Controls/_dataSource/_error/Controller';
import Mode from 'Controls/_dataSource/_error/Mode';
import * as template from 'wml!Controls/_dataSource/_error/DataLoader';
import requestDataUtil, {ISourceConfig, IRequestDataResult} from 'Controls/_dataSource/requestDataUtil';
import {PrefetchProxy} from 'Types/source';
import {ViewConfig as ErrorViewConfig} from 'Controls/_dataSource/_error/Handler';
import {wrapTimeout} from 'Core/PromiseLib/PromiseLib';
import {fetch} from 'Browser/Transport';

interface IErrorContainerReceivedState {
   sources?: ISourceConfig[];
   errorViewConfig?: ErrorViewConfig;
}

interface IErrorContainerOptions extends IControlOptions {
   sources: ISourceConfig[];
   leastOneError: boolean;
   requestTimeout: number;
   errorController: Controller;
}

const ERROR_ON_TIMEOUT = 504;

/**
 * Контрол, позволяющий обработать загрузку из нескольких источников данных. В случае возникновения проблем получения
 * данных, будет выведена соответствующая ошибка.
 * @class Controls/_dataSource/_error/DataLoader
 * @extends UI/Base:Control
 * @control
 * @public
 * @author Сухоручкин А.С
 */

export default class DataLoader extends Control<IErrorContainerOptions> {
   protected _template: TemplateFunction = template;
   private _sources: ISourceConfig[];
   private _errorViewConfig: ErrorViewConfig;
   private _errorController: Controller = new Controller({});

   protected _beforeMount({sources, leastOneError, requestTimeout}: IErrorContainerOptions,
                          ctx?: unknown,
                          receivedState?: IErrorContainerReceivedState): Promise<IErrorContainerReceivedState> | void {
      if (receivedState) {
         this._sources = receivedState.sources;
         this._errorViewConfig = receivedState.errorViewConfig;
      } else {
         return DataLoader.load(sources, requestTimeout).then(({sources, errors}) => {
            const errorsCount = errors.length;

            if (errorsCount === sources.length || leastOneError && errorsCount !== 0) {
               return this._getErrorViewConfig(errors[0]).then((errorViewConfig: ErrorViewConfig) => {
                  this._errorViewConfig = errorViewConfig;
                  return {errorViewConfig};
               });
            } else {
               this._sources = sources;
               return {sources}
            }
         });
      }
   }

   private _getErrorViewConfig(error: Error): Promise<ErrorViewConfig> {
      return this._getErrorController().process({
         error: error,
         mode: Mode.include
      });
   }

   private _getErrorController(): Controller {
      return this._options.errorController || this._errorController;
   }

   static load(sources: Array<ISourceConfig>,
               loadDataTimeout?: number,
               sourcesPromises?: Array<Promise<IRequestDataResult>>): {
      sources: Array<ISourceConfig>,
      errors: Array<Error>
   } {
      const sourcesResult: Array<ISourceConfig> = [];
      const errorsResult: Array<Error> = [];

      const waitSources = sources.map((sourceConfig: ISourceConfig, sourceIndex: number) => {
         let sourcePromise = sourcesPromises ? sourcesPromises[sourceIndex] : requestDataUtil(sourceConfig);

         sourcePromise = wrapTimeout(sourcePromise, loadDataTimeout).catch(() => {
            // Если данные не получены за отведенное время, сами сгенерируем 504 ошибку
            return Promise.reject(new fetch.Errors.HTTP({
               httpError: ERROR_ON_TIMEOUT
            }));
         });

         return sourcePromise.catch((err: Error) => {
            errorsResult.push(err);
            return {
               data: err
            };
         }).then((loadDataResult: IRequestDataResult) => {
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

   static _createSourceConfig(sourceConfig: ISourceConfig, loadDataResult: IRequestDataResult): ISourceConfig {
      const result = {...sourceConfig};

      result.source = new PrefetchProxy({
         target: sourceConfig.source,
         data: {
            query: loadDataResult.data
         }
      });
      result.historyItems = loadDataResult.historyItems;

      return result;
   }

   static getDefaultOptions(): IErrorContainerOptions {
      return {
         leastOneError: true,
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
 * @name Controls/_dataSource/_error/DataLoader#leastOneError
 * @cfg {Boolean} Показывать ошибку в случае возникновения проблем получения данных у любого из переданных истоников.
 * @default true
 */

/**
 * @name Controls/_dataSource/_error/DataLoader#requestTimeout
 * @cfg {Number} Максимально допустимое время, за которое должен отработать запрос за данными.
 * @remark Если за отведенное время запрос не успеет успешно отработать, будет сгенерирована 504 ошибка и ожидание
 * ответа прекратится.
 * @default 5000
 */

