import Control = require('Core/Control');
import template = require('wml!Controls/_suggest/_InputController/_InputController');
import mStubs = require('Core/moduleStubs');
import clone = require('Core/core-clone');
import Deferred = require('Core/Deferred');
import Env = require('Env/Env');
import {descriptor} from 'Types/entity';
import {getSwitcherStrFromData} from 'Controls/search';
import {isEqual} from 'Types/object';
import {SyntheticEvent} from 'Vdom/Vdom';
import {Stack as StackOpener, IStackPopupOptions} from 'Controls/popup';
import ModuleLoader = require('Controls/Container/Async/ModuleLoader');

const CURRENT_TAB_META_FIELD = 'tabsSelectedKey';
const HISTORY_KEYS_FIELD = 'historyKeys';

const moduleLoader = new ModuleLoader();

/* if suggest is opened and marked key from suggestions list was changed,
   we should select this item on enter keydown, otherwise keydown event should be propagated as default. */
const ENTER_KEY = Env.constants.key.enter;

const PROCESSED_KEYDOWN_KEYS = {

   /* hot keys that should processed on input */
   INPUT: [Env.constants.key.esc],

   /* hot keys, that list (suggestList) will process, do not respond to the press of these keys when suggest is opened */
   SUGGESTIONS_LIST: [Env.constants.key.down, Env.constants.key.up, ENTER_KEY]
};

const DEPS = ['Controls/suggestPopup:_ListWrapper', 'Controls/scroll:Container', 'Controls/search:Misspell', 'Controls/LoadingIndicator'];

