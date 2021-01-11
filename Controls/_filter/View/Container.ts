import {Control} from 'UI/Base';
import * as template from 'wml!Controls/_filter/View/Container';
import {default as Store} from 'Controls/Store';
import mergeSource from 'Controls/_filter/Utils/mergeSource';
import clone = require('Core/core-clone');
import {RecordSet} from "Types/collection";
import {IFilterItem} from "Controls/_filter/View/interface/IFilterView";
/**
 * Контрол используют в качестве контейнера для {@link Controls/filter:View}. Он обеспечивает передачу параметров фильтрации между {@link Controls/filter:Controller} и {@link Controls/filter:View}.
 * @remark
 * Подробнее об организации поиска и фильтрации в реестре читайте {@link /doc/platform/developmentapl/interface-development/controls/list-environment/filter-search/ здесь}.
 * Подробнее о классификации контролов Wasaby и схеме их взаимодействия читайте {@link /doc/platform/developmentapl/interface-development/controls/list/filter-and-search/component-kinds/ здесь}.
 *
 * @class Controls/_filter/View/Container
 * @extends UI/Base:Control
 * @author Герасимов А.М.
 * @public
 */

/*
 * Special container for {@link Controls/_filter/View}.
 * Listens for child's "itemsChanged" event and notify bubbling event "filterChanged".
 * Receives props from context and pass to {@link Controls/_filter/View}.
 * NOTE: Must be located inside Controls/_filter/Controller.
 *
 * More information you can read <a href='/doc/platform/developmentapl/interface-development/controls/filter-search/'>here</a>.
 *
 * @class Controls/_filter/View/Container
 * @extends UI/Base:Control
 * @author Герасимов А.М.
 * 
 * @public
 */

var Container = Control.extend(/** @lends Controls/_filter/View/Container.prototype */{

    _template: template,

    _beforeMount(options): void {
        if (options.useStore) {
            this._initState(options.preloadedSources);
        }
    },

    _afterMount(options): void {
        if (options.useStore) {
            this._createNewStoreObserver();
            this._storeCtxCallbackId = Store.onPropertyChanged('_contextName', () => {
                this._createNewStoreObserver();
            }, true);
        }
    },

    _createNewStoreObserver(): void {
        if (this._sourceChangedCallbackId) {
            Store.unsubscribe(this._sourceChangedCallbackId);
        }

        this._sourceChangedCallbackId = Store.onPropertyChanged('filterSource', (filterSource) => {
            this._source = filterSource;
        });
    },

    _beforeUpdate(options): void {
        if (options.useStore) {
            this._initState(options.preloadedSources, this._options.preloadedSources);
        }
    },

    _beforeUnmount(): void {
        if (this._sourceChangedCallbackId) {
            Store.unsubscribe(this._sourceChangedCallbackId);
        }
        if (this._storeCtxCallbackId) {
            Store.unsubscribe(this._storeCtxCallbackId);
        }
    },

    _initState(newPreloadedSources, oldPreloadedSources): void {
        if (newPreloadedSources !== oldPreloadedSources) {
            if (newPreloadedSources && newPreloadedSources[0]) {
                const mainSource = newPreloadedSources[0];
                this._historyId = mainSource.historyId;
                // если есть предзагруженные данные в истории, то нужно их подмержить в сурс
                // эта часть аналогична тому что делает _filter/Controller
                let historyItems = mainSource.historyItems;
                if (historyItems) {
                    historyItems = historyItems.items || (Array.isArray(historyItems) ? historyItems : []);
                }
                this._source = this._getSourceByHistory(mainSource.filterButtonSource, historyItems);
            } else {
                this._source = null;
            }
        }
    },

    _getSourceByHistory(source, historyItems) {
        let result;
        if (source) {
            if (typeof source === 'function') {
                result = source(historyItems);
            } else if (historyItems) {
                result = mergeSource(this._cloneItems(source), historyItems);
            } else {
                result = this._cloneItems(source);
            }
        }
        return result;
    },

    _cloneItems(items: IFilterItem[]|RecordSet<IFilterItem>): IFilterItem[] {
        let resultItems;

        if (items['[Types/_entity/CloneableMixin]']) {
            resultItems = (items as RecordSet<IFilterItem>).clone();
        } else {
            resultItems = [];
            items.forEach((item) => {
                resultItems.push({...item});
            });
        }
        return resultItems;
    },

    _itemsChanged(event: Event, items): void {
       event.stopPropagation();
       if (this._options.useStore) {
           Store.dispatch('filterSource', items ? [...items] : []);
       } else {
           this._notify('filterItemsChanged', [items], {bubbling: true});
       }
    },

   _filterChanged(event: Event): void {
      event.stopPropagation();
   },

    _historyApply(event: Event, history): void {
        this._notify('filterHistoryApply', [history], {bubbling: true});
    }
}, {});
/**
 * @event Происходит при изменении элементов.
 * @name Controls/_filter/View/Container#filterItemsChanged
 * @param {Vdom/Vdom:SyntheticEvent} eventObject Дескриптор события.
 * @param {Object} items Новые элементы.
 */

/*
 * @event Happens when items changed.
 * @name Controls/_filter/View/Container#filterItemsChanged
 * @param {Vdom/Vdom:SyntheticEvent} eventObject Descriptor of the event.
 * @param {Object} items New items.
 */
export default Container;
