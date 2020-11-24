import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import * as template from 'wml!Controls/_suggest/_InputController/_InputController';
import {descriptor, Model, CancelablePromise} from 'Types/entity';
import {getSwitcherStrFromData} from 'Controls/search';
import {isEqual} from 'Types/object';
import {SyntheticEvent} from 'Vdom/Vdom';
import {IStackPopupOptions, Stack as StackOpener} from 'Controls/popup';
import {Controller as SearchController, SearchResolver as SearchResolverController, ISearchResolverOptions} from 'Controls/search';
import {NewSourceController as SourceController, ISourceControllerOptions} from 'Controls/dataSource';
import {RecordSet} from 'Types/collection';
import {__ContentLayer, __PopupLayer} from 'Controls/suggestPopup';
import {
   IFilterOptions,
   INavigationOptions,
   INavigationSourceConfig,
   ISearchOptions,
   ISortingOptions,
   ISourceOptions,
   IValidationStatusOptions
} from 'Controls/interface';
import {PrefetchProxy, QueryWhereExpression} from 'Types/source';
import ISuggest, {IEmptyTemplateProp, ISuggestFooterTemplate, ISuggestTemplateProp} from 'Controls/interface/ISuggest';
import {IValueOptions} from 'Controls/input';
import ModuleLoader = require('Controls/Container/Async/ModuleLoader');
import { error as dataSourceError } from 'Controls/dataSource';

import Env = require('Env/Env');
import mStubs = require('Core/moduleStubs');
import clone = require('Core/core-clone');
import Deferred = require('Core/Deferred');
import {TVisibility} from 'Controls/marker';
import {DependencyTimer} from 'Controls/popup';

const CURRENT_TAB_META_FIELD = 'tabsSelectedKey';
const HISTORY_KEYS_FIELD = 'historyKeys';

const moduleLoader = new ModuleLoader();

/* if suggest is opened and marked key from suggestions list was changed,
   we should select this item on enter keydown, otherwise keydown event should be propagated as default. */
const ENTER_KEY = Env.constants.key.enter;

const PROCESSED_KEYDOWN_KEYS = {

   /* hot keys that should processed on input */
   INPUT: [Env.constants.key.esc],

   /* hot keys, that list (suggestList) will process,
   do not respond to the press of these keys when suggest is opened */
   SUGGESTIONS_LIST: [Env.constants.key.down, Env.constants.key.up, ENTER_KEY]
};

const DEPS = [
   'Controls/suggestPopup:_ListWrapper',
   'Controls/scroll:Container',
   'Controls/search:Misspell',
   'Controls/LoadingIndicator'
];

type Key = string | number | null;
type TState = boolean | null;
type HistoryKeys = string[] | number[] | null;
type CancelableError = Error & { canceled?: boolean };

interface IInputControllerOptions extends IControlOptions, IFilterOptions, ISearchOptions,
   IValidationStatusOptions, ISuggest, ISourceOptions, INavigationOptions<INavigationSourceConfig>,
   ISortingOptions, IValueOptions<string> {
   suggestState: boolean;
   autoDropDown?: boolean;
   searchErrorCallback?: Function;
   searchEndCallback?: Function;
   searchStartCallback?: Function;
   emptyTemplate?: IEmptyTemplateProp;
   historyId?: string | null;
   layerName: string;
   suggestTemplate: ISuggestTemplateProp | null;
   footerTemplate?: ISuggestFooterTemplate;
   trim?: boolean; // TODO: searchValueTrim ???
   dataLoadCallback?: Function;
}

type TSuggestDirection = 'up' | 'down';

/**
 * Контейнер для поля ввода с автодополнением.
 *
 * @class Controls/_suggest/_InputController
 * @extends Core/Control
 * @mixes Controls/_interface/ISearch
 * @mixes Controls/_interface/ISource
 * @mixes Controls/_interface/IFilterChanged
 * @mixes Controls/_suggest/ISuggest
 * @mixes Controls/_interface/INavigation
 * 
 * @private
 */

/*
 * Container for Input's that using suggest.
 *
 * @class Controls/_suggest/_InputController
 * @extends Core/Control
 * @mixes Controls/_interface/ISearch
 * @mixes Controls/_interface/ISource
 * @mixes Controls/_interface/IFilterChanged
 * @mixes Controls/_suggest/ISuggest
 * @mixes Controls/_interface/INavigation
 * 
 * @private
 */
