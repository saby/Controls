import {IControlOptions} from 'UI/Base';
import {Collection} from 'Controls/display';
import VirtualScroll from './ScrollContainer/VirtualScroll';
import {Record} from 'Types/entity';
import {IObservable} from 'Types/collection';
import {
    IItemsHeights,
    IPlaceholders,
    IRange,
    IDirection,
    ITriggerState
} from './ScrollContainer/interfaces';
import InertialScrolling from './resources/utils/InertialScrolling';
import {detection} from 'Env/Env';
import {throttle} from 'Types/function';
import {VirtualScrollHideController, VirtualScrollController} from 'Controls/display';

const SCROLLMOVE_DELAY = 150;
const TRIGGER_VISIBILITY_DELAY = 101;
const LOADING_INDICATOR_SHOW_TIMEOUT = 2000;

interface IScrollParams {
    clientHeight: number;
    scrollTop: number;
    scrollHeight: number;
    rect?: DOMRect;
    applyScrollTopCallback?: Function;
}

interface ICompatibilityOptions {
    useNewModel: boolean;
}

export interface IOptions extends IControlOptions, ICompatibilityOptions {
    virtualScrollConfig: {
        pageSize?: number;
        segmentSize?: number;
        mode?: 'remove' | 'hide';
        itemHeightProperty?: string;
        viewportHeight?: number;
    };
    needScrollCalculation: boolean;
    collection: Collection<Record>;
    activeElement: string | number;
    _triggerPositionCoefficient: number;
    _notify: (eventName: string, args?: unknown[], options?: { bubbling?: boolean }) => unknown;
}

interface IScrollTriggers {
    topVirtualScrollTrigger?: HTMLElement;
    bottomVirtualScrollTrigger?: HTMLElement;
    topLoadTrigger?: HTMLElement;
    bottomLoadTrigger?: HTMLElement;
    scrollObserver?: HTMLElement;
}

const SCROLL_TRIGGERS: Array<keyof IScrollTriggers> = [
    "topVirtualScrollTrigger",
    "bottomVirtualScrollTrigger",
    "topLoadTrigger",
    "bottomLoadTrigger",
    "scrollObserver"
];
/**
 * Контейнер управляющий операциями скролла в списке.
 * @class Controls/_list/ScrollController/ScrollController
 * @control
 * @private
 * @author Авраменко А.С.
 */
export default class ScrollController {

    // В браузерах кроме хрома иногда возникает ситуация, что смена видимости триггера срабатывает с задержкой
    // вследствие чего получаем ошибку в вычислениях нового range и вообше делаем по сути
    // лишние пересчеты, например: https://online.sbis.ru/opendoc.html?guid=ea354034-fd77-4461-a368-1a8019fcb0d4
    // TODO: этот код должен быть убран после
    // https://online.sbis.ru/opendoc.html?guid=702070d4-b401-4fa6-b457-47287e44e0f4
    private get _calculatedTriggerVisibility(): ITriggerState {
        return {
            up: this._triggerOffset >= this._lastScrollTop - this._container.offsetTop,
            down: this._lastScrollTop + this._viewportHeight >= this._viewHeight - this._triggerOffset
        };
    }
    protected _triggers: IScrollTriggers;
    private _observerRegistered: boolean = false;
    private _container: HTMLElement;
    private _virtualScroll: VirtualScroll;
    private _itemsContainerGetter: Function;

    private _viewHeight: number = 0;
    private _viewportHeight: number = 0;
    private _triggerOffset: number = 0;
    private _lastScrollTop: number = 0;

    private _updateShadowModeAfterMount: Function|null = null;

    private _updateShadowModeAfterMount: Function|null = null;
    private _triggerVisibility: ITriggerState = {up: false, down: false};

    private _restoreScrollResolve: Function;
    private _checkTriggerVisibilityTimeout: NodeJS.Timeout;

    private _afterRenderCallbacks: Function[];
    private _isRendering: boolean = false;

    private _indicatorState: IDirection;
    private _indicatorTimeout: NodeJS.Timeout;

