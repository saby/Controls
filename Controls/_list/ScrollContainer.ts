import {Control, TemplateFunction, IControlOptions} from 'UI/Base';
import * as template from 'wml!Controls/_list/ScrollContainer/ScrollContainer';
import {Collection} from 'Controls/display';
import VirtualScroll from './ScrollContainer/VirtualScroll';
import {Record} from 'Types/entity';
import {IObservable} from 'Types/collection';
import {
    IItemsHeights,
    IPlaceholders,
    IRange,
    IVirtualScrollOptions,
    IDirection
} from './ScrollContainer/interfaces';
import {Logger} from 'UI/Utils';
import {SyntheticEvent} from 'Vdom/Vdom';
import InertialScrolling from './resources/utils/InertialScrolling';
import {detection} from 'Env/Env';
import {throttle} from 'Types/function';
import * as scrollToElement from 'Controls/Utils/scrollToElement';

const SCROLLMOVE_DELAY = 150;
const TRIGGER_VISIBILITY_DELAY = 101;
const DEFAULT_VIRTUAL_PAGESIZE = 100;
const LOADING_INDICATOR_SHOW_TIMEOUT = 2000;

let displayLib: typeof import('Controls/display');

interface IScrollParams {
    clientHeight: number;
    scrollTop: number;
    scrollHeight: number;
    rect?: DOMRect;
    applyScrollTopCallback?: Function;
}

interface ICompatibilityOptions {
    virtualPageSize: number;
    virtualSegmentSize: number;
    virtualScrolling: boolean;
    useNewModel: boolean;
}

interface IOptions extends IControlOptions, ICompatibilityOptions {
    virtualScrollConfig: {
        pageSize?: number;
        segmentSize?: number;
        mode?: 'remove' | 'hide';
        itemHeightProperty?: string;
        viewportHeight?: number;
    };
    collection: Collection<Record>;
    activeElement: string|number;
}

/**
 * Класс для управления скроллированием в списках
 * @author Волоцкой В.Д.
 * @control Controls/_list/ScrollContainer
 * @extends UI/Base:Control
 * @private
 */
export default class ScrollContainer extends Control<IOptions> {
    protected _template: TemplateFunction = template;
    protected _children: {
        topVirtualScrollTrigger: HTMLElement;
        bottomVirtualScrollTrigger: HTMLElement;
        topLoadTrigger: HTMLElement;
        bottomLoadTrigger: HTMLElement;
    };
    private _virtualScroll: VirtualScroll;
    private _itemsContainer: HTMLElement;

    private _viewHeight: number = 0;
    private _viewportHeight: number = 0;
    private _triggerOffset: number = 0;
    private _lastScrollTop: number = 0;
    private _placeholders: IPlaceholders;

    private _triggerVisibility: {
        up: boolean;
        down: boolean;
    } = {up: false, down: false};

    private _restoreScrollResolve: Function;
    private _applyScrollTopCallback: Function;
    private _checkTriggerVisibilityTimeout: number;

    private _indicatorState: IDirection;
    private _indicatorTimeout: number;

    // Флаг, который необходимо включать, чтобы не реагировать на скроллы происходящие вследствие
    // подскроллов создаваемых самим контролом (scrollToItem, восстановление позиции скролла после перерисовок)
    private _fakeScroll: boolean;

    private __mounted: boolean = false;

    // Сущность управляющая инерционным скроллингом на мобильных устройствах
    private _inertialScrolling: InertialScrolling = new InertialScrolling();

    private _throttledPositionChanged: Function = throttle((params) => {
        const rangeShiftResult = this._virtualScroll.shiftRangeToScrollPosition(params.scrollTop);
        this._notifyPlaceholdersChanged(rangeShiftResult.placeholders);
        this._setCollectionIndices(this._options.collection, rangeShiftResult.range);
    }, SCROLLMOVE_DELAY, true);

    protected _beforeMount(options: IOptions): void {
        this._initModelObserving(options);
        this._initVirtualScroll(options);
    }

    protected _afterMount(): void {
        // @ts-ignore
        this._children.scrollObserver.startRegister(this._children);
        this._afterRenderHandler();
        this.__mounted = true;
    }

    protected _beforeUpdate(options: IOptions): void {
        if (this._options.collection !== options.collection) {
            this._initModelObserving(options);
            this._initVirtualScroll(options);
        }

        if (this._indicatorState) {
            this._indicatorTimeout = setTimeout(() => {
                this._notify('changeIndicatorState', [true, this._indicatorState]);
            }, LOADING_INDICATOR_SHOW_TIMEOUT);
        }
    }

    protected _beforeRender(): void {
        if (this._virtualScroll.isNeedToRestorePosition) {
            this._notify('saveScrollPosition', [], {bubbling: true});
        }
    }

    protected _afterRender(): void {
        this._afterRenderHandler();
    }

