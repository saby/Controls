import Control = require('Core/Control');
import cClone = require('Core/core-clone');
import cMerge = require('Core/core-merge');
import cInstance = require('Core/core-instance');
import BaseControlTpl = require('wml!Controls/_list/BaseControl/BaseControl');
import ItemsUtil = require('Controls/_list/resources/utils/ItemsUtil');
import Deferred = require('Core/Deferred');
import getItemsBySelection = require('Controls/Utils/getItemsBySelection');
import aUtil = require('Controls/_list/ItemActions/Utils/Actions');
import tmplNotify = require('Controls/Utils/tmplNotify');
import keysHandler = require('Controls/Utils/keysHandler');
import ScrollPagingController = require('Controls/_list/Controllers/ScrollPaging');
import GroupUtil = require('Controls/_list/resources/utils/GroupUtil');
import uDimension = require("Controls/Utils/getDimensions");
import {IObservable, RecordSet} from 'Types/collection';
import {Controller as SourceController} from 'Controls/source';
import {isEqual} from 'Types/object';
import {showType} from 'Controls/Utils/Toolbar';
import 'wml!Controls/_list/BaseControl/Footer';
import 'css!theme?Controls/list';
import {error as dataSourceError} from 'Controls/dataSource';
import {constants, detection} from 'Env/Env';
import ListViewModel from 'Controls/_list/ListViewModel';
import {ICrud, Memory} from "Types/source";
import {TouchContextField} from 'Controls/context';
import {SyntheticEvent} from 'Vdom/Vdom';
import {IDireciton} from './interface/IVirtualScroll';
import {debounce} from 'Types/function';
import {CssClassList} from "../Utils/CssClassList";
import {Logger} from 'UI/Utils';
import PortionedSearch from 'Controls/_list/Controllers/PortionedSearch';
import {create as diCreate} from 'Types/di';
import {INavigationOptionValue} from 'Controls/interface';

//TODO: getDefaultOptions зовётся при каждой перерисовке, соответственно если в опции передаётся не примитив, то они каждый раз новые
//Нужно убрать после https://online.sbis.ru/opendoc.html?guid=1ff4a7fb-87b9-4f50-989a-72af1dd5ae18
var
    defaultSelectedKeys = [],
    defaultExcludedKeys = [];

const PAGE_SIZE_ARRAY = [{id: 1, title: '5', pageSize: 5},
    {id: 2, title: '10', pageSize: 10},
    {id: 3, title: '25', pageSize: 25},
    {id: 4, title: '50', pageSize: 50},
    {id: 5, title: '100', pageSize: 100},
    {id: 6, title: '200', pageSize: 200},
    {id: 7, title: '500', pageSize: 500},
    {id: 8, title: '1000', pageSize: 1000}];

const
    HOT_KEYS = {
        moveMarkerToNext: constants.key.down,
        moveMarkerToPrevious: constants.key.up,
        toggleSelection: constants.key.space,
        enterHandler: constants.key.enter,
        keyDownHome: constants.key.home,
        keyDownEnd: constants.key.end,
        keyDownPageUp: constants.key.pageUp,
        keyDownPageDown: constants.key.pageDown
    };

const LOAD_TRIGGER_OFFSET = 100;
const INITIAL_PAGES_COUNT = 1;
const ITEMACTIONS_UNLOCK_DELAY = 200;
const SET_MARKER_AFTER_SCROLL_DELAY = 100;

const MIN_SCROLL_PAGING_PROPORTION = 2;
/**
 * Object with state from server side rendering
 * @typedef {Object}
 * @name ReceivedState
 * @property {*} [data]
 * @property {Controls/_dataSource/_error/ViewConfig} [errorConfig]
 */
type ReceivedState = {
    data?: any;
    errorConfig?: dataSourceError.ViewConfig;
}

/**
 * @typedef {Object}
 * @name CrudResult
 * @property {*} [data]
 * @property {Controls/_dataSource/_error/ViewConfig} [errorConfig]
 * @property {Error} [error]
 */
type CrudResult = ReceivedState & {
    error: Error;
}

type ErrbackConfig = {
    dataLoadErrback?: (error: Error) => any;
    mode?: dataSourceError.Mode;
    error: Error;
}

type LoadingState = null | 'all' | 'up' | 'down';

/**
 * Удаляет оригинал ошибки из CrudResult перед вызовом сриализатора состояния,
 * который не сможет нормально разобрать/собрать экземпляр случайной ошибки
 * @param {CrudResult} crudResult
 * @return {ReceivedState}
 */
let getState = (crudResult: CrudResult): ReceivedState => {
    delete crudResult.error;
    return crudResult;
};

/**
 * getting result from <CrudResult> wrapper
 * @param {CrudResult} [crudResult]
 * @return {Promise}
 */
let getData = (crudResult: CrudResult): Promise<any> => {
    if (!crudResult) {
        return Promise.resolve();
    }
    if (crudResult.hasOwnProperty('data')) {
        return Promise.resolve(crudResult.data);
    }
    return Promise.reject(crudResult.error);
};