    private _addItemsDirection: IDirection;
    private _addItemsIndex: number;
    private _addItems: object[] = [];

    // Флаг, который необходимо включать, чтобы не реагировать на скроллы происходящие вследствие
    // подскроллов создаваемых самим контролом (scrollToItem, восстановление позиции скролла после перерисовок)
    private _fakeScroll: boolean;

    private _isMounted: boolean = false;

    // Сущность управляющая инерционным скроллингом на мобильных устройствах
    private _inertialScrolling: InertialScrolling = new InertialScrolling();

    protected _options: any;

    private _callbacks: any;

    private _throttledPositionChanged: Function = throttle((params) => {
        const rangeShiftResult = this._virtualScroll.shiftRangeToScrollPosition(params.scrollTop);
        this._notifyPlaceholdersChanged(rangeShiftResult.placeholders);
        this._setCollectionIndices(this._options.collection, rangeShiftResult.range, false,
            this._options.needScrollCalculation);
        this._doAfterRender(params.applyScrollTopCallback);
    }, SCROLLMOVE_DELAY, true);

    constructor(options: any) {
        this._options = {...ScrollController.getDefaultOptions(), ...options};
        this._initModelObserving(options);
        this._initVirtualScroll(options);
        this._callbacks = options.callbacks;
    }

    protected _registerObserver(): void {
        if (!this._observerRegistered && this._triggers) {
            // @ts-ignore
            this._triggers.scrollObserver.startRegister(this._triggers);
            this._observerRegistered = true;
        }
    }

    afterMount(container: HTMLElement, triggers: IScrollTriggers): void {
        this._isMounted = true;
        this._setContainer(container);
        if (this._container) {
            this._setTriggers(triggers);
            this._viewResize(this._container.offsetHeight, false);
            this.registerObserver();
            this._afterRenderHandler();
            if (this._updateShadowModeAfterMount) {
                this._updateShadowModeAfterMount();
                this._updateShadowModeAfterMount = null;
            }
        }
    }

    update(options: IOptions): void {
        if (options.collection && this._options.collection !== options.collection) {
            this._initModelObserving(options);
            if (!this._virtualScroll || options.virtualScrollConfig) {
                this._initVirtualScroll(options);
            }
            this._options.collection = options.collection;
        }

        if (this._indicatorState) {
            this._indicatorTimeout = setTimeout(() => {
                this._callbacks.changeIndicatorState(true, this._indicatorState);
            }, LOADING_INDICATOR_SHOW_TIMEOUT);
        }
        if (options.activeElement) {
            this._options.activeElement = options.activeElement;
        }
        this._isRendering = true;
    }

    registerObserver(): void {
        if (this._options.needScrollCalculation) {
            this._registerObserver();
        }
    }

    saveScrollPosition(): void {
        if (this._virtualScroll.isNeedToRestorePosition) {
            this._notify('saveScrollPosition', [], {bubbling: true});
        }
    }

    afterRender(): void {
        this._isRendering = false;
        this._afterRenderHandler();
    }

    reset(): void {
        if (this._checkTriggerVisibilityTimeout) {
            clearTimeout(this._checkTriggerVisibilityTimeout);
        }
        // TODO убрать проверку в https://online.sbis.ru/opendoc.html?guid=fb8a3901-bddf-4552-ae9a-ed0299d3e46f
        if (!this._options.collection.destroyed) {
            this._options.collection.unsubscribe('onListChange', this._collectionChangedHandler);
            this._options.collection.unsubscribe('onCollectionChange', this._collectionChangedHandler);
        }
    }

    itemsContainerReady(itemsContainerGetter: Function): void {
        this._itemsContainerGetter = itemsContainerGetter;
    }

    viewResize(container: HTMLElement): void {
        this._setContainer(container);
        this._viewResize(this._container.offsetHeight);
        // TODO Совместимость необходимо удалить после переписывания baseControl
        this._notify('viewResize');
    }