var _private = {
   hasMore: function(searchResult) {
      return searchResult && searchResult.hasMore;
   },
   isEmptyData: function(searchResult) {
      return !(searchResult && searchResult.data.getCount());
   },
   suggestStateNotify: function(self, state, options = self._options) {
      if (options.suggestState !== state) {
         self._notify('suggestStateChanged', [state]);
      } else {
         self._forceUpdate();
      }
   },
   setCloseState: function(self) {
      self._showContent = false;
      self._loading = null;

      // when closing popup we reset the cache with recent keys
      self._historyLoad = null;
      self._historyKeys = null;
   },

   setSuggestMarkedKey: function(self, key) {
      var currentMarkedKey = self._suggestMarkedKey;
      self._suggestMarkedKey = key;

      if (currentMarkedKey !== self._suggestMarkedKey) {
         self._notify('suggestMarkedKeyChanged', [key]);
      }
   },

   close: function(self, options) {
      this.setCloseState(self);
      this.suggestStateNotify(self, false, options);

      if (self._dependenciesDeferred && !self._dependenciesDeferred.isReady()) {
         self._dependenciesDeferred.cancel();
         self._dependenciesDeferred = null;
      }
   },
   open: function(self) {
      _private.loadDependencies(self, self._options).addCallback(function() {
         //focus can be moved out while dependencies loading
         if (self._inputActive) {
            _private.suggestStateNotify(self, true);
         }
      });
   },

   closePopup: function(self) {
      let layerOpener = self._children.layerOpener;
      layerOpener && layerOpener.close();
   },

   openWithHistory: function(self) {
      var filter;

      if (!self._historyKeys) {
         _private.getRecentKeys(self).addCallback(function(keys) {
            self._historyKeys = keys || [];
            filter = clone(self._options.filter || {});

            if (self._historyKeys.length) {
               filter[HISTORY_KEYS_FIELD] = self._historyKeys;
            }

            _private.setFilter(self, filter, self._options);
            _private.open(self);

            return self._historyKeys;
         });
      } else {
         _private.setFilter(self, self._options.filter, self._options);
         _private.open(self);
      }
   },

   setSearchValue: function(self, value) {
      self._searchValue = value;
   },

   inputActivated: function(self) {

      // toDO Временный костыль, в .320 убрать, должно исправиться с этой ошибкой https://online.sbis.ru/opendoc.html?guid=d0f7513f-7fc8-47f8-8147-8535d69b99d6
      if (self._options.autoDropDown && !self._options.readOnly && !_private.getActiveElement().classList.contains('controls-Lookup__icon')) {
         // The delay is needed when searching, when receiving the focus of the input field, open without delay
         self._searchDelay = 0;

         if (!self._options.suggestState) {
            _private.updateSuggestState(self);
         }
      }
   },

   getActiveElement: function() {
      return document.activeElement;
   },

   searchErrback: function(self, error) {
      //aborting of the search may be caused before the search start, because of the delay before searching
      if (self._loading !== null) {
         self._loading = false;
         self._forceUpdate();
      }
      if (!error || !error.canceled) {
          return new Promise(function(resolve) {
              require(['Controls/suggestPopup'], function(result) {
                  self._emptyTemplate = result.EmptyErrorTemplate;
                  if (self._children.indicator) {
                     self._children.indicator.hide();
                  }
                  resolve();
              });
          });
      }
   },
   shouldSearch(self, value): boolean {
      return self._inputActive && _private.isValueLengthLongerThenMinSearchLength(value, self._options);
   },

   isValueLengthLongerThenMinSearchLength(value, options): boolean {
     return value && value.length >= options.minSearchLength;
   },

   prepareValue: function(self, value) {
      return self._options.trim && value ? value.trim() : value;
   },

   shouldShowSuggest: function(self, searchResult) {
      const hasItems = searchResult && searchResult.data.getCount();
      const isSuggestHasTabs = self._tabsSelectedKey !== null;

      /* do not suggest if:
       * 1) loaded list is empty and empty template option is doesn't set
       * 2) loaded list is empty and list loaded from history, expect that the list is loaded from history, becouse input field is empty and historyId options is set  */
      return hasItems ||
             (!self._options.historyId || self._searchValue || isSuggestHasTabs) && self._options.emptyTemplate;
   },
   processResultData: function(self, resultData) {
      self._searchResult = resultData;
      if (resultData) {
         var data = resultData.data;
         var metaData = data && data.getMetaData();
         var result = metaData.results;

         _private.setMissSpellingCaption(self, getSwitcherStrFromData(data));

         if (!data.getCount()) {
            _private.setSuggestMarkedKey(self, null);
         }

         if (result && result.get(CURRENT_TAB_META_FIELD)) {
            self._tabsSelectedKey = result.get(CURRENT_TAB_META_FIELD);
         }

         if (self._searchValue && resultData.hasMore && typeof metaData.more === 'number') {
            resultData.more = metaData.more - data.getCount();
         }
      }
      if (!_private.shouldShowSuggest(self, resultData)) {
         _private.close(self);
      }
   },
   prepareFilter: function(filter, searchParam, searchValue, minSearchLength, tabId, historyKeys) {
      var preparedFilter = clone(filter) || {};
      if (tabId) {
         preparedFilter.currentTab = tabId;
      }
      if (searchValue.length < minSearchLength && historyKeys && historyKeys.length) {
         preparedFilter[HISTORY_KEYS_FIELD] = historyKeys;
      }
      preparedFilter[searchParam] = searchValue;
      return preparedFilter;
   },
   setFilter: function(self, filter, options) {
      self._filter = this.prepareFilter(filter, options.searchParam, self._searchValue, options.minSearchLength, self._tabsSelectedKey, self._historyKeys);
   },
   getEmptyTemplate: function(emptyTemplate) {
      return emptyTemplate && emptyTemplate.templateName ? emptyTemplate.templateName : emptyTemplate;
   },
   updateSuggestState: function(self) {
      var shouldSearch = _private.shouldSearch(self, self._searchValue);

      if (self._options.historyId && self._options.autoDropDown && !shouldSearch && !self._options.suggestState) {
         _private.openWithHistory(self);
      } else if (shouldSearch || self._options.autoDropDown && !self._options.suggestState) {
         _private.setFilter(self, self._options.filter, self._options);
         _private.open(self);
      } else if (!self._options.autoDropDown) {
         //autoDropDown - close only on Esc key or deactivate
         _private.close(self);
      }
   },

   getTemplatesToLoad: function(self, options) {
      var templatesToCheck = ['footerTemplate', 'suggestTemplate', 'emptyTemplate'];
      var templatesToLoad = [];
      templatesToCheck.forEach(function(tpl) {
         if (options[tpl] && options[tpl].templateName && !moduleLoader.isLoaded(options[tpl].templateName)) {
            templatesToLoad.push(options[tpl].templateName);
         }
      });
      return templatesToLoad;
   },
   loadDependencies: function(self, options) {
      const templatesToLoad = _private.getTemplatesToLoad(self, options);
      if (!self._dependenciesDeferred || templatesToLoad.length) {
         self._dependenciesDeferred = mStubs.require(DEPS.concat(templatesToLoad.concat([options.layerName])));
      }
      return self._dependenciesDeferred;
   },
   setMissSpellingCaption: function(self, value) {
      self._misspellingCaption = value;
   },
   getHistoryService: function(self) {
      if (!self._historyServiceLoad) {
         self._historyServiceLoad = new Deferred();
         require(['Controls/suggestPopup'], function(result) {
            result.LoadService({
               historyId: self._options.historyId
            }).addCallback((result) => {
               self._historyServiceLoad.callback(result);
               return result;
            });
         });
      }
      return self._historyServiceLoad;
   },
   getRecentKeys: function(self) {
      if (self._historyLoad) {
         return self._historyLoad;
      }

      self._historyLoad = new Deferred();

      //toDO Пока что делаем лишний вызов на бл, ждем доработки хелпера от Шубина
      _private.getHistoryService(self).addCallback(function(historyService) {
         historyService.query().addCallback(function(dataSet) {
            if (self._historyLoad) {
               var keys = [];
               dataSet.getRow().get('recent').each(function(item) {
                  keys.push(item.get('ObjectId'));
               });
               self._historyLoad.callback(keys);
            }
         }).addErrback(function() {
            if (self._historyLoad) {
               self._historyLoad.callback([]);
            }
         });

         return historyService;
      });

      return self._historyLoad;
   },

   openSelector: function(self, templateOptions) {
      if (!self._notify('showSelector', [templateOptions])) {
         //loading showAll templates
         requirejs(['Controls/suggestPopup'], function () {
            StackOpener.openPopup(_private.getSelectorOptions(self, templateOptions));
         });
      }
   },

   isInvalidValidationStatus(options): boolean {
      return options.validationStatus === 'invalid' ||
             options.validationStatus === 'invalidAccent';
   },

   getSelectorOptions(self, templateOptions): IStackPopupOptions {
      return { ...{
            opener: self,
            template: 'Controls/suggestPopup:Dialog',
            closeOnOutsideClick: true,
            eventHandlers: {
               onResult: self._select.bind(self)
            }
         }, ...templateOptions};
   },

   getTemplateOptions(self, filter): IStackPopupOptions {
      return {
         templateOptions: {
            filter: filter,
            searchValue: self._searchValue,
            template: 'Controls/suggestPopup:_ListWrapper',
            templateOptions: {
               templateName: self._options.suggestTemplate.templateName,
               templateOptions: self._options.suggestTemplate.templateOptions,
               searchEndCallback: self._searchEnd,
               searchStartCallback: self._searchStart,
               searchErrback: self._searchErrback,
               emptyTemplate: self._emptyTemplate,
               source: self._options.source,
               minSearchLength: self._options.autoDropDown ? 0 : self._options.minSearchLength,
               navigation: self._options.navigation,
               sorting: self._options.sorting,
               searchParam: self._options.searchParam,
               tabsSelectedKey: self._tabsSelectedKey,
               layerName: self._options.layerName,
               searchDelay: self._searchDelay,
               tabsSelectedKeyChangedCallback: self._tabsSelectedKeyChanged,
               searchValue: self._searchValue,
               eventHandlers: {
                  onResult: self._select.bind(self)
               }
            }
         }
      };
   }
};

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
 * @control
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
 * @control
 * @private
 */