var _private = {
    isNewModelItemsChange: (action, newItems) => {
        return action && (action !== 'ch' || newItems && !newItems.properties);
    },
    checkDeprecated: function(cfg) {
        if (cfg.historyIdCollapsedGroups) {
            Logger.warn('IGrouped: Option "historyIdCollapsedGroups" is deprecated and removed in 19.200. Use option "groupHistoryId".');
        }
    },

    reload: function(self, cfg) {
        var
            filter = cClone(cfg.filter),
            sorting = cClone(cfg.sorting),
            navigation = cClone(cfg.navigation),
            resDeferred = new Deferred();
        self._noDataBeforeReload = self._isMounted && (!self._listViewModel || !self._listViewModel.getCount());
        if (cfg.beforeReloadCallback) {
            // todo parameter cfg removed by task: https://online.sbis.ru/opendoc.html?guid=f5fb685f-30fb-4adc-bbfe-cb78a2e32af2
            cfg.beforeReloadCallback(filter, sorting, navigation, cfg);
        }
        if (self._sourceController) {
            _private.showIndicator(self);
            _private.hideError(self);

            // Need to create new Deffered, returned success result
            // load() method may be fired with errback
            self._sourceController.load(filter, sorting).addCallback(function(list) {
                if (list.getCount()) {
                    self._loadedItems = list;
                } else {
                    self._loadingIndicatorContainerOffsetTop = _private.getListTopOffset(self);
                }
                if (self._pagingNavigation) {
                    var hasMoreDataDown = list.getMetaData().more;
                    self._knownPagesCount = _private.calcPaging(self, hasMoreDataDown, self._currentPageSize);
                    self._pagingLabelData = _private.getPagingLabelData(hasMoreDataDown, self._currentPageSize, self._currentPage);
                }
                var
                    isActive,
                    listModel = self._listViewModel;

                if (cfg.afterReloadCallback) {
                    cfg.afterReloadCallback(cfg, list);
                }

                if (cfg.serviceDataLoadCallback instanceof Function) {
                    cfg.serviceDataLoadCallback(self._items, list);
                }

                if (cfg.dataLoadCallback instanceof Function) {
                    cfg.dataLoadCallback(list);
                }

                self._cachedPagingState = null;

                if (listModel) {
                    if (self._isActive) {
                        isActive = true;
                    }
                    if (self._options.useNewModel) {
                        // TODO restore marker + maybe should recreate the model completely
                        // instead of assigning items
                        // https://online.sbis.ru/opendoc.html?guid=ed57a662-7a73-4f11-b7d4-b09b622b328e
                        const modelCollection = listModel.getCollection();
                        listModel.setCompatibleReset(true);
                        modelCollection.setMetaData(list.getMetaData());
                        modelCollection.assign(list);
                        listModel.setCompatibleReset(false);
                        self._items = listModel.getCollection();
                    } else {
                        const curKey = listModel.getMarkedKey();
                        listModel.setItems(list);
                        const nextKey = listModel.getMarkedKey();
                        if (nextKey && nextKey !== curKey
                            && self._listViewModel.getCount() && self._isScrollShown
                            && !self._options.task46390860 && !self._options.task1177182277
                        ) {
                            self._markedKeyForRestoredScroll = nextKey;
                        }
                        self._items = listModel.getItems();
                    }
                    if (isActive === true) {
                        self._children.listView.activate();
                    }

                    if (self._sourceController) {
                        _private.setHasMoreData(listModel, self._sourceController.hasMoreData('down') || self._sourceController.hasMoreData('up'));
                    }
                }

                _private.prepareFooter(self, navigation, self._sourceController);
                _private.resolveIndicatorStateAfterReload(self, list, navigation);

                resDeferred.callback({
                    data: list
                });

                if (self._isMounted && self._isScrollShown) {
                    // При полной перезагрузке данных нужно сбросить состояние скролла
                    // и вернуться к началу списка, иначе браузер будет пытаться восстановить
                    // scrollTop, догружая новые записи после сброса.
                    self._resetScrollAfterReload = true;
                }

                // If received list is empty, make another request. If it’s not empty, the following page will be requested in resize event handler after current items are rendered on the page.
                if (_private.needLoadNextPageAfterLoad(list, self._listViewModel, cfg.navigation)) {
                    _private.checkLoadToDirectionCapability(self, filter);
                }
            }).addErrback(function(error) {
                return _private.processError(self, {
                    error: error,
                    dataLoadErrback: cfg.dataLoadErrback
                }).then(function(result: CrudResult) {
                    if (cfg.afterReloadCallback) {
                        cfg.afterReloadCallback(cfg);
                    }
                    resDeferred.callback({
                        data: null,
                        ...result
                    });
                });
            });
        } else {
            if (cfg.afterReloadCallback) {
                cfg.afterReloadCallback(cfg);
            }
            resDeferred.callback();
            Logger.error('BaseControl: Source option is undefined. Can\'t load data', self);
        }
        return resDeferred;
    },
    canStartDragNDrop(domEvent: any, cfg: any): boolean {
        return (!cfg.canStartDragNDrop || cfg.canStartDragNDrop()) &&
            !(domEvent.nativeEvent.button) &&
            !cfg.readOnly &&
            cfg.itemsDragNDrop &&
            !domEvent.target.closest('.controls-DragNDrop__notDraggable');
    },
    /**
     * TODO: Сейчас нет возможности понять предусмотрено выделение в списке или нет.
     * Опция multiSelectVisibility не подходит, т.к. даже если она hidden, то это не значит, что выделение отключено.
     * Пока единственный надёжный способ различить списки с выделением и без него - смотреть на то, приходит ли опция selectedKeysCount.
     * Если она пришла, то значит выше есть Controls/Container/MultiSelector и в списке точно предусмотрено выделение.
     *
     * По этой задаче нужно придумать нормальный способ различать списки с выделением и без:
     * https://online.sbis.ru/opendoc.html?guid=ae7124dc-50c9-4f3e-a38b-732028838290
     */
    isItemsSelectionAllowed(options: object): boolean {
        return options.hasOwnProperty('selectedKeysCount');
    },

    resolveIndicatorStateAfterReload: function(self, list, navigation):void {
        if (!self._isMounted) {
            return;
        }

        const hasMoreDataDown = self._sourceController.hasMoreData('down');
        const hasMoreDataUp = self._sourceController.hasMoreData('up');

        if (!list.getCount()) {
            const needShowIndicatorByNavigation =
                _private.isMaxCountNavigation(navigation) ||
                self._needScrollCalculation;
            const needShowIndicatorByMeta = hasMoreDataDown || hasMoreDataUp;

            // because of IntersectionObserver will trigger only after DOM redraw, we should'n hide indicator
            // otherwise empty template will shown
            if (needShowIndicatorByNavigation && needShowIndicatorByMeta) {
                if (self._listViewModel && self._listViewModel.getCount()) {
                    _private.showIndicator(self, hasMoreDataDown ? 'down' : 'up');
                } else {
                    _private.showIndicator(self);
                }
            } else {
                _private.hideIndicator(self);
            }
        } else {
            _private.hideIndicator(self);
        }
    },

    scrollToItem: function(self, key) {
        return self._children.scrollController.scrollToItem(key);
    },
    setMarkedKey: function(self, key) {
        if (key !== undefined) {
            const model = self.getViewModel();
            if (self._options.useNewModel) {
                model.setMarkedItem(model.getItemBySourceId(key));
            } else {
                model.setMarkedKey(key);
            }
            _private.scrollToItem(self, key);
        }
    },
    restoreScrollPosition: function(self) {
        if (self._markedKeyForRestoredScroll !== null) {
            _private.scrollToItem(self, self._markedKeyForRestoredScroll);
            self._markedKeyForRestoredScroll = null;
        }
    },
    moveMarker: function(self, newMarkedKey) {
        // activate list when marker is moving. It let us press enter and open current row
        // must check mounted to avoid fails on unit tests
        if (self._mounted) {
            self.activate();
        }
        _private.setMarkedKey(self, newMarkedKey);
    },
    moveMarkerToNext: function (self, event) {
        if (_private.isBlockedForLoading(self._loadingIndicatorState)) {
            return;
        }
        if (self._options.markerVisibility !== 'hidden') {
            event.preventDefault();
            var model = self.getViewModel();
            // TODO Update after MarkerManager is fully implemented
            let nextKey;
            if (self._options.useNewModel) {
                const nextItem = model.getNext(model.getMarkedItem());
                const contents = nextItem && nextItem.getContents();
                nextKey = contents && contents.getId();
            } else {
                nextKey = model.getNextItemKey(model.getMarkedKey());
            }

            _private.moveMarker(self, nextKey);
        }
    },
    moveMarkerToPrevious: function (self, event) {
        if (_private.isBlockedForLoading(self._loadingIndicatorState)) {
            return;
        }
        if (self._options.markerVisibility !== 'hidden') {
            event.preventDefault();
            var model = self.getViewModel();

            // TODO Update after MarkerManager is fully implemented
            let prevKey;
            if (self._options.useNewModel) {
                const prevItem = model.getPrevious(model.getMarkedItem());
                const contents = prevItem && prevItem.getContents();
                prevKey = contents && contents.getId();
            } else {
                prevKey = model.getPreviousItemKey(model.getMarkedKey());
            }

            _private.moveMarker(self, prevKey);

        }
    },
    setMarkerAfterScroll(self, event) {
        if (self._options.moveMarkerOnScrollPaging !== false) {
            self._setMarkerAfterScroll = true;
        }
    },
    keyDownHome: function(self, event) {
        _private.setMarkerAfterScroll(self, event);
    },
    keyDownEnd:  function(self, event) {
        _private.setMarkerAfterScroll(self, event);
    },
    keyDownPageUp:  function(self, event) {
        _private.setMarkerAfterScroll(self, event);
    },
    keyDownPageDown:  function(self, event) {
        _private.setMarkerAfterScroll(self, event);
    },

    enterHandler: function(self, event) {
        if (_private.isBlockedForLoading(self._loadingIndicatorState)) {
            return;
        }
        let markedItem = self.getViewModel().getMarkedItem();
        if (markedItem) {
            self._notify('itemClick', [markedItem.getContents(), event], { bubbling: true });
        }
    },
    toggleSelection: function(self, event) {
        const allowToggleSelection = !_private.isBlockedForLoading(self._loadingIndicatorState) &&
            self._children.selectionController;

        if (allowToggleSelection) {
            const model = self.getViewModel();
            let toggledItemId = model.getMarkedKey();

            if (!model.getItemById(toggledItemId) && model.getCount()) {
                toggledItemId = model.at(0).getContents().getId();
            }

            if (toggledItemId) {
                self._children.selectionController.onCheckBoxClick(toggledItemId, model.getSelectionStatus(toggledItemId));
                _private.moveMarkerToNext(self, event);
            }
        }
    },
    prepareFooter: function(self, navigation, sourceController) {
        var
            loadedDataCount, allDataCount;

        if (_private.isDemandNavigation(navigation) && sourceController.hasMoreData('down')) {
            self._shouldDrawFooter = self._options.groupingKeyCallback ? !self._listViewModel.isAllGroupsCollapsed() : true;
        } else {
            self._shouldDrawFooter = false;
        }

        if (self._shouldDrawFooter) {
            loadedDataCount = sourceController.getLoadedDataCount();
            allDataCount = sourceController.getAllDataCount();
            if (typeof loadedDataCount === 'number' && typeof allDataCount === 'number') {
                self._loadMoreCaption = allDataCount - loadedDataCount;
            } else {
                self._loadMoreCaption = '...';
            }
        }
    },

    loadToDirection: function(self, direction, userCallback, userErrback, receivedFilter) {
        const navigation = self._options.navigation;
        const listViewModel = self._listViewModel;
        const portionedSearch = _private.getPortionedSearch(self);
        const beforeAddItems = (addedItems) => {
            if (addedItems.getCount()) {
                if (portionedSearch.shouldSearch()) {
                    portionedSearch.reset();
                }
                self._loadedItems = addedItems;
            }
            if (self._options.serviceDataLoadCallback instanceof Function) {
                self._options.serviceDataLoadCallback(self._items, addedItems);
            }
            if (userCallback && userCallback instanceof Function) {
                userCallback(addedItems, direction);
            }
            _private.resolveIndicatorStateAfterReload(self, addedItems, navigation);

            if (self._options.virtualScrolling && self._isMounted) {
                self._children.scrollController.itemsFromLoadToDirection = true;
            }
        };

        const afterAddItems = (countCurrentItems, addedItems) => {
            const cnt2 = self._listViewModel.getCount();
            // If received list is empty, make another request.
            // If it’s not empty, the following page will be requested in resize event
            // handler after current items are rendered on the page.
            if (_private.needLoadNextPageAfterLoad(addedItems, listViewModel, navigation) ||
                (self._options.task1176625749 && countCurrentItems === cnt2)) {
                _private.checkLoadToDirectionCapability(self);
            }
            if (self._options.virtualScrolling && self._isMounted) {
                self._children.scrollController.itemsFromLoadToDirection = false;
            }

            _private.prepareFooter(self, self._options.navigation, self._sourceController);
        };

        const drawItemsUp = (countCurrentItems, addedItems) => {
            beforeAddItems(addedItems);
            self._saveAndRestoreScrollPosition = 'up';
            if (self._options.useNewModel) {
                self._listViewModel.getCollection().prepend(addedItems);
            } else {
                self._listViewModel.prependItems(addedItems);
            }
            afterAddItems(countCurrentItems, addedItems);
        };

        _private.showIndicator(self, direction);

        if (self._sourceController) {
            const filter = cClone(receivedFilter || self._options.filter);
            if (self._options.beforeLoadToDirectionCallback) {
                self._options.beforeLoadToDirectionCallback(filter, self._options);
            }
            if (self._options.searchValue) {
                portionedSearch.startSearch();
            }
            _private.setHasMoreData(self._listViewModel, self._sourceController.hasMoreData('down') || self._sourceController.hasMoreData('up'));
            return self._sourceController.load(filter, self._options.sorting, direction).addCallback(function(addedItems) {
                //TODO https://online.sbis.ru/news/c467b1aa-21e4-41cc-883b-889ff5c10747
                //до реализации функционала и проблемы из новости делаем решение по месту:
                //посчитаем число отображаемых записей до и после добавления, если не поменялось, значит прилетели элементы, попадающие в невидимую группу,
                //надо инициировать подгрузку порции записей, больше за нас это никто не сделает.
                //Под опцией, потому что в другом месте это приведет к ошибке. Хорошее решение будет в задаче ссылка на которую приведена
                const countCurrentItems = self._listViewModel.getCount();

                if (direction === 'down') {
                    beforeAddItems(addedItems);
                    if (self._options.useNewModel) {
                        self._listViewModel.getCollection().append(addedItems);
                    } else {
                        self._listViewModel.appendItems(addedItems);
                    }
                    afterAddItems(countCurrentItems, addedItems);
                } else if (direction === 'up') {
                    drawItemsUp(countCurrentItems, addedItems);
                }
                return addedItems;
            }).addErrback((error) => {
                _private.hideIndicator(self);
                return _private.crudErrback(self, {
                    error,
                    dataLoadErrback: userErrback
                });
            });
        }
        Logger.error('BaseControl: Source option is undefined. Can\'t load data', self);
    },

    checkLoadToDirectionCapability: function(self, filter) {
        if (self._destroyed) {
            return;
        }
        if (self._needScrollCalculation) {
            // TODO Когда список становится пустым (например после поиска или смены фильтра),
            // если он находится вверху страницы, нижний загрузочный триггер может "вылететь"
            // за пределы экрана (потому что у него статически задан отступ от низа списка,
            // и при пустом списке этот отступ может вывести триггер выше верхней границы
            // страницы).
            // Сейчас сделал, что если список пуст, мы пытаемся сделать загрузку данных,
            // даже если триггеры не видны (если что, sourceController.hasMore нас остановит).
            // Но скорее всего это как-то по другому нужно решать, например на уровне стилей
            // (уменьшать отступ триггеров, когда список пуст???). Выписал задачу:
            // https://online.sbis.ru/opendoc.html?guid=fb5a67de-b996-49a9-9312-349a7831f8f1
            const hasNoItems = self.getViewModel() && self.getViewModel().getCount() === 0;
            if (self._loadTriggerVisibility.up || hasNoItems) {
                _private.onScrollLoadEdge(self, 'up', filter);
            }
            if (self._loadTriggerVisibility.down || hasNoItems) {
                _private.onScrollLoadEdge(self, 'down', filter);
            }
        } else if (_private.needLoadByMaxCountNavigation(self._listViewModel, self._options.navigation)) {
            _private.loadToDirectionIfNeed(self, 'down', filter);
        }
    },

    needLoadNextPageAfterLoad(loadedList: RecordSet, listViewModel, navigation): boolean {
        let result = false;

        if (navigation) {
            switch (navigation.view) {
                case 'infinity':
                    result = !loadedList.getCount();
                    break;
                case 'maxCount':
                    result = _private.needLoadByMaxCountNavigation(listViewModel, navigation);
                    break;
            }
        }

        return  result;
    },

    needLoadByMaxCountNavigation(listViewModel, navigation: INavigationOptionValue): boolean {
        let result = false;

        if (_private.isMaxCountNavigation(navigation) && _private.isMaxCountNavigationConfiguredCorrect(navigation)) {
            result = _private.isItemsCountLessThenMaxCount(
                listViewModel.getCount(),
                _private.getMaxCountFromNavigation(navigation)
            );
        }

        return result;
    },

    getMaxCountFromNavigation(navigation: INavigationOptionValue): number {
        return navigation.viewConfig.maxCountValue;
    },

    isMaxCountNavigation(navigation: INavigationOptionValue): boolean {
        return navigation && navigation.view === 'maxCount';
    },

    isMaxCountNavigationConfiguredCorrect(navigation: INavigationOptionValue): boolean {
        return navigation.viewConfig && typeof navigation.viewConfig.maxCountValue === 'number';
    },

    isItemsCountLessThenMaxCount(itemsCount: number, navigationMaxCount: number): boolean {
        return navigationMaxCount >  itemsCount;
    },

    isDemandNavigation(navigation: INavigationOptionValue): boolean {
        return navigation && navigation.view === 'demand';
    },

    needShowShadowByNavigation(navigation: INavigationOptionValue, itemsCount: number): boolean {
        const isDemand = _private.isDemandNavigation(navigation);
        const isMaxCount = _private.isMaxCountNavigation(navigation);
        let result = true;

        if (isDemand) {
            result = false;
        } else if (isMaxCount) {
            result = _private.isItemsCountLessThenMaxCount(itemsCount, _private.getMaxCountFromNavigation(navigation));
        }

        return result;
    },

    loadToDirectionIfNeed: function(self, direction, filter) {
        const sourceController = self._sourceController;
        const allowLoadByLoadedItems = _private.needScrollCalculation(self._options.navigation) ?
            !self._loadedItems :
            true;
        const allowLoadBySource =
            sourceController &&
            sourceController.hasMoreData(direction) &&
            !sourceController.isLoading();
        const allowLoadBySearch =
            !self._options.searchValue ||
            _private.getPortionedSearch(self).shouldSearch();

        if (allowLoadBySource && allowLoadByLoadedItems && allowLoadBySearch) {
            _private.setHasMoreData(self._listViewModel, sourceController.hasMoreData(direction));
            _private.loadToDirection(
               self, direction,
               self._options.dataLoadCallback,
               self._options.dataLoadErrback,
               filter
            );
        }
    },

    // Метод, вызываемый при прокрутке скролла до триггера
    onScrollLoadEdge: function (self, direction, filter) {
        if (self._options.navigation && self._options.navigation.view === 'infinity') {
            _private.loadToDirectionIfNeed(self, direction, filter);
        }
    },

    scrollToEdge: function(self, direction) {
        _private.setMarkerAfterScroll(self);
        if (self._sourceController && self._sourceController.hasMoreData(direction)) {
            self._sourceController.setEdgeState(direction);
            _private.reload(self, self._options).addCallback(function() {
                if (direction === 'up') {
                    self._notify('doScroll', ['top'], { bubbling: true });
                } else {
                    self._notify('doScroll', ['bottom'], { bubbling: true });
                }
            });
        } else if (direction === 'up') {
            self._notify('doScroll', ['top'], { bubbling: true });
        } else {
            self._notify('doScroll', ['bottom'], { bubbling: true });
        }
    },
    scrollPage: function(self, direction) {
        if (!self._scrollPageLocked) {
            self._scrollPageLocked = true;
            _private.setMarkerAfterScroll(self);
            self._notify('doScroll', ['page' + direction], { bubbling: true });
        }
    },

    needShowPagingByScrollSize: function(self, doubleRatio) {
        let result = false;

        // если мы для списка раз вычислили, что нужен пэйджинг, то возвращаем этот статус
        // это нужно для ситуации, если первая пачка данных вернула естьЕще (в этом случае пэйджинг нужен)
        // а вторая вернула мало записей и суммарный объем менее двух вьюпортов, пэйджинг не должен исчезнуть
        if (self._cachedPagingState === true) {
            result = true;
        } else if (self._sourceController) {

            // если естьЕще данные, мы не знаем сколько их всего, превышают два вьюпорта или нет и покажем пэйдджинг
            const hasMoreData = {
                up: self._sourceController.hasMoreData('up'),
                down: self._sourceController.hasMoreData('down')
            };
            // если естьЕще данные, мы не знаем сколько их всего, превышают два вьюпорта или нет и покажем пэйдджинг
            // но если загрузка все еще идет (а ее мы смотрим по наличию триггера) не будем показывать пэджинг
            // далее может быть два варианта. След запрос вернет данные, тогда произойдет ресайз и мы проверим еще раз
            // след. запрос не вернет данные, а скажет ЕстьЕще: false тогда решать будет условие ниже, по высоте
            let visbilityTriggerUp = self._loadTriggerVisibility.up;
            let visbilityTriggerDown = self._loadTriggerVisibility.down;

            // TODO оказалось что нельзя доверять состоянию триггеров
            // https://online.sbis.ru/opendoc.html?guid=e0927a79-c520-4864-8d39-d99d36767b31
            // поэтому приходится вычислять видны ли они на экране
            if (!visbilityTriggerUp) {
                visbilityTriggerUp = self._scrollTop > self._loadOffsetTop * 1.3;
            }

            if (!visbilityTriggerDown && self._viewSize && self._viewPortSize) {
                let bottomScroll = self._viewSize - self._viewPortSize - self._scrollTop;
                if (self._pagingVisible) {
                    bottomScroll -= 32;
                }
                visbilityTriggerDown = bottomScroll < self._loadOffsetBottom * 1.3;
            }

            if ((hasMoreData.up && !visbilityTriggerUp) || (hasMoreData.down && !visbilityTriggerDown)) {
                result = true;
            }
        }

        // если условия выше не прошли, то начиличе пэйджинга зависит от того превышают данные два вьюпорта или нет
        if (!result) {
            result = doubleRatio;
        }

        // если пэйджинг был показан, запомним этот факт
        if (result) {
            self._cachedPagingState = true;
        }

        return result;
    },

    onScrollShow: function(self, params) {
        // ToDo option "loadOffset" is crutch for contacts.
        // remove by: https://online.sbis.ru/opendoc.html?guid=626b768b-d1c7-47d8-8ffd-ee8560d01076
        self._isScrollShown = true;

        self._viewPortRect = params.viewPortRect;

        const doubleRatio = (params.scrollHeight / params.clientHeight) > MIN_SCROLL_PAGING_PROPORTION;
        if (!self._scrollPagingCtr) {
            if (_private.needScrollPaging(self._options.navigation)) {
                _private.createScrollPagingController(self).addCallback(function(scrollPagingCtr) {
                    self._scrollPagingCtr = scrollPagingCtr;
                    self._pagingVisible = _private.needShowPagingByScrollSize(self, doubleRatio);
                });
            }
        } else if (_private.needScrollPaging(self._options.navigation)) {
            self._pagingVisible = _private.needShowPagingByScrollSize(self, doubleRatio);
        }
    },

    onScrollHide: function(self) {
        if (self._pagingVisible) {
            self._pagingVisible = false;
            self._forceUpdate();
        }
        self._isScrollShown = false;
    },

    createScrollPagingController: function(self) {
        var def = new Deferred();

        var scrollPagingCtr = new ScrollPagingController({
            mode: self._options.navigation.viewConfig.pagingMode,
            pagingCfgTrigger: function(cfg) {
                self._pagingCfg = cfg;
                self._forceUpdate();
            }
        });

        def.callback(scrollPagingCtr);

        return def;
    },

    getSelectionForDragNDrop: function(selectedKeys, excludedKeys, dragKey) {
        var
            selected,
            excluded,
            dragItemIndex,
            isSelectAll;
        selected = cClone(selectedKeys) || [];
        isSelectAll = selected.indexOf(null) !== -1;
        dragItemIndex = selected.indexOf(dragKey);
        if (dragItemIndex !== -1) {
            selected.splice(dragItemIndex, 1);
        }
        if (!isSelectAll) {
            selected.unshift(dragKey);
        }

        excluded = cClone(excludedKeys) || [];
        dragItemIndex = excluded.indexOf(dragKey);
        if (dragItemIndex !== -1) {
            excluded.splice(dragItemIndex, 1);
        }

        return {
            selected: selected,
            excluded: excluded
        };
    },

    showIndicator(self, direction: 'down' | 'up' | 'all' = 'all'): void {
        if (!self._isMounted || self._loadingState === 'all') {
            return;
        }

        self._loadingState = direction;
        if (direction === 'all') {
            self._loadingIndicatorState = self._loadingState;
            self._loadingIndicatorContainerOffsetTop = self._scrollTop + _private.getListTopOffset(self);
        }
        if (!self._loadingIndicatorTimer) {
            self._loadingIndicatorTimer = setTimeout(function() {
                self._loadingIndicatorTimer = null;
                if (self._loadingState) {
                    self._loadingIndicatorState = self._loadingState;
                    self._showLoadingIndicatorImage = true;
                    self._notify('controlResize');
                }
            }, 2000);
        }
    },

    hideIndicator(self): void {
        if (!self._isMounted) {
            return;
        }
        self._loadingState = null;
        self._showLoadingIndicatorImage = false;
        self._loadingIndicatorContainerOffsetTop = 0;
        if (self._loadingIndicatorTimer) {
            clearTimeout(self._loadingIndicatorTimer);
            self._loadingIndicatorTimer = null;
        }
        if (self._loadingIndicatorState !== null) {
            self._loadingIndicatorState = self._loadingState;
            self._notify('controlResize');
        }
    },

    /**
     * Обработать прокрутку списка виртуальным скроллом
     */
    handleListScroll: function(self, params) {
        var hasMoreData;

        if (self._scrollPagingCtr) {
            if (params.position === 'middle') {
                self._scrollPagingCtr.handleScroll(params.scrollTop);
            } else {
                // when scroll is at the edge we will send information to scrollPaging about the availability of data next/prev
                if (self._sourceController) {
                    hasMoreData = {
                        up: self._sourceController.hasMoreData('up'),
                        down: self._sourceController.hasMoreData('down')
                    };
                }
                self._scrollPagingCtr.handleScrollEdge(params.position, hasMoreData);
            }
        } else {
            if (_private.needScrollPaging(self._options.navigation)) {
                _private.createScrollPagingController(self).addCallback(function(scrollPagingCtr) {
                    self._scrollPagingCtr = scrollPagingCtr;
                });
            }
        }
        self._scrollPageLocked = false;
    },

    setMarkerAfterScrolling: function(self, scrollTop) {
        let itemsContainer = self._children.listView.getItemsContainer();
        let topOffset = _private.getTopOffsetForItemsContainer(self, itemsContainer);
        _private.setMarkerToFirstVisibleItem(self, itemsContainer, scrollTop - topOffset + (self._options.fixedHeadersHeights || 0));
        self._setMarkerAfterScroll = false;
    },

    // TODO KINGO: Задержка нужна, чтобы расчет видимой записи производился после фиксации заголовка
    delayedSetMarkerAfterScrolling: debounce((self, scrollTop) => {
        _private.setMarkerAfterScrolling(self, self._scrollParams ? self._scrollParams.scrollTop : scrollTop);
    }, SET_MARKER_AFTER_SCROLL_DELAY),

    getTopOffsetForItemsContainer: function(self, itemsContainer) {
        let offsetTop = uDimension(itemsContainer.children[0]).top;
        let container = self._container[0] || self._container;
        offsetTop += container.offsetTop - uDimension(container).top;
        return offsetTop;
    },

    setMarkerToFirstVisibleItem: function(self, itemsContainer, verticalOffset) {
        let firstItemIndex = self._listViewModel.getStartIndex();
        firstItemIndex += _private.getFirstVisibleItemIndex(itemsContainer, verticalOffset);
        firstItemIndex = Math.min(firstItemIndex, self._listViewModel.getStopIndex());
        if (self._options.useNewModel) {
            const item = self._listViewModel.at(firstItemIndex);
            if (item) {
                self._listViewModel.setMarkedItem(item);
            }
        } else {
            self._listViewModel.setMarkerOnValidItem(firstItemIndex);
        }
    },

    getFirstVisibleItemIndex: function(itemsContainer, verticalOffset) {
        let items = itemsContainer.children;
        let itemsCount = items.length;
        let itemsHeight = 0;
        let i = 0;
        if (verticalOffset <= 0) {
            return 0;
        }
        while (itemsHeight < verticalOffset && i < itemsCount) {
            itemsHeight += uDimension(items[i]).height;
            i++;
        }
        return i;
    },

    handleListScrollSync(self, params) {
        if (self._setMarkerAfterScroll) {
            _private.delayedSetMarkerAfterScrolling(self, params.scrollTop);
        }

        self._scrollTop = params.scrollTop;
        self._scrollPageLocked = false;
    },

    getPortionedSearch(self): PortionedSearch {
        return self._portionedSearch || (self._portionedSearch = new PortionedSearch({
            searchStopCallback: () => {
                self._showContinueSearchButton = true;
                self._sourceController.cancelLoading();
            },
            searchResetCallback: () => {
                self._showContinueSearchButton = false;
            },
            searchContinueCallback: () => {
                self._showContinueSearchButton = false;
                _private.loadToDirectionIfNeed(self, 'down');
            },
            searchAbortCallback: () => {
                self._sourceController.cancelLoading();
            }
        }));
    },

    needScrollCalculation: function (navigationOpt) {
        return navigationOpt && navigationOpt.view === 'infinity';
    },

    needScrollPaging: function(navigationOpt) {
        return (navigationOpt &&
            navigationOpt.view === 'infinity' &&
            navigationOpt.viewConfig &&
            navigationOpt.viewConfig.pagingMode
        );
    },

    getItemsCount: function(self) {
        return self._listViewModel ? self._listViewModel.getCount() : 0;
    },

    onListChange: function(self, event, changesType, action, newItems, newItemsIndex, removedItems) {
        // TODO Понять, какое ускорение мы получим, если будем лучше фильтровать
        // изменения по changesType в новой модели
        const newModelChanged = self._options.useNewModel && _private.isNewModelItemsChange(action, newItems);
        if (changesType === 'collectionChanged' || newModelChanged) {
            //TODO костыль https://online.sbis.ru/opendoc.html?guid=b56324ff-b11f-47f7-a2dc-90fe8e371835
            if (self._options.navigation && self._options.navigation.source) {
                self._sourceController.setState(self._listViewModel);
            }
            if (action === IObservable.ACTION_REMOVE && self._menuIsShown) {
                if (removedItems.find((item) => item.getContents().getId() === self._itemWithShownMenu.getId())) {
                    self._closeActionsMenu();
                    self._children.itemActionsOpener.close();
                }
            }
        }
        // VirtualScroll controller can be created and after that virtual scrolling can be turned off,
        // for example if Controls.explorer:View is switched from list to tile mode. The controller
        // will keep firing `indexesChanged` events, but we should not mark items as changed while
        // virtual scrolling is disabled.
        if (
            changesType === 'collectionChanged' ||
            changesType === 'indexesChanged' && self._options.virtualScrolling !== false ||
            newModelChanged
        ) {
            self._itemsChanged = true;
        }
        // If BaseControl hasn't mounted yet, there's no reason to call _forceUpdate
        if (self._isMounted) {
            self._forceUpdate();
        }
    },

    initListViewModelHandler: function(self, model, useNewModel: boolean) {
        if (useNewModel) {
            model.subscribe('onCollectionChange', (...args: any[]) => {
                _private.onListChange.apply(
                    null,
                    [
                        self,
                        args[0], // event
                        null, // changes type
                        ...args.slice(1) // the rest of the arguments
                    ]
                );
            });
        } else {
            model.subscribe('onListChange', _private.onListChange.bind(null, self));
        }

        model.subscribe('onGroupsExpandChange', function(event, changes) {
            _private.groupsExpandChangeHandler(self, changes);
        });
    },

    mockTarget(target: HTMLElement): {
        getBoundingClientRect: () => ClientRect
    } {
        const clientRect = target.getBoundingClientRect();
        return {
            getBoundingClientRect: () => clientRect
        };
    },

    showActionsMenu: function(self, event, itemData, childEvent, showAll) {
        const context = event.type === 'itemcontextmenu';
        const itemActions = self._options.useNewModel ? itemData.getActions() : itemData.itemActions;
        if ((context && self._isTouch) || !itemActions) {
            return false;
        }
        const showActions = showAll && itemActions.all
            ? itemActions.all
            : itemActions && itemActions.all.filter(
            (action) => action.showType !== showType.TOOLBAR
        );
        /**
         * During an opening of a menu, a row can get wrapped in a HoC and it would cause a full redraw of the row,
         * which would remove the target from the DOM.
         * So, we have to save target's ClientRect here in order to work around it.
         * But popups don't work with ClientRect, so we have to wrap it in an object with getBoundingClientRect method.
         */
        const target = context ? null : _private.mockTarget(childEvent.target);
        if (showActions && showActions.length) {
            const rs = new RecordSet({ rawData: showActions, keyProperty: 'id' });
            childEvent.nativeEvent.preventDefault();
            childEvent.stopImmediatePropagation();
            self._listViewModel.setActiveItem(itemData);
            if (!self._options.useNewModel) {
                // TODO Do we need this in new model?
                self._listViewModel.setMenuState('shown');
            }
            self._itemWithShownMenu = self._options.useNewModel ? itemData.getContents() : itemData.item;
            require(['css!theme?Controls/toolbars'], function() {
                const defaultMenuConfig = {
                    items: rs,
                    keyProperty: 'id',
                    parentProperty: 'parent',
                    nodeProperty: 'parent@',
                    dropdownClassName: 'controls-itemActionsV__popup',
                    showClose: true
                };

                if (self._options.contextMenuConfig) {
                    if (typeof self._options.contextMenuConfig === 'object') {
                        cMerge(defaultMenuConfig, self._options.contextMenuConfig);
                    } else {
                        Logger.error('Controls/list:View: Некорректное значение опции contextMenuConfig. Ожидается объект');
                    }
                }

                self._children.itemActionsOpener.open({
                    opener: self._children.listView,
                    target,
                    templateOptions: defaultMenuConfig,
                    eventHandlers: {
                        onResult: self._closeActionsMenu,
                        onClose: self._closeActionsMenu
                    },
                    closeOnOutsideClick: true,
                    targetPoint: {vertical: 'top', horizontal: 'right'},
                    direction: {horizontal: context ? 'right' : 'left'},
                    className: 'controls-Toolbar__popup__list_theme-' + self._options.theme,
                    nativeEvent: context ? childEvent.nativeEvent : false
                });
                self._menuIsShown = true;
                self._forceUpdate();
            });
        }
    },

    showActionMenu(
        self: Control,
        itemData,
        childEvent: Event,
        action: object
    ): void {
        /**
         * For now, BaseControl opens menu because we can't put opener inside ItemActionsControl, because we'd get 2 root nodes.
         * When we get fragments or something similar, it would be possible to move this code where it really belongs.
         */
        const itemActions = self._options.useNewModel ? itemData.getActions() : itemData.itemActions;
        const children = self._children.itemActions.getChildren(action, itemActions.all);
        if (children.length) {
            self._listViewModel.setActiveItem(itemData);
            if (!self._options.useNewModel) {
                // TODO Do we need this in new model?
                self._listViewModel.setMenuState('shown');
            }
            require(['css!Controls/input'], () => {
                self._children.itemActionsOpener.open({
                    opener: self._children.listView,
                    target: childEvent.target,
                    templateOptions: {
                        items: new RecordSet({ rawData: children, keyProperty: 'id' }),
                        keyProperty: 'id',
                        parentProperty: 'parent',
                        nodeProperty: 'parent@',
                        groupTemplate: self._options.contextMenuConfig && self._options.contextMenuConfig.groupTemplate,
                        groupingKeyCallback: self._options.contextMenuConfig && self._options.contextMenuConfig.groupingKeyCallback,
                        rootKey: action.id,
                        showHeader: true,
                        dropdownClassName: 'controls-itemActionsV__popup',
                        headConfig: {
                            caption: action.title
                        }
                    },
                    eventHandlers: {
                        onResult: self._closeActionsMenu,
                        onClose: self._closeActionsMenu
                    },
                    className: 'controls-DropdownList__margin-head'
                });
                self._actionMenuIsShown = true;
                self._forceUpdate();
            });
        }
    },

    closeActionsMenu: function(self, args) {
        var
            actionName = args && args.action,
            event = args && args.event;

        function closeMenu() {
            self._listViewModel.setActiveItem(null);
            if (!self._options.useNewModel) {
                // TODO Do we need this in new model?
                self._listViewModel.setMenuState('hidden');
            }
            self._children.swipeControl && self._children.swipeControl.closeSwipe();
            self._menuIsShown = false;
            self._itemWithShownMenu = null;
            self._actionMenuIsShown = false;
        }

        if (actionName === 'itemClick') {
            var action = args.data && args.data[0] && args.data[0].getRawData();
            aUtil.itemActionsClick(self, event, action, self._listViewModel.getActiveItem(), self._listViewModel);
            if (!action['parent@']) {
                self._children.itemActionsOpener.close();
                closeMenu();
            }
        } else {
            closeMenu();
        }
        self._forceUpdate();
    },

    bindHandlers: function(self) {
        self._closeActionsMenu = self._closeActionsMenu.bind(self);
    },

    groupsExpandChangeHandler: function(self, changes) {
        self._notify(changes.changeType === 'expand' ? 'groupExpanded' : 'groupCollapsed', [changes.group], { bubbling: true });
        self._notify('collapsedGroupsChanged', [changes.collapsedGroups]);
        _private.prepareFooter(self, self._options.navigation, self._sourceController);
        if (self._options.historyIdCollapsedGroups || self._options.groupHistoryId) {
            GroupUtil.storeCollapsedGroups(changes.collapsedGroups, self._options.historyIdCollapsedGroups || self._options.groupHistoryId);
        }
    },

    prepareCollapsedGroups: function(config) {
        var
            result = new Deferred();
        if (config.historyIdCollapsedGroups || config.groupHistoryId) {
            GroupUtil.restoreCollapsedGroups(config.historyIdCollapsedGroups || config.groupHistoryId).addCallback(function(collapsedGroupsFromStore) {
                result.callback(collapsedGroupsFromStore || config.collapsedGroups);
            });
        } else {
            result.callback(config.collapsedGroups);
        }
        return result;
    },

    getSortingOnChange: function(currentSorting, propName, sortingType) {
        var sorting = cClone(currentSorting || []);
        var sortElemIndex = -1;
        var sortElem;
        var newSortElem = {};

        //use same algorithm when sortingType is not 'single', if the number of properties is equal to one
        if (sortingType !== 'single' || sorting.length === 1 && sorting[0][propName]) {
            sorting.forEach(function(elem, index) {
                if (elem.hasOwnProperty(propName)) {
                    sortElem = elem;
                    sortElemIndex = index;
                }
            });
        } else {
            sorting = [];
        }

        // change sorting direction by rules:
        // 'DESC' -> 'ASC'
        // 'ASC' -> empty
        // empty -> 'DESC'
        if (sortElem) {
            if (sortElem[propName] === 'DESC') {
                sortElem[propName] = 'ASC';
            } else {
                sorting.splice(sortElemIndex, 1);
            }
        } else {
            newSortElem[propName] = 'DESC';
            sorting.push(newSortElem);
        }

        return sorting;
    },

    /**
     * @param {Controls/_list/BaseControl} self
     * @param {ErrbackConfig} config
     * @return {Promise}
     * @private
     */
    crudErrback(self: BaseControl, config: ErrbackConfig): Promise<CrudResult>{
        return _private.processError(self, config).then(getData);
    },

    /**
     * @param {Controls/_list/BaseControl} self
     * @param {ErrbackConfig} config
     * @return {Promise.<CrudResult>}
     * @private
     */
    processError(self: BaseControl, config: ErrbackConfig): Promise<CrudResult> {
        if (config.dataLoadErrback instanceof Function) {
            config.dataLoadErrback(config.error);
        }
        if (!config.error.canceled) {
            _private.hideIndicator(self);
        }
        return self.__errorController.process({
            error: config.error,
            mode: config.mode || dataSourceError.Mode.include
        }).then((errorConfig) => {
            _private.showError(self, errorConfig);
            return {
                error: config.error,
                errorConfig: errorConfig
            };
        });
    },

    /**
     * @param {Controls/_list/BaseControl} self
     * @param {Controls/dataSource:error.ViewConfig} errorConfig
     * @private
     */
    showError(self: BaseControl, errorConfig: dataSourceError.ViewConfig): void {
        self.__error = errorConfig;
        self._forceUpdate();
    },

    hideError(self: BaseControl): void {
        if (self.__error) {
            self.__error = null;
            self._forceUpdate();
        }
    },

    calcPaging(self, hasMore: number | boolean, pageSize: number): number {
        let newKnownPagesCount = self._knownPagesCount;

        if (typeof hasMore === 'number') {
            newKnownPagesCount = Math.ceil(hasMore / pageSize);
        } else if (typeof hasMore === 'boolean' && hasMore && self._currentPage === self._knownPagesCount) {
            newKnownPagesCount++;
        }

        return newKnownPagesCount;
    },

    getPagingLabelData: function(totalItemsCount, pageSize, currentPage) {
        let pagingLabelData;
        if (typeof totalItemsCount === 'number') {
            pagingLabelData = {
                totalItemsCount: totalItemsCount,
                pageSize: pageSize.toString(),
                firstItemNumber: (currentPage - 1) * pageSize + 1,
                lastItemNumber: Math.min(currentPage * pageSize, totalItemsCount)
            };
        } else {
            pagingLabelData = null;
        }
        return pagingLabelData;
    },

    getSourceController: function({source, navigation, keyProperty}:{source: ICrud, navigation: object, keyProperty: string}): SourceController {
        return new SourceController({
            source: source,
            navigation: navigation,
            keyProperty: keyProperty
        })
    },

    checkRequiredOptions: function(options) {
        if (options.keyProperty === undefined) {
            Logger.warn('BaseControl: Option "keyProperty" is required.');
        }
    },

    needBottomPadding: function(options, items, listViewModel) {
        return (!!items &&
            (!!items.getCount() ||
                (options.useNewModel ? listViewModel.isEditing() : !!listViewModel.getEditingItemData())) &&
            options.itemActionsPosition === 'outside' &&
            !options.footerTemplate &&
            options.resultsPosition !== 'bottom');
    },

    isPagingNavigation: function(navigation) {
        return navigation && navigation.view === 'pages';
    },
    resetPagingNavigation: function(self, navigation) {
        self._knownPagesCount = INITIAL_PAGES_COUNT;
        self._currentPageSize = navigation && navigation.sourceConfig && navigation.sourceConfig.pageSize || 1;

        //TODO: KINGO
        // нумерация страниц пейджинга начинается с 1, а не с 0 , поэтому текущая страница пейджига это страница навигации + 1
        self._currentPage = navigation && navigation.sourceConfig && navigation.sourceConfig.page + 1 || INITIAL_PAGES_COUNT;
    },

    initializeNavigation: function(self, cfg) {
        self._needScrollCalculation = _private.needScrollCalculation(cfg.navigation);
        self._pagingNavigation = _private.isPagingNavigation(cfg.navigation);

        if (self._pagingNavigation) {
            _private.resetPagingNavigation(self, cfg.navigation);
            self._pageSizeSource = new Memory({
                keyProperty: 'id',
                data: PAGE_SIZE_ARRAY
            });
        } else {
            self._pagingNavigationVisible = false;
            _private.resetPagingNavigation(self, cfg.navigation);
        }
    },
    updateNavigation: function(self) {
        self._pagingNavigationVisible = self._pagingNavigation;
    },
    isBlockedForLoading(loadingIndicatorState): boolean {
        return loadingIndicatorState === 'all';
    },
    getLoadingIndicatorClasses(cfg: {
        hasItems: boolean,
        hasPaging: boolean,
        loadingIndicatorState: 'all' | 'down' | 'up'
    }): string {
        return CssClassList.add('controls-BaseControl__loadingIndicator')
            .add(`controls-BaseControl__loadingIndicator__state-${cfg.loadingIndicatorState}`)
            .add('controls-BaseControl_empty__loadingIndicator__state-down', !cfg.hasItems && cfg.loadingIndicatorState === 'down')
            .add('controls-BaseControl_withPaging__loadingIndicator__state-down', cfg.loadingIndicatorState === 'down' && cfg.hasPaging && cfg.hasItems)
            .compile();
    },
    hasItemActions: function(itemActions, itemActionsProperty) {
        return !!(itemActions || itemActionsProperty);
    },
    updateIndicatorContainerHeight(self, viewRect: DOMRect, viewPortRect: DOMRect): void {
        let top;
        let bottom;
        if (self._isScrollShown || (self._needScrollCalculation && viewRect && viewPortRect)) {
            top = Math.max(viewRect.y, viewPortRect.y);
            bottom = Math.min(viewRect.y + viewRect.height, viewPortRect.y + viewPortRect.height);
        } else {
            top = viewRect.top;
            bottom = viewRect.bottom;
        }
        let newHeight = bottom - top - _private.getListTopOffset(self);

        if (self._loadingIndicatorContainerHeight !== newHeight) {
            self._loadingIndicatorContainerHeight = newHeight;
        }
    },
    getListTopOffset(self): number {
        const view = self._children && self._children.listView;
        let height = 0;
        if (view && view.getHeaderHeight) {
            height += view.getHeaderHeight();
        }
        if (view && view.getResultsHeight) {
            height += view.getResultsHeight();
        }
        return height;
    },
    setHasMoreData(model, hasMoreData: boolean): boolean {
        if (model) {
            model.setHasMoreData(hasMoreData);
        }
    },
    notifyIfDragging(self, eName, itemData, nativeEvent){
        const model = self.getViewModel();
        if (model.getDragEntity() || model.getDragItemData()) {
            self._notify(eName, [itemData, nativeEvent]);
        }
    }
};