    observeScroll(eventName: string, params: IScrollParams): void {
        switch (eventName) {
            case 'virtualPageBottomStart':
                this._triggerVisibilityChanged('down', true, params);
                break;
            case 'virtualPageTopStart':
                this._triggerVisibilityChanged('up', true, params);
                break;
            case 'virtualPageBottomStop':
                this._triggerVisibilityChanged('down', false, params);
                break;
            case 'virtualPageTopStop':
                this._triggerVisibilityChanged('up', false, params);
                break;
            case 'scrollMoveSync':
                this._scrollPositionChanged(params);
                break;
            case 'viewportResize':
                this._viewportResize(params.clientHeight);
                this._callbacks.viewportResize(params.clientHeight, params.rect);
                break;
            case 'virtualScrollMove':
                this._scrollBarPositionChanged(params);
                break;
            case 'canScroll':
            case 'scrollResize':
            case 'scrollMove':
            case 'cantScroll':
                this._callbacks[eventName](params as IScrollParams);
                break;
        }
    }

    private __getItemsContainer(): HTMLElement {
        if (this._itemsContainerGetter) {
            return this._itemsContainerGetter();
        }
    }

    startBatchAdding(direction: IDirection): void {
        this._addItemsDirection = direction;
    }

    stopBatchAdding(): void {
        const direction = this._addItemsDirection;
        this._addItemsDirection = null;

        // при 0 записей не надо тревожить виртуальный скролл, т.к. 0 записей не вызывает перестройку DOM
        // в итоге ScrollContainer, который реагирует на afterRender beforeRender начинает восстанавливать скролл не
        // по отрисовке записей а по другой перерисовке списка, например появлению пэйджинга
        if (this._addItems && this._addItems.length) {
            this._itemsAddedHandler(this._addItemsIndex, this._addItems, direction);
        }

        this._addItems = [];
        this._addItemsIndex = null;
    }

    /**
     * Функция подскролла к элементу
     * @param {string | number} key
     * @param {boolean} toBottom
     * @param {boolean} force
     * @remark Функция подскролливает к записи, если это возможно, в противном случае вызовется перестроение
     * от элемента
     */
    scrollToItem(key: string | number, toBottom: boolean = true, force: boolean = false): Promise<void> {
        const index = this._options.collection.getIndexByKey(key);

        if (index !== -1) {
            return new Promise((resolve) => {
                const scrollCallback = () => {
                    // TODO Убрать работу с DOM, сделать через получение контейнера по его id из _children
                    // логического родителя, который отрисовывает все элементы
                    // https://online.sbis.ru/opendoc.html?guid=942e1a1d-15ee-492e-b763-0a52d091a05e
                    const itemsContainer = this.__getItemsContainer();
                    const itemContainer = this._virtualScroll.getItemContainerByIndex(index, itemsContainer);

                    if (itemContainer) {
                        this._fakeScroll = true;
                        this._notify('scrollToElement', [{
                            itemContainer, toBottom, force
                        }], {bubbling: true});
                    }

                    resolve();
                };

                if (this._virtualScroll.canScrollToItem(index, toBottom, force)) {
                    scrollCallback();
                } else if (force) {
                    this._inertialScrolling.callAfterScrollStopped(() => {
                        if (this._virtualScroll.rangeChanged) {
                            // Нельзя менять диапазон отображемых элементов во время перерисовки
                            // поэтому нужно перенести scrollToItem на следующий цикл синхронизации (после отрисовки)
                            // Для этого используем _scrollToItemAfterRender.
                            // https://online.sbis.ru/opendoc.html?guid=2a97761f-e25a-4a10-9735-ded67e36e527
                            this._doAfterRender(() => {
                                this.scrollToItem(key, toBottom, force).then(resolve);
                            });
                        } else {
                            this._doAfterRender(() => {
                                const rangeShiftResult = this._virtualScroll
                                    .resetRange(index, this._options.collection.getCount());
                                this._notifyPlaceholdersChanged(rangeShiftResult.placeholders);
                                this._setCollectionIndices(
                                    this._options.collection,
                                    rangeShiftResult.range,
                                    false,
                                    this._options.needScrollCalculation
                                );

                                // Скролл нужно восстанавливать после отрисовки, для этого используем
                                // _restoreScrollResolve
                                this._restoreScrollResolve = scrollCallback;
                            });
                        }
                    });
                } else {
                    resolve();
                }
            });
        } else {
            return Promise.resolve();
        }
    }

