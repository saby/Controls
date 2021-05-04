import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import template = require('wml!Controls/_list/Data');
import * as isNewEnvironment from 'Core/helpers/isNewEnvironment';
import {RegisterClass} from 'Controls/event';
import {RecordSet} from 'Types/collection';
import {QueryWhereExpression, PrefetchProxy, ICrud, ICrudPlus, IData, Memory, CrudEntityKey} from 'Types/source';
import {
   error as dataSourceError,
   ISourceControllerOptions,
   NewSourceController as SourceController, nodeHistoryUtil, Path
} from 'Controls/dataSource';
import {ISourceControllerState} from 'Controls/dataSource';
import {ContextOptions} from 'Controls/context';
import {
   ISourceOptions,
   IHierarchyOptions,
   IFilterOptions,
   INavigationOptions,
   ISortingOptions,
   TKey,
   Direction
} from 'Controls/interface';
import {SyntheticEvent} from 'UI/Vdom';
import {isEqual} from 'Types/object';

export interface IDataOptions extends IControlOptions,
    ISourceOptions,
    IHierarchyOptions,
    IFilterOptions,
    INavigationOptions<unknown>,
    ISortingOptions {
   dataLoadErrback?: Function;
   dataLoadCallback?: Function;
   root?: TKey;
   groupProperty?: string;
   groupingKeyCallback?: Function;
   groupHistoryId?: string;
   historyIdCollapsedGroups?: string;
   sourceController?: SourceController;
   expandedItems?: CrudEntityKey[];
   nodeHistoryId?: string;
}

export interface IDataContextOptions extends ISourceOptions,
    INavigationOptions<unknown>,
    IFilterOptions,
    ISortingOptions {
   keyProperty: string;
   items: RecordSet;
}

interface IReceivedState {
   items: RecordSet | Error;
   expandedItems: CrudEntityKey[];
}

/**
 * Контрол-контейнер, предоставляющий контекстное поле "dataOptions" с необходимыми данными для дочерних контейнеров.
 *
 * @remark
 * Поле контекста "dataOptions" ожидает Controls/list:Container, который лежит внутри.
 *
 * Полезные ссылки:
 * * {@link /materials/Controls-demo/app/Controls-demo%2FFilterSearch%2FFilterSearch демо-пример}
 * * {@link https://github.com/saby/wasaby-controls/blob/897d41142ed56c25fcf1009263d06508aec93c32/Controls-default-theme/variables/_list.less переменные тем оформления}
 * * {@link Controls/list:Container}
 *
 * @class Controls/_list/Data
 * @mixes Controls/interface:IFilterChanged
 * @mixes Controls/interface:INavigation
 * @mixes Controls/interface:IHierarchy
 * @mixes Controls/interface:ISource
 * @extends UI/Base:Control
 *
 * @public
 * @author Герасимов А.М.
 */

/**
 * @name Controls/_list/Data#dataLoadCallback
 * @cfg {Function} Функция, которая вызывается каждый раз после загрузки данных из источника контрола.
 * Функцию можно использовать для изменения данных еще до того, как они будут отображены в контроле.
 * @remark
 * Функцию вызывается с двумя аргументами:
 * - items коллекция, загруженная из источника данных с типом {@link Types/collection:RecordSet}.
 * - direction направление загрузки данных (up/down), данный аргумент передаётся при подгрузке данных по скролу.
 * @example
 * <pre class="brush:html">
 *    <Controls.list:DataContainer dataLoadCallback="{{_myDataLoadCallback}}" />
 * </pre>
 * <pre class="brush:js">
 *    _myDataLoadCallback = function(items) {
 *       items.each(function(item) {
 *          item.set(field, value);
 *       });
 *    }
 * </pre>
 */

/*
 * Container component that provides a context field "dataOptions" with necessary data for child containers.
 *
 * Here you can see a <a href="/materials/Controls-demo/app/Controls-demo%2FFilterSearch%2FFilterSearch">demo</a>.
 *
 * @class Controls/_list/Data
 * @mixes Controls/interface:IFilterChanged
 * @mixes Controls/interface:INavigation
 * @mixes Controls/interface:IHierarchy
 * @mixes Controls/interface:ISource
 * @extends UI/Base:Control
 *
 * @public
 * @author Герасимов А.М.
 */

class Data extends Control<IDataOptions, IReceivedState>/** @lends Controls/_list/Data.prototype */{
   protected _template: TemplateFunction = template;
   private _isMounted: boolean;
   private _loading: boolean = false;
   private _itemsReadyCallback: Function = null;
   private _errorRegister: RegisterClass = null;
   private _sourceController: SourceController = null;
   private _source: ICrudPlus | ICrud & ICrudPlus & IData;
   private _dataOptionsContext: typeof ContextOptions;
   private _sourceControllerState: ISourceControllerState;
   private _root: TKey = null;

