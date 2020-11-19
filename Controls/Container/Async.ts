/// <amd-module name='Controls/Container/Async' />
import ModuleLoader = require('Controls/Container/Async/ModuleLoader');
import * as library from 'Core/library';
import { IoC, constants } from 'Env/Env';
import { descriptor } from 'Types/entity';
import { Control, IControlOptions, TemplateFunction, headDataStore } from 'UI/Base';
import rk = require('i18n!Controls');
import template = require('wml!Controls/Container/Async/Async');
import {ViewConfig} from "../_error/Handler";

const moduleLoader = new ModuleLoader();

function generateErrorMsg(templateName: string, msg?: string): string {
   const tTemplate = `Ошибка загрузки контрола "${templateName}"`;
   const tHint = 'Возможны следующие причины:\n\t \
                  • Ошибка в самом контроле\n\t \
                  • Долго отвечал БЛ метод в _beforeUpdate\n\t \
                  • Контрола не существует';
   return !msg ? `${tTemplate}\n${tHint}` : `${tTemplate}: ${msg}`;
}

type TStateRecivied = boolean | string;

interface IOptions extends IControlOptions {
   templateName: string;
   templateOptions: IControlOptions;
   errorCallback: (viewConfig: void|ViewConfig, error: unknown) => void;
}

const SUCCESS_BUILDED = 's';
/**
 * Контейнер для асинхронной загрузки контролов.
 * Подробное описание и примеры вы можете найти <a href='/doc/platform/developmentapl/interface-development/pattern-and-practice/async-load/'>здесь</a>.
 *
 * @class Controls/Container/Async
 * @extends Core/Control
 *
 * @public
 * @author Санников К.А.
 */

/**
 * Container for asynchronously loading components.
 * Подробное описание и примеры вы можете найти <a href='/doc/platform/developmentapl/interface-development/pattern-and-practice/async-load/'>здесь</a>.
 *
 * @class Controls/Container/Async
 * @extends Core/Control
 *
 * @public
 * @author Санников К.А.
 */
class Async extends Control<IOptions, TStateRecivied> {
   protected _template: TemplateFunction = template;
   private currentTemplateName: string;
   private optionsForComponent: Record<string, unknown> = {};
   /**
    * Флаг для того, чтобы избежать повторной загрузки шаблона, при изменении опций до окончания асинхронной загрузки
    */
   private asyncLoading: boolean = false;
   /**
    * Флаг, о том, что произошла ошибка при загрузке модуля - чтобы не было циклической попытки загрузки
    */
   private loadingErrorOccurred: boolean = false;
   protected error: TStateRecivied | void;
   protected userErrorMessage: string | void;
   private errorCallback: (viewConfig: void|ViewConfig, error: unknown) => void;

   _beforeMount(options: IOptions, _: unknown, receivedState: TStateRecivied): Promise<TStateRecivied> {
      if (!options.templateName) {
         this.error = 'В модуль Async передали не корректное имя шаблона (templateName=undefined|null|empty)';
         IoC.resolve('ILogger').error(this.error);
         return Promise.resolve(this.error);
      }
      this.errorCallback = options.errorCallback;

      if (receivedState && receivedState !== SUCCESS_BUILDED) {
         IoC.resolve('ILogger').error(receivedState);
      }

      if (constants.isBrowserPlatform && (!moduleLoader.isLoaded(options.templateName) ||
         this._isCompat() || !receivedState)) {
         return this._loadContentAsync(options.templateName, options.templateOptions);
      }

      this.error = this._loadContentSync(options.templateName, options.templateOptions);
      if (this.error) {
         this.userErrorMessage = rk('У СБИС возникла проблема');
         return Promise.resolve(this.error);
      }

      return Promise.resolve(SUCCESS_BUILDED);
   }