    checkTriggerVisibilityWithTimeout(): void {
        if (this._checkTriggerVisibilityTimeout) {
            clearTimeout(this._checkTriggerVisibilityTimeout);
        }
        this._checkTriggerVisibilityTimeout = setTimeout(() => {
            this._checkTriggerVisibility();
            this._checkTriggerVisibilityTimeout = null;
        }, TRIGGER_VISIBILITY_DELAY);
    }

    /**
     * Проверка на видимость триггеров
     * @remark Иногда, уже после загрузки данных триггер остается видимым, в таком случае вызвать повторную загрузку
     * данных
     */
    private _checkTriggerVisibility(): void {
        // TODO будет решено после https://online.sbis.ru/opendoc.html?guid=a88a5697-5ba7-4ee0-a93a-221cce572430
        // Не нужно запускать проверку на видимость триггеров, если контрол лежит в display: none контейнере
        // например в switchableArea
        if (!this._afterRenderCallbacks && !this._container.closest('.ws-hidden')) {
            if (this._calculatedTriggerVisibility.down) {
                this._recalcToDirection('down');
            }

            if (this._calculatedTriggerVisibility.up) {
                this._recalcToDirection('up');
            }
        }
    }

    private _initModelObserving(options: IOptions): void {
        if (options.collection) {
            this._subscribeToCollectionChange(options.collection, options.useNewModel);

            if (options.useNewModel) {
                ScrollController._setCollectionIterator(options.collection, options.virtualScrollConfig.mode);
            }
        }
    }

    private _initVirtualScroll(options: IOptions): void {
        if (options.collection) {
            this._virtualScroll = new VirtualScroll(
                options.virtualScrollConfig,
                {
                    viewport: this._viewportHeight,
                    scroll: this._viewHeight,
                    trigger: this._triggerOffset
                });

            let itemsHeights: Partial<IItemsHeights>;

            const initialIndex = typeof options.activeElement !== 'undefined' ?
                options.collection.getIndexByKey(options.activeElement) : 0;

            if (options?.virtualScrollConfig?.itemHeightProperty) {
                this._virtualScroll.applyContainerHeightsData({
                    viewport: options.virtualScrollConfig.viewportHeight
                });

                itemsHeights = {
                    itemsHeights: []
                };

                options.collection.each((item, index) => {
                    itemsHeights.itemsHeights[index] = item
                        .getContents()
                        .get(options.virtualScrollConfig.itemHeightProperty);
                });
            }

            const rangeShiftResult = this._virtualScroll
                .resetRange(initialIndex, options.collection.getCount(), itemsHeights);
            this._notifyPlaceholdersChanged(rangeShiftResult.placeholders);
            this._setCollectionIndices(options.collection, rangeShiftResult.range, true,
                options.needScrollCalculation);

            if (options.activeElement) {
                this._restoreScrollResolve = () => {
                    this.scrollToItem(options.activeElement, false, true);
                };
            }
        }
    }

    private _subscribeToCollectionChange(collection: Collection<Record>, useNewModel: boolean): void {
        if (useNewModel) {
            collection.subscribe('onCollectionChange', (...args: unknown[]) => {
                this._collectionChangedHandler.apply(this, [args[0], null, ...args.slice(1)]);
            });
        } else {
            collection.subscribe('onListChange', this._collectionChangedHandler);
        }
    }