   private _items: RecordSet;
   protected _breadCrumbsItems: Path;
   protected _backButtonCaption: string;
   protected _breadCrumbsItemsWithoutBackButton: Path;
   protected _expandedItems: CrudEntityKey[];
   protected _shouldSetExpandedItemsOnUpdate: boolean;
   private _nodeHistoryId: string;

   private _filter: QueryWhereExpression<unknown>;

   _beforeMount(
       options: IDataOptions,
       context?: object,
       receivedState?: IReceivedState
   ): Promise<RecordSet|Error>|void {
      // TODO придумать как отказаться от этого свойства
      this._itemsReadyCallback = this._itemsReadyCallbackHandler.bind(this);
      this._notifyNavigationParamsChanged = this._notifyNavigationParamsChanged.bind(this);
      this._dataLoadCallback = this._dataLoadCallback.bind(this);

      if (!options.hasOwnProperty('sourceController')) {
         this._errorRegister = new RegisterClass({register: 'dataError'});
      }

      if (options.nodeHistoryId) {
         this._nodeHistoryId = options.nodeHistoryId;
      }
      if (options.expandedItems) {
         this._shouldSetExpandedItemsOnUpdate = true;
      }

      if (receivedState && options.source instanceof PrefetchProxy) {
         this._source = options.source.getOriginal();
      } else {
         this._source = options.source;
      }

      if (options.root !== undefined) {
         this._root = options.root;
      }

      this._sourceController = options.sourceController || this._getSourceController(options, receivedState);
      this._fixRootForMemorySource(options);

      const controllerState = this._sourceController.getState();

      // TODO filter надо распространять либо только по контексту, либо только по опциям. Щас ждут и так и так
      this._filter = controllerState.filter;
      this._dataOptionsContext = this._createContext(controllerState);

      if (options.sourceController) {
         // Если контроллер задан выше, чем появилось дерево, то надо установить в него expandedItems из опций
         if (options.expandedItems && !controllerState.expandedItems) {
            options.sourceController.setExpandedItems(options.expandedItems);
         }
         if (!controllerState.dataLoadCallback && options.dataLoadCallback) {
            options.dataLoadCallback(options.sourceController.getItems());
         }
         this._setItemsAndUpdateContext();
      } else if (receivedState?.items instanceof RecordSet && isNewEnvironment()) {
         if (options.source && options.dataLoadCallback) {
            options.dataLoadCallback(receivedState.items);
         }
         this._sourceController.setItems(receivedState.items);
         this._setItemsAndUpdateContext();
      } else if (options.source) {
         return this._sourceController
             .reload()
             .then((items) => {
                const state = this._sourceController.getState();
                this._items = state.items;
                this._updateBreadcrumbsFromSourceController();

                return {
                   items,
                   expandedItems: state.expandedItems
                };
             })
             .catch((error) => error)
             .finally(() => {
                this._updateContext(this._sourceController.getState());
             });
      } else {
         this._updateContext(controllerState);
      }
   }

   protected _afterMount(): void {
      this._isMounted = true;

      // После монтирования пошлем событие о изменении хлебных крошек для того,
      // что бы эксплорер заполнил свое состояние, которое завязано на хлебные крошки
      this._notifyAboutBreadcrumbsChanged();
   }

   protected _beforeUpdate(newOptions: IDataOptions): void|Promise<RecordSet|Error> {
      let updateResult;

      if (this._options.sourceController !== newOptions.sourceController) {
         this._sourceController = newOptions.sourceController;
      }

      if (this._sourceController) {
         if (newOptions.sourceController) {
            updateResult = this._updateWithSourceControllerInOptions(newOptions);
         } else {
            updateResult = this._updateWithoutSourceControllerInOptions(newOptions);
         }
      }

      return updateResult;
   }

   _updateWithoutSourceControllerInOptions(newOptions: IDataOptions): void|Promise<RecordSet|Error> {
      let filterChanged;
      let expandedItemsChanged;

      if (this._options.source !== newOptions.source) {
         this._source = newOptions.source;
      }

      if (this._options.root !== newOptions.root) {
         this._root = newOptions.root;
      }

      if (!isEqual(this._options.filter, newOptions.filter)) {
         this._filter = newOptions.filter;
         filterChanged = true;
      }

      if (this._shouldSetExpandedItemsOnUpdate && !isEqual(newOptions.expandedItems, this._options.expandedItems)) {
         expandedItemsChanged = true;
      }

      const isChanged = this._sourceController.updateOptions(this._getSourceControllerOptions(newOptions));

      if (isChanged) {
         return this._reload(this._options);
      } else if (filterChanged) {
         this._filter = this._sourceController.getFilter();
         this._updateContext(this._sourceController.getState());
      } else if (expandedItemsChanged) {
         if (this._options.nodeHistoryId) {
            this._sourceController.updateExpandedItemsInUserStorage();
         }
         this._updateContext(this._sourceController.getState());
      }
   }