export default class InputContainer extends Control<IInputControllerOptions> {
   protected _template: TemplateFunction = template;

   private _searchValue: string = '';
   private _filter: QueryWhereExpression<unknown> = null;
   private _tabsSelectedKey: Key = null;
   private _historyKeys: HistoryKeys = null;
   private _searchResult: RecordSet = null;
   private _dependenciesDeferred: Deferred = null;
   private _historyLoad: Deferred = null;
   private _historyServiceLoad: Deferred = null;
   private _showContent: boolean = false;
   private _inputActive: boolean = false;
   private _suggestMarkedKey: Key = null;
   private _misspellingCaption: string = null;
   private _suggestDirection: TSuggestDirection = null;
   private _markerVisibility: TVisibility = 'onactivated';
   private _suggestOpened: boolean = null;

   private _errorController: dataSourceError.Controller = null;
   private _errorConfig: dataSourceError.ViewConfig | void = null;
   private _pendingErrorConfig: dataSourceError.ViewConfig | void = null;

   private _searchResolverController: SearchResolverController = null;
   private _sourceController: SourceController = null;
   private _searchController: SearchController = null;
   private _searchLibraryLoader: CancelablePromise<typeof import('Controls/search')> = null;

   private _dependenciesTimer: DependencyTimer = null;

   /**
    * three state flag
    * null - loading is not initiated
    * true - loading data now
    * false - data loading ended
    */
   private _loading: TState = null;

   private _moreCount: number;
   private _input: Control;
   private _emptyTemplate: IEmptyTemplateProp | string;

   protected _children: {
      layerOpener: typeof __ContentLayer | typeof __PopupLayer;
      indicator: any;
      inputKeydown: any;
   };

   private _suggestStateNotify(state: boolean, options: IInputControllerOptions = this._options): void {
      if (options.suggestState !== state) {
         this._notify('suggestStateChanged', [state]);
      } else {
         this._forceUpdate();
      }
   }

   private _setCloseState(): void {
      this._showContent = false;
      this._loading = null;
      this._errorConfig = null;
      this._pendingErrorConfig = null;

      if (this._sourceController) {
         this._sourceController.destroy();
         this._sourceController = null;
      }
      if (this._searchResolverController) {
         this._searchResolverController.clearTimer();
      }
      if (this._searchController) {
         this._searchController = null;
      }
      this._searchResult = null;

      // when closing popup we reset the cache with recent keys
      this._historyLoad = null;
      this._historyKeys = null;
      this._suggestDirection = null;
      this._setMisspellingCaption(null);
      this._markerVisibility = 'onactivated';
   }

   private _setSuggestMarkedKey(key: Key): void {
      const currentMarkedKey = this._suggestMarkedKey;
      this._suggestMarkedKey = key;

      if (currentMarkedKey !== this._suggestMarkedKey) {
         this._notify('suggestMarkedKeyChanged', [key]);
      }
   }

   private _close(options?: IInputControllerOptions): void {
      this._setCloseState();
      this._suggestStateNotify(false, options);

      if (this._dependenciesDeferred && !this._dependenciesDeferred.isReady()) {
         this._dependenciesDeferred.cancel();
         this._dependenciesDeferred = null;
      }
   }

   private _open(): void {
      this._loadDependencies().addCallback(() => {
         // focus can be moved out while dependencies loading
         if (this._inputActive) {
            this._suggestStateNotify(true);
         }
      });
   }

   private _closePopup(): void {
      const layerOpener = this._children.layerOpener;
      if (layerOpener) { layerOpener.close(); }
   }

   private _openWithHistory(): void {
      const openSuggestIfNeeded = (): void => {
         if (this._historyKeys.length || this._options.autoDropDown) {
            this._open();
         }
      };

      if (!this._historyKeys) {
         this._loadHistoryKeys().then(() => openSuggestIfNeeded());
      } else {
         this._setFilter(this._options.filter, this._options);
         openSuggestIfNeeded();
      }
   }

   private _loadHistoryKeys(): Promise<HistoryKeys> {
      return this._getRecentKeys().then((keys: string[]) => {
         const filter: QueryWhereExpression<unknown> = clone(this._options.filter || {});

         this._historyKeys = keys || [];

         if (this._historyKeys.length) {
            filter[HISTORY_KEYS_FIELD] = this._historyKeys;
         }

         this._setFilter(filter, this._options);

         return this._historyKeys;
      });
   }

