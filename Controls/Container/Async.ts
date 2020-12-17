/// <amd-module name='Controls/Container/Async' />
import * as ModulesLoader from 'WasabyLoader/ModulesLoader';
import { Async as BaseAsync, IAsyncOptions, TAsyncStateReceived } from 'UI/Base';
import rk = require('i18n!Controls');
import {ViewConfig} from "../_error/Handler";
import {IoC} from "Env/Env";
import {Controller, ParkingController} from "Controls/error";

export interface IOptions extends IAsyncOptions {
   errorCallback: (viewConfig: void|ViewConfig, error: unknown) => void;
}

const ERROR_NOT_FOUND = 404;

/**
 * Контейнер для асинхронной загрузки контролов.
 * Подробное описание и примеры вы можете найти <a href='/doc/platform/developmentapl/interface-development/pattern-and-practice/async-load/'>здесь</a>.
 *
 * @class Controls/Container/Async
 * @extends UI/Base:Async
 *
 * @public
 * @author Герасимов А.М.
 */

export default class Async extends BaseAsync {
   protected defaultErrorMessage: string = rk('У СБИС возникла проблема');
   private errorCallback: (viewConfig: void|ViewConfig, error: unknown) => void;

   _beforeMount(options: IOptions, _: unknown, receivedState: TAsyncStateReceived): Promise<TAsyncStateReceived> {
      this.errorCallback = options.errorCallback;
      return super._beforeMount(options, _, receivedState);
   }

   protected _loadAsync<T = unknown>(name: string): Promise<T> {
      return ModulesLoader.loadAsync<T>(name).catch((error) => {
         IoC.resolve('ILogger').error(`Couldn't load module "${name}"`, error);

         return new ParkingController(
             {configField: Controller.CONFIG_FIELD}
         ).process({error, mode: 'include'}).then((viewConfig: ViewConfig<{message: string}>) => {
            if (this.errorCallback && typeof this.errorCallback === 'function') {
               this.errorCallback(viewConfig, error);
            }

            if (!viewConfig?.status || viewConfig.status !== ERROR_NOT_FOUND) {
               ModulesLoader.unloadSync(name);
            }

            const message = viewConfig?.options?.message;
            throw new Error(message || this.defaultErrorMessage);
         });
      });
   }
}

/**
 * @name Controls/Container/Async#content
 * @cfg {Content} Содержимое контейнера.
 */

/**
 * @name Controls/Container/Async#templateName
 * @cfg {String} Имя асинхронно загружаемого контрола.
 * Можно использовать только {@link /doc/platform/developmentapl/interface-development/pattern-and-practice/javascript-libraries/#_2 публичные пути библиотеки}.
 */

/**
 * @name Controls/Container/Async#templateOptions
 * @cfg {Object} Параметры содержимого контейнера Async.
 */

/**
 * @name Controls/Container/Async#errorCallback
 * @cfg {function} Callback для обработки ошибки возникнувшей при загрузке компонента,
 * напр. если нужно показать дружелюбную ошибку вместо простого текста ошибки.
 * Если не передавать (т.е. не обрабатывать ошибку), то при ошибке загрузки компонента будет выведен текст ошибки,
 * поясняющий причину ошибки.
 * С этим callback можно обработать ошибку как нужно прикладному разработчику.
 * @see Controls/dataSource:error.Controller
 *
 */