var SuggestLayout = Control.extend({
   _template: template,

   //context value
   _searchValue: '',
   _inputValue: '',
   _isFooterShown: false,
   _filter: null,
   _tabsSelectedKey: null,
   _historyKeys: null,
   _searchResult: null,
   _searchDelay: null,
   _dependenciesDeferred: null,
   _historyLoad: null,
   _showContent: false,
   _inputActive: false,
   _suggestMarkedKey: null,

   /**
    * three state flag
    * null - loading is not initiated
    * true - loading data now
    * false - data loading ended
    */
   _loading: null,

   // <editor-fold desc="LifeCycle">
   _beforeMount: function(options) {
      this._searchStart = this._searchStart.bind(this);
      this._searchEnd = this._searchEnd.bind(this);
      this._searchErrback = this._searchErrback.bind(this);
      this._searchDelay = options.searchDelay;
      this._emptyTemplate = _private.getEmptyTemplate(options.emptyTemplate);
      this._tabsSelectedKeyChanged = this._tabsSelectedKeyChanged.bind(this);
      if (_private.isValueLengthLongerThenMinSearchLength(options.value, options)) {
         _private.setSearchValue(this, options.value);
      }
      _private.setFilter(this, options.filter, options);
   },
   _beforeUnmount: function() {
      this._searchResult = null;
      this._searchStart = null;
      this._searchEnd = null;
      this._searchErrback = null;
   },
   _beforeUpdate(newOptions): void {
      const valueChanged = this._options.value !== newOptions.value;
      const valueCleared = valueChanged && !newOptions.value && typeof newOptions.value === 'string';
      const needSearchOnValueChanged = valueChanged && _private.isValueLengthLongerThenMinSearchLength(_private.prepareValue(this, newOptions.value), this._options);
      const emptyTemplateChanged = !isEqual(this._options.emptyTemplate, newOptions.emptyTemplate);
      const footerTempalteChanged = !isEqual(this._options.footerTemplate, newOptions.footerTemplate);

      if (newOptions.suggestState !== this._options.suggestState) {
         if (newOptions.suggestState) {
            _private.open(this);
         } else {
            _private.setCloseState(this);
            _private.setSuggestMarkedKey(this, null);
         }
      }

      if ((needSearchOnValueChanged || valueCleared) && this._searchValue !== newOptions.value) {
         this._searchValue = newOptions.value;

         if (this._options.suggestState && newOptions.suggestState) {
            _private.updateSuggestState(this);
         }
      }

      if (needSearchOnValueChanged || valueCleared || !isEqual(this._options.filter, newOptions.filter)) {
         _private.setFilter(this, newOptions.filter, newOptions);
      }

      if (emptyTemplateChanged) {
         this._emptyTemplate = _private.getEmptyTemplate(newOptions.emptyTemplate);

      }

      if ((emptyTemplateChanged || footerTempalteChanged) && newOptions.suggestState ) {
         _private.loadDependencies(this, newOptions);
      }

      if (this._options.searchDelay !== newOptions.searchDelay) {
         this._searchDelay = newOptions.searchDelay;
      }

      if (this._options.validationStatus !== newOptions.validationStatus &&
          _private.isInvalidValidationStatus(newOptions) && !_private.isInvalidValidationStatus(this._options)) {
         _private.close(this, newOptions);
      }
   },
   _afterUpdate: function() {
      if (this._options.suggestState && this._loading === false && !this._showContent) {
         this._showContent = true;
         this._forceUpdate();
      }
   },

   // TODO Нужно удалить после https://online.sbis.ru/opendoc.html?guid=403837db-4075-4080-8317-5a37fa71b64a
   inputReadyHandler(_: Event, input: Control): void {
      this._input = input;
   },

   // </editor-fold>
   // <editor-fold desc="handlers">

   _close(event: SyntheticEvent<'close'>): void {
      event.stopPropagation();
      _private.close(this);
   },
   _changeValueHandler: function(event, value) {
      var self = this;
      var shouldSearch;

      value = _private.prepareValue(self, value);
      shouldSearch = _private.shouldSearch(this, value);

      /* preload suggest dependencies on value changed */
      _private.loadDependencies(this, this._options);
      this._searchDelay = this._options.searchDelay;

      _private.setSearchValue(self, shouldSearch ? value : '');
      _private.setFilter(self, self._options.filter, self._options);
      _private.updateSuggestState(this);
   },
   _inputActivated(): void {
      this._inputActive = true;
      if (!_private.isInvalidValidationStatus(this._options)) {
         _private.inputActivated(this);
      }
   },

   _inputDeactivated: function() {
      this._inputActive = false;
   },

   _inputClicked: function() {
      this._inputActive = true;
      if (!this._options.suggestState) {
         _private.inputActivated(this);
      }
   },
   _tabsSelectedKeyChanged: function(key) {
      this._searchDelay = 0;
      _private.setSuggestMarkedKey(this, null);

      // change only filter for query, tabSelectedKey will be changed after processing query result,
      // otherwise interface will blink
      if (this._tabsSelectedKey !== key) {
         this._filter = _private.prepareFilter(this._options.filter, this._options.searchParam, this._searchValue, this._options.minSearchLength, key, this._historyKeys);
      }

      // move focus from tabs to input, after change tab
      this.activate();

      /* because activate() does not call _forceUpdate and _tabsSelectedKeyChanged is callback function,
         we should call _forceUpdate, otherwise child controls (like suggestionsList) does not get new filter */
      this._forceUpdate();
   },

   // <editor-fold desc="List handlers">

   _select: function(event, item) {
      item = item || event;
      _private.close(this);
      _private.closePopup(this);
      this._notify('choose', [item]);

      if (this._options.historyId) {
         _private.getHistoryService(this).addCallback(function(historyService) {
            historyService.update(item, {$_history: true});
            return historyService;
         });
      }
   },

   _markedKeyChangedHandler: function(event, key) {
      _private.setSuggestMarkedKey(this, key);
   },

   // </editor-fold>

   _searchStart: function() {
      this._loading = true;
      // Обновим таймер, т.к. могут прерывать поиск новыми запросами
      if (this._children.indicator) {
         this._children.indicator.hide();
         this._children.indicator.show();
      }
      if (this._options.searchStartCallback) {
         this._options.searchStartCallback();
      }
   },
   _searchEnd: function(result) {
      if (this._options.suggestState && this._loading) {
         this._loading = false;

         // _searchEnd may be called synchronously, for example, if local source is used,
         // then we must check, that indicator was created
         if (this._children.indicator) {
            this._children.indicator.hide();
         }
      }
      this._searchDelay = this._options.searchDelay;
      _private.processResultData(this, result);
      if (this._options.searchEndCallback) {
         this._options.searchEndCallback();
      }
      this._forceUpdate();
   },
   _searchErrback: function(error) {
      _private.searchErrback(this, error);
      if (this._options.searchErrorCallback) {
         this._options.searchErrorCallback();
      }
   },
   _showAllClick: function() {
      var filter = clone(this._filter) || {};

      filter[this._options.searchParam] = '';
      _private.openSelector(this, _private.getTemplateOptions(this, filter));
      _private.close(this);
   },

   _moreClick: function() {
      _private.openSelector(this, _private.getTemplateOptions(this, this._filter));
      _private.close(this);
   },

   _missSpellClick: function() {
      // Return focus to the input field by changing the keyboard layout
      this.activate();
      this._notify('valueChanged', [this._misspellingCaption])
      this._changeValueHandler(null, this._misspellingCaption);
      _private.setMissSpellingCaption(this, '');
   },

   _keydown: function(event) {
      var eventKeyCode = event.nativeEvent.keyCode;
      var isInputKey = PROCESSED_KEYDOWN_KEYS.INPUT.indexOf(eventKeyCode) !== -1;
      var isListKey = eventKeyCode === ENTER_KEY ? this._suggestMarkedKey !== null : PROCESSED_KEYDOWN_KEYS.SUGGESTIONS_LIST.indexOf(eventKeyCode) !== -1;

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
               _private.close(this);
            }
         }
      }
   }

   // </editor-fold>
});

// <editor-fold desc="OptionsDesc">
SuggestLayout.getOptionTypes = function() {
   return {
      searchParam: descriptor(String).required()
   };
};
SuggestLayout.getDefaultOptions = function() {
   return {
      emptyTemplate: {
         templateName: 'Controls/suggestPopup:EmptyTemplate'
      },
      footerTemplate: {
         templateName: 'Controls/suggestPopup:FooterTemplate'
      },
      suggestStyle: 'default',
      suggestState: false,
      minSearchLength: 3
   };
};

// </editor-fold>
SuggestLayout._theme = ['Controls/suggest'];
SuggestLayout._private = _private;
export = SuggestLayout;
