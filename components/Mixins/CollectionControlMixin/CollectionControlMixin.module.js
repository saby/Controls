/* global define, $ws */
define('js!SBIS3.CONTROLS.CollectionControlMixin', [
   'js!SBIS3.CONTROLS.CollectionControl.CollectionPresenter',
   'js!SBIS3.CONTROLS.Data.Projection',
   'js!SBIS3.CONTROLS.PagerMore'
], function (CollectionPresenter, Projection, PagerMore) {
   'use strict';

   /**
    * Миксин, задающий любому контролу поведение работы с коллекцией элементов
    * *Это экспериментальный модуль, API будет меняться!*
    * @mixin SBIS3.CONTROLS.CollectionControlMixin
    * @public
    * @state mutable
    * @author Крайнов Дмитрий Олегович
    */

   var CollectionControlMixin = /**@lends SBIS3.CONTROLS.CollectionControlMixin.prototype  */{
      /**
       * @event onItemAction При необходимости выполнить действие по умолчанию для выбранного элемента
       * @param {$ws.proto.EventObject} eventObject Дескриптор события.
       * @param {*} item Выбранный элемент
       * @param {Number} at Индекс выбранного элемента
       */

      $protected: {
         _options: {
            /**
             * @typedef {Object} DataSource
             * @property {DataSourceModule} module Модуль, реализующий ISource, например js!SBIS3.CONTROLS.Data.Source.SbisService
             * @property {Object} options Опции конструктора
             */

            /**
             * @typedef {String} DataSourceModule
             * @variant js!SBIS3.CONTROLS.Data.Source.SbisService Источник данных на базе сервиса БЛ СБиС
             * @variant js!SBIS3.CONTROLS.Data.Source.Memory Источник данных в памяти
             */

            /**
             * @cfg {SBIS3.CONTROLS.Data.Source.ISource|DataSource|Function} Источник данных. Если указан, то опция {@link items} не действует.
             * @remark Нужен только для того, чтобы создать SBIS3.CONTROLS.Data.Collection.ISourceLoadable коллекцию в конструкторе. Далее не используется.
             * @example
             * Задаем источник данных декларативно:
             * <pre>
             *     <options name="dataSource">
             *        <option name="module">js!SBIS3.CONTROLS.Data.Source.SbisService</option>
             *        <options name="options">
             *           <option name="service">Сотрудник</option>
             *        </options>
             *     </options>
             * </pre>
             * Задаем источник данных через функцию:
             * <pre>
             *     <option name="dataSource" type="function">js!MyApp.SomeEntity.Controller:prototype.getDataSource</option>
             * </pre>
             * @see getDataSource
             * @see setDataSource
             */
            dataSource: undefined,

            /**
             * @cfg {Number} Количество записей на одну страницу, запрашиваемых с источника данных
             * @remark
             * Опция используется только при указании {@link dataSource}.
             * Опция определяет количество запрашиваемых записей с источника даныых как при использовании постраничной навигации.
             * Если указать 0, то постраничная навигация не используется.
             * @example
             * <pre class="brush:xml">
             *     <option name="pageSize">10</option>
             * </pre>
             * @see getPageSize
             * @see setPageSize
             */
            pageSize: undefined,

            /**
             * @cfg {Array} Коллекция, отображаемая контролом
             */
            items: [],

            /**
             * @cfg {String|Function} Шаблон разметки каждого элемента списка
             */
            itemTemplate: '',

            /**
             * @cfg {Function} Селектор шаблона разметки для каждого элемента. Если указан, то {@link _itemTemplate} не действует.
             */
            itemTemplateSelector: undefined,

            /**
             * @cfg {Function} Пользовательский метод добавления атрибутов на контейнеры элементов коллекции
             */
            userItemAttributes: undefined,

            /**
             * @cfg {String|HTMLElement|jQuery} Что отображается при отсутствии данных
             */
            emptyHTML: ''
         },

         /**
          * @var {Object} Коллекция, отображаемая контролом (приведенная к внутреннему представлению)
          */
         _items: undefined,

         /**
          * @var {SBIS3.CONTROLS.Data.Projection} Проекция коллекции
          */
         _itemsProjection: undefined,

         /**
          * @var {Function} Конструктор представления коллекции
          */
         _viewConstructor: undefined,

         /**
          * @var {SBIS3.CONTROLS.CollectionControl.CollectionView} Представление коллекции
          */
         _view: undefined,

         /**
          * @var {Function} Конструктор презентера коллекции
          */
         _presenterConstructor: CollectionPresenter,

         /**
          * @var {SBIS3.CONTROLS.CollectionControl.CollectionPresenter} Презентер коллекции
          */
         _presenter: undefined,

         /**
          * @var {Object} Контрол постраничной навигации
          */
         _pager: undefined,

         /**
          * @var {Object} Дочерние визуальные компоненты
          */
         _childInstances: undefined,

         /**
          * @var {Function} Обработчик перед загрузкой элементов
          */
         _onBeforeItemsLoad: undefined,

         /**
          * @var {Function} Обработчик после загрузки элементов
          */
         _onAfterItemsLoad: undefined
      },

      $constructor: function (cfg) {
         this._publish('onItemAction');

         this._onBeforeItemsLoad = onBeforeItemsLoad.bind(this);
         this._onAfterItemsLoad = onAfterItemsLoad.bind(this);
         this._dataLoadedCallback = this._dataLoadedCallback.bind(this);

         this._normalizeConfig(cfg);
      },

      //region After injections

      after: {
         init: function () {
            if ($ws.helpers.instanceOfMixin(this._items, 'SBIS3.CONTROLS.Data.Collection.ISourceLoadable') &&
               (!this._items.isLoaded() || this._items.isQueryChanged())
            ) {
               this._items.load();
            }
         },

         destroy: function () {
            this._unsetItemsEventHandlers();
            if (this._view) {
               this._view.destroy();
            }
         }
      },

      //region After injections

      //region Public methods

      /**
       * Возвращает источник данных
       * @returns {SBIS3.CONTROLS.Data.Source.ISource}
       */
      getDataSource: function () {
         return this._options.dataSource;
      },

      /**
       * Устанавливает источник данных
       * @param {SBIS3.CONTROLS.Data.Source.ISource} source
       */
      setDataSource: function (source) {
         this._options.dataSource = source;
         this._setItems(this._convertDataSourceToItems(source));
         if (this._pager) {
            this._pager.setItems(this.getItems());
         }
         this._getPresenter().setItems(this.getItemsProjection());
      },

      /**
       * Возвращает количество записей, выводимое на одной странице.
       * @returns {Number}
       * @see pageSize
       * @see setPageSize
       */
      getPageSize: function() {
         return this._options.pageSize;
      },

      /**
       * Устанавливает количество записей, выводимое на одной странице.
       * @param {Number} pageSize Количество записей.
       * @example
       * <pre>
       *     myListView.setPageSize(20);
       * </pre>
       * @see pageSize
       * @see getPageSize
       */
      setPageSize: function(pageSize) {
         if (this._options.pageSize === pageSize) {
            return;
         }
         this._options.pageSize = pageSize;

         this._applyPageSize();
      },

      /**
       * Возвращает список, отображаемый контролом
       * @returns {Object}
       */
      getItems: function () {
         return this._items;
      },

      /**
       * Возвращает проекцию элементов, отображаемых контролом
       * @returns {SBIS3.CONTROLS.Data.Projection}
       */
      getItemsProjection: function () {
         return this._itemsProjection;
      },

      /**
       * Возвращает дочерние контролы
       * @returns {Object}
       * @example
       * <pre>
       *     $ws.helpers.forEach(menu.getChildInstances(), function (item) {
       *         item.setCaption('Это пункт меню №' + item.attr('data-id'));
       *     });
       * </pre>
       */
      getChildInstances: function () {
         //FIXME: при добавлении элементов во view после вызова, этот кэш станет невалидным
         if (this._childInstances === undefined) {
            this._childInstances = {};
            var childControls = this.getChildControls();
            for (var i = 0; i < childControls.length; i++) {
               var id = childControls[i].getContainer().attr('data-id');
               this._childInstances[id] = childControls[i];
            }
         }

         return this._childInstances;
      },

      /**
       * Возвращает дочерний контрол
       * @param id Идентификатор контрола.
       * @returns {*}
       * @example
       * <pre>
       *     menu.getChildInstance('id123').setCaption('SomeNewCaption');
       * </pre>
       * @see getChildInstances
       */
      getChildInstance: function (id) {
         return this.getChildInstances()[id];
      },

      /**
       * Выполняет перерисовку представления
       */
      redraw: function () {
         this._getPresenter().redrawCalled();
      },

      /**
       * Выполняет перезагрузку элементов {items} и перерисовку представления
       */
      reload: function () {
         if (!$ws.helpers.instanceOfMixin(this._items, 'SBIS3.CONTROLS.Data.Collection.ISourceLoadable')) {
            throw new Error('Source collection should implement SBIS3.CONTROLS.Data.Collection.ISourceLoadable.');
         }

         this._items.load();
      },

      //endregion Public methods

      //region Protected methods

      /**
       * Приводит объекты, переданные через опции, к внутреннему представлению
       * @private
       */
      _normalizeConfig: function (cfg) {
         cfg = cfg || {};

         if ('dataSource' in cfg) {
            switch (typeof cfg.dataSource) {
               case 'function':
                  this._options.dataSource = cfg.dataSource.call(this);
                  break;
               case 'object':
                  if (!$ws.helpers.instanceOfMixin(cfg.dataSource, 'SBIS3.CONTROLS.Data.Source.ISource') &&
                     'module' in cfg.dataSource
                  ) {
                     var DataSourceConstructor = require(cfg.dataSource.module);
                     this._options.dataSource = new DataSourceConstructor(cfg.dataSource.options || {});
                  }
                  break;
            }
            this._options.items = cfg.items = this._convertDataSourceToItems(this._options.dataSource);
         }

         if (typeof cfg.items === 'function') {
            this._options.items = cfg.items.call(this);
         }

         this._setItems(this._options.items);
      },

      /**
       * Возвращает отображаемую контролом коллекцию, сделанную на основе источника данных
       * @param {SBIS3.CONTROLS.Data.Source.ISource} source
       * @private
       */
      _convertDataSourceToItems: function (source) {
         throw new Error('Method must be inplemented');
      },

      /**
       * Применяет настройки постраничной навигации
       * @private
       */
      _applyPageSize: function() {
         if (this._pager) {
            this._pager.setPageSize(this._options.pageSize);
         }
      },

      /**
       * Инициализирует представление и презентер
       * @private
       */
      _initView: function() {
         this._getView();
         this._initPresenter();
      },

      /**
       * Возвращает представление
       * @returns {SBIS3.CONTROLS.CollectionControl.CollectionView}
       * @private
       */
      _getView: function () {
         return this._view || (this._view = this._createView());
      },

      /**
       * Создает инстанс представления
       * @returns {SBIS3.CONTROLS.CollectionControl.CollectionView}
       * @private
       */
      _createView: function () {
         var view = new this._viewConstructor(this._getViewOptions());

         if (this._options.pageSize > 0) {
            this._pager = new PagerMore({
               element: view.getPagerContainer(),
               items: this.getItems(),
               pageSize: this._options.pageSize
            });
         }

         return view;
      },

      /**
       * Возвращает опции инстанса представления
       * @returns {Object}
       * @private
       */
      _getViewOptions: function () {
         var options = {
            rootNode: this._getViewNode(),
            template: this._getViewTemplate(),
            itemTemplate: this._getItemTemplate(),
            itemTemplateSelector: this._getItemTemplateSelector(),
            itemNodeAttributesHandler: this._options.userItemAttributes,
            emptyHTML: this._options.emptyHTML
         };

         return options;
      },

      /**
       * Инициализирует презентер
       * @private
       */
      _initPresenter: function () {
         var presenter = this._getPresenter();
         presenter.setItemAction(this._callItemAction.bind(this));
         presenter.setReviver(this.reviveComponents.bind(this));
         presenter.setItems(this.getItemsProjection());
         presenter.redrawCalled();
      },

      /**
       * Возвращает презентер
       * @returns {SBIS3.CONTROLS.CollectionControl.CollectionPresenter}
       * @private
       */
      _getPresenter: function () {
         return this._presenter || (this._presenter = this._createPresenter());
      },

      /**
       * Создает инстанс презентера
       * @returns {SBIS3.CONTROLS.CollectionControl.CollectionPresenter}
       * @private
       */
      _createPresenter: function () {
         return new this._presenterConstructor({
            view: this._getView()
         });
      },

      /**
       * Возвращает DOM элемент, в котором размещается представление. По умолчанию - контейнер контрола.
       * @returns {jQuery|String}
       * @private
       */
      _getViewNode: function () {
         return this._container;
      },

      /**
       * Возвращает шаблон отображения представления
       * @returns {String|Function}
       * @private
       */
      _getViewTemplate: function() {
         throw new Error('Template must be overwritten');
      },

      /**
       * Возвращает шаблон разметки каждого элемента коллекции (если не указан, то элемент должен уметь строить свою разметку сам)
       * @returns {String|Function}
       * @private
       */
      _getItemTemplate: function() {
         return this._options.itemTemplate;
      },

      /**
       * Возвращает селектор шаблона разметки для каждого элемента. Если указан, то _getItemTemplate не действует
       * @returns {Function}
       * @private
       */
      _getItemTemplateSelector: function() {
         return this._options.itemTemplateSelector;
      },

      /**
       * Устанавливает список, отображаемый контролом
       * @param {Object} items
       * @private
       */
      _setItems: function (items) {
         this._unsetItemsEventHandlers();

         items = this._convertItems(items);
         if ($ws.helpers.instanceOfModule(items, 'SBIS3.CONTROLS.Data.Projection')) {
            this._itemsProjection = items;
            this._items = this._itemsProjection.getCollection();
         } else  {
            this._items = items;
            this._itemsProjection = Projection.getDefaultProjection(this._items);
         }

         this._applyPageSize();

         this._setItemsEventHandlers();
      },

      /**
       * Конвертирует список, отображаемый контролом, во внутреннее представление
       * @param {Object} items
       * @private
       */
      _convertItems: function (items) {
         return items;
      },

      /**
       * Подключает обработчики событий элементов
       * @private
       */
      _setItemsEventHandlers: function () {
         if (this._items && $ws.helpers.instanceOfMixin(this._items, 'SBIS3.CONTROLS.Data.Collection.ISourceLoadable')) {
            this._items.subscribe('onBeforeCollectionLoad', this._onBeforeItemsLoad);
            this._items.subscribe('onAfterCollectionLoad', this._onAfterItemsLoad);
            this._items.subscribe('onAfterLoadedApply', this._dataLoadedCallback);
         }
      },

      /**
       * Отключает обработчики событий элементов
       * @private
       */
      _unsetItemsEventHandlers: function () {
         if (this._items && $ws.helpers.instanceOfMixin(this._items, 'SBIS3.CONTROLS.Data.Collection.ISourceLoadable')) {
            this._items.unsubscribe('onBeforeCollectionLoad', this._onBeforeItemsLoad);
            this._items.unsubscribe('onAfterCollectionLoad', this._onAfterItemsLoad);
            this._items.unsubscribe('onAfterLoadedApply', this._dataLoadedCallback);
         }
      },

      /**
       * Вызывает действие по умолчанию для выбранного элемента
       * @private
       */
      _callItemAction: function(item, at) {
         this._notify(
            'onItemAction',
            item,
            at
         );
      },

      /**
       * Вызывается просле загрузки данных через источник
       * @param {$ws.proto.EventObject} event Дескриптор события.
       * @param {String} [mode=SBIS3.CONTROLS.Data.Collection.ISourceLoadable.MODE_REPLACE] Режим загрузки
       * @param {Object} items Коллекция, полученная из источника
       * @private
       */
      _dataLoadedCallback: function () {
      }

      //endregion Protected methods
   };

   /**
    * Обработчик перед загрузкой элементов
    * @private
    */
   var onBeforeItemsLoad = function (event, mode, target) {
      if (this._view) {
         this._getPresenter().itemsLoading(target);
      }
   },

   /**
    * Обработчик после загрузки элементов
    * @private
    */
   onAfterItemsLoad = function (event, mode, dataSet, target) {
      if (this._view) {
         this._getPresenter().itemsLoaded(target);
      }
   };

   return CollectionControlMixin;
});
