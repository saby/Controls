import {Control} from 'UI/Base';
import template = require('wml!Controls/_filter/Controller');
import {RecordSet} from 'Types/Collection';
import FilterController from 'Controls/_filter/ControllerClass';
import {IPrefetchHistoryParams} from './IPrefetch';
import {IFilterItem} from './View/interface/IFilterView';

export interface IFilterHistoryData {
   items: object[];
   prefetchParams?: IPrefetchHistoryParams;
}

function getCalculatedFilter(cfg) {
    return new FilterController({}).getCalculatedFilter(cfg);
}

function updateFilterHistory(cfg) {
    return new FilterController({}).saveFilterToHistory(cfg);
}

const Container = Control.extend(/** @lends Controls/_filter/Container.prototype */{
    _template: template,
     _filterController: null,
     _filter: null,
     _filterButtonItems: null,
     _fastFilterItems: null,

     constructor(): void {
        this._dataLoadCallback = this._dataLoadCallback.bind(this);
        this._dataLoadErrback = this._dataLoadErrback.bind(this);
        Container.superclass.constructor.apply(this, arguments);
     },

    resetPrefetch(): void {
        this._filterController.resetPrefetch();
        this._updateFilterAndFilterItems();
        this._notify('filterChanged', [this._filter]);
    },

    _beforeMount(options, context, receivedState): Promise<IFilterHistoryData|{}> {
        this._filterController = new FilterController({
            ...options,
            historySaveCallback: this._historySaveCallback.bind(this)
        });

        if (receivedState) {
           this._filterController.setFilterItems(receivedState);
        } else {
            return this._filterController.loadFilterItemsFromHistory().then((historyItems) => {
                this._filterController.setFilterItems(historyItems);
                this._updateFilterAndFilterItems();
            });
        }
    },

    _historySaveCallback(historyData: Record<string, any>, items: IFilterItem[]): void {
        if (this._mounted) {
            this?._notify('historySave', [historyData, items]);
        }
    },
     _beforeUpdate(newOptions): void {
        this._filterController.update({...newOptions,
            historySaveCallback: this._historySaveCallback.bind(this)});
        this._updateFilterAndFilterItems();
     },

    _beforeUnmount(): void {
        this._filterController = null;
    },

     _filterHistoryApply(event, history): void {
         this._filterController.updateHistory(history);
     },

     _itemsChanged(event, items): void {
         this._filterController.updateFilterItems(items);
         this._updateFilterAndFilterItems();

         this._notify('filterChanged', [this._filter]);
     },

     _filterChanged(event, filter) {
        // Controller should stop bubbling of 'filterChanged' event, that container-control fired
        event.stopPropagation();
        this._filterController.setFilter(filter);
        this._filter = this._filterController.getFilter();
         this._notify('filterChanged', [this._filter]);
     },

     _dataLoadCallback(items: RecordSet): void {
        this._filterController.handleDataLoad(items);

        if (this._options.dataLoadCallback) {
           this._options.dataLoadCallback(items);
        }
     },

    _dataLoadErrback(error: Error): void {
       this._filterController.handleDataError();

        if (this._options.dataLoadErrback) {
            this._options.dataLoadErrback(error);
        }
    },

    _updateFilterAndFilterItems(): void {
        this._filter = this._filterController.getFilter();
        this._filterButtonItems = this._filterController.getFilterButtonItems();
        this._fastFilterItems = this._filterController.getFastFilterItems();
    }
});

Container.getDefaultOptions = () => ({
    minSearchLength: 3
});

Container.getCalculatedFilter = getCalculatedFilter;
Container.updateFilterHistory = updateFilterHistory;
export = Container;

/**
 * Контрол используют в качестве контроллера, который позволяет фильтровать данные в {@link Controls/list:View}.
 * Контроллер позволяет сохранять историю фильтра и восстанавливать страницу после перезагрузки с последним примененным фильтром.
 *
 * @remark
 * Полезные ссылки:
 * * {@link /doc/platform/developmentapl/interface-development/controls/list/filter-and-search/ руководство разработчика по организации поиска и фильтрации в реестре}
 * * {@link /doc/platform/developmentapl/interface-development/controls/list/filter-and-search/component-kinds/ руководство разработчика по классификации контролов Wasaby и схеме их взаимодействия}
 * * {@link https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/aliases/_filter.less переменные тем оформления filter}
 * * {@link https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/aliases/_filterPopup.less переменные тем оформления filterPopup}
 *
 * @class Controls/_filter/Controller
 * @extends UI/Base:Control
 * @mixes Controls/_interface/IFilterChanged
 * @mixes Controls/_filter/IPrefetch
 *
 * @public
 * @author Герасимов А.М.
 */

/*
* The filter controller allows you to filter data in a {@link Controls/list:View}.
* The filter controller allows you to save filter history and restore page after reload with last applied filter.
*
* More information you can read <a href='/doc/platform/developmentapl/interface-development/controls/filter-search/'>here</a>.
*
* @class Controls/_filter/Controller
* @extends UI/Base:Control
* @mixes Controls/_interface/IFilterChanged
*
* @public
* @author Герасимов А.М.
*/

/**
 * @name Controls/_filter/Controller#filterButtonSource
 * @cfg {Array|Function|Types/collection:IList} Элемент или функция FilterButton, которая возвращает элемент FilterButton.
 * @remark Если опция historyId передана, в функцию придет история фильтра.
 * @example
 * TMPL:
 * <pre>
 *    <Controls.filter:Controller
 *       historyId="myHistoryId"
 *       filterButtonSource="{{_filterButtonData}}">
 *          ...
 *          <Controls.filter:ViewContainer>
 *             <Controls.filter:Button />
 *          </Controls.filter:ViewContainer>
 *          ...
 *    </Controls.filter:Controller>
 * </pre>
 * JS:
 * <pre>
 *    this._filterButtonData = function(fromHistoryItems) {
 *       var filterButtonItems = [{
 *           id: '1',
 *           resetValue: 'Yaroslavl'
 *       }];
 *
 *       if (fromHistoryItems) {
 *           filterButtonItems[0].value = fromHistoryItems[0].value + 'city'
 *       }
 *
 *       return filterButtonItems;
 *    }
 * </pre>
 * @see Controls/_filter/Button#items
 */