   private _suggestDirectionChangedCallback(direction: TSuggestDirection): void {
      this._suggestDirection = direction;
      if (direction === 'up') {
         this._setItems(this._sourceController.getItems());
      }
   }

   private _inputActivated(): Promise<void | RecordSet> {

      // toDO Временный костыль, в .320 убрать, должно исправиться с этой ошибкой
      // https://online.sbis.ru/opendoc.html?guid=d0f7513f-7fc8-47f8-8147-8535d69b99d6
      if ((this._options.autoDropDown || this._options.historyId) && !this._options.readOnly
         && !this._getActiveElement().classList.contains('controls-Lookup__icon')) {

         if (!this._options.suggestState &&
            this._options.source &&
            !this._getSourceController().isLoading() && (!this._historyLoad || this._historyLoad.isReady())) {

            if (this._options.historyId) {

               return this._loadHistoryKeys().then(() => this._performLoad(this._options, true))
                  .catch((error) => this._searchErrback(error));
            }

            return this._performLoad(this._options).catch((error) => {
               this._searchErrback(error);
            }).then();
         }
      }
      return Promise.resolve();
   }

   private _setItems(recordSet: RecordSet): void {
      if (this._suggestDirection === 'up') {
         this._sourceController.setItems(this._reverseData(recordSet));
      } else {
         this._sourceController.setItems(recordSet);
      }
   }

   private _getActiveElement(): Element {
      return document.activeElement;
   }

   private _hideIndicator(): void {
      if (this._children.indicator) {
         this._children.indicator.hide();
      }
   }
   private _searchErrback(error: CancelableError & {
      isCancelled?: boolean;
   }): void {
      // aborting of the search may be caused before the search start, because of the delay before searching
      if (this._loading !== null) {
         this._loading = false;
         this._forceUpdate();
      }
      if (!error?.canceled && !error?.isCancelled ) {
         this._hideIndicator();

         this.getErrorController().process({
            error,
            theme: this._options.theme,
            mode: dataSourceError.Mode.include
         }).then((errorConfig: dataSourceError.ViewConfig|void): dataSourceError.ViewConfig|void => {
            this._pendingErrorConfig = errorConfig;
            this._open();
         });
      }
   }

   // TODO remove?
   private _isValueLengthLongerThenMinSearchLength(value: string, options: IInputControllerOptions): boolean {
     return value && value.length >= options.minSearchLength;
   }

   private _shouldShowSuggest(searchResult: RecordSet): boolean {
      const hasItems = searchResult && searchResult.getCount();
      const isSuggestHasTabs = this._tabsSelectedKey !== null;

      /* do not suggest if:
       * 1) loaded list is empty and empty template option is doesn't set
       * 2) loaded list is empty and list loaded from history, expect that the list is loaded from history, because input field is empty and historyId options is set  */
      return !!(hasItems ||
         (!this._options.historyId || this._searchValue || isSuggestHasTabs) &&
         this._options.emptyTemplate &&
         searchResult) && !!this._options.suggestTemplate;
   }

   private _processResultData(data: RecordSet): void {
      this._searchResult = data;

      if (data) {
         const metaData = data && data.getMetaData();
         const result = metaData.results;

         this._setMisspellingCaption(getSwitcherStrFromData(data));

         if (!data.getCount()) {
            this._setSuggestMarkedKey(null);
         }

         if (result && result.get(CURRENT_TAB_META_FIELD)) {
            this._tabsSelectedKey = result.get(CURRENT_TAB_META_FIELD);
         }

         if (this._searchValue && this._getSourceController().hasMoreData('down')
            && typeof metaData.more === 'number') {
            this._moreCount = metaData.more - data.getCount();
         } else {
            this._moreCount = undefined;
         }
      }
      if (!this._shouldShowSuggest(data)) {
         this._close();
      }
   }

   private _prepareFilter(filter: QueryWhereExpression<unknown>,
                          searchParam: string,
                          searchValue: string,
                          minSearchLength: number,
                          tabId: Key,
                          historyKeys: Key[]): QueryWhereExpression<unknown> {
      const preparedFilter = clone(filter) || {};
      if (tabId) {
         preparedFilter.currentTab = tabId;
      }
      if (searchValue.length < minSearchLength && historyKeys && historyKeys.length) {
         preparedFilter[HISTORY_KEYS_FIELD] = historyKeys;
      }
      preparedFilter[searchParam] = searchValue;

      return preparedFilter;
   }