    private _setCollectionIndices(
        collection: Collection<Record>,
        {start, stop}: IRange,
        force?: boolean,
        needScrollCalculation?: boolean
    ): void {
        if (needScrollCalculation) {
            let collectionStartIndex: number;
            let collectionStopIndex: number;

            if (collection.getViewIterator) {
                collectionStartIndex = VirtualScrollController.getStartIndex(
                    collection as unknown as VirtualScrollController.IVirtualScrollCollection
                );
                collectionStopIndex = VirtualScrollController.getStopIndex(
                    collection as unknown as VirtualScrollController.IVirtualScrollCollection
                );
            } else {
                // @ts-ignore
                collectionStartIndex = collection.getStartIndex();
                // @ts-ignore
                collectionStopIndex = collection.getStopIndex();
            }

            if (collectionStartIndex !== start || collectionStopIndex !== stop || force) {
                if (collection.getViewIterator) {
                    collection.getViewIterator().setIndices(start, stop);
                } else {
                    // @ts-ignore
                    collection.setIndexes(start, stop);
                }
            }
        }
        if (this._isMounted) {
            this._callbacks.updateShadowMode({
                up: start > 0,
                down: stop < collection.getCount()
            });
        } else {
            // Обновление режима отображения тени в должно вызываться, иначе изначальное отображение будет неверным.
            // https://online.sbis.ru/opendoc.html?guid=a3d69022-e68d-41d2-95c6-b9a8877190e9
            this._updateShadowModeAfterMount = () => {
                this._callbacks.updateShadowMode({
                    up: start > 0,
                    down: stop < collection.getCount()
                });
            };
        }
    }

    /**
     * Обработчик на событие смены видимости триггера
     * @param triggerName
     * @param triggerVisible
     */
    private _triggerVisibilityChanged(triggerName: IDirection, triggerVisible: boolean, params: IScrollParams): void {
        if (!this._afterRenderCallbacks) {
            this._viewportResize(params.clientHeight, false);

            if (triggerVisible) {
                this._recalcToDirection(triggerName);
            }
        }

        this._triggerVisibility[triggerName] = triggerVisible;
        // TODO Совместимость необходимо удалить после переписывания baseControl
        this._callbacks.triggerVisibilityChanged(triggerName, triggerVisible);
    }

    /**
     * Обработчик на событие скролла
     */
    private _scrollPositionChanged(params: IScrollParams): void {
        this._lastScrollTop = params.scrollTop;

        if (detection.isMobileIOS) {
            this._inertialScrolling.scrollStarted();
        }

        this._callbacks.scrollPositionChanged(this._lastScrollTop);

        if (this._fakeScroll) {
            this._fakeScroll = false;
        } else if (this._viewHeight !== this._container.offsetHeight) {
            this._viewResize(this._container.offsetHeight);
        } else if (!this._restoreScrollResolve && !this._virtualScroll.rangeChanged) {
            const activeIndex = this._virtualScroll.getActiveElementIndex(this._lastScrollTop);

            if (typeof activeIndex !== 'undefined') {
                const activeElement = this._options.collection.at(activeIndex).getUid();

                if (activeElement !== this._options.activeElement) {
                    this._notify('activeElementChanged', [activeElement]);
                }
            }
        }
    }

    /**
     * Обработчик передвижения скроллбара
     * @param params
     * @private
     */
    private _scrollBarPositionChanged(params: IScrollParams): void {
        this._throttledPositionChanged(params);
    }

    private _viewResize(viewSize: number, updateItemsHeights: boolean = true): void {
        this._viewHeight = viewSize;
        this._updateTriggerOffset(this._viewHeight, this._viewportHeight);
        const itemsContainer = this.__getItemsContainer();
        this._virtualScroll.resizeView(
            this._viewHeight,
            this._triggerOffset,
            updateItemsHeights ? itemsContainer : undefined
        );
    }

    private _viewportResize(viewportSize: number, updateItemsHeights: boolean = true): void {
        this._viewportHeight = viewportSize;
        this._updateTriggerOffset(this._viewHeight, this._viewportHeight);
        const itemsContainer = this.__getItemsContainer();
        this._virtualScroll.resizeViewport(
            this._viewportHeight,
            this._triggerOffset,
            updateItemsHeights ? itemsContainer : undefined
        );
    }

