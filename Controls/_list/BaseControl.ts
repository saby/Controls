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
import {CollectionItem, EditInPlaceController, VirtualScrollController, GroupItem, ANIMATION_STATE} from 'Controls/display';
import {Controller as ItemActionsController, IItemAction} from 'Controls/itemActions';
import {groupUtil} from 'Controls/dataSource';

import ItemsUtil = require('Controls/_list/resources/utils/ItemsUtil');
import ListViewModel from 'Controls/_list/ListViewModel';
import ScrollPagingController = require('Controls/_list/Controllers/ScrollPaging');
import PortionedSearch from 'Controls/_list/Controllers/PortionedSearch';
import GroupingLoader from 'Controls/_list/Controllers/GroupingLoader';
import * as GroupingController from 'Controls/_list/Controllers/Grouping';
import {ISwipeEvent} from 'Controls/listRender';

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

import BaseControlTpl = require('wml!Controls/_list/BaseControl/BaseControl');
import 'wml!Controls/_list/BaseControl/Footer';
import * as itemActionsTemplate from 'wml!Controls/_list/ItemActions/resources/ItemActionsTemplate';
import * as swipeTemplate from 'wml!Controls/_list/Swipe/resources/SwipeTemplate';

// TODO: getDefaultOptions зовётся при каждой перерисовке,
//  соответственно если в опции передаётся не примитив, то они каждый раз новые.
//  Нужно убрать после https://online.sbis.ru/opendoc.html?guid=1ff4a7fb-87b9-4f50-989a-72af1dd5ae18
const defaultSelectedKeys = [];
const defaultExcludedKeys = [];

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
const MIN_SCROLL_PAGING_PROPORTION = 2;

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
    error: Error;
}

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
    isNewModelItemsChange: (action, newItems) => {
        return action && (action !== 'ch' || newItems && !newItems.properties);
    },
    checkDeprecated: function(cfg) {
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
            self._sourceController.load(filter, sorting, null,sourceConfig).addCallback(function(list) {
                _private.hideError(self);
                _private.doAfterUpdate(self, () => {
                if (list.getCount()) {
                    self._loadedItems = list;
                } else {
                    self._loadingIndicatorContainerOffsetTop = _private.getListTopOffset(self);
                }
                if (self._pagingNavigation) {
                    var hasMoreDataDown = list.getMetaData().more;
                        _private.updatePagingData(self, hasMoreDataDown);
                }
                var
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
                        listModel.setItems(list);
                        self._items = listModel.getItems();
                    }
                    self._items.subscribe('onCollectionChange', self._onItemsChanged);

                    if (self._markerController) {
                        _private.updateMarkerController(self, self._options);
                    }

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
    canStartDragNDrop(domEvent: any, cfg: any, isTouch: boolean): boolean {
        return !isTouch &&
            (!cfg.canStartDragNDrop || cfg.canStartDragNDrop()) &&
            cfg.itemsDragNDrop &&
            !(domEvent.nativeEvent.button) &&
            !cfg.readOnly &&
            !domEvent.target.closest('.controls-DragNDrop__notDraggable');
    },
    startDragNDrop(self, domEvent, itemData): void {
        if (_private.canStartDragNDrop(domEvent, self._options, self._context?.isTouch?.isTouch)) {
            const key = self._options.useNewModel ? itemData.getContents().getKey() : itemData.key;

            //Support moving with mass selection.
            //Full transition to selection will be made by: https://online.sbis.ru/opendoc.html?guid=080d3dd9-36ac-4210-8dfa-3f1ef33439aa
            const selection = _private.getSelectionForDragNDrop(self._options.selectedKeys, self._options.excludedKeys, key);
            selection.recursive = false;
            const recordSet = self._options.useNewModel ? self._listViewModel.getCollection() : self._listViewModel.getItems();

            // Ограничиваем получение перемещаемых записей до 100 (максимум в D&D пишется "99+ записей"), в дальнейшем
            // количество записей будет отдавать selectionController https://online.sbis.ru/opendoc.html?guid=b93db75c-6101-4eed-8625-5ec86657080e
            getItemsBySelection(selection, self._options.source, recordSet, self._options.filter, LIMIT_DRAG_SELECTION).addCallback((items) => {
                const dragKeyPosition = items.indexOf(key);
                // If dragged item is in the list, but it's not the first one, move
                // it to the front of the array
                if (dragKeyPosition > 0) {
                    items.splice(dragKeyPosition, 1);
                    items.unshift(key);
                }
                const dragStartResult = self._notify('dragStart', [items]);
                if (dragStartResult) {
                    if (self._options.dragControlId) {
                        dragStartResult.dragControlId = self._options.dragControlId;
                    }
                    self._children.dragNDropController.startDragNDrop(dragStartResult, domEvent);
                    self._draggingItem = itemData;
                }
            });
        }
    },


    resolveIndicatorStateAfterReload: function(self, list, navigation):void {
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

    scrollToItem: function(self, key, toBottom, force) {
        return self._children.scrollController.scrollToItem(key, toBottom, force);
    },

    setMarkedKey(self, key: string | number): void {
        if (key !== undefined && self._markerController) {
            self._markedKey = self._markerController.setMarkedKey(key);
            _private.scrollToItem(self, key);
        }
    },
    moveMarkerToNext: function (self, event) {
        if (self._markerController) {
            self._markedKey = self._markerController.moveMarkerToNext();
            _private.scrollToItem(self, self._markedKey);
        }
    },
    moveMarkerToPrevious: function (self, event) {
        if (self._markerController) {
            self._markedKey = self._markerController.moveMarkerToPrev();
            _private.scrollToItem(self, self._markedKey);
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
    spaceHandler: function(self, event) {
        const model = self.getViewModel();
        let toggledItemId = model.getMarkedKey();

        if (!model.getItemById(toggledItemId) && model.getCount()) {
            toggledItemId = model.at(0).getContents().getId();
        }

        if (toggledItemId) {
            if (self._selectionController) {
                self._selectionController.toggleItem(toggledItemId);
            }
            _private.moveMarkerToNext(self, event);
        }
    },
    prepareFooter: function(self, navigation, sourceController) {
        var
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

    loadToDirection: function(self, direction, userCallback, userErrback, receivedFilter) {
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
            if (self._isMounted && self?._children?.scrollController) {
                self._children.scrollController.stopBatchAdding();
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
            return self._sourceController.load(filter, self._options.sorting, direction).addCallback(function(addedItems) {
                //TODO https://online.sbis.ru/news/c467b1aa-21e4-41cc-883b-889ff5c10747
                //до реализации функционала и проблемы из новости делаем решение по месту:
                //посчитаем число отображаемых записей до и после добавления, если не поменялось, значит прилетели элементы, попадающие в невидимую группу,
                //надо инициировать подгрузку порции записей, больше за нас это никто не сделает.
                //Под опцией, потому что в другом месте это приведет к ошибке. Хорошее решение будет в задаче ссылка на которую приведена
                const countCurrentItems = self._listViewModel.getCount();

                if (self._isMounted && self?._children?.scrollController) {
                    self._children.scrollController.startBatchAdding(direction);
                }

                self._inertialScrolling.callAfterScrollStopped(() => {
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
                });

                // Скрываем ошибку после успешной загрузки данных
                _private.hideError(self);

                return addedItems;
            }).addErrback((error: Error) => {
                _private.hideIndicator(self);
                // скроллим в край списка, чтобы при ошибке загрузки данных шаблон ошибки сразу был виден
                _private.scrollPage(self, (direction === 'up' ? 'Up' : 'Down'));
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

    checkLoadToDirectionCapability: function(self, filter, navigation) {
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
            if (_private.isPortionedLoad(self)) {
                _private.checkPortionedSearchByScrollTriggerVisibility(self, self._loadTriggerVisibility.down);
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

    loadToDirectionIfNeed: function(self, direction, filter) {
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
    onScrollLoadEdge: function (self, direction, filter) {
        if (self._options.navigation && self._options.navigation.view === 'infinity') {
            _private.loadToDirectionIfNeed(self, direction, filter);
        }
    },

    scrollToEdge: function(self, direction) {
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
    scrollPage: function(self, direction) {
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
                up: _private.hasMoreData(self, self._sourceController, 'up'),
                down: _private.hasMoreData(self, self._sourceController, 'down')
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
        _private.doAfterUpdate(self, () => {
            // ToDo option "loadOffset" is crutch for contacts.
            // remove by: https://online.sbis.ru/opendoc.html?guid=626b768b-d1c7-47d8-8ffd-ee8560d01076
            self._isScrollShown = true;

            self._viewPortRect = params.viewPortRect;

            const doubleRatio = (params.scrollHeight / params.clientHeight) > MIN_SCROLL_PAGING_PROPORTION;
            if (!self._scrollPagingCtr) {
                if (_private.needScrollPaging(self._options.navigation)) {
                    _private.createScrollPagingController(self, {
                        scrollTop: self._scrollTop,
                        scrollHeight: params.scrollHeight,
                        clientHeight: params.clientHeight
                    }).addCallback(function(scrollPagingCtr) {
                        self._scrollPagingCtr = scrollPagingCtr;
                        self._pagingVisible = _private.needShowPagingByScrollSize(self, doubleRatio);
                    });
                }
            } else if (_private.needScrollPaging(self._options.navigation)) {
                self._pagingVisible = _private.needShowPagingByScrollSize(self, doubleRatio);
            }
        });
    },

    onScrollHide: function(self) {
        _private.doAfterUpdate(self, () => {
            if (self._pagingVisible) {
                self._pagingVisible = false;
                self._cachedPagingState = false;
                self._forceUpdate();
            }
            self._isScrollShown = false;
        });
    },

    createScrollPagingController: function(self, scrollParams) {
        const scrollPagingConfig = {
            scrollParams,
            mode: self._options.navigation.viewConfig.pagingMode,
            pagingCfgTrigger: (cfg) => {
                self._pagingCfg = cfg;
                self._forceUpdate();
            }
        };
        return new Deferred().callback(new ScrollPagingController(scrollPagingConfig));
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
                    const hasMoreDataUp = _private.hasMoreData(self, self._sourceController, 'up');
                    const hasMoreDataDown = _private.hasMoreData(self, self._sourceController, 'down');

                    hasMoreData = {
                        up: hasMoreDataUp,
                        down: hasMoreDataDown && _private.allowLoadMoreByPortionedSearch(self)
                    };
                }
                self._scrollPagingCtr.handleScrollEdge(params.position, hasMoreData);
            }
        } else {
            if (_private.needScrollPaging(self._options.navigation)) {
                _private.createScrollPagingController(self, {
                    scrollTop: self._scrollTop,
                    scrollHeight: params.scrollHeight,
                    clientHeight: params.clientHeight
                }).addCallback(function(scrollPagingCtr) {
                    self._scrollPagingCtr = scrollPagingCtr;
                });
            }
        }
    },

    setMarkerAfterScrolling: function(self, scrollTop) {
        // TODO вручную обрабатывать pagedown и делать stop propagation
        if (self._markerController) {
            const itemsContainer = self._children.listView.getItemsContainer();
            const topOffset = _private.getTopOffsetForItemsContainer(self, itemsContainer);
            const verticalOffset = scrollTop - topOffset + (getStickyHeadersHeight(self._container, 'top', 'allFixed') || 0);
            self._markedKey = self._markerController.setMarkerOnFirstVisibleItem(itemsContainer.children, verticalOffset);
            self._setMarkerAfterScroll = false;
        }
    },

    // TODO KINGO: Задержка нужна, чтобы расчет видимой записи производился после фиксации заголовка
    delayedSetMarkerAfterScrolling: debounce((self, scrollTop) => {
        _private.setMarkerAfterScrolling(self, self._scrollParams ? self._scrollParams.scrollTop : scrollTop);
    }, SET_MARKER_AFTER_SCROLL_DELAY),

    getTopOffsetForItemsContainer: function(self, itemsContainer) {
        let offsetTop = uDimension(itemsContainer.children[0], true).top;
        let container = self._container[0] || self._container;
        offsetTop += container.offsetTop - uDimension(container).top;
        return offsetTop;
    },

    handleListScrollSync(self, scrollTop) {
        if (self._setMarkerAfterScroll) {
            _private.delayedSetMarkerAfterScrolling(self, scrollTop);
        }

        self._scrollTop = scrollTop;
        self._scrollPageLocked = false;
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
            },
            searchResetCallback: () => {
                self._portionedSearchInProgress = false;
                self._showContinueSearchButton = false;
            },
            searchContinueCallback: () => {
                let direction = _private.hasMoreData(self, self._sourceController, 'up') ? 'up' : 'down';

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
            self._pagingCfg.stateNext = 'disabled';
            self._pagingCfg.stateEnd = 'disabled';
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

    isPortionedLoad(self, items = self._items): boolean {
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
            top: (shadowVisibility.up ||
                showShadowByNavigation && itemsCount && hasMoreData('up')) ? 'visible' : 'auto',
            bottom: (shadowVisibility.down ||
                showShadowByNavigation &&
                showShadowByPortionedSearch && itemsCount && hasMoreData('down')) ? 'visible' : 'auto'
        }], {bubbling: true});
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

    onListChange: function(self, event, changesType, action, newItems, newItemsIndex, removedItems, removedItemsIndex) {
        // TODO Понять, какое ускорение мы получим, если будем лучше фильтровать
        // изменения по changesType в новой модели
        const newModelChanged = self._options.useNewModel && _private.isNewModelItemsChange(action, newItems);
        if (self._pagingNavigation) {
            if (action === IObservable.ACTION_REMOVE || action === IObservable.ACTION_ADD) {
                _private.updatePagingDataByItemsChanged(self, newItems, removedItems);
            }
        }
        if (changesType === 'collectionChanged' || newModelChanged) {
            //TODO костыль https://online.sbis.ru/opendoc.html?guid=b56324ff-b11f-47f7-a2dc-90fe8e371835
            if (self._options.navigation && self._options.navigation.source) {
                self._sourceController.setState(self._listViewModel);
            }
            if (action === IObservable.ACTION_REMOVE && self._itemActionsMenuId) {
                if (removedItems.find((item) => item.getContents().getId() === self._itemWithShownMenu.getId())) {
                    _private.closePopup(self);
                    self._onItemActionsMenuClose();
                }
            }

            if (self._selectionController) {
               let result;

               switch (action) {
                  case IObservable.ACTION_RESET:
                     result = self._selectionController.handleReset(newItems, self._prevRootId, self._prevRootId !== self._options.root);
                     break;
                  case IObservable.ACTION_ADD:
                     result = self._selectionController.handleAddItems(newItems);
                     break;
               }
                self.handleSelectionControllerResult(result);
            }
        }
        // VirtualScroll controller can be created and after that virtual scrolling can be turned off,
        // for example if Controls.explorer:View is switched from list to tile mode. The controller
        // will keep firing `indexesChanged` events, but we should not mark items as changed while
        // virtual scrolling is disabled.
        if (
            changesType === 'collectionChanged' ||
            changesType === 'indexesChanged' && Boolean(self._options.virtualScrollConfig) ||
            newModelChanged
        ) {
            self._itemsChanged = true;
            if (self._itemActionsInitialized) {
                self._updateItemActions(self._options);
            }
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

    /**
     * Обрабатывает клик по записи и отправляет событие actionClick наверх
     * @param self
     * @param action
     * @param clickEvent
     * @param item
     */
    handleItemActionClick(
        self: any,
        action: IItemAction,
        clickEvent: SyntheticEvent<MouseEvent>,
        item: CollectionItem<Model>): void {
        const contents = item?.getContents();

        // TODO Корректно ли тут обращаться по CSS классу для поиска контейнера?
        const itemContainer = (clickEvent.target as HTMLElement).closest('.controls-ListView__itemV');
        self._notify('actionClick', [action, contents, itemContainer]);
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
        action: IItemAction,
        clickEvent: SyntheticEvent<MouseEvent>,
        item: CollectionItem<Model>,
        isContextMenu: boolean): void {
        const itemKey = item?.getContents()?.getKey();
        const menuConfig = self._itemActionsController.prepareActionsMenuConfig(itemKey, clickEvent, action, self, isContextMenu);
        if (menuConfig) {
            menuConfig.eventHandlers = {
                onResult: self._onItemActionsMenuResult,
                onClose: self._onItemActionsMenuClose
            };
            self._listViewModel.setActiveItem(item);
            Sticky.openPopup(menuConfig).then((popupId) => {
                self._itemActionsMenuId = popupId;
            });
        }
    },

    /**
     * Метод, который закрывает меню
     * @private
     */
    closeActionsMenu(self: any): void {
        self._listViewModel.setActiveItem(null);
        self._itemActionsController.deactivateSwipe();
        _private.closePopup(self);
    },

    /**
     * Закрывает popup меню
     * @param self
     */
    closePopup(self): void {
        Sticky.closePopup(self._itemActionsMenuId);
        self._itemActionsMenuId = null;
    },

    bindHandlers(self): void {
        self._onItemActionsMenuClose = self._onItemActionsMenuClose.bind(self);
        self._onItemActionsMenuResult = self._onItemActionsMenuResult.bind(self);
        self._onItemsChanged = self._onItemsChanged.bind(self);
    },

    groupsExpandChangeHandler: function(self, changes) {
        self._notify(changes.changeType === 'expand' ? 'groupExpanded' : 'groupCollapsed', [changes.group], { bubbling: true });
        self._notify('collapsedGroupsChanged', [changes.collapsedGroups]);
        _private.prepareFooter(self, self._options.navigation, self._sourceController);
        if (self._options.historyIdCollapsedGroups || self._options.groupHistoryId) {
            groupUtil.storeCollapsedGroups(changes.collapsedGroups, self._options.historyIdCollapsedGroups || self._options.groupHistoryId);
        }
    },

    prepareCollapsedGroups: function(config) {
        var
            result = new Deferred();
        if (config.historyIdCollapsedGroups || config.groupHistoryId) {
            groupUtil.restoreCollapsedGroups(config.historyIdCollapsedGroups || config.groupHistoryId).addCallback(function(collapsedGroupsFromStore) {
                result.callback(collapsedGroupsFromStore || config.collapsedGroups);
            });
        } else {
            result.callback(config.collapsedGroups);
        }
        return result;
    },

    getSortingOnChange: function(currentSorting, propName) {
        var sorting = cClone(currentSorting || []);
        var sortElem;
        var newSortElem = {};

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

    getSourceController: function({source, navigation, keyProperty}:{source: ICrud, navigation: object, keyProperty: string}, queryParamsCallback): SourceController {
        return new SourceController({
            source: source,
            navigation: navigation,
            keyProperty: keyProperty,
            queryParamsCallback: queryParamsCallback
        })
    },

    checkRequiredOptions: function(options) {
        if (options.keyProperty === undefined) {
            Logger.warn('BaseControl: Option "keyProperty" is required.');
        }
    },

    needBottomPadding: function(options, items, listViewModel) {
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

    isPagingNavigation: function(navigation) {
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
        let countDifferece = (newItems?.length) || (- (removedItems?.length)) || 0;
        let itemsCount = self._pagingLabelData.totalItemsCount + countDifferece;
        _private.updatePagingData(self, itemsCount);
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
    updateNavigation: function(self) {
        self._pagingNavigationVisible = self._pagingNavigation;
    },
    closeEditingIfPageChanged(self, oldNavigation, newNavigation) {
        const oldSourceCfg = oldNavigation && oldNavigation.sourceConfig ? oldNavigation.sourceConfig : {};
        const newSourceCfg = newNavigation && newNavigation.sourceConfig ? newNavigation.sourceConfig : {};
        if (oldSourceCfg.page !== newSourceCfg.page) {
            const isEditing = !!self._children.editInPlace && !!self._listViewModel && (
                self._options.useNewModel ? EditInPlaceController.isEditing(self._listViewModel) : !!self._listViewModel.getEditingItemData()
            );
            if (isEditing) {
                self._children.editInPlace.cancelEdit();
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
        let newHeight = bottom - top - _private.getListTopOffset(self);

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
    setHasMoreData(model, hasMoreData: boolean): boolean {
        if (model) {
            model.setHasMoreData(hasMoreData);
        }
    },
    notifyIfDragging(self, eName, itemData, nativeEvent){
        const model = self.getViewModel();
        // TODO Make available for new model as well
        if (!self._options.useNewModel && (model.getDragEntity() || model.getDragItemData())) {
            self._notify(eName, [itemData, nativeEvent]);
        }
    },
    jumpToEnd(self) {
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

   createSelectionController(self: any, options: any): SelectionController {
      const strategy = this.createSelectionStrategy(options, self._listViewModel.getCollection());

      return new SelectionController({
         model: self._listViewModel,
         selectedKeys: options.selectedKeys,
         excludedKeys: options.excludedKeys,
         strategy
      });
   },

   updateSelectionController(self: any, newOptions: any): void {
      const result = self._selectionController.update({
         model: self._listViewModel,
         selectedKeys: newOptions.selectedKeys,
         excludedKeys: newOptions.excludedKeys,
         strategyOptions: this.getSelectionStrategyOptions(newOptions, self._listViewModel.getCollection())
      });
      this.handleSelectionControllerResult(self, result);
   },

   createSelectionStrategy(options: any, items: RecordSet): ISelectionStrategy {
      const strategyOptions = this.getSelectionStrategyOptions(options, items);
      if (options.parentProperty) {
         return new TreeSelectionStrategy(strategyOptions);
      } else {
         return new FlatSelectionStrategy(strategyOptions);
    }
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

   onSelectedTypeChanged(typeName: string): void {
      let result;
      if (!this._selectionController) {
       this._createSelectionController();
      }

      switch (typeName) {
       case 'selectAll':
          result = this._selectionController.selectAll();
          break;
       case 'unselectAll':
          result = this._selectionController.unselectAll();
          break;
       case 'toggleAll':
          result = this._selectionController.toggleAll();
          break;
      }

      this.handleSelectionControllerResult(result);
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

   onItemsChanged(self: any, action: string, removedItems: [], removedItemsIndex: number): void {
      // подписываемся на рекордсет, чтобы следить какие элементы будут удалены
      // при подписке на модель событие remove летит еще и при скрытии элементов

       let selectionControllerResult;
       switch (action) {
           case IObservable.ACTION_REMOVE:
               if (self._selectionController) {
                   selectionControllerResult = self._selectionController.handleRemoveItems(removedItems);
               }
               if (removedItemsIndex !== undefined && self._markerController) {
                   self._markerController.handleRemoveItems(removedItemsIndex);
               }
               break;
       }
       this.handleSelectionControllerResult(self, selectionControllerResult);
   },

   createMarkerController(self: any, options: any): MarkerController {
        return new MarkerController({
            model: self._listViewModel,
            markerVisibility: options.markerVisibility,
            markedKey: options.hasOwnProperty('markedKey') ? options.markedKey : self._markedKey
        });
   },

    updateMarkerController(self: any, options: any): void {
        self._markedKey = self._markerController.update({
            model: self._listViewModel,
            markerVisibility: options.markerVisibility,
            markedKey: options.hasOwnProperty('markedKey') ? options.markedKey : self._markedKey
        });
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
    _targetItem: null,

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

    _keepScrollAfterReload: false,
    _resetScrollAfterReload: false,
    _scrollPageLocked: false,

    _itemReloaded: false,
    _itemActionsInitialized: false,
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

    // Идентификатор текущего открытого popup
    _itemActionsMenuId: null,

    // Шаблон операций с записью
    _itemActionsTemplate: itemActionsTemplate,

    // Шаблон операций с записью для swipe
    _swipeTemplate: swipeTemplate,

    _markerController: null,
    _markedKey: null,

    constructor(options) {
        BaseControl.superclass.constructor.apply(this, arguments);
        options = options || {};
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
    _beforeMount: function(newOptions, context, receivedState: IReceivedState = {}) {
        var self = this;

        this._inertialScrolling = new InertialScrolling();

        this._notifyNavigationParamsChanged = _private.notifyNavigationParamsChanged.bind(this);
        const receivedError = receivedState.errorConfig;
        const receivedData = receivedState.data;

        _private.checkDeprecated(newOptions);
        _private.checkRequiredOptions(newOptions);

        _private.bindHandlers(this);

        _private.initializeNavigation(this, newOptions);
        _private.updateNavigation(this);

        this._loadTriggerVisibility = {};

        return _private.prepareCollapsedGroups(newOptions).addCallback(function(collapsedGroups) {
            let viewModelConfig = cClone(newOptions);
            if (collapsedGroups) {
                viewModelConfig = cMerge(viewModelConfig, { collapsedGroups });
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

            if (newOptions.markerVisibility !== 'hidden') {
                self._markerController = _private.createMarkerController(self, newOptions);
            }

            if (newOptions.source) {
                self._sourceController = _private.getSourceController(newOptions, self._notifyNavigationParamsChanged);
                if (receivedData) {
                    self._sourceController.calculateState(receivedData);
                    _private.setHasMoreData(self._listViewModel, _private.hasMoreDataInAnyDirection(self, self._sourceController));

                    if (newOptions.useNewModel) {
                        self._items = self._listViewModel.getCollection();
                    } else {
                        self._items = self._listViewModel.getItems();
                    }
                    self._needBottomPadding = _private.needBottomPadding(newOptions, self._items, self._listViewModel);
                    if (self._pagingNavigation) {
                        var hasMoreData = self._items.getMetaData().more;
                        _private.updatePagingData(self, hasMoreData);
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

                        _private.setHasMoreData(self._listViewModel, _private.hasMoreDataInAnyDirection(self, self._sourceController));

                        if (newOptions.itemsReadyCallback) {
                            newOptions.itemsReadyCallback(self._listViewModel.getCollection());
                        }
                        if (self._listViewModel) {
                            _private.initListViewModelHandler(self, self._listViewModel, newOptions.useNewModel);
                        }
                    }
                    self._needBottomPadding = _private.needBottomPadding(newOptions, data, self._listViewModel);

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

        if (detection.isMobileIOS) {
            this._inertialScrolling.scrollStarted();
        }
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

    viewportResizeHandler(_: SyntheticEvent<Event>, viewportHeight: number, viewportRect: number): void {
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
            this._needPagingTimeout = setTimeout(() => {
                this._pagingVisible = _private.needShowPagingByScrollSize(this, doubleRatio);
            }, 18);
        }
    },

    updateShadowModeHandler(_: SyntheticEvent<Event>, shadowVisibility: {down: boolean, up: boolean}): void {
        this._shadowVisibility = shadowVisibility;
        _private.updateShadowMode(this, shadowVisibility);
    },

    loadMore(_: SyntheticEvent<Event>, direction: IDirection): void {
        if (this._options?.navigation?.view === 'infinity') {
            _private.loadToDirectionIfNeed(this, direction, this._options.filter);
        }
    },

    triggerVisibilityChangedHandler(_: SyntheticEvent<Event>, direction: IDirection, state: boolean): void {
        this._loadTriggerVisibility[direction] = state;
        if (!state && this._hideIndicatorOnTriggerHideDirection === direction) {
            _private.hideIndicator(this);
        }
        if (_private.needScrollPaging(this._options.navigation)) {
            const doubleRatio = (this._viewSize / this._viewPortSize) > MIN_SCROLL_PAGING_PROPORTION;
            this._pagingVisible = _private.needShowPagingByScrollSize(this, doubleRatio);
        }
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

    getViewModel() {
        return this._listViewModel;
    },

    getSourceController: function() {
        return this._sourceController;
    },

    _afterMount: function() {
        this._isMounted = true;
        const container = this._container[0] || this._container;
        this._viewSize = container.clientHeight;
        if (this._options.itemsDragNDrop) {
            container.addEventListener('dragstart', this._nativeDragStart);
        }
        this._loadedItems = null;

        if (this._options.selectedKeys && this._options.selectedKeys.length !== 0) {
            this._createSelectionController();
        }

        if (this._options.useNewModel) {
            return import('Controls/listRender').then((listRender) => {
                this._itemActionsTemplate = listRender.itemActionsTemplate;
            });
        }

        // для связи с контроллером ПМО
        this._notify('register', ['selectedTypeChanged', this, _private.onSelectedTypeChanged], {bubbling: true});
    },

    _beforeUpdate: function(newOptions) {
        this._updateInProgress = true;
        var filterChanged = !isEqual(newOptions.filter, this._options.filter);
        var navigationChanged = !isEqual(newOptions.navigation, this._options.navigation);
        var resetPaging = this._pagingNavigation && filterChanged;
        var recreateSource = newOptions.source !== this._options.source || navigationChanged || resetPaging;
        var sortingChanged = !isEqual(newOptions.sorting, this._options.sorting);
        var self = this;
        this._needBottomPadding = _private.needBottomPadding(newOptions, this._items, self._listViewModel);
        this._prevRootId = this._options.root;
        if (!isEqual(newOptions.navigation, this._options.navigation)) {

            // При смене страницы, должно закрыться редактирование записи.
            _private.closeEditingIfPageChanged(this, this._options.navigation, newOptions.navigation);
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
            this._modelRecreated = true;
        }

        if (newOptions.groupMethod !== this._options.groupMethod) {
            _private.reload(this, newOptions);
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
            this._listViewModel.setSearchValue(newOptions.searchValue);
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
        }

        if (this._markerController) {
            _private.updateMarkerController(this, newOptions);
        }

        // UC1: Record might be editing on page load, then we should initialize Item Actions.
        // UC2: We should reassign ItemActions on model change before drawing them in For template
        if (
           recreateSource ||
           newOptions.itemActions !== this._options.itemActions ||
           newOptions.itemActionVisibilityCallback !== this._options.itemActionVisibilityCallback ||
           ((newOptions.itemActions || newOptions.itemActionsProperty) && this._modelRecreated) ||
           newOptions.itemActionsProperty ||
           (newOptions.editingConfig && newOptions.editingConfig.item)
        ) {
            this._updateItemActions(newOptions);
        }

        if (filterChanged || recreateSource || sortingChanged) {
            _private.resetPagingNavigation(this, newOptions.navigation);
            if (this._itemActionsMenuId) {
                _private.closePopup(self);
                this._onItemActionsMenuClose();
            }

            // return result here is for unit tests
            return _private.reload(self, newOptions).addCallback(() => {
                this._needBottomPadding = _private.needBottomPadding(newOptions, this._items, this._listViewModel);
            });
        }

        if (this._itemsChanged) {
            this._shouldNotifyOnDrawItems = true;
        }

        if (this._loadedItems) {
            this._shouldRestoreScrollPosition = true;
        }

        if (this._selectionController) {
            _private.updateSelectionController(this, newOptions);
        }
    },

    reloadItem: function(key:String, readMeta:Object, replaceItem:Boolean, reloadType = 'read'):Deferred {
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
                error: error,
                mode: dataSourceError.Mode.dialog
            });
        });
    },

    scrollToItem(key: string|number, toBottom: boolean, force: boolean): void {
        return _private.scrollToItem(this, key, toBottom, force);
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

        // для связи с контроллером ПМО
        this._notify('unregister', ['selectedTypeChanged', this], {bubbling: true});

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
            this._loadedItems = null;
            this._shouldRestoreScrollPosition = false;
            this._children.scrollController.checkTriggerVisibilityWithTimeout();
        }

        // До отрисовки элементов мы не можем понять потребуется ли еще загрузка (зависит от видимости тригеров).
        // Чтобы индикатор загрузки не мигал, показываем индикатор при загрузки, а скрываем после отрисовки.
        const hasTrigger = this._loadTriggerVisibility.hasOwnProperty(this._loadingIndicatorState);
        const isTriggerVisible = !this._loadTriggerVisibility[this._loadingIndicatorState];
        const isLoading = !!this._sourceController && this._sourceController.isLoading();

        if (this._loadingIndicatorState && !isLoading && hasTrigger && isTriggerVisible) {
            _private.hideIndicator(this);
        }
    },

    _afterUpdate(oldOptions): void {
        this._updateInProgress = false;
        if (this._shouldNotifyOnDrawItems) {
            this._notify('drawItems');
            this._shouldNotifyOnDrawItems = false;
            this._itemsChanged = false;
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
        this._modelRecreated = false;
        if (this._callbackAfterUpdate) {
            this._callbackAfterUpdate.forEach((callback) => {
                callback();
            });
            this._callbackAfterUpdate = null;
        }
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
        const noEdit =
            this._options.useNewModel
            ? !EditInPlaceController.isEditing(listViewModel)
            : !listViewModel.getEditingItemData();
        const isLoading = this._sourceController && this._sourceController.isLoading();
        const notHasMore = !_private.hasMoreDataInAnyDirection(this, this._sourceController);
        const noDataBeforeReload = this._noDataBeforeReload;
        return emptyTemplate && noEdit && notHasMore && (isLoading ? noData && noDataBeforeReload : noData);
    },

    _onCheckBoxClick: function(e, key, status, readOnly) {
        if (!readOnly) {
            if (!this._selectionController) {
               this._createSelectionController();
            }

            const result = this._selectionController.toggleItem(key);
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

    reload: function(keepScroll: boolean, sourceConfig: IBaseSourceConfig) {
        if (keepScroll) {
            this._keepScrollAfterReload = true;
        }
        return _private.reload(this, this._options, sourceConfig).addCallback(getData);
    },

    setMarkedKey(key: number|string): void {
        _private.setMarkedKey(this, key);
    },

    _onGroupClick: function(e, groupId, baseEvent) {
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

    /**
     * Обработка нажатия на кнопку "сохранить"
     * TODO вроде делает то же самое, что commitEdit
     * @private
     */
    _commitEditActionHandler(): void {
        this._children.editInPlace.commitAndMoveNextRow();
    },

    /**
     * Обработка нажатия на кнопку "отмена"
     * TODO вроде делает то же самое, что cancelEdit
     * @private
     */
    _cancelEditActionHandler(): void {
        this._children.editInPlace.cancelEdit();
    },
    /**
     * Выполняется из шаблона при mouseenter
     * @private
     */
    _initItemActions(): void {
        if (!this._itemActionsInitialized) {
            this._updateItemActions(this._options);
            this._itemActionsInitialized = true;
        }
    },

    /**
     * Необходимо передавать опции для случая, когда в результате изменения модели меняются параметры
     * для показа ItemActions и их нужно поменять до отрисовки.
     * @param options
     * @private
     */
    _updateItemActions(options: any): void {
        // Проверки на __error не хватает, так как реактивность работает не мгновенно, и это состояние может не
        // соответствовать опциям error.Container. Нужно смотреть по текущей ситуации на наличие ItemActions
        if (this.__error || !this._listViewModel) {
            return;
        }
        if (!this._itemActionsController) {
            this._itemActionsController = new ItemActionsController();
        }
        const editingConfig = this._listViewModel.getEditingConfig();
        const isActionsAssigned = this._listViewModel.isActionsAssigned();
        const itemActionsChangeResult = this._itemActionsController.update({
            collection: this._listViewModel,
            itemActions: options.itemActions,
            itemActionsProperty: options.itemActionsProperty,
            visibilityCallback: options.itemActionVisibilityCallback,
            itemActionsPosition: options.itemActionsPosition,
            style: options.style,
            theme: options.theme,
            actionAlignment: options.actionAlignment,
            actionCaptionPosition: options.actionCaptionPosition,
            itemActionsClass: options.itemActionsClass,
            iconSize: editingConfig ? 's' : 'm',
            editingToolbarVisible: editingConfig?.toolbarVisibility
        });
        if (itemActionsChangeResult.length > 0 && this._listViewModel.resetCachedItemData) {
            itemActionsChangeResult.forEach((recordKey: number | string) => {
                this._listViewModel.resetCachedItemData(recordKey);
            });
            this._listViewModel.nextModelVersion(!isActionsAssigned, 'itemActionsUpdated');
        }
    },

    _onAfterEndEdit(event: SyntheticEvent, item: Model, isAdd: boolean) {
        this._notify('afterEndEdit', [item, isAdd]);
        this._updateItemActions(this._options);
    },

    /**
     * Обработчик создания/редактирования записи
     * @param event
     * @param item
     * @param isAdd
     * @private
     */
    _onAfterBeginEdit(event: SyntheticEvent, item: Model, isAdd: boolean) {
        const result = this._notify('afterBeginEdit', [item, isAdd]);
        /*
        * TODO: KINGO
        * При начале редактирования нужно обновить операции наз записью у редактируемого элемента списка, т.к. в режиме
        * редактирования и режиме просмотра они могут отличаться. На момент события beforeBeginEdit еще нет редактируемой
        * записи. В данном месте цикл синхронизации itemActionsControl'a уже случился и обновление через выставление флага
        * _canUpdateItemsActions приведет к показу неактуальных операций.
        */
        this._updateItemActions(this._options);
        return result;
    },

    /**
     * Обработчик показа контекстного меню
     * @param e
     * @param item
     * @param clickEvent
     * @private
     */
    _onItemContextMenu(e: SyntheticEvent<Event>, item: CollectionItem<Model>, clickEvent: SyntheticEvent<MouseEvent>): void {
        clickEvent.preventDefault();
        clickEvent.stopPropagation();
        let contents = item.getContents();
        if (item['[Controls/_display/BreadcrumbsItem]']) {
            contents = contents[contents.length - 1];
        }
        _private.openItemActionsMenu(this, null, clickEvent, item, true);
        _private.setMarkedKey(this, contents.getKey());
    },

    /**
     * Обработчик клика по операции
     * @param event
     * @param action
     * @param item
     * @private
     */
    _onItemActionsClick(event: SyntheticEvent<MouseEvent>, action: IItemAction, item: CollectionItem<Model>): void {
        event.stopPropagation();
        const key = item.getContents ? item.getContents().getId() : item.key;
        this.setMarkedKey(key);

        if (action && !action._isMenu && !action['parent@']) {
            _private.handleItemActionClick(this, action, event, item);
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
                const item = this._listViewModel.getActiveItem();
                _private.handleItemActionClick(this, action, clickEvent, item);
            }
        }
    },

    /**
     * Обработчик закрытия выпадающего/контекстного меню
     * @private
     */
    _onItemActionsMenuClose(clickEvent: SyntheticEvent<MouseEvent>): void {
        this._listViewModel.setActiveItem(null);
        this._itemActionsController.deactivateSwipe();
        this._itemActionsMenuId = null;
    },

    _onItemsChanged(event, action, newItems, newItemsIndex, removedItems, removedItemsIndex): void {
        _private.onItemsChanged(this, action, removedItems, removedItemsIndex);
    },

    _itemMouseDown(event, itemData, domEvent) {
        let hasDragScrolling = false;
        this._mouseDownItemKey = this._options.useNewModel ? itemData.getContents().getKey() : itemData.key;
        if (this._options.columnScroll) {
            hasDragScrolling = typeof this._options.dragScrolling === 'boolean' ? this._options.dragScrolling : !this._options.itemsDragNDrop;
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
        // При таких сценариях нельзя устанавливать маркер по событию itemClick, т.к. оно не произойдет (itemClick = mouseDown + mouseUp на одном блоке).
        // Также, нельзя устанавливать маркер по mouseDown, блок сменится раньше и клик по записи не выстрелет.

        // При редактировании по месту маркер появляется только если в списке больше одной записи.
        // https://online.sbis.ru/opendoc.html?guid=e3ccd952-cbb1-4587-89b8-a8d78500ba90
        const canBeMarked = this._mouseDownItemKey === key && (!this._options.editingConfig || (this._options.editingConfig && this._items.getCount() > 1));

        if (canBeMarked) {
            this.setMarkedKey(key);
        }
        this._mouseDownItemKey = undefined;
        this._notify('itemMouseUp', [itemData.item, domEvent.nativeEvent]);
    },

    _startDragNDropCallback(): void {
        _private.startDragNDrop(this, this._savedItemMouseDownEventArgs.domEvent, this._savedItemMouseDownEventArgs.itemData);
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

    _onDataError(event: unknown, errorConfig: IErrbackConfig): void {
        _private.processError(this, {
            error: errorConfig.error,
            mode: errorConfig.mode || dataSourceError.Mode.dialog
        });
    },

    _nativeDragStart: function(event) {
        // preventDefault нужно делать именно на нативный dragStart:
        // 1. getItemsBySelection может отрабатывать асинхронно (например при массовом выборе всех записей), тогда
        //    preventDefault в startDragNDrop сработает слишком поздно, браузер уже включит нативное перетаскивание
        // 2. На mouseDown ставится фокус, если на нём сделать preventDefault - фокус не будет устанавливаться
        event.preventDefault();
    },

    _dragStart: function(event, dragObject, domEvent) {
        if (this._options.useNewModel) {
            this._draggingEntity = dragObject.entity;
        } else {
            this._listViewModel.setDragEntity(dragObject.entity);
            this._listViewModel.setDragItemData(this._listViewModel.getItemDataByItem(this._draggingItem.dispItem));

            // Cобытие mouseEnter на записи может сработать до dragStart.
            // И тогда перемещение при наведении не будет обработано.
            // В таком случае обрабатываем наведение на запись сейчас.
            //
            //TODO: убрать после выполнения https://online.sbis.ru/opendoc.html?guid=0a8fe37b-f8d8-425d-b4da-ed3e578bdd84
            if (this._unprocessedDragEnteredItem) {
                this._processItemMouseEnterWithDragNDrop(event, this._unprocessedDragEnteredItem);
            }
        }
    },

    _dragEnd: function(event, dragObject) {
        if (this._options.itemsDragNDrop) {
            this._dragEndHandler(dragObject);
        }
    },

    _dragEndHandler: function(dragObject) {
        if (!this._options.useNewModel) {
            var targetPosition = this._listViewModel.getDragTargetPosition();
            if (targetPosition) {
                this._dragEndResult = this._notify('dragEnd', [dragObject.entity, targetPosition.item, targetPosition.position]);
            }
        }
        // После окончания DnD, не нужно показывать операции, до тех пор, пока не пошевелим мышкой. Задача: https://online.sbis.ru/opendoc.html?guid=9877eb93-2c15-4188-8a2d-bab173a76eb0
        this._showActions = false;
    },

    handleKeyDown(event): void {
        this._onViewKeyDown(event);
    },

    _onViewKeyDown: function(event) {
        // Если фокус выше ColumnsView, то событие не долетит до нужного обработчика, и будет сразу обработано BaseControl'ом
        // передаю keyDownHandler, чтобы обработать событие независимо от положения фокуса.
        if (!_private.isBlockedForLoading(this._loadingIndicatorState) && (!this._options._keyDownHandler || !this._options._keyDownHandler(event))) {
            let key = event.nativeEvent.keyCode;
            let dontStop = key === 33
                || key === 34
                || key === 35
                || key === 36;
            keysHandler(event, HOT_KEYS, _private, this, dontStop);
        }
    },
    _dragEnter: function(event, dragObject) {
        if (
            dragObject && !this._options.useNewModel &&
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
        if (this._options.useNewModel) {
            this._draggingTargetItem = null;
        } else {
            this._listViewModel.setDragTargetPosition(null);
        }
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
        if (this._options.useNewModel) {
            this._draggingEntity = null;
            this._draggingItem = null;
            this._draggingTargetItem = null;
        } else {
            this._listViewModel.setDragTargetPosition(null);
            this._listViewModel.setDragItemData(null);
            this._listViewModel.setDragEntity(null);
        }
    },
    _processItemMouseEnterWithDragNDrop(_, itemData) {
        const dragEntity = this._options.useNewModel ? this._draggingEntity : this._listViewModel.getDragEntity();
        let dragPosition;
        if (dragEntity) {
            dragPosition = this._options.useNewModel ?
                    {position: 'before', item: itemData.getContents()} :
                    this._listViewModel.calculateDragTargetPosition(itemData);
            if (dragPosition && this._notify('changeDragTarget', [dragEntity, dragPosition.item, dragPosition.position]) !== false) {
                if (this._options.useNewModel) {
                    this._draggingTargetItem = dragPosition.item;
                } else {
                    this._listViewModel.setDragTargetPosition(dragPosition);
                }
            }
            this._unprocessedDragEnteredItem = null;
        }
    },
    _itemMouseEnter(event: SyntheticEvent<MouseEvent>, itemData: CollectionItem<Model>, nativeEvent: Event): void {
        if (this._options.itemsDragNDrop) {
            this._unprocessedDragEnteredItem = itemData;
            this._processItemMouseEnterWithDragNDrop(event, itemData);
        }
        this._notify('itemMouseEnter', [itemData.item, nativeEvent]);
    },

    _itemMouseMove(event, itemData, nativeEvent) {
        this._notify('itemMouseMove', [itemData.item, nativeEvent]);
        if (
            !this._options.useNewModel &&
            (!this._options.itemsDragNDrop || !this._listViewModel.getDragEntity() && !this._listViewModel.getDragItemData()) &&
            !this._showActions
        ) {
            this._showActions = true;
        }
        if (this._options.itemsDragNDrop) {
            _private.notifyIfDragging(this, 'draggingItemMouseMove', itemData, nativeEvent);
        }
    },
    _itemMouseLeave(event, itemData, nativeEvent) {
        this._notify('itemMouseLeave', [itemData.item, nativeEvent]);
        if (this._options.itemsDragNDrop) {
            this._unprocessedDragEnteredItem = null;
            _private.notifyIfDragging(this, 'draggingItemMouseLeave', itemData, nativeEvent);
        }
    },
    _sortingChanged: function(event, propName) {
        var newSorting = _private.getSortingOnChange(this._options.sorting, propName);
        event.stopPropagation();
        this._notify('sortingChanged', [newSorting]);
    },

    __pagingChangePage: function (event, page) {
        this._currentPage = page;
        this._applyPagingNavigationState({page: this._currentPage});
    },

    _changePageSize: function(e, key) {
        this._currentPageSize = PAGE_SIZE_ARRAY[key-1].pageSize;
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

    _applyPagingNavigationState: function(params) {
        var newNavigation = cClone(this._options.navigation);
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

    recreateSourceController: function(newSource, newNavigation, newKeyProperty) {

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
            this._itemActionsController.activateSwipe(item.getContents().getKey(), swipeContainer?.clientHeight);
            _private.setMarkedKey(this, key);
        }
        if (swipeEvent.nativeEvent.direction === 'right') {
            // After the right swipe the item should get selected. (Кусок старого кода)
            if (!this._selectionController) {
                this._createSelectionController();
            }
            const result = this._selectionController.toggleItem(key);
            _private.handleSelectionControllerResult(this, result);
            this._notify('checkboxClick', [key, item.isSelected()]);

            // TODO Проверить. Код ниже задавал Для Item controls-ListView__item_rightSwipeAnimation
            //  для решения https://online.sbis.ru/doc/e3866e50-5a3e-4403-a64e-0841db9cda9f.
            //  Надо, то реализовать в новой модели.
            // Animation should be played only if checkboxes are visible.
            // if (this._options.multiSelectVisibility !== 'hidden') {
            //     this._listViewModel.setRightSwipedItem(itemData);
            // }
            this._listViewModel.setSwipeAnimation(ANIMATION_STATE.CLOSE);
            this._listViewModel.nextVersion();
            _private.setMarkedKey(this, key);
        }
        if (!this._options.itemActions && item.isSwiped()) {
            this._notify('itemSwipe', [item, swipeEvent, swipeContainer?.clientHeight]);
        }
    },

    /**
     * Обработчик события окончания анимации свайпа по записи
     * @param e
     * @private
     */
    _onSwipeAnimationEnd(e: SyntheticEvent<IAnimationEvent>): void {
        if (e.nativeEvent.animationName === 'rightSwipe' && this._listViewModel.getSwipeAnimation() === ANIMATION_STATE.CLOSE) {
            const item = this._itemActionsController.getSwipeItem();
            if (!this._options.itemActions && item) {
                this._notify('itemSwipe', [item, e]);
            }
            this._itemActionsController.deactivateSwipe();
        }
    },

    _createNewModel(items, modelConfig, modelName): void {
        // Подразумеваем, что Controls/display уже загружен. Он загружается при подключении
        // библиотеки Controls/listRender
        if (typeof modelName !== 'string') {
            throw new TypeError('BaseControl: model name has to be a string when useNewModel is enabled');
        }
        return diCreate(modelName, { ...modelConfig, collection: items });
    },

    handleSelectionControllerResult(result: ISelectionControllerResult): void {
       _private.handleSelectionControllerResult(this, result);
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
        stickyHeader: true,
        virtualScrollMode: 'remove',
        filter: {}
    };
};
export = BaseControl;