   private _setFilter(filter: QueryWhereExpression<unknown>,
                      options: IInputControllerOptions, tabId?: Key): void {
      this._filter = this._prepareFilter(filter,
         options.searchParam ?? this._options.searchParam,
         this._searchValue,
         options.minSearchLength,
         tabId ?? this._tabsSelectedKey,
         this._historyKeys
      );
      this._getSourceController(options).setFilter(this._filter);
   }

   private _getEmptyTemplate(emptyTemplate: IEmptyTemplateProp): IEmptyTemplateProp | string {
      return emptyTemplate && emptyTemplate.templateName ? emptyTemplate.templateName : emptyTemplate;
   }

   private _reverseData(rs?: RecordSet): RecordSet {
      const sourceController: SourceController = this._sourceController;
      const recordSet: RecordSet = rs ?? sourceController.getItems();

      if (recordSet) {
         for (let i = 0; i < recordSet.getCount(); i++) {
            recordSet.move(0, recordSet.getCount() - 1 - i);
         }
      }

      return recordSet;
   }

   private _shouldSearch(value: string): boolean {
      return this._inputActive && this._isValueLengthLongerThenMinSearchLength(value, this._options);
   }

   private _updateSuggestState(): boolean {
      const shouldSearch = this._shouldSearch(this._searchValue);
      const shouldShow = this._shouldShowSuggest(this._getSourceController().getItems());
      let state = false;

      if (this._options.historyId && !shouldSearch && !this._options.suggestState) {
         this._openWithHistory();
         state = true;
      } else if ((shouldSearch || this._options.autoDropDown && !this._options.suggestState)
         && shouldShow) {
         this._setFilter(this._options.filter, this._options);
         this._open();
         state = true;
      } else if (!this._options.autoDropDown && !shouldShow) {
         // autoDropDown - close only on Esc key or deactivate
         this._close();
      }

      return state;
   }

   private _getTemplatesToLoad(options: IInputControllerOptions): string[] {
      const templatesToCheck = ['footerTemplate', 'suggestTemplate', 'emptyTemplate'];
      const templatesToLoad = [];
      templatesToCheck.forEach((tpl) => {
         if (options[tpl] && options[tpl].templateName && !moduleLoader.isLoaded(options[tpl].templateName)) {
            templatesToLoad.push(options[tpl].templateName);
         }
      });
      return templatesToLoad;
   }

   private _loadDependencies(options?: IInputControllerOptions): Deferred {
      const checkedOptions = options ?? this._options;

      const templatesToLoad = this._getTemplatesToLoad(checkedOptions);
      if (!this._dependenciesDeferred || templatesToLoad.length) {
         this._dependenciesDeferred = mStubs.require(DEPS.concat(templatesToLoad.concat([checkedOptions.layerName])));
      }
      return this._dependenciesDeferred;
   }

   private _setMisspellingCaption(value: string): void {
      this._misspellingCaption = value;
   }

   private _getHistoryService(): Deferred {
      if (!this._historyServiceLoad) {
         this._historyServiceLoad = new Deferred();
         import('Controls/suggestPopup').then(({LoadService}) => {
            LoadService({
               historyId: this._options.historyId
            }).addCallback((result) => {
               this._historyServiceLoad.callback(result);
               return result;
            });
         });
      }
      return this._historyServiceLoad;
   }

   private _getRecentKeys(): Deffered {
      if (this._historyLoad) {
         return this._historyLoad;
      }

      this._historyLoad = new Deferred();

      // toDO Пока что делаем лишний вызов на бл, ждем доработки хелпера от Шубина
      this._getHistoryService().addCallback((historyService) => {
         historyService.query().addCallback((dataSet) => {
            if (this._historyLoad) {
               const keys = [];
               dataSet.getRow().get('recent').each((item) => {
                  keys.push(item.get('ObjectId'));
               });
               this._historyLoad.callback(keys);
            }
         }).addErrback(() => {
            if (this._historyLoad) {
               this._historyLoad.callback([]);
            }
         });

         return historyService;
      });

      return this._historyLoad;
   }

   private _openSelector(templateOptions: object): void {
      if (!this._notify('showSelector', [templateOptions])) {
         // loading showAll templates_historyLoad
         import('Controls/suggestPopup').then(() => {
            StackOpener.openPopup(this._getSelectorOptions(templateOptions));
         });
      }
   }

