import Control = require('Core/Control');
import template = require('wml!Controls/_search/Controller');
import {tmplNotify} from 'Controls/eventUtils';
import {ContextOptions as DataOptions} from 'Controls/context';
import {RecordSet} from 'Types/collection';
import {default as SearchController} from 'Controls/_search/ControllerClass';
import {SyntheticEvent} from 'Vdom/Vdom';

/**
 * Контрол используют в качестве контроллера для организации поиска в реестрах.
 * Он обеспечивает связь между {@link Controls/search:InputContainer} и {@link Controls/list:Container} — контейнерами для строки поиска и списочного контрола соответветственно. 
 * С помощью этого контрола можно настроить: временную задержку между вводом символа и началом поиска, количество символов, с которых начинается поиск, параметры фильтрации и другое.
 * @remark
 * Полезные ссылки:
 * * <a href="/doc/platform/developmentapl/interface-development/controls/list-environment/filter-search/">руководство разработчика по организации поиска и фильтрации в реестре</a>
 * * <a href="/doc/platform/developmentapl/interface-development/controls/list-environment/component-kinds/">руководство разработчика по классификации контролов Wasaby и схеме их взаимодействия</a>
 * * <a href="https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/aliases/_search.less">переменные тем оформления</a>
 *
 *
 * @class Controls/_search/Controller
 * @extends Core/Control
 * @mixes Controls/_interface/ISearch
 * @mixes Controls/_interface/ISource
 * @mixes Controls/_interface/IFilterChanged
 * @mixes Controls/_interface/INavigation
 * @mixes Controls/interface/IHierarchySearch
 * @author Герасимов А.М.
 * @control
 * @public
 */

/*
 * The search controller allows you to search data in a {@link Controls/list:View}
 * using any component with {@link Controls/input:IValue} interface.
 * Search controller allows you:
 * 1) set delay before searching
 * 2) set number of characters
 * 3) set search parameter
 * 4) change the keyboard layout for an unsuccessful search
 * Note: Component with {@link Controls/input:IValue} interface must be located in {@link Controls/_search/Input/Container}.
 *
 * More information you can read <a href='/doc/platform/developmentapl/interface-development/controls/filter-search/'>here</a>.
 *
 * <a href="/materials/demo/demo-ws4-explorer-with-search">Here</a>. you a demo with search in Controls/Explorer.
 *
 * @class Controls/_search/Controller
 * @extends Core/Control
 * @mixes Controls/_interface/ISearch
 * @mixes Controls/_interface/ISource
 * @mixes Controls/_interface/IFilterChanged
 * @mixes Controls/_interface/INavigation
 * @mixes Controls/interface/IHierarchySearch
 * @author Герасимов А.М.
 * @control
 * @public
 */

var Container = Control.extend(/** @lends Controls/_search/Container.prototype */{
   _template: template,
   _tmplNotify: tmplNotify,
   _dataOptions: null,
   _previousViewMode: null,
   _viewMode: null,
   _searchValue: null,
   _misspellValue: null,
   _root: null,
   _deepReload: undefined,
   _inputSearchValue: '',

   _beforeMount(options, context): void {
      this._itemOpenHandler = this._itemOpenHandler.bind(this);
      this._dataLoadCallback = this._dataLoadCallback.bind(this);
      this._afterSetItemsOnReloadCallback = this._afterSetItemsOnReloadCallback.bind(this);
      this._createSearchController(options, context);
      this._searchValue = this._searchController.getSearchValue();
   },

   _beforeUnmount(): void {
      if (this._searchController) {
         this._searchController.destroy();
         this._searchController = null;
      }
   },

   _beforeUpdate(newOptions, context): void {
      this._searchController.update(this._getSearchControllerOptions(newOptions), context);
   },

   _createSearchController(options, context) {
      this._searchController = new SearchController(this._getSearchControllerOptions(options), context);
   },

   _getSearchControllerOptions(options) {
      const optionsChangedCallbacks = SearchController.getStateAndOptionsChangedCallbacks(this);
      return {...options, ...optionsChangedCallbacks};
   },

   _search(event: SyntheticEvent, value: string, force: boolean): void {
      this._searchController.search(value, force);
   },

   _itemOpenHandler(root: string|number|null, items: RecordSet, dataRoot = null): void {
      this._searchController.handleItemOpen(root, items, dataRoot);
   },

   _dataLoadCallback(data: RecordSet): void {
      this._searchController.handleDataLoad(data);

      if (this._options.dataLoadCallback) {
         this._options.dataLoadCallback(data);
      }
   },

   _afterSetItemsOnReloadCallback(): void {
      this._searchController.handleAfterSetItemsOnReload();
   },

   _misspellCaptionClick(): void {
      this._searchController.handleMisspellClick();
   }

});

Container.contextTypes = function () {
   return {
      dataOptions: DataOptions
   };
};

Container.getDefaultOptions = function () {
   return {
      minSearchLength: 3,
      searchDelay: 500,
      startingWith: 'root'
   };
};

export = Container;
