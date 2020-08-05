import rk = require('i18n!Controls');

// Core imports
import Control = require('Core/Control');
import cClone = require('Core/core-clone');
import cMerge = require('Core/core-merge');
import cInstance = require('Core/core-instance');
import Deferred = require('Core/Deferred');

import {constants, detection} from 'Env/Env';

import {IObservable, RecordSet} from 'Types/collection';
import {isEqual} from 'Types/object';
import {ICrud, Memory} from 'Types/source';
import {debounce} from 'Types/function';
import {create as diCreate} from 'Types/di';
import {Model, relation} from 'Types/entity';
import {IHashMap} from 'Types/declarations';

import {SyntheticEvent} from 'Vdom/Vdom';
import {ControllerClass, Container as ValidateContainer} from 'Controls/validate';
import {Logger} from 'UI/Utils';

import {TouchContextField} from 'Controls/context';
import {Controller as SourceController} from 'Controls/source';
import {error as dataSourceError} from 'Controls/dataSource';
import {INavigationOptionValue, INavigationSourceConfig, IBaseSourceConfig} from 'Controls/interface';
import { Sticky } from 'Controls/popup';

// Utils imports
import getItemsBySelection = require('Controls/Utils/getItemsBySelection');
import tmplNotify = require('Controls/Utils/tmplNotify');
import keysHandler = require('Controls/Utils/keysHandler');
import uDimension = require('Controls/Utils/getDimensions');
import {
    CollectionItem,
    EditInPlaceController,
    GroupItem,
    ANIMATION_STATE
} from 'Controls/display';
import {
    Controller as ItemActionsController,
    IItemAction,
    IShownItemAction,
    TItemActionShowType,
    ItemActionsTemplate,
    SwipeActionsTemplate
} from 'Controls/itemActions';
import {RegisterUtil, UnregisterUtil} from 'Controls/event';

import ItemsUtil = require('Controls/_list/resources/utils/ItemsUtil');
import ListViewModel from 'Controls/_list/ListViewModel';
import ScrollPagingController from 'Controls/_list/Controllers/ScrollPaging';
import PortionedSearch from 'Controls/_list/Controllers/PortionedSearch';
import GroupingLoader from 'Controls/_list/Controllers/GroupingLoader';
import * as GroupingController from 'Controls/_list/Controllers/Grouping';
import {ISwipeEvent} from 'Controls/listRender';

import {IEditingOptions, EditInPlace} from '../editInPlace';

import {default as ScrollController} from './ScrollController';

import {groupUtil} from 'Controls/dataSource';
import {IDirection} from './interface/IVirtualScroll';
import InertialScrolling from './resources/utils/InertialScrolling';
import {CssClassList} from '../Utils/CssClassList';
import {
   FlatSelectionStrategy,
   TreeSelectionStrategy,
   ISelectionStrategy,
   ITreeSelectionStrategyOptions,
   IFlatSelectionStrategyOptions,
   ISelectionControllerResult,
   SelectionController
} from 'Controls/multiselection';
import {getStickyHeadersHeight} from 'Controls/scroll';
import { MarkerController } from 'Controls/marker';
import { DndFlatController, DndTreeController } from 'Controls/listDragNDrop';

import BaseControlTpl = require('wml!Controls/_list/BaseControl/BaseControl');
import 'wml!Controls/_list/BaseControl/Footer';

import {IList} from "./interface/IList";
import {isColumnScrollShown} from '../_grid/utils/GridColumnScrollUtil';

// TODO: getDefaultOptions зовётся при каждой перерисовке,
//  соответственно если в опции передаётся не примитив, то они каждый раз новые.
//  Нужно убрать после https://online.sbis.ru/opendoc.html?guid=1ff4a7fb-87b9-4f50-989a-72af1dd5ae18
const defaultSelectedKeys = [];
const defaultExcludedKeys = [];

// = 28 + 6 + 6 см controls-BaseControl_paging-Padding_theme TODO не должно такого быть, он в разных темах разный
const PAGING_PADDING = 40;

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
        spaceHandler: constants.key.space,
        enterHandler: constants.key.enter,
        keyDownHome: constants.key.home,
        keyDownEnd: constants.key.end,
        keyDownPageUp: constants.key.pageUp,
        keyDownPageDown: constants.key.pageDown
    };

const LOAD_TRIGGER_OFFSET = 100;
const INDICATOR_DELAY = 2000;
const INITIAL_PAGES_COUNT = 1;
const SET_MARKER_AFTER_SCROLL_DELAY = 100;
const LIMIT_DRAG_SELECTION = 100;
const PORTIONED_LOAD_META_FIELD = 'iterative';
const MIN_SCROLL_PAGING_SHOW_PROPORTION = 2;
const MAX_SCROLL_PAGING_HIDE_PROPORTION = 1;
const DRAG_SHIFT_LIMIT = 4;
const IE_MOUSEMOVE_FIX_DELAY = 50;
const DRAGGING_OFFSET = 10;

const ITEM_ACTIONS_SWIPE_CONTAINER_SELECTOR = 'js-controls-SwipeControl__actionsContainer';

interface IAnimationEvent extends Event {
    animationName: string;
}

/**
 * Object with state from server side rendering
 * @typedef {Object}
 * @name IReceivedState
 * @property {*} [data]
 * @property {Controls/_dataSource/_error/ViewConfig} [errorConfig]
 */
interface IReceivedState {
    data?: any;
    errorConfig?: dataSourceError.ViewConfig;
}

/**
 * @typedef {Object}
 * @name ICrudResult
 * @property {*} [data]
 * @property {Controls/_dataSource/_error/ViewConfig} [errorConfig]
 * @property {Error} [error]
 */
interface ICrudResult extends IReceivedState {
    error: Error;
}

interface IErrbackConfig {
    dataLoadErrback?: (error: Error) => any;
    mode?: dataSourceError.Mode;
    templateOptions?: object;
    error: CancelableError;
}

type CancelableError = Error & { canceled?: boolean };
type LoadingState = null | 'all' | 'up' | 'down';

interface IIndicatorConfig {
    hasItems: boolean;
    hasPaging: boolean;
    loadingIndicatorState: LoadingState;
    theme: string;
    isPortionedSearchInProgress: boolean;
}

/**
 * Удаляет оригинал ошибки из ICrudResult перед вызовом сриализатора состояния,
 * который не сможет нормально разобрать/собрать экземпляр случайной ошибки
 * @param {ICrudResult} crudResult
 * @return {IReceivedState}
 */
const getState = (crudResult: ICrudResult): IReceivedState => {
    delete crudResult.error;
    return crudResult;
};

/**
 * getting result from <CrudResult> wrapper
 * @param {ICrudResult} [crudResult]
 * @return {Promise}
 */
const getData = (crudResult: ICrudResult): Promise<any> => {
    if (!crudResult) {
        return Promise.resolve();
    }
    if (crudResult.hasOwnProperty('data')) {
        return Promise.resolve(crudResult.data);
    }
    return Promise.reject(crudResult.error);
};