   private _isInvalidValidationStatus(options: IInputControllerOptions): boolean {
      return options.validationStatus === 'invalid' ||
         options.validationStatus === 'invalidAccent';
   }

   private _getSelectorOptions(templateOptions: object): IStackPopupOptions {
      return { ...{
            opener: this,
            template: 'Controls/suggestPopup:Dialog',
            closeOnOutsideClick: true,
            eventHandlers: {
               onResult: this._select.bind(this)
            }
         }, ...templateOptions};
   }

   private _getTemplateOptions(filter: QueryWhereExpression<unknown>, searchValue: string): IStackPopupOptions {
      delete filter[HISTORY_KEYS_FIELD];
      return {
         templateOptions: {
            filter,
            searchValue,
            template: 'Controls/suggestPopup:_ListWrapper',
            templateOptions: {
               filter,
               templateName: this._options.suggestTemplate.templateName,
               templateOptions: this._options.suggestTemplate.templateOptions,
               searchEndCallback: this._loadEnd,
               searchStartCallback: this._loadStart,
               searchErrback: this._searchErrback,
               emptyTemplate: this._emptyTemplate,
               source: this._options.source,
               minSearchLength: this._options.autoDropDown ? 0 : this._options.minSearchLength,
               sorting: this._options.sorting,
               searchParam: this._options.searchParam,
               navigation: this._options.navigation,
               tabsSelectedKey: this._tabsSelectedKey,
               layerName: this._options.layerName,
               tabsSelectedKeyChangedCallback: this._tabsSelectedKeyChanged,
               searchValue,
               eventHandlers: {
                  onResult: this._select.bind(this)
               }
            }
         }
      };
   }

   protected _beforeMount(options: IInputControllerOptions): void {
      this._loadStart = this._loadStart.bind(this);
      this._loadEnd = this._loadEnd.bind(this);
      this._searchErrback = this._searchErrback.bind(this);
      this._tabsSelectedKeyChanged = this._tabsSelectedKeyChanged.bind(this);
      this._suggestDirectionChangedCallback = this._suggestDirectionChangedCallback.bind(this);
      this._emptyTemplate = this._getEmptyTemplate(options.emptyTemplate);
      this._searchValue = options.value || '';
      this._suggestOpened = options.suggestState;
      this._setFilter(options.filter, options);

      if (this._searchValue && options.suggestState) {
         this._resolveSearch(this._searchValue, options);
      }
   }

   protected _beforeUnmount(): void {
      if (this._searchResolverController) {
         this._searchResolverController.clearTimer();
      }
      if (this._dependenciesDeferred && !this._dependenciesDeferred.isReady()) {
         this._dependenciesDeferred.cancel();
         this._dependenciesDeferred = null;
      }
      if (this._sourceController) {
         this._sourceController.destroy();
         this._sourceController = null;
      }
      if (this._searchLibraryLoader) {
         this._searchLibraryLoader.cancel();
         this._searchLibraryLoader = null;
      }
      this._searchResult = null;
      this._loadStart = null;
      this._loadEnd = null;
      this._searchErrback = null;
   }