   /**
    * Если можем подставить данные при изменении синхронно, то делаем это до обновления
    * @param {*} opts
    */
   _beforeUpdate(opts: IOptions): void {
      if (this.asyncLoading) {
         return;
      }

      if (opts.templateName === this.currentTemplateName) {
         // поменялись только опции шаблона
         this._insertComponent(this.optionsForComponent.resolvedTemplate,
            opts.templateOptions,
            opts.templateName);
         return;
      }

      if (moduleLoader.isLoaded(opts.templateName)) {
         this._loadContentSync(opts.templateName, opts.templateOptions);
      }
   }

   /**
    * Если до обновления не загрузили синхронно, то пробуем загрузить асинхронно
    */
   _afterUpdate(): void {
      if (this.asyncLoading) {
         return;
      }
      if (this.loadingErrorOccurred) {
         this.loadingErrorOccurred = false;
         return;
      }
      if (this.currentTemplateName === this._options.templateName) {
         return;
      }

      this._loadContentAsync(this._options.templateName, this._options.templateOptions).then(() => {
         this._forceUpdate();
      });
   }

   _loadContentSync(name: string, options: IControlOptions): TStateRecivied {
      const loaded = moduleLoader.loadSync(name);
      if (loaded === null) {
         return generateErrorMsg(name);
      }

      this._insertComponent(loaded, options, name);
      this._pushDepToHeadData(library.parse(name).name);
      return false;
   }

   _loadContentAsync(name: string, options: IControlOptions): Promise<TStateRecivied> {
      const promise = moduleLoader.loadAsync(name, this.errorCallback);

      // Need this flag to prevent setting new options for content
      // that wasn't loaded yet
      this.asyncLoading = true;
      this.loadingErrorOccurred = false;

      return promise.then<TStateRecivied, TStateRecivied>((loaded) => {
         this.asyncLoading = false;
         if (!loaded) {
            this.loadingErrorOccurred = true;
            this.error = generateErrorMsg(name);
            IoC.resolve('ILogger').warn(this.error);
            this.userErrorMessage = rk('У СБИС возникла проблема');
            return this.error;
         }

         this._insertComponent(loaded, options, name);
         return true;
      }, (err) => {
         this.asyncLoading = false;
         this.loadingErrorOccurred = true;
         this.error = generateErrorMsg(name);
         this.userErrorMessage = err.message;
         return err;
      });
   }

   _pushDepToHeadData(dep: string): void {
      if (constants.isBrowserPlatform) {
         return;
      }

      try {
         headDataStore.read('pushDepComponent')(dep, true);
      } catch (e) {
         IoC.resolve('ILogger').warn('You\'re trying to use Async without Controls/Application. Link to ' +
            dep +
            ' won\'t be added to server-side generated markup. ' + e);
      }
   }

   _insertComponent(tpl: unknown, opts: IControlOptions, templateName: string): void {
      this.error = '';
      this.currentTemplateName = templateName;
      this.optionsForComponent = {};
      for (const key in opts) {
         if (opts.hasOwnProperty(key)) {
            this.optionsForComponent[key] = opts[key];
         }
      }

      if (tpl && tpl['__esModule']) {
         this.optionsForComponent.resolvedTemplate = tpl['default'];
         return;
      }
      this.optionsForComponent.resolvedTemplate = tpl;
   }

   _isCompat(): boolean {
      return constants.compat;
   }

   static getOptionTypes(): Record<string, unknown> {
      return {
         templateName: descriptor(String).required()
      };
   }
}

export = Async;
/**
 * @name Controls/Container/Async#content
 * @cfg {Content} Содержимое контейнера.
 */

/**
 * @name Controls/Container/Async#content
 * @cfg {Content} Container contents.
 */

/**
 * @name Controls/Container/Async#templateName
 * @cfg {String} Имя асинхронно загружаемого контрола.
 * Можно использовать только {@link /doc/platform/developmentapl/interface-development/pattern-and-practice/javascript-libraries/#_2 публичные пути библиотеки}.
 */

/**
 * @name Controls/Container/Async#templateName
 * @cfg {String} Name of asynchronously loading component
 */

/**
 * @name Controls/Container/Async#templateOptions
 * @cfg {Object} Параметры содержимого контейнера Async.
 */

/**
 * @name Controls/Container/Async#templateOptions
 * @cfg {Object} Options for content of Async
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