    protected _beforeUnmount(): void {
        clearTimeout(this._checkTriggerVisibilityTimeout);
    }

    protected _itemsContainerReadyHandler(_: SyntheticEvent<Event>, itemsContainer: HTMLElement): void {
        this._itemsContainer = itemsContainer;
    }

    protected _viewResize(): void {
        this._viewHeight = this._container.offsetHeight;
        this._updateTriggerOffset(this._viewHeight, this._viewportHeight);
        this._virtualScroll.resizeView(this._viewHeight, this._triggerOffset, this._itemsContainer);
        // TODO Совместимость необходимо удалить после переписывания baseControl
        this._notify('viewResize');
    }

    protected _observeScrollHandler(
        _: SyntheticEvent<Event>,
        eventName: string,
        params: IScrollParams
    ): void {
        switch (eventName) {
            case 'virtualPageBottomStart':
                this._triggerVisibilityChanged('down', true);
                break;
            case 'virtualPageTopStart':
                this._triggerVisibilityChanged('up', true);
                break;
            case 'virtualPageBottomStop':
                this._triggerVisibilityChanged('down', false);
                break;
            case 'virtualPageTopStop':
                this._triggerVisibilityChanged('up', false);
                break;
            case 'scrollMoveSync':
                this._scrollPositionChanged(params);
                break;
            case 'viewportResize':
                this._viewportResize(params);
                this._notify('viewportResize', [params.clientHeight, params.rect]);
                break;
            case 'virtualScrollMove':
                this._scrollBarPositionChanged(params);
                break;
            case 'canScroll':
            case 'scrollResize':
            case 'scrollMove':
            case 'cantScroll':
                this._notify(eventName, [params as IScrollParams]);
                break;
        }
    }

    /**
     * Функция подскролла к элементу
     * @param {string | number} key
     * @param {boolean} toBottom
     * @param {boolean} force
     * @remark Функция подскролливает к записи, если это возможно, в противном случае вызовется перестроение
     * от элемента
     */
    scrollToItem(key: string|number, toBottom: boolean = true, force: boolean = false): Promise<void> {
        const index = this._options.collection.getIndexByKey(key);

        if (index !== -1) {
            return new Promise((resolve) => {
                const scrollCallback = () => {
                    // TODO Убрать работу с DOM, сделать через получение контейнера по его id из _children
                    // логического родителя, который отрисовывает все элементы
                    // https://online.sbis.ru/opendoc.html?guid=942e1a1d-15ee-492e-b763-0a52d091a05e
                    const itemContainer = this._virtualScroll.getItemContainerByIndex(index, this._itemsContainer);

                    if (itemContainer) {
                        this._fakeScroll = true;
                        scrollToElement(itemContainer, toBottom, force);
                    }

                    resolve();
                };

                if (this._virtualScroll.canScrollToItem(index, toBottom, force)) {
                    scrollCallback();
                } else if (force) {
                    // Нельзя менять диапазон отображемых элементов во время перерисовки
                    // поэтому нужно перенести scrollToItem на следующий цикл синхронизации
                    if (this._virtualScroll.rangeChanged) {
                        this._restoreScrollResolve = () => {
                            this.scrollToItem(key, toBottom, force);
                        };
                    } else {
                        const rangeShiftResult = this._virtualScroll
                            .resetRange(index, this._options.collection.getCount());
                        this._notifyPlaceholdersChanged(rangeShiftResult.placeholders);
                        this._setCollectionIndices(this._options.collection, rangeShiftResult.range);
                        this._restoreScrollResolve = scrollCallback;
                    }
                } else {
                    resolve();
                }
            });
        } else {
            return Promise.resolve();
        }
    }

    checkTriggerVisibilityWithTimeout(): void {
        this._checkTriggerVisibilityTimeout = setTimeout(() => {
            this._checkTriggerVisibility();
            clearTimeout(this._checkTriggerVisibilityTimeout);
        }, TRIGGER_VISIBILITY_DELAY);
    }

    /**
     * Начинает цепочку обновлений коллекции
     */
    startChainUpdate(): void {
        this._virtualScroll.startChainUpdate();
    }

    /**
     * Заканчивает цепочку обновлений коллекции
     */
    stopChainUpdate(): void {
        this._virtualScroll.stopChainUpdate();
    }

    /**
     * Проверка на видимость триггеров
     * @remark Иногда, уже после загрузки данных триггер остается видимым, в таком случае вызвать повторную загрузку
     * данных
     */
    private _checkTriggerVisibility(): void {
        if (!this._applyScrollTopCallback) {
            if (this._triggerVisibility.down) {
                this._recalcToDirection('down');
            }

            if (this._triggerVisibility.up) {
                this._recalcToDirection('up');
            }
        }

    }