   protected _beforeUpdate(newOptions: IInputControllerOptions): void {
      const valueChanged = this._options.value !== newOptions.value;
      const valueCleared = valueChanged && !newOptions.value && typeof newOptions.value === 'string';
      const needSearchOnValueChanged = valueChanged &&
         this._isValueLengthLongerThenMinSearchLength(newOptions.value, newOptions);
      const emptyTemplateChanged = !isEqual(this._options.emptyTemplate, newOptions.emptyTemplate);
      const footerTemplateChanged = !isEqual(this._options.footerTemplate, newOptions.footerTemplate);
      const filterChanged = !isEqual(this._options.filter, newOptions.filter);
      const sourceChanged = this._options.source !== newOptions.source;
      const needUpdateSourceController = sourceChanged ||
                                         this._options.navigation !== newOptions.navigation ||
                                         this._options.sorting !== newOptions.sorting ||
                                         filterChanged;

      if (needUpdateSourceController && this._sourceController) {
         this._sourceController.updateOptions(this._getSourceControllerOptions(newOptions));
      }

      if (newOptions.suggestState !== this._options.suggestState) {
         if (newOptions.suggestState) {
            if (!this._searchResult && !this._errorConfig && !this._pendingErrorConfig) {
               this._loadDependencies(newOptions).addCallback(() => {
                  this._resolveLoad(this._searchValue, newOptions).then(() => {
                     this._suggestOpened = newOptions.suggestState;
                  }).catch((error) => {
                     this._searchErrback(error);
                  });
               });
            } else {
               this._suggestOpened = newOptions.suggestState;
            }
         } else {
            this._suggestOpened = newOptions.suggestState;
            this._setCloseState();
            this._setSuggestMarkedKey(null);
         }
      }

      if ((needSearchOnValueChanged || valueCleared) && this._searchValue !== newOptions.value) {
         this._searchValue = newOptions.value;

         if (this._options.suggestState && newOptions.suggestState) {
            this._updateSuggestState();

            if (this._showContent) {
               this._setFilterAndLoad(newOptions.filter, newOptions);
            }
         }
      }

      if (needSearchOnValueChanged || valueCleared || filterChanged) {
         this._setFilter(newOptions.filter, newOptions);
      }
      if (filterChanged && (this._showContent || this._sourceController?.isLoading())) {
         this._resolveLoad();
      }

      if (emptyTemplateChanged) {
         this._emptyTemplate = this._getEmptyTemplate(newOptions.emptyTemplate);
      }

      if ((emptyTemplateChanged || footerTemplateChanged) && newOptions.suggestState ) {
         this._loadDependencies(newOptions);
      }

      if (this._options.searchDelay !== newOptions.searchDelay && this._searchResolverController) {
         this._searchResolverController.updateOptions(
             this._getSearchResolverOptions(newOptions)
         );
      }

      if (this._options.validationStatus !== newOptions.validationStatus &&
         this._isInvalidValidationStatus(newOptions) && !this._isInvalidValidationStatus(this._options)) {
         this._close(newOptions);
      }
   }

   protected _afterUpdate(): void {
      if (this._showContent && this._pendingErrorConfig) {
         this._errorConfig = this._pendingErrorConfig;
         this._pendingErrorConfig = null;
      }
      if (this._options.suggestState && !this._loading && !this._showContent) {
         this._showContent = true;
      }
   }

   // TODO Нужно удалить после https://online.sbis.ru/opendoc.html?guid=403837db-4075-4080-8317-5a37fa71b64a
   inputReadyHandler(_: Event, input: Control): void {
      this._input = input;
   }

   protected _closeHandler(event: SyntheticEvent): void {
      event.stopPropagation();
      this._close();
   }

   protected _changeValueHandler(event: SyntheticEvent, value: string): Promise<void> {
      this._searchValue = value;
      this._setFilter(this._filter, this._options, this._tabsSelectedKey);
      /* preload suggest dependencies on value changed */
      this._loadDependencies();

      return this._resolveSearch(value);
   }

   private _resolveSearch(value: string, options?: IInputControllerOptions): Promise<void> {
      if (this._searchResolverController) {
         this._searchResolverController.resolve(value);
         return Promise.resolve();
      } else {
         return this._getSearchResolver(options)
             .then((searchResolver) => searchResolver.resolve(value))
             .catch((error) => error);
      }
   }

   private _getSearchLibrary(): Promise<typeof import('Controls/search')> {
      if (!this._searchLibraryLoader) {
         this._searchLibraryLoader = new CancelablePromise(import('Controls/search'));
      }
      return this._searchLibraryLoader.promise;
   }

   private _getSearchResolver(options?: IInputControllerOptions): Promise<SearchResolverController> {
      let result;

      if (!this._searchResolverController) {
         result = this._getSearchLibrary()
             .then((searchLibrary) => {
                this._searchResolverController = new searchLibrary.SearchResolver(
                    this._getSearchResolverOptions(options ?? this._options)
                );
                return this._searchResolverController;
             })
             .catch((error) => error);
      } else {
         result = Promise.resolve(this._searchResolverController);
      }

      return result;
   }

   private async _setFilterAndLoad(filter: QueryWhereExpression<unknown>,
                                   options: IInputControllerOptions,
                                   tabId?: Key): Promise<RecordSet> {
      this._setFilter(filter, options, tabId);
      return this._resolveLoad();
   }