const _private = {
    hasMarkerController(self): Boolean {
        return self._markerController;
    },

    getMarkerController(self, options: Object = null): MarkerController {
        if (!_private.hasMarkerController(self)) {
            self._markerController = this.createMarkerController(self, options ? options : self._options);
        }
        return self._markerController;
    },

    getItemActionsController(self): ItemActionsController {
        if (!self._itemActionsController) {
            self._itemActionsController = new ItemActionsController();
        }

        return self._itemActionsController;
    },

    isNewModelItemsChange: (action, newItems) => {
        return action && (action !== 'ch' || newItems && !newItems.properties);
    },
    checkDeprecated(cfg) {
        if (cfg.historyIdCollapsedGroups) {
            Logger.warn('IGrouped: Option "historyIdCollapsedGroups" is deprecated and removed in 19.200. Use option "groupHistoryId".');
        }
    },

    // Attention! Вызывать эту функцию запрещено! Исключение - методы reload, onScrollHide, onScrollShow.
    // Функция предназначена для выполнения каллбека после завершения цикла обновления.
    // Цикл обновления - это последовательный вызов beforeUpdate -> afterUpdate.
    // И вот посреди этого цикла нельзя менять модель, иначе beforeUpdate отработает по одному состоянию, а
    // afterUpdate уже совсем по другому!
    // Как сделать правильно: нужно переписать BaseControl таким образом, чтобы items спускались в него из HOC.
    // Примеры возникающих ошибок при обновлении items между beforeUpdate и afterUpdate:
    // https://online.sbis.ru/opendoc.html?guid=487d70ed-ba64-48b4-ad14-138b576cb9c4
    // https://online.sbis.ru/opendoc.html?guid=21fe75c0-62b8-4caf-9442-826827f73cd0
    // https://online.sbis.ru/opendoc.html?guid=8a839900-ebc0-4dad-9b53-225f0c337580
    // https://online.sbis.ru/opendoc.html?guid=dbaaabae-fcca-4c79-9c92-0f7fa2e70184
    // https://online.sbis.ru/opendoc.html?guid=b6715c2a-704a-414b-b764-ea2aa4b9776b
    // p.s. в первой ошибке также прикреплены скрины консоли.
    doAfterUpdate(self, callback): void {
        if (self._updateInProgress) {
            if (self._callbackAfterUpdate) {
                self._callbackAfterUpdate.push(callback);
            } else {
                self._callbackAfterUpdate = [callback];
            }
        } else {
            callback();
        }
    },

    setReloadingState(self, state): void {
        const view = self._children && self._children.listView;
        if (view && view.setReloadingState) {
            view.setReloadingState(state);
        }
    },

    checkNeedAttachLoadTopTriggerToNull(self): void {
        // Если нужно сделать опциональным поведение отложенной загрузки вверх, то проверку добавлять здесь.
        // if (!cfg.attachLoadTopTriggerToNull) return;
        // Прижимать триггер к верху списка нужно только при infinity-навигации.
        // В случае с pages, demand и maxCount проблема дополнительной загрузки после инициализации списка отсутствует.
        const isInfinityNavigation = _private.isInfinityNavigation(self._options.navigation);
        if (!isInfinityNavigation) {
            return;
        }
        const sourceController = self._sourceController;
        const hasMoreData = _private.hasMoreData(self, sourceController, 'up');
        if (sourceController && hasMoreData && self._isMounted) {
            self._attachLoadTopTriggerToNull = true;
            self._needScrollToFirstItem = true;
        } else {
            self._attachLoadTopTriggerToNull = false;
        }
        if (self._scrollController) {
            self._scrollController.update({
                attachLoadTopTriggerToNull: self._attachLoadTopTriggerToNull,
                forceInitVirtualScroll: isInfinityNavigation,
                collection: self.getViewModel(),
                ...self._options
            });
        }
    },

    reload(self, cfg, sourceConfig?: IBaseSourceConfig): Promise<any> | Deferred<any> {
        const filter: IHashMap<unknown> = cClone(cfg.filter);
        const sorting = cClone(cfg.sorting);
        const navigation = cClone(cfg.navigation);
        const resDeferred = new Deferred();

        self._noDataBeforeReload = self._isMounted && (!self._listViewModel || !self._listViewModel.getCount());
        if (cfg.beforeReloadCallback) {
            // todo parameter cfg removed by task: https://online.sbis.ru/opendoc.html?guid=f5fb685f-30fb-4adc-bbfe-cb78a2e32af2
            cfg.beforeReloadCallback(filter, sorting, navigation, cfg);
        }

        if (self._sourceController) {
            _private.showIndicator(self);
            _private.getPortionedSearch(self).reset();

            if (cfg.groupProperty) {
                const collapsedGroups = self._listViewModel ? self._listViewModel.getCollapsedGroups() : cfg.collapsedGroups;
                GroupingController.prepareFilterCollapsedGroups(collapsedGroups, filter);
            }
            // Need to create new Deffered, returned success result
            // load() method may be fired with errback
            _private.setReloadingState(self, true);
            self._sourceController.load(filter, sorting, null, sourceConfig, cfg.root).addCallback(function(list) {
                _private.setReloadingState(self, false);
                _private.hideError(self);
                _private.doAfterUpdate(self, () => {
                    if (list.getCount()) {
                        self._loadedItems = list;
                    } else {
                        self._loadingIndicatorContainerOffsetTop = _private.getListTopOffset(self);
                    }
                    if (self._pagingNavigation) {
                        const hasMoreDataDown = list.getMetaData().more;
                        _private.updatePagingData(self, hasMoreDataDown);
                    }
                    const
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

                    if (!self._shouldNotResetPagingCache) {
                        self._cachedPagingState = false;
                    }
                    clearTimeout(self._needPagingTimeout);

                    if (listModel) {
                        if (self._options.groupProperty) {
                            self._groupingLoader.resetLoadedGroups(listModel);
                        }

                    if (self._items) {
                       self._items.unsubscribe('onCollectionChange', self._onItemsChanged);
                    }
                    // todo task1179709412 https://online.sbis.ru/opendoc.html?guid=43f508a9-c08b-4938-b0e8-6cfa6abaff21
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
                        listModel.setItems(list, cfg);
                        self._items = listModel.getItems();

                            // todo Опция task1178907511 предназначена для восстановления скролла к низу списка после его перезагрузки.
                            // Используется в админке: https://online.sbis.ru/opendoc.html?guid=55dfcace-ec7d-43b1-8de8-3c1a8d102f8c.
                            // Удалить после выполнения https://online.sbis.ru/opendoc.html?guid=83127138-bbb8-410c-b20a-aabe57051b31
                            if (self._options.task1178907511) {
                                self._markedKeyForRestoredScroll = listModel.getMarkedKey();
                            }
                        }
                        self._items.subscribe('onCollectionChange', self._onItemsChanged);

                        _private.restoreModelState(self, cfg);

                        if (self._sourceController) {
                            _private.setHasMoreData(listModel, _private.hasMoreDataInAnyDirection(self, self._sourceController));
                        }

                        if (self._loadedItems) {
                            self._shouldRestoreScrollPosition = true;
                        }
                        // после reload может не сработать beforeUpdate поэтому обновляем еще и в reload
                        if (self._itemsChanged) {
                            self._shouldNotifyOnDrawItems = true;
                        }

                    }
                    if (cfg.afterSetItemsOnReloadCallback instanceof Function) {
                        cfg.afterSetItemsOnReloadCallback();
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
                        self._resetScrollAfterReload = !self._keepScrollAfterReload;
                        self._keepScrollAfterReload = false;
                    }

                    // If received list is empty, make another request. If it’s not empty, the following page will be requested in resize event handler after current items are rendered on the page.
                    if (_private.needLoadNextPageAfterLoad(list, self._listViewModel, navigation)) {
                        _private.checkLoadToDirectionCapability(self, filter, navigation);
                    } else {
                        _private.checkNeedAttachLoadTopTriggerToNull(self);
                    }
                });
            }).addErrback(function(error: Error) {
                _private.hideIndicator(self);
                return _private.processError(self, {
                    error,
                    dataLoadErrback: cfg.dataLoadErrback
                }).then(function(result: ICrudResult) {
                    if (cfg.afterReloadCallback) {
                        cfg.afterReloadCallback(cfg);
                    }
                    resDeferred.callback({
                        data: null,
                        ...result
                    });
                }) as Deferred<Error>;
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

    restoreModelState(self: any, options: any): void {
        if (_private.hasMarkerController(self)) {
            _private.getMarkerController(self).restoreMarker();
        } else {
            if (options.markerVisibility !== 'hidden') {
                self._markerController = _private.createMarkerController(self, options);
            }
        }

        if (self._selectionController) {
            _private._getSelectionController(self).restoreSelection();
        } else {
            if (options.selectedKeys && options.selectedKeys.length > 0) {
                self._selectionController = _private.createSelectionController(self, options);
            }
        }
    },

    resolveIndicatorStateAfterReload(self, list, navigation): void {
        if (!self._isMounted) {
            return;
        }

        const hasMoreDataDown = _private.hasMoreData(self, self._sourceController, 'down');
        const hasMoreDataUp = _private.hasMoreData(self, self._sourceController, 'up');

        if (!list.getCount()) {
            const needShowIndicatorByNavigation =
                _private.isMaxCountNavigation(navigation) ||
                self._needScrollCalculation;
            const needShowIndicatorByMeta = hasMoreDataDown || hasMoreDataUp;

            // because of IntersectionObserver will trigger only after DOM redraw, we should'n hide indicator
            // otherwise empty template will shown
            if (needShowIndicatorByNavigation && needShowIndicatorByMeta) {
                _private.showIndicator(self, hasMoreDataDown ? 'down' : 'up');
            } else {
                _private.hideIndicator(self);
            }
        } else {
            _private.hideIndicator(self);
        }
    },

    hasMoreData(self, sourceController, direction): boolean {
        let moreDataResult = false;

        if (sourceController) {
            moreDataResult = self._options.getHasMoreData ?
                self._options.getHasMoreData(sourceController, direction) :
                sourceController.hasMoreData(direction);
        }
        return moreDataResult;
    },

    hasMoreDataInAnyDirection(self, sourceController): boolean {
        return _private.hasMoreData(self, sourceController, 'up') ||
            _private.hasMoreData(self, sourceController, 'down');
    },

    scrollToItem(self, key, toBottom, force) {
        return self._scrollController?.scrollToItem(key, toBottom, force);
    },

    keyDownHome(self, event) {
        _private.setMarkerAfterScroll(self, event);
    },
    keyDownEnd(self, event) {
        _private.setMarkerAfterScroll(self, event);
    },
    keyDownPageUp(self, event) {
        _private.setMarkerAfterScroll(self, event);
    },
    keyDownPageDown(self, event) {
        _private.setMarkerAfterScroll(self, event);
    },

    enterHandler(self, event) {
        let markedItem;
        if (self._options.useNewModel) {
            markedItem = self.getViewModel().find((item) => item.isMarked());
        } else {
            markedItem = self.getViewModel().getMarkedItem();
        }
        if (markedItem) {
            self._notify('itemClick', [markedItem.getContents(), event], { bubbling: true });
        }
    },
    spaceHandler(self, event) {
        if (self._options.multiSelectVisibility === 'hidden') {
            return;
        }
        const model = self.getViewModel();
        let toggledItemId = model.getMarkedKey();

        if (!model.getItemById(toggledItemId) && model.getCount()) {
            toggledItemId = model.at(0).getContents().getId();
        }

        if (toggledItemId) {
            if (self._options.hasOwnProperty('selectedKeys')) {
                if (!self._selectionController) {
                    self._createSelectionController();
                }
                const result = _private._getSelectionController(self).toggleItem(toggledItemId);
                _private.handleSelectionControllerResult(self, result);
            }
            _private.moveMarkerToNext(self, event);
        }
    },
    prepareFooter(self, navigation, sourceController) {
        let
            loadedDataCount, allDataCount;

        if (_private.isDemandNavigation(navigation) && _private.hasMoreData(self, sourceController, 'down')) {
            self._shouldDrawFooter = (self._options.groupingKeyCallback || self._options.groupProperty) ? !self._listViewModel.isAllGroupsCollapsed() : true;
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

    loadToDirection(self, direction, userCallback, userErrback, receivedFilter) {
        const navigation = self._options.navigation;
        const listViewModel = self._listViewModel;
        const isPortionedLoad = _private.isPortionedLoad(self);
        const beforeAddItems = (addedItems) => {
            if (addedItems.getCount()) {
                self._loadedItems = addedItems;
            }
            _private.setHasMoreData(
                self._listViewModel, _private.hasMoreDataInAnyDirection(self, self._sourceController)
            );
            if (self._options.serviceDataLoadCallback instanceof Function) {
                self._options.serviceDataLoadCallback(self._items, addedItems);
            }
            if (userCallback && userCallback instanceof Function) {
                userCallback(addedItems, direction);
            }

            if (
                self._loadingState === 'all' ||
                !_private.needScrollCalculation(navigation) ||
                !self._loadTriggerVisibility[self._loadingState] ||
                !_private.hasMoreData(self, self._sourceController, self._loadingState)
            ) {
                _private.resolveIndicatorStateAfterReload(self, addedItems, navigation);
            } else {
                // If we are loading to a specific direction with scroll calculation enabled,
                // we should only hide indicator if there are enough items to "push" the load
                // trigger off the screen.
                self._hideIndicatorOnTriggerHideDirection = self._loadingState;
            }

            if (isPortionedLoad) {
                _private.loadToDirectionWithSearchValueEnded(self, addedItems);
            }
        };

        const afterAddItems = (countCurrentItems, addedItems) => {
            const cnt2 = self._listViewModel.getCount();
            // If received list is empty, make another request.
            // If it’s not empty, the following page will be requested in resize event
            // handler after current items are rendered on the page.
            if (_private.needLoadNextPageAfterLoad(addedItems, listViewModel, navigation) ||
                (self._options.task1176625749 && countCurrentItems === cnt2)) {
                _private.checkLoadToDirectionCapability(self, self._options.filter, navigation);
            }
            if (self._isMounted && self._scrollController) {
                self._scrollController.stopBatchAdding();
            }

            _private.prepareFooter(self, self._options.navigation, self._sourceController);
        };

        const drawItemsUp = (countCurrentItems, addedItems) => {
            beforeAddItems(addedItems);
            if (self._options.useNewModel) {
                self._listViewModel.getCollection().prepend(addedItems);
            } else {
                self._listViewModel.prependItems(addedItems);
            }
            afterAddItems(countCurrentItems, addedItems);
            self._attachLoadTopTriggerToNull = false;
        };

        const loadCallback = (addedItems, countCurrentItems) => {
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

            if (!_private.hasMoreData(self, self._sourceController, direction) && !addedItems.getCount()) {
                _private.updateShadowMode(self, self._shadowVisibility);
            }
        };

        _private.showIndicator(self, direction);

        if (self._sourceController) {
            const filter: IHashMap<unknown> = cClone(receivedFilter || self._options.filter);
            if (self._options.beforeLoadToDirectionCallback) {
                self._options.beforeLoadToDirectionCallback(filter, self._options);
            }
            if (isPortionedLoad) {
                _private.loadToDirectionWithSearchValueStarted(self);
            }
            if (self._options.groupProperty) {
                GroupingController.prepareFilterCollapsedGroups(self._listViewModel.getCollapsedGroups(), filter);
            }
            return self._sourceController.load(filter, self._options.sorting, direction, null, self._options.root).addCallback(function(addedItems) {
                // TODO https://online.sbis.ru/news/c467b1aa-21e4-41cc-883b-889ff5c10747
                // до реализации функционала и проблемы из новости делаем решение по месту:
                // посчитаем число отображаемых записей до и после добавления, если не поменялось, значит прилетели элементы, попадающие в невидимую группу,
                // надо инициировать подгрузку порции записей, больше за нас это никто не сделает.
                // Под опцией, потому что в другом месте это приведет к ошибке. Хорошее решение будет в задаче ссылка на которую приведена
                const countCurrentItems = self._listViewModel.getCount();

                if (self._isMounted && self._scrollController) {
                    self._scrollController.startBatchAdding(direction);
                }

                self._getInertialScrolling().callAfterScrollStopped(() => {
                    loadCallback(addedItems, countCurrentItems);
                });

                // Скрываем ошибку после успешной загрузки данных
                _private.hideError(self);

                return addedItems;
            }).addErrback((error: CancelableError) => {
                _private.hideIndicator(self);
                // скроллим в край списка, чтобы при ошибке загрузки данных шаблон ошибки сразу был виден
                if (!error.canceled) {
                    _private.scrollPage(self, (direction === 'up' ? 'Up' : 'Down'));
                }
                return _private.crudErrback(self, {
                    error,
                    dataLoadErrback: userErrback,
                    mode: dataSourceError.Mode.inlist,
                    templateOptions: {
                        /**
                         * Действие при нажатии на кнопку повтора в шаблоне ошибки.
                         * Вернет промис с коллбэком, скрывающим ошибку.
                         * Контрол ошибки сам выполнит этот коллбэк для того,
                         * чтобы подгрузка данных произошла без скачка положения скролла
                         * из-за исчезновения шаблона ошибки.
                         */
                        action: () => {
                            const afterActionCallback = () => _private.hideError(self);
                            const errorConfig = self.__error;
                            return _private.loadToDirection(
                                self, direction,
                                userCallback, userErrback,
                                receivedFilter
                            ).then(() => {
                                _private.showError(self, errorConfig);
                                return Promise.resolve(afterActionCallback);
                            });
                        },
                        /**
                         * Позиция шаблона ошибки относительно списка.
                         * Зависит от направления подгрузки данных.
                         */
                        showInDirection: direction
                    }
                }) as Deferred<any>;
            });
        }
        Logger.error('BaseControl: Source option is undefined. Can\'t load data', self);
    },

    checkLoadToDirectionCapability(self, filter, navigation) {
        if (self._destroyed) {
            return;
        }
        if (self._needScrollCalculation) {
            let triggerVisibilityUp;
            let triggerVisibilityDown;

            const scrollParams = {
                clientHeight: self._viewPortSize,
                scrollHeight: self._viewSize,
                scrollTop: self._scrollTop
            };

            // Состояние триггеров не всегда соответствует действительности, приходится считать самим
            triggerVisibilityUp = self._loadTriggerVisibility.up ||
                _private.calcTriggerVisibility(self, scrollParams, self._loadOffsetTop, 'up');
            triggerVisibilityDown = self._loadTriggerVisibility.down ||
                _private.calcTriggerVisibility(self, scrollParams, self._loadOffsetBottom, 'down');

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
            if (triggerVisibilityUp || hasNoItems) {
                _private.onScrollLoadEdge(self, 'up', filter);
            }
            if (triggerVisibilityDown || hasNoItems) {
                _private.onScrollLoadEdge(self, 'down', filter);
            }
            if (_private.isPortionedLoad(self)) {
                _private.checkPortionedSearchByScrollTriggerVisibility(self, triggerVisibilityDown);
            }
        } else if (_private.needLoadByMaxCountNavigation(self._listViewModel, navigation)) {
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

    needLoadByMaxCountNavigation(listViewModel, navigation: INavigationOptionValue<INavigationSourceConfig>): boolean {
        let result = false;

        if (_private.isMaxCountNavigation(navigation) && _private.isMaxCountNavigationConfiguredCorrect(navigation)) {
            result = _private.isItemsCountLessThenMaxCount(
                listViewModel.getCount(),
                _private.getMaxCountFromNavigation(navigation)
            );
        }

        return result;
    },

    getMaxCountFromNavigation(navigation: INavigationOptionValue<INavigationSourceConfig>): number {
        return navigation.viewConfig.maxCountValue;
    },

    isMaxCountNavigation(navigation: INavigationOptionValue<INavigationSourceConfig>): boolean {
        return navigation && navigation.view === 'maxCount';
    },

    isMaxCountNavigationConfiguredCorrect(navigation: INavigationOptionValue<INavigationSourceConfig>): boolean {
        return navigation.viewConfig && typeof navigation.viewConfig.maxCountValue === 'number';
    },

    isItemsCountLessThenMaxCount(itemsCount: number, navigationMaxCount: number): boolean {
        return navigationMaxCount >  itemsCount;
    },

    isDemandNavigation(navigation: INavigationOptionValue<INavigationSourceConfig>): boolean {
        return navigation && navigation.view === 'demand';
    },

    isPagesNavigation(navigation: INavigationOptionValue<INavigationSourceConfig>): boolean {
        return navigation && navigation.view === 'pages';
    },

    isInfinityNavigation(navigation: INavigationOptionValue<INavigationSourceConfig>): boolean {
        return navigation && navigation.view === 'infinity';
    },

    needShowShadowByNavigation(navigation: INavigationOptionValue<INavigationSourceConfig>, itemsCount: number): boolean {
        const isDemand = _private.isDemandNavigation(navigation);
        const isMaxCount = _private.isMaxCountNavigation(navigation);
        const isPages = _private.isPagesNavigation(navigation);
        let result = true;

        if (isDemand || isPages) {
            result = false;
        } else if (isMaxCount) {
            result = _private.isItemsCountLessThenMaxCount(itemsCount, _private.getMaxCountFromNavigation(navigation));
        }

        return result;
    },

    loadToDirectionIfNeed(self, direction, filter) {
        const sourceController = self._sourceController;
        const hasMoreData = _private.hasMoreData(self, sourceController, direction);
        const allowLoadByLoadedItems = _private.needScrollCalculation(self._options.navigation) ?
            !self._loadedItems :
            true;
        const allowLoadBySource =
            sourceController &&
            hasMoreData &&
            !sourceController.isLoading();
        const allowLoadBySearch =
            !_private.isPortionedLoad(self) ||
            _private.getPortionedSearch(self).shouldSearch();

        if (allowLoadBySource && allowLoadByLoadedItems && allowLoadBySearch) {
            _private.setHasMoreData(self._listViewModel, hasMoreData);
            _private.loadToDirection(
                self, direction,
                self._options.dataLoadCallback,
                self._options.dataLoadErrback,
                filter
            );
        }
    },

    // Метод, вызываемый при прокрутке скролла до триггера
    onScrollLoadEdge(self, direction, filter) {
        if (self._options.navigation && self._options.navigation.view === 'infinity') {
            _private.loadToDirectionIfNeed(self, direction, filter);
        }
    },

    scrollToEdge(self, direction) {
        _private.setMarkerAfterScroll(self);
        if (_private.hasMoreData(self, self._sourceController, direction)) {
            self._sourceController.setEdgeState(direction);

            // Если пейджинг уже показан, не нужно сбрасывать его при прыжке
            // к началу или концу, от этого прыжка его состояние не может
            // измениться, поэтому пейджинг не должен прятаться в любом случае
            self._shouldNotResetPagingCache = true;
            _private.reload(self, self._options).addCallback(function() {
                self._shouldNotResetPagingCache = false;
                if (direction === 'up') {
                    self._notify('doScroll', ['top'], { bubbling: true });
                } else {
                    _private.jumpToEnd(self);
                }
            });
        } else if (direction === 'up') {
            self._notify('doScroll', ['top'], { bubbling: true });
        } else {
            _private.jumpToEnd(self);
        }
    },
    scrollPage(self, direction) {
        if (!self._scrollPageLocked) {
            /**
             * скроллу не нужно блокироваться, если есть ошибка, потому что
             * тогда при пэйджинге до упора не инициируется цикл обновления
             * (не происходит подгрузки данных), а флаг снимается только после него
             * или при ручном скролле - из-за этого пэйджинг перестает работать
             */
            self._scrollPageLocked = !self.__error;
            _private.setMarkerAfterScroll(self);
            self._notify('doScroll', ['page' + direction], { bubbling: true });
        }
    },

    calcTriggerVisibility(self, scrollParams, triggerOffset, direction: 'up' | 'down'): boolean {
        if (direction === 'up') {
            return scrollParams.scrollTop < triggerOffset;
        } else {
            let bottomScroll = scrollParams.scrollHeight - scrollParams.clientHeight - scrollParams.scrollTop;
            if (self._pagingVisible) {
                bottomScroll -= PAGING_PADDING;
            }
            return bottomScroll < triggerOffset;
        }
    },
    calcViewSize(viewSize: number, pagingVisible: boolean): number {
        return viewSize - (pagingVisible ? PAGING_PADDING : 0);
    },
    needShowPagingByScrollSize(self, viewSize: number, viewPortSize: number): boolean {
        let result = self._pagingVisible;

        const proportion = (_private.calcViewSize(viewSize, result) / viewPortSize);

        // начиличе пэйджинга зависит от того превышают данные два вьюпорта или нет
        if (!result) {
            result = proportion >= MIN_SCROLL_PAGING_SHOW_PROPORTION;
        }

        // если все данные поместились на один экран, то скрываем пэйджинг
        if (result) {
            result = proportion > MAX_SCROLL_PAGING_HIDE_PROPORTION;
        }

        // если мы для списка раз вычислили, что нужен пэйджинг, то возвращаем этот статус
        // это нужно для ситуации, если первая пачка данных вернула естьЕще (в этом случае пэйджинг нужен)
        // а вторая вернула мало записей и суммарный объем менее двух вьюпортов, пэйджинг не должен исчезнуть
        if (self._sourceController) {

            // если естьЕще данные, мы не знаем сколько их всего, превышают два вьюпорта или нет и покажем пэйдджинг
            const hasMoreData = {
                up: _private.hasMoreData(self, self._sourceController, 'up'),
                down: _private.hasMoreData(self, self._sourceController, 'down')
            };
            const scrollParams = {
                scrollTop: self._scrollTop,
                clientHeight: self._viewPortSize,
                scrollHeight: self._viewSize
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
                visbilityTriggerUp = _private.calcTriggerVisibility(self, scrollParams, self._loadOffsetTop, 'up');
            }

            if (!visbilityTriggerDown && self._viewSize && self._viewPortSize) {
                visbilityTriggerDown = _private.calcTriggerVisibility(self, scrollParams, self._loadOffsetBottom, 'down');
            }

            if ((hasMoreData.up && !visbilityTriggerUp) || (hasMoreData.down && !visbilityTriggerDown)) {
                result = true;

                // Если пэйджинг был показан из-за hasMore, то запоминаем это,
                // чтобы не скрыть после полной загрузки, даже если не набралось на две страницы.
                self._cachedPagingState = true;
            }
        }

        if (self._cachedPagingState === true) {
            result = true;
        }

        return result;
    },

    onScrollShow(self, params) {
        _private.doAfterUpdate(self, () => {
            // ToDo option "loadOffset" is crutch for contacts.
            // remove by: https://online.sbis.ru/opendoc.html?guid=626b768b-d1c7-47d8-8ffd-ee8560d01076
            self._isScrollShown = true;

            self._viewPortRect = params.viewPortRect;

            if (_private.needScrollPaging(self._options.navigation)) {
                const scrollParams = {
                    scrollTop: self._scrollTop,
                    scrollHeight: params.scrollHeight,
                    clientHeight: params.clientHeight
                };
                _private.getScrollPagingControllerWithCallback(self, scrollParams, (scrollPagingCtr) => {
                    self._scrollPagingCtr = scrollPagingCtr;
                    self._pagingVisible = _private.needShowPagingByScrollSize(self, params.scrollHeight, params.clientHeight);
                });
            }

        });
    },

    onScrollHide(self) {
        _private.doAfterUpdate(self, () => {
            if (self._pagingVisible) {
                self._pagingVisible = false;
                self._cachedPagingState = false;
                self._forceUpdate();
            }
            self._isScrollShown = false;
        });
    },
    getScrollPagingControllerWithCallback(self, scrollParams, callback) {
        if (self._scrollPagingCtr) {
            callback(self._scrollPagingCtr);
        } else {
            _private.createScrollPagingController(self, scrollParams).then((scrollPaging) => {
                callback(scrollPaging);
            });
        }
    },
    createScrollPagingController(self, scrollParams) {
        const scrollPagingConfig = {
            scrollParams,
            pagingCfgTrigger: (cfg) => {
                self._pagingCfg = cfg;
                self._forceUpdate();
            }
        };
        return Promise.resolve(new ScrollPagingController(scrollPagingConfig));
    },

    showIndicator(self, direction: 'down' | 'up' | 'all' = 'all'): void {
        if (!self._isMounted) {
            return;
        }

        self._loadingState = direction;
        if (direction === 'all') {
            self._loadingIndicatorState = self._loadingState;
        }
        _private.startShowLoadingIndicatorTimer(self);
    },

    hideIndicator(self): void {
        if (!self._isMounted) {
            return;
        }
        self._loadingState = null;
        self._showLoadingIndicatorImage = false;
        self._loadingIndicatorContainerOffsetTop = 0;
        self._hideIndicatorOnTriggerHideDirection = null;
        _private.clearShowLoadingIndicatorTimer(self);
        if (self._loadingIndicatorState !== null) {
            self._loadingIndicatorState = self._loadingState;
            self._notify('controlResize');
        }
    },

    startShowLoadingIndicatorTimer(self): void {
        if (!self._loadingIndicatorTimer) {
            self._loadingIndicatorTimer = setTimeout(() => {
                self._loadingIndicatorTimer = null;
                if (self._loadingState) {
                    self._loadingIndicatorState = self._loadingState;
                    self._showLoadingIndicatorImage = true;
                    self._loadingIndicatorContainerOffsetTop = self._scrollTop + _private.getListTopOffset(self);
                    self._notify('controlResize');
                }
            }, INDICATOR_DELAY);
        }
    },

    clearShowLoadingIndicatorTimer(self): void {
        if (self._loadingIndicatorTimer) {
            clearTimeout(self._loadingIndicatorTimer);
            self._loadingIndicatorTimer = null;
        }
    },

    resetShowLoadingIndicatorTimer(self): void {
        _private.clearShowLoadingIndicatorTimer(self);
        _private.startShowLoadingIndicatorTimer(self);
    },

    isLoadingIndicatorVisible(self): boolean {
        return !!self._showLoadingIndicatorImage;
    },

    updateScrollPagingButtons(self, scrollParams) {
        _private.getScrollPagingControllerWithCallback(self, scrollParams, (scrollPaging) => {
            scrollPaging.updateScrollParams(scrollParams);
        });
    },

    /**
     * Обработать прокрутку списка виртуальным скроллом
     */
    handleListScroll(self, params) {

    },

    getTopOffsetForItemsContainer(self, itemsContainer) {
        let offsetTop = uDimension(itemsContainer.children[0], true).top;
        const container = self._container[0] || self._container;
        offsetTop += container.offsetTop - uDimension(container).top;
        return offsetTop;
    },

    handleListScrollSync(self, scrollTop) {
        if (self._setMarkerAfterScroll) {
            _private.delayedSetMarkerAfterScrolling(self, scrollTop);
        }

        self._scrollTop = scrollTop;
        self._scrollPageLocked = false;
        if (_private.needScrollPaging(self._options.navigation)) {
            const scrollParams = {
                scrollTop: self._scrollTop,
                scrollHeight: self._viewSize,
                clientHeight: self._viewPortSize
            };
            _private.updateScrollPagingButtons(self, scrollParams);
        }
    },

    getPortionedSearch(self): PortionedSearch {
        return self._portionedSearch || (self._portionedSearch = new PortionedSearch({
            searchStartCallback: () => {
                self._portionedSearchInProgress = true;
            },
            searchStopCallback: () => {
                self._portionedSearchInProgress = false;
                self._showContinueSearchButton = true;
                self._sourceController.cancelLoading();
                _private.hideIndicator(self);

                if (self._isScrollShown) {
                    _private.updateShadowMode(self, self._shadowVisibility);
                }
            },
            searchResetCallback: () => {
                self._portionedSearchInProgress = false;
                self._showContinueSearchButton = false;
            },
            searchContinueCallback: () => {
                const direction = _private.hasMoreData(self, self._sourceController, 'up') ? 'up' : 'down';

                self._portionedSearchInProgress = true;
                self._showContinueSearchButton = false;
                _private.loadToDirectionIfNeed(self, direction);
            },
            searchAbortCallback: () => {
                self._portionedSearchInProgress = false;
                self._sourceController.cancelLoading();
                _private.hideIndicator(self);

                _private.disablePagingNextButtons(self);

                if (self._isScrollShown) {
                    _private.updateShadowMode(self, self._shadowVisibility);
                }
                self._notify('iterativeSearchAborted', []);
            }
        }));
    },

    disablePagingNextButtons(self): void {
        if (self._pagingVisible) {
            self._pagingCfg = {...self._pagingCfg};
            self._pagingCfg.forwardEnabled = false;
        }
    },

    loadToDirectionWithSearchValueStarted(self): void {
        _private.getPortionedSearch(self).startSearch();
    },

    loadToDirectionWithSearchValueEnded(self, loadedItems: RecordSet): void {
        const portionedSearch = _private.getPortionedSearch(self);
        const isPortionedLoad = _private.isPortionedLoad(self, loadedItems);

        if (!_private.hasMoreDataInAnyDirection(self, self._sourceController) || !isPortionedLoad) {
            portionedSearch.reset();
        } else if (loadedItems.getCount() && !_private.isLoadingIndicatorVisible(self) && self._loadingIndicatorTimer) {
            _private.resetShowLoadingIndicatorTimer(self);
        }
    },

    isPortionedLoad(self, items?: RecordSet = self._items): boolean {
        const loadByMetaData = items && items.getMetaData()[PORTIONED_LOAD_META_FIELD];
        const loadBySearchValue = !!self._options.searchValue;
        return loadByMetaData || loadBySearchValue;
    },

    checkPortionedSearchByScrollTriggerVisibility(self, scrollTriggerVisibility: boolean): void {
        if (!scrollTriggerVisibility && self._portionedSearchInProgress) {
            _private.getPortionedSearch(self).resetTimer();
        }
    },

    allowLoadMoreByPortionedSearch(self): boolean {
        return !self._showContinueSearchButton && _private.getPortionedSearch(self).shouldSearch();
    },

    updateShadowMode(self, shadowVisibility: {up: boolean, down: boolean}): void {
        const itemsCount = self._listViewModel && self._listViewModel.getCount();
        const hasMoreData = (direction) => _private.hasMoreData(self, self._sourceController, direction);
        const showShadowByNavigation = _private.needShowShadowByNavigation(self._options.navigation, itemsCount);
        const showShadowByPortionedSearch = _private.allowLoadMoreByPortionedSearch(self);

        self._notify('updateShadowMode', [{
            top: (shadowVisibility?.up ||
                showShadowByNavigation && itemsCount && hasMoreData('up')) ? 'visible' : 'auto',
            bottom: (shadowVisibility?.down ||
                showShadowByNavigation &&
                showShadowByPortionedSearch && itemsCount && hasMoreData('down')) ? 'visible' : 'auto'
        }], {bubbling: true});
    },

    needScrollCalculation(navigationOpt) {
        return navigationOpt && navigationOpt.view === 'infinity';
    },

    needScrollPaging(navigationOpt) {
        return (navigationOpt &&
            navigationOpt.view === 'infinity' &&
            navigationOpt.viewConfig &&
            navigationOpt.viewConfig.pagingMode
        );
    },

    getItemsCount(self) {
        return self._listViewModel ? self._listViewModel.getCount() : 0;
    },

    /**
     * Закрывает меню опций записи у активной записи, если она есть
     * @param self
     * @param items
     */
    closeItemActionsMenuForActiveItem(self: typeof BaseControl, items: Array<CollectionItem<Model>>): void {
        const activeItem = self._itemActionsController.getActiveItem();
        if (activeItem && items && items.find((item) => {
            const itemContents = _private.getPlainItemContents(item);
            const activeItemContents = _private.getPlainItemContents(item);
            return itemContents?.getKey() === activeItemContents?.getKey();
        })) {
            _private.closeActionsMenu(self);
        }
    },

    onListChange(self, event, changesType, action, newItems, newItemsIndex, removedItems, removedItemsIndex): void {
        // TODO Понять, какое ускорение мы получим, если будем лучше фильтровать
        // изменения по changesType в новой модели
        const newModelChanged = self._options.useNewModel && _private.isNewModelItemsChange(action, newItems);
        if (self._pagingNavigation) {
            if (action === IObservable.ACTION_REMOVE || action === IObservable.ACTION_ADD) {
                _private.updatePagingDataByItemsChanged(self, newItems, removedItems);
            }
        }
        if (changesType === 'collectionChanged' || newModelChanged) {
            // TODO костыль https://online.sbis.ru/opendoc.html?guid=b56324ff-b11f-47f7-a2dc-90fe8e371835
            if (self._options.navigation && self._options.navigation.source) {
                const stateChanged = self._sourceController.setState(self._listViewModel, self._options.root);

                if (stateChanged) {
                    _private.prepareFooter(self, self._options.navigation, self._sourceController);
                }
            }
            if (action === IObservable.ACTION_REMOVE && self._itemActionsMenuId) {
                _private.closeItemActionsMenuForActiveItem(self, removedItems);
            }

            if (self._selectionController) {
                let result;

               if (self._listViewModel.getCount() === 0 && _private._getSelectionController(self).isAllSelected()) {
                   result = _private._getSelectionController(self).clearSelection();
               } else if (action === IObservable.ACTION_ADD) {
                    result = _private._getSelectionController(self).handleAddItems(newItems);
                } else if (action === IObservable.ACTION_RESET || action === IObservable.ACTION_REPLACE) {
                   result = _private._getSelectionController(self).handleResetItems();
               }

               _private.handleSelectionControllerResult(self, result);
            }
        }
        // VirtualScroll controller can be created and after that virtual scrolling can be turned off,
        // for example if Controls.explorer:View is switched from list to tile mode. The controller
        // will keep firing `indexesChanged` events, but we should not mark items as changed while
        // virtual scrolling is disabled.
        // But we should not update any ItemActions when marker has changed
        if (
            (changesType === 'collectionChanged' && _private.shouldUpdateItemActions(newItems)) ||
            changesType === 'indexesChanged' && Boolean(self._options.virtualScrollConfig) ||
            newModelChanged
        ) {
            self._itemsChanged = true;
            _private.updateInitializedItemActions(self, self._options);
            }
        // If BaseControl hasn't mounted yet, there's no reason to call _forceUpdate
        if (self._isMounted) {
            self._forceUpdate();
        }
    },

    /**
     * Возвращает boolean, надо ли обновлять проинициализированные ранее ItemActions, основываясь на newItems.properties.
     * Возвращается true, если newItems или newItems.properties не заданы
     * Новая модель в событии collectionChanged для newItems задаёт properties,
     * где указано, что именно обновляется.
     * @param newItems
     */
    shouldUpdateItemActions(newItems): boolean {
        const propertyVariants = 'selected|marked|swiped|hovered|active|dragged|editingContents';
        return !newItems || !newItems.properties || propertyVariants.indexOf(newItems.properties) === -1;
    },

    initListViewModelHandler(self, model, useNewModel: boolean) {
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

    /**
     * Получает контейнер для
     * @param self
     * @param item
     * @param isMenuClick
     */
    resolveItemContainer(self, item, isMenuClick: boolean): HTMLElement {
        // TODO: self._container может быть не HTMLElement, а jQuery-элементом,
        //  убрать после https://online.sbis.ru/opendoc.html?guid=d7b89438-00b0-404f-b3d9-cc7e02e61bb3
        const container = self._container.get ? self._container.get(0) : self._container;

        // Т.к., например, breadcrumbs отсутствует в source, но иногда нам нужно получать его target
        // логичнее использовать именно getIndex(), а не getSourceIndexByItem()
        // кроме того, в старой модели в itemData.index записывается именно результат getIndex()
        let itemIndex = self._listViewModel.getIndex(item);
        const startIndex = self._listViewModel.getStartIndex();
        return isMenuClick ? self._targetItem : Array.prototype.filter.call(
            container.querySelector('.controls-ListView__itemV').parentNode.children,
            (item: HTMLElement) => item.className.includes('controls-ListView__itemV')
        )[itemIndex - startIndex];
    },

    /**
     * Обрабатывает клик по записи и отправляет событие actionClick наверх
     * @param self
     * @param action
     * @param clickEvent
     * @param item
     * @param isMenuClick
     */
    handleItemActionClick(
        self: any,
        action: IShownItemAction,
        clickEvent: SyntheticEvent<MouseEvent>,
        item: CollectionItem<Model>,
        isMenuClick: boolean): void {
        // TODO нужно заменить на item.getContents() при переписывании моделей. item.getContents() должен возвращать Record
        //  https://online.sbis.ru/opendoc.html?guid=acd18e5d-3250-4e5d-87ba-96b937d8df13
        const contents = _private.getPlainItemContents(item);
        const itemContainer = _private.resolveItemContainer(self, item, isMenuClick);
        self._notify('actionClick', [action, contents, itemContainer, clickEvent.nativeEvent]);
        if (action.handler) {
            action.handler(contents);
        }
        _private.closeActionsMenu(self);
    },

    /**
     * Открывает меню операций
     * @param self
     * @param action
     * @param clickEvent
     * @param item
     * @param isContextMenu
     */
    openItemActionsMenu(
        self: any,
        action: IShownItemAction,
        clickEvent: SyntheticEvent<MouseEvent>,
        item: CollectionItem<Model>,
        isContextMenu: boolean): Promise<void> {
        const menuConfig = _private
            .getItemActionsController(self)
            .prepareActionsMenuConfig(item, clickEvent, action, self, isContextMenu);
        if (!menuConfig) {
            return Promise.resolve();
        }
        /**
         * Не во всех раскладках можно получить DOM-элемент, зная только индекс в коллекции, поэтому запоминаем тот,
         * у которого открываем меню. Потом передадим его для события actionClick.
         */
        self._targetItem = clickEvent.target.closest('.controls-ListView__itemV');
        clickEvent.nativeEvent.preventDefault();
        clickEvent.stopImmediatePropagation();
        menuConfig.eventHandlers = {
            onResult: self._onItemActionsMenuResult,
            onClose(): void {
                self._onItemActionsMenuClose(this);
            }
        };
        return Sticky.openPopup(menuConfig).then((popupId) => {
            // Закрываем popup с текущим id на случай, если вдруг он оказался открыт
            _private.closePopup(self, self._itemActionsMenuId);
            // Устанавливаем новый Id
            self._itemActionsMenuId = popupId;
            // Нельзя устанавливать activeItem раньше, иначе при автокликах
            // робот будет открывать меню раньше, чем оно закрылось
            _private.getItemActionsController(self).setActiveItem(item);
            RegisterUtil(self, 'scroll', self._scrollHandler.bind(self));
        });
    },

    /**
     * Метод, который закрывает меню
     * @param self
     * @param currentPopup
     * @private
     */
    closeActionsMenu(self: any, currentPopup?: any): void {
        if (self._itemActionsMenuId) {
            const itemActionsMenuId = self._itemActionsMenuId;
            _private.closePopup(self, currentPopup ? currentPopup.id : itemActionsMenuId);
            // При быстром клике правой кнопкой обработчик закрытия меню и setActiveItem(null)
            // вызывается позже, чем устанавливается новый activeItem. в результате, при попытке
            // взаимодействия с опциями записи, может возникать ошибка, т.к. activeItem уже null.
            // Для обхода проблемы ставим условие, что занулять ItemAction нужно только тогда, когда
            // закрываем самое последнее открытое меню.
            if (!currentPopup || itemActionsMenuId === currentPopup.id) {
                self._listViewModel.setActiveItem(null);
                _private.getItemActionsController(self).deactivateSwipe();
            }
        }
    },

    /**
     * TODO нужно выпилить этот метод при переписывании моделей. item.getContents() должен возвращать Record
     *  https://online.sbis.ru/opendoc.html?guid=acd18e5d-3250-4e5d-87ba-96b937d8df13
     * @param item
     */
    getPlainItemContents(item: CollectionItem<Model>) {
        let contents = item.getContents();
        if (item['[Controls/_display/BreadcrumbsItem]'] || item.breadCrumbs) {
            contents = contents[(contents as any).length - 1];
        }
        return contents;
    },

    /**
     * Закрывает popup меню
     * @param self
     * @param itemActionsMenuId id popup, который надо закрыть. Если не указано - берём текущий self._itemActionsMenuId
     * иногла можно не дождавшимь показа меню случайно вызвать второе менню поверх превого.
     * Это случается от того, что поуказ меню асинхронный и возвращает Promise, который мы не можем отменить.
     * При этом закрытие меню внутри самого Promise повлечёт за собой асинхронный вызов "_onItemActionsMenuClose()",
     * что приведёт к закрытию всех текущих popup на странице.
     * Зато мы можем получить объект Popup, который мы пытаемся закрыть, и, соответственно, его id. Таким образом, мы можем
     * указать, какой именно popup мы закрываем.
     */
    closePopup(self, itemActionsMenuId?: string): void {
        const id = itemActionsMenuId || self._itemActionsMenuId;
        if (id) {
            Sticky.closePopup(id);
        }
        if (!itemActionsMenuId || (self._itemActionsMenuId && self._itemActionsMenuId === itemActionsMenuId)) {
            UnregisterUtil(self, 'scroll');
            self._itemActionsMenuId = null;
        }
    },

    bindHandlers(self): void {
        self._onItemActionsMenuClose = self._onItemActionsMenuClose.bind(self);
        self._onItemActionsMenuResult = self._onItemActionsMenuResult.bind(self);
        self._onItemsChanged = self._onItemsChanged.bind(self);
    },

    groupsExpandChangeHandler(self, changes) {
        self._notify(changes.changeType === 'expand' ? 'groupExpanded' : 'groupCollapsed', [changes.group], { bubbling: true });
        self._notify('collapsedGroupsChanged', [changes.collapsedGroups]);
        _private.prepareFooter(self, self._options.navigation, self._sourceController);
        if (self._options.historyIdCollapsedGroups || self._options.groupHistoryId) {
            groupUtil.storeCollapsedGroups(changes.collapsedGroups, self._options.historyIdCollapsedGroups || self._options.groupHistoryId);
        }
    },

    getSortingOnChange(currentSorting, propName) {
        let sorting = cClone(currentSorting || []);
        let sortElem;
        const newSortElem = {};

        if (sorting.length === 1 && sorting[0][propName]) {
            const elem = sorting[0];
            if (elem.hasOwnProperty(propName)) {
                sortElem = elem;
            }
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
                sorting = [];
            }
        } else {
            newSortElem[propName] = 'DESC';
            sorting.push(newSortElem);
        }

        return sorting;
    },

    /**
     * @param {Controls/_list/BaseControl} self
     * @param {IErrbackConfig} config
     * @return {Promise}
     * @private
     */
    crudErrback(self: BaseControl, config: IErrbackConfig): Promise<any> {
        return _private.processError(self, config).then(getData);
    },

    /**
     * @param {Controls/_list/BaseControl} self
     * @param {IErrbackConfig} config
     * @return {Promise.<ICrudResult>}
     * @private
     */
    processError(self: BaseControl, config: IErrbackConfig): Promise<ICrudResult> {
        if (config.dataLoadErrback instanceof Function) {
            config.dataLoadErrback(config.error);
        }
        if (!config.error.canceled) {
            _private.hideIndicator(self);
        }
        return self.__errorController.process({
            error: config.error,
            theme: self._options.theme,
            mode: config.mode || dataSourceError.Mode.include
        }).then((errorConfig) => {
            if (errorConfig && config.templateOptions) {
                errorConfig.options.action = config.templateOptions.action;
                errorConfig.options.showInDirection = config.templateOptions.showInDirection;
            }
            _private.showError(self, errorConfig);
            return {
                error: config.error,
                errorConfig
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
    },

    hideError(self: BaseControl): void {
        if (self.__error) {
            self.__error = null;
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

    getPagingLabelData(totalItemsCount, pageSize, currentPage) {
        let pagingLabelData;
        if (typeof totalItemsCount === 'number') {
            pagingLabelData = {
                totalItemsCount,
                pageSize: pageSize.toString(),
                firstItemNumber: (currentPage - 1) * pageSize + 1,
                lastItemNumber: Math.min(currentPage * pageSize, totalItemsCount)
            };
        } else {
            pagingLabelData = null;
        }
        return pagingLabelData;
    },

    getSourceController({source, navigation, keyProperty}: {source: ICrud, navigation: object, keyProperty: string}, queryParamsCallback): SourceController {
        return new SourceController({
            source,
            navigation,
            keyProperty,
            queryParamsCallback
        });
    },

    checkRequiredOptions(options) {
        if (options.keyProperty === undefined) {
            Logger.warn('BaseControl: Option "keyProperty" is required.');
        }
    },

    needBottomPadding(options, items, listViewModel) {
        const isEditing =
            options.useNewModel
            ? EditInPlaceController.isEditing(listViewModel)
            : !!listViewModel.getEditingItemData();
        return (
            !!items &&
            (!!items.getCount() || isEditing) &&
            options.itemActionsPosition === 'outside' &&
            !options.footerTemplate &&
            options.resultsPosition !== 'bottom'
        );
    },

    notifyNavigationParamsChanged(actualParams) {
        if (this._isMounted) {
            this._notify('navigationParamsChanged', [actualParams]);
        }
    },

    isPagingNavigation(navigation) {
        return navigation && navigation.view === 'pages';
    },

    updatePagingData(self, hasMoreData) {
        self._pagingNavigationVisible = (hasMoreData > 0);
        self._knownPagesCount = _private.calcPaging(self, hasMoreData, self._currentPageSize);
        self._pagingLabelData = _private.getPagingLabelData(hasMoreData, self._currentPageSize, self._currentPage);
        self._selectedPageSizeKey = PAGE_SIZE_ARRAY.find((item) => item.pageSize === self._currentPageSize);
        self._selectedPageSizeKey = self._selectedPageSizeKey ? [self._selectedPageSizeKey.id] : [1];
    },

    updatePagingDataByItemsChanged(self, newItems, removedItems) {
        const countDifferece = (newItems?.length) || (- (removedItems?.length)) || 0;
        const itemsCount = self._pagingLabelData.totalItemsCount + countDifferece;
        _private.updatePagingData(self, itemsCount);
    },

    resetPagingNavigation(self, navigation) {
        self._knownPagesCount = INITIAL_PAGES_COUNT;
        self._currentPageSize = navigation && navigation.sourceConfig && navigation.sourceConfig.pageSize || 1;

        // TODO: KINGO
        // нумерация страниц пейджинга начинается с 1, а не с 0 , поэтому текущая страница пейджига это страница навигации + 1
        self._currentPage = navigation && navigation.sourceConfig && navigation.sourceConfig.page + 1 || INITIAL_PAGES_COUNT;
    },

    initializeNavigation(self, cfg) {
        self._needScrollCalculation = _private.needScrollCalculation(cfg.navigation);
        self._pagingNavigation = _private.isPagingNavigation(cfg.navigation);
        if (!self._needScrollCalculation) {
            if (self._scrollPagingCtr) {
                self._scrollPagingCtr.destroy();
                self._scrollPagingCtr = null;
            }
            self._pagingCfg = null;
            if (self._pagingVisible) {
                self._pagingVisible = false;
            }
        }
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
    closeEditingIfPageChanged(self, oldNavigation, newNavigation) {
        const oldSourceCfg = oldNavigation && oldNavigation.sourceConfig ? oldNavigation.sourceConfig : {};
        const newSourceCfg = newNavigation && newNavigation.sourceConfig ? newNavigation.sourceConfig : {};
        if (oldSourceCfg.page !== newSourceCfg.page) {
            const isEditing = !!self._editInPlace && !!self._listViewModel && (
                self._options.useNewModel ? EditInPlaceController.isEditing(self._listViewModel) : !!self._listViewModel.getEditingItemData()
            );
            if (isEditing) {
                self._editInPlace.cancelEdit();
            }
        }
    },
    isBlockedForLoading(loadingIndicatorState): boolean {
        return loadingIndicatorState === 'all';
    },
    getLoadingIndicatorClasses(
        {hasItems, hasPaging, loadingIndicatorState, theme, isPortionedSearchInProgress}: IIndicatorConfig
    ): string {
        return CssClassList.add('controls-BaseControl__loadingIndicator')
            .add(`controls-BaseControl__loadingIndicator__state-${loadingIndicatorState}`)
            .add(`controls-BaseControl__loadingIndicator__state-${loadingIndicatorState}_theme-${theme}`)
            .add(`controls-BaseControl_empty__loadingIndicator__state-down_theme-${theme}`,
                 !hasItems && loadingIndicatorState === 'down')
            .add(`controls-BaseControl_withPaging__loadingIndicator__state-down_theme-${theme}`,
                 loadingIndicatorState === 'down' && hasPaging && hasItems)
            .add(`controls-BaseControl__loadingIndicator_style-portionedSearch_theme-${theme}`,
                          isPortionedSearchInProgress)
            .compile();
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
        const newHeight = bottom - top - _private.getListTopOffset(self);

        if (self._loadingIndicatorContainerHeight !== newHeight) {
            self._loadingIndicatorContainerHeight = newHeight;
        }
    },
    getListTopOffset(self): number {
        const view = self._children && self._children.listView;
        let height = 0;

        /* Получаем расстояние от начала скроллконтейнера, до начала списка, т.к.список может лежать не в "личном" контейнере. */
        if (self._isMounted) {
            const viewRect = (self._container[0] || self._container).getBoundingClientRect();
            if (self._isScrollShown || (self._needScrollCalculation && viewRect && self._viewPortRect)) {
                height = viewRect.y + self._scrollTop - self._viewPortRect.top;
            }
        }
        if (view && view.getHeaderHeight) {
            height += view.getHeaderHeight();
        }
        if (view && view.getResultsHeight) {
            height += view.getResultsHeight();
        }
        return height;
    },
    setHasMoreData(model, hasMoreData: boolean, silent: boolean = false): boolean {
        if (model) {
            model.setHasMoreData(hasMoreData, silent);
        }
    },
    jumpToEnd(self): void {
        const lastItem =
            self._options.useNewModel
            ? self._listViewModel.getLast()?.getContents()
            : self._listViewModel.getLastItem();

        const lastItemKey = ItemsUtil.getPropertyValue(lastItem, self._options.keyProperty);

        // Последняя страница уже загружена но конец списка не обязательно отображается,
        // если включен виртуальный скролл. ScrollContainer учитывает это в scrollToItem
        _private.scrollToItem(self, lastItemKey, true, true).then(() => {
            // После того как последний item гарантированно отобразился,
            // нужно попросить ScrollWatcher прокрутить вниз, чтобы
            // прокрутить отступ пейджинга и скрыть тень
            self._notify('doScroll', ['pageDown'], { bubbling: true });
        });
    },

    // region Multiselection

    createSelectionController(self: any, options: any): SelectionController {
        if (
           !self._listViewModel || !self._listViewModel.getCollection() || options.multiSelectVisibility === 'hidden'
        ) {
            return null;
        }

        const strategy = this.createSelectionStrategy(options, self._listViewModel.getCollection());

        return new SelectionController({
            model: self._listViewModel,
            selectedKeys: options.selectedKeys,
            excludedKeys: options.excludedKeys,
            strategy
        });
    },

    updateSelectionController(self: any, newOptions: any): void {
        _private._getSelectionController(self).update({
           model: self._listViewModel,
           selectedKeys: newOptions.selectedKeys,
           excludedKeys: newOptions.excludedKeys,
           strategyOptions: this.getSelectionStrategyOptions(newOptions, self._listViewModel.getCollection())
        });
    },

    createSelectionStrategy(options: any, items: RecordSet): ISelectionStrategy {
        const strategyOptions = this.getSelectionStrategyOptions(options, items);
        if (options.parentProperty) {
            return new TreeSelectionStrategy(strategyOptions);
        } else {
            return new FlatSelectionStrategy(strategyOptions);
        }
    },

    _getSelectionController(self: any): SelectionController {
        if (!self._selectionController) {
            self._selectionController = _private.createSelectionController(self, self._options);
        }
        return self._selectionController;
    },

    getSelectionStrategyOptions(options: any, items: RecordSet): ITreeSelectionStrategyOptions | IFlatSelectionStrategyOptions {
        if (options.parentProperty) {
            return {
                nodesSourceControllers: options.nodesSourceControllers,
                selectDescendants: options.selectDescendants,
                selectAncestors: options.selectAncestors,
                hierarchyRelation: new relation.Hierarchy({
                    keyProperty: options.keyProperty || 'id',
                    parentProperty: options.parentProperty || 'Раздел',
                    nodeProperty: options.nodeProperty || 'Раздел@',
                    declaredChildrenProperty: options.hasChildrenProperty || 'Раздел$'
                }),
                rootId: options.root,
                items
            };
        } else {
            return { items };
        }
    },

    onSelectedTypeChanged(typeName: string, limit: number|undefined): void {
        const selectionController = _private._getSelectionController(this);
        if (!selectionController) {
            return;
        }

        let result;
        selectionController.setLimit(limit);

        switch (typeName) {
            case 'selectAll':
                result = selectionController.selectAll();
                break;
            case 'unselectAll':
                result = selectionController.unselectAll();
                break;
            case 'toggleAll':
                result = selectionController.toggleAll();
                break;
        }

        _private.handleSelectionControllerResult(this, result);
   },

    handleSelectionControllerResult(self: any, result: ISelectionControllerResult): void {
      if (!result) {
         return;
      }

      const selectedDiff = result.selectedKeysDiff;
      if (selectedDiff.added.length || selectedDiff.removed.length) {
          self._notify('selectedKeysChanged', [selectedDiff.keys, selectedDiff.added, selectedDiff.removed]);
      }

      const excludedDiff = result.excludedKeysDiff;
      if (excludedDiff.added.length || excludedDiff.removed.length) {
          self._notify('excludedKeysChanged', [excludedDiff.keys, excludedDiff.added, excludedDiff.removed]);
      }

        // для связи с контроллером ПМО
        self._notify('listSelectedKeysCountChanged', [result.selectedCount, result.isAllSelected], {bubbling: true});
    },

    // endregion

    onItemsChanged(self: any, action: string, removedItems: [], removedItemsIndex: number): void {
        // подписываемся на рекордсет, чтобы следить какие элементы будут удалены
        // при подписке на модель событие remove летит еще и при скрытии элементов

       let selectionControllerResult;
       switch (action) {
           case IObservable.ACTION_REMOVE:
               if (self._selectionController) {
                   selectionControllerResult = _private._getSelectionController(self).handleRemoveItems(removedItems);
               }
               if (removedItemsIndex !== undefined && self._markerController) {
                   const newMarkedKey = self._markerController.handleRemoveItems(removedItemsIndex);
                   _private.handleMarkerControllerResult(self, newMarkedKey);
               }
               break;
       }
       _private.handleSelectionControllerResult(self, selectionControllerResult);
   },

    // region Marker

    createMarkerController(self: any, options: any): MarkerController {
        return new MarkerController({
            model: self._listViewModel,
            markerVisibility: options.markerVisibility,
            markedKey: options.hasOwnProperty('markedKey') ? options.markedKey : undefined
        });
    },

    updateMarkerController(self: any, options: any): void {
        const newMarkedKey = _private.getMarkerController(self).update({
            model: self._listViewModel,
            markerVisibility: options.markerVisibility,
            markedKey: options.hasOwnProperty('markedKey') ? options.markedKey : self._markerController.getMarkedKey()
        });
        if (newMarkedKey !== options.markedKey) {
            self._notify('markedKeyChanged', [newMarkedKey]);
        }
    },

    setMarkedKey(self: any, key: string | number): void {
        if (self._markerController) {
            const newMarkedKey = self._markerController.calculateMarkedKey(key);
            _private.handleMarkerControllerResult(self, newMarkedKey);
        }
    },

    moveMarkerToNext(self: any, event): void {
        if (self._markerController) {
            // activate list when marker is moving. It let us press enter and open current row
            // must check mounted to avoid fails on unit tests
            if (self._mounted) {
                self.activate();
            }

            // чтобы предотвратить нативный подскролл
            // https://online.sbis.ru/opendoc.html?guid=c470de5c-4586-49b4-94d6-83fe71bb6ec0
            event.preventDefault();
            const newMarkedKey = self._markerController.moveMarkerToNext();
            _private.handleMarkerControllerResult(self, newMarkedKey);
            _private.scrollToItem(self, newMarkedKey);
        }
    },

    moveMarkerToPrevious(self: any, event): void {
        if (self._markerController) {
            // activate list when marker is moving. It let us press enter and open current row
            // must check mounted to avoid fails on unit tests
            if (self._mounted) {
                self.activate();
            }

            // чтобы предотвратить нативный подскролл
            // https://online.sbis.ru/opendoc.html?guid=c470de5c-4586-49b4-94d6-83fe71bb6ec0
            event.preventDefault();
            const newMarkedKey = self._markerController.moveMarkerToPrev();
            _private.handleMarkerControllerResult(self, newMarkedKey);
            _private.scrollToItem(self, newMarkedKey);
        }
    },

    setMarkerAfterScroll(self, event) {
        if (self._options.moveMarkerOnScrollPaging !== false) {
            self._setMarkerAfterScroll = true;
        }
    },

    setMarkerAfterScrolling(self, scrollTop) {
        // TODO вручную обрабатывать pagedown и делать stop propagation
        if (self._markerController) {
            const itemsContainer = self._children.listView.getItemsContainer();
            const topOffset = _private.getTopOffsetForItemsContainer(self, itemsContainer);
            const verticalOffset = scrollTop - topOffset + (getStickyHeadersHeight(self._container, 'top', 'allFixed') || 0);
            const newMarkedKey = self._markerController.setMarkerOnFirstVisibleItem(itemsContainer.children, verticalOffset);
            _private.handleMarkerControllerResult(self, newMarkedKey);
            self._setMarkerAfterScroll = false;
        }
    },

    // TODO KINGO: Задержка нужна, чтобы расчет видимой записи производился после фиксации заголовка
    delayedSetMarkerAfterScrolling: debounce((self, scrollTop) => {
        _private.setMarkerAfterScrolling(self, self._scrollParams ? self._scrollParams.scrollTop : scrollTop);
    }, SET_MARKER_AFTER_SCROLL_DELAY),

    handleMarkerControllerResult(self: any, newMarkedKey: string|number): void {
        if (newMarkedKey !== self._markerController.getMarkedKey()) {
            self._notify('markedKeyChanged', [newMarkedKey]);
        }

        // Если нам не передают markedKey, то на него не могут повлиять и поэтому сразу изменяем модель
        if (!self._options.hasOwnProperty('markedKey')) {
            self._markerController.setMarkedKey(newMarkedKey);
        }
    },

    // endregion

    createEditInPlace(self: typeof BaseControl, options: any): void {
        if (options.editingConfig) {
            self._editInPlace = new EditInPlace({
                editingConfig: options.editingConfig,
                listViewModel: self._listViewModel,
                multiSelectVisibility: options.multiSelectVisibility,
                errorController: self.__errorController,
                source: self.getSourceController(),
                useNewModel: options.useNewModel,
                theme: self._options.theme,
                readOnly: self._options.readOnly,
                keyProperty: self._options.keyProperty,
                notify: (name, args, params) => {
                    return self._notify(name, args, params);
                },
                forceUpdate: () => {
                    self._forceUpdate();
                },
                updateMarkedKey: (key: string|number) => {
                    self.setMarkedKey(key);
                },
                updateItemActions: () => {
                    /*
                    * TODO: KINGO
                    * При начале редактирования нужно обновить операции наз записью у редактируемого элемента списка, т.к. в режиме
                    * редактирования и режиме просмотра они могут отличаться. На момент события beforeBeginEdit еще нет редактируемой
                    * записи. В данном месте цикл синхронизации itemActionsControl'a уже случился и обновление через выставление флага
                    * _canUpdateItemsActions приведет к показу неактуальных операций.
                    */
                    _private.updateItemActions(self, self._options);
                },
                isDestroyed: () => self._destroyed
            } as IEditingOptions);
        }
    },

    createEditingData(self: typeof BaseControl, options: any): void {
        if (self._editInPlace) {
            self._editInPlace.createEditingData(
                options.editingConfig,
                self._listViewModel,
                options.useNewModel,
                self.getSourceController()
            );
            self._editingItemData = self._editInPlace.getEditingItemData();

            if (options.itemActions || self._editInPlace.shouldShowToolbar()) {
                _private.updateItemActions(self, options);
            }
        }
    },

    createScrollController(self: typeof BaseControl, options: any): void {
        self._scrollController = new ScrollController({
            attachLoadTopTriggerToNull: self._attachLoadTopTriggerToNull,
            virtualScrollConfig: options.virtualScrollConfig || {},
            needScrollCalculation: self._needScrollCalculation,
            scrollObserver: self._children.scrollObserver,
            collection: self._listViewModel,
            activeElement: options.activeElement,
            useNewModel: options.useNewModel,
            forceInitVirtualScroll: options?.navigation?.view === 'infinity',
            callbacks: {
                triggerOffsetChanged: self.triggerOffsetChangedHandler.bind(self),
                changeIndicatorState: self.changeIndicatorStateHandler.bind(self),
                triggerVisibilityChanged: self.triggerVisibilityChangedHandler.bind(self),
                updateShadowMode: self.updateShadowModeHandler.bind(self),
                scrollResize: self.scrollResizeHandler.bind(self),
                viewportResize: self.viewportResizeHandler.bind(self),
                cantScroll: self.cantScrollHandler.bind(self),
                canScroll: self.canScrollHandler.bind(self),
                loadMore: self.loadMore.bind(self),
                scrollMove: self.scrollMoveHandler.bind(self),
                scrollPositionChanged: self.scrollMoveSyncHandler.bind(self)
            },
            notify: (name, args, params) => {
                return self._notify(name, args, params);
            }
        });
    },

    /**
     * Необходимо передавать опции для случая, когда в результате изменения модели меняются параметры
     * для показа ItemActions и их нужно поменять до отрисовки.
     * @param self
     * @param options
     * @private
     */
    updateItemActions(self, options: any): void {
        // Проверки на __error не хватает, так как реактивность работает не мгновенно, и это состояние может не
        // соответствовать опциям error.Container. Нужно смотреть по текущей ситуации на наличие ItemActions
        if (self.__error || !self._listViewModel) {
            return;
        }
        const editingConfig = self._listViewModel.getEditingConfig();
        // Если нет опций записи, проперти, и тулбар для редактируемой записи выставлен в false, то не надо
        // инициализировать контроллер
        if (!options.itemActions && !options.itemActionsProperty && !editingConfig?.toolbarVisibility) {
            return;
        }

        const editingItemData = self._listViewModel.getEditingItemData && self._listViewModel.getEditingItemData();
        const isActionsAssigned = self._listViewModel.isActionsAssigned();
        let editArrowAction: IItemAction;
        if (options.showEditArrow) {
            editArrowAction = {
                id: 'view',
                icon: 'icon-Forward',
                title: rk('Просмотреть'),
                showType: TItemActionShowType.TOOLBAR,
                handler: (item) => {
                    self._notify('editArrowClick', [item]);
                }
            };
        }
        // Гарантированно инициализируем шаблоны, если это ещё не произошло
        const itemActionsChangeResult = _private.getItemActionsController(self).update({
                editingItem: editingItemData,
                collection: self._listViewModel,
                itemActions: options.itemActions,
                itemActionsProperty: options.itemActionsProperty,
                visibilityCallback: options.itemActionVisibilityCallback,
                itemActionsPosition: options.itemActionsPosition,
                style: options.itemActionsVisibility === 'visible' ? 'transparent' : options.style,
                theme: options.theme,
                actionAlignment: options.actionAlignment,
                actionCaptionPosition: options.actionCaptionPosition,
                itemActionsClass: options.itemActionsClass,
                iconSize: editingConfig ? 's' : 'm',
                editingToolbarVisible: editingConfig?.toolbarVisibility,
            editArrowAction,
            editArrowVisibilityCallback: options.editArrowVisibilityCallback,
            contextMenuConfig: options.contextMenuConfig
    });
        if (itemActionsChangeResult.length > 0 && self._listViewModel.resetCachedItemData) {
            itemActionsChangeResult.forEach((recordKey: number | string) => {
                self._listViewModel.resetCachedItemData(recordKey);
            });
            self._listViewModel.nextModelVersion(!isActionsAssigned, 'itemActionsUpdated');
        }
    },

    /**
     * Обновляет ItemActions только в случае, если они были ранее проинициализированы
     * @param self
     * @param options
     * @private
     */
    updateInitializedItemActions(self, options: any): void {
        if (self._listViewModel.isActionsAssigned()) {
            _private.updateItemActions(self, options);
        }
    },

    /**
     * Деактивирует свайп, если контроллер ItemActions проинициализирован
     * @param self
     */
    closeSwipe(self): void {
        if (self._listViewModel.isActionsAssigned()) {
            _private.getItemActionsController(self).deactivateSwipe();
        }
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

    /**
     * инициализирует опции записи при загрузке контрола
     * @param self
     * @param options
     * @private
     */
    initVisibleItemActions(self, options: IList): void {
        if (options.itemActionsVisibility === 'visible') {
            self._showActions = true;
            _private.updateItemActions(self, options);
        }
    },

    // region Drag-N-Drop

    startDragNDrop(self, domEvent, item): void {
        if (
            !self._options.readOnly && self._options.itemsDragNDrop
            && DndFlatController.canStartDragNDrop(self._options.canStartDragNDrop, domEvent, self._context?.isTouch?.isTouch)
        ) {
            const key = item.getContents().getKey();

            // Перемещать с помощью массового выбора
            // https://online.sbis.ru/opendoc.html?guid=080d3dd9-36ac-4210-8dfa-3f1ef33439aa
            let selection = {
                selected: self._options.selectedKeys || [],
                excluded: self._options.excludedKeys || []
            };
            selection = DndFlatController.getSelectionForDragNDrop(self._listViewModel, selection, key);
            const recordSet = self._listViewModel.getCollection();

            // Ограничиваем получение перемещаемых записей до 100 (максимум в D&D пишется "99+ записей"), в дальнейшем
            // количество записей будет отдавать selectionController
            // https://online.sbis.ru/opendoc.html?guid=b93db75c-6101-4eed-8625-5ec86657080e
            getItemsBySelection(selection, self._options.source, recordSet, self._options.filter, LIMIT_DRAG_SELECTION).addCallback((items) => {
                const dragStartResult = self._notify('dragStart', [items, key]);
                if (dragStartResult) {
                    if (self._options.dragControlId) {
                        dragStartResult.dragControlId = self._options.dragControlId;
                    }

                    self._dragEntity = dragStartResult;
                    self._draggedKey = key;
                    self._startEvent = domEvent.nativeEvent;

                    _private.clearSelection(self._startEvent);
                    if (self._startEvent && self._startEvent.target) {
                        self._startEvent.target.classList.add('controls-DragNDrop__dragTarget');
                    }

                    self._registerMouseMove();
                    self._registerMouseUp();
                }
            });
        }
    },

    createDndListController(self: any, options: any): DndFlatController|DndTreeController {
        if (options.parentProperty) {
            return new DndTreeController(self._listViewModel);
        } else {
            return new DndFlatController(self._listViewModel);
        }
    },

    getPageXY(event): object {
        let pageX, pageY;
        if (event.type === 'touchstart' || event.type === 'touchmove') {
            pageX = event.touches[0].pageX;
            pageY = event.touches[0].pageY;
        } else if (event.type === 'touchend') {
            pageX = event.changedTouches[0].pageX;
            pageY = event.changedTouches[0].pageY;
        } else {
            pageX = event.pageX;
            pageY = event.pageY;
        }

        return {
            x: pageX,
            y: pageY
        };
    },
    isDragStarted(startEvent, moveEvent): boolean {
        const offset = _private.getDragOffset(moveEvent, startEvent);
        return Math.abs(offset.x) > DRAG_SHIFT_LIMIT || Math.abs(offset.y) > DRAG_SHIFT_LIMIT;
    },
    clearSelection(event): void {
        if (event.type === 'mousedown') {
            //снимаем выделение с текста иначе не будут работать клики,
            // а выделение не будет сниматься по клику из за preventDefault
            const selection = window.getSelection();
            if (selection.removeAllRanges) {
                selection.removeAllRanges();
            } else if (selection.empty) {
                selection.empty();
            }
        }
    },
    getDragOffset(moveEvent, startEvent): object {
        const moveEventXY = _private.getPageXY(moveEvent),
              startEventXY = _private.getPageXY(startEvent);

        return {
            y: moveEventXY.y - startEventXY.y,
            x: moveEventXY.x - startEventXY.x
        };
    },
    onMove(self, nativeEvent): void {
        if (self._startEvent) {
            const dragObject = self._getDragObject(nativeEvent, self._startEvent);
            if (!self._documentDragging && _private.isDragStarted(self._startEvent, nativeEvent)) {
                self._insideDragging = true;
                self._notify('_documentDragStart', [dragObject], {bubbling: true});
            }
            if (self._documentDragging) {
                self._notify('dragMove', [dragObject]);
                if (self._options.draggingTemplate) {
                    self._notify('_updateDraggingTemplate', [dragObject, self._options.draggingTemplate], {bubbling: true});
                }
            }
        }
    }

    // endregion
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
 @mixes Controls/_interface/IFilterChanged
 * @mixes Controls/interface/IHighlighter
 * @mixes Controls/interface/IEditableList
 * @mixes Controls/_list/BaseControl/Styles
 * @control
 * @private
 * @author Авраменко А.С.
 * @category List
 */

const BaseControl = Control.extend(/** @lends Controls/_list/BaseControl.prototype */{
    _updateShadowModeAfterMount: null,

    // todo Опция task1178907511 предназначена для восстановления скролла к низу списка после его перезагрузки.
    // Используется в админке: https://online.sbis.ru/opendoc.html?guid=55dfcace-ec7d-43b1-8de8-3c1a8d102f8c.
    // Удалить после выполнения https://online.sbis.ru/opendoc.html?guid=83127138-bbb8-410c-b20a-aabe57051b31
    _markedKeyForRestoredScroll: null,

    _updateInProgress: false,
    _groupingLoader: null,

    _isMounted: false,

    _savedStartIndex: 0,
    _savedStopIndex: 0,
    _shadowVisibility: null,

    _template: BaseControlTpl,
    iWantVDOM: true,

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
    _actualPagingVisible: false,

    // если пэйджинг в скролле показался то запоним это состояние и не будем проверять до след перезагрузки списка
    _cachedPagingState: false,
    _needPagingTimeout: null,
    _shouldNotResetPagingCache: false,

    _itemTemplate: null,

    _isScrollShown: false,
    _needScrollCalculation: false,
    _loadTriggerVisibility: null,
    _hideIndicatorOnTriggerHideDirection: null,
    _loadOffsetTop: LOAD_TRIGGER_OFFSET,
    _loadOffsetBottom: LOAD_TRIGGER_OFFSET,
    _loadingIndicatorContainerOffsetTop: 0,
    _viewSize: null,
    _viewPortSize: null,
    _scrollTop: 0,
    _popupOptions: null,

    // target элемента, на котором было вызвано контекстное меню
    _targetItem: null,

    // Variables for paging navigation
    _knownPagesCount: INITIAL_PAGES_COUNT,
    _currentPage: INITIAL_PAGES_COUNT,
    _pagingNavigation: false,
    _pagingNavigationVisible: false,
    _pagingLabelData: null,

    _blockItemActionsByScroll: false,

    _needBottomPadding: false,
    _noDataBeforeReload: null,
    _inertialScrolling: null,
    _checkLoadToDirectionTimeout: null,

    _keepScrollAfterReload: false,
    _resetScrollAfterReload: false,
    _scrollPageLocked: false,

    _itemReloaded: false,
    _modelRecreated: false,

    _portionedSearch: null,
    _portionedSearchInProgress: null,
    _showContinueSearchButton: false,

    _draggingItem: null,
    _draggingEntity: null,
    _draggingTargetItem: null,

    _selectionController: null,
    _itemActionsController: null,
    _prevRootId: null,

    _notifyHandler: tmplNotify,

    // По умолчанию считаем, что показывать экшны не надо, пока не будет установлено true
    _showActions: false,

    // Идентификатор текущего открытого popup
    _itemActionsMenuId: null,

    // Шаблон операций с записью
    _itemActionsTemplate: ItemActionsTemplate,

    // Шаблон операций с записью для swipe
    _swipeTemplate: SwipeActionsTemplate,

    _markerController: null,

    _dndListController: null,
    _dragEntity: undefined,
    _startEvent: undefined,
    _documentDragging: false,
    _insideDragging: false,
    _endDragNDropTimer: null, // для IE
    _draggedKey: null,
    _validateController: null,

    constructor(options) {
        BaseControl.superclass.constructor.apply(this, arguments);
        options = options || {};
        this._validateController = new ControllerClass();
        this.__errorController = options.errorController || new dataSourceError.Controller({});
        this._startDragNDropCallback = this._startDragNDropCallback.bind(this);
    },

    /**
     * @param {Object} newOptions
     * @param {Object} context
     * @param {IReceivedState} receivedState
     * @return {Promise}
     * @protected
     */
    _beforeMount(newOptions, context, receivedState: IReceivedState = {}) {
        const self = this;
        this._notifyNavigationParamsChanged = _private.notifyNavigationParamsChanged.bind(this);

        _private.checkDeprecated(newOptions);
        _private.checkRequiredOptions(newOptions);

        _private.bindHandlers(this);

        _private.initializeNavigation(this, newOptions);

        this._loadTriggerVisibility = {};

        if (newOptions.editingConfig) {
            _private.createEditInPlace(self, newOptions);
        }

        return this._prepareGroups(newOptions, (collapsedGroups) => {
            return this._prepareItemsOnMount(self, newOptions, receivedState, collapsedGroups);
        });
    },

    _prepareItemsOnMount(self, newOptions, receivedState: IReceivedState = {}, collapsedGroups) {
        const receivedError = receivedState.errorConfig;
        const receivedData = receivedState.data;
            let viewModelConfig = {...newOptions};
            if (collapsedGroups) {
                viewModelConfig = cMerge(viewModelConfig, {collapsedGroups});
            }

            if (newOptions.groupProperty) {
                self._groupingLoader = new GroupingLoader({});
            }

            if (!newOptions.useNewModel && newOptions.viewModelConstructor) {
                self._viewModelConstructor = newOptions.viewModelConstructor;
                if (receivedData) {
                    viewModelConfig.items = receivedData;
                } else {
                    delete viewModelConfig.items;
                }

                viewModelConfig.supportVirtualScroll = self._needScrollCalculation;
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
                self._sourceController = _private.getSourceController(newOptions, self._notifyNavigationParamsChanged);
                if (receivedData) {
                    self._sourceController.calculateState(receivedData);
                    _private.setHasMoreData(self._listViewModel, _private.hasMoreDataInAnyDirection(self, self._sourceController), true);

                    if (newOptions.useNewModel) {
                        self._items = self._listViewModel.getCollection();
                    } else {
                        self._items = self._listViewModel.getItems();
                    }
                    self._needBottomPadding = _private.needBottomPadding(newOptions, self._items, self._listViewModel);
                    if (self._pagingNavigation) {
                        const hasMoreData = self._items.getMetaData().more;
                        _private.updatePagingData(self, hasMoreData);
                    }

                    if ((newOptions.markerVisibility === 'visible' ||
                        (newOptions.markerVisibility === 'onactivated' && newOptions.markedKey)
                    )) {
                        self._markerController = _private.createMarkerController(self, newOptions);
                    }

                    if (newOptions.selectedKeys && newOptions.selectedKeys.length !== 0) {
                        self._selectionController = _private.createSelectionController(self, newOptions);
                    }

                    if (newOptions.serviceDataLoadCallback instanceof Function) {
                        newOptions.serviceDataLoadCallback(null, self._items);
                    }
                    if (newOptions.dataLoadCallback instanceof Function) {
                        newOptions.dataLoadCallback(self._items);
                    }

                    _private.createEditingData(self, newOptions);

                    _private.createScrollController(self, newOptions);

                    _private.prepareFooter(self, newOptions.navigation, self._sourceController);

                    _private.initVisibleItemActions(self, newOptions);
                    return;
                }
                if (receivedError) {
                    if (newOptions.dataLoadErrback instanceof Function) {
                        newOptions.dataLoadErrback(receivedError);
                    }
                    return _private.showError(self, receivedError);
                }
                return _private.reload(self, newOptions).addCallback((result) => {

                    // FIXME: https://online.sbis.ru/opendoc.html?guid=1f6b4847-7c9e-4e02-878c-8457aa492078
                    const data = result.data || (new RecordSet<Model>({
                        keyProperty: self._options.keyProperty,
                        rawData: []
                    }));

                    if (newOptions.useNewModel && !self._listViewModel) {
                        self._items = data;
                        self._listViewModel = self._createNewModel(
                            data,
                            viewModelConfig,
                            newOptions.viewModelConstructor
                        );

                        _private.setHasMoreData(self._listViewModel, _private.hasMoreDataInAnyDirection(self, self._sourceController), true);

                        if (newOptions.itemsReadyCallback) {
                            newOptions.itemsReadyCallback(self._listViewModel.getCollection());
                        }
                        if (self._listViewModel) {
                            _private.initListViewModelHandler(self, self._listViewModel, newOptions.useNewModel);
                        }
                    }
                    if (viewModelConfig.collapsedGroups) {
                        self._listViewModel.setCollapsedGroups(viewModelConfig.collapsedGroups);
                    }
                    self._needBottomPadding = _private.needBottomPadding(newOptions, data, self._listViewModel);

                    _private.createEditingData(self, newOptions);
                    _private.createScrollController(self, newOptions);

                    _private.initVisibleItemActions(self, newOptions);

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
            } else {
                _private.createScrollController(self, newOptions);
            }
    },

   _prepareGroups(newOptions, callback: Function) {
       let result = null;
       if (newOptions.historyIdCollapsedGroups || newOptions.groupHistoryId) {
           result = new Deferred();
           groupUtil.restoreCollapsedGroups(newOptions.historyIdCollapsedGroups || newOptions.groupHistoryId).addCallback(function (collapsedGroupsFromStore) {
               result.callback(collapsedGroupsFromStore || newOptions.collapsedGroups);
           });
       } else if (newOptions.collapsedGroups) {
           result = new Deferred();
           result.callback(newOptions.collapsedGroups);
       }
       if (result) {
           return result.addCallback(callback);
       } else {
           return callback(undefined);
       }
   },

    _getInertialScrolling(): InertialScrolling {
        if (!this._inertialScrolling) {
            this._inertialScrolling = new InertialScrolling();
        }
        return this._inertialScrolling;
    },

    scrollMoveSyncHandler(params: unknown): void {
        _private.handleListScrollSync(this, params);

        if (detection.isMobileIOS) {
            this._getInertialScrolling().scrollStarted();
        }
    },

    scrollMoveHandler(params: unknown): void {
        _private.handleListScroll(this, params);
    },

    canScrollHandler(params: unknown): void {
        _private.onScrollShow(this, params);
    },

    cantScrollHandler(params: unknown): void {
        _private.onScrollHide(this);
    },

    viewportResizeHandler(viewportHeight: number, viewportRect: number): void {
        const container = this._container[0] || this._container;
        _private.updateIndicatorContainerHeight(this, container.getBoundingClientRect(), viewportRect);
        this._viewPortSize = viewportHeight;
        this._viewPortRect = viewportRect;
    },

    scrollResizeHandler(params: object): void {
        if (_private.needScrollPaging(this._options.navigation)) {
            // внутри метода проверки используется состояние триггеров, а их IO обновляет не синхронно,
            // поэтому нужен таймаут
            this._needPagingTimeout = setTimeout(() => {
                this._pagingVisible = _private.needShowPagingByScrollSize(this, params.scrollHeight, params.clientHeight);
            }, 18);
        }
    },

    updateShadowModeHandler(shadowVisibility: { down: boolean, up: boolean }): void {
        this._shadowVisibility = shadowVisibility;
        if (this._isMounted) {
            _private.updateShadowMode(this, shadowVisibility);
        } else {
            this._updateShadowModeAfterMount = () => {
                _private.updateShadowMode(this, shadowVisibility);
            };
        }
    },

    loadMore(direction: IDirection): void {
        if (this._options?.navigation?.view === 'infinity') {
            _private.loadToDirectionIfNeed(this, direction, this._options.filter);
        }
    },
    _loadMore(event, direction): void {
        this.loadMore(direction);
    },

    triggerVisibilityChangedHandler(direction: IDirection, state: boolean): void {
        this._loadTriggerVisibility[direction] = state;
        if (!state && this._hideIndicatorOnTriggerHideDirection === direction) {
            _private.hideIndicator(this);

            if (_private.isPortionedLoad(this) && this._portionedSearchInProgress) {
                _private.getPortionedSearch(this).stopSearch();
            }
        }
        if (_private.needScrollPaging(this._options.navigation)) {
            this._pagingVisible = _private.needShowPagingByScrollSize(this, this._viewSize, this._viewPortSize);
        }
    },

    triggerOffsetChangedHandler(top: number, bottom: number): void {
        this._loadOffsetTop = top;
        this._loadOffsetBottom = bottom;

    },

    changeIndicatorStateHandler(state: boolean, indicatorName: 'top' | 'bottom'): void {
        if (state) {
            this._children[`${indicatorName}LoadingIndicator`].style.display = '';
        } else {
            this._children[`${indicatorName}LoadingIndicator`].style.display = 'none';
        }
    },

    _viewResize(): void {
        if (this._scrollController) {
            this._scrollController.viewResize(this._container);
        }

        const container = this._container[0] || this._container;
        this._viewSize = container.clientHeight;
        if (_private.needScrollPaging(this._options.navigation)) {
            const scrollParams = {
                scrollHeight: this._viewSize,
                clientHeight: this._viewPortSize,
                scrollTop: this._scrollTop
            };

            _private.updateScrollPagingButtons(this, scrollParams);
        }
        _private.updateIndicatorContainerHeight(this, container.getBoundingClientRect(), this._viewPortRect);
    },

    getViewModel() {
        return this._listViewModel;
    },

    getSourceController() {
        return this._sourceController;
    },

    _afterMount() {
        this._isMounted = true;
        const container = this._container[0] || this._container;
        this._viewSize = container.clientHeight;
        if (this._options.itemsDragNDrop) {
            container.addEventListener('dragstart', this._nativeDragStart);
        }
        this._loadedItems = null;

        if (this._scrollController) {
            this._scrollController.afterMount(container, this._children);
        }

        // Если контроллер был создан в beforeMount, то нужно для панели операций занотифаить кол-во выбранных элементов
        // TODO https://online.sbis.ru/opendoc.html?guid=3042889b-181c-47ec-b036-a7e24c323f5f
        if (this._selectionController) {
            const result = _private._getSelectionController(this).getResultAfterConstructor();
            _private.handleSelectionControllerResult(this, result);
        }

        if (this._editInPlace) {
            this._editInPlace.registerFormOperation(this._validateController);
            this._editInPlace.updateViewModel(this._listViewModel);
            this._editInPlace.setErrorContainer(this._children.errorContainer);
        }

        // для связи с контроллером ПМО
        this._notify('register', ['selectedTypeChanged', this, _private.onSelectedTypeChanged], {bubbling: true});
        this._notifyOnDrawItems();
        if (this._updateShadowModeAfterMount) {
            this._updateShadowModeAfterMount();
            this._updateShadowModeAfterMount = null;
        }

        this._notify('register', ['documentDragStart', this, this._documentDragStart], {bubbling: true});
        this._notify('register', ['documentDragEnd', this, this._documentDragEnd], {bubbling: true});
        _private.checkNeedAttachLoadTopTriggerToNull(this);
    },

    _beforeUpdate(newOptions) {
        this._updateInProgress = true;
        const filterChanged = !isEqual(newOptions.filter, this._options.filter);
        const navigationChanged = !isEqual(newOptions.navigation, this._options.navigation);
        const resetPaging = this._pagingNavigation && filterChanged;
        const recreateSource = newOptions.source !== this._options.source || navigationChanged || resetPaging;
        const sortingChanged = !isEqual(newOptions.sorting, this._options.sorting);
        const self = this;
        this._needBottomPadding = _private.needBottomPadding(newOptions, this._items, self._listViewModel);
        this._prevRootId = this._options.root;
        if (!isEqual(newOptions.navigation, this._options.navigation)) {

            // При смене страницы, должно закрыться редактирование записи.
            _private.closeEditingIfPageChanged(this, this._options.navigation, newOptions.navigation);
            _private.initializeNavigation(this, newOptions);
            if (this._listViewModel && this._listViewModel.setSupportVirtualScroll) {
                this._listViewModel.setSupportVirtualScroll(!!this._needScrollCalculation);
            }
        }

        if (!newOptions.useNewModel && newOptions.viewModelConstructor !== this._viewModelConstructor) {
            if (this._editInPlace && this._listViewModel.getEditingItemData()) {
                this._editInPlace.cancelEdit();
            }
            this._viewModelConstructor = newOptions.viewModelConstructor;
            const items = this._listViewModel.getItems();
            this._listViewModel.destroy();
            this._listViewModel = new newOptions.viewModelConstructor(cMerge({...newOptions}, {
                items,
                supportVirtualScroll: !!this._needScrollCalculation
            }));
            _private.initListViewModelHandler(this, this._listViewModel, newOptions.useNewModel);
            this._modelRecreated = true;

            // Сбрасываем скролл при смене конструктора модели
            // https://online.sbis.ru/opendoc.html?guid=d4099117-ef37-4cd6-9742-a7a921c4aca3
            if (this._isScrollShown) {
                this._notify('doScroll', ['top'], {bubbling: true});
            }
        }

        if (this._dndListController) {
            this._dndListController.update(this._listViewModel, newOptions.canStartDragNDrop);
        }

        if (newOptions.collapsedGroups !== this._options.collapsedGroups) {
            GroupingController.setCollapsedGroups(this._listViewModel, newOptions.collapsedGroups);
        }

        if (newOptions.keyProperty !== this._options.keyProperty) {
            this._listViewModel.setKeyProperty(newOptions.keyProperty);
        }

        if (newOptions.markerVisibility !== this._options.markerVisibility && !newOptions.useNewModel) {
            this._listViewModel.setMarkerVisibility(newOptions.markerVisibility);
        }

        if (newOptions.theme !== this._options.theme && !newOptions.useNewModel) {
            this._listViewModel.setTheme(newOptions.theme);
        }

        if (newOptions.searchValue !== this._options.searchValue) {
            _private.doAfterUpdate(this, () => {
                this._listViewModel.setSearchValue(newOptions.searchValue);
            });
            _private.getPortionedSearch(self).reset();
        }
        if (newOptions.editingConfig !== this._options.editingConfig) {
            this._listViewModel.setEditingConfig(newOptions.editingConfig);
        }
        if (recreateSource) {
            this.recreateSourceController(newOptions.source, newOptions.navigation, newOptions.keyProperty);
        }
        if (newOptions.multiSelectVisibility !== this._options.multiSelectVisibility) {
            this._listViewModel.setMultiSelectVisibility(newOptions.multiSelectVisibility);
        }

        if (newOptions.itemTemplateProperty !== this._options.itemTemplateProperty) {
            this._listViewModel.setItemTemplateProperty(newOptions.itemTemplateProperty);
        }

        if (sortingChanged && !newOptions.useNewModel) {
            this._listViewModel.setSorting(newOptions.sorting);
        }

        if (newOptions.groupProperty && !this._options.groupProperty) {
            this._groupingLoader = new GroupingLoader({});
        } else if (!newOptions.groupProperty && this._options.groupProperty) {
            this._groupingLoader.destroy();
        } else if (newOptions.groupProperty !== this._options.groupProperty) {
            if (this._groupingLoader) {
                this._groupingLoader.destroy();
            }
            this._groupingLoader = new GroupingLoader({});
        }

        if (_private.hasMarkerController(this)) {
            _private.updateMarkerController(this, newOptions);
        } else {
            if (newOptions.markerVisibility !== 'hidden') {
                this._markerController = _private.createMarkerController(self, newOptions);
            }
        }

        if (this._selectionController) {
            if ((self._options.root !== newOptions.root || filterChanged) && _private._getSelectionController(this).isAllSelected(false)) {
                const result = _private._getSelectionController(this).clearSelection();
                _private.handleSelectionControllerResult(this, result);
            }
            _private.updateSelectionController(this, newOptions);

            const selectionChanged = !isEqual(self._options.selectedKeys, newOptions.selectedKeys)
               || !isEqual(self._options.excludedKeys, newOptions.excludedKeys);
            if (selectionChanged || this._modelRecreated) {
                // handleSelectionControllerResult чтобы отправить информацию для ПМО
                const result = _private._getSelectionController(this).setSelectedKeys(
                   newOptions.selectedKeys,
                   newOptions.excludedKeys
                );
                _private.handleSelectionControllerResult(this, result);
            }
        } else {
            // выбранные элементы могут проставить передав в опции, но контроллер еще может быть не создан
            if (newOptions.selectedKeys && newOptions.selectedKeys.length > 0) {
                this._selectionController = _private.createSelectionController(this, newOptions);
            }
        }

        if (this._editInPlace) {
            this._editInPlace.updateEditingData(
                {listViewModel: this._listViewModel, ...newOptions}
            );
            this._editingItemData = this._editInPlace.getEditingItemData();
        }

        if (this._scrollController) {
            this._scrollController.update({
                attachLoadTopTriggerToNull: this._attachLoadTopTriggerToNull,
                forceInitVirtualScroll: newOptions?.navigation?.view === 'infinity',
                collection: this.getViewModel(),
               needScrollCalculation: this._needScrollCalculation, ...newOptions
            });
        }

        if (filterChanged || recreateSource || sortingChanged) {
            _private.resetPagingNavigation(this, newOptions.navigation);
            _private.closeActionsMenu(this);
            if (!isEqual(newOptions.groupHistoryId, this._options.groupHistoryId)) {
                return this._prepareGroups(newOptions, (collapsedGroups) => {
                    self._listViewModel.setCollapsedGroups(collapsedGroups ? collapsedGroups : []);
                    return _private.reload(self, newOptions).addCallback(() => {
                        this._needBottomPadding = _private.needBottomPadding(newOptions, this._items, this._listViewModel);
                        _private.updateInitializedItemActions(this, newOptions);
                    });
                });
            } else {
                // return result here is for unit tests
                return _private.reload(self, newOptions).addCallback(() => {
                    this._needBottomPadding = _private.needBottomPadding(newOptions, this._items, this._listViewModel);
                    _private.updateInitializedItemActions(this, newOptions);
                });
            }
        } else {
            if (!isEqual(newOptions.groupHistoryId, this._options.groupHistoryId)) {
                this._prepareGroups(newOptions, (collapsedGroups) => {
                    self._listViewModel.setCollapsedGroups(collapsedGroups ? collapsedGroups : []);
                });
            }
        }
        // Если поменялись ItemActions, то закрываем свайп
        if (newOptions.itemActions !== this._options.itemActions) {
            _private.closeSwipe(this);
        }

        /*
         * Переинициализация ранее проинициализированных опций записи нужна при:
         * 1. Изменились опции записи
         * 3. Изменился коллбек видимости опции
         * 4. Модель была пересоздана
         * 5. обновилась опция readOnly (относится к TreeControl)
         * 6. обновилась опция itemActionsPosition
         */
        if (
            newOptions.itemActions !== this._options.itemActions ||
            newOptions.itemActionVisibilityCallback !== this._options.itemActionVisibilityCallback ||
            newOptions.readOnly !== this._options.readOnly ||
            newOptions.itemActionsPosition !== this._options.itemActionsPosition
        ) {
            _private.updateInitializedItemActions(this, newOptions, newOptions.itemActions !== this._options.itemActions);
        }

        if (
            ((newOptions.itemActions || newOptions.itemActionsProperty) && this._modelRecreated)) {
            this._initItemActions(null, newOptions);
        }

        if (this._itemsChanged) {
            this._shouldNotifyOnDrawItems = true;
        }

        if (this._loadedItems) {
            this._shouldRestoreScrollPosition = true;
        }
    },

    reloadItem(key: String, readMeta: Object, replaceItem: Boolean, reloadType = 'read'): Deferred {
        const items = this._listViewModel.getItems();
        const currentItemIndex = items.getIndexByValue(this._options.keyProperty, key);
        const sourceController = _private.getSourceController(this._options, this._notifyNavigationParamsChanged);

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
                error,
                mode: dataSourceError.Mode.dialog
            });
        });
    },

    scrollToItem(key: string | number, toBottom: boolean, force: boolean): void {
        return _private.scrollToItem(this, key, toBottom, force);
    },

    _onValidateCreated(e: Event, control: ValidateContainer): void {
        this._validateController.addValidator(control);
    },

    _onValidateDestroyed(e: Event, control: ValidateContainer): void {
        this._validateController.removeValidator(control);
    },

    _beforeUnmount() {
        if (this._checkLoadToDirectionTimeout) {
            clearTimeout(this._checkLoadToDirectionTimeout);
        }

        if (this._needPagingTimeout) {
            clearTimeout(this._needPagingTimeout);
            this._needPagingTimeout = null;
        }
        if (this._options.itemsDragNDrop) {
            const container = this._container[0] || this._container;
            container.removeEventListener('dragstart', this._nativeDragStart);
        }
        if (this._sourceController) {
            this._sourceController.destroy();
        }

        if (this._groupingLoader) {
            this._groupingLoader.destroy();
        }

        if (this._scrollPagingCtr) {
            this._scrollPagingCtr.destroy();
        }

        if (this._listViewModel) {
            this._listViewModel.destroy();
        }
        this._loadTriggerVisibility = null;

        if (this._editInPlace) {
            this._editInPlace.reset();
        }

        if (this._scrollController) {
            this._scrollController.reset();
        }

        if (this._portionedSearch) {
            this._portionedSearch.destroy();
            this._portionedSearch = null;
        }

        this._validateController.destroy();
        this._validateController = null;

        // для связи с контроллером ПМО
        this._notify('unregister', ['selectedTypeChanged', this], {bubbling: true});

        this._notify('unregister', ['documentDragStart', this], {bubbling: true});
        this._notify('unregister', ['documentDragEnd', this], {bubbling: true});

        BaseControl.superclass._beforeUnmount.apply(this, arguments);
    },

    _beforeRender(): void {
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

        if (this._scrollController) {
            this._scrollController.saveScrollPosition();
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
        if (this._shouldRestoreScrollPosition && !this.__error) {

            // todo Опция task1178907511 предназначена для восстановления скролла к низу списка после его перезагрузки.
            // Используется в админке: https://online.sbis.ru/opendoc.html?guid=55dfcace-ec7d-43b1-8de8-3c1a8d102f8c.
            // Удалить после выполнения https://online.sbis.ru/opendoc.html?guid=83127138-bbb8-410c-b20a-aabe57051b31
            if (this._options.task1178907511 && this._markedKeyForRestoredScroll !== null && this._isScrollShown) {
                _private.scrollToItem(this, this._markedKeyForRestoredScroll);
                this._markedKeyForRestoredScroll = null;
            }

            this._loadedItems = null;
            this._shouldRestoreScrollPosition = false;
            if (this._scrollController) {
                this._scrollController.checkTriggerVisibilityWithTimeout();
            }
        }

        // До отрисовки элементов мы не можем понять потребуется ли еще загрузка (зависит от видимости тригеров).
        // Чтобы индикатор загрузки не мигал, показываем индикатор при загрузки, а скрываем после отрисовки.
        const hasTrigger = this._loadTriggerVisibility.hasOwnProperty(this._loadingIndicatorState);
        const isTriggerVisible = !this._loadTriggerVisibility[this._loadingIndicatorState];
        const isLoading = !!this._sourceController && this._sourceController.isLoading();

        if (this._loadingIndicatorState && !isLoading && hasTrigger && isTriggerVisible) {
            _private.hideIndicator(this);
        }

        if (this._scrollController) {
            let correctingHeight = 0;

            // correctingHeight предназначен для предотвращения проблемы с восстановлением позиции скролл в случае,
            // когда новые индексы виртуального скролла применяются одновременно с показом Paging.
            // todo выпилить task1179588447 по ошибке: https://online.sbis.ru/opendoc.html?guid=cd0ba66a-115c-44d1-9384-0c81675d5b08
            if (this._options.task1179588447 && !this._actualPagingVisible && this._pagingVisible) {
                // Можно юзать константу PAGING_HEIGHT, но она старая, 32px. Править константу в 4100 страшно, поправим
                // её по ошибке: https://online.sbis.ru/opendoc.html?guid=cd0ba66a-115c-44d1-9384-0c81675d5b08
                correctingHeight = 33;
            }
            this._scrollController.afterRender(correctingHeight);
        }
        this._actualPagingVisible = this._pagingVisible;

        this._scrollToFirstItemIfNeed();
    },

    _scrollToFirstItemIfNeed(): void {
        if (this._needScrollToFirstItem) {
            this._needScrollToFirstItem = false;
            const firstDispItem = this.getViewModel().at(0);
            const firstItem = firstDispItem && firstDispItem.getContents();
            const firstItemKey = firstItem && firstItem.getKey ? firstItem.getKey() : null;
            if (firstItemKey !== null) {
                _private.scrollToItem(this, firstItemKey, false, true);
            }
        }
    },

    _notifyOnDrawItems(): void {
        if (this._shouldNotifyOnDrawItems) {
            this._notify('drawItems');
            this._shouldNotifyOnDrawItems = false;
            this._itemsChanged = false;
        }
    },

    _afterUpdate(oldOptions): void {
        this._updateInProgress = false;
        this._notifyOnDrawItems();

        // FIXME need to delete after https://online.sbis.ru/opendoc.html?guid=4db71b29-1a87-4751-a026-4396c889edd2
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
        this._modelRecreated = false;
        if (this._callbackAfterUpdate) {
            this._callbackAfterUpdate.forEach((callback) => {
                callback();
            });
            this._callbackAfterUpdate = null;
        }

        if (this._editInPlace) {
            this._editInPlace.registerFormOperation(this._validateController);
            this._editInPlace.prepareHtmlInput();
            this._validateController.resolveSubmit();
        }

        if (this._scrollController) {
            this._scrollController.setTriggers(this._children);
            this._scrollController.registerObserver();
        }
    },

    __onPagingArrowClick(e, arrow) {
        switch (arrow) {
            case 'Next':
                _private.scrollPage(this, 'Down');
                break;
            case 'Prev':
                _private.scrollPage(this, 'Up');
                break;
            case 'Begin':
                _private.scrollToEdge(this, 'up');
                break;
            case 'End':
                _private.scrollToEdge(this, 'down');
                break;
        }
    },

    __needShowEmptyTemplate(emptyTemplate: Function | null, listViewModel: ListViewModel): boolean {
        // Described in this document: https://docs.google.com/spreadsheets/d/1fuX3e__eRHulaUxU-9bXHcmY9zgBWQiXTmwsY32UcsE
        const noData = !listViewModel.getCount();
        const noEdit =
            this._options.useNewModel
                ? !EditInPlaceController.isEditing(listViewModel)
                : !listViewModel.getEditingItemData();
        const isLoading = this._sourceController && this._sourceController.isLoading();
        const notHasMore = !_private.hasMoreDataInAnyDirection(this, this._sourceController);
        const noDataBeforeReload = this._noDataBeforeReload;
        return emptyTemplate && noEdit && notHasMore && (isLoading ? noData && noDataBeforeReload : noData);
    },

    _onCheckBoxClick(e, key, status, readOnly) {
        if (!readOnly) {
            const result = _private._getSelectionController(this).toggleItem(key);
            _private.handleSelectionControllerResult(this, result);
            this._notify('checkboxClick', [key, status]);
        }
    },

    showIndicator(direction: 'down' | 'up' | 'all' = 'all'): void {
        _private.showIndicator(this, direction);
    },

    hideIndicator(): void {
        _private.hideIndicator(this);
    },

    reload(keepScroll: boolean, sourceConfig: IBaseSourceConfig) {
        if (keepScroll) {
            this._keepScrollAfterReload = true;
        }
        return _private.reload(this, this._options, sourceConfig).addCallback(getData);
    },

    setMarkedKey(key: number | string): void {
        _private.setMarkedKey(this, key);
    },

    _onGroupClick(e, groupId, baseEvent) {
        if (baseEvent.target.closest('.controls-ListView__groupExpander')) {
            const collection = this._listViewModel;
            if (this._options.groupProperty) {
                const groupingLoader = this._groupingLoader;
                const needExpandGroup = !collection.isGroupExpanded(groupId);
                if (needExpandGroup && !groupingLoader.isLoadedGroup(groupId)) {
                    const source = this._options.source;
                    const filter = this._options.filter;
                    const sorting = this._options.sorting;
                    groupingLoader.loadGroup(collection, groupId, source, filter, sorting).then(() => {
                        GroupingController.toggleGroup(collection, groupId);
                    });
                    return;
                }
            }
            GroupingController.toggleGroup(collection, groupId);
        }
    },

    _onItemClick(e, item, originalEvent) {
        _private.closeSwipe(this);
        if (originalEvent.target.closest('.js-controls-ListView__checkbox')) {
            /*
             When user clicks on checkbox we shouldn't fire itemClick event because no one actually expects or wants that.
             We can't stop click on checkbox from propagating because we can only subscribe to valueChanged event and then
             we'd be stopping the propagation of valueChanged event, not click event.
             And even if we could stop propagation of the click event, we shouldn't do that because other components
             can use it for their own reasons (e.g. something like TouchDetector can use it).
             */
            e.stopPropagation();
            return;
        }
        if (this._editInPlace) {
            this._editInPlace.beginEditByClick(e, item, originalEvent);
        }
    },

    beginEdit(options) {
        _private.closeSwipe(this);
        return this._options.readOnly ? Deferred.fail() : this._editInPlace.beginEdit(options);
    },

    beginAdd(options) {
        return this._options.readOnly ? Deferred.fail() : this._editInPlace.beginAdd(options);
    },

    cancelEdit() {
        return this._options.readOnly ? Deferred.fail() : this._editInPlace.cancelEdit();
    },

    commitEdit() {
        return this._options.readOnly ? Deferred.fail() : this._editInPlace.commitEdit();
    },

    /**
     * Обработка нажатия на кнопку "сохранить"
     * TODO вроде делает то же самое, что commitEdit
     * @private
     */
    _commitEditActionHandler(): void {
        this._editInPlace.commitAndMoveNextRow();
    },

    /**
     * Обработка нажатия на кнопку "отмена"
     * TODO вроде делает то же самое, что cancelEdit
     * @private
     */
    _cancelEditActionHandler(): void {
        this._editInPlace.cancelEdit();
    },

    /**
     * Инициализирует опции при mouseenter в шаблоне контрола
     * @private
     */
    _initItemActions(e: SyntheticEvent, options: any): void {
        if (this._options.itemActionsVisibility !== 'visible') {
            if (!this._listViewModel.isActionsAssigned()) {
                _private.updateItemActions(this, options);
            }
        }
    },

    /**
     * Обработчик показа контекстного меню
     * @param e
     * @param itemData
     * @param clickEvent
     * @private
     */
    _onItemContextMenu(
        e: SyntheticEvent<Event>,
        itemData: CollectionItem<Model>,
        clickEvent: SyntheticEvent<MouseEvent>
    ): void {
        clickEvent.stopPropagation();
        // TODO нужно заменить на item.getContents() при переписывании моделей.
        //  item.getContents() должен возвращать Record
        //  https://online.sbis.ru/opendoc.html?guid=acd18e5d-3250-4e5d-87ba-96b937d8df13
        const contents = _private.getPlainItemContents(itemData);
        const key = contents ? contents.getKey() : itemData.key;
        this.setMarkedKey(key);

        // Этот метод вызывается также и в реестрах, где не инициализируется this._itemActionsController
        if (!!this._itemActionsController) {
            const item = this._listViewModel.getItemBySourceKey(key) || itemData;
            _private.openItemActionsMenu(this, null, clickEvent, item, true);
        }
    },

    /**
     * Обработчик клика по операции
     * @param event
     * @param action
     * @param itemData
     * @private
     */
    _onItemActionsClick(
        event: SyntheticEvent<MouseEvent>,
        action: IShownItemAction,
        itemData: CollectionItem<Model>
    ): void {
        event.stopPropagation();
        // TODO нужно заменить на item.getContents() при переписывании моделей. item.getContents() должен возвращать
        //  Record https://online.sbis.ru/opendoc.html?guid=acd18e5d-3250-4e5d-87ba-96b937d8df13
        const contents = _private.getPlainItemContents(itemData);
        const key = contents ? contents.getKey() : itemData.key;
        const item = this._listViewModel.getItemBySourceKey(key) || itemData;
        this.setMarkedKey(key);

        if (action && !action._isMenu && !action['parent@']) {
            _private.handleItemActionClick(this, action, event, item, false);
        } else {
            _private.openItemActionsMenu(this, action, event, item, false);
        }
    },

    /**
     * Обработчик событий, брошенных через onResult в выпадающем/контекстном меню
     * @param eventName название события, брошенного из Controls/menu:Popup.
     * Варианты значений itemClick, applyClick, selectorDialogOpened, pinClick, menuOpened
     * @param actionModel
     * @param clickEvent
     * @private
     */
    _onItemActionsMenuResult(eventName: string, actionModel: Model, clickEvent: SyntheticEvent<MouseEvent>): void {
        if (eventName === 'itemClick') {
            const action = actionModel && actionModel.getRawData();
            if (action && !action['parent@']) {
                const item = _private.getItemActionsController(this).getActiveItem();
                _private.handleItemActionClick(this, action, clickEvent, item, true);
            }
        }
    },

    /**
     * Обработчик закрытия выпадающего/контекстного меню
     * @private
     */
    _onItemActionsMenuClose(currentPopup): void {
        _private.closeActionsMenu(this, currentPopup);
    },

    _onItemsChanged(event, action, newItems, newItemsIndex, removedItems, removedItemsIndex): void {
        _private.onItemsChanged(this, action, removedItems, removedItemsIndex);
    },

    _itemMouseDown(event, itemData, domEvent) {
        let hasDragScrolling = false;
        this._mouseDownItemKey = this._options.useNewModel ? itemData.getContents().getKey() : itemData.key;
        if (this._options.columnScroll) {
            hasDragScrolling = isColumnScrollShown(this._container) && (
                typeof this._options.dragScrolling === 'boolean' ? this._options.dragScrolling : !this._options.itemsDragNDrop
            );
        }
        if (this._unprocessedDragEnteredItem) {
            this._unprocessedDragEnteredItem = null;
        }
        if (!hasDragScrolling) {
            _private.startDragNDrop(this, domEvent, itemData);
        } else {
            this._savedItemMouseDownEventArgs = {event, itemData, domEvent};
        }
        this._notify('itemMouseDown', [itemData.item, domEvent.nativeEvent]);
    },

    _itemMouseUp(e, itemData, domEvent): void {
        const key = this._options.useNewModel ? itemData.getContents().getKey() : itemData.key;

        // Маркер должен ставиться именно по событию mouseUp, т.к. есть сценарии при которых блок над которым произошло
        // событие mouseDown и блок над которым произошло событие mouseUp - это разные блоки.
        // Например, записи в мастере или запись в списке с dragScrolling'ом.
        // При таких сценариях нельзя устанавливать маркер по событию itemClick,
        // т.к. оно не произойдет (itemClick = mouseDown + mouseUp на одном блоке).
        // Также, нельзя устанавливать маркер по mouseDown, блок сменится раньше и клик по записи не выстрелет.

        // При редактировании по месту маркер появляется только если в списке больше одной записи.
        // https://online.sbis.ru/opendoc.html?guid=e3ccd952-cbb1-4587-89b8-a8d78500ba90
        let canBeMarked = this._mouseDownItemKey === key
           && (!this._options.editingConfig || (this._options.editingConfig && this._items.getCount() > 1));

        // TODO изабвиться по задаче https://online.sbis.ru/opendoc.html?guid=f7029014-33b3-4cd6-aefb-8572e42123a2
        // Колбэк передается из explorer.View, чтобы не проставлять маркер перед проваливанием в узел
        if (this._options._needSetMarkerCallback) {
            canBeMarked = canBeMarked && this._options._needSetMarkerCallback(itemData.item, domEvent);
        }

        if (canBeMarked) {
            this.setMarkedKey(key);
        }
        this._mouseDownItemKey = undefined;
        this._notify('itemMouseUp', [itemData.item, domEvent.nativeEvent]);
    },

    _startDragNDropCallback(): void {
        _private.startDragNDrop(this, this._savedItemMouseDownEventArgs.domEvent, this._savedItemMouseDownEventArgs.itemData);
    },

    _onLoadMoreClick() {
        _private.loadToDirectionIfNeed(this, 'down');
    },

    _continueSearch(): void {
        _private.getPortionedSearch(this).continueSearch();
    },

    _abortSearch(): void {
        _private.getPortionedSearch(this).abortSearch();
    },

    _onDataError(event: unknown, errorConfig: IErrbackConfig): void {
        _private.processError(this, {
            error: errorConfig.error,
            mode: errorConfig.mode || dataSourceError.Mode.dialog
        });
    },

    _nativeDragStart(event) {
        // preventDefault нужно делать именно на нативный dragStart:
        // 1. getItemsBySelection может отрабатывать асинхронно (например при массовом выборе всех записей), тогда
        //    preventDefault в startDragNDrop сработает слишком поздно, браузер уже включит нативное перетаскивание
        // 2. На mouseDown ставится фокус, если на нём сделать preventDefault - фокус не будет устанавливаться
        event.preventDefault();
    },

    handleKeyDown(event): void {
        this._onViewKeyDown(event);
    },

    _onViewKeyDown(event) {
        // Если фокус выше ColumnsView, то событие не долетит до нужного обработчика, и будет сразу обработано BaseControl'ом
        // передаю keyDownHandler, чтобы обработать событие независимо от положения фокуса.
        if (!_private.isBlockedForLoading(this._loadingIndicatorState) && (!this._options._keyDownHandler || !this._options._keyDownHandler(event))) {
            const key = event.nativeEvent.keyCode;
            const dontStop = key === 33
                || key === 34
                || key === 35
                || key === 36;
            keysHandler(event, HOT_KEYS, _private, this, dontStop);
        }
    },

    _itemMouseEnter(event: SyntheticEvent<MouseEvent>, itemData: CollectionItem<Model>, nativeEvent: Event): void {
        if (this._dndListController) {
            this._unprocessedDragEnteredItem = itemData;
            this._processItemMouseEnterWithDragNDrop(itemData);
        }
        this._notify('itemMouseEnter', [itemData.item, nativeEvent]);
    },

    _itemMouseMove(event, itemData, nativeEvent) {
        this._notify('itemMouseMove', [itemData.item, nativeEvent]);
        if (!this._showActions && (!this._dndListController || !this._dndListController.isDragging())) {
            this._showActions = true;
        }

        if (this._dndListController instanceof DndTreeController && this._dndListController.isDragging()) {
            this._notify('draggingItemMouseMove', [itemData, nativeEvent]);
        }
    },
    _itemMouseLeave(event, itemData, nativeEvent) {
        this._notify('itemMouseLeave', [itemData.item, nativeEvent]);
        if (this._dndListController) {
            this._unprocessedDragEnteredItem = null;
            if (this._dndListController instanceof DndTreeController && this._dndListController.isDragging()) {
                this._notify('draggingItemMouseLeave', [itemData, nativeEvent]);
            }
        }
    },
    _sortingChanged(event, propName) {
        const newSorting = _private.getSortingOnChange(this._options.sorting, propName);
        event.stopPropagation();
        this._notify('sortingChanged', [newSorting]);
    },

    _mouseEnter(event): void {
        this._initItemActions(event, this._options);

        if (this._documentDragging) {
            this._insideDragging = true;

            this._dragEnter(this._getDragObject());
        }
    },

    _mouseLeave(event): void {
        if (this._documentDragging) {
            this._insideDragging = false;
            this._dragLeave();
        }
    },

    __pagingChangePage(event, page) {
        this._currentPage = page;
        this._applyPagingNavigationState({page: this._currentPage});
    },

    _changePageSize(e, key) {
        this._currentPageSize = PAGE_SIZE_ARRAY[key - 1].pageSize;
        this._currentPage = 1;
        this._applyPagingNavigationState({pageSize: this._currentPageSize});
    },

    /**
     * Хандлер клика на Tag в BaseControl.wml
     * @private
     */
    _onTagClickHandler(event: Event, dispItem: CollectionItem<Model>, columnIndex: number): void {
        this._notify('tagClick', [dispItem, columnIndex, event]);
    },

    /**
     * Хандлер наведения на Tag в BaseControl.wml
     * @private
     */
    _onTagHoverHandler(event: Event, dispItem: CollectionItem<Model>, columnIndex: number): void {
        this._notify('tagHover', [dispItem, columnIndex, event]);
    },

    _applyPagingNavigationState(params) {
        const newNavigation = cClone(this._options.navigation);
        if (params.pageSize) {
            newNavigation.sourceConfig.pageSize = params.pageSize;
        }
        if (params.page) {
            newNavigation.sourceConfig.page = params.page - 1;
            newNavigation.sourceConfig.pageSize = this._currentPageSize;
        }
        this.recreateSourceController(this._options.source, newNavigation, this._options.keyProperty);
        _private.reload(this, this._options);
        this._shouldRestoreScrollPosition = true;
    },

    recreateSourceController(newSource, newNavigation, newKeyProperty) {

        if (this._sourceController) {
            this._sourceController.destroy();
        }
        this._sourceController = new SourceController({
            source: newSource,
            navigation: newNavigation,
            keyProperty: newKeyProperty,
            queryParamsCallback: this._notifyNavigationParamsChanged
        });

    },

    /**
     * Возвращает видимость опций записи.
     * @private
     */
    _isVisibleItemActions(showActions: boolean, itemActionsMenuId: number): boolean {
        return (showActions || this._options.useNewModel) &&
            (!itemActionsMenuId || this._options.itemActionsVisibility === 'visible');
    },

    _createSelectionController(): void {
        this._selectionController = _private.createSelectionController(this, this._options);
    },

    _getLoadingIndicatorClasses(state?: string): string {
        const hasItems = !!this._items && !!this._items.getCount();
        const indicatorState = state || this._loadingIndicatorState;
        return _private.getLoadingIndicatorClasses({
            hasItems,
            hasPaging: !!this._pagingVisible,
            loadingIndicatorState: indicatorState,
            theme: this._options.theme,
            isPortionedSearchInProgress: !!this._portionedSearchInProgress
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

    /**
     * Обработчик скролла, вызываемый при помощи регистратора событий по событию в ScrollContainer
     * @param event
     * @param scrollEvent
     * @param initiator
     * @private
     */
    _scrollHandler(event: Event, scrollEvent: Event, initiator: string): void {
        // Код ниже взят из Controls\_popup\Opener\Sticky.ts
        // Из-за флага listenAll на listener'e, подписка доходит до application'a всегда.
        // На ios при показе клавиатуры стреляет событие скролла, что приводит к вызову текущего обработчика
        // и закрытию окна. Для ios отключаю реакцию на скролл, событие скролла стрельнуло на body.
        if (detection.isMobileIOS && (scrollEvent.target === document.body || scrollEvent.target === document)) {
            return;
        }
        _private.closePopup(this);
    },

    /**
     * Обработчик свайпа по записи. Показывает операции по свайпу
     * @param e
     * @param item
     * @param swipeEvent
     * @private
     */
    _onItemSwipe(e: SyntheticEvent<Event>, item: CollectionItem<Model>, swipeEvent: SyntheticEvent<ISwipeEvent>): void {
        if (item instanceof GroupItem) {
            return;
        }
        swipeEvent.stopPropagation();
        const key = item.getContents().getKey();
        const itemContainer = (swipeEvent.target as HTMLElement).closest('.controls-ListView__itemV');
        const swipeContainer =
            itemContainer.classList.contains(ITEM_ACTIONS_SWIPE_CONTAINER_SELECTOR)
                ? itemContainer
                : itemContainer.querySelector('.' + ITEM_ACTIONS_SWIPE_CONTAINER_SELECTOR);

        if (swipeEvent.nativeEvent.direction === 'left') {
            _private.setMarkedKey(this, key);
            _private.getItemActionsController(this).activateSwipe(item.getContents().getKey(), swipeContainer?.clientWidth, swipeContainer?.clientHeight);
        }
        if (swipeEvent.nativeEvent.direction === 'right') {
            const swipedItem = _private.getItemActionsController(this).getSwipeItem();
            if (swipedItem) {
                _private.getItemActionsController(this).setSwipeAnimation(ANIMATION_STATE.CLOSE);
                this._listViewModel.nextVersion();

                // Для сценария, когда свайпнули одну запись и потом свайпнули вправо другую запись
                if (swipedItem !== item) {
                    _private.setMarkedKey(this, key);
                }
            } else {
                // After the right swipe the item should get selected.
                if (!this._selectionController && _private.isItemsSelectionAllowed(this._options)) {
                    this._createSelectionController();
                }
                if (this._selectionController) {
                    const result = _private._getSelectionController(this).toggleItem(key);
                    _private.handleSelectionControllerResult(this, result);
                }
                this._notify('checkboxClick', [key, item.isSelected()]);

                // Animation should be played only if checkboxes are visible.
                if (this._options.multiSelectVisibility !== 'hidden') {
                    _private.getItemActionsController(this).activateRightSwipe(item.getContents().getKey());
                }
                _private.setMarkedKey(this, key);
            }
        }
        if (!this._options.itemActions && item.isSwiped()) {
            this._notify('itemSwipe', [item, swipeEvent, swipeContainer?.clientHeight]);
        }
    },

    /**
     * Обработчик, выполняемый после окончания анимации свайпа по опциям записи
     * @param e
     * @private
     */
    _onActionsSwipeAnimationEnd(e: SyntheticEvent<IAnimationEvent>): void {
        if (e.nativeEvent.animationName === 'itemActionsSwipeClose') {
            const item = _private.getItemActionsController(this).getSwipeItem();
            if (item) {
                if (!this._options.itemActions) {
                    this._notify('itemSwipe', [item, e]);
                }
                _private.getItemActionsController(this).deactivateSwipe();
            }
        }
    },

    /**
     * Обработчик, выполняемый после окончания анимации свайпа по записи
     * @param e
     * @private
     */
    _onItemSwipeAnimationEnd(e: SyntheticEvent<IAnimationEvent>): void {
        if (e.nativeEvent.animationName === 'rightSwipe') {
            _private.getItemActionsController(this).deactivateSwipe();
        }
    },

    _createNewModel(items, modelConfig, modelName): void {
        // Подразумеваем, что Controls/display уже загружен. Он загружается при подключении
        // библиотеки Controls/listRender
        if (typeof modelName !== 'string') {
            throw new TypeError('BaseControl: model name has to be a string when useNewModel is enabled');
        }
        return diCreate(modelName, {...modelConfig, collection: items});
    },

    _onEditingRowKeyDown(e: SyntheticEvent<KeyboardEvent>, nativeEvent: KeyboardEvent): void {
        if (this._editInPlace) {
            switch (nativeEvent.keyCode) {
                case 13: // Enter
                    // Если таблица находится в другой таблице, событие из внутренней таблицы не должно всплывать до внешней
                    this._editInPlace.editNextRow();
                    e.stopPropagation();
                    break;
                case 27: // Esc
                    // Если таблица находится в другой таблице, событие из внутренней таблицы не должно всплывать до внешней
                    e.stopPropagation();
                    return this._editInPlace.cancelEdit();
                    break;
            }
        }
    },

    _onRowDeactivated(e: SyntheticEvent, eventOptions: any): void {
        if (this._editInPlace) {
            this._editInPlace.onRowDeactivated(e, eventOptions);
        }
    },

    _stopBubblingEvent(event: SyntheticEvent<Event>): void {
        // В некоторых кейсах (например ScrollViewer) внутри списков могут находиться
        // другие списки, которые также будут нотифицировать события управления скроллом и тенью
        // Необходимо их останавливать, чтобы скроллом управлял только самый верхний список
        event.stopPropagation();
    },

    _itemsContainerReadyHandler(_: SyntheticEvent<Event>, itemsContainerGetter: Function): void {
        if (this._scrollController) {
            this._scrollController.itemsContainerReady(itemsContainerGetter);
        }
    },

    /**
     * Вызывает деактивацию свайпа когда список теряет фокус
     * @private
     */
    _onListDeactivated: function() {
        if (!this._itemActionsMenuId) {
            _private.closeSwipe(this);
        }
    },

    _observeScrollHandler( _: SyntheticEvent<Event>, eventName: string, params: any): void {
        if (this._scrollController) {
            this._scrollController.observeScroll(eventName, params);
        }
    },

    _shouldShowLoadingIndicator(position: 'beforeEmptyTemplate' | 'afterList' | 'inFooter'): boolean {
        // Глобальный индикатор загрузки при пустом списке должен отображаться поверх emptyTemplate.
        // Если расположить индикатор в подвале, то он будет под emptyTemplate т.к. emptyTemplate выводится до подвала.
        // В таком случае выводим индикатор над списком.
        // FIXME: https://online.sbis.ru/opendoc.html?guid=886c7f51-d327-4efa-b998-7cf94f5467cb
        // не должно быть завязки на горизонтальный скролл.
        if (position === 'beforeEmptyTemplate') {
            return this._loadingIndicatorState === 'up' || (
                this._loadingIndicatorState === 'all' && (
                    this.__needShowEmptyTemplate(this._options.emptyTemplate, this._listViewModel) ||
                    !!this._children.listView && !!this._children.listView.isColumnScrollVisible && this._children.listView.isColumnScrollVisible()
                )
            );
        } else if (position === 'afterList') {
            return this._loadingIndicatorState === 'down';
        } else if (position === 'inFooter') {
            return this._loadingIndicatorState === 'all' &&
                !this.__needShowEmptyTemplate(this._options.emptyTemplate, this._listViewModel) &&
                !(this._children.listView && this._children.listView.isColumnScrollVisible && this._children.listView.isColumnScrollVisible());
        }
        return false;
    },

    // region Drag-N-Drop

    getDndListController(): DndFlatController | DndTreeController {
        return this._dndListController;
    },

    _onMouseMove(event): void {
        // В яндекс браузере каким то образом пришел nativeEvent === null, после чего
        // упала ошибка в коде ниже и страница стала некликабельной. Повторить ошибку не получилось
        // добавляем защиту на всякий случай.
        if (event.nativeEvent) {
            if (detection.isIE) {
                this._onMouseMoveIEFix(event);
            } else {
                // Check if the button is pressed while moving.
                if (!event.nativeEvent.buttons) {
                    this._dragNDropEnded(event);
                }
            }

            // Не надо вызывать onMove если не нажата кнопка мыши.
            // Кнопка мыши может быть не нажата в 2 случаях:
            // 1) Мышь увели за пределы браузера, там отпустили и вернули в браузер
            // 2) Баг IE, который подробнее описан в методе _onMouseMoveIEFix
            if (event.nativeEvent.buttons) {
                _private.onMove(this, event.nativeEvent);
            }
        }
    },

    _onMouseMoveIEFix(event): void {
        // In IE strange bug, the cause of which could not be found. During redrawing of the table the MouseMove
        // event at which buttons = 0 shoots. In 10 milliseconds we will check that the button is not pressed.
        if (!event.nativeEvent.buttons && !this._endDragNDropTimer) {
            this._endDragNDropTimer = setTimeout(() => {
                this._dragNDropEnded(event);
            }, IE_MOUSEMOVE_FIX_DELAY);
        } else {
            clearTimeout(this._endDragNDropTimer);
            this._endDragNDropTimer = null;
        }
    },

    _onTouchMove(event): void {
        _private.onMove(this, event.nativeEvent);
    },

    _onMouseUp(event): void {
        if (this._startEvent) {
            this._dragNDropEnded(event);
        }
    },

    _documentDragStart(dragObject): void {
        if (this._insideDragging) {
            this._dragStart(dragObject, this._draggedKey);
        } else {
            this._dragEntity = dragObject.entity;
        }
        this._documentDragging = true;
    },

    _dragStart(dragObject, draggedKey): void {
        if (!this._dndListController) {
            this._dndListController = _private.createDndListController(this, this._options);
        }

        this._dndListController.startDrag(draggedKey, dragObject.entity);

        // Cобытие mouseEnter на записи может сработать до dragStart.
        // И тогда перемещение при наведении не будет обработано.
        // В таком случае обрабатываем наведение на запись сейчас.
        //TODO: убрать после выполнения https://online.sbis.ru/opendoc.html?guid=0a8fe37b-f8d8-425d-b4da-ed3e578bdd84
        if (this._unprocessedDragEnteredItem) {
            this._processItemMouseEnterWithDragNDrop(this._unprocessedDragEnteredItem);
        }
    },

    _dragLeave(): void {
        // Это функция срабатывает при перетаскивании скролла, поэтому проверяем _dndListController
        if (this._dndListController) {
            this._dndListController.setDragPosition(null);
        }
    },

    _dragEnter(dragObject): void {
        // если мы утащим в другой список, то в нем нужно создать контроллер
        if (!this._dndListController) {
            this._dndListController = _private.createDndListController(this, this._options);
        }
        if (dragObject && cInstance.instanceOfModule(dragObject.entity, 'Controls/dragnDrop:ItemsEntity')) {
            const dragEnterResult = this._notify('dragEnter', [dragObject.entity]);

            if (cInstance.instanceOfModule(dragEnterResult, 'Types/entity:Record')) {
                const draggingItemProjection = this._listViewModel._prepareDisplayItemForAdd(dragEnterResult);
                this._dndListController.setDraggedItems(dragObject.entity, draggingItemProjection);
            } else if (dragEnterResult === true) {
                this._dndListController.setDraggedItems(dragObject.entity);
            }
        }
    },

    _processItemMouseEnterWithDragNDrop(itemData): void {
        let dragPosition;
        if (this._dndListController.isDragging()) {
            dragPosition = this._dndListController.calculateDragPosition(itemData);
            if (dragPosition) {
                const changeDragTarget = this._notify('changeDragTarget', [this._dndListController.getDragEntity(), dragPosition.item, dragPosition.position]);
                if (changeDragTarget !== false) {
                    this._dndListController.setDragPosition(dragPosition);
                }
            }
            this._unprocessedDragEnteredItem = null;
        }
    },

    _documentDragEnd(dragObject): void {
        let dragEndResult: Promise<any> | undefined;
        if (this._insideDragging && this._dndListController) {
            const targetPosition = this._dndListController.getDragPosition();
            if (targetPosition) {
                dragEndResult = this._notify('dragEnd', [dragObject.entity, targetPosition.item, targetPosition.position]);
            }

            // После окончания DnD, не нужно показывать операции, до тех пор, пока не пошевелим мышкой.
            // Задача: https://online.sbis.ru/opendoc.html?guid=9877eb93-2c15-4188-8a2d-bab173a76eb0
            this._showActions = false;
        }

        this._insideDragging = false;
        this._documentDragging = false;

        // Это функция срабатывает при перетаскивании скролла, поэтому проверяем _dndListController
        if (this._dndListController) {
            if (dragEndResult instanceof Promise) {
                _private.showIndicator(this);
                dragEndResult.addBoth(() => {
                    this._dndListController.endDrag();
                    _private.hideIndicator(this);
                });
            } else {
                this._dndListController.endDrag();
            }
        }
    },

    _getDragObject(mouseEvent?, startEvent?): object {
        const result = {
            entity: this._dragEntity
        };
        if (mouseEvent && startEvent) {
            result.domEvent = mouseEvent;
            result.position = _private.getPageXY(mouseEvent);
            result.offset = _private.getDragOffset(mouseEvent, startEvent);
            result.draggingTemplateOffset = DRAGGING_OFFSET;
        }
        return result;
    },

    _dragNDropEnded(event): void {
        if (this._documentDragging) {
            this._notify('_documentDragEnd', [this._getDragObject(event.nativeEvent, this._startEvent)], {bubbling: true});
        }
        if (this._startEvent && this._startEvent.target) {
            this._startEvent.target.classList.remove('controls-DragNDrop__dragTarget');
        }
        this._unregisterMouseMove();
        this._unregisterMouseUp();
        this._dragEntity = null;
        this._startEvent = null;
    },

    _registerMouseMove(): void {
        this._notify('register', ['mousemove', this, this._onMouseMove], {bubbling: true});
        this._notify('register', ['touchmove', this, this._onTouchMove], {bubbling: true});
    },

    _unregisterMouseMove(): void {
        this._notify('unregister', ['mousemove', this], {bubbling: true});
        this._notify('unregister', ['touchmove', this], {bubbling: true});
    },

    _registerMouseUp(): void {
        this._notify('register', ['mouseup', this, this._onMouseUp], {bubbling: true});
        this._notify('register', ['touchend', this, this._onMouseUp], {bubbling: true});
    },

    _unregisterMouseUp(): void {
        this._notify('unregister', ['mouseup', this], {bubbling: true});
        this._notify('unregister', ['touchend', this], {bubbling: true});
    }
    // endregion
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

BaseControl._theme = ['Controls/Classes', 'Controls/list'];

BaseControl.getDefaultOptions = function() {
    return {
        uniqueKeys: true,
        multiSelectVisibility: 'hidden',
        markerVisibility: 'onactivated',
        style: 'default',
        selectedKeys: defaultSelectedKeys,
        excludedKeys: defaultExcludedKeys,
        loadingIndicatorTemplate: 'Controls/list:LoadingIndicatorTemplate',
        continueSearchTemplate: 'Controls/list:ContinueSearchTemplate',
        stickyHeader: true,
        virtualScrollMode: 'remove',
        filter: {},
        itemActionsVisibility: 'onhover'
    };
};
export = BaseControl;