    private _initModelObserving(options: IOptions): void {
        this._subscribeToCollectionChange(options.collection, options.useNewModel);

        if (options.useNewModel) {
            ScrollContainer._setCollectionIterator(options.collection, options.virtualScrollConfig.mode);
        }
    }

    private _initVirtualScroll(options: IOptions): void {
        const virtualScrollOptions = ScrollContainer._getVirtualScrollOptions(options);
        this._virtualScroll = new VirtualScroll(
            virtualScrollOptions,
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
        this._setCollectionIndices(options.collection, rangeShiftResult.range);

        if (options.activeElement) {
            this._restoreScrollResolve = () => {
                this.scrollToItem(options.activeElement, false, true);
            };
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

    private _setCollectionIndices(collection: Collection<Record>, {start, stop}: IRange): void {
        let collectionStartIndex: number;
        let collectionStopIndex: number;

        if (collection.getViewIterator) {
            collectionStartIndex = displayLib.VirtualScrollController.getStartIndex(collection);
            collectionStopIndex = displayLib.VirtualScrollController.getStopIndex(collection);
        } else {
            collectionStartIndex = collection.getStartIndex();
            collectionStopIndex = collection.getStopIndex();
        }

        if (collectionStartIndex !== start || collectionStopIndex !== stop) {
            if (collection.getViewIterator) {
                return collection.getViewIterator().setIndices(start, stop);
            } else {
                // @ts-ignore
                return collection.setIndexes(start, stop);
            }
        }
    }

    /**
     * Обработчик на событие смены видимости триггера
     * @param triggerName
     * @param triggerVisible
     */
    private _triggerVisibilityChanged(triggerName: IDirection, triggerVisible: boolean): void {
        if (triggerVisible) {
            this._recalcToDirection(triggerName);
        }

        this._triggerVisibility[triggerName] = triggerVisible;
        this._virtualScroll.applyTriggerVisibility(triggerName, triggerVisible);
        // TODO Совместимость необходимо удалить после переписывания baseControl
        this._notify('triggerVisibilityChanged', [triggerName, triggerVisible]);
    }

    /**
     * Обработчик на событие скролла
     */
    private _scrollPositionChanged(params: IScrollParams): void {
        this._lastScrollTop = params.scrollTop;

        if (detection.isMobileIOS) {
            this._inertialScrolling.scrollStarted();
        }

        this._notify('scrollPositionChanged', [this._lastScrollTop]);

        if (this._fakeScroll) {
            this._fakeScroll = false;
        } else if (!this._restoreScrollResolve && !this._virtualScroll.rangeChanged) {
            const activeIndex = this._virtualScroll.getActiveElementIndex(this._lastScrollTop);

            if (typeof activeIndex !== 'undefined') {
                const activeElement = this._options.collection.at(activeIndex).getUid();

                if (activeElement !== this._options.activeElement) {
                    this._notify('activeElementChanged', [
                        this._options.collection.at(activeIndex).getUid()
                    ]);
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
        this._applyScrollTopCallback = params.applyScrollTopCallback;
        this._throttledPositionChanged(params);
    }

    private _viewportResize(params: IScrollParams): void {
        this._viewportHeight = params.clientHeight;
        this._updateTriggerOffset(this._viewHeight, this._viewportHeight);
        this._virtualScroll.resizeViewport(this._viewportHeight, this._triggerOffset, this._itemsContainer);
    }

    /**
     * Производит пересчет диапазона в переданную сторону
     * @param direction
     * @private
     */
    private _recalcToDirection(direction: IDirection): void {
        if (!this._virtualScroll.rangeChanged) {
            if (this._virtualScroll.isRangeOnEdge(direction)) {
                this._notifyLoadMore(direction);
            } else {
                this._inertialScrolling.callAfterScrollStopped(() => {
                    const rangeShiftResult = this._virtualScroll.shiftRange(direction);
                    this._notifyPlaceholdersChanged(rangeShiftResult.placeholders);
                    this._setCollectionIndices(this._options.collection, rangeShiftResult.range);

                    if (this._virtualScroll.isRangeOnEdge(direction)) {
                        this._notifyLoadMore(direction);
                    }
                });
            }
        }
    }

    private _afterRenderHandler(): void {
        if (this._virtualScroll.rangeChanged) {
            this._virtualScroll.updateItemsHeights(this._itemsContainer);
        }

        if (this._applyScrollTopCallback) {
            this._applyScrollTopCallback();
            this._applyScrollTopCallback = null;
            this.checkTriggerVisibilityWithTimeout();
        }

        this._updateShadowMode();

        if (this._indicatorState) {
            this._notify('changeIndicatorState', [false, this._indicatorState]);
            this._indicatorState = null;
            clearTimeout(this._indicatorTimeout);
        }

        if (this._virtualScroll.isNeedToRestorePosition) {
            this._scrollToPosition(this._virtualScroll.getPositionToRestore(this._lastScrollTop));
            this.checkTriggerVisibilityWithTimeout();
        } else if (this._restoreScrollResolve) {
            this._restoreScrollResolve();
            this.checkTriggerVisibilityWithTimeout();
        }
    }
    /**
     * Нотифицирует скролл контейнеру о том, что нужно подскролить к переданной позиции
     * @param position
     */
    private _scrollToPosition(position: number): void {
        this._fakeScroll = true;
        this._notify('restoreScrollPosition', [position], {bubbling: true});
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
                this._itemsRemovedHandler(removedItemsIndex, removedItems);
            }

            if (action === IObservable.ACTION_RESET) {
                this._initVirtualScroll(this._options);
            }
        }

        // Если произошли изменения индексов в модели, значит был пересчитан range
        // даже если внутри состояния виртуального скролла этого не произошло
        // такое может произойти на старой модели, так как она сама управляет индексами
        // при загрузке новой пачки элементов
        // TODO Совместимость
        if (changesType === 'indexesChanged') {
            this._virtualScroll.rangeChanged = true;
        }
    }

    /**
     * Обработатывает добавление элементов в коллекцию
     * @param addIndex
     * @param items
     * @private
     */
    private _itemsAddedHandler(addIndex: number, items: object[]): void {
        const rangeShiftResult = this._virtualScroll.insertItems(addIndex, items.length);
        this._notifyPlaceholdersChanged(rangeShiftResult.placeholders);
        this._setCollectionIndices(this._options.collection, rangeShiftResult.range);
    }

    /**
     * Обрабатывает удаление элементов из коллекции
     * @param removeIndex
     * @param items
     * @private
     */
    private _itemsRemovedHandler(removeIndex: number, items: object[]): void {
        const rangeShiftResult = this._virtualScroll.removeItems(removeIndex, items.length);
        this._notifyPlaceholdersChanged(rangeShiftResult.placeholders);
        this._setCollectionIndices(this._options.collection, rangeShiftResult.range);
    }

    /**
     * Нотифицирует о том, что нужно грузить новые данные
     * @param direction
     * @private
     */
    private _notifyLoadMore(direction: IDirection): void {
        this._notify('loadMore', [direction]);
    }

    private _notifyPlaceholdersChanged(placeholders: IPlaceholders): void {
        this._placeholders = placeholders;

        if (this.__mounted) {
            this._notify('updatePlaceholdersSize', [placeholders], { bubbling: true });
        }
    }

    /**
     * Обновление режима тени, в зависимости от размеров виртуальных распорок
     * @remark Так как при виртуальном скроллировании отображается только некоторый "видимый" набор записей
     * то scrollContainer будет неверно рассчитывать наличие тени, поэтому управляем режимом тени вручную
     */
    private _updateShadowMode(): void {
        this._notify('updateShadowMode', [this._placeholders]);
    }

    private _updateTriggerOffset(scrollHeight: number, viewportHeight: number): void {
        this._triggerOffset = (scrollHeight && viewportHeight ? Math.min(scrollHeight, viewportHeight) : 0) * 0.3;
        this._children.topVirtualScrollTrigger.style.top = `${this._triggerOffset}px`;
        this._children.bottomVirtualScrollTrigger.style.bottom = `${this._triggerOffset}px`;
        this._notify('triggerOffsetChanged', [this._triggerOffset, this._triggerOffset]);
    }

    private static _setCollectionIterator(collection: Collection<Record>, mode: 'remove' | 'hide'): void {
        displayLib = require('Controls/display');

        switch (mode) {
            case 'hide':
                displayLib.VirtualScrollHideController.setup(collection);
                break;
            default:
                displayLib.VirtualScrollController.setup(collection);
                break;
        }
    }

    private static _getVirtualScrollOptions(options: IOptions): Partial<IVirtualScrollOptions> {
        let virtualScrollConfig: Partial<IVirtualScrollOptions> = {};

        if (options.virtualScrolling && !options.virtualPageSize) {
            Logger.warn('Controls.list: Specify virtual page size in virtualScrollConfig option');
            virtualScrollConfig.pageSize = DEFAULT_VIRTUAL_PAGESIZE;
        }
        if (options.virtualPageSize || options.virtualSegmentSize) {
            virtualScrollConfig.segmentSize = options.virtualSegmentSize;
            virtualScrollConfig.pageSize = options.virtualPageSize;
            Logger.warn('Controls.list: Use virtualScrollConfig instead of old virtual scroll config options');
        } else {
            virtualScrollConfig = {...virtualScrollConfig, ...options.virtualScrollConfig};
        }

        return virtualScrollConfig;
    }

    static getDefaultOptions(): Partial<IOptions> {
        return {
            virtualScrollConfig: {
                mode: 'remove'
            }
        };
    }
}