   _updateWithSourceControllerInOptions(newOptions: IDataOptions): void {
      const sourceControllerState = this._sourceController.getState();

      if (!isEqual(sourceControllerState, this._sourceControllerState) && !this._sourceController.isLoading()) {
         this._filter = sourceControllerState.filter;
         this._items = sourceControllerState.items;
         if (this._shouldSetExpandedItemsOnUpdate) {
            this._expandedItems = sourceControllerState.expandedItems;
         }
         this._updateBreadcrumbsFromSourceController();
         this._updateContext(sourceControllerState);
      }
   }

   _setItemsAndUpdateContext(): void {
      const controllerState = this._sourceController.getState();
      // TODO items надо распространять либо только по контексту, либо только по опциям. Щас ждут и так и так
      this._items = controllerState.items;
      this._updateBreadcrumbsFromSourceController();
      this._updateContext(controllerState);
   }

   // Необходимо отслеживать оба события, т.к. не всегда оборачивают список в List:Container,
   // и dataContainer слушает напрямую список. Для нового грида это работает, а старый через модель сам
   // посылает события.
   _expandedItemsChanged(event: SyntheticEvent, expandedItems: CrudEntityKey[]): void {
      if (this._shouldSetExpandedItemsOnUpdate) {
         this._notify('expandedItemsChanged', [expandedItems], { bubbling: true });

      } else if (this._expandedItems !== expandedItems) {
         this._sourceController.setExpandedItems(expandedItems);
         if (this._options.nodeHistoryId) {
            this._sourceController.updateExpandedItemsInUserStorage();
         }
         this._updateContext(this._sourceController.getState());
      }
   }

   private _getSourceControllerOptions(options: IDataOptions, receivedState?: object): ISourceControllerOptions {
      if (receivedState?.expandedItems) {
         options.expandedItems = receivedState.expandedItems;
      }
      return {
         ...options,
         source: this._source,
         navigationParamsChangedCallback: this._notifyNavigationParamsChanged,
         filter: this._filter || options.filter,
         root: this._root,
         dataLoadCallback: this._dataLoadCallback
      } as ISourceControllerOptions;
   }

   private _getSourceController(options: IDataOptions, receivedState?: object): SourceController {
      const sourceController = new SourceController(this._getSourceControllerOptions(options, receivedState));
      sourceController.subscribe('rootChanged', this._rootChanged.bind(this));
      return sourceController;
   }

   private _notifyNavigationParamsChanged(params): void {
      if (this._isMounted) {
         this._notify('navigationParamsChanged', [params]);
      }
   }

   _beforeUnmount(): void {
      if (this._errorRegister) {
         this._errorRegister.destroy();
         this._errorRegister = null;
      }
      if (this._sourceController) {
         if (!this._options.sourceController) {
            this._sourceController.destroy();
         }
         this._sourceController = null;
     }
   }

   _registerHandler(event, registerType, component, callback, config): void {
      if (this._errorRegister) {
         this._errorRegister.register(event, registerType, component, callback, config);
      }
   }

   _unregisterHandler(event, registerType, component, config): void {
      if (this._errorRegister) {
         this._errorRegister.unregister(event, component, config);
      }
   }

   _itemsReadyCallbackHandler(items): void {
      if (this._items !== items) {
         this._items = this._sourceController.setItems(items);
         this._updateBreadcrumbsFromSourceController();

         this._dataOptionsContext.items = this._items;
         this._dataOptionsContext.updateConsumers();
      }

      if (this._options.itemsReadyCallback) {
         this._options.itemsReadyCallback(items);
      }
   }

   _filterChanged(event, filter): void {
      this._filter = filter;
   }

   _rootChanged(event, root): void {
      const rootChanged = this._root !== root;
      if (this._options.root === undefined) {
         this._root = root;
         // root - не реактивное состояние, надо позвать forceUpdate
         this._forceUpdate();
      }
      if (rootChanged) {
         this._notify('rootChanged', [root]);
      }
   }

   // TODO сейчас есть подписка на itemsChanged из поиска. По хорошему не должно быть.
   _itemsChanged(event: SyntheticEvent, items: RecordSet): void {
      this._sourceController.cancelLoading();
      this._items = this._sourceController.setItems(items);
      this._updateBreadcrumbsFromSourceController();
      this._updateContext(this._sourceController.getState());
      event.stopPropagation();
   }