/**
 * Компонент плоского списка, с произвольным шаблоном отображения каждого элемента. Обладает возможностью загрузки/подгрузки данных из источника.
 * @class Controls/_list/BaseControl
 * @extends Core/Control
 * @mixes Controls/_interface/ISource
 * @implements Controls/_interface/IErrorController
 * @mixes Controls/interface/IItemTemplate
 * @mixes Controls/interface/IPromisedSelectable
 * @mixes Controls/interface/IGroupedList
 * @mixes Controls/_interface/INavigation
 @mixes Controls/_interface/IFilter
 * @mixes Controls/interface/IHighlighter
 * @mixes Controls/interface/IEditableList
 * @mixes Controls/_list/BaseControl/Styles
 * @control
 * @private
 * @author Авраменко А.С.
 * @category List
 */

var BaseControl = Control.extend(/** @lends Controls/_list/BaseControl.prototype */{
    _isMounted: false,

    _savedStartIndex: 0,
    _savedStopIndex: 0,

    _template: BaseControlTpl,
    iWantVDOM: true,
    _isActiveByClick: false,
    _markedKeyForRestoredScroll: null,
    _restoredScroll: null,

    _listViewModel: null,
    _viewModelConstructor: null,

    _loadMoreCaption: null,
    _shouldDrawFooter: false,

    _loader: null,
    _loadingState: null,
    _loadingIndicatorState: null,
    _loadingIndicatorTimer: null,

    _pagingCfg: null,
    _pagingVisible: false,

    // если пэйджинг в скролле показался то запоним это состояние и не будем проверять до след перезагрузки списка
    _cachedPagingState: false,

    _itemTemplate: null,

    _isScrollShown: false,
    _needScrollCalculation: false,
    _loadTriggerVisibility: null,
    _loadOffsetTop: LOAD_TRIGGER_OFFSET,
    _loadOffsetBottom: LOAD_TRIGGER_OFFSET,
    _loadingIndicatorContainerOffsetTop: 0,
    _menuIsShown: null,
    _viewSize: null,
    _viewPortSize: null,
    _scrollTop: 0,
    _popupOptions: null,

    //Variables for paging navigation
    _knownPagesCount: INITIAL_PAGES_COUNT,
    _currentPage: INITIAL_PAGES_COUNT,
    _pagingNavigation: false,
    _pagingNavigationVisible: false,
    _pagingLabelData: null,

    _blockItemActionsByScroll: false,

    _needBottomPadding: false,
    _noDataBeforeReload: null,
    _intertialScrolling: null,
    _checkLoadToDirectionTimeout: null,

    _resetScrollAfterReload: false,
    _scrollPageLocked: false,

    _itemReloaded: false,
    _itemActionsInitialized: false,

    constructor(options) {
        BaseControl.superclass.constructor.apply(this, arguments);
        options = options || {};
        this.__errorController = options.errorController || new dataSourceError.Controller({});
    },

    /**
     * @param {Object} newOptions
     * @param {Object} context
     * @param {ReceivedState} receivedState
     * @return {Promise}
     * @protected
     */
    _beforeMount: function(newOptions, context, receivedState: ReceivedState = {}) {
        var self = this;

        // todo Костыль, т.к. построение ListView зависит от SelectionController.
        // Будет удалено при выполнении одного из пунктов:
        // 1. Все перешли на платформенный хелпер при формировании рекордсета на этапе первой загрузки и удален асинхронный код из SelectionController.beforeMount.
        // 2. Полностью переведен BaseControl на новую модель и SelectionController превращен в умный, упорядоченный менеджер, умеющий работать асинхронно.
        this._multiSelectReadyCallback = this._multiSelectReadyCallbackFn.bind(this);

        let receivedError = receivedState.errorConfig;
        let receivedData = receivedState.data;

        _private.checkDeprecated(newOptions);
        _private.checkRequiredOptions(newOptions);

        _private.bindHandlers(this);

        _private.initializeNavigation(this, newOptions);
        _private.updateNavigation(this);

        this._needSelectionController = newOptions.multiSelectVisibility !== 'hidden';
        this._loadTriggerVisibility = {};

        this._hasItemActions = _private.hasItemActions(newOptions.itemActions, newOptions.itemActionsProperty);

        return _private.prepareCollapsedGroups(newOptions).addCallback(function(collapsedGroups) {
            let viewModelConfig = cClone(newOptions);
            if (collapsedGroups) {
                viewModelConfig = cMerge(viewModelConfig, { collapsedGroups });
            }

            if (!newOptions.useNewModel && newOptions.viewModelConstructor) {
                self._viewModelConstructor = newOptions.viewModelConstructor;
                if (receivedData) {
                    viewModelConfig.items = receivedData;
                } else {
                    delete viewModelConfig.items;
                }
                self._listViewModel = new newOptions.viewModelConstructor(viewModelConfig);
            } else if (newOptions.useNewModel && receivedData) {
                self._listViewModel = self._createNewModel(
                    receivedData,
                    viewModelConfig,
                    newOptions.viewModelConstructor
                );
                if (newOptions.itemsReadyCallback) {
                    newOptions.itemsReadyCallback(self._listViewModel.getCollection());
                }
            }
            if (self._listViewModel) {
                _private.initListViewModelHandler(self, self._listViewModel, newOptions.useNewModel);
            }

            if (newOptions.source) {
                self._sourceController = _private.getSourceController(newOptions);


                if (receivedData) {
                    self._sourceController.calculateState(receivedData);
                    if (newOptions.useNewModel) {
                        self._items = self._listViewModel.getCollection();
                    } else {
                        self._items = self._listViewModel.getItems();
                    }
                    self._needBottomPadding = _private.needBottomPadding(newOptions, self._items, self._listViewModel);
                    if (self._pagingNavigation) {
                        var hasMoreData = self._items.getMetaData().more;
                        self._knownPagesCount = _private.calcPaging(self, hasMoreData, self._currentPageSize);
                        self._pagingLabelData = _private.getPagingLabelData(hasMoreData, self._currentPageSize, self._currentPage);
                    }

                    if (newOptions.serviceDataLoadCallback instanceof Function) {
                        newOptions.serviceDataLoadCallback(null, self._items);
                    }
                    if (newOptions.dataLoadCallback instanceof Function) {
                        newOptions.dataLoadCallback(self._items);
                    }
                    _private.prepareFooter(self, newOptions.navigation, self._sourceController);
                    return;
                }
                if (receivedError) {
                    return _private.showError(self, receivedError);
                }
                return _private.reload(self, newOptions).addCallback((result) => {
                    if (newOptions.useNewModel && !self._listViewModel && result.data) {
                        self._listViewModel = self._createNewModel(
                            result.data,
                            viewModelConfig,
                            newOptions.viewModelConstructor
                        );
                        if (newOptions.itemsReadyCallback) {
                            newOptions.itemsReadyCallback(self._listViewModel.getCollection());
                        }
                        if (self._listViewModel) {
                            _private.initListViewModelHandler(self, self._listViewModel, newOptions.useNewModel);
                        }
                    }
                    // TODO Kingo.
                    // В случае, когда в опцию источника передают PrefetchProxy
                    // не надо возвращать из _beforeMount загруженный рекордсет, это вызывает проблему,
                    // когда список обёрнут в DataContainer.
                    // Т.к. и список и DataContainer из _beforeMount возвращают рекордсет
                    // то при построении на сервере и последующем оживлении на клиенте
                    // при сериализации это будет два разных рекордсета.
                    // Если при загрузке данных возникла ошибка, то ошибку надо вернуть, чтобы при оживлении на клиенте
                    // не было перезапроса за данными.
                    if (result.errorConfig || !cInstance.instanceOfModule(newOptions.source, 'Types/source:PrefetchProxy')) {
                        return getState(result);
                    }
                });
            }
        });

    },

    scrollMoveSyncHandler(_: SyntheticEvent<Event>, params: unknown): void {
        _private.handleListScrollSync(this, params);
    },

    scrollMoveHandler(_: SyntheticEvent<Event>, params: unknown): void {
        _private.handleListScroll(this, params);
    },

    canScrollHandler(_: SyntheticEvent<Event>, params: unknown): void {
        _private.onScrollShow(this, params);
    },

    cantScrollHandler(): void {
        _private.onScrollHide(this);
    },

    viewportResizeHandler(_: SyntheticEvent<Event>, viewportHeight: number, viewportRect): void {
        const container = this._container[0] || this._container;
        _private.updateIndicatorContainerHeight(this, container.getBoundingClientRect(), viewportRect);
        this._viewPortSize = viewportHeight;
        this._viewPortRect = viewportRect;
    },

    scrollResizeHandler(_: SyntheticEvent<Event>, params: unknown): void {
        const doubleRatio = (params.scrollHeight / params.clientHeight) > MIN_SCROLL_PAGING_PROPORTION;
        if (_private.needScrollPaging(this._options.navigation)) {
            // внутри метода проверки используется состояние триггеров, а их IO обновляет не синхронно,
            // поэтому нужен таймаут
            setTimeout(() => {
                this._pagingVisible = _private.needShowPagingByScrollSize(this, doubleRatio);
            }, 18);
        }
    },

    updateShadowModeHandler(_: SyntheticEvent<Event>, placeholderSizes: {top: number, bottom: number}): void {
        const itemsCount = this._listViewModel && this._listViewModel.getCount();
        const hasMoreData = (direction) => this._sourceController && this._sourceController.hasMoreData(direction);
        const showShadowByNavigation = _private.needShowShadowByNavigation(this._options.navigation, itemsCount);

        this._notify('updateShadowMode', [{
            top: (placeholderSizes.top || showShadowByNavigation && itemsCount && hasMoreData('up')) ? 'visible' : 'auto',
            bottom: (placeholderSizes.bottom || showShadowByNavigation && itemsCount && hasMoreData('down')) ? 'visible' : 'auto'
        }], {bubbling: true});
    },

    loadMore(_: SyntheticEvent<Event>, direction: IDireciton): void {
        _private.loadToDirectionIfNeed(this, direction, this._options.filter);
    },

    triggerVisibilityChangedHandler(_: SyntheticEvent<Event>, direction: IDireciton, state: boolean): void {
        this._loadTriggerVisibility[direction] = state;
    },

    triggerOffsetChangedHandler(_: SyntheticEvent<Event>, top: number, bottom: number): void {
        this._loadOffsetTop = top;
        this._loadOffsetBottom = bottom;
    },

    changeIndicatorStateHandler(_: SyntheticEvent<Event>, state: boolean, indicatorName: 'top' | 'bottom'): void {
          if (state) {
              this._children[`${indicatorName}LoadingIndicator`].style.display = '';
          } else {
              this._children[`${indicatorName}LoadingIndicator`].style.display = 'none';
          }
    },

    _viewResize(): void {
        const container = this._container[0] || this._container;
        this._viewSize = container.clientHeight;
        _private.updateIndicatorContainerHeight(this, container.getBoundingClientRect(), this._viewPortRect);
    },

    // todo Костыль, т.к. построение ListView зависит от SelectionController.
    // Будет удалено при выполнении одного из пунктов:
    // 1. Все перешли на платформенный хелпер при формировании рекордсета на этапе первой загрузки и удален асинхронный код из SelectionController.beforeMount.
    // 2. Полностью переведен BaseControl на новую модель и SelectionController превращен в умный, упорядоченный менеджер, умеющий работать асинхронно.
    _multiSelectReadyCallbackFn: function(multiSelectReady) {
        this._multiSelectReady = multiSelectReady;
    },

    getViewModel: function() {
        return this._listViewModel;
    },

    getSourceController: function() {
        return this._sourceController;
    },

    _onActivated: function() {
        this._isActive = true;
    },

    _onDeactivated: function() {
        this._isActive = false;
    },

    _afterMount: function() {
        this._isMounted = true;
        const container = this._container[0] || this._container;
        this._viewSize = container.clientHeight;
        if (this._options.itemsDragNDrop) {
            container.addEventListener('dragstart', this._nativeDragStart);
        }
        this._loadedItems = null;
    },

    _beforeUpdate: function(newOptions) {
        var filterChanged = !isEqual(newOptions.filter, this._options.filter);
        var navigationChanged = !isEqual(newOptions.navigation, this._options.navigation);
        var resetPaging = this._pagingNavigation && filterChanged;
        var recreateSource = newOptions.source !== this._options.source || navigationChanged || resetPaging;
        var sortingChanged = !isEqual(newOptions.sorting, this._options.sorting);
        var self = this;
        this._needBottomPadding = _private.needBottomPadding(newOptions, this._items, self._listViewModel);
        if (!isEqual(newOptions.navigation, this._options.navigation)) {
            _private.initializeNavigation(this, newOptions);
        }
        _private.updateNavigation(this);

        if (
            !newOptions.useNewModel &&
            (
                newOptions.groupMethod !== this._options.groupMethod ||
                newOptions.viewModelConstructor !== this._viewModelConstructor
            )
        ) {
            if (this._children.editInPlace && this._listViewModel.getEditingItemData()) {
                this._children.editInPlace.cancelEdit();
            }
            this._viewModelConstructor = newOptions.viewModelConstructor;
            const items = this._listViewModel.getItems();
            this._listViewModel.destroy();
            this._listViewModel = new newOptions.viewModelConstructor(cMerge(cClone(newOptions), {
                items
            }));
            _private.initListViewModelHandler(this, this._listViewModel, newOptions.useNewModel);
        }

        if (newOptions.groupMethod !== this._options.groupMethod) {
            _private.reload(this, newOptions);
        }

        if (newOptions.collapsedGroups !== this._options.collapsedGroups) {
            this._listViewModel.setCollapsedGroups(newOptions.collapsedGroups);
        }

        if (newOptions.keyProperty !== this._options.keyProperty) {
            this._listViewModel.setKeyProperty(newOptions.keyProperty);
        }

        if (newOptions.markedKey !== this._options.markedKey) {
            this._listViewModel.setMarkedKey(newOptions.markedKey);
        }

        if (newOptions.markerVisibility !== this._options.markerVisibility) {
            this._listViewModel.setMarkerVisibility(newOptions.markerVisibility);
        }

        if (newOptions.searchValue !== this._options.searchValue) {
            this._listViewModel.setSearchValue(newOptions.searchValue);

            if (!newOptions.searchValue) {
                _private.getPortionedSearch(self).reset();
            }
        }
        if (newOptions.editingConfig !== this._options.editingConfig) {
            this._listViewModel.setEditingConfig(newOptions.editingConfig);
        }
        if (recreateSource) {
            this._recreateSourceController(newOptions.source, newOptions.navigation, newOptions.keyProperty);

            //Нужно обновлять опции записи не только при наведении мыши,
            //так как запись может поменяться в то время, как курсор находится на ней
            this._shouldUpdateItemActions = true;
        }

        if (newOptions.multiSelectVisibility !== this._options.multiSelectVisibility) {
            this._listViewModel.setMultiSelectVisibility(newOptions.multiSelectVisibility);
        }
        this._needSelectionController = newOptions.multiSelectVisibility !== 'hidden' || this._delayedSelect;

        if (newOptions.itemTemplateProperty !== this._options.itemTemplateProperty) {
            this._listViewModel.setItemTemplateProperty(newOptions.itemTemplateProperty);
        }

        if (sortingChanged) {
            this._listViewModel.setSorting(newOptions.sorting);
        }

        if (filterChanged || recreateSource || sortingChanged) {
            _private.resetPagingNavigation(this, newOptions.navigation);

            //return result here is for unit tests
            return _private.reload(self, newOptions);
        }

        if (this._itemsChanged) {
            this._shouldNotifyOnDrawItems = true;
            this._shouldUpdateItemActions = true;
        }

        if (this._loadedItems) {
            this._shouldRestoreScrollPosition = true;
        }
    },

    reloadItem: function(key:String, readMeta:Object, replaceItem:Boolean, reloadType = 'read'):Deferred {
        const items = this._listViewModel.getItems();
        const currentItemIndex = items.getIndexByValue(this._options.keyProperty, key);
        const sourceController = _private.getSourceController(this._options);

        let reloadItemDeferred;
        let filter;
        let itemsCount;

        const loadCallback = (item): void => {
            if (replaceItem) {
                items.replace(item, currentItemIndex);
            } else {
                items.at(currentItemIndex).merge(item);
            }

            // New item has a version of 0. If the replaced item has the same
            // version, it will not be redrawn. Notify the model that the
            // item was reloaded to force its redraw.
            if (item && item.getId) {
                this._listViewModel.markItemReloaded(item.getId());
                this._itemReloaded = true;
            }
        };

        if (currentItemIndex === -1) {
            throw new Error('BaseControl::reloadItem no item with key ' + key);
        }

        if (reloadType === 'query') {
            filter = cClone(this._options.filter);
            filter[this._options.keyProperty] = [key];
            reloadItemDeferred = sourceController.load(filter).addCallback((items) => {
                itemsCount = items.getCount();

                if (itemsCount === 1) {
                    loadCallback(items.at(0));
                } else if (itemsCount > 1) {
                    Logger.error('BaseControl: reloadItem::query returns wrong amount of items for reloadItem call with key: ' + key);
                } else {
                    Logger.info('BaseControl: reloadItem::query returns empty recordSet.');
                }
                return items;
            });
        } else {
            reloadItemDeferred = sourceController.read(key, readMeta).addCallback((item) => {
                if (item) {
                    loadCallback(item);
                } else {
                    Logger.info('BaseControl: reloadItem::read do not returns record.');
                }
                return item;
            });
        }

        return reloadItemDeferred.addErrback((error) => {
            return _private.crudErrback(this, {
                error: error,
                mode: dataSourceError.Mode.dialog
            });
        });
    },

    scrollToItem(key: string|number): void {
        return _private.scrollToItem(this, key);
    },

    _beforeUnmount: function() {
        if (this._checkLoadToDirectionTimeout) {
            clearTimeout(this._checkLoadToDirectionTimeout);
        }
        if (this._options.itemsDragNDrop) {
            let container = this._container[0] || this._container;
            container.removeEventListener('dragstart', this._nativeDragStart);
        }
        if (this._sourceController) {
            this._sourceController.destroy();
        }

        if (this._scrollPagingCtr) {
            this._scrollPagingCtr.destroy();
        }

        if (this._listViewModel) {
            this._listViewModel.destroy();
        }
        this._loadTriggerVisibility = null;

        BaseControl.superclass._beforeUnmount.apply(this, arguments);
    },

    _beforeRender(): void {
        if (this._saveAndRestoreScrollPosition) {
            /**
             * This event should bubble, because there can be anything between Scroll/Container and the list,
             * and we can't force everyone to manually bubble it.
             */
            this._notify('saveScrollPosition', [], { bubbling: true });
        }
        // Браузер при замене контента всегда пытается восстановить скролл в прошлую позицию.
        // Т.е. если scrollTop = 1000, а размер нового контента будет лишь 500, то видимым будет последний элемент.
        // Из-за этого получится что мы вначале из-за нативного подскрола видим последний элемент, а затем сами
        // устанавливаем скролл в "0".
        // Как итог - контент мелькает. Поэтому сбрасываем скролл в 0 именно ДО отрисовки.
        // Пример ошибки: https://online.sbis.ru/opendoc.html?guid=c3812a26-2301-4998-8283-bcea2751f741
        // Демка нативного поведения: https://jsfiddle.net/alex111089/rjuc7ey6/1/
        if (this._shouldNotifyOnDrawItems) {
            if (this._resetScrollAfterReload) {
                this._notify('doScroll', ['top'], {bubbling: true});
                this._resetScrollAfterReload = false;
            }
        }
    },

    _beforePaint(): void {
        // todo KINGO.
        // При вставке новых записей в DOM браузер сохраняет текущую позицию скролла.
        // Таким образом триггер загрузки данных срабатывает ещё раз и происходит зацикливание процесса загрузки.
        // Демо на jsFiddle: https://jsfiddle.net/alex111089/9q0hgdre/
        // Чтобы предотвратить эту ошибку - восстанавливаем скролл на ту позицию, которая была до вставки новых записей.
        // todo 2 Фантастически, но свежеиспеченный afterRender НЕ ПОДХОДИТ! Падают тесты. ХФ на носу, разбираться
        // некогда, завел подошибку: https://online.sbis.ru/opendoc.html?guid=d83711dd-a110-4e10-b279-ade7e7e79d38
        if (this._shouldRestoreScrollPosition) {
            _private.restoreScrollPosition(this);
            this._loadedItems = null;
            this._shouldRestoreScrollPosition = false;
            this._children.scrollController.checkTriggerVisibilityWithTimeout();
        }

        if (this._restoredScroll !== null) {
            _private.scrollToItem(this, this._restoredScroll.key, this._restoredScroll.toBottom);
            this._restoredScroll = null;
        }
    },

    _afterUpdate: function(oldOptions) {
        if (this._shouldUpdateItemActions && this._itemActionsInitialized) {
            this._shouldUpdateItemActions = false;
            this._updateItemActions();
        }
        if (this._shouldNotifyOnDrawItems) {
            this._notify('drawItems');
            this._shouldNotifyOnDrawItems = false;
            this._itemsChanged = false;
        }
        if (this._delayedSelect && this._children.selectionController) {
            this._children.selectionController.onCheckBoxClick(this._delayedSelect.key, this._delayedSelect.status);
            this._notify('checkboxClick', [this._delayedSelect.key, this._delayedSelect.status]);
            this._delayedSelect = null;
        }

        //FIXME need to delete after https://online.sbis.ru/opendoc.html?guid=4db71b29-1a87-4751-a026-4396c889edd2
        if (oldOptions.hasOwnProperty('loading') && oldOptions.loading !== this._options.loading) {
            if (this._options.loading && this._loadingState === null) {
                _private.showIndicator(this);
            } else if (!this._sourceController.isLoading() && this._loadingState === 'all') {
                _private.hideIndicator(this);
            }
        }

        // After update the reloaded items have been redrawn, clear
        // the marks in the model
        if (this._itemReloaded) {
            this._listViewModel.clearReloadedMarks();
            this._itemReloaded = false;
        }

        this._scrollPageLocked = false;
    },

    __onPagingArrowClick: function(e, arrow) {
        switch (arrow) {
            case 'Next': _private.scrollPage(this, 'Down'); break;
            case 'Prev': _private.scrollPage(this, 'Up'); break;
            case 'Begin': _private.scrollToEdge(this, 'up'); break;
            case 'End': _private.scrollToEdge(this, 'down'); break;
        }
    },

    __needShowEmptyTemplate: function(emptyTemplate: Function | null, listViewModel: ListViewModel): boolean {
        // Described in this document: https://docs.google.com/spreadsheets/d/1fuX3e__eRHulaUxU-9bXHcmY9zgBWQiXTmwsY32UcsE
        const noData = !listViewModel.getCount();
        const noEdit = this._options.useNewModel ? !listViewModel.isEditing() : !listViewModel.getEditingItemData();
        const isLoading = this._sourceController && this._sourceController.isLoading();
        const notHasMore = !(this._sourceController && (this._sourceController.hasMoreData('down') || this._sourceController.hasMoreData('up')));
        const noDataBeforeReload = this._noDataBeforeReload;
        return emptyTemplate && noEdit && notHasMore && (isLoading ? noData && noDataBeforeReload : noData);
    },

    _onCheckBoxClick: function(e, key, status) {
        this._children.selectionController.onCheckBoxClick(key, status);
        this._notify('checkboxClick', [key, status]);
    },

    _listSwipe: function(event, itemData, childEvent) {
        var direction = childEvent.nativeEvent.direction;
        this._children.itemActionsOpener.close();

        const isSwiped = this._options.useNewModel ? itemData.isSwiped() : itemData.isSwiped;

        if (direction === 'right' && !isSwiped && _private.isItemsSelectionAllowed(this._options)) {
            const key = this._options.useNewModel ? itemData.getId() : itemData.key;
            const multiSelectStatus = this._options.useNewModel ? itemData.isSelected() : itemData.multiSelectStatus;
            /**
             * After the right swipe the item should get selected.
             * But, because selectionController is a component, we can't create it and call it's method in the same event handler.
             */
            this._needSelectionController = true;
            this._delayedSelect = {
                key,
                status: multiSelectStatus
            };

            // TODO Right swiping for new model
            //Animation should be played only if checkboxes are visible.
            if (this._options.multiSelectVisibility !== 'hidden') {
                this.getViewModel().setRightSwipedItem(itemData);
            }
        }
        if (direction === 'right' || direction === 'left') {
            if (this._options.useNewModel) {
                this._listViewModel.setMarkedItem(itemData);
            } else {
                var newKey = ItemsUtil.getPropertyValue(itemData.item, this._options.keyProperty);
                this._listViewModel.setMarkedKey(newKey);
            }
            this._listViewModel.setActiveItem(itemData);
        }
        const actionsItem = this._options.useNewModel ? itemData : itemData.actionsItem;
        if (direction === 'left' && this._hasItemActions && !this._options.useNewModel) {
            this._children.itemActions.updateItemActions(actionsItem);

            // FIXME: https://online.sbis.ru/opendoc.html?guid=7a0a273b-420a-487d-bb1b-efb955c0acb8
            itemData.itemActions = this.getViewModel().getItemActions(actionsItem);
        }
        if (!this._options.itemActions && !_private.isItemsSelectionAllowed(this._options)) {
            this._notify('itemSwipe', [actionsItem, childEvent]);
        }
    },

    _onAnimationEnd: function(e) {
        if (e.nativeEvent.animationName === 'rightSwipe') {
            this.getViewModel().setRightSwipedItem(null);
        }
    },

    showIndicator(direction: 'down' | 'up' | 'all' = 'all'): void {
        _private.showIndicator(this, direction);
    },

    hideIndicator(): void {
        _private.hideIndicator(this);
    },

    reload: function() {
        return _private.reload(this, this._options).addCallback(getData);
    },

    _onGroupClick: function(e, item, baseEvent) {
        if (baseEvent.target.closest('.controls-ListView__groupExpander')) {
            this._listViewModel.toggleGroup(item);
        }
    },

    _onItemClick: function(e, item, originalEvent) {
        if (originalEvent.target.closest('.js-controls-ListView__checkbox')) {
            /*
             When user clicks on checkbox we shouldn't fire itemClick event because no one actually expects or wants that.
             We can't stop click on checkbox from propagating because we can only subscribe to valueChanged event and then
             we'd be stopping the propagation of valueChanged event, not click event.
             And even if we could stop propagation of the click event, we shouldn't do that because other components
             can use it for their own reasons (e.g. something like TouchDetector can use it).
             */
            e.stopPropagation();
        }
        if (this._options.useNewModel) {
            this._listViewModel.setMarkedItem(this._listViewModel.getItemBySourceItem(item));
        } else {
            var newKey = ItemsUtil.getPropertyValue(item, this._options.keyProperty);
            this._listViewModel.setMarkedKey(newKey);
        }
    },

    beginEdit: function(options) {
        return this._options.readOnly ? Deferred.fail() : this._children.editInPlace.beginEdit(options);
    },

    beginAdd: function(options) {
        return this._options.readOnly ? Deferred.fail() : this._children.editInPlace.beginAdd(options);
    },

    cancelEdit: function() {
        return this._options.readOnly ? Deferred.fail() : this._children.editInPlace.cancelEdit();
    },

    commitEdit: function() {
        return this._options.readOnly ? Deferred.fail() : this._children.editInPlace.commitEdit();
    },

    _notifyHandler: tmplNotify,

    _closeSwipe: function(event, item) {
        this._children.itemActions.updateItemActions(item);
    },

    _commitEditActionHandler: function() {
        if (this._options.task1178374430) {
            this._children.editInPlace.commitAndMoveNextRow();
        } else {
            this._children.editInPlace.commitEdit();
        }
    },

    _cancelEditActionHandler: function() {
        this._children.editInPlace.cancelEdit();
    },

    _showActionsMenu: function(event, itemData, childEvent, showAll) {
        _private.showActionsMenu(this, event, itemData, childEvent, showAll);
    },
    _initItemActions(): void {
        if (!this._itemActionsInitialized) {
            this._updateItemActions();
            this._itemActionsInitialized = true;
            this._shouldUpdateItemActions = false;
        }
    },
    _updateItemActions: function() {
        if (this.__error) {
            return;
        }
        if (this._listViewModel && this._hasItemActions) {
            this._children.itemActions.updateActions();
        }
    },
    _onAfterEndEdit: function(event, item, isAdd) {
        this._updateItemActions();
        return this._notify('afterEndEdit', [item, isAdd]);
    },
    _onAfterBeginEdit: function (event, item, isAdd) {
        var result = this._notify('afterBeginEdit', [item, isAdd]);

        /*
        * TODO: KINGO
        * При начале редактирования нужно обновить операции наз записью у редактируемого элемента списка, т.к. в режиме
        * редактирования и режиме просмотра они могут отличаться. На момент события beforeBeginEdit еще нет редактируемой
        * записи. В данном месте цикл синхронизации itemActionsControl'a уже случился и обновление через выставление флага
        * _canUpdateItemsActions  приведет к показу неактуальных операций.
        */
        this._children.itemActions.updateItemActions(item);
        return result;
    },

    _showActionMenu(
        event: Event,
        itemData: object,
        childEvent: Event,
        action: object
    ): void {
        _private.showActionMenu(this, itemData, childEvent, action);
    },

    _onItemContextMenu: function(event, itemData) {
        this._showActionsMenu.apply(this, arguments);
        if (this._options.useNewModel) {
            this._listViewModel.setMarkedItem(itemData);
        } else {
            this._listViewModel.setMarkedKey(itemData.key);
        }
    },

    _closeActionsMenu: function(args) {
        _private.closeActionsMenu(this, args);
    },

    _itemMouseDown: function(event, itemData, domEvent) {
        var
            selection,
            self = this,
            dragStartResult;

        if (_private.canStartDragNDrop(domEvent, this._options)) {
            //Support moving with mass selection.
            //Full transition to selection will be made by: https://online.sbis.ru/opendoc.html?guid=080d3dd9-36ac-4210-8dfa-3f1ef33439aa
            selection = _private.getSelectionForDragNDrop(this._options.selectedKeys, this._options.excludedKeys, itemData.key);
            selection.recursive = false;
            getItemsBySelection(selection, this._options.source, this._listViewModel.getItems(), this._options.filter).addCallback(function(items) {
                const dragKeyPosition = items.indexOf(itemData.key);
                // If dragged item is in the list, but it's not the first one, move
                // it to the front of the array
                if (dragKeyPosition > 0) {
                    items.splice(dragKeyPosition, 1);
                    items.unshift(itemData.key);
                }
                dragStartResult = self._notify('dragStart', [items]);
                if (dragStartResult) {
                    if (self._options.dragControlId) {
                        dragStartResult.dragControlId = self._options.dragControlId;
                    }
                    self._children.dragNDropController.startDragNDrop(dragStartResult, domEvent);
                    self._itemDragData = itemData;
                }
            });
        }
        this._notify('itemMouseDown', [itemData.item, domEvent.nativeEvent]);
    },

    _onLoadMoreClick: function() {
        _private.loadToDirectionIfNeed(this, 'down');
    },

    _continueSearch(): void {
        _private.getPortionedSearch(this).continueSearch();
    },

    _abortSearch(): void {
        _private.getPortionedSearch(this).abortSearch();
    },

    _nativeDragStart: function(event) {
        // preventDefault нужно делать именно на нативный dragStart:
        // 1. getItemsBySelection может отрабатывать асинхронно (например при массовом выборе всех записей), тогда
        //    preventDefault в startDragNDrop сработает слишком поздно, браузер уже включит нативное перетаскивание
        // 2. На mouseDown ставится фокус, если на нём сделать preventDefault - фокус не будет устанавливаться
        event.preventDefault();
    },

    _dragStart: function(event, dragObject, domEvent) {
        this._listViewModel.setDragEntity(dragObject.entity);
        this._listViewModel.setDragItemData(this._listViewModel.getItemDataByItem(this._itemDragData.dispItem));
    },

    _dragEnd: function(event, dragObject) {
        if (this._options.itemsDragNDrop) {
            this._dragEndHandler(dragObject);
        }
    },

    _dragEndHandler: function(dragObject) {
        var targetPosition = this._listViewModel.getDragTargetPosition();
        if (targetPosition) {
            this._dragEndResult = this._notify('dragEnd', [dragObject.entity, targetPosition.item, targetPosition.position]);
        }

        // После окончания DnD, не нужно показывать операции, до тех пор, пока не пошевелим мышкой. Задача: https://online.sbis.ru/opendoc.html?guid=9877eb93-2c15-4188-8a2d-bab173a76eb0
        this._showActions = false;
    },
    _onViewKeyDown: function(event) {
        let key = event.nativeEvent.keyCode;
        let dontStop = key === 33
            || key === 34
            || key === 35
            || key === 36;
        keysHandler(event, HOT_KEYS, _private, this, dontStop);
    },
    _dragEnter: function(event, dragObject) {
        if (
            dragObject &&
            !this._listViewModel.getDragEntity() &&
            cInstance.instanceOfModule(dragObject.entity, 'Controls/dragnDrop:ItemsEntity')
        ) {
            const dragEnterResult = this._notify('dragEnter', [dragObject.entity]);

            if (cInstance.instanceOfModule(dragEnterResult, 'Types/entity:Record')) {
                const draggingItemProjection = this._listViewModel._prepareDisplayItemForAdd(dragEnterResult);
                this._listViewModel.setDragItemData(this._listViewModel.getItemDataByItem(draggingItemProjection));
                this._listViewModel.setDragEntity(dragObject.entity);
            } else if (dragEnterResult === true) {
                this._listViewModel.setDragEntity(dragObject.entity);
            }
        }
    },

    _dragLeave: function() {
        this._listViewModel.setDragTargetPosition(null);
    },

    _documentDragEnd: function() {
        var self = this;

        //Reset the state of the dragndrop after the movement on the source happens.
        if (this._dragEndResult instanceof Promise) {
            _private.showIndicator(self);
            this._dragEndResult.addBoth(function() {
                self._documentDragEndHandler();
                _private.hideIndicator(self);
            });
        } else {
            this._documentDragEndHandler();
        }
    },

    _documentDragEndHandler: function() {
        this._listViewModel.setDragTargetPosition(null);
        this._listViewModel.setDragItemData(null);
        this._listViewModel.setDragEntity(null);
    },

    _itemMouseEnter: function(event, itemData, nativeEvent) {
        if (this._options.itemsDragNDrop) {
            var
                dragPosition,
                dragEntity = this._listViewModel.getDragEntity();

            if (dragEntity) {
                dragPosition = this._listViewModel.calculateDragTargetPosition(itemData);

                if (dragPosition && this._notify('changeDragTarget', [this._listViewModel.getDragEntity(), dragPosition.item, dragPosition.position]) !== false) {
                    this._listViewModel.setDragTargetPosition(dragPosition);
                }
            }
        }
        this._notify('itemMouseEnter', [itemData.item, nativeEvent]);
    },

    _itemMouseMove(event, itemData, nativeEvent) {
        this._notify('itemMouseMove', [itemData.item, nativeEvent]);
        if ((!this._options.itemsDragNDrop || !this._listViewModel.getDragEntity() && !this._listViewModel.getDragItemData()) && !this._showActions) {
            this._showActions = true;
        }
        _private.notifyIfDragging(this, 'draggingItemMouseMove', itemData, nativeEvent);
    },
    _itemMouseLeave(event, itemData, nativeEvent) {
        this._notify('itemMouseLeave', [itemData.item, nativeEvent]);
        _private.notifyIfDragging(this, 'draggingItemMouseLeave', itemData, nativeEvent);
    },
    _sortingChanged: function(event, propName, sortingType) {
        var newSorting = _private.getSortingOnChange(this._options.sorting, propName, sortingType);
        event.stopPropagation();
        this._notify('sortingChanged', [newSorting]);
    },

    __pagingChangePage: function (event, page) {
        this._currentPage = page;
        this._applyPagingNavigationState({page: this._currentPage});
    },
    _changePageSize: function(e, item) {
        this._currentPageSize = item.get('pageSize');
        this._applyPagingNavigationState({pageSize: this._currentPageSize});
    },
    _applyPagingNavigationState: function(params) {
        var newNavigation = cClone(this._options.navigation);
        if (params.pageSize) {
            newNavigation.sourceConfig.pageSize = params.pageSize;
        }
        if (params.page) {
            newNavigation.sourceConfig.page = params.page - 1;
            newNavigation.sourceConfig.pageSize = this._currentPageSize;
        }
        this._recreateSourceController(this._options.source, newNavigation, this._options.keyProperty);
        _private.reload(this, this._options);
        this._shouldRestoreScrollPosition = true;
    },

    _recreateSourceController: function(newSource, newNavigation, newKeyProperty) {

        if (this._sourceController) {
            this._sourceController.destroy();
        }
        this._sourceController = new SourceController({
            source: newSource,
            navigation: newNavigation,
            keyProperty: newKeyProperty
        });

    },

    _getLoadingIndicatorClasses(state?: string): string {
        const hasItems = !!this._items && !!this._items.getCount();
        return _private.getLoadingIndicatorClasses({
            hasItems,
            hasPaging: !!this._pagingVisible,
            loadingIndicatorState: state || this._loadingIndicatorState
        });
    },

    _getLoadingIndicatorStyles(state?: string): string {
        let styles = '';
        const indicatorState = state || this._loadingIndicatorState;

        if (indicatorState === 'all') {
            if (this._loadingIndicatorContainerHeight) {
                styles += `min-height: ${this._loadingIndicatorContainerHeight}px;`;
            }
            if (this._loadingIndicatorContainerOffsetTop) {
                styles += ` top: ${this._loadingIndicatorContainerOffsetTop}px;`;
            }
        }
        return styles;
    },

    _onHoveredItemChanged: function(e, item, container) {
        this._notify('hoveredItemChanged', [item, container]);
    },

    _createNewModel(items, modelConfig, modelName) {
        // Подразумеваем, что Controls/display уже загружен. Он загружается при подключении
        // библиотеки Controls/listRender
        if (typeof modelName !== 'string') {
            throw new TypeError('BaseControl: model name has to be a string when useNewModel is enabled');
        }
        return diCreate(modelName, { ...modelConfig, collection: items });
    }

});

// TODO https://online.sbis.ru/opendoc.html?guid=17a240d1-b527-4bc1-b577-cf9edf3f6757
/* ListView.getOptionTypes = function getOptionTypes(){
 return {
 dataSource: Types(ISource)
 }
 }; */
BaseControl._private = _private;

BaseControl.contextTypes = function contextTypes() {
    return {
        isTouch: TouchContextField
    };
};

BaseControl.getDefaultOptions = function() {
    return {
        uniqueKeys: true,
        multiSelectVisibility: 'hidden',
        markerVisibility: 'onactivated',
        style: 'default',
        selectedKeys: defaultSelectedKeys,
        excludedKeys: defaultExcludedKeys,
        markedKey: null,
        stickyHeader: true,
        selectionStrategy: {
           name: 'Controls/operations:FlatSelectionStrategy'
        },
        virtualScrollMode: 'remove'
    };
};
export = BaseControl;
