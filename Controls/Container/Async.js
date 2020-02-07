define('Controls/Container/Async',
   [
      'UI/Base',
      'Application/Env',
      'Env/Env',
      'wml!Controls/Container/Async/Async',
      'Controls/Container/Async/ModuleLoader',
      'Core/library',
      'Types/entity'
   ],

   function(Base,
      AppEnv,
      Env,
      template,
      ModuleLoader,
      library,
      entity) {
      'use strict';


      /**
       * Контейнер для асинхронной загрузки контролов.
       * Подробное описание и примеры вы можете найти <a href='https://wi.sbis.ru/doc/platform/developmentapl/interface-development/pattern-and-practice/async-load/'>здесь</a>.
       *
       * @class Controls/Container/Async
       * @extends Core/Control
       * @control
       * @public
       * @author Белотелов Н.В.
       * @category Container
       */

      /*
       * Container for asynchronously loading components.
       * Подробное описание и примеры вы можете найти <a href='https://wi.sbis.ru/doc/platform/developmentapl/interface-development/pattern-and-practice/async-load/'>здесь</a>.
       *
       * @class Controls/Container/Async
       * @extends Core/Control
       * @control
       * @public
       * @author Белотелов Н.В.
       * @category Container
       */

      /**
       * @name Controls/Container/Async#content
       * @cfg {Content} Содержимое контейнера.
       */

      /*
       * @name Controls/Container/Async#content
       * @cfg {Content} Container contents.
       */

      /**
       * @name Controls/Container/Async#templateName
       * @cfg {String} Имя асинхронно загружаемого контрола.
       */

      /*
       * @name Controls/Container/Async#templateName
       * @cfg {String} Name of asynchronously loading component
       */

      /**
       * @name Controls/Container/Async#templateOptions
       * @cfg {Object} Параметры содержимого контейнера Async.
       */

      /*
       * @name Controls/Container/Async#templateOptions
       * @cfg {Object} Options for content of Async
       */

      var moduleLoader = new ModuleLoader();

      function generateErrorMsg(template, msg) {
         return 'Couldn\'t load module ' +
            template + ' ' +
            (msg || '');
      }

      var Async = Base.Control.extend({
         _template: template,
         optionsForComponent: {},
         canUpdate: true,
         _beforeMount: function(options, ctx, receivedState) {
            var self = this;
            if (!self._isServer() && (!moduleLoader.isLoaded(options.templateName) || this._isCompat() || !receivedState)) {
               return self._loadContentAsync(options.templateName, options.templateOptions, true);
            }

            self.error = self._loadContentSync(options.templateName, options.templateOptions);
            if (self.error) {
               return Promise.resolve(self.error);
            }

            return Promise.resolve(true);
         },

         /**
          * Если можем подставить данные при изменении синхронно, то делаем это до обновления
          * @param {*} opts
          */
         _beforeUpdate: function(opts) {
            if (!this.canUpdate) {
               return;
            }

            if (opts.templateName === this._options.templateName) {
               // поменялись только опции шаблона
               return this._insertComponent(this.optionsForComponent.resolvedTemplate,
                  opts.templateOptions,
                  opts.templateName);
            }

            if (moduleLoader.isLoaded(opts.templateName)) {
               this._loadContentSync(opts.templateName, opts.templateOptions);
            }
         },

         _afterUpdate: function() {
            if (!this.canUpdate) {
               return;
            }
            if (this.currentTemplateName === this._options.templateName) {
               return;
            }

            var self = this;
            this._loadContentAsync(this._options.templateName, this._options.templateOptions).then(function () {
               self._forceUpdate();
            });
         },

         _loadContentSync: function(name, options) {
            var loaded = moduleLoader.loadSync(name);
            if (loaded === null) {
               return generateErrorMsg(name);
            }

            this._insertComponent(loaded, options, name);
            this._pushDepToHeadData(library.parse(name).name);
         },

         _loadContentAsync: function(name, options) {
            var self = this;
            var promise = moduleLoader.loadAsync(name);

            // Need this flag to prevent setting new options for content
            // that wasn't loaded yet
            self.canUpdate = false;
            promise = promise.then(function(loaded) {
               self.canUpdate = true;
               if (loaded === null) {
                  self.error = generateErrorMsg(name);
                  return true;
               }

               self._insertComponent(loaded, options, name);
               return true;
            }, function(err) {
               self.canUpdate = true;
               self.error = generateErrorMsg(name);
               return err;
            });
            return promise;
         },

         _getHeadData: function() {
            return AppEnv.getStore('HeadData');
         },

         _pushDepToHeadData: function(dep) {
            if (!this._isServer()) {
               return;
            }

            try {
               var headData = this._getHeadData();
               headData.pushDepComponent(dep, true);
            } catch (e) {
               Env.IoC.resolve('ILogger').warn('You\'re trying to use Async without Controls/Application. Link to ' +
                  dep +
                  ' won\'t be added to server-side generated markup. ' + e);
            }
         },

         _insertComponent: function(tpl, opts, templateName) {
            this.currentTemplateName = templateName;
            this.optionsForComponent = {};
            for (var key in opts) {
               if (opts.hasOwnProperty(key)) {
                  this.optionsForComponent[key] = opts[key];
               }
            }

            if (tpl && tpl.__esModule) {
               return this.optionsForComponent.resolvedTemplate = tpl.default;
            }
            this.optionsForComponent.resolvedTemplate = tpl;
         },

         _isServer: function() {
            return typeof window === 'undefined';
         },

         _isCompat: function() {
            return Env.constants.compat;
         }
      });

      Async.getOptionTypes = function getOptionTypes() {
         return {
            templateName: entity.descriptor(String).required()
         };
      };

      return Async;
   });