    /**
     * Производит пересчет диапазона в переданную сторону
     * @param direction
     * @private
     */
    private _recalcToDirection(direction: IDirection): void {
        if (!this._virtualScroll.rangeChanged && this._virtualScroll.isRangeOnEdge(direction)) {
            this._callbacks.loadMore(direction);
        } else {
            this._inertialScrolling.callAfterScrollStopped(() => {
                if (!this._virtualScroll.rangeChanged) {
                    const rangeShiftResult = this._virtualScroll.shiftRange(direction);
                    this._notifyPlaceholdersChanged(rangeShiftResult.placeholders);
                    this._setCollectionIndices(this._options.collection, rangeShiftResult.range, false,
                        this._options.needScrollCalculation);
                    this._indicatorState = direction;
                }
            });
        }
    }

    private _afterRenderHandler(): void {
        if (this._virtualScroll.rangeChanged) {
            this._viewResize(this._container.offsetHeight, false);
            const itemsContainer = this.__getItemsContainer();
            this._virtualScroll.updateItemsHeights(itemsContainer);
        }

        if (this._indicatorState) {
            this._callbacks.changeIndicatorState(false, this._indicatorState);
            this._indicatorState = null;
            clearTimeout(this._indicatorTimeout);
        }

        if (this._virtualScroll.isNeedToRestorePosition) {
            this._restoreScrollPosition();
            this.checkTriggerVisibilityWithTimeout();
            this._restoreScrollResolve = null;
        } else if (this._restoreScrollResolve) {
            this._restoreScrollResolve();
            this._restoreScrollResolve = null;

            this.checkTriggerVisibilityWithTimeout();
        }

        if (this._afterRenderCallbacks) {
            this._afterRenderCallbacks.forEach((callback) => callback());
            this._afterRenderCallbacks = null;
            this.checkTriggerVisibilityWithTimeout();
        }
    }

    /**
     * Вызывает callback вне апдейта
     * @param callback
     * @private
     * @remark Так как во время перерисовки нелья модифицировать стейт, нужно использовать данный метод для методов,
     * которые могут вызваться в произвольный момент времени
     */
    private _doAfterRender(callback: Function): void {
        if (this._isRendering) {
            if (this._afterRenderCallbacks) {
                this._afterRenderCallbacks.push(callback);
            } else {
                this._afterRenderCallbacks = [callback];
            }
        } else {
            callback();
        }
    }

    /**
     * Нотифицирует скролл контейнеру о том, что нужно восстановить скролл
     */
    private _restoreScrollPosition(): void {
        const {direction, heightDifference} = this._virtualScroll.getParamsToRestoreScroll();

        this._fakeScroll = true;
        this._notify('restoreScrollPosition', [heightDifference, direction], {bubbling: true});
        this._fakeScroll = false;
    }

    /**
     * Обработчик изменений в коллекции
     * @param event
     * @param changesType
     * @param action
     * @param newItems
     * @param newItemsIndex
     * @param removedItems
     * @param removedItemsIndex
     * @private
     */
    private _collectionChangedHandler = (event: string,
                                         changesType: string,
                                         action: string,
                                         newItems: object[],
                                         newItemsIndex: number,
                                         removedItems: object[],
                                         removedItemsIndex: number) => {
        const newModelChanged = this._options.useNewModel && action && action !== IObservable.ACTION_CHANGE;

        if (changesType === 'collectionChanged' && action || newModelChanged) {
            if (action === IObservable.ACTION_ADD || action === IObservable.ACTION_MOVE) {
                this._itemsAddedHandler(newItemsIndex, newItems);
            }

            if (action === IObservable.ACTION_REMOVE || action === IObservable.ACTION_MOVE) {
                // When move items call removeHandler with "forceShift" param.
                // https://online.sbis.ru/opendoc.html?guid=4e6981f5-27e1-44e5-832e-2a080a89d6a7
                this._itemsRemovedHandler(removedItemsIndex, removedItems, action === IObservable.ACTION_MOVE);
            }

            if (action === IObservable.ACTION_RESET) {
                this._initVirtualScroll(this._options);
            }

            // TODO Уберется после https://online.sbis.ru/opendoc.html?guid=5ebdec7d-e95e-438d-94f8-079a17b323c6
            // На данный момент индексы в модели проставляются в двух местах: здесь и на уровне модели
            // Вследствие чего могут возникать коллизии и индексы проставленные здесь, могут быть перетерты моделью.
            // Такое происходит например при добавлении в узел дерева
            // После решения ошибки этот код будет не нужен и индексы проставляться будут только здесь
            // @ts-ignore
            this._setCollectionIndices(
                this._options.collection,
                this._virtualScroll._range,
                false,
                this._options.needScrollCalculation
            );
        }
    }

