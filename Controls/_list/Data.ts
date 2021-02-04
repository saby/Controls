import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import template = require('wml!Controls/_list/Data');
import * as isNewEnvironment from 'Core/helpers/isNewEnvironment';
import {RegisterClass} from 'Controls/event';
import {RecordSet} from 'Types/collection';
import {QueryWhereExpression, PrefetchProxy, ICrud, ICrudPlus, IData, Memory} from 'Types/source';
import {
   error as dataSourceError,
   ISourceControllerOptions,
   NewSourceController as SourceController
} from 'Controls/dataSource';
import {ISourceControllerState} from 'Controls/dataSource';
import {ContextOptions} from 'Controls/context';
import {ISourceOptions, IHierarchyOptions, IFilterOptions, INavigationOptions, ISortingOptions, TKey} from 'Controls/interface';
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
}

export interface IDataContextOptions extends ISourceOptions,
    INavigationOptions<unknown>,
    IFilterOptions,
    ISortingOptions {
   keyProperty: string;
   items: RecordSet;
}
/**
 * Контрол-контейнер, предоставляющий контекстное поле "dataOptions" с необходимыми данными для дочерних контейнеров.
 *
 * @remark
 * Поле контекста "dataOptions" ожидает Controls/list:Container, который лежит внутри.
 *
 * Полезные ссылки:
 * * {@link /materials/Controls-demo/app/Controls-demo%2FFilterSearch%2FFilterSearch демо-пример}
 * * {@link https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/aliases/_list.less переменные тем оформления}
 * * {@link Controls/list:Container}
 *
 * @class Controls/_list/Data
 * @mixes Controls/_interface/IFilterChanged
 * @mixes Controls/_interface/INavigation
 * @mixes Controls/_interface/IHierarchy
 * @mixes Controls/_interface/ISource
 * @extends UI/Base:Control
 *
 * @public
 * @author Герасимов А.М.
 */

/*
 * Container component that provides a context field "dataOptions" with necessary data for child containers.
 *
 * Here you can see a <a href="/materials/Controls-demo/app/Controls-demo%2FFilterSearch%2FFilterSearch">demo</a>.
 *
 * @class Controls/_list/Data
 * @mixes Controls/_interface/IFilterChanged
 * @mixes Controls/_interface/INavigation
 * @mixes Controls/_interface/IHierarchy
 * @mixes Controls/_interface/ISource
 * @extends UI/Base:Control
 *
 * @public
 * @author Герасимов А.М.
 */

class Data extends Control<IDataOptions>/** @lends Controls/_list/Data.prototype */{
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
   private _filter: QueryWhereExpression<unknown>;

   _beforeMount(
       options: IDataOptions,
       context?: object,
       receivedState?: RecordSet|Error
   ): Promise<RecordSet|Error>|void {
      // TODO придумать как отказаться от этого свойства
      this._itemsReadyCallback = this._itemsReadyCallbackHandler.bind(this);
      this._notifyNavigationParamsChanged = this._notifyNavigationParamsChanged.bind(this);
      this._dataLoadCallback = this._dataLoadCallback.bind(this);

      if (!options.hasOwnProperty('sourceController')) {
         this._errorRegister = new RegisterClass({register: 'dataError'});
      }

      if (receivedState && options.source instanceof PrefetchProxy) {
         this._source = options.source.getOriginal();
      } else {
         this._source = options.source;
      }
      if (options.root !== undefined) {
         this._root = options.root;
      }
      this._sourceController =
          options.sourceController ||
          new SourceController(this._getSourceControllerOptions(options));
      this._fixRootForMemorySource(options);

      let controllerState = this._sourceController.getState();
      // TODO filter надо распространять либо только по контексту, либо только по опциям. Щас ждут и так и так
      this._filter = controllerState.filter;
      this._dataOptionsContext = this._createContext(controllerState);

      if (options.sourceController) {
         if (!controllerState.dataLoadCallback && options.dataLoadCallback) {
            options.dataLoadCallback(options.sourceController.getItems());
         }
         this._setItemsAndUpdateContext();
      } else if (receivedState instanceof RecordSet && isNewEnvironment()) {
         if (options.source && options.dataLoadCallback) {
            options.dataLoadCallback(receivedState);
         }
         this._sourceController.setItems(receivedState);
         this._setItemsAndUpdateContext();
      } else if (options.source) {
         return this._sourceController
             .reload()
             .then((items) => {
                this._items = this._sourceController.setItems(items as RecordSet);
                return items;
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

      const isChanged = this._sourceController.updateOptions(this._getSourceControllerOptions(newOptions));

      if (isChanged) {
         return this._reload(this._options);
      } else if (filterChanged) {
         this._filter = this._sourceController.getFilter();
         this._updateContext(this._sourceController.getState());
      }
   }

   _updateWithSourceControllerInOptions(newOptions: IDataOptions): void {
      const sourceControllerState = this._sourceController.getState();

      if (!isEqual(sourceControllerState, this._sourceControllerState) && !this._sourceController.isLoading()) {
         this._filter = sourceControllerState.filter;
         this._updateContext(sourceControllerState);
      }
   }

   _setItemsAndUpdateContext(): void {
      const controllerState = this._sourceController.getState();
      // TODO items надо распространять либо только по контексту, либо только по опциям. Щас ждут и так и так
      this._items = controllerState.items;
      this._updateContext(controllerState);
   }

   private _getSourceControllerOptions(options: IDataOptions): ISourceControllerOptions {
      return {
         ...options,
         source: this._source,
         navigationParamsChangedCallback: this._notifyNavigationParamsChanged,
         filter: this._filter || options.filter,
         root: this._root,
         dataLoadCallback: this._dataLoadCallback
      } as ISourceControllerOptions;
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
      if (this._options.root === undefined) {
         this._root = root;
         // root - не реактивное состояние, надо позвать forceUpdate
         this._forceUpdate();
      }
      this._notify('rootChanged', [root]);
   }

   // TODO сейчас есть подписка на itemsChanged из поиска. По хорошему не должно быть.
   _itemsChanged(event: SyntheticEvent, items: RecordSet): void {
      this._sourceController.cancelLoading();
      this._items = this._sourceController.setItems(items);
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
   }

   // https://online.sbis.ru/opendoc.html?guid=e5351550-2075-4550-b3e7-be0b83b59cb9
   // https://online.sbis.ru/opendoc.html?guid=c1dc4b23-57cb-42c8-934f-634262ec3957
   private _fixRootForMemorySource(options: IDataOptions): void {
      if (!options.hasOwnProperty('root') &&
          options.source &&
          Object.getPrototypeOf(options.source).constructor === Memory &&
          this._sourceController.getRoot() === null) {
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
             this._loading = false;
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
          });
   }

   private _dataLoadCallback(items: RecordSet, direction): void {
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