   private _createContext(options?: ISourceControllerState): typeof ContextOptions {
      return new ContextOptions(options);
   }

   private _updateContext(sourceControllerState: ISourceControllerState): void {
      const curContext = this._dataOptionsContext;

      for (const i in sourceControllerState) {
         if (sourceControllerState.hasOwnProperty(i)) {
            curContext[i] = sourceControllerState[i];
         }
      }
      curContext.updateConsumers();
      this._sourceControllerState = sourceControllerState;
      this._expandedItems = sourceControllerState.expandedItems;
   }

   // https://online.sbis.ru/opendoc.html?guid=e5351550-2075-4550-b3e7-be0b83b59cb9
   // https://online.sbis.ru/opendoc.html?guid=c1dc4b23-57cb-42c8-934f-634262ec3957
   private _fixRootForMemorySource(options: IDataOptions): void {
      if (!options.hasOwnProperty('root') &&
          options.source &&
          Object.getPrototypeOf(options.source).constructor === Memory &&
          this._sourceController.getRoot() === null) {
         this._root = undefined;
         this._sourceController.setRoot(undefined);
      }
   }

   private _reload(options: IDataOptions): Promise<RecordSet|Error> {
      const currentRoot = this._sourceController.getRoot();
      this._fixRootForMemorySource(options);

      this._loading = true;
      return this._sourceController.reload()
          .then((reloadResult) => {
             if (!options.hasOwnProperty('root')) {
                this._sourceController.setRoot(currentRoot);
             }
             this._items = this._sourceController.getItems();
             this._updateBreadcrumbsFromSourceController();
             return reloadResult;
          })
          .catch((error) => {
             this._onDataError(
                 null,
                 {
                    error,
                    mode: dataSourceError.Mode.include
                 }
             );
             return error;
          })
          .finally(() => {
             const controllerState = this._sourceController.getState();
             this._updateContext(controllerState);
             this._loading = false;
          });
   }

   private _dataLoadCallback(items: RecordSet, direction: Direction): void {
      const rootChanged =
          this._sourceController.getRoot() !== undefined &&
          this._root !== this._sourceController.getRoot();
      const needUpdateStateAfterLoad = rootChanged || this._loading;

      if (rootChanged) {
         this._sourceController.setRoot(this._root);
      }

      if (needUpdateStateAfterLoad) {
         const controllerState = this._sourceController.getState();
         this._updateContext(controllerState);
      }

      if (this._options.dataLoadCallback) {
         this._options.dataLoadCallback(items, direction);
      }
   }

   /**
    * На основании текущего состояния sourceController обновляет информацию
    * для хлебных крошек. Так же стреляет событие об изменении данных
    * хлебных крошек.
    */
   private _updateBreadcrumbsFromSourceController(): void {
      const scState = this._sourceController.getState();

      this._breadCrumbsItems = scState.breadCrumbsItems;
      this._backButtonCaption = scState.backButtonCaption;
      this._breadCrumbsItemsWithoutBackButton = scState.breadCrumbsItemsWithoutBackButton;

      this._notifyAboutBreadcrumbsChanged();
   }

   private _notifyAboutBreadcrumbsChanged(): void {
      if (this._isMounted) {
         this._notify('breadCrumbsItemsChanged', [this._breadCrumbsItems]);
      }
   }

   _getChildContext(): object {
      return {
         dataOptions: this._dataOptionsContext
      };
   }

   _onDataError(event, errbackConfig): void {
      if (this._errorRegister) {
         this._errorRegister.start(errbackConfig);
      }
   }

   static getDefaultOptions(): object {
      return {
         filter: {}
      };
   }
}


Object.defineProperty(Data, 'defaultProps', {
   enumerable: true,
   configurable: true,

   get(): object {
      return Data.getDefaultOptions();
   }
});


/**
 * @name Controls/_list/Data#root
 * @cfg {Number|String} Идентификатор корневого узла.
 * Значение опции root добавляется в фильтре в поле {@link Controls/_interface/IHierarchy#parentProperty parentProperty}.
 * @example
 * <pre class="brush: js; highlight: [5]">
 * <Controls.list:DataContainer
 *     keyProperty="id"
 *     filter="{{_filter}}"
 *     source="{{_source}}"
 *     root="Сотрудники"/>
 * </pre>
 */

/**
 * @event Происходит при изменении корня иерархии.
 * @name Controls/_list/Data#rootChanged
 * @param event {eventObject} Дескриптор события.
 * @param root {String|Number} Идентификатор корневой записи.
 */

export default Data;