   private async _resolveLoad(value?: string, options?: IInputControllerOptions): Promise<RecordSet> {
      this._loadStart();
      if (value) {
         this._searchValue = value;
         return (await this._getSearchController()).search(value).then((recordSet) => {
            this._loadEnd(recordSet);

            if (recordSet instanceof RecordSet && this._shouldShowSuggest(recordSet)) {
               this._setItems(recordSet);
               if (this._options.dataLoadCallback) {
                  this._options.dataLoadCallback(recordSet);
               }
               this._setFilter(this._options.filter, this._options);
               this._open();
               this._markerVisibility = 'visible';
            }

            return recordSet;
         }, (error) => {
            this._loadEnd();
            return error;
         });
      } else {
         return this._performLoad(options);
      }
   }

   private _performLoad(options?: IInputControllerOptions): Promise<RecordSet> {
      const scopeOptions = options ?? this._options;

      return this._getSourceController(scopeOptions).load().then((recordSet) => {
         if (recordSet instanceof RecordSet && this._shouldShowSuggest(recordSet)) {
            this._setItems(recordSet);
            if (scopeOptions.dataLoadCallback) {
               scopeOptions.dataLoadCallback(recordSet);
            }
            this._loadEnd(recordSet);

            this._updateSuggestState();

            return recordSet as RecordSet;
         }
      });
   }

   private _getSearchResolverOptions(options: IInputControllerOptions): ISearchResolverOptions {
      return {
         delayTime: options.searchDelay,
         minSearchLength: options.minSearchLength,
         searchCallback: (validatedValue: string) => this._resolveLoad(validatedValue),
         searchResetCallback: this._searchResetCallback.bind(this)
      };
   }

   private async _searchResetCallback(): Promise<void> {
      const searchController = await this._getSearchController();

      if (this._updateSuggestState() || this._options.autoDropDown) {
         const recordSet = await searchController.reset();
         this._setItems(recordSet);
      }
   }

   protected async _getSearchController(): Promise<SearchController> {
      if (!this._searchController) {
         return this._getSearchLibrary().then((result) => {
            this._searchController = new result.ControllerClass({
               sourceController: this._getSourceController(),
               minSearchLength: this._options.minSearchLength,
               searchDelay: this._options.searchDelay as number,
               searchParam: this._options.searchParam,
               searchValueTrim: this._options.trim
            });
            return this._searchController;
         });
      }
      return this._searchController;
   }

   protected _getSourceController(options?: IInputControllerOptions): SourceController {
      if (!this._sourceController) {
         this._sourceController = new SourceController(this._getSourceControllerOptions(options));
      }
      return this._sourceController;
   }

   private _getSourceControllerOptions(options: IInputControllerOptions = this._options): ISourceControllerOptions {
      let source;
      if (options.source instanceof PrefetchProxy) {
         source = options.source.getOriginal();
      } else {
         source = options.source;
      }

      return {
         dataLoadErrback: (error) => this._searchErrback(error),
         filter: this._filter,
         keyProperty: options.keyProperty,
         navigation: options.navigation,
         sorting: options.sorting,
         source,
         parentProperty: options.parentProperty,
         root: options.root
      };
   }

   protected _inputActivatedHandler(event: SyntheticEvent): Promise<void> {
      this._inputActive = true;
      if (!this._isInvalidValidationStatus(this._options)) {
         return this._inputActivated();
      }
      return Promise.resolve();
   }

   protected _inputDeactivated(): void {
      this._inputActive = false;
   }

   protected _inputClicked(): Promise<void> {
      this._inputActive = true;
      if (!this._options.suggestState) {
         return this._inputActivated();
      }
      return Promise.resolve();
   }

   protected _inputMouseEnterHandler(event: SyntheticEvent): void {
      if (this._options.autoDropDown) {
         if (!this._options.readOnly) {
            if (!this._dependenciesTimer) {
               this._dependenciesTimer = new DependencyTimer();
            }
            this._dependenciesTimer.start(this._loadDependencies.bind(this));
         }

         if (!this._filter) {
            this._resolveLoad();
         }
      }
   }

   protected _inputMouseLeaveHandler(): void {
      this._dependenciesTimer?.stop();
   }

