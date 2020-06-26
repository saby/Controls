/// <amd-module name='Controls/Container/Async' />
import ModuleLoader = require('Controls/Container/Async/ModuleLoader');
import * as library from 'Core/library';
import { IoC, constants } from 'Env/Env';
import { descriptor } from 'Types/entity';
import { Control, IControlOptions, TemplateFunction, headDataStore } from 'UI/Base';
import { parking } from 'Controls/dataSource';
import rk = require('i18n!Controls');
import template = require('wml!Controls/Container/Async/Async');

/**
 * Контейнер для асинхронной загрузки контролов.
 * Подробное описание и примеры вы можете найти <a href='https://wi.sbis.ru/doc/platform/developmentapl/interface-development/pattern-and-practice/async-load/'>здесь</a>.
 *
 * @class Controls/Container/Async
 * @extends Core/Control
 * @control
 * @public
 * @author Санников К.А.
 * @category Container
 */

/**
 * Container for asynchronously loading components.
 * Подробное описание и примеры вы можете найти <a href='https://wi.sbis.ru/doc/platform/developmentapl/interface-development/pattern-and-practice/async-load/'>здесь</a>.
 *
 * @class Controls/Container/Async
 * @extends Core/Control
 * @control
 * @public
 * @author Санников К.А.
 * @category Container
 */

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
 * @name Controls/Container/Async#errorHandler
 * @cfg {Controls/dataSource:parking.Handler} Обработчик ошибки возникнувшей при загрузке компонента,
 * напр. если нужна обработка ошибки не стандартным обработчиком дружелюбных ошибок.
 */

const moduleLoader = new ModuleLoader();

function generateErrorMsg(templateName: string, msg?: string): string {
   const tTemplate = `Ошибка загрузки контрола ${templateName}`;
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
   errorHandler: parking.Handler;
}

const SUCCESS_BUILDED = 's';
class Async extends Control<IOptions, TStateRecivied> {
   protected _template: TemplateFunction = template;
   private currentTemplateName: string;
   private optionsForComponent: Record<string, unknown> = {};
   private canUpdate: boolean = true;
   protected error: TStateRecivied | void;
   protected userErrorMessage: string | void;
   private errorHandler: parking.Handler;

   _beforeMount(options: IOptions, _: unknown, receivedState: TStateRecivied): Promise<TStateRecivied> {
      if (typeof options.templateName === 'undefined') {
         this.error = 'В модуль Async передали не корректное имя шаблона (templateName=undefined)';
         IoC.resolve('ILogger').warn(this.error);
         return Promise.resolve(this.error);
      }
      this.errorHandler = options.errorHandler;

      if (receivedState && receivedState !== SUCCESS_BUILDED) {
         IoC.resolve('ILogger').error(receivedState);
      }

      if (this._isClient() && (!moduleLoader.isLoaded(options.templateName) ||
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
      if (!this.canUpdate) {
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

   _afterUpdate(): void {
      if (!this.canUpdate) {
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
      const promise = moduleLoader.loadAsync(name, this.errorHandler);

      // Need this flag to prevent setting new options for content
      // that wasn't loaded yet
      this.canUpdate = false;
      const result = promise.then<TStateRecivied, TStateRecivied>((loaded) => {
         this.canUpdate = true;
         if (loaded === null) {
            this.error = generateErrorMsg(name);
            this.userErrorMessage = rk('У СБИС возникла проблема');
            return this.error;
         }

         this._insertComponent(loaded, options, name);
         return true;
      }, (err) => {
         this.canUpdate = true;
         this.error = generateErrorMsg(name);
         this.userErrorMessage = err.message;
         return err;
      });

      return result;
   }

   _pushDepToHeadData(dep: string): void {
      if (this._isClient()) {
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

   _isClient(): boolean {
      return typeof window !== 'undefined';
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
