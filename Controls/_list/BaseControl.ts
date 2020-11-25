import rk = require('i18n!Controls');

// Core imports
import Control = require('Core/Control');
import cClone = require('Core/core-clone');
import cMerge = require('Core/core-merge');
import cInstance = require('Core/core-instance');
import Deferred = require('Core/Deferred');

import {constants, detection, compatibility} from 'Env/Env';

import {IObservable, RecordSet} from 'Types/collection';
import {isEqual} from 'Types/object';
import {ICrud, Memory, CrudEntityKey, LOCAL_MOVE_POSITION} from 'Types/source';
import {debounce, throttle} from 'Types/function';
import {create as diCreate} from 'Types/di';
import {Model, relation} from 'Types/entity';
import {IHashMap} from 'Types/declarations';

import {SyntheticEvent} from 'Vdom/Vdom';
import {ControllerClass, Container as ValidateContainer} from 'Controls/validate';
import {Logger} from 'UI/Utils';

import {TouchContextField} from 'Controls/context';
import {error as dataSourceError, NewSourceController as SourceController, ISourceControllerOptions} from 'Controls/dataSource';
import {
    INavigationOptionValue,
    INavigationSourceConfig,
    IBaseSourceConfig,
    Direction,
    ISelectionObject
} from 'Controls/interface';
import { Sticky } from 'Controls/popup';