/*
* @name Controls/_filter/Controller#filterButtonSource
* @cfg {Array|Function|Types/collection:IList} FilterButton items or function, that return FilterButton items
* @remark if the historyId option is setted, function will receive filter history
* @example
* TMPL:
* <pre>
*    <Controls.filter:Controller
*       historyId="myHistoryId"
*       filterButtonSource="{{_filterButtonData}}">
*          ...
*          <Controls.filter:ViewContainer>
*             <Controls.filter:Button />
*          </Controls.filter:ViewContainer>
*          ...
*    </Controls.filter:Controller>
* </pre>
* JS:
* <pre>
*    this._filterButtonData = function(fromHistoryItems) {
*       var filterButtonItems = [{
*           id: '1',
*           resetValue: 'Yaroslavl'
*       }];
*
*       if (fromHistoryItems) {
*           filterButtonItems[0].value = fromHistoryItems[0].value + 'city'
*       }
*
*       return filterButtonItems;
*    }
* </pre>
* @see Controls/_filter/Button#items
*/

/**
 * @name Controls/_filter/Controller#fastFilterSource
 * @cfg {Array|Function|Types/collection:IList} Элемент или функция FastFilter, которая возвращает элемент FastFilter.
 * @remark Если опция historyId передана, в функцию придет история фильтра.
 * @example
 * TMPL:
 * <pre>
 *    <Controls.filter:Controller
 *       historyId="myHistoryId"
 *       fastFilterSource="{{_fastFilterSource}}">
 *       <Controls.list:DataContainer>
 *          ...
 *          <Controls.filter:FastContainer>
 *             <Controls.filter:Fast />
 *          </Controls.filter:FastContainer>
 *          ...
 *       </Controls.list:DataContainer>
 *    </Controls.filter:Controller>
 * </pre>
 * JS:
 * <pre>
 *    this._fastFilterSource = function(fromHistoryItems) {
 *        var fastFilterItems = [{
 *            id: '1',
 *            resetValue: 'Yaroslavl',
 *            properties: {
 *               keyProperty: 'title',
 *               displayProperty: 'title',
 *               source: new MemorySource({
 *                  keyProperty: 'title',
 *                  data: [
 *                      { key: '1', title: 'Yaroslavl' },
 *                      { key: '2', title: 'Moscow' },
 *                      { key: '3', title: 'St-Petersburg' }
 *                  ]
 *               })
 *            }
 *        }];
 *        if (fromHistoryItems) {
 *          fastFilterItems[0].value = fromHistoryItems[0].value + 'city'
 *        }
 *    }
 * </pre>
 * @see Controls/_filter/Fast#items
 */

/*
* @name Controls/_filter/Controller#fastFilterSource
* @cfg {Array|Function|Types/collection:IList} FastFilter items or function, that return FastFilter items
* @remark if the historyId option is setted, function will recive filter history
* @example
* TMPL:
* <pre>
*    <Controls.filter:Controller
*       historyId="myHistoryId"
*       fastFilterSource="{{_fastFilterSource}}">
*       <Controls.list:DataContainer>
*          ...
*          <Controls.filter:FastContainer>
*             <Controls.filter:Fast />
*          </Controls.filter:FastContainer>
*          ...
*       </Controls.list:DataContainer>
*    </Controls.filter:Controller>
* </pre>
* JS:
* <pre>
*    this._fastFilterSource = function(fromHistoryItems) {
*        var fastFilterItems = [{
*            id: '1',
*            resetValue: 'Yaroslavl',
*            properties: {
*               keyProperty: 'title',
*               displayProperty: 'title',
*               source: new MemorySource({
*                  keyProperty: 'title',
*                  data: [
*                      { key: '1', title: 'Yaroslavl' },
*                      { key: '2', title: 'Moscow' },
*                      { key: '3', title: 'St-Petersburg' }
*                  ]
*               })
*            }
*        }];
*        if (fromHistoryItems) {
*          fastFilterItems[0].value = fromHistoryItems[0].value + 'city'
*        }
*    }
* </pre>
* @see Controls/_filter/Fast#items
*/

/**
 * @name Controls/_filter/Controller#historyId
 * @cfg {String} Идентификатор, под которым будет сохранена история фильтра.
 */

/*
* @name Controls/_filter/Controller#historyId
* @cfg {String} The identifier under which the filter history will be saved.
*/

/**
 * Controls/_filter/Controller#historyItems
 * @cfg {Array|Types/collection:IList} Вы можете получить элементы фильтра из истории самостоятельно,
 * эти элементы будут применены/объединены для filterButtonItems и fastFilterItem. История фильтра не будет загружаться, если этот параметр установлен.
 */

/*
* Controls/_filter/Controller#historyItems
* @cfg {Array|Types/collection:IList} You can prepare filter items from history by your self,
* this items will applied/merged to filterButtonItems and fastFilterItem. Filter history will not loading, if this option setted.
*/

/**
 * @event Происходит перед сохранением фильтра в историю.
 * @name Controls/_filter/Controller#historySave
 * @param {Env/Event.Object} event Дескриптор события.
 * @param {Array|Function|Types/collection:IList} historyItems Список полей фильтра и их конфигурация, которая будет сохранена в историю.
 */