    /**
     * Обработатывает добавление элементов в коллекцию
     * @param addIndex
     * @param items
     * @param direction направление добавления
     * @private
     */
    private _itemsAddedHandler(addIndex: number, items: object[], direction?: IDirection): void {
        if (this._addItemsDirection) {
            this._addItems.push(...items);
            this._addItemsIndex = addIndex;
        } else {
            const rangeShiftResult = this._virtualScroll.insertItems(
                addIndex,
                items.length,
                this._triggerVisibility,
                direction
            );
            this._notifyPlaceholdersChanged(rangeShiftResult.placeholders);
            this._setCollectionIndices(this._options.collection, rangeShiftResult.range, false,
                this._options.needScrollCalculation);
        }
    }

    _notify(eventName: string, args?: any[], options?: { bubbling?: boolean }): any {
        this._options.notify(eventName, args, options);
    }

    /**
     * Обрабатывает удаление элементов из коллекции
     * @param removeIndex
     * @param items
     * @param forcedShift
     * @private
     */
    private _itemsRemovedHandler(removeIndex: number, items: object[], forcedShift: boolean): void {
        const rangeShiftResult = this._virtualScroll.removeItems(removeIndex, items.length, forcedShift);
        this._notifyPlaceholdersChanged(rangeShiftResult.placeholders);
        this._setCollectionIndices(this._options.collection, rangeShiftResult.range, false,
            this._options.needScrollCalculation);
    }

    private _notifyPlaceholdersChanged(placeholders: IPlaceholders): void {
        this._placeholders = placeholders;

        if (this._isMounted) {
            this._notify('updatePlaceholdersSize', [placeholders], {bubbling: true});
        }
    }

    private _updateTriggerOffset(scrollHeight: number, viewportHeight: number): void {
        this._triggerOffset =
            (scrollHeight && viewportHeight ? Math.min(scrollHeight, viewportHeight) : 0) *
            this._options._triggerPositionCoefficient;
        this._triggers?.topVirtualScrollTrigger?.style.top = `${this._triggerOffset}px`;
        this._triggers?.bottomVirtualScrollTrigger?.style.bottom = `${this._triggerOffset}px`;
        this._callbacks.triggerOffsetChanged(this._triggerOffset, this._triggerOffset);
    }

    private static _setCollectionIterator(collection: Collection<Record>, mode: 'remove' | 'hide'): void {
        switch (mode) {
            case 'hide':
                VirtualScrollHideController.setup(
                    collection as unknown as VirtualScrollHideController.IVirtualScrollHideCollection
                );
                break;
            default:
                VirtualScrollController.setup(
                    collection as unknown as VirtualScrollController.IVirtualScrollCollection
                );
                break;
        }
    }

    private _setTriggers(triggers: IScrollTriggers) {
        this._triggers = {};
        SCROLL_TRIGGERS.forEach(name => {
            this._triggers[name] = triggers[name];
        });
    }

    private _setContainer(container: HTMLElement) {
        let scrollContainer = container.getElementsByClassName('controls-ScrollController');
        this._container = <HTMLElement>scrollContainer[0];
    }

    static getDefaultOptions(): Partial<IOptions> {
        return {
            virtualScrollConfig: {
                mode: 'remove'
            },
            _triggerPositionCoefficient: 0.3
        };
    }
}