// Utils imports
import {getItemsBySelection} from 'Controls/_list/resources/utils/getItemsBySelection';
import {tmplNotify, keysHandler} from 'Controls/eventUtils';
import {getDimensions as uDimension} from 'Controls/sizeUtils';
import { getItemsHeightsData } from 'Controls/_list/ScrollContainer/GetHeights';
import {
    Collection,
    CollectionItem,
    GroupItem, IEditableCollectionItem,
    TItemKey,
    TreeItem
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

import {
    Controller as EditInPlaceController,
    InputHelper as EditInPlaceInputHelper,
    CONSTANTS,
    JS_SELECTORS
} from '../editInPlace';
import {IEditableListOption} from './interface/IEditableList';

import {default as ScrollController, IScrollParams} from './ScrollController';

import {groupUtil} from 'Controls/dataSource';
import {IDirection} from './interface/IVirtualScroll';
import {CssClassList} from './resources/utils/CssClassList';
import {
    FlatSelectionStrategy,
    TreeSelectionStrategy,
    ISelectionStrategy,
    ITreeSelectionStrategyOptions,
    IFlatSelectionStrategyOptions,
    SelectionController
} from 'Controls/multiselection';
import { MarkerController } from 'Controls/marker';
import {
    DndController,
    FlatStrategy, IDragStrategyParams,
    TreeStrategy
} from 'Controls/listDragNDrop';

import BaseControlTpl = require('wml!Controls/_list/BaseControl/BaseControl');
import 'wml!Controls/_list/BaseControl/Footer';

import {IList} from './interface/IList';
import { IScrollControllerResult } from './ScrollContainer/interfaces';
import { EdgeIntersectionObserver } from 'Controls/scroll';
import { ItemsEntity } from 'Controls/dragnDrop';
import {IMoveControllerOptions, MoveController} from './Controllers/MoveController';
import {IMoverDialogTemplateOptions} from 'Controls/moverDialog';
import {RemoveController} from './Controllers/RemoveController';
import {isLeftMouseButton} from 'Controls/popup';
import {MultiPromise} from 'Controls/Utils/MultiPromise';

// TODO: getDefaultOptions зовётся при каждой перерисовке,
//  соответственно если в опции передаётся не примитив, то они каждый раз новые.
//  Нужно убрать после https://online.sbis.ru/opendoc.html?guid=1ff4a7fb-87b9-4f50-989a-72af1dd5ae18
const defaultSelectedKeys = [];
const defaultExcludedKeys = [];

// = 28 + 6 + 6 см controls-BaseControl_paging-Padding_theme TODO не должно такого быть, он в разных темах разный
const PAGING_PADDING = 40;

// ключ операции удаления записи
const DELETE_ACTION_KEY = 'delete';

const PAGE_SIZE_ARRAY = [{id: 1, title: '5', pageSize: 5},
    {id: 2, title: '10', pageSize: 10},
    {id: 3, title: '25', pageSize: 25},
    {id: 4, title: '50', pageSize: 50},
    {id: 5, title: '100', pageSize: 100},
    {id: 6, title: '200', pageSize: 200},
    {id: 7, title: '500', pageSize: 500}];

const
    HOT_KEYS = {
        moveMarkerToNext: constants.key.down,
        moveMarkerToPrevious: constants.key.up,
        spaceHandler: constants.key.space,
        enterHandler: constants.key.enter,
        keyDownHome: constants.key.home,
        keyDownEnd: constants.key.end,
        keyDownPageUp: constants.key.pageUp,
        keyDownPageDown: constants.key.pageDown,
        keyDownDel: constants.key.del
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
const SCROLLMOVE_DELAY = 150;
/**
 * Минимальное количество элементов, при которых должен отобразиться пэйджинг
 */
const PAGING_MIN_ELEMENTS_COUNT = 5;
/**
 * Нативный IntersectionObserver дергает callback по перерисовке.
 * В ie нет нативного IntersectionObserver.
 * Для него работает полифилл, используя throttle. Поэтому для ie нужна задержка
 */
const CHECK_TRIGGERS_DELAY_IF_NEED = detection.isIE || detection.isMobileIOS ? 150 : 0;
const SWIPE_MEASUREMENT_CONTAINER_SELECTOR = 'js-controls-ItemActions__swipeMeasurementContainer';

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

type CancelableError = Error & { canceled?: boolean, isCanceled?: boolean };
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
    getItemActionsController(self, options: IList): ItemActionsController {
        // При существующем контроллере нам не нужны дополнительные проверки как при инициализации.
        // Например, может потребоваться продолжение работы с контроллером после показа ошибки в Popup окне,
        // когда _error не зануляется.
        if (self._itemActionsController) {
            return self._itemActionsController;
        }
        // Проверки на __error не хватает, так как реактивность работает не мгновенно, и это состояние может не
        // соответствовать опциям error.Container. Нужно смотреть по текущей ситуации на наличие ItemActions
        if (self.__error || !self._listViewModel) {
            return;
        }
        const editingConfig = self._listViewModel.getEditingConfig();
        // Если нет опций записи, проперти, и тулбар для редактируемой записи выставлен в false, то не надо
        // инициализировать контроллер
        if (
            (options && !options.itemActions && !options.itemActionsProperty) &&
            !editingConfig?.toolbarVisibility
        ) {
            return;
        }

        self._itemActionsController = new ItemActionsController();

        return self._itemActionsController;
    },

    isNewModelItemsChange: (action, newItems) => {
        return action && (action !== 'ch' || newItems && !newItems.properties);
    },
    checkDeprecated(cfg) {
        if (cfg.historyIdCollapsedGroups) {
            Logger.warn('IGrouped: Option "historyIdCollapsedGroups" is deprecated and removed in 19.200. Use option "groupHistoryId".');
        }
        if (cfg.navigation &&
            cfg.navigation.viewConfig &&
            cfg.navigation.viewConfig.pagingMode === 'direct') {
            Logger.warn('INavigation: The "direct" value in "pagingMode" was deprecated and removed in 21.1000. Use the value "basic".');
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

    supportAttachLoadTopTriggerToNull(options): boolean {
        // Поведение отложенной загрузки вверх нужно опциональное, например, для контактов
        // https://online.sbis.ru/opendoc.html?guid=f07ea1a9-743c-42e4-a2ae-8411d59bcdce
        // Для мобильных устройств данный функционал включать нельзя из-за инерционного скролла:
        // https://online.sbis.ru/opendoc.html?guid=45921906-4b0e-4d72-bb80-179c076412d5
        if (options.attachLoadTopTriggerToNull === false || detection.isMobilePlatform) {
            return false;
        }
        // Прижимать триггер к верху списка нужно только при infinity-навигации.
        // В случае с pages, demand и maxCount проблема дополнительной загрузки после инициализации списка отсутствует.
        const isInfinityNavigation = _private.isInfinityNavigation(options.navigation);
        if (!isInfinityNavigation) {
            return false;
        }
        return true;
    },

    needAttachLoadTopTriggerToNull(self): boolean {
        const sourceController = self._sourceController;
        const hasMoreData = _private.hasMoreData(self, sourceController, 'up');
        return sourceController && hasMoreData;
    },

    attachLoadTopTriggerToNullIfNeed(self, options): boolean {
        const supportAttachLoadTopTriggerToNull = _private.supportAttachLoadTopTriggerToNull(options);
        if (!supportAttachLoadTopTriggerToNull) {
            return false;
        }
        const needAttachLoadTopTriggerToNull = _private.needAttachLoadTopTriggerToNull(self);
        if (needAttachLoadTopTriggerToNull && self._isMounted) {
            self._attachLoadTopTriggerToNull = true;
            self._needScrollToFirstItem = true;
            self._scrollTop = 1;
        } else {
            self._attachLoadTopTriggerToNull = false;
        }
        self._updateScrollController(options);
        return needAttachLoadTopTriggerToNull;
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
            self._sourceController.reload(sourceConfig).addCallback(function(list) {
                // Пока загружались данные - список мог уничтожится. Обрабатываем это.
                // https://online.sbis.ru/opendoc.html?guid=8bd2ff34-7d72-4c7c-9ccf-da9f5160888b
                if (self._destroyed) {
                    resDeferred.callback({
                        data: null
                    });
                    return;
                }
                _private.doAfterUpdate(self, () => {
                    _private.hideError(self);
                    _private.setReloadingState(self, false);
                    if (list.getCount()) {
                        self._loadedItems = list;
                    } else {
                        self._loadingIndicatorContainerOffsetTop = _private.getListTopOffset(self);
                    }
                    if (self._pagingNavigation) {
                        const hasMoreDataDown = list.getMetaData().more;
                        _private.updatePagingData(self, hasMoreDataDown);
                    }
                    let listModel = self._listViewModel;

                    _private.executeAfterReloadCallbacks(self, list, cfg);

                    if (cfg.dataLoadCallback instanceof Function) {
                        cfg.dataLoadCallback(list);
                    }

                    if (!self._shouldNotResetPagingCache) {
                        self._cachedPagingState = false;
                    }

                    if (listModel) {
                        if (self._groupingLoader) {
                            self._groupingLoader.resetLoadedGroups(listModel);
                        }

                        _private.assignItemsToModel(self, list, cfg);

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
                    } else if (!self._destroyed && cfg.useNewModel && list) {
                        // Модели могло изначально не создаться (не передали receivedState и source)
                        // https://online.sbis.ru/opendoc.html?guid=79e62139-de7a-43f1-9a2c-290317d848d0
                        self._initNewModel(cfg, list, cfg);
                        if (self._groupingLoader) {
                            self._groupingLoader.resetLoadedGroups(listModel);
                        }
                        self._shouldNotifyOnDrawItems = true;
                    }
                    if (cfg.afterSetItemsOnReloadCallback instanceof Function) {
                        cfg.afterSetItemsOnReloadCallback();
                    }
                    _private.prepareFooter(self, self._options, self._sourceController);
                    _private.resolveIndicatorStateAfterReload(self, list, navigation);

                    resDeferred.callback({
                        data: list
                    });

                    if (self._isMounted && self._isScrollShown && !self._wasScrollToEnd) {
                        // При полной перезагрузке данных нужно сбросить состояние скролла
                        // и вернуться к началу списка, иначе браузер будет пытаться восстановить
                        // scrollTop, догружая новые записи после сброса.
                        self._resetScrollAfterReload = !self._keepScrollAfterReload;
                        self._keepScrollAfterReload = false;
                    }

                    // If received list is empty, make another request. If it’s not empty, the following page will be requested in resize event handler after current items are rendered on the page.
                    if (_private.needLoadNextPageAfterLoad(list, self._listViewModel, navigation)) {
                        if (self._isMounted) {
                            _private.checkLoadToDirectionCapability(self, filter, navigation);
                        }
                    } else if (!self._wasScrollToEnd) {
                        if (_private.attachLoadTopTriggerToNullIfNeed(self, cfg) && !self._isMounted) {
                            self._hideTopTrigger = true;
                        }
                    }
                });
            }).addErrback(function(error: Error) {
                _private.hideIndicator(self);
                return _private.processError(self, {
                    error,
                    dataLoadErrback: cfg.dataLoadErrback
                }).then(function(result: ICrudResult) {
                    if (!self._destroyed) {
                        if (cfg.afterReloadCallback) {
                            cfg.afterReloadCallback(cfg);
                        }
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

    isEqualItemsFormat(items1: RecordSet, items2: RecordSet): boolean {
        const items1Model = items1.getModel();
        const items2Model = items2.getModel();
        let isModelEqual = items1Model === items2Model;

        function getModelModuleName(model: string|Function): string {
            let name;

            if (typeof model === 'function') {
                name = model.prototype._moduleName;
            } else {
                name = model;
            }

            return name;
        }

        if (!isModelEqual && (getModelModuleName(items1Model) === getModelModuleName(items2Model))) {
            isModelEqual = true;
        }
        return items1 && cInstance.instanceOfModule(items1, 'Types/collection:RecordSet') &&
            isModelEqual &&
            (items1.getKeyProperty() === items2.getKeyProperty()) &&
            (Object.getPrototypeOf(items1).constructor === Object.getPrototypeOf(items2).constructor) &&
            (Object.getPrototypeOf(items1.getAdapter()).constructor ===
                Object.getPrototypeOf(items2.getAdapter()).constructor);
    },

    assignItemsToModel(self, items: RecordSet, newOptions): void {
        const listModel = self._listViewModel;

        // todo task1179709412 https://online.sbis.ru/opendoc.html?guid=43f508a9-c08b-4938-b0e8-6cfa6abaff21
        if (self._options.useNewModel) {
            // TODO restore marker + maybe should recreate the model completely
            // instead of assigning items
            // https://online.sbis.ru/opendoc.html?guid=ed57a662-7a73-4f11-b7d4-b09b622b328e
            const currentItems = listModel.getCollection();
            // Делаем assign только если формат текущего рекордсета и нового полностью совпадает, иначе необходима
            // полная замена (example: https://online.sbis.ru/opendoc.html?guid=75a21c00-35ec-4451-b5d7-29544ddd9c40).
            if (_private.isEqualItemsFormat(currentItems, items)) {
                listModel.setCompatibleReset(true);
                currentItems.setMetaData(items.getMetaData());
                currentItems.assign(items);
                listModel.setCompatibleReset(false);
            } else {
                listModel.setCollection(items);
                if (self._options.itemsReadyCallback) {
                    self._options.itemsReadyCallback(listModel.getCollection());
                }
            }
            self._items = listModel.getCollection();
        } else {
            listModel.setItems(items, newOptions);
            self._items = listModel.getCollection();

            // todo Опция task1178907511 предназначена для восстановления скролла к низу списка после его перезагрузки.
            // Используется в админке: https://online.sbis.ru/opendoc.html?guid=55dfcace-ec7d-43b1-8de8-3c1a8d102f8c.
            // Удалить после выполнения https://online.sbis.ru/opendoc.html?guid=83127138-bbb8-410c-b20a-aabe57051b31
            if (self._options.task1178907511 && _private.hasMarkerController(self)) {
                self._markedKeyForRestoredScroll = _private.getMarkerController(self).getMarkedKey();
            }
        }
    },

    executeAfterReloadCallbacks(self, loadedList, options): void {
        if (options.afterReloadCallback) {
            options.afterReloadCallback(options, loadedList);
        }

        if (options.serviceDataLoadCallback instanceof Function) {
            options.serviceDataLoadCallback(self._items, loadedList);
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

    hasMoreData(self, sourceController: SourceController, direction: Direction): boolean {
        let moreDataResult = false;

        if (sourceController) {
            moreDataResult = self._options.getHasMoreData ?
                self._options.getHasMoreData(sourceController, direction) :
                sourceController.hasMoreData(direction);
        }
        return moreDataResult;
    },

    hasMoreDataInAnyDirection(self, sourceController: SourceController): boolean {
        return _private.hasMoreData(self, sourceController, 'up') ||
               _private.hasMoreData(self, sourceController, 'down');
    },

    validateSourceControllerOptions(self, options): void {
        const sourceControllerState = self._sourceController.getState();
        const validateIfOptionsIsSetOnBothControls = (optionName) => {
            if (sourceControllerState[optionName] &&
                options[optionName] &&
                sourceControllerState[optionName] !== options[optionName]) {
                Logger.warn(`BaseControl: It is necessary to set the ${optionName} option in one place`);
            }
        };
        const validateIfOptionsIsSetOnlyOnList = (optionName) => {
            if (options[optionName] && !sourceControllerState[optionName]) {
                Logger.warn(`BaseControl: It is necessary to set the ${optionName} option on Controls/list:DataContainer`);
            }
        };
        const optionsToValidateOnBoth = ['source', 'navigation', 'sorting', 'root'];
        const optionsToValidateOnlyOnList = ['source', 'navigation', 'sorting'];

        optionsToValidateOnBoth.forEach(validateIfOptionsIsSetOnBothControls);
        optionsToValidateOnlyOnList.forEach(validateIfOptionsIsSetOnlyOnList);
    },

    getAllDataCount(self): number|undefined {
       return self._listViewModel?.getCollection().getMetaData().more;
    },

    getItemContainerByIndex(index: number, itemsContainer: HTMLElement): HTMLElement {
        let startChildrenIndex = 0;

        for (let i = startChildrenIndex, len = itemsContainer.children.length; i < len; i++) {
            if (!itemsContainer.children[i].classList.contains('controls-ListView__hiddenContainer') &&
                !itemsContainer.children[i].classList.contains('js-controls-List_invisible-for-VirtualScroll')) {
                startChildrenIndex = i;
                break;
            }
        }

        return itemsContainer.children[startChildrenIndex + index] as HTMLElement;
    },

    scrollToItem(self, key: TItemKey, toBottom?: boolean, force?: boolean, skippedItemsCount: number) {
        const scrollCallback = (index) => {
            // Первым элементом может оказаться группа, к ней подскрол сейчас невозможен, поэтому отыскиваем первую
            // реальную запись и скролим именно к ней.
            // Сам контейнер же берем учитывая количество пропущенных элементов при поиске первой записи.
            // Ошибка: https://online.sbis.ru/opendoc.html?guid=98a3d6ac-68e3-427d-943f-b6b692800217
            // Задача на рефакторинг: https://online.sbis.ru/opendoc.html?guid=1f9d8be3-2cec-4e3e-aace-9067b120248a
            if (skippedItemsCount) {
                index -= skippedItemsCount;
            }
            // TODO: Сейчас есть проблема: ключи остутствуют на всех элементах, появившихся на странице ПОСЛЕ первого построения.
            // TODO Убрать работу с DOM, сделать через получение контейнера по его id из _children
            // логического родителя, который отрисовывает все элементы
            // https://online.sbis.ru/opendoc.html?guid=942e1a1d-15ee-492e-b763-0a52d091a05e
            const itemsContainer = self._getItemsContainer();
            const itemContainer = _private.getItemContainerByIndex(index - self._listViewModel.getStartIndex(), itemsContainer);

            if (itemContainer) {
                self._notify('scrollToElement', [{
                    itemContainer, toBottom, force
                }], {bubbling: true});
            }
        };
        return new Promise((resolve) => {
            self._scrollController ?
                self._scrollController.scrollToItem(key, toBottom, force, scrollCallback).then((result) => {
                    if (result) {
                        _private.handleScrollControllerResult(self, result);
                    }
                    resolve();
                }) : resolve();
        });
    },

    // region key handlers

    keyDownHome(self, event) {
        _private.setMarkerAfterScroll(self, event);
    },
    keyDownEnd(self, event) {
        _private.setMarkerAfterScroll(self, event);
        if (self._options.navigation?.viewConfig?.showEndButton) {
            _private.scrollToEdge(self, 'down');
        }
    },
    keyDownPageUp(self, event) {
        _private.setMarkerAfterScroll(self, event);
    },
    keyDownPageDown(self, event) {
        _private.setMarkerAfterScroll(self, event);
    },

    enterHandler(self, event) {
        if (_private.hasMarkerController(self)) {
            const markerController = _private.getMarkerController(self);
            const markedKey = markerController.getMarkedKey();
            if (markedKey !== null) {
                const markedItem = self.getItems().getRecordById(markedKey);
                self._notify('itemClick', [markedItem, event], { bubbling: true });
                if (event && !event.isStopped()) {
                    self._notify('itemActivate', [markedItem, event], {bubbling: true});
                }
            }
        }
    },
    spaceHandler(self: typeof BaseControl, event: SyntheticEvent):void {
        if (self._options.multiSelectVisibility === 'hidden' || self._options.markerVisibility === 'hidden') {
            return;
        }

        if (!self._options.checkboxReadOnly) {
            const markerController = _private.getMarkerController(self);
            let toggledItemId = markerController.getMarkedKey();
            if (toggledItemId === null || toggledItemId === undefined) {
                toggledItemId = markerController.getNextMarkedKey();
            }

            if (toggledItemId) {
                const result = _private.getSelectionController(self).toggleItem(toggledItemId);
                _private.changeSelection(self, result);
            }
        }

        _private.moveMarkerToNext(self, event);
    },

    /**
     * Метод обработки нажатия клавиши del.
     * Работает по принципу "Если в itemActions есть кнопка удаления, то имитируем её нажатие"
     * @param self
     * @param event
     */
    keyDownDel(self, event): void {
        if (!_private.hasMarkerController(self)) {
            return;
        }

        const model = self.getViewModel();
        const toggledItemId = _private.getMarkerController(self).getMarkedKey();
        const toggledItem: CollectionItem<Model> = model.getItemBySourceKey(toggledItemId);
        if (!toggledItem) {
            return;
        }
        let itemActions = toggledItem.getActions();

        // Если itemActions были не проинициализированы, то пытаемся их проинициализировать
        if (!itemActions) {
            if (self._options.itemActionsVisibility !== 'visible') {
                _private.updateItemActions(self, self._options);
            }
            itemActions = toggledItem.getActions();
        }

        if (itemActions) {
            const deleteAction = itemActions.all.find((itemAction: IItemAction) => itemAction.id === DELETE_ACTION_KEY);
            if (deleteAction) {
                _private.handleItemActionClick(self, deleteAction, event, toggledItem, false);
            }
        }
    },
    // endregion key handlers

    prepareFooter(self, options, sourceController: SourceController): void {
        let
            loadedDataCount, allDataCount;

        if (_private.isDemandNavigation(options.navigation) && _private.hasMoreData(self, sourceController, 'down')) {
            self._shouldDrawFooter = (options.groupingKeyCallback || options.groupProperty) ? !self._listViewModel.isAllGroupsCollapsed() : true;
        } else {
            self._shouldDrawFooter = false;
        }

        if (self._shouldDrawFooter) {
            if (self._listViewModel) {
                // Единственный способ однозначно понять, что выводится дерево - проверить что список строится
                // по проекци для дерева.
                // TODO: должно быть убрано после того, как TreeControl будет наследоваться от BaseControl
                const display = options.useNewModel ? self._listViewModel : self._listViewModel.getDisplay();
                loadedDataCount = display && display['[Controls/_display/Tree]'] ?
                    self._listViewModel.getChildren(options.root).length :
                    self._listViewModel.getCount();
            } else {
                loadedDataCount = 0;
            }

            allDataCount = _private.getAllDataCount(self);
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
                (self._options.task1176625749 && countCurrentItems === cnt2) ||
                _private.isPortionedLoad(self, addedItems)) {
                _private.checkLoadToDirectionCapability(self, self._options.filter, navigation);
            }
            if (self._isMounted && self._scrollController) {
                self.stopBatchAdding();
            }

            _private.prepareFooter(self, self._options, self._sourceController);

            // После выполнения поиска мы должны поставить маркер.
            // Если выполняется порционный поиск и первый запрос не вернул ни одной записи,
            // то на событие reset список будет пустой и нам некуда будет ставить маркер.
            if (_private.hasMarkerController(self) && self._portionedSearchInProgress) {
                const newMarkedKey = _private.getMarkerController(self).onCollectionReset();
                _private.changeMarkedKey(self, newMarkedKey);
            }
        };

        const drawItemsUp = (countCurrentItems, addedItems) => {
            beforeAddItems(addedItems);
            if (self._options.useNewModel) {
                const collection = self._listViewModel.getCollection();
                const newMetaData = _private.getUpdatedMetaData(collection.getMetaData(), addedItems.getMetaData(), self._options.navigation, direction);
                collection.prepend(addedItems);
                collection.setMetaData(newMetaData);
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
                    const collection = self._listViewModel.getCollection();
                    const newMetaData = _private.getUpdatedMetaData(collection.getMetaData(), addedItems.getMetaData(), self._options.navigation, direction);
                    collection.append(addedItems);
                    collection.setMetaData(newMetaData);
                } else {
                    self._listViewModel.appendItems(addedItems);
                }
                afterAddItems(countCurrentItems, addedItems);
            } else if (direction === 'up') {
                drawItemsUp(countCurrentItems, addedItems);
            }

            if (!_private.hasMoreData(self, self._sourceController, direction)) {
                self._updateShadowModeHandler(self._shadowVisibility);
            }
        };

        _private.showIndicator(self, direction);

        if (self._sourceController) {
            const filter: IHashMap<unknown> = cClone(receivedFilter || self._options.filter);
            if (isPortionedLoad) {
                _private.loadToDirectionWithSearchValueStarted(self);
            }
            if (self._options.groupProperty) {
                GroupingController.prepareFilterCollapsedGroups(self._listViewModel.getCollapsedGroups(), filter);
            }
            return self._sourceController.load(direction, self._options.root).addCallback((addedItems) => {
                // TODO https://online.sbis.ru/news/c467b1aa-21e4-41cc-883b-889ff5c10747
                // до реализации функционала и проблемы из новости делаем решение по месту:
                // посчитаем число отображаемых записей до и после добавления, если не поменялось, значит прилетели элементы, попадающие в невидимую группу,
                // надо инициировать подгрузку порции записей, больше за нас это никто не сделает.
                // Под опцией, потому что в другом месте это приведет к ошибке. Хорошее решение будет в задаче ссылка на которую приведена
                const countCurrentItems = self._listViewModel.getCount();

                if (self._isMounted && self._scrollController) {
                    self.startBatchAdding(direction);
                    self._scrollController.callAfterScrollStopped(() => {
                        loadCallback(addedItems, countCurrentItems);
                    });
                } else {
                    loadCallback(addedItems, countCurrentItems);
                }

                // Скрываем ошибку после успешной загрузки данных
                _private.hideError(self);

                return addedItems;
            }).addErrback((error: CancelableError) => {
                _private.hideIndicator(self);
                // скроллим в край списка, чтобы при ошибке загрузки данных шаблон ошибки сразу был виден
                if (!error.canceled && !error.isCanceled) {
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
                        isPagingVisible: self._pagingVisible,
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
                clientHeight: self._viewportSize,
                scrollHeight: _private.getViewSize(self),
                scrollTop: self._scrollTop
            };

            triggerVisibilityUp = self._loadTriggerVisibility.up;
            triggerVisibilityDown = self._loadTriggerVisibility.down;

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

    getUpdatedMetaData(oldMetaData, loadedMetaData, navigation: INavigationOptionValue<INavigationSourceConfig>, direction: 'up' | 'down') {
        if (navigation.source !== 'position' || navigation.sourceConfig.direction !== 'both') {
            return loadedMetaData;
        }
        const resultMeta = { ...loadedMetaData, more: oldMetaData.more };
        const directionMeta = direction === 'up' ? 'before' : 'after';

        resultMeta.more[directionMeta] = typeof loadedMetaData.more === 'object' ? loadedMetaData.more[directionMeta] : loadedMetaData.more;

        return resultMeta;
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
            !self._loadedItems || _private.isPortionedLoad(self, self._loadedItems) :
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
        let hasMoreData = {
            up: _private.hasMoreData(self, self._sourceController, 'up'),
            down: _private.hasMoreData(self, self._sourceController, 'down')
        };
        if (_private.hasMoreData(self, self._sourceController, direction)) {
            let pagingMode = '';
            if (self._options.navigation && self._options.navigation.viewConfig) {
                pagingMode = self._options.navigation.viewConfig.pagingMode;
            }

            let navigationQueryConfig = self._sourceController.shiftToEdge(direction, self._options.root, pagingMode);

            // Решение проблемы загрузки достаточного количества данных для перехода в конец/начало списка
            // в зависимости от размеров экрана.
            // Из размера вьюпорта и записи мы знаем, сколько данных нам хватит.
            // Не совсем понятно, где должен быть этот код. SourceController не должен знать про
            // размеры окна, записей, и т.д. Но и список не должен сам вычислять параметры для загрузки.
            // https://online.sbis.ru/opendoc.html?guid=608aa44e-8aa5-4b79-ac90-d06ed77183a3
            const itemsOnPage = self._scrollPagingCtr?.getItemsCountOnPage();
            const metaMore = self._items.getMetaData().more;
            if (typeof metaMore === 'number' && itemsOnPage && self._options.navigation.source === 'page') {
                const pageSize = self._options.navigation.sourceConfig.pageSize;
                const page = direction === 'up' ? 0 : Math.ceil(metaMore / pageSize) - 1;
                const neededPagesCount = Math.ceil(itemsOnPage / pageSize);
                let neededPage = direction === 'up' ? 0 : 1;
                let neededPageSize = direction === 'up' ? pageSize * neededPagesCount : pageSize * (page - neededPagesCount);
                if (page - neededPagesCount <= neededPagesCount && direction === 'down') {
                        neededPage = 0;
                        neededPageSize = (page + 1) * pageSize;
                }
                navigationQueryConfig = {
                    ...navigationQueryConfig,
                    page: neededPage,
                    pageSize: neededPageSize
                };
            }

            // Если пейджинг уже показан, не нужно сбрасывать его при прыжке
            // к началу или концу, от этого прыжка его состояние не может
            // измениться, поэтому пейджинг не должен прятаться в любом случае
            self._shouldNotResetPagingCache = true;
            self._scrollController.setResetInEnd(direction === 'down');
            _private.reload(self, self._options, navigationQueryConfig).addCallback(() => {
                self._shouldNotResetPagingCache = false;

                /**
                 * Если есть ошибка, то не нужно скроллить, иначе неоднозначное поведение:
                 * иногда скролл происходит раньше, чем показана ошибка, тогда показывается ошибка внутри списка;
                 * иногда ошибка показывается раньше скролла, тогда ошибка во весь список.
                 * https://online.sbis.ru/opendoc.html?guid=ab2c30cd-895d-4b1f-8f71-cd0063e581d2
                 */
                if (!self.__error) {
                    if (direction === 'up') {
                        self._currentPage = 1;
                        self._scrollPagingCtr.shiftToEdge(direction, hasMoreData);
                        self._notify('doScroll', ['top'], { bubbling: true });
                    } else {
                        self._jumpToEndOnDrawItems = () => { _private.jumpToEnd(self) };
                    }
                }
            });
        } else if (direction === 'up') {
            self._notify('doScroll', ['top'], { bubbling: true });
            if (self._scrollPagingCtr) {
                self._currentPage = 1;
                self._scrollPagingCtr.shiftToEdge(direction, hasMoreData);
            }
        } else {
            _private.jumpToEnd(self);
            if (self._scrollPagingCtr) {
                self._currentPage = self._pagingCfg.pagesCount;
                self._scrollPagingCtr.shiftToEdge(direction, hasMoreData);
            }
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

    calcViewSize(viewSize: number, pagingVisible: boolean, pagingPadding: number): number {
        return viewSize - (pagingVisible ? pagingPadding : 0);
    },
    needShowPagingByScrollSize(self, viewSize: number, viewportSize: number): boolean {
        let result = self._pagingVisible;
        /**
         * Правильнее будет проверять что размер viewport не равен 0.
         * Это нужно для того, чтобы пэйджинг в таком случае не отобразился.
         * viewport может быть равен 0 в том случае, когда блок скрыт через display:none, а после становится видим.
         */
        if (viewportSize !== 0) {
            let pagingPadding = self._pagingPadding;
            if (pagingPadding === null) {
                pagingPadding = self._isPagingPadding() ? PAGING_PADDING : 0;
            }
            const scrollHeight = Math.max(_private.calcViewSize(viewSize, result,
                pagingPadding),
                !self._options.disableVirtualScroll && self._scrollController?.calculateVirtualScrollHeight() || 0);
            const proportion = (scrollHeight / viewportSize);

            // начиличе пэйджинга зависит от того превышают данные два вьюпорта или нет
            if (!result) {
                result = proportion >= MIN_SCROLL_PAGING_SHOW_PROPORTION;
            }

            // если все данные поместились на один экран, то скрываем пэйджинг
            if (result) {
                result = proportion > MAX_SCROLL_PAGING_HIDE_PROPORTION;
            }
        } else {
            result = false;
        }

        // если мы для списка раз вычислили, что нужен пэйджинг, то возвращаем этот статус
        // это нужно для ситуации, если первая пачка данных вернула естьЕще (в этом случае пэйджинг нужен)
        // а вторая вернула мало записей и суммарный объем менее двух вьюпортов, пэйджинг не должен исчезнуть
        if (self._sourceController) {

            // если есть Еще данные, мы не знаем сколько их всего, превышают два вьюпорта или нет и покажем пэйдджинг
            const hasMoreData = {
                up: _private.hasMoreData(self, self._sourceController, 'up'),
                down: _private.hasMoreData(self, self._sourceController, 'down')
            };
            const scrollParams = {
                scrollTop: self._scrollTop,
                clientHeight: viewportSize,
                scrollHeight: viewSize
            };
            // если естьЕще данные, мы не знаем сколько их всего, превышают два вьюпорта или нет и покажем пэйдджинг
            // но если загрузка все еще идет (а ее мы смотрим по наличию триггера) не будем показывать пэджинг
            // далее может быть два варианта. След запрос вернет данные, тогда произойдет ресайз и мы проверим еще раз
            // след. запрос не вернет данные, а скажет ЕстьЕще: false тогда решать будет условие ниже, по высоте
            const visibilityTriggerUp = self._loadTriggerVisibility.up;
            const visibilityTriggerDown = self._loadTriggerVisibility.down;

            if ((hasMoreData.up && !visibilityTriggerUp) || (hasMoreData.down && !visibilityTriggerDown)) {
                result = true;

                // Если пэйджинг был показан из-за hasMore, то запоминаем это,
                // чтобы не скрыть после полной загрузки, даже если не набралось на две страницы.
                self._cachedPagingState = true;
            }
            if (!self._scrollPagingCtr && result && _private.needScrollPaging(self._options.navigation)) {
                _private.createScrollPagingController(self, scrollParams, hasMoreData);
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

            self._viewSize = _private.getViewSize(this, true);
            self._viewportRect = params.viewPortRect;

            self._updateItemsHeights();

            if (_private.needScrollPaging(self._options.navigation)) {
                const scrollParams = {
                    scrollTop: self._scrollTop,
                    scrollHeight: params.scrollHeight,
                    clientHeight: params.clientHeight
                };
                _private.getScrollPagingControllerWithCallback(self, scrollParams, (scrollPagingCtr) => {
                    self._scrollPagingCtr = scrollPagingCtr;
                });
            }

        });
    },

    onScrollHide(self) {
        _private.doAfterUpdate(self, () => {
            if (self._pagingVisible) {
                self._pagingVisible = false;
                if (self._cachedPagingState) {
                    self._recalcPagingVisible = true;
                }
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
            if (self._pagingVisible) {
                const hasMoreData = {
                    up: _private.hasMoreData(self, self._sourceController, 'up'),
                    down: _private.hasMoreData(self, self._sourceController, 'down')
                };
                _private.createScrollPagingController(self, scrollParams, hasMoreData).then((scrollPaging) => {
                        self._scrollPagingCtr = scrollPaging;
                        callback(scrollPaging);
                    });
                }
        }
    },
    createScrollPagingController(self, scrollParams, hasMoreData) {
        let elementsCount;
        if (self._sourceController) {
            elementsCount = _private.getAllDataCount(self);
            if (typeof elementsCount !== 'number') {
                elementsCount = undefined;
            }
        }
        const scrollPagingConfig = {
            pagingMode: self._options.navigation.viewConfig.pagingMode,
            scrollParams,
            showEndButton: self._options.navigation.viewConfig.showEndButton,
            totalElementsCount: elementsCount,
            loadedElementsCount: self._listViewModel.getStopIndex() - self._listViewModel.getStartIndex(),
            pagingCfgTrigger: (cfg) => {
                if (cfg?.selectedPage !== self._currentPage) {
                    if (self._selectedPageHasChanged) {
                        self.__selectedPageChanged(null, self._currentPage);
                    } else {
                        self._currentPage = cfg.selectedPage;
                    }
                } else {
                    self._selectedPageHasChanged = false;
                }
                if (!isEqual(self._pagingCfg, cfg)) {
                    self._pagingCfg = cfg;
                    self._forceUpdate();
                }
            }
        };
        self._scrollPagingCtr = new ScrollPagingController(scrollPagingConfig, hasMoreData);
        if (scrollPagingConfig.pagingMode === 'numbers') {
            self._scrollController.setSegmentSize(self._scrollPagingCtr.getItemsCountOnPage());
        }
        return Promise.resolve(self._scrollPagingCtr);
    },

    getViewRect(self): DOMRect {
        if (!self._viewRect) {
            const container = self._container[0] || self._container;
            self._viewRect = container.getBoundingClientRect();
        }
        return self._viewRect;
    },

    getViewSize(self, update = false): number {
        if (self._container && (!self._viewSize || update)) {
            const container = self._children?.viewContainer || self._container[0] || self._container;
            self._viewSize = container.clientHeight;
        }
        return self._viewSize;
    },

    showIndicator(self, direction: 'down' | 'up' | 'all' = 'all'): void {
        if (!self._isMounted) {
            return;
        }

        self._loadingState = direction;
        if (direction === 'all') {
            self._loadingIndicatorState = self._loadingState;
        }
        _private.updateIndicatorContainerHeight(self, _private.getViewRect(self), self._viewportRect);
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
            const hasMoreData = {
                up: _private.hasMoreData(self, self._sourceController, 'up'),
                down: _private.hasMoreData(self, self._sourceController, 'down')
            };
            scrollPaging.updateScrollParams(scrollParams, hasMoreData);
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

    // throttle нужен, чтобы при потоке одинаковых событий не пересчитывать состояние на каждое из них
    throttledVirtualScrollPositionChanged: throttle((self, params) => {
        const result = self._scrollController.scrollPositionChange(params, true);
        _private.handleScrollControllerResult(self, result);
    }, SCROLLMOVE_DELAY, true),

    /**
     * Инициализируем paging если он не создан
     * @private
     */
    initPaging(self) {
        if (!(self._editInPlaceController && self._editInPlaceController.isEditing())
            && _private.needScrollPaging(self._options.navigation)) {
            if (self._viewportSize) {
                self._recalcPagingVisible = false;
                self._pagingVisible = _private.needShowPagingByScrollSize(self, _private.getViewSize(self), self._viewportSize);
            } else {
                self._recalcPagingVisible = true;
            }
        } else {
            self._pagingVisible = false;
        }
    },

    handleListScrollSync(self, scrollTop) {
        if (!self._pagingVisible) {
            _private.initPaging(self);
        }

        if (self._setMarkerAfterScroll) {
            _private.delayedSetMarkerAfterScrolling(self, scrollTop);
        }

        self._scrollTop = scrollTop;
        self._scrollPageLocked = false;
        if (_private.needScrollPaging(self._options.navigation)) {
            if (!self._scrollController.getParamsToRestoreScrollPosition()) {
                _private.updateScrollPagingButtons(self, self._getScrollParams());
            }
        }
    },

    getPortionedSearch(self): PortionedSearch {
        return self._portionedSearch || (self._portionedSearch = new PortionedSearch({
            searchStartCallback: () => {
                self._portionedSearchInProgress = true;
            },
            searchStopCallback: (direction?: IDirection) => {
                const isStoppedByTimer = !direction;

                self._portionedSearchInProgress = false;
                self._showContinueSearchButtonDirection = isStoppedByTimer ? self._loadingState || 'down' : direction;
                if (typeof self._sourceController.cancelLoading !== 'undefined') {
                    self._sourceController.cancelLoading();
                }
                _private.hideIndicator(self);

                if (self._isScrollShown) {
                    _private.updateShadowMode(self, self._shadowVisibility);
                }
            },
            searchResetCallback: () => {
                self._portionedSearchInProgress = false;
                self._showContinueSearchButtonDirection = null;
            },
            searchContinueCallback: () => {
                const direction = _private.hasMoreData(self, self._sourceController, 'up') ? 'up' : 'down';

                self._portionedSearchInProgress = true;
                self._showContinueSearchButtonDirection = null;
                _private.loadToDirectionIfNeed(self, direction);
            },
            searchAbortCallback: () => {
                self._portionedSearchInProgress = false;
                if (typeof self._sourceController.cancelLoading !== 'undefined') {
                    self._sourceController.cancelLoading();
                }
                _private.hideIndicator(self);

                _private.disablePagingNextButtons(self);

                if (self._isScrollShown) {
                    _private.updateShadowMode(self, self._shadowVisibility);
                }
                self._notify('iterativeSearchAborted', []);
            }
        }));
    },

    resetPortionedSearchAndCheckLoadToDirection(self, options): void {
        _private.getPortionedSearch(self).reset();

        if (options.sourceController) {
            _private.checkLoadToDirectionCapability(self, options.filter, options.navigation);
        }
    },

    disablePagingNextButtons(self): void {
        if (self._pagingVisible) {
            self._pagingCfg = {...self._pagingCfg};
            self._pagingCfg.arrowState.next = self._pagingCfg.arrowState.end = 'readonly';
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
        const metaData = items && items.getMetaData();
        const loadBySearchValue = !!self._options.searchValue;

        // Если в мета данных явно передано iterative: false, то поиск не итеративный,
        // даже если ищут через строку поиска
        return metaData && metaData.hasOwnProperty(PORTIONED_LOAD_META_FIELD) ?
            metaData[PORTIONED_LOAD_META_FIELD] :
            loadBySearchValue;
    },

    checkPortionedSearchByScrollTriggerVisibility(self, scrollTriggerVisibility: boolean): void {
        if (!scrollTriggerVisibility && self._portionedSearchInProgress) {
            _private.getPortionedSearch(self).resetTimer();
        }
    },

    allowLoadMoreByPortionedSearch(self, direction: 'up'|'down'): boolean {
        return (!self._showContinueSearchButtonDirection || self._showContinueSearchButtonDirection !== direction) &&
                _private.getPortionedSearch(self).shouldSearch();
    },

    updateShadowMode(self, shadowVisibility: {up: boolean, down: boolean}): void {
        const itemsCount = self._listViewModel && self._listViewModel.getCount();
        const hasMoreData = (direction) => _private.hasMoreData(self, self._sourceController, direction);
        const showShadowByNavigation = _private.needShowShadowByNavigation(self._options.navigation, itemsCount);
        const showShadowUpByPortionedSearch = _private.allowLoadMoreByPortionedSearch(self, 'up');
        const showShadowDownByPortionedSearch = _private.allowLoadMoreByPortionedSearch(self, 'down');

        self._notify('updateShadowMode', [{
            top: (shadowVisibility?.up ||
                showShadowByNavigation &&
                showShadowUpByPortionedSearch && itemsCount && hasMoreData('up')) ? 'visible' : 'auto',
            bottom: (shadowVisibility?.down ||
                showShadowByNavigation &&
                showShadowDownByPortionedSearch && itemsCount && hasMoreData('down')) ? 'visible' : 'auto'
        }], {bubbling: true});
    },

    needScrollCalculation(navigationOpt) {
        return navigationOpt && navigationOpt.view === 'infinity';
    },

    needScrollPaging(navigationOpt) {
        return (navigationOpt &&
            navigationOpt.view === 'infinity' &&
            navigationOpt.viewConfig &&
            navigationOpt.viewConfig.pagingMode &&
            navigationOpt.viewConfig.pagingMode !== 'hidden'
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

    onCollectionChanged(
        self: any,
        event: SyntheticEvent,
        changesType: string,
        action: string,
        newItems: Array<CollectionItem<Model>>,
        newItemsIndex: number,
        removedItems: Array<CollectionItem<Model>>,
        removedItemsIndex: number
    ): void {
        // TODO Понять, какое ускорение мы получим, если будем лучше фильтровать
        // изменения по changesType в новой модели
        // TODO: убрать флаг newModelChanged, когда не будет "старой" модели
        const newModelChanged = self._options.useNewModel && _private.isNewModelItemsChange(action, newItems);
        if (self._pagingNavigation) {
            if (action === IObservable.ACTION_REMOVE || action === IObservable.ACTION_ADD) {
                _private.updatePagingDataByItemsChanged(self, newItems, removedItems);
            }
        }
        if (changesType === 'collectionChanged' || newModelChanged) {
            // TODO костыль https://online.sbis.ru/opendoc.html?guid=b56324ff-b11f-47f7-a2dc-90fe8e371835
            if (self._options.navigation && self._options.navigation.source) {
                const itemsCount = self._listViewModel.getCount();
                const moreMetaCount = _private.getAllDataCount(self);

                if (typeof moreMetaCount === 'number') {
                    if (itemsCount !== moreMetaCount) {
                        _private.prepareFooter(self, self._options, self._sourceController);
                    } else {
                        self._shouldDrawFooter = false;
                    }
                } else if (moreMetaCount === false) {
                    self._shouldDrawFooter = false;
                }
            }

            if ((action === IObservable.ACTION_REMOVE || action === IObservable.ACTION_REPLACE) &&
                self._itemActionsMenuId) {
                _private.closeItemActionsMenuForActiveItem(self, removedItems);
            }
            if (action === IObservable.ACTION_RESET && self._options.searchValue) {
                _private.resetPortionedSearchAndCheckLoadToDirection(self, self._options);
            }
            if (self._scrollController) {
                if (action) {
                    const collectionStartIndex = self._listViewModel.getStartIndex();
                    const collectionStopIndex = self._listViewModel.getStopIndex();
                    let result = null;
                    switch (action) {
                        case IObservable.ACTION_ADD:
                            // TODO: this._batcher.addItems(newItemsIndex, newItems)
                            if (self._addItemsDirection) {
                                self._addItems.push(...newItems);
                                self._addItemsIndex = newItemsIndex;
                            } else {
                                result = self._scrollController.handleAddItems(newItemsIndex, newItems,
                                    newItemsIndex <= collectionStartIndex && self._scrollTop !== 0 ? 'up' 
                                    : (newItemsIndex > collectionStartIndex ? 'down' : ''));
                            }
                            break;
                        case IObservable.ACTION_MOVE:
                            result = self._scrollController.handleMoveItems(newItemsIndex, newItems, removedItemsIndex, removedItems,
                                newItemsIndex <= collectionStartIndex && self._scrollTop !== 0 ? 'up' : 'down');
                            break;
                        case IObservable.ACTION_REMOVE:
                            result = self._scrollController.handleRemoveItems(removedItemsIndex, removedItems);
                            break;
                        case IObservable.ACTION_RESET:
                            result = self._scrollController.handleResetItems();
                            break;
                    }
                    if (result) {
                        _private.handleScrollControllerResult(self, result);
                    }

                    // TODO: уйдет после перехода на новую модель
                    self._scrollController.setIndicesAfterCollectionChange();
                }
            }

            // Изначально могло не создаться selectionController (не был задан source), но в целом работа с выделением
            // нужна и когда items появляются (событие reset) - обрабатываем это.
            // https://online.sbis.ru/opendoc.html?guid=454ba08b-758a-4a39-86cb-7a6d0cd30c44
            const handleSelection = action === IObservable.ACTION_RESET && self._options.selectedKeys &&
                self._options.selectedKeys.length && self._options.multiSelectVisibility !== 'hidden';
            if (_private.hasSelectionController(self) || handleSelection) {
                const selectionController = _private.getSelectionController(self);

                let newSelection;
                switch (action) {
                    case IObservable.ACTION_ADD:
                        selectionController.onCollectionAdd(newItems);
                        self._notify('listSelectedKeysCountChanged', [selectionController.getCountOfSelected(), selectionController.isAllSelected()], {bubbling: true});
                        break;
                    case IObservable.ACTION_RESET:
                        // TODO удалить после того как перейдем полностью на новую модель
                        //  на reset пересоздается display, поэтому нужно обновить модель в контроллере
                        _private.updateSelectionController(self, self._options);

                        const entryPath = self._listViewModel.getCollection().getMetaData().ENTRY_PATH;
                        newSelection = selectionController.onCollectionReset(entryPath);
                        break;
                    case IObservable.ACTION_REMOVE:
                        /* Когда в цикле удаляют записи из рекордсета по одному и eventRaising=false, то
                        * после eventRaising=true нам последовательно прилетают события удаления с отдельными записями.
                        * Т.к. селекшин меняется в _beforeUpdate, то учитывается только последнее событие.
                        * Чтобы учитывались все события, обрабатываем удаление всех записей на afterCollectionChanged
                        */
                        self._removedItems.push(...removedItems);
                        break;
                    case IObservable.ACTION_REPLACE:
                        selectionController.onCollectionReplace(newItems);
                        break;
                }

                if (newSelection) {
                    _private.changeSelection(self, newSelection);
                }
            }

            if (_private.hasMarkerController(self)) {
                const markerController = _private.getMarkerController(self);

                let newMarkedKey;
                switch (action) {
                    case IObservable.ACTION_REMOVE:
                        newMarkedKey = markerController.onCollectionRemove(removedItemsIndex, removedItems);
                        break;
                    case IObservable.ACTION_RESET:
                        // В случае когда прислали новый ключ и в beforeUpdate вызвался reload,
                        // новый ключ нужно применить после изменения коллекции, чтобы не было лишней перерисовки
                        if (self._options.markedKey !== undefined
                                && self._options.markedKey !== markerController.getMarkedKey()) {
                            markerController.setMarkedKey(self._options.markedKey);
                        }

                        newMarkedKey = markerController.onCollectionReset();
                        break;
                    case IObservable.ACTION_ADD:
                        markerController.onCollectionAdd(newItems);
                        break;
                    case IObservable.ACTION_REPLACE:
                        markerController.onCollectionReplace(newItems);
                        break;
                }

                _private.changeMarkedKey(self, newMarkedKey);
            }

            // will updated after render
            if (self._loadingIndicatorState === 'all') {
                self._loadingIndicatorContainerHeight = 0;
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

    onAfterCollectionChanged(self: typeof BaseControl): void {
        if (_private.hasSelectionController(self) && self._removedItems.length) {
            const newSelection = _private.getSelectionController(self).onCollectionRemove(self._removedItems);
            _private.changeSelection(self, newSelection);
        }

        self._removedItems = [];
    },

    /**
     * Возвращает boolean, надо ли обновлять проинициализированные ранее ItemActions, основываясь на newItems.properties.
     * Возвращается true, если newItems или newItems.properties не заданы
     * Новая модель в событии collectionChanged для newItems задаёт properties,
     * где указано, что именно обновляется.
     * @param newItems
     */
    shouldUpdateItemActions(newItems): boolean {
        const propertyVariants = ['selected', 'marked', 'swiped', 'hovered', 'active', 'dragged', 'editingContents'];
        return !newItems || !newItems.properties || propertyVariants.indexOf(newItems.properties) === -1;
    },

    initListViewModelHandler(self, model, useNewModel: boolean) {
        if (useNewModel) {
            model.subscribe('onCollectionChange', (...args: any[]) => {
                _private.onCollectionChanged.apply(
                    null,
                    [
                        self,
                        args[0], // event
                        null, // changes type
                        ...args.slice(1) // the rest of the arguments
                    ]
                );
            });
            model.subscribe('onAfterCollectionChange', (...args: any[]) => {
                _private.onAfterCollectionChanged.apply(
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
            model.subscribe('onListChange', _private.onCollectionChanged.bind(null, self));
            model.subscribe('onAfterCollectionChange', _private.onAfterCollectionChanged.bind(null, self));
        }

        if (!useNewModel) {
            model.subscribe('onGroupsExpandChange', function(event, changes) {
                _private.groupsExpandChangeHandler(self, changes);
            });
        }
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
        const itemIndex = self._listViewModel.getIndex(item);
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
        const itemActionsController = _private.getItemActionsController(self, self._options);
        const menuConfig = itemActionsController.prepareActionsMenuConfig(item, clickEvent, action, self, isContextMenu);
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
            itemActionsController.setActiveItem(item);
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
            // Для обхода проблемы ставим условие, что занулять active item нужно только тогда, когда
            // закрываем самое последнее открытое меню.
            if (!currentPopup || itemActionsMenuId === currentPopup.id) {
                const itemActionsController = _private.getItemActionsController(self, self._options);
                itemActionsController.setActiveItem(null);
                itemActionsController.deactivateSwipe();
            }
        }
    },

    openContextMenu(self: typeof BaseControl, event: SyntheticEvent<MouseEvent>, itemData: CollectionItem<Model>): void {
        if (itemData['[Controls/_display/GroupItem]']) {
            return;
        }

        event.stopPropagation();
        // TODO нужно заменить на item.getContents() при переписывании моделей.
        //  item.getContents() должен возвращать Record
        //  https://online.sbis.ru/opendoc.html?guid=acd18e5d-3250-4e5d-87ba-96b937d8df13
        const contents = _private.getPlainItemContents(itemData);
        const key = contents ? contents.getKey() : itemData.key;
        self.setMarkedKey(key);

        // Этот метод вызывается также и в реестрах, где не инициализируется this._itemActionsController
        if (!!self._itemActionsController) {
            const item = self._listViewModel.getItemBySourceKey(key) || itemData;
            _private.openItemActionsMenu(self, null, event, item, true);
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
    },

    groupsExpandChangeHandler(self, changes) {
        self._notify(changes.changeType === 'expand' ? 'groupExpanded' : 'groupCollapsed', [changes.group], { bubbling: true });
        self._notify('collapsedGroupsChanged', [changes.collapsedGroups]);
        _private.prepareFooter(self, self._options, self._sourceController);
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
        if (!config.error.canceled && !config.error.isCanceled) {
            if (config.dataLoadErrback instanceof Function) {
                config.dataLoadErrback(config.error);
            }
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
                errorConfig.options.isPagingVisible = config.templateOptions.isPagingVisible;
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
        if (errorConfig && (errorConfig.mode === dataSourceError.Mode.include)) {
            self._scrollController = null;
            self._observerRegistered = false;
        }
        self._viewReady = false;
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

    getSourceController(self, options): SourceController {
        return new SourceController({
            ...options,
            navigationParamsChangedCallback: self._notifyNavigationParamsChanged,
            keyProperty: self._keyProperty
        });
    },

    checkRequiredOptions(self, options) {
        if (!self._keyProperty) {
            Logger.error('IList: Option "keyProperty" is required.');
        }
    },

    needBottomPadding(options, listViewModel) {
        const isEditing = !!listViewModel?.isEditing();

        const display = listViewModel ? (options.useNewModel ? listViewModel : listViewModel.getDisplay()) : null;
        const hasVisibleItems = !!display?.getCount();

        return (
            (hasVisibleItems || isEditing) &&
            options.itemActionsPosition === 'outside' &&
            !options.footerTemplate &&
            options.resultsPosition !== 'bottom'
        );
    },

    notifyNavigationParamsChanged(actualParams): void {
        if (this._isMounted) {
            this._notify('navigationParamsChanged', [actualParams]);
        }
    },

    isPagingNavigation(navigation) {
        return navigation && navigation.view === 'pages';
    },

    isPagingNavigationVisible(self, hasMoreData) {
        /**
         * Не получится получать количество элементов через _private.getItemsCount,
         * так как функция возвращает количество отображаемых элементов
         */
        if (self._options.navigation && self._options.navigation.viewConfig &&
            self._options.navigation.viewConfig.totalInfo === 'extended') {
            return hasMoreData > PAGING_MIN_ELEMENTS_COUNT || hasMoreData === true;
        }
        return hasMoreData === true || self._knownPagesCount > 1;
    },

    updatePagingData(self, hasMoreData) {
        self._knownPagesCount = _private.calcPaging(self, hasMoreData, self._currentPageSize);
        self._pagingNavigationVisible = _private.isPagingNavigationVisible(self, hasMoreData);
        self._pagingLabelData = _private.getPagingLabelData(hasMoreData, self._currentPageSize, self._currentPage);
        self._selectedPageSizeKey = PAGE_SIZE_ARRAY.find((item) => item.pageSize === self._currentPageSize);
        self._selectedPageSizeKey = self._selectedPageSizeKey ? [self._selectedPageSizeKey.id] : [1];
    },

    updatePagingDataByItemsChanged(self, newItems, removedItems) {
        const countDifferece = (newItems?.length) || (- (removedItems?.length)) || 0;
        let totalItemsCount = 0;
        if (self._pagingLabelData) {
            totalItemsCount = self._pagingLabelData.totalItemsCount || 0;
        }
        const itemsCount = totalItemsCount + countDifferece;
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
            if (_private.isEditing(self)) {
                self._cancelEdit();
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
    updateIndicatorContainerHeight(self, viewRect: DOMRect, viewportRect: DOMRect): void {
        let top;
        let bottom;
        if (self._isScrollShown || (self._needScrollCalculation && viewRect && viewportRect)) {
            top = Math.max(viewRect.y, viewportRect.y);
            bottom = Math.min(viewRect.y + viewRect.height, viewportRect.y + viewportRect.height);
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
            if (self._isScrollShown || (self._needScrollCalculation && viewRect && self._viewportRect)) {
                height = viewRect.y + self._scrollTop - self._viewportRect.top;
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

        const lastItemKey = ItemsUtil.getPropertyValue(lastItem, self._keyProperty);

        self._wasScrollToEnd = true;

        const hasMoreData = {
            up: _private.hasMoreData(self, self._sourceController, 'up'),
            down: _private.hasMoreData(self, self._sourceController, 'down')
        };
        if (self._scrollPagingCtr) {
            self._currentPage = self._pagingCfg.pagesCount;
            self._scrollPagingCtr.shiftToEdge('down', hasMoreData);
        }
        if (self._jumpToEndOnDrawItems) {

            // Если для подскролла в конец делали reload, то индексы виртуального скролла
            // поставили такие, что последниц элемент уже отображается, scrollToItem не нужен.
            self._notify('doScroll', [self._scrollController?.calculateVirtualScrollHeight() || 'down'], { bubbling: true });
            _private.updateScrollPagingButtons(self, self._getScrollParams());
        } else {

            // Последняя страница уже загружена но конец списка не обязательно отображается,
            // если включен виртуальный скролл. ScrollContainer учитывает это в scrollToItem
            _private.scrollToItem(self, lastItemKey, true, true).then(() => {

                // После того как последний item гарантированно отобразился,
                // нужно попросить ScrollWatcher прокрутить вниз, чтобы
                // прокрутить отступ пейджинга и скрыть тень
                self._notify('doScroll', [self._scrollController?.calculateVirtualScrollHeight() || 'down'], { bubbling: true });

                _private.updateScrollPagingButtons(self, self._getScrollParams());
            });
        }
    },

    // region Multiselection

    hasSelectionController(self: typeof BaseControl): boolean {
        return !!self._selectionController;
    },

    createSelectionController(self: any, options?: IList): SelectionController {
        options = options ? options : self._options;

        const collection = self._listViewModel.getDisplay ? self._listViewModel.getDisplay() : self._listViewModel;

        const strategy = this.createSelectionStrategy(
            options,
            collection,
            collection.getMetaData().ENTRY_PATH
        );

        self._selectionController = new SelectionController({
            model: collection,
            selectedKeys: options.selectedKeys,
            excludedKeys: options.excludedKeys,
            searchValue: options.searchValue,
            strategy
        });

        return self._selectionController;
    },

    createSelectionStrategy(options: any, collection: Collection<CollectionItem<Model>>, entryPath: []): ISelectionStrategy {
        const strategyOptions = this.getSelectionStrategyOptions(options, collection, entryPath);
        if (options.parentProperty) {
            return new TreeSelectionStrategy(strategyOptions);
        } else {
            return new FlatSelectionStrategy(strategyOptions);
        }
    },

    getSelectionController(self: typeof BaseControl, options?: IList): SelectionController {
        if (!self._selectionController) {
            _private.createSelectionController(self, options);
        }
        return self._selectionController;
    },

    updateSelectionController(self: typeof BaseControl, newOptions: IList): void {
        const selectionController = _private.getSelectionController(self);
        const collection = self._listViewModel.getDisplay ? self._listViewModel.getDisplay() : self._listViewModel;
        selectionController.updateOptions({
            model: collection,
            searchValue: newOptions.searchValue,
            strategyOptions: _private.getSelectionStrategyOptions(
                newOptions,
                collection,
                collection.getMetaData().ENTRY_PATH
            )
        });
    },

    getSelectionStrategyOptions(options: any, collection: Collection<CollectionItem<Model>>, entryPath: []): ITreeSelectionStrategyOptions | IFlatSelectionStrategyOptions {
        if (options.parentProperty) {
            return {
                nodesSourceControllers: options.nodesSourceControllers,
                selectDescendants: options.selectDescendants,
                selectAncestors: options.selectAncestors,
                rootId: options.root,
                model: collection,
                entryPath
            };
        } else {
            return { model: collection };
        }
    },

    onSelectedTypeChanged(typeName: string, limit: number|undefined): void {
        if (this._options.multiSelectVisibility === 'hidden') {
            return;
        }

        const selectionController = _private.getSelectionController(this);
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

        _private.changeSelection(this, result);
    },

    notifySelection(self: typeof BaseControl, selection: ISelectionObject): void {
        const controller = _private.getSelectionController(self);
        const selectionDifference = controller.getSelectionDifference(selection);

        const selectedDiff = selectionDifference.selectedKeysDifference;
        if (selectedDiff.added.length || selectedDiff.removed.length) {
            self._notify('selectedKeysChanged', [selectedDiff.keys, selectedDiff.added, selectedDiff.removed]);
        }

        const excludedDiff = selectionDifference.excludedKeysDifference;
        if (excludedDiff.added.length || excludedDiff.removed.length) {
            self._notify('excludedKeysChanged', [excludedDiff.keys, excludedDiff.added, excludedDiff.removed]);
        }

        // для связи с контроллером ПМО
        let selectionType = 'all';
        if (controller.isAllSelected() && self._options.nodeProperty && self._options.searchValue) {
            let onlyCrumbsInItems = true;
            self._listViewModel.each((item) => {
                if (onlyCrumbsInItems) {
                    onlyCrumbsInItems = item['[Controls/_display/BreadcrumbsItem]'];
                }
            });

            if (!onlyCrumbsInItems) {
                selectionType = 'leaf';
            }
        }
        self._notify('listSelectionTypeForAllSelectedChanged', [selectionType], {bubbling: true});
    },

    changeSelection(self: typeof BaseControl, newSelection: ISelectionObject): Promise<ISelectionObject>|ISelectionObject {
        const controller = _private.getSelectionController(self);
        const selectionDifference = controller.getSelectionDifference(newSelection);
        let result = self._notify('beforeSelectionChanged', [selectionDifference]);

        const handleResult = (selection) => {
            _private.notifySelection(self, selection);
            if (!self._options.hasOwnProperty('selectedKeys')) {
                controller.setSelection(selection);
            }
            self._notify('listSelectedKeysCountChanged', [controller.getCountOfSelected(selection), controller.isAllSelected()], {bubbling: true});
        };

        if (result instanceof Promise) {
            result.then((selection: ISelectionObject) => handleResult(selection));
        } else if (result !== undefined) {
            handleResult(result);
        } else {
            handleResult(newSelection);
            result = newSelection;
        }

        return result;
    },

    // endregion

    handleScrollControllerResult(self, result: IScrollControllerResult) {
        if (!result) {
            return;
        }
        if (self._isMounted) {
            _private.doAfterUpdate(self, () => {
                if (self._applySelectedPage) {
                    self._applySelectedPage();
                }
            });
            if (result.placeholders) {
                self._notify('updatePlaceholdersSize', [result.placeholders], {bubbling: true});

                if (result.placeholders.top > 0) {
                    self._notify('enableVirtualNavigation', [], { bubbling: true });
                } else {
                    self._notify('disableVirtualNavigation', [], { bubbling: true });
                }
            }
            if (result.activeElement && (self._items && typeof self._items.getRecordById(result.activeElement) !== 'undefined')) {
                self._notify('activeElementChanged', [result.activeElement]);
                if (result.scrollToActiveElement) {
                    // Если после перезагрузки списка нам нужно скроллить к записи, то нам не нужно сбрасывать скролл к нулю.
                self._keepScrollAfterReload = true;_private.doAfterUpdate(self, () => { _private.scrollToItem(self, result.activeElement, false, true); });
                }
            }
        }
        if (result.triggerOffset) {
            self.applyTriggerOffset(result.triggerOffset);
        }
        if (result.shadowVisibility) {
            self._updateShadowModeHandler(result.shadowVisibility);
        }
    },

    // region Marker

    hasMarkerController(self: typeof BaseControl): boolean {
        return !!self._markerController;
    },

    getMarkerController(self: typeof BaseControl, options: IList = null): MarkerController {
        if (!_private.hasMarkerController(self)) {
            options = options ? options : self._options;
            self._markerController = new MarkerController({
                model: self._listViewModel,
                markerVisibility: options.markerVisibility,
                markedKey: options.markedKey
            });
        }
        return self._markerController;
    },

    moveMarkerToNext(self: typeof BaseControl, event: SyntheticEvent): void {
        if (self._options.markerVisibility !== 'hidden') {
            // activate list when marker is moving. It let us press enter and open current row
            // must check mounted to avoid fails on unit tests
            if (self._mounted) {
                self.activate();
            }

            // чтобы предотвратить нативный подскролл
            // https://online.sbis.ru/opendoc.html?guid=c470de5c-4586-49b4-94d6-83fe71bb6ec0
            event.preventDefault();

            const controller = _private.getMarkerController(self);
            const newMarkedKey = controller.getNextMarkedKey();
            if (newMarkedKey !== controller.getMarkedKey()) {
                const result = _private.changeMarkedKey(self, newMarkedKey);
                if (result instanceof Promise) {
                    /**
                     * Передавая в force true, видимый элемент подскролливается наверх.
                     * https://online.sbis.ru/opendoc.html?guid=6b6973b2-31cf-4447-acaf-a64d37957bc6
                     */
                    result.then((key) => _private.scrollToItem(self, key));
                } else if (result !== undefined) {
                    _private.scrollToItem(self, result, true, false);
                }
            }
        }
    },

    moveMarkerToPrevious(self: any, event: SyntheticEvent): void {
        if (self._options.markerVisibility !== 'hidden') {
            // activate list when marker is moving. It let us press enter and open current row
            // must check mounted to avoid fails on unit tests
            if (self._mounted) {
                self.activate();
            }

            // чтобы предотвратить нативный подскролл
            // https://online.sbis.ru/opendoc.html?guid=c470de5c-4586-49b4-94d6-83fe71bb6ec0
            event.preventDefault();

            const controller = _private.getMarkerController(self);
            const newMarkedKey = controller.getPrevMarkedKey();
            if (newMarkedKey !== controller.getMarkedKey()) {
                const result = _private.changeMarkedKey(self, newMarkedKey);
                if (result instanceof Promise) {
                    result.then((key) => _private.scrollToItem(self, key, true));
                } else if (result !== undefined) {
                    _private.scrollToItem(self, result);
                }
            }
        }
    },

    setMarkerAfterScroll(self: typeof BaseControl, event: SyntheticEvent): void {
        if (self._options.moveMarkerOnScrollPaging !== false) {
            self._setMarkerAfterScroll = true;
        }
    },

    setMarkerAfterScrolling(self: typeof BaseControl, scrollTop: number): void {
        // TODO вручную обрабатывать pagedown и делать stop propagation
        self._setMarkerAfterScroll = false;
        if (self._options.markerVisibility !== 'hidden' && self._children.listView) {
            const itemsContainer = self._children.listView.getItemsContainer();
            const item = self._scrollController.getFirstVisibleRecord(itemsContainer, self._container, scrollTop);
            const markedKey = _private.getMarkerController(self).getSuitableMarkedKey(item);
            _private.changeMarkedKey(self, markedKey);
        }
    },

    // TODO KINGO: Задержка нужна, чтобы расчет видимой записи производился после фиксации заголовка
    delayedSetMarkerAfterScrolling: debounce((self, scrollTop) => {
        _private.setMarkerAfterScrolling(self, self._scrollParams ? self._scrollParams.scrollTop : scrollTop);
    }, SET_MARKER_AFTER_SCROLL_DELAY),

    changeMarkedKey(self: typeof BaseControl, newMarkedKey: CrudEntityKey, afterMount: boolean = false): Promise<CrudEntityKey>|CrudEntityKey {
        const markerController = _private.getMarkerController(self);
        if ((newMarkedKey === undefined || newMarkedKey === markerController.getMarkedKey()) && !afterMount) {
            return newMarkedKey;
        }

        const eventResult: Promise<CrudEntityKey>|CrudEntityKey = self._notify('beforeMarkedKeyChanged', [newMarkedKey]);

        const handleResult = (key) => {
            // Прикладники могут как передавать значения в markedKey, так и передавать undefined.
            // И при undefined нужно делать так, чтобы markedKey задавался по нашей логике.
            // Это для трюка от Бегунова когда делают bind на переменную, которая изначально undefined.
            // В таком случае, чтобы не было лишних синхронизаций - мы работаем по нашему внутреннему state.
            if (self._options.markedKey === undefined) {
                markerController.setMarkedKey(key);
            }
            self._notify('markedKeyChanged', [key]);
        };

        let result = eventResult;
        if (eventResult instanceof Promise) {
            eventResult.then((key) => {
                handleResult(key);
                return key;
            });
        } else if (eventResult !== undefined && self._environment) {
            // Если не был инициализирован environment, то _notify будет возвращать null,
            // но это значение используется, чтобы сбросить маркер. Актуально для юнитов
            handleResult(eventResult);
        } else {
            result = newMarkedKey;
            handleResult(newMarkedKey);
        }

        return result;
    },

    // endregion

    createScrollController(self: typeof BaseControl, options: any): void {
        self._scrollController = new ScrollController({
            disableVirtualScroll: options.disableVirtualScroll,
            virtualScrollConfig: options.virtualScrollConfig,
            needScrollCalculation: self._needScrollCalculation,
            scrollObserver: self._children.scrollObserver,
            collection: self._listViewModel,
            activeElement: options.activeElement,
            useNewModel: options.useNewModel,
            forceInitVirtualScroll: options?.navigation?.view === 'infinity'
        });
        const result = self._scrollController.handleResetItems();
        _private.handleScrollControllerResult(self, result);
    },

    /**
     * Необходимо передавать опции для случая, когда в результате изменения модели меняются параметры
     * для показа ItemActions и их нужно поменять до отрисовки.
     * @param self
     * @param options
     * @private
     */
    updateItemActions(self, options: IList, editingCollectionItem?: IEditableCollectionItem): void {
        const itemActionsController =  _private.getItemActionsController(self, options);
        if (!itemActionsController) {
            return;
        }

        const editingConfig = self._listViewModel.getEditingConfig();
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
        let style;
        if (options.itemActionsVisibility === 'visible') {
            style = 'transparent';
        } else {
            style = options.hoverBackgroundStyle || options.style
        }
        const itemActionsChangeResult = itemActionsController.update({
            editingItem: editingCollectionItem as CollectionItem<Model>,
            collection: self._listViewModel,
            itemActions: options.itemActions,
            itemActionsProperty: options.itemActionsProperty,
            visibilityCallback: options.itemActionVisibilityCallback,
            itemActionsPosition: options.itemActionsPosition,
            style,
            theme: options.theme,
            actionMode: options.actionMode,
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
     * Вызывает расчёт itemActions, только в том случае, если это происходит впервые
     * @private
     */
    updateItemActionsOnce(self, options: any): void {
        if (self._options.itemActionsVisibility !== 'visible' && !self._listViewModel.isActionsAssigned()) {
            _private.updateItemActions(self, options);
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
            _private.getItemActionsController(self, self._options).deactivateSwipe();
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
            _private.showActions(this);
            _private.updateItemActions(self, options);
        }
    },

    // region Drag-N-Drop

    startDragNDrop(self, domEvent, item): void {
        if (
            !self._options.readOnly && self._options.itemsDragNDrop
            && DndController.canStartDragNDrop(self._options.canStartDragNDrop, domEvent, !!compatibility.touch)
        ) {
            const key = item.getContents().getKey();

            // Перемещать с помощью массового выбора
            // https://online.sbis.ru/opendoc.html?guid=080d3dd9-36ac-4210-8dfa-3f1ef33439aa
            let selection = {
                selected: self._options.selectedKeys || [],
                excluded: self._options.excludedKeys || []
            };
            selection = DndController.getSelectionForDragNDrop(self._listViewModel, selection, key);
            const recordSet = self._listViewModel.getCollection();

            // Ограничиваем получение перемещаемых записей до 100 (максимум в D&D пишется "99+ записей"), в дальнейшем
            // количество записей будет отдавать selectionController
            // https://online.sbis.ru/opendoc.html?guid=b93db75c-6101-4eed-8625-5ec86657080e
            getItemsBySelection(selection, self._options.source, recordSet, self._options.filter, LIMIT_DRAG_SELECTION)
                .addCallback((items) => {
                    let dragStartResult = self._notify('dragStart', [items, key]);

                    if (dragStartResult === undefined) {
                        // Чтобы для работы dnd было достаточно опции itemsDragNDrop=true
                        dragStartResult = new ItemsEntity({items});
                    }

                    if (dragStartResult) {
                        if (self._options.dragControlId) {
                            dragStartResult.dragControlId = self._options.dragControlId;
                        }

                        self._dragEntity = dragStartResult;
                        self._draggedKey = key;
                        self._startEvent = domEvent.nativeEvent;

                        _private.clearSelectedText(self._startEvent);
                        if (self._startEvent && self._startEvent.target) {
                            self._startEvent.target.classList.add('controls-DragNDrop__dragTarget');
                        }

                        self._registerMouseMove();
                        self._registerMouseUp();
                    }
                });
        }
    },

    // TODO dnd когда будет наследование TreeControl <- BaseControl, правильно указать тип параметров
    createDndListController(model: any, options: any): DndController<IDragStrategyParams> {
        let strategy;
        if (options.parentProperty) {
            strategy = TreeStrategy;
        } else {
            strategy = FlatStrategy;
        }
        return new DndController(model, strategy);
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
    clearSelectedText(event): void {
        if (event.type === 'mousedown') {
            // снимаем выделение с текста иначе не будут работать клики,
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
    },

    // endregion

    /**
     * Получает размеры контейнера, которые будут использованы для измерения области отображения свайпа.
     * Для строк таблиц, когда ширину строки можно измерить только по ширине столбцов,
     * берём за правило, что высота всегда едина для всех колонок строки, а ширину столбцов
     * надо сложить для получения ширины строки.
     * @param itemContainer
     */
    getSwipeContainerSize(itemContainer: HTMLElement): {width: number, height: number} {
        const result: {width: number, height: number} = { width: 0, height: 0 };
        if (itemContainer.classList.contains(SWIPE_MEASUREMENT_CONTAINER_SELECTOR)) {
            result.width = itemContainer.clientWidth;
            result.height = itemContainer.clientHeight;
        } else {
            itemContainer
                .querySelectorAll(`.${SWIPE_MEASUREMENT_CONTAINER_SELECTOR}`)
                .forEach((container) => {
                    result.width += container.clientWidth;
                    result.height = result.height || container.clientHeight;
                });
        }
        return result;
    },

    prepareMoverControllerOptions(self, options: IList): IMoveControllerOptions {
        const controllerOptions: IMoveControllerOptions = {
            source: options.source,
            parentProperty: options.parentProperty
        };
        if (options.moveDialogTemplate) {
            if (options.moveDialogTemplate.templateName) {
                controllerOptions.popupOptions = {
                    template: options.moveDialogTemplate.templateName,
                    templateOptions: {
                        ...options.moveDialogTemplate.templateOptions,
                        keyProperty: self._keyProperty
                    } as IMoverDialogTemplateOptions
                };
            } else {
                Logger.error('Mover: Wrong type of moveDialogTemplate option, use object notation instead of template function', self);
            }
        }
        return controllerOptions;
    },

    getMoveController(self): MoveController {
        if (!self._moveController) {
            self._moveController = new MoveController(_private.prepareMoverControllerOptions(self, self._options));
        }
        return self._moveController;
    },

    getMoveTargetItem(self: typeof BaseControl, selectedKey: CrudEntityKey, position: LOCAL_MOVE_POSITION): CrudEntityKey {
        let siblingItem;
        if (position === LOCAL_MOVE_POSITION.Before) {
            siblingItem = self._listViewModel.getPrevByKey(selectedKey);
        } else {
            siblingItem = self._listViewModel.getNextByKey(selectedKey);
        }
        const siblingKey = siblingItem && siblingItem.getContents && siblingItem.getContents().getKey();
        return siblingKey !== undefined && siblingKey !== null ? siblingKey : null;
    },

    getRemoveController(self): RemoveController {
        if (!self._removeController) {
            self._removeController = new RemoveController({source: self._options.source});
        }
        return self._removeController;
    },

    registerFormOperation(self): void {
        self._notify('registerFormOperation', [{
            save: self._commitEdit.bind(self, 'hasChanges'),
            cancel: self._cancelEdit.bind(self),
            isDestroyed: () => self._destroyed
        }], {bubbling: true});
    },

    isEditing(self): boolean {
        return !!self._editInPlaceController && self._editInPlaceController.isEditing();
    },

    activateEditingRow(self): void {
        // Контакты используют новый рендер, на котором нет обертки для редактируемой строки.
        // В новом рендере эона не нужна
        if (self._children.listView.activateEditingRow) {
            const rowActivator = self._children.listView.activateEditingRow.bind(self._children.listView);
            self._editInPlaceInputHelper.activateInput(rowActivator);
        }
    },

    showActions(self) {
        // В тач-интерфейсе не нужен класс, задающий видимость itemActions. Это провоцирует лишнюю синхронизацию
        if (!detection.isMobilePlatform) {
            self._showActions = true;
        }
    },

    hideActions(self) {
        // В тач-интерфейсе не нужен класс, задающий видимость itemActions. Это провоцирует лишнюю синхронизацию
        if (!detection.isMobilePlatform) {
            self._showActions = false;
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
 * @mixes Controls/_interface/IFilterChanged
 * @mixes Controls/interface/IHighlighter
 * @mixes Controls/interface/IEditableList
 * @mixes Controls/_list/BaseControl/Styles
 * @mixes Controls/_list/interface/IMovableList
 * @implements Controls/_list/interface/IListNavigation
 *
 * @private
 * @author Авраменко А.С.
 */

const BaseControl = Control.extend(/** @lends Controls/_list/BaseControl.prototype */{
    _updateShadowModeBeforePaint: null,
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

    _attachLoadTopTriggerToNull: false,
    _hideTopTrigger: false,
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
    _pagingPadding: null,

    // если пэйджинг в скролле показался то запоним это состояние и не будем проверять до след перезагрузки списка
    _cachedPagingState: false,
    _shouldNotResetPagingCache: false,
    _recalcPagingVisible: false,
    _isPagingArrowClick: false,

    _itemTemplate: null,

    _isScrollShown: false,
    _needScrollCalculation: false,
    _loadTriggerVisibility: null,
    _hideIndicatorOnTriggerHideDirection: null,
    _checkTriggerVisibilityTimeout: null,
    _loadingIndicatorContainerOffsetTop: 0,
    _viewSize: null,
    _viewportSize: null,
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
    _applySelectedPage: null,

    _blockItemActionsByScroll: false,

    _needBottomPadding: false,
    _noDataBeforeReload: null,

    _keepScrollAfterReload: false,
    _resetScrollAfterReload: false,
    _scrollPageLocked: false,

    _itemReloaded: false,
    _modelRecreated: false,
    _viewReady: false,

    _portionedSearch: null,
    _portionedSearchInProgress: null,
    _showContinueSearchButtonDirection: null,

    _draggingItem: null,
    _draggingEntity: null,
    _draggingTargetItem: null,

    _selectionController: null,
    _itemActionsController: null,
    _sourceController: null,
    _prevRootId: null,
    _loadedBySourceController: false,

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
    _markerLoadPromise: null,

    _dndListController: null,
    _dragEntity: undefined,
    _startEvent: undefined,
    _documentDragging: false,
    _insideDragging: false,
    _endDragNDropTimer: null, // для IE
    _draggedKey: null,
    _validateController: null,

    // Контроллер для перемещения элементов из источника
    _moveController: null,

    // Контроллер для удаления элементов из источника
    _removeController: null,
    _removedItems: [],
    _keyProperty: null,

    constructor(options) {
        BaseControl.superclass.constructor.apply(this, arguments);
        options = options || {};
        this._validateController = new ControllerClass();
        this.__errorController = options.errorController || new dataSourceError.Controller({});
        this._startDragNDropCallback = this._startDragNDropCallback.bind(this);
        this._resetValidation = this._resetValidation.bind(this);
    },

    /**
     * @param {Object} newOptions
     * @param {Object} context
     * @param {IReceivedState} receivedState
     * @return {Promise}
     * @protected
     */
    _beforeMount(newOptions, context, receivedState: IReceivedState = {}) {
        this._notifyNavigationParamsChanged = _private.notifyNavigationParamsChanged.bind(this);

        _private.checkDeprecated(newOptions);
        this._initKeyProperty(newOptions);
        _private.checkRequiredOptions(this, newOptions);

        _private.bindHandlers(this);

        _private.initializeNavigation(this, newOptions);
        this._loadTriggerVisibility = {};

        if (newOptions.sourceController) {
            this._sourceController = newOptions.sourceController as SourceController;
            _private.validateSourceControllerOptions(this, newOptions);
        } else if (newOptions.source) {
            this._sourceController = _private.getSourceController(this, newOptions);
        }

        return Promise.resolve(this._prepareGroups(newOptions, (collapsedGroups) => {
            return this._prepareItemsOnMount(this, newOptions, receivedState, collapsedGroups);
        })).then((res) => {
            const editingConfig = this._getEditingConfig(newOptions);
            return editingConfig.item ? this._startInitialEditing(editingConfig) : res;
        }).then((res) => {
            const needInitModelState =
                this._listViewModel &&
                this._listViewModel.getCollection() &&
                this._listViewModel.getCollection().getCount();

            if (needInitModelState) {
                if (newOptions.markerVisibility === 'visible'
                    || newOptions.markerVisibility === 'onactivated' && newOptions.markedKey !== undefined) {
                    const controller = _private.getMarkerController(this, newOptions);
                    const markedKey = controller.calculateMarkedKeyForVisible();
                    controller.setMarkedKey(markedKey);
                }

                if (newOptions.multiSelectVisibility !== 'hidden' && newOptions.selectedKeys && newOptions.selectedKeys.length > 0) {
                    const selectionController = _private.createSelectionController(this, newOptions);
                    const selection = {selected: newOptions.selectedKeys, excluded: newOptions.excludedKeys};
                    selectionController.setSelection(selection);
                }
            }
            return res;
        });
    },

    _initNewModel(cfg, data, viewModelConfig) {
        this._items = data;
        this._listViewModel = this._createNewModel(
            data,
            viewModelConfig,
            cfg.viewModelConstructor
        );

        _private.setHasMoreData(this._listViewModel,
            _private.hasMoreDataInAnyDirection(this, this._sourceController), true);

        if (cfg.itemsReadyCallback) {
            cfg.itemsReadyCallback(this._listViewModel.getCollection());
        }
        if (this._listViewModel) {
            _private.initListViewModelHandler(this, this._listViewModel, true);
        }
        this._shouldNotifyOnDrawItems = true;
        _private.prepareFooter(this, cfg, this._sourceController);
    },

    _prepareItemsOnMount(self, newOptions, receivedState: IReceivedState = {}, collapsedGroups) {
        const receivedError = receivedState.errorConfig;
        let receivedData = receivedState.data;
        let viewModelConfig = {...newOptions, keyProperty: self._keyProperty};

        if (self._sourceController) {
            if (receivedData) {
                self._sourceController.setItems(receivedData);
            } else {
                receivedData = self._sourceController.getItems();
            }
        }

        if (collapsedGroups) {
            viewModelConfig = cMerge(viewModelConfig, {collapsedGroups});
        }

        if (newOptions.groupProperty) {
            self._groupingLoader = new GroupingLoader({});
        }

        if (newOptions.source && receivedData && newOptions.dataLoadCallback instanceof Function) {
            newOptions.dataLoadCallback(receivedData);
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
            self._shouldNotifyOnDrawItems = true;
            _private.initListViewModelHandler(self, self._listViewModel, newOptions.useNewModel);
        }

            if (newOptions.source) {
                if (receivedData) {
                    _private.setHasMoreData(self._listViewModel, _private.hasMoreDataInAnyDirection(self, self._sourceController), true);

                if (newOptions.useNewModel) {
                    self._items = self._listViewModel.getCollection();
                } else {
                    self._items = self._listViewModel.getItems();
                }
                self._needBottomPadding = _private.needBottomPadding(newOptions, self._listViewModel);
                if (self._pagingNavigation) {
                    const hasMoreData = self._items.getMetaData().more;
                    _private.updatePagingData(self, hasMoreData);
                }

                if (newOptions.afterReloadCallback) {
                    newOptions.afterReloadCallback(newOptions, self._items);
                }

                if (newOptions.serviceDataLoadCallback instanceof Function) {
                    newOptions.serviceDataLoadCallback(null, self._items);
                }

                    _private.createScrollController(self, newOptions);

                _private.prepareFooter(self, newOptions, self._sourceController);

                _private.initVisibleItemActions(self, newOptions);

                if (_private.supportAttachLoadTopTriggerToNull(newOptions) &&
                    _private.needAttachLoadTopTriggerToNull(self)) {
                    self._hideTopTrigger = true;
                }
                return Promise.resolve();
            }
            if (receivedError) {
                if (newOptions.dataLoadErrback instanceof Function) {
                    newOptions.dataLoadErrback(receivedError);
                }
                return Promise.resolve(_private.showError(self, receivedError));
            }
            return _private.reload(self, newOptions).addCallback((result) => {

                // FIXME: https://online.sbis.ru/opendoc.html?guid=1f6b4847-7c9e-4e02-878c-8457aa492078
                const data = result.data || (new RecordSet<Model>({
                    keyProperty: self._keyProperty,
                    rawData: []
                }));

                this._sourceController.setItems(data);

                if (newOptions.useNewModel && !self._listViewModel) {
                    self._initNewModel(newOptions, data, viewModelConfig);
                }

                if (viewModelConfig.collapsedGroups) {
                    self._listViewModel.setCollapsedGroups(viewModelConfig.collapsedGroups);
                }
                self._needBottomPadding = _private.needBottomPadding(newOptions, self._listViewModel);

                    _private.createScrollController(self, newOptions);

                _private.initVisibleItemActions(self, newOptions);

                    // TODO Kingo.
                    // если в опции передан sourceController, не надо из _beforeMount
                    // возврашать полученный recordSet, иначе он будет сериализоваться
                    // и на уровне Container/Data и на уровне BaseControl'a
                    if (result.errorConfig ||
                        !(newOptions.sourceController ||
                        // FIXME https://online.sbis.ru/opendoc.html?guid=fe106611-647d-4212-908f-87b81757327b
                        // Иначе список построится по receivedState, а в PrefetchProxy останется кэш,
                        // и любой запрос к источнику вернёт данные из кэша
                        cInstance.instanceOfModule(newOptions.source, 'Types/source:PrefetchProxy'))) {
                        return Promise.resolve(getState(result));
                    }
                });
            } else {
                _private.createScrollController(self, newOptions);
                return Promise.resolve();
            }
    },

    _prepareGroups(newOptions, callback: Function) {
        let result = null;
        if (newOptions.historyIdCollapsedGroups || newOptions.groupHistoryId) {
            result = new Deferred();
            groupUtil.restoreCollapsedGroups(newOptions.historyIdCollapsedGroups || newOptions.groupHistoryId).addCallback(function(collapsedGroupsFromStore) {
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

    _initKeyProperty(options) {
        let keyProperty = options.keyProperty;
        if (keyProperty === undefined) {
            if (options.source && options.source.getKeyProperty) {
                keyProperty = options.source.getKeyProperty();
            }
        }
        if (keyProperty !== undefined) {
            this._keyProperty = keyProperty;
        }
    },

    scrollMoveSyncHandler(params: IScrollParams): void {

        _private.handleListScrollSync(this, params.scrollTop);

        const result = this._scrollController?.scrollPositionChange(params);
        _private.handleScrollControllerResult(this, result);
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

    viewportResizeHandler(viewportHeight: number, viewportRect: DOMRect, scrollTop: number): void {
        this._viewportSize = viewportHeight;
        this._viewportRect = viewportRect;
        if (scrollTop !== undefined) {
            this._scrollTop = scrollTop;
        }
        if (this._isScrollShown || this._scrollController && this._scrollController.isAppliedVirtualScroll()) {
            this._updateItemsHeights();
        }
        if (this._loadingIndicatorState) {
            _private.updateIndicatorContainerHeight(this, _private.getViewRect(this), this._viewportRect);
        }
        if (this._recalcPagingVisible) {
            if (!this._pagingVisible) {
                _private.initPaging(this);
            }
        }
    },

    _updateShadowModeHandler(shadowVisibility: { down: boolean, up: boolean }): void {
        this._shadowVisibility = shadowVisibility;

        if (this._isMounted) {
            // scrollTop пересчитывается в beforePaint поэтому и тень должны изменять тоже в beforePaint,
            // чтобы не было моргания тени
            this._updateShadowModeBeforePaint = () => {
                _private.updateShadowMode(this, shadowVisibility);
            };
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
            if (!this._sourceController.isLoading()) {
                _private.hideIndicator(this);
            }

            const viewModel = this.getViewModel();
            const hasItems = viewModel && viewModel.getCount();
            if (_private.isPortionedLoad(this) && this._portionedSearchInProgress && hasItems) {
                _private.getPortionedSearch(this).stopSearch(direction);
            }
        }
        this._scrollController?.setTriggerVisibility(direction, state);
        if (state) {
            this.handleTriggerVisible(direction);
        }
    },

    // Устанавливаем напрямую в style, чтобы не ждать и не вызывать лишний цикл синхронизации
    changeIndicatorStateHandler(state: boolean, indicatorName: IDirection): void {
        if (indicatorName) {
            if (state) {
                this._children[`${indicatorName}LoadingIndicator`].style.display = '';
            } else {
                this._children[`${indicatorName}LoadingIndicator`].style.display = 'none';
            }
        }
    },
    applyTriggerOffset(offset: {top: number, bottom: number}): void {
        // Устанавливаем напрямую в style, чтобы не ждать и не вызывать лишний цикл синхронизации
        this._children.topVirtualScrollTrigger?.style.top = `${offset.top}px`;
        this._children.bottomVirtualScrollTrigger?.style.bottom = `${offset.bottom}px`;
    },
    _viewResize(): void {
        if (this._isMounted) {
            const container = this._children.viewContainer || this._container[0] || this._container;
            this._viewSize = _private.getViewSize(this, true);

            /**
             * Заново определяем должен ли отображаться пэйджинг или нет.
             * Скрывать нельзя, так как при подгрузке данных пэйджинг будет моргать.
             */
            if (this._pagingVisible) {
                this._cachedPagingState = false;
                _private.initPaging(this);
            }
            this._viewRect = container.getBoundingClientRect();
            if (this._isScrollShown || this._scrollController && this._scrollController.isAppliedVirtualScroll()) {
                this._updateItemsHeights();
            }

            if (_private.needScrollPaging(this._options.navigation)) {
                    _private.doAfterUpdate(this, () => {if (this._scrollController?.getParamsToRestoreScrollPosition()) {
                        return;
                    }
                    _private.updateScrollPagingButtons(this, this._getScrollParams());
                });
            }
            if (this._loadingIndicatorState) {
                _private.updateIndicatorContainerHeight(this, _private.getViewRect(this), this._viewportRect);
            }
        }
    },

    _getScrollParams(): IScrollParams {
        const scrollParams = {
            scrollTop: this._scrollTop,
            scrollHeight: _private.getViewSize(this, true),
            clientHeight: this._viewportSize
        };
        /**
         * Для pagingMode numbers нужно знать реальную высоту списка и scrollTop (включая то, что отсечено виртуальным скроллом)
         * Это нужно чтобы правильно посчитать номер страницы.
         * Также, это нужно для других пэджингов, но только в том случае, если мы скроллим не через нажатие кнопок.
         * Иначе пэджинг может исчезать и сразу появляться.
         * https://online.sbis.ru/opendoc.html?guid=8d830d87-be3f-4522-b453-0df337147d42
         */
        if (_private.needScrollPaging(this._options.navigation) &&
            (this._options.navigation.viewConfig.pagingMode === 'numbers' || !this._isPagingArrowClick)) {
            scrollParams.scrollTop += (this._scrollController?.getPlaceholders().top || 0);
            scrollParams.scrollHeight += (this._scrollController?.getPlaceholders().bottom +
                this._scrollController?.getPlaceholders().top || 0);
        }
        this._isPagingArrowClick = false;
        return scrollParams;
    },

    getViewModel() {
        return this._listViewModel;
    },

    getSourceController(): SourceController {
        return this._sourceController;
    },

    _afterMount(): void {
        this._isMounted = true;

        if (this._needScrollCalculation && !this.__error) {
            this._registerObserver();
            this._registerIntersectionObserver();
        }
        if (this._options.itemsDragNDrop) {
            const container = this._container[0] || this._container;
            container.addEventListener('dragstart', this._nativeDragStart);
        }
        this._loadedItems = null;

        if (this._scrollController) {
            if (this._options.activeElement) {
                _private.scrollToItem(this, this._options.activeElement, false, true);
            }

            this._scrollController.continueScrollToItemIfNeed();
        }

        if (this._editInPlaceController) {
            _private.registerFormOperation(this);
            if (this._editInPlaceController.isEditing()) {
                _private.activateEditingRow(this);
            }
        }

        // в тач интерфейсе инициализировать пейджер необходимо при загрузке страницы
        // В beforeMount инициализировать пейджер нельзя, т.к. не корректно посчитаются его размеры
        // Также, в тач интерфейсе может быть включено управление мышью, и мы можем не знать,
        // как устройство управляется в данный момент, поэтому определяем по isMobilePlatform
        if (detection.isMobilePlatform) {
            _private.initPaging(this);
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

        // TODO удалить после того как избавимся от onactivated
        if (_private.hasMarkerController(this)) {
            const newMarkedKey = _private.getMarkerController(this).getMarkedKey();
            if (newMarkedKey !== this._options.markedKey) {
                _private.changeMarkedKey(this, newMarkedKey, true);
            }
        }

        if (_private.hasSelectionController(this)) {
            const controller = _private.getSelectionController(this);
            _private.changeSelection(this, controller.getSelection());
        }

        if (!this._items || !this._items.getCount()) {
            _private.attachLoadTopTriggerToNullIfNeed(this, this._options);
            if (this._hideTopTrigger) {
                this._hideTopTrigger = false;
            }
        }
    },

    _updateScrollController(newOptions) {
        if (this._scrollController) {
            this._scrollController.setRendering(true);
            const result = this._scrollController.update({
                options: {
                    ...newOptions,
                    attachLoadTopTriggerToNull: this._attachLoadTopTriggerToNull,
                    forceInitVirtualScroll: newOptions?.navigation?.view === 'infinity',
                    collection: this.getViewModel(),
                    needScrollCalculation: this._needScrollCalculation
                }
            });
            _private.handleScrollControllerResult(this, result);
        }
    },

    _beforeUpdate(newOptions) {
        this._updateInProgress = true;
        const filterChanged = !isEqual(newOptions.filter, this._options.filter);
        const navigationChanged = !isEqual(newOptions.navigation, this._options.navigation);
        const resetPaging = this._pagingNavigation && filterChanged;
        const sortingChanged = !isEqual(newOptions.sorting, this._options.sorting);
        const sourceChanged = newOptions.source !== this._options.source;
        const recreateSource = navigationChanged || resetPaging || sortingChanged;
        const searchValueChanged = this._options.searchValue !== newOptions.searchValue;
        let isItemsResetFromSourceController = false;
        const self = this;

        this._loadedBySourceController = newOptions.sourceController &&
            // Если изменился поиск, то данные меняет контроллер поиска через sourceController
            (sourceChanged || searchValueChanged && newOptions.searchValue);

        const isSourceControllerLoadingNow = newOptions.sourceController &&
            newOptions.sourceController.isLoading() &&
            newOptions.sourceController.getState().source !== this._options.source;

        const needReload =
            !this._loadedBySourceController &&
            !isSourceControllerLoadingNow &&
            // если есть в оциях sourceController, то при смене источника Container/Data загрузит данные
            (sourceChanged || filterChanged || sortingChanged || recreateSource);

        this._needBottomPadding = _private.needBottomPadding(newOptions, self._listViewModel);
        this._prevRootId = this._options.root;
        if (navigationChanged) {

            // При смене страницы, должно закрыться редактирование записи.
            _private.closeEditingIfPageChanged(this, this._options.navigation, newOptions.navigation);
            _private.initializeNavigation(this, newOptions);
            if (this._listViewModel && this._listViewModel.setSupportVirtualScroll) {
                this._listViewModel.setSupportVirtualScroll(!!this._needScrollCalculation);
            }

            if (this._pagingVisible) {
                this._pagingVisible = false;
            }
        }

        if (this._options.rowSeparatorSize !== newOptions.rowSeparatorSize) {
            this._listViewModel.setRowSeparatorSize(newOptions.rowSeparatorSize);
        }

        if (this._removeController) {
            this._removeController.updateOptions({source: newOptions.source});
        }

        if (this._moveController) {
            this._moveController.updateOptions(_private.prepareMoverControllerOptions(this, newOptions));
        }

        const oldViewModelConstructorChanged = !newOptions.useNewModel && newOptions.viewModelConstructor !== this._viewModelConstructor;

        if ((oldViewModelConstructorChanged || needReload) && this.isEditing()) {
            // При перезагрузке или при смене модели(например, при поиске), редактирование должно завершаться
            // без возможности отменить закрытие из вне.
            this._cancelEdit(true);
        }

        if (oldViewModelConstructorChanged) {
            self._viewModelConstructor = newOptions.viewModelConstructor;
            const items = this._loadedBySourceController ? newOptions.sourceController.getItems() : this._listViewModel.getItems();
            this._listViewModel.destroy();
            this._listViewModel = new newOptions.viewModelConstructor(cMerge({...newOptions}, {
                items,
                supportVirtualScroll: !!this._needScrollCalculation,
                keyProperty: this._keyProperty
            }));
            _private.initListViewModelHandler(this, this._listViewModel, newOptions.useNewModel);
            this._modelRecreated = true;

            _private.setHasMoreData(this._listViewModel, _private.hasMoreDataInAnyDirection(self, self._sourceController));

            // Важно обновить коллекцию в scrollContainer перед сбросом скролла, т.к. scrollContainer реагирует на
            // scroll и произведет неправильные расчёты, т.к. у него старая collection.
            // https://online.sbis.ru/opendoc.html?guid=caa331de-c7df-4a58-b035-e4310a1896df
            this._updateScrollController(newOptions);
        } else {
            if (!newOptions.useNewModel) {
                this._listViewModel.setBackgroundStyle(newOptions.backgroundStyle);
            }
            this._updateScrollController(newOptions);
        }

        if (_private.hasMarkerController(this)) {
            _private.getMarkerController(this).updateOptions({
                model: this._listViewModel,
                markerVisibility: newOptions.markerVisibility
            });
        }

        if (_private.hasSelectionController(this)) {
            const selectionController = _private.getSelectionController(self, newOptions);

            _private.updateSelectionController(this, newOptions);

            const allowClearSelectionBySelectionViewMode =
                this._options.selectionViewMode === newOptions.selectionViewMode ||
                newOptions.selectionViewMode !== 'selected';
            if (filterChanged && selectionController.isAllSelected(false) &&
                allowClearSelectionBySelectionViewMode) {
                _private.changeSelection(this, { selected: [], excluded: [] });
            }
        }

        if (newOptions.collapsedGroups !== this._options.collapsedGroups) {
            GroupingController.setCollapsedGroups(this._listViewModel, newOptions.collapsedGroups);
        }

        if ((newOptions.keyProperty !== this._options.keyProperty) || sourceChanged) {
            this._initKeyProperty(newOptions);
            this._listViewModel.setKeyProperty(this._keyProperty);
        }

        if (newOptions.markerVisibility !== this._options.markerVisibility && !newOptions.useNewModel) {
            this._listViewModel.setMarkerVisibility(newOptions.markerVisibility);
        }

        if (newOptions.theme !== this._options.theme && !newOptions.useNewModel) {
            this._listViewModel.setTheme(newOptions.theme);
        }

        if (newOptions.editingConfig !== this._options.editingConfig) {
            this._listViewModel.setEditingConfig(this._getEditingConfig(newOptions));
        }

        if (newOptions.sourceController) {
            const items = newOptions.sourceController.getItems();

            if (this._options.sourceController !== newOptions.sourceController) {
                this._sourceController = newOptions.sourceController;
            }

            if (items && (this._listViewModel && !this._listViewModel.getCollection() || this._items !== items)) {
                const isActionsAssigned = this._listViewModel.isActionsAssigned();
                _private.assignItemsToModel(this, items, newOptions);
                isItemsResetFromSourceController = true;

                // TODO удалить когда полностью откажемся от старой модели
                if (!_private.hasSelectionController(this) && newOptions.multiSelectVisibility !== 'hidden'
                    && newOptions.selectedKeys && newOptions.selectedKeys.length) {
                    const controller = _private.createSelectionController(this, newOptions);
                    controller.setSelection({ selected: newOptions.selectedKeys, excluded: newOptions.excludedKeys });
                }

                // TODO удалить когда полностью откажемся от старой модели
                //  Если Items были обновлены, то в старой модели переинициализировался display и этот параметр сбросился
                this._listViewModel.setActionsAssigned(isActionsAssigned);
            }

            if (this._loadedBySourceController) {
                _private.executeAfterReloadCallbacks(self, items, newOptions);
            }
        }

        if ((recreateSource || sourceChanged) && !newOptions.sourceController) {
            if (this._sourceController) {
                this.updateSourceController(newOptions);
            } else {
                this._sourceController = _private.getSourceController(this, newOptions);
            }
        }

        if (filterChanged && !newOptions.sourceController && this._sourceController) {
            this.updateSourceController(newOptions);
        }
        if (newOptions.multiSelectVisibility !== this._options.multiSelectVisibility) {
            this._listViewModel.setMultiSelectVisibility(newOptions.multiSelectVisibility);
        }
        if (newOptions.multiSelectPosition !== this._options.multiSelectPosition) {
            this._listViewModel.setMultiSelectPosition(newOptions.multiSelectPosition);
        }

        if (newOptions.itemTemplateProperty !== this._options.itemTemplateProperty) {
            this._listViewModel.setItemTemplateProperty(newOptions.itemTemplateProperty);
        }

        if (!isEqual(this._options.itemPadding, newOptions.itemPadding)) {
            this._listViewModel.setItemPadding(newOptions.itemPadding);
        }

        if (sortingChanged && !newOptions.useNewModel) {
            this._listViewModel.setSorting(newOptions.sorting);
        }

        const needGroupingLoader = !!newOptions.groupProperty && !_private.isDemandNavigation(newOptions.navigation);
        const hasGroupingLoader = !!this._groupingLoader;
        if (needGroupingLoader) {
            const groupPropertyChanged = newOptions.groupProperty !== this._options.groupProperty;
            if (hasGroupingLoader) {
                if (groupPropertyChanged) {
                    this._groupingLoader.destroy();
                    this._groupingLoader = new GroupingLoader({});
                }
            } else {
                this._groupingLoader = new GroupingLoader({});
            }
        } else if (hasGroupingLoader) {
            this._groupingLoader.destroy();
            this._groupingLoader = null;
        }

        const shouldProcessMarker = newOptions.markerVisibility === 'visible'
            || newOptions.markerVisibility === 'onactivated' && newOptions.markedKey !== undefined;

        // Если будет выполнена перезагрузка, то мы на событие reset применим новый ключ
        if (shouldProcessMarker && !needReload) {
            const markerController = _private.getMarkerController(this, newOptions);
            if (this._options.markedKey !== newOptions.markedKey) {
                markerController.setMarkedKey(newOptions.markedKey);
            } else if (this._options.markerVisibility !== newOptions.markerVisibility && newOptions.markerVisibility === 'visible') {
                const newMarkedKey = markerController.calculateMarkedKeyForVisible();
                _private.changeMarkedKey(self, newMarkedKey);
            }
        } else if (_private.hasMarkerController(this) && newOptions.markerVisibility === 'hidden') {
            _private.getMarkerController(this).destroy();
            this._markerController = null;
        }

        // Когда удаляют все записи, мы сбрасываем selection, поэтому мы его должны применить даже когда список пуст
        if (this._items) {
            const selectionChanged = (!isEqual(self._options.selectedKeys, newOptions.selectedKeys)
                || !isEqual(self._options.excludedKeys, newOptions.excludedKeys)
                || self._options.selectedKeysCount !== newOptions.selectedKeysCount);

            // В browser когда скрывают видимость чекбоксов, еще и сбрасывают selection
            if (selectionChanged && (newOptions.multiSelectVisibility !== 'hidden' || _private.hasSelectionController(this))) {
                const newSelection = {
                    selected: newOptions.selectedKeys,
                    excluded: newOptions.excludedKeys
                };
                const controller = _private.getSelectionController(this, newOptions);
                controller.setSelection(newSelection);
                self._notify('listSelectedKeysCountChanged', [controller.getCountOfSelected(), controller.isAllSelected()], {bubbling: true});
            }
        }
        if (newOptions.multiSelectVisibility === 'hidden' && _private.hasSelectionController(self)) {
            _private.getSelectionController(this).destroy();
            this._selectionController = null;
        }

        if (this._editInPlaceController) {
            this._editInPlaceController.updateOptions({
                collection: newOptions.useNewModel ? this._listViewModel : this._listViewModel.getDisplay()
            });
        }

        // Синхронный индикатор загрузки для реестров, в которых записи - тяжелые контролы.
        // Их отрисовка может занять много времени, поэтому следует показать индикатор, не дожидаясь ее окончания.
        if (this._syncLoadingIndicatorState) {
            clearTimeout(this._syncLoadingIndicatorTimeout);
            this._syncLoadingIndicatorTimeout = setTimeout(() => {
                this.changeIndicatorStateHandler(true, this._syncLoadingIndicatorState);
            }, INDICATOR_DELAY);
        }

        if (newOptions.searchValue || this._loadedBySourceController) {
            const isPortionedLoad = _private.isPortionedLoad(this);
            const hasMoreData = _private.hasMoreData(this, this._sourceController, 'down');
            const isSearchReturnsEmptyResult = this._items && !this._items.getCount();
            const needCheckLoadToDirection = hasMoreData && isSearchReturnsEmptyResult && !this._sourceController.isLoading();

            // После нажатии на enter или лупу в строке поиска, будут загружены данные и установлены в recordSet,
            // если при этом в списке кол-во записей было 0 (ноль) и поисковой запрос тоже вернул 0 записей,
            // onCollectionChange у рекордсета не стрельнёт, и не сработает код,
            // запускающий подгрузку по скролу (в навигации more: true)
            if (searchValueChanged ||
                (isPortionedLoad && (this._loadedBySourceController || needCheckLoadToDirection))) {
                _private.resetPortionedSearchAndCheckLoadToDirection(this, newOptions);
            }
        }

        if (needReload) {
            if (_private.supportAttachLoadTopTriggerToNull(newOptions) &&
                _private.needAttachLoadTopTriggerToNull(this)) {
                    this._hideTopTrigger = true;
            }
            this._scrollPagingCtr = null;
            _private.resetPagingNavigation(this, newOptions.navigation);
            _private.closeActionsMenu(this);
            if (!isEqual(newOptions.groupHistoryId, this._options.groupHistoryId)) {
                return this._prepareGroups(newOptions, (collapsedGroups) => {
                    return _private.reload(self, newOptions).addCallback(() => {
                        if (!this._destroyed) {
                            this._listViewModel.setCollapsedGroups(collapsedGroups ? collapsedGroups : []);
                            this._needBottomPadding = _private.needBottomPadding(newOptions, this._listViewModel);
                            _private.updateInitializedItemActions(this, newOptions);
                            this._listViewModel.setSearchValue(newOptions.searchValue);
                            if (!this._scrollController) {
                                _private.createScrollController(this, newOptions);
                            }
                        }
                    });
                });
            } else {
                // return result here is for unit tests
                return _private.reload(self, newOptions).addCallback(() => {
                    if (!this._destroyed) {
                        this._needBottomPadding = _private.needBottomPadding(newOptions, this._listViewModel);
                        _private.updateInitializedItemActions(this, newOptions);
                        this._listViewModel.setSearchValue(newOptions.searchValue);
                        if (!this._scrollController) {
                            _private.createScrollController(this, newOptions);
                        }
                    }
                });
            }
        } else {
            _private.doAfterUpdate(self, () => {
                if (this._listViewModel) {
                    this._listViewModel.setSearchValue(newOptions.searchValue);
                }
                if (this._sourceController) {
                    const hasMore = _private.hasMoreDataInAnyDirection(this, this._sourceController);
                    if (this._listViewModel && this._listViewModel.getHasMoreData() !== hasMore) {
                        _private.setHasMoreData(this._listViewModel, hasMore);
                    }

                    if (this._pagingNavigation &&
                        !this._pagingNavigationVisible && this._items && sourceChanged) {
                        _private.updatePagingData(this,
                            this._items.getMetaData().more);
                    }
                }
            });
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
         * 4. Записи в модели были пересозданы из sourceController
         * 5. обновилась опция readOnly (относится к TreeControl)
         * 6. обновилась опция itemActionsPosition
         */
        if (
            newOptions.itemActions !== this._options.itemActions ||
            newOptions.itemActionVisibilityCallback !== this._options.itemActionVisibilityCallback ||
            isItemsResetFromSourceController ||
            newOptions.readOnly !== this._options.readOnly ||
            newOptions.itemActionsPosition !== this._options.itemActionsPosition
        ) {
            _private.updateInitializedItemActions(this, newOptions);
        }

        if (
            ((newOptions.itemActions || newOptions.itemActionsProperty) && this._modelRecreated)) {
            _private.updateItemActionsOnce(this, newOptions);
        }

        if (this._itemsChanged) {
            this._shouldNotifyOnDrawItems = true;
        }

        if (this._loadedItems) {
            this._shouldRestoreScrollPosition = true;
        }
    },

    reloadItem(key: string, readMeta: object, replaceItem: boolean, reloadType: string = 'read'): Promise<Model> {
        const items = this._listViewModel.getCollection();
        const currentItemIndex = items.getIndexByValue(this._keyProperty, key);
        const sourceController = _private.getSourceController(this, this._options);

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
            // Данный код актуален только для старой модели
            if (item && item.getId && this._listViewModel.markItemReloaded instanceof Function) {
                this._listViewModel.markItemReloaded(item.getId());
                this._itemReloaded = true;
            }
        };

        if (currentItemIndex === -1) {
            throw new Error('BaseControl::reloadItem no item with key ' + key);
        }

        if (reloadType === 'query') {
            filter = cClone(this._options.filter);
            filter[this._keyProperty] = [key];
            sourceController.setFilter(filter);
            reloadItemDeferred = sourceController.load().then((items) => {
                if (items instanceof RecordSet) {
                    itemsCount = items.getCount();

                    if (itemsCount === 1) {
                        loadCallback(items.at(0));
                    } else if (itemsCount > 1) {
                        Logger.error('BaseControl: reloadItem::query returns wrong amount of items for reloadItem call with key: ' + key);
                    } else {
                        Logger.info('BaseControl: reloadItem::query returns empty recordSet.');
                    }
                }
                return items;
            });
        } else {
            reloadItemDeferred = sourceController.read(key, readMeta).then((item) => {
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

    getItems(): RecordSet {
        return this._items;
    },

    scrollToItem(key: TItemKey, toBottom: boolean, force: boolean): void {
        return _private.scrollToItem(this, key, toBottom, force);
    },

    _onValidateCreated(e: Event, control: ValidateContainer): void {
        this._validateController.addValidator(control);
    },

    _onValidateDestroyed(e: Event, control: ValidateContainer): void {
        this._validateController.removeValidator(control);
    },

    _beforeUnmount() {
        if (this._checkTriggerVisibilityTimeout) {
            clearTimeout(this._checkTriggerVisibilityTimeout);
        }
        if (this._options.itemsDragNDrop) {
            const container = this._container[0] || this._container;
            container.removeEventListener('dragstart', this._nativeDragStart);
        }

        // Если sourceController есть в опциях, значит его создали наверху
        // например list:DataContainer, и разрушать его тоже должен создатель.
        if (this._sourceController && !this._options.sourceController) {
            this._sourceController.destroy();
        }

        if (this._groupingLoader) {
            this._groupingLoader.destroy();
        }

        if (this._scrollPagingCtr) {
            this._scrollPagingCtr.destroy();
        }

        if (this._editInPlaceController) {
            this._editInPlaceController.destroy();
            this._editInPlaceInputHelper = null;
        }

        if (this._listViewModel) {
            this._listViewModel.destroy();
        }

        this._loadTriggerVisibility = null;

        if (this._portionedSearch) {
            this._portionedSearch.destroy();
            this._portionedSearch = null;
        }

        this._validateController.destroy();
        this._validateController = null;
        if (this._intersectionObserver) {
            this._intersectionObserver.destroy();
            this._intersectionObserver = null;
        }

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

        if (this._scrollController && this._scrollController.getParamsToRestoreScrollPosition()) {
            this._notify('saveScrollPosition', [], {bubbling: true});
        }
    },

    _beforePaint(): void {
        let positionRestored = false

        // TODO: https://online.sbis.ru/opendoc.html?guid=2be6f8ad-2fc2-4ce5-80bf-6931d4663d64
        if (this._container) {
            this._viewSize = _private.getViewSize(this, true);
        }

        if (this._pagingVisible) {
            this._updatePagingPadding();
        }

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
            positionRestored = true;
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
            if (this._syncLoadingIndicatorTimeout) {
                clearTimeout(this._syncLoadingIndicatorTimeout);
                this.changeIndicatorStateHandler(false, 'up');
                this.changeIndicatorStateHandler(false, 'down');
                this._syncLoadingIndicatorState = null;
            }
            let itemsUpdated = false;
            if (this._listViewModel && !this._modelRecreated && this._viewReady) {
                itemsUpdated = this._scrollController.updateItemsHeights(getItemsHeightsData(this._getItemsContainer()));
            }
            this._scrollController.update({ params: { scrollHeight: this._viewSize, clientHeight: this._viewportSize } })
            this._scrollController.setRendering(false);

            let needCheckTriggers = this._scrollController.continueScrollToItemIfNeed() ||
                                    this._scrollController.completeVirtualScrollIfNeed();

            const paramsToRestoreScroll = this._scrollController.getParamsToRestoreScrollPosition();
            if (paramsToRestoreScroll) {
                this._scrollController.beforeRestoreScrollPosition();
                this._notify('restoreScrollPosition',
                             [paramsToRestoreScroll.heightDifference, paramsToRestoreScroll.direction, correctingHeight],
                             {bubbling: true});
                needCheckTriggers = true;
            }

            if (this._loadedBySourceController || needCheckTriggers || itemsUpdated || positionRestored) {
                this.checkTriggerVisibilityAfterRedraw();
            }

        }
        this._actualPagingVisible = this._pagingVisible;

        if (this._hideTopTrigger && this._needScrollToFirstItem) {
            this._hideTopTrigger = false;
        }
        this._scrollToFirstItemIfNeed();

        if (this._updateShadowModeBeforePaint) {
            this._updateShadowModeBeforePaint();
            this._updateShadowModeBeforePaint = null;
        }

        if (this._editInPlaceController && this._editInPlaceController.isEditing()) {
            _private.activateEditingRow(this);
        }

        this._updateInProgress = false;
        if (this._jumpToEndOnDrawItems && this._shouldNotifyOnDrawItems) {
            this._jumpToEndOnDrawItems();
            this._jumpToEndOnDrawItems = null;
        }
        this._notifyOnDrawItems();
        if (this._callbackAfterUpdate) {
            this._callbackAfterUpdate.forEach((callback) => {
                callback();
            });
            this._callbackAfterUpdate = null;
        }
    },

    // IO срабатывает после перерисовки страницы, поэтому ждем следующего кадра
    checkTriggerVisibilityAfterRedraw(): void {
        if (this._checkTriggerVisibilityTimeout) {
            clearTimeout(this._checkTriggerVisibilityTimeout);
        }

        // requestAnimationFrame, чтобы гарантированно изменения отобразились на странице.
        // setTimeout, чтобы IntersectionObserver успел отработать асинхронно (для IE с задержкой).
        // doAfterUpdate, чтобы не попасть в цикл синхронизации списка.
        // Другой порядок не даст нам таких гарантий,
        // и либо IO не отработает, либо попадаем в цикл синхронизации.
        window.requestAnimationFrame(() => {
            this._checkTriggerVisibilityTimeout = setTimeout(() => {
                _private.doAfterUpdate(this, () => {
                    this.checkTriggersVisibility();
                });
            }, CHECK_TRIGGERS_DELAY_IF_NEED);
        });
    },

    // Проверяем видимость триггеров после перерисовки.
    // Если видимость не изменилась, то события не будет, а обработать нужно.
    checkTriggersVisibility(): void {
        const triggerDown = this._loadTriggerVisibility.down;
        const triggerUp = this._loadTriggerVisibility.up;
        this._scrollController.setTriggerVisibility('down', triggerDown);
        this._scrollController.setTriggerVisibility('up', triggerUp);
        if (triggerDown) {
            this.handleTriggerVisible('down');
        }
        if (triggerUp) {
            this.handleTriggerVisible('up');
        }
    },
    handleTriggerVisible(direction: IDirection): void {
        // Вызываем сдвиг диапазона в направлении видимого триггера
        this._shiftToDirection(direction);
    },
    _shiftToDirection(direction): void {
        this._scrollController.shiftToDirection(direction).then((result) => {
            if (result) {
                _private.handleScrollControllerResult(this, result);
                this._syncLoadingIndicatorState = direction;
            } else {
                this.loadMore(direction);
            }
        });
    },
    _findFirstItem(collection: any): { key: CrudEntityKey, skippedItemsCount: number } {
        let item = null;
        let itemContents = null;
        let key = null;
        let index = 0;
        let skippedItemsCount = 0;
        while (index < collection.getCount()) {
            item = collection.at(index);
            if (item) {
                itemContents = item.getContents();
                if (itemContents && itemContents.getKey) {
                    key = itemContents.getKey();
                    break;
                }
            }
            skippedItemsCount++;
            index++;
        }
        return {
            key,
            skippedItemsCount
        };
    },
    _scrollToFirstItemIfNeed(): void {
        if (this._needScrollToFirstItem) {
            this._needScrollToFirstItem = false;

            if (this._jumpToEndOnDrawItems) {
                return;
            }
            // Первым элементом может оказаться группа, к ней подскрол сейчас невозможен, поэтому отыскиваем первую
            // реальную запись и скролим именно к ней.
            // Ошибка: https://online.sbis.ru/opendoc.html?guid=98a3d6ac-68e3-427d-943f-b6b692800217
            // Задача на рефакторинг: https://online.sbis.ru/opendoc.html?guid=1f9d8be3-2cec-4e3e-aace-9067b120248a
            const firstItem = this._findFirstItem(this.getViewModel());
            if (firstItem && firstItem.key !== null) {
                _private.scrollToItem(this, firstItem.key, false, true, firstItem.skippedItemsCount);
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
        this._loadedBySourceController = false;
        if (this._needScrollCalculation && !this.__error && !this._observerRegistered) {
            this._registerObserver();
            this._registerIntersectionObserver();
        }
        // FIXME need to delete after https://online.sbis.ru/opendoc.html?guid=4db71b29-1a87-4751-a026-4396c889edd2
        if (oldOptions.hasOwnProperty('loading') && oldOptions.loading !== this._options.loading) {
            if (this._options.loading && this._loadingState === null) {
                _private.showIndicator(this);
            } else if (!this._sourceController.isLoading() && this._loadingState === 'all') {
                _private.hideIndicator(this);
            }
        }

        // Запустить валидацию, которая была заказана методом commit у редактирования по месту, после
        // применения всех обновлений реактивных состояний.
        if (this._isPendingDeferSubmit) {
            this._validateController.resolveSubmit();
            this._isPendingDeferSubmit = false;
        }

        // After update the reloaded items have been redrawn, clear
        // the marks in the model
        if (this._itemReloaded) {
            this._listViewModel.clearReloadedMarks();
            this._itemReloaded = false;
        }
        this._wasScrollToEnd = false;
        this._scrollPageLocked = false;
        this._modelRecreated = false;
    },

    __onPagingArrowClick(e, arrow) {
        this._isPagingArrowClick = true;
        switch (arrow) {
            case 'Next':
                _private.scrollPage(this, 'Down');
                break;
            case 'Prev':
                _private.scrollPage(this, 'Up');
                break;
            case 'Begin':
                const resultEvent = this._notify('pagingArrowClick', ['Begin'], {bubbling: true});
                if (resultEvent !== false) {
                    _private.scrollToEdge(this, 'up');
                }
                break;
            case 'End':
                const resultEvent = this._notify('pagingArrowClick', ['End'], {bubbling: true});
                if (resultEvent !== false) {
                    _private.scrollToEdge(this, 'down');
                }
                break;
        }
    },
    _canScroll(scrollTop: number, direction): boolean {
        const placeholder = this._scrollController?.getPlaceholders()?.top || 0;
        return !(direction === 'down' && scrollTop - placeholder + this._viewportSize > this._viewSize ||
            direction === 'up' && scrollTop - placeholder < 0)
    },
    _hasEnoughData(page: number): boolean {
        const neededItemsCount = this._scrollPagingCtr.getNeededItemsCountForPage(page);
        const itemsCount = this._listViewModel.getCount();
        return neededItemsCount <= itemsCount;
    },
    __selectedPageChanged(e, page: number) {
        let scrollTop = this._scrollPagingCtr.getScrollTopByPage(page);
        const direction = this._currentPage < page ? 'down' : 'up';
        const canScroll = this._canScroll(scrollTop, direction);
        const itemsCount = this._items.getCount();
        const allDataLoaded = _private.getAllDataCount(this) === itemsCount;
        const startIndex = this._listViewModel.getStartIndex();
        const stopIndex = this._listViewModel.getStopIndex();
        if (!canScroll && allDataLoaded && direction === 'up' && startIndex === 0) {
            scrollTop = 0;
            page = 1;
        }
        if (!canScroll && allDataLoaded && direction === 'down' && stopIndex === this._listViewModel.getCount()) {
            page = this._pagingCfg.pagesCount;
        }
        this._applySelectedPage = () => {
            this._currentPage = page;
            if (this._scrollController.getParamsToRestoreScrollPosition()) {
                return;
            }
            scrollTop = this._scrollPagingCtr.getScrollTopByPage(page);
            if (!this._canScroll(scrollTop, direction)) {
                this._shiftToDirection(direction);
            } else {
                this._applySelectedPage = null;

                this._notify('doScroll', [scrollTop], { bubbling: true });
            }
        }
        if (this._currentPage === page) {
            this._applySelectedPage();
            return;
        } else {
            this._selectedPageHasChanged = true;
        }

        //При выборе первой или последней страницы крутим в край.
        if (page === 1) {
            _private.scrollToEdge(this, 'up');
            this._currentPage = page;
        } else if (page === this._pagingCfg.pagesCount) {
            _private.scrollToEdge(this, 'down');
            this._currentPage = page;
        } else {

            // При выборе некрайней страницы, проверяем,
            // можно ли проскроллить к ней, по отрисованным записям
            if (canScroll) {
                this._applySelectedPage();
            } else {
                // если нельзя проскроллить, проверяем, хватает ли загруженных данных для сдвига диапазона
                // или нужно подгружать еще.
                if (this._hasEnoughData(page)) {
                    this._shiftToDirection(direction);
                } else {
                    this.loadMore(direction);
                }
            }
        }
    },

    __needShowEmptyTemplate(emptyTemplate: Function | null, listViewModel: ListViewModel): boolean {
        // Described in this document: https://docs.google.com/spreadsheets/d/1fuX3e__eRHulaUxU-9bXHcmY9zgBWQiXTmwsY32UcsE
        const noData = !listViewModel || !listViewModel.getCount();
        const noEdit = !listViewModel || !_private.isEditing(this);
        const isLoading = this._sourceController && this._sourceController.isLoading();
        const notHasMore = !_private.hasMoreDataInAnyDirection(this, this._sourceController);
        const noDataBeforeReload = this._noDataBeforeReload;
        return emptyTemplate && noEdit && notHasMore && (isLoading ? noData && noDataBeforeReload : noData);
    },

    _onCheckBoxClick(e, key, status, readOnly) {
        if (!readOnly) {
            const newSelection = _private.getSelectionController(this).toggleItem(key);
            _private.changeSelection(this, newSelection);
            this._notify('checkboxClick', [key, status]);
        }
        // если чекбокс readonly, то мы все равно должны проставить маркер
        this.setMarkedKey(key);
    },

    showIndicator(direction: 'down' | 'up' | 'all' = 'all'): void {
        _private.showIndicator(this, direction);
    },

    hideIndicator(): void {
        _private.hideIndicator(this);
    },

    reload(keepScroll: boolean, sourceConfig: IBaseSourceConfig): Promise<any> {
        if (keepScroll) {
            this._keepScrollAfterReload = true;
        }

        // Вызов перезагрузки из публичного API должен завершать имеющееся редактирование по месту.
        // Во время редактирования перезагрузка допустима только в момент завершения редактирования,
        // точка - beforeEndEdit. При этом возвращение промиса перезагрузки обязательно.
        const cancelEditPromise = this.isEditing() && !this._getEditInPlaceController().isEndEditProcessing() ?
            this._cancelEdit(true).catch(() => {
                // Перезагрузку не остановит даже ошибка во время завершения редактирования.
                // При отмене редактирования с флагом force ошибка может упасть только в прикладном коде.
                // Уведомлением об упавших ошибках занимается контроллер редактирования.
            }) : Promise.resolve();

        return cancelEditPromise.then(() => {
            return _private.reload(this, this._options, sourceConfig).then(getData);
        });
    },

    // TODO удалить, когда будет выполнено наследование контролов (TreeControl <- BaseControl)
    setMarkedKey(key: CrudEntityKey): void {
        if (this._options.markerVisibility !== 'hidden') {
            _private.changeMarkedKey(this, key);
        }
    },

    _onGroupClick(e, groupId, baseEvent, dispItem) {
        if (baseEvent.target.closest('.controls-ListView__groupExpander')) {
            const collection = this._listViewModel;
            const groupingLoader = this._groupingLoader;
            if (this._options.useNewModel) {
                const needExpandGroup = !dispItem.isExpanded();
                if (groupingLoader && needExpandGroup && !groupingLoader.isLoadedGroup(groupId)) {
                    const source = this._options.source;
                    const filter = this._options.filter;
                    const sorting = this._options.sorting;
                    groupingLoader.loadGroup(collection, groupId, source, filter, sorting).then(() => {
                        dispItem.setExpanded(needExpandGroup);
                    });
                } else {
                    dispItem.setExpanded(needExpandGroup);
                }

                // TODO временное решение для новой модели https://online.sbis.ru/opendoc.html?guid=e20934c7-95fa-44f3-a7c2-c2a3ec32e8a3
                const collapsedGroups = collection.getCollapsedGroups() || [];
                const groupIndex = collapsedGroups.indexOf(groupId);
                if (groupIndex === -1) {
                    if (!needExpandGroup) {
                        collapsedGroups.push(groupId);
                    }
                } else if (needExpandGroup) {
                    collapsedGroups.splice(groupIndex, 1);
                }
                const changes = {
                    changeType: needExpandGroup ? 'expand' : 'collapse',
                    group: groupId,
                    collapsedGroups
                };
                _private.groupsExpandChangeHandler(this, changes);
            } else {
                const needExpandGroup = !collection.isGroupExpanded(groupId);
                if (groupingLoader && needExpandGroup && !groupingLoader.isLoadedGroup(groupId)) {
                    const source = this._options.source;
                    const filter = this._options.filter;
                    const sorting = this._options.sorting;
                    groupingLoader.loadGroup(collection, groupId, source, filter, sorting).then(() => {
                        GroupingController.toggleGroup(collection, groupId);
                    });
                } else {
                    GroupingController.toggleGroup(collection, groupId);
                }
            }
        }
    },

    _onItemClick(e, item, originalEvent, columnIndex = null) {
        _private.closeSwipe(this);
        if (originalEvent.target.closest('.js-controls-ListView__checkbox') || this._onLastMouseUpWasDrag) {
            // Если нажали на чекбокс, то это не считается нажатием на элемент. В этом случае работает событие checkboxClick
            // Если на mouseUp, предшествующий этому клику, еще работало перетаскивание, то мы не должны нотифаить itemClick
            this._onLastMouseUpWasDrag = false;
            e.stopPropagation();
            return;
        }

        const canEditByClick = !this._options.readOnly && this._getEditingConfig().editOnClick && !originalEvent.target.closest(`.${JS_SELECTORS.NOT_EDITABLE}`);
        if (canEditByClick) {
            e.stopPropagation();
            this.beginEdit({ item }).then((result) => {
                if (!(result && result.canceled)) {
                    this._editInPlaceInputHelper.setClickInfo(originalEvent.nativeEvent, item);
                }
                return result;
            });
        } else if (this._editInPlaceController) {
            this.commitEdit();
        }
        // При клике по элементу может случиться 2 события: itemClick и itemActivate.
        // itemClick происходит в любом случае, но если список поддерживает редактирование по месту, то
        // порядок событий будет beforeBeginEdit -> itemClick
        // itemActivate происходит в случае активации записи. Если в списке не поддерживается редактирование, то это любой клик.
        // Если поддерживается, то событие не произойдет если успешно запустилось редактирование записи.
        if (e.isStopped()) {
            this._savedItemClickArgs = [item, originalEvent, columnIndex];
        } else {
            const eventResult = this._notify('itemClick', [item, originalEvent, columnIndex], {bubbling: true});
            if (eventResult !== false) {
                this._notify('itemActivate', [item, originalEvent], {bubbling: true});
            }
        }
    },

    // region EditInPlace

    _editInPlaceController: null,
    _editInPlaceInputHelper: null,

    _getEditInPlaceController(): EditInPlaceController {
        if (!this._editInPlaceController) {
            this._editInPlaceController = this._createEditInPlaceController();
        }
        return this._editInPlaceController;
    },

    _createEditInPlaceController(): EditInPlaceController {
        this._editInPlaceInputHelper = new EditInPlaceInputHelper();

        // При создании редактирования по мсесту до маунта, регистрация в formController
        // произойдет после маунта, т.к. она реализована через события. В любом другом случае,
        // регистрация произойдет при создании контроллера редактирования.
        if (this._isMounted) {
            _private.registerFormOperation(this);
        }

        return new EditInPlaceController({
            collection: this._options.useNewModel ? this._listViewModel : this._listViewModel.getDisplay(),
            onBeforeBeginEdit: this._beforeBeginEditCallback.bind(this),
            onAfterBeginEdit: this._afterBeginEditCallback.bind(this),
            onBeforeEndEdit: this._beforeEndEditCallback.bind(this),
            onAfterEndEdit: this._afterEndEditCallback.bind(this)
        });
    },

    _beforeBeginEditCallback(options: { item?: Model}, isAdd: boolean) {
        return new Promise((resolve) => {
            // Редактирование может запуститься при построении.
            const eventResult = this._isMounted ? this._notify('beforeBeginEdit', [options, isAdd]) : undefined;
            if (this._savedItemClickArgs && this._isMounted) {
                // itemClick стреляет, даже если после клика начался старт редактирования, но itemClick
                // обязательно должен случиться после события beforeBeginEdit.
                this._notify('itemClick', this._savedItemClickArgs, {bubbling: true});
            }

            resolve(eventResult);
        }).then((result) => {

            if (result === CONSTANTS.CANCEL) {
                if (this._savedItemClickArgs && this._isMounted) {
                    // Запись становится активной по клику, если не началось редактирование.
                    // Аргументы itemClick сохранены в состояние и используются для нотификации об активации элемента.
                    this._notify('itemActivate', this._savedItemClickArgs, {bubbling: true});
                }
                return result;
            }

            // Промис, который отстреляет, когда полноценно начнется редактирование и редактор отрисуется.
            this._pendingEditingRowPromise = MultiPromise.resolve<void>(['afterBeginEdit', 'editingRowReady']);

            if (isAdd && !((options && options.item) instanceof Model) && !((result && result.item) instanceof Model)) {
                return this.getSourceController().create().then((item) => {
                    if (item instanceof Model) {
                        return {item};
                    }
                    throw Error('BaseControl::create before add error! Source returned non Model.');
                }).catch((error: Error) => {
                    return this._processEditInPlaceError(error);
                });
            }

            return result;
        }).finally(() => {
            this._savedItemClickArgs = null;
        });
    },

    _afterBeginEditCallback(item: IEditableCollectionItem, isAdd: boolean): void {
        const isMounted = this._isMounted;
        return this._pendingEditingRowPromise.resolveStep('afterBeginEdit').then(() => {

            // Редактирование может запуститься при построении.
            if (isMounted) {
                this._notify('afterBeginEdit', [item.contents, isAdd]);

                if (this._listViewModel.getCount() > 1 && !isAdd) {
                    this.setMarkedKey(item.contents.getKey());
                }
            }

            if (this._pagingVisible && this._options.navigation.viewConfig.pagingMode === 'edge') {
                this._pagingVisible = false;
            }

            item.contents.subscribe('onPropertyChange', this._resetValidation);
            /*
             * TODO: KINGO
             * При начале редактирования нужно обновить операции наз записью у редактируемого элемента списка, т.к. в режиме
             * редактирования и режиме просмотра они могут отличаться. На момент события beforeBeginEdit еще нет редактируемой
             * записи. В данном месте цикл синхронизации itemActionsControl'a уже случился и обновление через выставление флага
             * _canUpdateItemsActions приведет к показу неактуальных операций.
             */
            _private.updateItemActions(this, this._options, item);

            this._pendingEditingRowPromise = null;
        }).then(() => {
            if (isMounted) {
                return this.scrollToItem(item.contents.getKey(), false, true);
            }
        }).then(() => {
            this._editInPlaceInputHelper.shouldActivate()
        });
    },

    _beforeEndEditCallback(item: Model, willSave: boolean, isAdd: boolean) {
        return Promise.resolve().then(() => {
            if (willSave) {
                // Валидайция запускается не моментально, а после заказанного для нее цикла синхронизации.
                // Такая логика необходима, если синхронно поменяли реактивное состояние, которое будет валидироваться и позвали валидацию.
                // В таком случае, первый цикл применит все состояния и только после него произойдет валидация.
                // _forceUpdate гарантирует, что цикл синхронизации будет, т.к. невозможно понять поменялось ли какое-то реактивное состояние.
                const submitPromise = this._validateController.deferSubmit();
                this._isPendingDeferSubmit = true;
                this._forceUpdate();
                return submitPromise.then((validationResult) => {
                    for (const key in validationResult) {
                        if (validationResult.hasOwnProperty(key) && validationResult[key]) {
                            return CONSTANTS.CANCEL;
                        }
                    }
                });
            }
        }).then((result) => {
            if (result === CONSTANTS.CANCEL) {
                return result;
            }
            const eventResult = this._notify('beforeEndEdit', [item, willSave, isAdd]);

            // Если пользователь не сохранил добавляемый элемент, используется платформенное сохранение.
            // Пользовательское сохранение потенциально может начаться только если вернули Promise
            const shouldUseDefaultSaving = willSave && (isAdd || item.isChanged()) && (
                !eventResult || (
                    eventResult !== CONSTANTS.CANCEL && !(eventResult instanceof Promise)
                )
            );

            return shouldUseDefaultSaving ? this._saveEditingInSource(item, isAdd) : eventResult;
        });
    },

    _afterEndEditCallback(item: IEditableCollectionItem, isAdd: boolean, willSave: boolean): void {
        this._notify('afterEndEdit', [item.contents, isAdd]);

        if (this._listViewModel.getCount() > 1) {
            if (this._markedKeyAfterEditing) {
                // если закрыли добавление записи кликом по другой записи, то маркер должен встать на 'другую' запись
                this.setMarkedKey(this._markedKeyAfterEditing);
                this._markedKeyAfterEditing = null;
            } else if (isAdd && willSave) {
                this.setMarkedKey(item.contents.getKey());
            } else if (_private.hasMarkerController(this)) {
                const controller = _private.getMarkerController(this);
                controller.setMarkedKey(controller.getMarkedKey());
            }
        }

        item.contents.unsubscribe('onPropertyChange', this._resetValidation);
        _private.updateItemActions(this, this._options);
    },

    _onEditingRowReady(e) {
        e.stopPropagation();
        this._pendingEditingRowPromise.resolveStep('editingRowReady');
    },

    _resetValidation() {
        this._validateController.setValidationResult(null);
    },

    isEditing(): boolean {
        return _private.isEditing(this);
    },

    beginEdit(options) {
        if (this._options.readOnly) {
            return Promise.reject('Control is in readOnly mode.');
        }
        return this._beginEdit(options);
    },

    beginAdd(options) {
        if (this._options.readOnly) {
            return Promise.reject('Control is in readOnly mode.');
        }
        return this._beginAdd(options, this._getEditingConfig().addPosition);
    },

    cancelEdit() {
        if (this._options.readOnly) {
            return Promise.reject('Control is in readOnly mode.');
        }
        return this._cancelEdit();
    },

    commitEdit() {
        if (this._options.readOnly) {
            return Promise.reject('Control is in readOnly mode.');
        }
        return this._commitEdit();
    },

    _startInitialEditing(editingConfig: Required<IEditableListOption['editingConfig']>) {
        const isAdd = !this._items.getRecordById(editingConfig.item.getKey());
        if (isAdd) {
            return this._beginAdd({ item: editingConfig.item }, editingConfig.addPosition, false);
        } else {
            return this._beginEdit({ item: editingConfig.item });
        }
    },

    _beginEdit(options) {
        _private.closeSwipe(this);
        this.showIndicator();
        return this._getEditInPlaceController().edit(options && options.item).finally(() => {
            this.hideIndicator();
        });
    },

    _beginAdd(options, addPosition) {
        _private.closeSwipe(this);
        this.showIndicator();
        return this._getEditInPlaceController().add(options && options.item, addPosition).then((addResult) => {
            if (!this._isMounted || (addResult && addResult.canceled)) {
                return addResult;
            }

            if (_private.hasSelectionController(this)) {
                const controller = _private.getSelectionController(this);
                controller.setSelection(controller.getSelection());
            }
        }).finally(() => {
            this.hideIndicator();
        });
    },

    _cancelEdit(force: boolean = false) {
        if (!this._editInPlaceController) {
            return Promise.resolve();
        }
        this.showIndicator();
        return this._getEditInPlaceController().cancel(force).finally(() => {
            if (_private.hasSelectionController(this)) {
                const controller = _private.getSelectionController(this);
                controller.setSelection(controller.getSelection());
            }
            this.hideIndicator();
        });
    },

    _commitEdit(commitStrategy?: 'hasChanges' | 'all') {
        if (!this._editInPlaceController) {
            return Promise.resolve();
        }
        this.showIndicator();
        return this._getEditInPlaceController().commit(commitStrategy).finally(() => {
            this.hideIndicator();
        });
    },

    _commitEditActionHandler(e, collectionItem) {
        return this.commitEdit().then((result) => {
            if (result && result.canceled) {
                return result;
            }
            const editingConfig = this._getEditingConfig();
            if (editingConfig.autoAddByApplyButton && collectionItem.isAdd) {
                return this._beginAdd({}, editingConfig.addPosition);
            } else {
                return result;
            }
        });
    },

    _cancelEditActionHandler(e, collectionItem) {
        return this.cancelEdit();
    },

    _onEditingRowKeyDown(e: SyntheticEvent<KeyboardEvent>, nativeEvent: KeyboardEvent) {
        const editNext = (item: Model | undefined, direction: 'top' | 'bottom') => {
            if (!item) {
                return Promise.resolve();
            }
            this._editInPlaceInputHelper.setInputForFastEdit(nativeEvent.target, direction);
            return this._beginEdit({ item });
        };

        switch (nativeEvent.keyCode) {
            case 13: // Enter
                return this._editingRowEnterHandler(e);
            case 27: // Esc
                // Если таблица находится в другой таблице, событие из внутренней таблицы не должно всплывать до внешней
                e.stopPropagation();
                return this._cancelEdit();
            case 38: // ArrowUp
                const prev = this._getEditInPlaceController().getPrevEditableItem();
                return editNext(prev?.contents, 'top');
            case 40: // ArrowDown
                const next = this._getEditInPlaceController().getNextEditableItem();
                return editNext(next?.contents, 'bottom');
        }
    },

    _editingRowEnterHandler(e: SyntheticEvent<KeyboardEvent>) {
        const editingConfig = this._getEditingConfig();
        const next = this._getEditInPlaceController().getNextEditableItem();
        const shouldEdit = editingConfig.sequentialEditing && !!next;
        const shouldAdd = !next && !shouldEdit && !!editingConfig.autoAdd && editingConfig.addPosition === 'bottom';
        return this._tryContinueEditing(shouldEdit, shouldAdd, next && next.contents);
    },

    _onRowDeactivated(e: SyntheticEvent, eventOptions: any): void {
        e.stopPropagation();

        if (eventOptions.isTabPressed) {
            const editingConfig = this._getEditingConfig();
            let next;
            let shouldEdit;
            let shouldAdd;

            if (eventOptions.isShiftKey) {
                next = this._getEditInPlaceController().getPrevEditableItem();
                shouldEdit = !!next;
                shouldAdd = editingConfig.autoAdd && !next && !shouldEdit && editingConfig.addPosition === 'top';
            } else {
                next = this._getEditInPlaceController().getNextEditableItem();
                shouldEdit = !!next;
                shouldAdd = editingConfig.autoAdd && !next && !shouldEdit && editingConfig.addPosition === 'bottom';
            }
            return this._tryContinueEditing(shouldEdit, shouldAdd, next && next.contents);
        }
    },

    _tryContinueEditing(shouldEdit, shouldAdd, item?: Model) {
        return this._commitEdit().then((result) => {
            if (result && result.canceled) {
                return result;
            }
            if (shouldEdit) {
                return this._beginEdit({ item });
            } else if (shouldAdd) {
                return this._beginAdd({}, this._getEditingConfig().addPosition);
            }
        });
    },

    _saveEditingInSource(item: Model, isAdd: boolean): Promise<void> {
        return this.getSourceController().update(item).then(() => {
            // После выделения слоя логики работы с источником данных в отдельный контроллер,
            // код ниже должен переехать в него.
            if (isAdd) {
                this._items.append([item]);
            }
        }).catch((error: Error) => {
            return this._processEditInPlaceError(error);
        });
    },

    _getEditingConfig(options = this._options): Required<IEditableListOption['editingConfig']> {
        const editingConfig = options.editingConfig || {};
        const addPosition = editingConfig.addPosition === 'top' ? 'top' : 'bottom';

        return {
            editOnClick: !!editingConfig.editOnClick,
            sequentialEditing: editingConfig.sequentialEditing !== false,
            addPosition,
            item: editingConfig.item,
            autoAdd: !!editingConfig.autoAdd,
            autoAddByApplyButton: editingConfig.autoAddByApplyButton === false ? false : !!(editingConfig.autoAddByApplyButton || editingConfig.autoAdd),
            toolbarVisibility: !!editingConfig.toolbarVisibility
        };
    },

    _processEditInPlaceError(error) {
        /*
         * в detail сейчас в многих местах редактирования по месту приходит текст из запроса
         * Не будем его отображать
         * TODO Убрать после закрытия задачи по написанию документа по правильному формированию текстов ошибок
         *  https://online.sbis.ru/doc/c8ff58ac-e6f7-4f0e-877a-e9cbbe661139
         */
        delete error.details;

        return this.__errorController.process({
            error,
            theme: this._options.theme,
            mode: dataSourceError.Mode.dialog
        }).then((errorConfig: dataSourceError.ViewConfig) => {
            this._children.errorContainer.show(errorConfig);
            error.errorProcessed = true;
            return Promise.reject(error);
        });
    },

    // endregion

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
        _private.openContextMenu(this, clickEvent, itemData);
    },

    /**
     * Обработчик долгого тапа
     * @param e
     * @param itemData
     * @param tapEvent
     * @private
     */
    _onItemLongTap(
        e: SyntheticEvent<Event>,
        itemData: CollectionItem<Model>,
        tapEvent: SyntheticEvent<MouseEvent>
    ): void {
        _private.updateItemActionsOnce(this, this._options);
        _private.openContextMenu(this, tapEvent, itemData);
    },

    /**
     * Обработчик клика по операции
     * @param event
     * @param action
     * @param itemData
     * @private
     */
    _onItemActionMouseDown(
        event: SyntheticEvent<MouseEvent>,
        action: IShownItemAction,
        itemData: CollectionItem<Model>
    ): void {
        if (!isLeftMouseButton(event)) {
            return;
        }
        event.stopPropagation();
        // TODO нужно заменить на item.getContents() при переписывании моделей. item.getContents() должен возвращать
        //  Record https://online.sbis.ru/opendoc.html?guid=acd18e5d-3250-4e5d-87ba-96b937d8df13
        const contents = _private.getPlainItemContents(itemData);
        const key = contents ? contents.getKey() : itemData.key;
        const item = this._listViewModel.getItemBySourceKey(key) || itemData;
        this.setMarkedKey(key);

        if (action && !action.isMenu && !action['parent@']) {
            _private.handleItemActionClick(this, action, event, item, false);
        } else {
            _private.openItemActionsMenu(this, action, event, item, false);
        }
    },

    /**
     * Обработчик клика по операции, необходимый для предотвращения срабатывания клика на записи в списке
     * @param event
     * @private
     */
    _onItemActionClick(event: SyntheticEvent<MouseEvent>) {
        event.stopPropagation();
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
            if (action) {
                const item = _private.getItemActionsController(this, this._options).getActiveItem();
                _private.handleItemActionClick(this, action, clickEvent, item, true);
            }
        }
    },

    /**
     * Обработчик закрытия выпадающего/контекстного меню
     * @private
     */
    _onItemActionsMenuClose(currentPopup): void {
        if (!this._destroyed) {
            _private.closeActionsMenu(this, currentPopup);
        }
    },

    _handleMenuActionMouseEnter(event: SyntheticEvent): void {
        _private.getItemActionsController(this, this._options).startMenuDependenciesTimer();
    },

    _handleMenuActionMouseLeave(event: SyntheticEvent): void {
        _private.getItemActionsController(this, this._options).stopMenuDependenciesTimer();
    },

    _itemMouseDown(event, itemData, domEvent) {
        let hasDragScrolling = false;
        this._mouseDownItemKey = this._options.useNewModel ? itemData.getContents().getKey() : itemData.key;
        if (this._options.columnScroll) {
            // Не должно быть завязки на горизонтальный скролл.
            // https://online.sbis.ru/opendoc.html?guid=347fe9ca-69af-4fd6-8470-e5a58cda4d95
            hasDragScrolling = this._children.listView.isColumnScrollVisible && this._children.listView.isColumnScrollVisible() && (
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
        // Если нажали по чекбоксу, то маркер проставим по клику на чекбокс
        let canBeMarked = this._mouseDownItemKey === key
            && (!this._options.editingConfig || (this._options.editingConfig && this._items.getCount() > 1))
            && !domEvent.target.closest('.js-controls-ListView__checkbox');

        // TODO изабвиться по задаче https://online.sbis.ru/opendoc.html?guid=f7029014-33b3-4cd6-aefb-8572e42123a2
        // Колбэк передается из explorer.View, чтобы не проставлять маркер перед проваливанием в узел
        if (this._options._needSetMarkerCallback) {
            canBeMarked = canBeMarked && this._options._needSetMarkerCallback(itemData.item, domEvent);
        }

        this._mouseDownItemKey = undefined;
        this._onLastMouseUpWasDrag = this._dndListController && this._dndListController.isDragging();
        this._notify('itemMouseUp', [itemData.item, domEvent.nativeEvent]);

        if (canBeMarked && !this._onLastMouseUpWasDrag) {
            // маркер устанавливается после завершения редактирования
            if (this._editInPlaceController?.isEditing()) {
                // TODO нужно перенести установку маркера на клик, т.к. там выполняется проверка для редактирования
                this._markedKeyAfterEditing = key;
            } else {
                this.setMarkedKey(key);
            }
        }
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

    // TODO удалить после выполнения наследования Explorer <- TreeControl <- BaseControl
    clearSelection(): void {
        _private.changeSelection(this, { selected: [], excluded: [] });
    },

    isAllSelected(): boolean {
        return _private.getSelectionController(this)?.isAllSelected();
    },

    // region move

    moveItems(selection: ISelectionObject, targetKey: CrudEntityKey, position: LOCAL_MOVE_POSITION): Promise<void> {
        return _private.getMoveController(this).move(selection, this._filter, targetKey, position);
    },

    moveItemUp(selectedKey: CrudEntityKey): Promise<void> {
        const sibling = _private.getMoveTargetItem(this, selectedKey, LOCAL_MOVE_POSITION.Before);
        const selection: ISelectionObject = {
            selected: [selectedKey],
            excluded: []
        };
        return _private.getMoveController(this).move(selection, {}, sibling, LOCAL_MOVE_POSITION.Before);
    },

    moveItemDown(selectedKey: CrudEntityKey): Promise<void> {
        const sibling = _private.getMoveTargetItem(this, selectedKey, LOCAL_MOVE_POSITION.After);
        const selection: ISelectionObject = {
            selected: [selectedKey],
            excluded: []
        };
        return _private.getMoveController(this).move(selection, {}, sibling, LOCAL_MOVE_POSITION.After);
    },

    moveItemsWithDialog(selection: ISelectionObject): Promise<void> {
        return _private.getMoveController(this).moveWithDialog(selection, this._options.filter);
    },

    // endregion move

    // region remove

    removeItems(selection: ISelectionObject): Promise<void> {
        return _private.getRemoveController(this).remove(selection, this._options.filter);
    },

    removeItemsWithConfirmation(selection: ISelectionObject): Promise<void> {
        return _private.getRemoveController(this).removeWithConfirmation(selection, this._options.filter);
    },

    // endregion remove

    _onViewKeyDown(event) {
        // Если фокус выше ColumnsView, то событие не долетит до нужного обработчика, и будет сразу обработано BaseControl'ом
        // передаю keyDownHandler, чтобы обработать событие независимо от положения фокуса.
        if (!_private.isBlockedForLoading(this._loadingIndicatorState) && (!this._options._keyDownHandler || !this._options._keyDownHandler(event))) {
            const key = event.nativeEvent.keyCode;
            const dontStop = key === 17 // Ctrl
                || key === 33 // PageUp
                || key === 34 // PageDown
                || key === 35 // End
                || key === 36; // Home
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
            _private.showActions(this);
        }

        // TODO dnd при наследовании TreeControl <- BaseControl не нужно будет событие
        if (this._dndListController && this._dndListController.isDragging()) {
            this._notify('draggingItemMouseMove', [itemData, nativeEvent]);
        }
    },
    _itemMouseLeave(event, itemData, nativeEvent) {
        this._notify('itemMouseLeave', [itemData.item, nativeEvent]);
        if (this._dndListController) {
            this._unprocessedDragEnteredItem = null;

            // TODO dnd при наследовании TreeControl <- BaseControl не нужно будет событие
            if (this._dndListController && this._dndListController.isDragging()) {
                this._notify('draggingItemMouseLeave', [itemData, nativeEvent]);
            }
        }
    },
    _sortingChanged(event, propName) {
        const newSorting = _private.getSortingOnChange(this._options.sorting, propName);
        event.stopPropagation();
        this._notify('sortingChanged', [newSorting]);
    },

    _updatePagingPadding(): void {
        // Сюда может попасть из beforePaint, когда pagingVisible уже поменялся на true (стрельнуло событие от скролла),
        // но вот сам pagingPaddingContainer отрисуется лишь в следующем цикле синхронизации
        // https://online.sbis.ru/opendoc.html?guid=b6939810-b640-41eb-8139-b523a8df16df
        // Поэтому дополнительно проверяем на this._children.pagingPaddingContainer
        if (!this._pagingPadding && this._children.pagingPaddingContainer) {
            this._pagingPadding = this._children.pagingPaddingContainer.offsetHeight;
        }
    },

    _mouseEnter(event): void {
        // В chrome/safari mouseEnter происходит всегда, сразу после touch
        if (!detection.isMobilePlatform) {
            _private.updateItemActionsOnce(this, this._options);
        }

        if (this._documentDragging) {
            this._insideDragging = true;

            this._dragEnter(this._getDragObject());
        }

        // нельзя делать это в процессе обновления или загрузки
        if (!this._loadingState && !this._updateInProgress && !this._scrollController?.getScrollTop()) {
            _private.attachLoadTopTriggerToNullIfNeed(this, this._options);
        }
        if (this._hideTopTrigger && !this._needScrollToFirstItem) {
            this._hideTopTrigger = false;
        }

        if (!this._pagingVisible) {
            _private.initPaging(this);
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
        event.stopPropagation();
        this._notify('tagClick', [dispItem, columnIndex, event]);
    },

    /**
     * Хандлер наведения на Tag в BaseControl.wml
     * @private
     */
    _onTagHoverHandler(event: Event, dispItem: CollectionItem<Model>, columnIndex: number): void {
        this._notify('tagHover', [dispItem, columnIndex, event]);
    },

    _applyPagingNavigationState(params): void {
        const options = {...this._options};
        const newNavigation = cClone(this._options.navigation);
        if (params.pageSize) {
            newNavigation.sourceConfig.pageSize = params.pageSize;
        }
        if (params.page) {
            newNavigation.sourceConfig.page = params.page - 1;
            newNavigation.sourceConfig.pageSize = this._currentPageSize;
        }

        options.navigation = newNavigation;

        const updateData = () => {
            this._sourceController.updateOptions(options);
            const result = _private.reload(this, this._options);
            this._shouldRestoreScrollPosition = true;
            return result;
        };

        if (_private.isEditing(this)) {
            this._cancelEdit().then((result) => {
                return !(result && result.canceled) ? updateData() : result;
            });
        } else {
            return updateData();
        }
    },

    recreateSourceController(options): void {
        if (this._sourceController) {
            this._sourceController.destroy();
        }
        this._sourceController = _private.getSourceController(this, options);
    },

    updateSourceController(options): void {
        this._sourceController?.updateOptions(options);
    },

    /**
     * Возвращает видимость опций записи.
     * @private
     */
    _isVisibleItemActions(showActions: boolean, itemActionsMenuId: number): boolean {
        return (showActions || this._options.useNewModel) &&
            (!itemActionsMenuId || this._options.itemActionsVisibility === 'visible');
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
        _private.closeActionsMenu(this);
    },

    /**
     * Обработчик свайпа по записи. Показывает операции по свайпу
     * @param e
     * @param item
     * @param swipeEvent
     * @private
     */
    _onItemSwipe(e: SyntheticEvent<Event>, item: CollectionItem<Model>, swipeEvent: SyntheticEvent<ISwipeEvent>): void {
        if (item['[Controls/_display/GroupItem]']) {
            return;
        }
        swipeEvent.stopPropagation();
        const key = _private.getPlainItemContents(item).getKey();
        const itemContainer = (swipeEvent.target as HTMLElement).closest('.controls-ListView__itemV');
        const swipeContainer = _private.getSwipeContainerSize(itemContainer as HTMLElement);
        let itemActionsController: ItemActionsController;

        if (swipeEvent.nativeEvent.direction === 'left') {
            this.setMarkedKey(key);
            _private.updateItemActionsOnce(this, this._options);
            itemActionsController = _private.getItemActionsController(this, this._options);
            itemActionsController?.activateSwipe(key, swipeContainer?.width, swipeContainer?.height);
        }
        if (swipeEvent.nativeEvent.direction === 'right') {
            // Тут не надо инициализировать контроллер, если он не проинициализирован
            const swipedItem = this._itemActionsController?.getSwipeItem();
            if (swipedItem) {
                this._itemActionsController.startSwipeCloseAnimation();
                this._listViewModel.nextVersion();

                // Для сценария, когда свайпнули одну запись и потом свайпнули вправо другую запись
                if (swipedItem !== item) {
                    this.setMarkedKey(key);
                }
            } else {
                // After the right swipe the item should get selected.
                if (_private.isItemsSelectionAllowed(this._options)) {
                    const newSelection = _private.getSelectionController(this).toggleItem(key);
                    _private.changeSelection(this, newSelection);
                }
                this._notify('checkboxClick', [key, item.isSelected()]);

                // Animation should be played only if checkboxes are visible.
                if (_private.hasSelectionController(this)) {
                    _private.getSelectionController(this).startItemAnimation(key);
                }
                this.setMarkedKey(key);
            }
        }
        if (!this._options.itemActions && item.isSwiped()) {
            this._notify('itemSwipe', [item, swipeEvent, swipeContainer?.clientHeight]);
        }
    },

    _updateItemActionsOnItem(event: SyntheticEvent<Event>, itemKey: string | number, itemWidth: number): void {
        event.stopImmediatePropagation();
        const itemActionsController = _private.getItemActionsController(this);
        itemActionsController.updateItemActions(itemKey, itemWidth);
    },

    /**
     * Обработчик, выполняемый после окончания анимации свайпа по опциям записи
     * @param e
     * @private
     */
    _onActionsSwipeAnimationEnd(e: SyntheticEvent<IAnimationEvent>): void {
        if (e.nativeEvent.animationName === 'itemActionsSwipeClose') {
            const itemActionsController = _private.getItemActionsController(this, this._options);
            const item = itemActionsController.getSwipeItem();
            if (item) {
                if (!this._options.itemActions) {
                    this._notify('itemSwipe', [item, e]);
                }
                itemActionsController.deactivateSwipe();
            }
        }
    },

    /**
     * Обработчик, выполняемый после окончания анимации свайпа вправо по записи
     * @param e
     * @private
     */
    _onItemSwipeAnimationEnd(e: SyntheticEvent<IAnimationEvent>): void {
        if (_private.hasSelectionController(this) && e.nativeEvent.animationName === 'rightSwipe') {
            _private.getSelectionController(this).stopItemAnimation();
        }
    },

    _createNewModel(items, modelConfig, modelName): void {
        // Подразумеваем, что Controls/display уже загружен. Он загружается при подключении
        // библиотеки Controls/listRender
        if (typeof modelName !== 'string') {
            throw new TypeError('BaseControl: model name has to be a string when useNewModel is enabled');
        }
        return diCreate(modelName, {...modelConfig, collection: items, unique: true});
    },

    _stopBubblingEvent(event: SyntheticEvent<Event>): void {
        // В некоторых кейсах (например ScrollViewer) внутри списков могут находиться
        // другие списки, которые также будут нотифицировать события управления скроллом и тенью
        // Необходимо их останавливать, чтобы скроллом управлял только самый верхний список
        event.stopPropagation();
    },

    _updateItemsHeights(): void {
        if (this._scrollController) {
            const itemsHeights = getItemsHeightsData(this._getItemsContainer());
            this._scrollController.updateItemsHeights(itemsHeights);
            const result = this._scrollController.update({
                params: {
                    scrollHeight: _private.getViewSize(this),
                    clientHeight: this._viewportSize
                }
            });
            _private.handleScrollControllerResult(this, result);
        }
    },

    _itemsContainerReadyHandler(_: SyntheticEvent<Event>, itemsContainerGetter: Function): void {
        this._getItemsContainer = itemsContainerGetter;
        this._viewReady = true;
        if (this._isScrollShown) {
            this._viewSize = _private.getViewSize(this, true);
            this._updateItemsHeights();
        }
    },

    /**
     * Вызывает деактивацию свайпа когда список теряет фокус
     * @private
     */
    _onListDeactivated() {
        if (!this._itemActionsMenuId) {
            _private.closeSwipe(this);
        }
    },

    _onCloseSwipe() {
        if (!this._itemActionsMenuId) {
            _private.closeSwipe(this);
        }
    },

    // TODO: вынести в батчер?
    // при добавлении групп и листьев в деревьях, записи добавляются по одиночке, а не все разом.
    // Если обрабатывать все это по отдельности, не собирая в одну пачку, то алгоритмы виртуального скролла начинают работать некорректно
    startBatchAdding(direction: IDirection): void {
        this._addItemsDirection = direction;
        this._addItems = [];
    },

    // TODO: вынести в батчер?
    stopBatchAdding(): void {
        const direction = this._addItemsDirection;
        this._addItemsDirection = null;

        // при 0 записей не надо тревожить виртуальный скролл, т.к. 0 записей не вызывает перестройку DOM
        // в итоге ScrollContainer, который реагирует на afterRender beforeRender начинает восстанавливать скролл не
        // по отрисовке записей а по другой перерисовке списка, например появлению пэйджинга
        if (this._addItems && this._addItems.length) {
            this._scrollController.handleAddItems(this._addItemsIndex, this._addItems, direction);
        }

        this._addItems = [];
        this._addItemsIndex = null;
    },

    _registerObserver(): void {
        if (!this._observerRegistered && this._children.scrollObserver) {
            // @ts-ignore
            this._children.scrollObserver.startRegister([this._children.scrollObserver]);
            this._observerRegistered = true;
        }
    },

    _registerIntersectionObserver(): void {
        this._intersectionObserver = new EdgeIntersectionObserver(
            this,
            this._intersectionObserverHandler.bind(this),
            this._children.topVirtualScrollTrigger,
            this._children.bottomVirtualScrollTrigger);
    },

    _intersectionObserverHandler(eventName) {
        switch (eventName) {
            case 'bottomIn':
                this.triggerVisibilityChangedHandler('down', true);
                break;
            case 'topIn':
                this.triggerVisibilityChangedHandler('up', true);
                break;
            case 'bottomOut':
                this.triggerVisibilityChangedHandler('down', false);
                break;
            case 'topOut':
                this.triggerVisibilityChangedHandler('up', false);
                break;
        }
    },

    _observeScrollHandler(_: SyntheticEvent<Event>, eventName: string, params: IScrollParams): void {
        switch (eventName) {
            case 'scrollMoveSync':
                this.scrollMoveSyncHandler(params);
                break;
            case 'viewportResize':
                this.viewportResizeHandler(params.clientHeight, params.rect, params.scrollTop);
                break;
            case 'virtualScrollMove':
                _private.throttledVirtualScrollPositionChanged(this, params);
                break;
            case 'canScroll':
                this.canScrollHandler(params);
                break;
            case 'scrollMove':
                this.scrollMoveHandler(params);
                break;
            case 'cantScroll':
                this.cantScrollHandler(params);
                break;
        }
    },

    _shouldShowLoadingIndicator(position: 'beforeEmptyTemplate' | 'afterList' | 'inFooter'): boolean {
        // Глобальный индикатор загрузки при пустом списке должен отображаться поверх emptyTemplate.
        // Если расположить индикатор в подвале, то он будет под emptyTemplate т.к. emptyTemplate выводится до подвала.
        // В таком случае выводим индикатор над списком.
        // FIXME: https://online.sbis.ru/opendoc.html?guid=886c7f51-d327-4efa-b998-7cf94f5467cb
        // Также, не должно быть завязки на горизонтальный скролл.
        // https://online.sbis.ru/opendoc.html?guid=347fe9ca-69af-4fd6-8470-e5a58cda4d95
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

    getDndListController(): DndController {
        return this._dndListController;
    },

    _isPagingPaddingFromOptions(): boolean {
        return !(this._options.navigation &&
            this._options.navigation.viewConfig &&
            (this._options.navigation.viewConfig.pagingMode === 'end' ||
                this._options.navigation.viewConfig.pagingPadding === 'null' ||
                this._options.navigation.viewConfig.pagingPadding === null
            )
        );
    },

    _isPagingPadding(): boolean {
        return !(detection.isMobileIOS || !this._isPagingPaddingFromOptions());
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
            this._dndListController = _private.createDndListController(this._listViewModel, this._options);
        }

        const draggedItem = this._listViewModel.getItemBySourceKey(draggedKey);
        this._dndListController.startDrag(draggedItem, dragObject.entity);

        // Cобытие mouseEnter на записи может сработать до dragStart.
        // И тогда перемещение при наведении не будет обработано.
        // В таком случае обрабатываем наведение на запись сейчас.
        // TODO: убрать после выполнения https://online.sbis.ru/opendoc.html?guid=0a8fe37b-f8d8-425d-b4da-ed3e578bdd84
        if (this._unprocessedDragEnteredItem) {
            this._processItemMouseEnterWithDragNDrop(this._unprocessedDragEnteredItem);
        }
    },

    _dragLeave(): void {
        // Это функция срабатывает при перетаскивании скролла, поэтому проверяем _dndListController
        if (this._dndListController && this._dndListController.isDragging()) {
            const draggableItem = this._dndListController.getDraggableItem();
            if (draggableItem && this._listViewModel.getItemBySourceKey(draggableItem.getContents().getKey())) {
                const newPosition = this._dndListController.calculateDragPosition({targetItem: null});
                this._dndListController.setDragPosition(newPosition);
            } else {
                // если перетаскиваемого элемента нет в модели, значит мы перетащили элемент в другой список
                this._dndListController.endDrag();
            }
        }
    },

    _dragEnter(dragObject): void {
        // если мы утащим в другой список, то в нем нужно создать контроллер
        if (!this._dndListController) {
            this._dndListController = _private.createDndListController(this._listViewModel, this._options);
        }
        if (dragObject && cInstance.instanceOfModule(dragObject.entity, 'Controls/dragnDrop:ItemsEntity')) {
            const dragEnterResult = this._notify('dragEnter', [dragObject.entity]);

            if (cInstance.instanceOfModule(dragEnterResult, 'Types/entity:Record')) {
                const lastItem = this._listViewModel.getLast();
                const startPosition = {
                    index: this._listViewModel.getIndex(lastItem),
                    dispItem: lastItem,
                    position: 'after'
                };

                const draggingItemProjection = this._listViewModel.createItem({contents: dragEnterResult});
                this._dndListController.setDraggedItems(dragObject.entity, draggingItemProjection);

                // задаем изначальную позицию в другом списке
                this._dndListController.setDragPosition(startPosition);
            } else if (dragEnterResult === true) {
                this._dndListController.setDraggedItems(dragObject.entity);
            }
        }
    },

    _processItemMouseEnterWithDragNDrop(itemData): void {
        let dragPosition;
        if (this._dndListController.isDragging()) {
            const targetItem = this._options.useNewModel ? itemData : itemData.dispItem;
            dragPosition = this._dndListController.calculateDragPosition({targetItem});
            if (dragPosition) {
                const changeDragTarget = this._notify('changeDragTarget', [this._dndListController.getDragEntity(), dragPosition.dispItem.getContents(), dragPosition.position]);
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
            if (targetPosition && targetPosition.dispItem) {
                dragEndResult = this._notify('dragEnd', [dragObject.entity, targetPosition.dispItem.getContents(), targetPosition.position]);
            }

            // После окончания DnD, не нужно показывать операции, до тех пор, пока не пошевелим мышкой.
            // Задача: https://online.sbis.ru/opendoc.html?guid=9877eb93-2c15-4188-8a2d-bab173a76eb0
            _private.hideActions(this);
        }

        const endDrag = () => {
            const targetPosition = this._dndListController.getDragPosition();
            const draggableItem = this._dndListController.getDraggableItem();
            this._dndListController.endDrag();

            // перемещаем маркер только если dragEnd сработал в списке в который перетаскивают
            if (this._options.markerVisibility !== 'hidden' && targetPosition && draggableItem && this._insideDragging) {
                const moveToCollapsedNode = targetPosition.position === 'on'
                    && targetPosition.dispItem instanceof TreeItem
                    && !targetPosition.dispItem.isExpanded();
                // Ставим маркер на перетаксиваемый элемент всегда, за исключением ситуации
                // когда перетаскиваем запись в свернутый узел
                if (!moveToCollapsedNode) {
                    const draggedKey = draggableItem.getContents().getKey();
                    _private.changeMarkedKey(this, draggedKey);
                }
            }

            this._dndListController = null;
        };

        // Это функция срабатывает при перетаскивании скролла, поэтому проверяем _dndListController
        // endDrag нужно вызывать только после события dragEnd,
        // чтобы не было прыжков в списке, если асинхронно меняют порядок элементов
        if (this._dndListController) {
            if (dragEndResult instanceof Promise) {
                _private.showIndicator(this);
                dragEndResult.finally(() => {
                    endDrag();
                    _private.hideIndicator(this);
                });
            } else {
                endDrag();
            }
        }

        this._insideDragging = false;
        this._documentDragging = false;
        this._draggedKey = null;
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
BaseControl._theme = ['Controls/Classes', 'Controls/list', 'Controls/itemActions'];

BaseControl.getDefaultOptions = function() {
    return {
        attachLoadTopTriggerToNull: true,
        uniqueKeys: true,
        multiSelectVisibility: 'hidden',
        multiSelectPosition: 'default',
        markerVisibility: 'onactivated',
        style: 'default',
        selectedKeys: defaultSelectedKeys,
        excludedKeys: defaultExcludedKeys,
        loadingIndicatorTemplate: 'Controls/list:LoadingIndicatorTemplate',
        continueSearchTemplate: 'Controls/list:ContinueSearchTemplate',
        stickyHeader: true,
        virtualScrollConfig: {},
        filter: {},
        itemActionsVisibility: 'onhover',
        searchValue: '',
        moreFontColorStyle: 'listMore'
    };
};
export = BaseControl;
