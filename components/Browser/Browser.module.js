define('js!SBIS3.CONTROLS.Browser', [
   'Core/CommandDispatcher',
   'Core/Deferred',
   'js!SBIS3.CORE.CompoundControl',
   'tmpl!SBIS3.CONTROLS.Browser',
   'js!SBIS3.CONTROLS.ComponentBinder',
   'js!SBIS3.CONTROLS.ColumnsController',
   'js!SBIS3.CONTROLS.Utils.TemplateUtil',
   'Core/core-instance',
   'Core/helpers/Object/find'
], function(CommandDispatcher, Deferred, CompoundControl, dotTplFn, ComponentBinder, ColumnsController, tplUtil, cInstance, cFind){
   'use strict';

   /**
    * Базовый класс для реестра
    *
    * @class SBIS3.CONTROLS.Browser
    * @extends SBIS3.CORE.CompoundControl
    * @author Крайнов Дмитрий Олегович
    * @demo SBIS3.CONTROLS.Demo.MyBrowser
    *
    * @ignoreEvents onAfterLoad onChange onStateChange
    * @ignoreEvents onDragStop onDragIn onDragOut onDragStart
    *
    * @control
    * @public
    * @category Lists
    * @designTime plugin /design/DesignPlugin
    */

   var
      checkViewType = function(view) {
         if (view && cInstance.instanceOfModule(view, 'SBIS3.CONTROLS.ListView')) {
            return cInstance.instanceOfMixin(view, 'SBIS3.CONTROLS.TreeMixin');
         }
         else {
            throw new Error('Browser: Can\'t define linkedView');
         }
      };

   var
      ChangeColumnsResult = { // Возможные результаты события "onChangeColumns"
         REDRAW: 'Redraw',    // После смены колонок выполнить перерисовку табличного представления
         RELOAD: 'Reload'     // После смены колонок выполнить перезагрузку табличного представления
      },

      Browser = CompoundControl.extend( /** @lends SBIS3.CONTROLS.Browser.prototype */{
      /**
       * @event onEdit Происходит при редактировании или создании новой записи реестра.
       * @remark
       * Для <a href='https://wi.sbis.ru/doc/platform/developmentapl/interface-development/components/list/list-settings/list-types/#_4'>иерархических списков</a> событие происходит только для записей типа "Лист" (см. <a href='https://wi.sbis.ru/doc/platform/developmentapl/workdata/structure/vocabl/tabl/relations/#hierarchy'>Иерархия</a>).
       * @param {Core/EventObject} eventObject Дескриптор события.
       * @param {Object} meta Мета параметры события.
       * @param {String|Number} meta.id Идентификатор записи. В случае создания новой записи значение параметра - null.
       * @param {WS.Data/Entity/Record} meta.item Экземпляр класса записи. В случае создания новой записи значение параметра - null.
       */
      /**
       * @event onEditCurrentFolder Происходит при редактировании или создании новой папки (записей типа "Узел" и "Скрытый узел").
       * @remark
       * Подробнее о типах записей читайте в разделе <a href='https://wi.sbis.ru/doc/platform/developmentapl/workdata/structure/vocabl/tabl/relations/#hierarchy'>Иерархия</a>.
       * Событие актуально только для <a href='https://wi.sbis.ru/doc/platform/developmentapl/interface-development/components/list/list-settings/list-types/#_4'>иерархических списков</a>.
       * @param {Core/EventObject} eventObject Дескриптор события.
       * @param {String} id Идентификатор редактируемой папки. В случае добавления новой папки значение параметра - null.
       */
      /**
       * @event onFiltersReady Происходит после построения экземпляра классов окружения списка: "Быстрый фильтр" (см. {@link SBIS3.CONTROLS.FastDataFilter}) и "Кнопки с фильтром" (см. {@link SBIS3.CONTROLS.FilterButton}).
       * @param {Core/EventObject} eventObject Дескриптор события.
       */
      /**
       * @typedef {String} onColumnsChangeResult
       * @variant Redraw После смены колонок выполнить перерисовку табличного представления. Это поведение используется по умолчанию.
       * @variant Reload После смены колонок выполнить перезагрузку табличного представления.
       */
      /**
       * @event onColumnsChange Происходит при изменении колонок в табличном представлении.
       * @param {Core/EventObject} eventObject Дескриптор события.
       * @param {Array} columns Массив измененных колонок.
       * @returns {onColumnsChangeResult} Позволяет определить, что выполнять после установки колонок - перерисовку или перезагрузку.
       */
      /**
       * @typedef {Object} ColumnsConfigObject
       * @property {WS.Data/Collection/RecordSet} columns Набор записей, каждая из которых описывает элемент панели редактирования колонок. <br/>
       * Поля записи:
       * <ol>
       *    <li><b>id (String)</b> - идентификатор элемента.</li>
       *    <li><b>title (String)</b> - отображаемый текст элемента.</li>
       *    <li><b>fixed (Boolean)</b> - признак "Фиксированный". На панели редактирования колонок элементы с таким признаком выбраны и недоступны для взаимодействия, а колонки элемента, описанные в опции **columnConfig**, всегда отображены в списке.</li>
       *    <li><b>columnConfig (Array)</b> - массив с конфигурацией колонок (см. {@link SBIS3.CONTROLS.DataGridView#columns columns}).</li>
       * </ol>
       * @property {Array.<String|Number>} selectedColumns Массив идентификаторов элементов, которые будут отмечены на панели редактирования колонок. Параметр актуален для элементов с опцией *fixed=false*.
       */
      _dotTplFn : dotTplFn,
      $protected: {
         _view: null,
         _backButton: null,
         _breadCrumbs: null,
         _searchForm: null,
         _operationsPanel: null,
         _filterButton: null,
         _fastDataFilter: null,
         _columnsController: null,
         _columnsEditor: null,
         _hierMode : false,
         _componentBinder : null,
         _options: {
            /**
             * @cfg {Content} Содержимое реестра
             */
            content: '',
            /**
             * @cfg {String} Имя параметр фильтрации для поиска
             */
            searchParam : 'СтрокаПоиска',
            /**
             * @cfg {String|Object} Шаблон для хлебных крошек в режиме поиска
             */
            searchCrumbsTpl: undefined,
            /**
             * @cfg {String} В каком узле осуществляем поиск
             * @variant current в текущем узле
             * @variant root в корне
             * @example
             * <pre>
             *     <option name="searchMode">root</option>
             * </pre>
             */
            searchMode: 'current',
            /**
             * @cfg {Boolean} При неудачной попытке поиска (нет результатов), изменяет раскладку
             * и пробует поискать в другой раскладке
             * @example
             * <pre>
             *     <option name="keyboardLayoutRevert">false</option>
             * </pre>
             */
            keyboardLayoutRevert: true,
            /**
             * @cfg {Boolean} Включает изменение раскладки по новому стандарту. Актуально при включённой опции {@link keyboardLayoutRevert}
             * @example
             * <pre>
             *     <option name="keyboardLayoutRevertNew">true</option>
             * </pre>
             */
            keyboardLayoutRevertNew: false,
            /**
             * @cfg {String} Устанавливает Id для работы с историей фильтров.
             * @remark
             * Опция задает идентификатор, под которым будет сохраняться история фильтрации.
             * Если значение для опции установлено, история фильтрации будет включена.
             * @example
             * <pre>
             *     <option name="historyId">bankPayDocBrowser</option>
             * </pre>
             */
            historyId : '',
            /**
             * Обновлять историю или брать из текущей сессии (SessionStorage/LocalStorage).
             * @remark Данные в SessionStorage могут потерять актуальность при работе одновременно в нескольких вкладках. Опция актуальна при построении реестра на сервере.
             */
            updateFilterHistory: false,
            /**
             * @cfg {Boolean} Применять последний активный фильтр при загрузке реестра.
             */
            applyHistoryFilterOnLoad: true,
            /**
             * @cfg {String} Id для запоминания пэйджинга
             */
            pagingId: '',
            /**
             * @cfg {Array} ignoreFiltersList Массив ключей фильтров, которые не надо запоминать в историю.
             */
            ignoreFiltersList: [],
            /**
             * @cfg [Array} Сохранять проваливание по иерархии в историю браузера будут работать пореходы по кнопке вперед/назад.
             * @remark работает только в месте с сохранением фильтров сессию.
             * @see updateFilterHistory
             */
            saveRootInHistory: false,
            /**
             * @cfg {Boolean} showCheckBoxes необходимо ли показывать чекбоксы, когда панель массовых операций закрыта.
             */
            showCheckBoxes: false,
	        contentTpl: null,
            /**
             * @cfg {ColumnsConfigObject} Устанавливает параметры для Панели редактирования колонок.
             * @remark
             * Вызов панели производят кликом по иконке с шестерёнкой, которая расположена справа от строки поиска.
             * Иконка отображается, когда в опции установлено значение.
             * @example
             * 1. В файле MyColumnsConfig.module.js описан RecordSet для конфигурации Панели редактирования колонок:
             * <pre>
             * define('js!SBIS3.MyArea.MyColumnsConfig', ['WS.Data/Collection/RecordSet'], function(RecordSet) {
             *    var data = [
             *        {
             *           id: 1,
             *           title: 'Базовая группа колонок',
             *
             *           // Признак "Фиксированный"
             *           fixed: true,
             *           columnConfig: [
             *              {
             *                 title: 'Идентификатор',
             *                 field: '@Товар'
             *              },
             *              {
             *                 title: 'Наименование',
             *                 field: 'Наименование',
             *                 className: 'controls-DataGridView-cell-overflow-ellipsis'
             *              }
             *           ]
             *       },
             *       {
             *          id: 2,
             *          title: 'Колонка "Дата выпуска"',
             *          fixed: false,
             *          columnConfig: [{
             *              title: 'Дата выпуска',
             *              field: 'Дата_выпуска'
             *          }]
             *       },
             *       ...
             *    ];
             *    return new RecordSet({
             *       rawData: data,
             *       idProperty: 'id'
             *    });
             * });
             * </pre>
             * 2. Для JS-модуль реестра импортирован RecordSet:
             * <pre>
             * define('js!SBIS3.MyArea.MyReportBrowser',[ ... , 'js!SBIS3.MyArea.MyColumnsConfig'], function(... , MyColumnsConfig) {
             *    ...
             *    $protected: {
             *       _options : {
             *
             *          // Создана опция для конфигурации опции columnsConfig
             *          _columnsConfig: {
             *             columns: myConfig,
             *             selectedColumns: [2, 3]
             *          }
             *       }
             *    }
             *    ...
             * });
             * </pre>
             * 3. В разметке реестра передана конфигурация в опцию columnsConfig:
             * <pre>
             *     <ws:SBIS3.Engine.ReportBrowser columnsConfig="{{ _columnsConfig }}">
             *         ...
             *     </ws:SBIS3.Engine.ReportBrowser>
             * </pre>
             * @see setColumnsConfig
             * @see getColumnsConfig
             */
            columnsConfig: null,
            /**
             * @cfg {Boolean} hierarchyViewMode Включать группировку при поиске.
             */
            hierarchyViewMode: true,
            /**
             * @cfg {String} Имя списка. По умолчанию "browserView"
             */
            viewName: 'browserView',
            backButtonTemplate: null
         }
      },

      $constructor: function () {
      },

      init: function() {
         this._publish('onEdit', 'onEditCurrentFolder', 'onFiltersReady', 'onColumnsChange');
         Browser.superclass.init.apply(this, arguments);

         this._onItemActivateHandler = this._onItemActivate.bind(this);
         this._onColumnsEditorShowHandler = this._onColumnsEditorShow.bind(this);
         this._folderEditHandler = this._folderEdit.bind(this);
         this._onApplyFilterHandler = this._onApplyFilter.bind(this);
         this._onInitBindingsHandler = this._onInitBindings.bind(this);
         this._bindView();

         CommandDispatcher.declareCommand(this, 'setColumnsConfig', this.setColumnsConfig);
         CommandDispatcher.declareCommand(this, 'showColumnsEditor', this.showColumnsEditor);
      },

      /**
       * Устанавливает параметры для Панели конфигурации колонок списка.
       * @param config {Object} Конфигурация
       * @command setColumnsConfig
       * @see columnsConfig
       * @see getColumnsConfig
       */
      setColumnsConfig: function (config) {
         this._options.columnsConfig = config;
         if (!this._columnsController) {
            this._initColumnsController();
         }
         this._columnsController.setState(this._options.columnsConfig.selectedColumns);
         this._notifyOnPropertyChanged('columnsConfig');
      },
      /**
       * Возвращает параметры, установленные для Панели конфигурации колонок списка.
       * @returns {Object} Конфигурация.
       * @see columnsConfig
       * @see setColumnsConfig
       */
      getColumnsConfig: function() {
         return this._options.columnsConfig;
      },

      /**
       * Показать редактор колонок. Возвращает обещание, которое будет разрешено списком идентификаторов выбранных колонок
       * (Редактор колонок не сформирует событие onColumnsEditorShow при этом)
       * @public
       * @param {object} columnsConfig Параметры открытия
       * @return {Deferred<object>}
       * @command showColumnsEditor
       */
      showColumnsEditor: function (columnsConfig) {
         this._ensureColumnsEditor(false);
         return this._columnsEditor ? this._columnsEditor.show(columnsConfig || this._options.columnsConfig) : Deferred.fail();
      },

      _onColumnsEditorShow: function (event, promise) {
         event.setResult({
            columns: this._options.columnsConfig.columns,
            selectedColumns: this._columnsController.getState()
         });
         promise.addCallback(function (columnsConfig) {
            if (columnsConfig) {
               this._changeColumns(columnsConfig.selectedColumns);
            }
         }.bind(this));
      },

      _changeColumns: function (columns) {
         var result = this._notify('onColumnsChange', columns);
         this._columnsController.setState(columns);
         var view = this._getView();
         view.setColumns(this._columnsController.getColumns(this._options.columnsConfig.columns));
         if (result === ChangeColumnsResult.RELOAD) {
            view.reload();
         }
         else {
            view.redraw();
         }
      },

      _modifyOptions: function() {
         var options = Browser.superclass._modifyOptions.apply(this, arguments);

	      if (!options.contentTpl) {
		      options.contentTpl = tplUtil.prepareTemplate(options.content);
	      }

         return options;
      },

      _folderEdit: function(){
         this._notify('onEditCurrentFolder', this._componentBinder.getCurrentRootRecord());
      },

      addItem: function(metaData) {
         //При создании записи в простом случае просто зовем onEdit с пустыми параметрами
         this._notify('onEdit', {id: null, item: null});
      },

      getView: function() {
         return this._view;
      },

       /**
       * Привязать новый список по имени
       * @param name {String} Имя списка
       * @see viewName
       */
      setViewName: function(name) {
         this._unbindView();
         this._options.viewName = name;
         this._bindView();
      },

      _unbindView: function() {
         if (this._view) {
            this._view.unsubscribe('onItemActivate', this._onItemActivateHandler);
         }
         if (this._columnsController) {
            this._columnsController.destroy();
         }
         if (this._columnsEditor) {
            this._unsubscribeFromColumnsEditor();
         }
         if (this._backButton) {
            this._backButton.unsubscribe('onArrowActivated', this._folderEditHandler);
         }
         if (this._componentBinder) {
            this._componentBinder.destroy();
         }
         if (this._filterButton) {
            this.unsubscribeFrom(this._filterButton, 'onApplyFilter', this._onApplyFilterHandler);
         }
      },

      _initColumnsController: function() {
         var
            columnsState;
         this._columnsController = new ColumnsController();
         columnsState = this._columnsController.getState();
         if (!columnsState) {
            this._columnsController.setState(this._options.columnsConfig.selectedColumns);
         }
         this._getView().setColumns(this._columnsController.getColumns(this._options.columnsConfig.columns));
         this._getView().redraw();
         this._ensureColumnsEditor(true);
      },

      _bindView: function() {
         var
            self = this;
         this._view = this._getView();
         this._view.subscribe('onItemActivate', this._onItemActivateHandler);

         if (this._options.columnsConfig) {
            this._initColumnsController();
         }

         this._hierMode = checkViewType(this._view);

         if (this._hierMode) {
            this._backButton = this._getBackButton();
            this._breadCrumbs = this._getBreadCrumbs();
            if (this._backButton && this._breadCrumbs) {
               this._backButton.subscribe('onArrowActivated', this._folderEditHandler);
               this._componentBinder = new ComponentBinder({
                  backButton : this._backButton,
                  breadCrumbs : this._breadCrumbs,
                  view: this._view,
                  backButtonTemplate: this._options.backButtonTemplate
               });
               this._componentBinder.bindBreadCrumbs();
            }
            else {
               this._componentBinder = new ComponentBinder({
                  view: this._view
               });
            }
         }
         else {
            this._componentBinder = new ComponentBinder({
               view: this._view
            });
         }

         this._searchForm = this._getSearchForm();
         if (this._searchForm) {
            this._componentBinder.bindSearchGrid(
               this._options.searchParam,
               this._options.searchCrumbsTpl,
               this._searchForm,
               this._options.searchMode,
               false,
               this._options.keyboardLayoutRevert,
               this._options.hierarchyViewMode);
         }


         this._operationsPanel = this._getOperationsPanel();
         if (this._operationsPanel) {
            this._componentBinder.bindOperationPanel(!this._options.showCheckBoxes, this._operationsPanel);
            //Временное решение. Необходимо для решения ошибки: https://inside.tensor.ru/opendoc.html?guid=18468d65-ec58-4e2d-a0f0-fc35af4dfde5
            //Если Browser переделать на flex-box то такие придроты не понадобятся.
            //Выписана задача https://inside.tensor.ru/opendoc.html?guid=04d2ea0c-133c-4ee1-bf9b-4b222921b7d3
            this._operationsPanel.subscribe('onToggle', function() {
               self._container.toggleClass('controls-Browser__operationPanel-opened', this.isVisible());
            });
         }

         this._filterButton = this._getFilterButton();
         this._fastDataFilter = this._getFastDataFilter();

         if (this._filterButton) {
            this.subscribeTo(this._filterButton, 'onApplyFilter', this._onApplyFilterHandler);
            if(this._options.historyId) {
               this._bindFilterHistory();
            } else {
               this._notifyOnFiltersReady();
            }
         } else {
            this._notifyOnFiltersReady();
         }

         if(this._options.pagingId && this._view.getProperty('showPaging')) {
            this._componentBinder.bindPagingHistory(this._view, this._options.pagingId);
         }

         //Необходимо вызывать bindFilters, который выполняет подписку на applyFilter, позже, иначе произойдет неверная синхронизация фильтров при биндинге структуры
         if (this.isInitialized()) {
            this._onInitBindingsHandler();
         }
         else {
            this.subscribe('onInit', this._onInitBindingsHandler);
         }
      },

      _onItemActivate: function(e, itemMeta) {
         this._notifyOnEditByActivate(itemMeta);
      },

      _onApplyFilter:function() {
         this.getView().setActive(true);
      },

      _onInitBindings: function() {
         if( (this._filterButton || this._fastDataFilter) &&
            /* Новый механизм включаем, только если нет биндов на структуру фильтров (такая проверка временно) */
            (!this._filterButton || this._filterButton && !cFind(this._filterButton._getOptions().bindings, function(obj) {return obj.propName === 'filterStructure'}))) {
            this._componentBinder.bindFilters(this._filterButton, this._fastDataFilter, this._view);
         }
      },

      /**
       * Установить отображение нового пути для хлебных крошек и кнопки назад
       * @param {Array} path новый путь, последний элемент попадает в BackButton, остальные в хлебные крошки
       */
      setPath: function(path){
         this._componentBinder.setPath(path);
      },

      /**
       * Устанавливает занчение идентификатора истории
       * @param id
       */
      setHistoryId: function(id) {
         this._options.historyId = id;
         this._bindFilterHistory();
      },

      // TODO: Убрать метод ?
      _setColumnsEditor: function() {
         this._ensureColumnsEditor(true);
      },

      /**
       * Удостовериться, что редактора колонок точно есть и правильно подготовлен
       * @protected
       * @param {true} renew Создать новый экзепляр если старый уже есть
       */
      _ensureColumnsEditor: function (renew) {
         if (renew && this._columnsEditor) {
            this._columnsEditor.destroy();
            this._columnsEditor = null;
         }
         if (!this._columnsEditor) {
            this._columnsEditor = this._getColumnsEditor();
            if (this._columnsEditor) {
               this._subscribeToColumnsEditor();
            }
         }
      },

      _subscribeToColumnsEditor: function() {
         this.subscribeTo(this._columnsEditor, 'onColumnsEditorShow', this._onColumnsEditorShowHandler);
      },

      _unsubscribeFromColumnsEditor: function () {
         this.unsubscribeFrom(this._columnsEditor, 'onColumnsEditorShow', this._onColumnsEditorShowHandler);
      },

      _bindFilterHistory: function() {
         if(this._filterButton && this._options.historyId) {
            this._componentBinder.bindFilterHistory(
               this._filterButton,
               this._fastDataFilter,
               this._options.searchParam,
               this._options.historyId,
               this._options.ignoreFiltersList,
               this._options.applyHistoryFilterOnLoad,
               this,
               this._options.updateFilterHistory,
               this._options.saveRootInHistory);
         }
      },

      _notifyOnFiltersReady: function() {
         var fastFilter = this._fastDataFilter;

         /* Если фильтр скрыт, то не будем его отображать */
         if(fastFilter && fastFilter.isVisible()) {
            fastFilter.getContainer().removeClass('ws-hidden');
         }
         this._notify('onFiltersReady');
      },

      _getLinkedControl: function(name) {
         var ctrl = null;
         if (this.hasChildControlByName(name)) {
            ctrl = this.getChildControlByName(name);
         }
         return ctrl;
      },

      _getView: function() {
         return this._getLinkedControl(this._options.viewName);
      },
      _getFilterButton: function() {
         return this._getLinkedControl('browserFilterButton');
      },
      _getSearchForm: function() {
         return this._getLinkedControl('browserSearch');
      },
      _getColumnsEditor: function() {
         return this._getLinkedControl('browserColumnsEditor');
      },
      _getBackButton: function() {
         return this._getLinkedControl('browserBackButton');
      },
      _getBreadCrumbs: function() {
         return this._getLinkedControl('browserBreadCrumbs');
      },
      _getOperationsPanel: function() {
         return this._getLinkedControl('browserOperationsPanel');
      },
      _getFastDataFilter: function() {
         return this._getLinkedControl('browserFastDataFilter');
      },

      _notifyOnEditByActivate: function(itemMeta) {
         this._notify('onEdit', itemMeta)
      },

      destroy: function() {
         if (this._columnsController) {
            this._columnsController.destroy();
            this._columnsController = null;
         }
         Browser.superclass.destroy.apply(this, arguments);
      }
   });

   Browser.ChangeColumnsResult = ChangeColumnsResult;

   return Browser;
});