   protected async _tabsSelectedKeyChanged(tabId: Key): Promise<void> {
      this._setSuggestMarkedKey(null);

      // change only filter for query, tabSelectedKey will be changed after processing query result,
      // otherwise interface will blink
      if (this._tabsSelectedKey !== tabId) {
         await this._setFilterAndLoad(this._options.filter, this._options, tabId);
      }

      // move focus from tabs to input, after change tab
      this.activate();

      /* because activate() does not call _forceUpdate and _tabsSelectedKeyChanged is callback function,
         we should call _forceUpdate, otherwise child controls (like suggestionsList) does not get new filter */
      this._forceUpdate();
   }

   protected _select(event: SyntheticEvent, item: Model): void {
      const newItem = item || event;

      this._close();
      this._closePopup();
      this._notify('choose', [newItem]);

      if (this._options.historyId) {
         this._getHistoryService().addCallback((historyService) => {
            historyService.update(newItem, {$_history: true});
            return historyService;
         });
      }
   }

   protected _markedKeyChangedHandler(event: SyntheticEvent, key: string): void {
      this._setSuggestMarkedKey(key);
   }

   protected _loadStart(): void {
      this._loading = true;
      // Обновим таймер, т.к. могут прерывать поиск новыми запросами
      if (this._children.indicator) {
         this._children.indicator.hide();
         this._children.indicator.show();
      }
      if (this._options.searchStartCallback) {
         this._options.searchStartCallback();
      }
   }

   protected _loadEnd(result?: RecordSet): void {
      if (this._loading) {
         this._loading = false;

         // _searchEnd may be called synchronously, for example, if local source is used,
         // then we must check, that indicator was created
         if (this._children.indicator) {
            this._children.indicator.hide();
         }
      }
      this._processResultData(result);
      if (this._options.searchEndCallback) {
         this._options.searchEndCallback();
      }
   }

   _searchErrbackHandler(error: CancelableError): void {
      this._searchErrback(error);
      if (this._options.searchErrorCallback) {
         this._options.searchErrorCallback();
      }
   }

   getErrorController(): dataSourceError.Controller {
      if (!this._errorController) {
         this._errorController = new dataSourceError.Controller({});
      }
      return this._errorController;
   }

   protected _showAllClick(): void {
      const filter = clone(this._filter) || {};

      filter[this._options.searchParam] = '';
      this._openSelector(this._getTemplateOptions(filter, ''));
      this._close();
   }

   protected _moreClick(): void {
      this._openSelector(this._getTemplateOptions(this._filter, this._searchValue));
      this._close();
   }

   protected _misspellClick(): Promise<void> {
      // Return focus to the input field by changing the keyboard layout
      this.activate();
      this._notify('valueChanged', [this._misspellingCaption]);
      return this._changeValueHandler(null, this._misspellingCaption).then(() => {
         this._setMisspellingCaption('');
      });
   }

   protected _keydown(event: SyntheticEvent<KeyboardEvent>): void {
      const eventKeyCode = event.nativeEvent.keyCode;
      const isInputKey = PROCESSED_KEYDOWN_KEYS.INPUT.indexOf(eventKeyCode) !== -1;
      const isListKey = eventKeyCode === ENTER_KEY ? this._suggestMarkedKey !== null :
         PROCESSED_KEYDOWN_KEYS.SUGGESTIONS_LIST.indexOf(eventKeyCode) !== -1;

      if (this._options.suggestState) {
         if (isListKey || isInputKey) {
            event.preventDefault();
            event.stopPropagation();
         }

         if (isListKey) {
            if (this._children.inputKeydown) {
               this._children.inputKeydown.start(event);

               // The container with list takes focus away to catch "enter", return focus to the input field.
               // toDO https://online.sbis.ru/opendoc.html?guid=66ae5218-b4ba-4d6f-9bfb-a90c1c1a7560
               if (this._input) {
                  this._input.activate();
               } else {
                  this.activate();
               }
            }
         } else if (isInputKey) {
            if (eventKeyCode === Env.constants.key.esc) {
               this._close();
            }
         }
      }
   }

   closeSuggest(): void {
      this._close();
   }

   static _theme: string[] = ['Controls/suggest'];

   static getOptionTypes(): object {
      return {
         searchParam: descriptor(String).required()
      };
   }

   static getDefaultOptions(): object {
      return {
         emptyTemplate: {
            templateName: 'Controls/suggestPopup:EmptyTemplate'
         },
         footerTemplate: {
            templateName: 'Controls/suggestPopup:FooterTemplate'
         },
         suggestStyle: 'default',
         suggestState: false,
         minSearchLength: 3,
         searchDelay: 500
      };
   }
}
