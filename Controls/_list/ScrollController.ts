import {IControlOptions} from 'UI/Base';
import {Collection} from 'Controls/display';
import VirtualScroll from './ScrollContainer/VirtualScroll';
import {Record, Model} from 'Types/entity';
import {
    IItemsHeights,
    IPlaceholders,
    IRange,
    IDirection,
    ITriggerState,
    IContainerHeights,
    IScrollRestoreParams,
    IScrollControllerResult
} from './ScrollContainer/interfaces';
import InertialScrolling from './resources/utils/InertialScrolling';
import {detection} from 'Env/Env';
import {VirtualScrollHideController, VirtualScrollController} from 'Controls/display';
import { getDimensions as uDimension } from '../sizeUtils';
import { getStickyHeadersHeight } from '../scroll';

export interface IScrollParams {
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
    disableVirtualScroll: boolean;
    needScrollCalculation: boolean;
    collection: Collection<Record>;
    activeElement: string | number;
    _triggerPositionCoefficient: number;
    forceInitVirtualScroll: boolean;
    attachLoadTopTriggerToNull: boolean;
}

/**
 * Контейнер управляющий операциями скролла в списке.
 * @class Controls/_list/ScrollController/ScrollController
 * @private
 * @author Авраменко А.С.
 */
export default class ScrollController {

    private _virtualScroll: VirtualScroll;

    private _viewHeight: number = 0;
    private _viewportHeight: number = 0;
    private _triggerOffset: number = 0;
    private _lastScrollTop: number = 0;

    private _triggerVisibility: ITriggerState = {up: false, down: false};

    private _continueScrollToItem: Function;
    private _completeScrollToItem: Function;

    private _isRendering: boolean = false;

    private _placeholders: IPlaceholders;

    private _resetInEnd: boolean;

    // Флаг, который необходимо включать, чтобы не реагировать на скроллы происходящие вследствие
    // подскроллов создаваемых самим контролом (scrollToItem, восстановление позиции скролла после перерисовок)
    private _fakeScroll: boolean;

    // Сущность управляющая инерционным скроллингом на мобильных устройствах
    private _inertialScrolling: InertialScrolling = new InertialScrolling();

    // https://online.sbis.ru/opendoc.html?guid=23c96b71-b7ec-4060-94c1-94069aec9955
    // tslint:disable-next-line
    protected _options: any;

    // https://online.sbis.ru/opendoc.html?guid=23c96b71-b7ec-4060-94c1-94069aec9955
    // tslint:disable-next-line
    constructor(options: any) {
        this._options = {...ScrollController.getDefaultOptions(), ...options};
        if (options.needScrollCalculation) {
            if (options.useNewModel && options.collection) {
                ScrollController._setCollectionIterator(options.collection, options.virtualScrollConfig.mode);
            }
        }
    }

    private savePlaceholders(placeholders: IPlaceholders = null): void {
        if (placeholders) {
            this._placeholders = placeholders;
        }
    }

    callAfterScrollStopped(callback: Function): void {
        this._inertialScrolling.callAfterScrollStopped(callback);
    }

    getScrollStopPromise(): Promise<void>|void {
        return this._inertialScrolling.getScrollStopPromise();
    }

    private updateContainerHeightsData(params: Partial<IScrollParams>): IScrollControllerResult {
        if (this._virtualScroll && params) {
            const newParams: Partial<IContainerHeights> = {};
            if (params.clientHeight !== void 0) {
                newParams.viewport = params.clientHeight;
                this._viewportHeight = params.clientHeight;
            }
            if (params.scrollHeight !== void 0) {
                newParams.scroll = params.scrollHeight;
                this._viewHeight = params.scrollHeight;
            }
            const result = {
                triggerOffset: this.getTriggerOffset(this._viewHeight,
                                                     this._viewportHeight,
                                                     this._options.attachLoadTopTriggerToNull)};
            newParams.trigger = this._triggerOffset;
            this._virtualScroll.applyContainerHeightsData(newParams);
            return result;
        } else {
            return {};
        }
    }

    update({options, params}: {options: IOptions, params?: Partial<IScrollParams>}): IScrollControllerResult {
        let result: IScrollControllerResult = {};

        if (options) {
            if (options.collection && (
                this._options.collection !== options.collection ||
                options.needScrollCalculation && !this._options.needScrollCalculation ||
                options.disableVirtualScroll !== this._options.disableVirtualScroll
            )) {
                this._options.disableVirtualScroll = options.disableVirtualScroll;
                if (options.needScrollCalculation) {
                    if (options.useNewModel) {
                        ScrollController._setCollectionIterator(options.collection, options.virtualScrollConfig.mode);
                    }
                }
                result = this._initVirtualScroll(options);
                this._options.collection = options.collection;
                this._options.needScrollCalculation = options.needScrollCalculation;
                this._isRendering = true;
            }
            if (options.attachLoadTopTriggerToNull !== this._options.attachLoadTopTriggerToNull) {
                this._options.attachLoadTopTriggerToNull = options.attachLoadTopTriggerToNull;
                if (!params) {
                    result.triggerOffset = this.getTriggerOffset(this._viewHeight,
                                                                 this._viewportHeight,
                                                                 this._options.attachLoadTopTriggerToNull);
                }
                this._isRendering = true;
            }

            if (options.activeElement !== this._options.activeElement) {
                this._isRendering = true;
                this._options.activeElement = options.activeElement;
            }
        }
        return {...result, ...this.updateContainerHeightsData(params)};
    }

    getPlaceholders(): IPlaceholders {
        return this._placeholders;
    }

    setRendering(state: boolean): void {
        this._isRendering = state;
    }

    getRendering(): boolean {
        return this._isRendering;
    }

    getScrollTop(): number {
        return this._lastScrollTop;
    }
    setSegmentSize(size: number): void {
        this._virtualScroll?.setSegmentSize(size);
    }
    continueScrollToItemIfNeed(): boolean {
        let result = false;
        if (this._continueScrollToItem) {
            this._continueScrollToItem();
            this._continueScrollToItem = null;
            result = true;
        } else if (this._completeScrollToItem) {
            this._completeScrollToItem();
            this._completeScrollToItem = null;
            result = true;
        }
        return result;
    }

    /**
     * Возвращает первый полностью видимый элемент
     * @param listViewContainer
     * @param baseContainer
     * @param scrollTop
     * @return {CollectionItem<Model>}
     */
    getFirstVisibleRecord(listViewContainer: HTMLElement, baseContainer: HTMLElement, scrollTop: number): Model {
        const topOffset = this._getTopOffsetForItemsContainer(listViewContainer, baseContainer);
        const verticalOffset = scrollTop - topOffset + (getStickyHeadersHeight(baseContainer, 'top', 'allFixed') || 0);

        let firstItemIndex = this._options.collection.getStartIndex();
        firstItemIndex += this._getFirstVisibleItemIndex(listViewContainer.children, verticalOffset);
        firstItemIndex = Math.min(firstItemIndex, this._options.collection.getStopIndex());
        return this._options.collection.at(firstItemIndex);
    }

    /**
     * Возращает индекс первого полностью видимого элемента
     * @param {HTMLElement[]} items
     * @param {number} verticalOffset
     * @private
     */
    private _getFirstVisibleItemIndex(items: HTMLElement[], verticalOffset: number): number {
        const itemsCount = items.length;
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
    }

    private _getTopOffsetForItemsContainer(listViewContainer: HTMLElement, baseControlContainer: HTMLElement): number {
        let offsetTop = uDimension(listViewContainer.children[0], true).top;
        const container = baseControlContainer[0] || baseControlContainer;
        offsetTop += container.offsetTop - uDimension(container).top;
        return offsetTop;
    }

    /**
     * Функция подскролла к элементу
     * @param {string | number} key
     * @param {boolean} toBottom
     * @param {boolean} force
     * @remark Функция подскролливает к записи, если это возможно, в противном случае вызовется перестроение
     * от элемента
     */
    scrollToItem(key: string | number,
                 toBottom: boolean = true,
                 force: boolean = false,
                 scrollCallback: Function): Promise<IScrollControllerResult> {
        const index = this._options.collection.getIndexByKey(key);

        if (index !== -1) {
            return new Promise((resolve) => {
                if (this._virtualScroll
                            && this._virtualScroll.canScrollToItem(index, toBottom, force)
                            && !this._virtualScroll.rangeChanged) {
                    this._fakeScroll = true;
                    scrollCallback(index);
                    resolve(null);
                } else if (force) {
                    this._inertialScrolling.callAfterScrollStopped(() => {
                        if (this._virtualScroll && this._virtualScroll.rangeChanged) {
                            // Нельзя менять диапазон отображемых элементов во время перерисовки
                            // поэтому нужно перенести scrollToItem на следующий цикл синхронизации (после отрисовки)
                            // Для этого используем _scrollToItemAfterRender.
                            // https://online.sbis.ru/opendoc.html?guid=2a97761f-e25a-4a10-9735-ded67e36e527
                            this._continueScrollToItem = () => {
                                this.scrollToItem(key, toBottom, force, scrollCallback).then((result) => {
                                    resolve(result);
                                });
                            };
                        } else {
                            this._continueScrollToItem = () => {
                                if (this._virtualScroll) {
                                    const rangeShiftResult = this._virtualScroll.resetRange(
                                        index,
                                        this._options.collection.getCount()
                                    );
                                    this._setCollectionIndices(
                                        this._options.collection,
                                        rangeShiftResult.range,
                                        false,
                                        this._options.needScrollCalculation
                                    );

                                    // Скролл нужно восстанавливать после отрисовки, для этого используем
                                    // _completeScrollToItem
                                    this._completeScrollToItem = () => {
                                        this._fakeScroll = true;
                                        scrollCallback(index);
                                        this.savePlaceholders(rangeShiftResult.placeholders);
                                        resolve({
                                            placeholders: rangeShiftResult.placeholders,
                                            shadowVisibility: this._calcShadowVisibility(
                                                this._options.collection,
                                                rangeShiftResult.range)
                                        });
                                    };
                                }
                            };
                        }
                        if (!this._isRendering && this._virtualScroll && !this._virtualScroll.rangeChanged) {
                            this.continueScrollToItemIfNeed();
                        }
                    });
                } else {
                    resolve(null);
                }
            });
        } else {
            return Promise.resolve(null);
        }
    }

    private _initVirtualScroll(options: IOptions, count?: number): IScrollControllerResult {
        const virtualScrollConfig = !options.disableVirtualScroll && options.virtualScrollConfig || {};
        if (options.collection && (
            !virtualScrollConfig.pageSize ||
            options.collection.getCount() >= virtualScrollConfig.pageSize ||
            options.forceInitVirtualScroll ||
            this._virtualScroll
        )) {
            this._virtualScroll = new VirtualScroll(
                virtualScrollConfig,
                {
                    viewport: this._viewportHeight,
                    scroll: this._viewHeight,
                    trigger: this._triggerOffset
                });

            let itemsHeights: Partial<IItemsHeights>;

            let initialIndex = typeof options.activeElement !== 'undefined' ?
                options.collection.getIndexByKey(options.activeElement) : 0;
            if (this._resetInEnd) {
                initialIndex = options.collection.getCount();
                this._resetInEnd = false;
            }
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

            const rangeShiftResult = this._virtualScroll.resetRange(
                initialIndex,
                count === undefined ?  options.collection.getCount() : count,
                itemsHeights
            );
            this._setCollectionIndices(
                options.collection,
                rangeShiftResult.range,
                true,
                options.needScrollCalculation
            );
            this.savePlaceholders(rangeShiftResult.placeholders);
            return {
                    placeholders: rangeShiftResult.placeholders,
                    scrollToActiveElement: options.activeElement !== undefined,
                    shadowVisibility: this._calcShadowVisibility(options.collection, rangeShiftResult.range)
                };
        }
    }

    private _calcShadowVisibility(collection: Collection<Record>, range: IRange): {up: boolean, down: boolean} {

        // TODO: сейчас от флага needScrollCalculation зависит,
        // будут ли применены индексы виртуального скролла к коллекции.
        // По-хорошему, если needScrollCalculation===false, то вычислений диапазона происходить не должно.
        // Разобраться по ошибке https://online.sbis.ru/opendoc.html?guid=5bb48c1c-cdd9-419c-ab47-5d9ab9d450b4
        if (!this._options.needScrollCalculation) {
            return null;
        }
        return {
            up: range.start > 0,
            down: range.stop < collection.getCount()
        };
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
                collectionStartIndex = collection.getStartIndex();
                collectionStopIndex = collection.getStopIndex();
            }

            if (collectionStartIndex !== start || collectionStopIndex !== stop || force) {
                collection.setIndexes(start, stop);
            }
        }
    }

    /**
     * ЗАпоминает состояние видимости триггера
     * @param triggerName
     * @param triggerVisible
     */
    setTriggerVisibility(triggerName: IDirection, triggerVisible: boolean): void {
        this._triggerVisibility[triggerName] = triggerVisible;
    }

    /**
     * Обработчик на событие скролла
     */
    scrollPositionChange(params: IScrollParams, virtual: boolean = false): IScrollControllerResult {
        if (virtual) {
            return this.virtualScrollPositionChanged(params);
        } else {
            return this.scrollPositionChanged(params);
        }
    }

    private scrollPositionChanged(params: IScrollParams): IScrollControllerResult {

        this._lastScrollTop = params.scrollTop;

        if (detection.isMobileIOS) {
            this._inertialScrolling.scrollStarted();
        }

        if (this._fakeScroll) {
            this._fakeScroll = false;
        } else if (!this._completeScrollToItem && this._virtualScroll && !this._virtualScroll.rangeChanged) {
            const activeIndex = this._virtualScroll.getActiveElementIndex(this._lastScrollTop);

            if (typeof activeIndex !== 'undefined') {
                const activeElement = this._options.collection.at(activeIndex).getUid();

                if (activeElement !== this._options.activeElement) {
                    return { activeElement };
                }
            }
        }
    }

    /**
     * Обработчик изменения положения виртуального скролла
     * @param params
     * @private
     */
    private virtualScrollPositionChanged(params: IScrollParams): IScrollControllerResult  {
        if (!this._virtualScroll) {
            return;
        }

        const rangeShiftResult = this._virtualScroll.shiftRangeToScrollPosition(params.scrollTop);
        this._setCollectionIndices(
            this._options.collection,
            rangeShiftResult.range,
            false,
            this._options.needScrollCalculation
        );

        this.savePlaceholders(rangeShiftResult.placeholders);
        return {
            placeholders: rangeShiftResult.placeholders,
            virtualRangeChanged: this._virtualScroll.rangeChanged,
            shadowVisibility: this._calcShadowVisibility(this._options.collection, rangeShiftResult.range)
        };
    }

    /**
     * Производит пересчет диапазона в переданную сторону
     * @param direction
     */
    shiftToDirection(direction: IDirection): Promise<IScrollControllerResult> {
        return new Promise((resolve) => {

            if (
                !this._virtualScroll ||
                this._virtualScroll &&
                !this._virtualScroll.rangeChanged &&
                this._virtualScroll.isRangeOnEdge(direction) ||
                !this._virtualScroll && this._options.virtualScrollConfig &&
                this._options.virtualScrollConfig.pageSize > this._options.collection.getCount()
            ) {
                resolve(null);
            } else {
                if (this._virtualScroll && !this._virtualScroll.rangeChanged) {
                    this._inertialScrolling.callAfterScrollStopped(() => {
                        const rangeShiftResult = this._virtualScroll.shiftRange(direction);
                        this._setCollectionIndices(this._options.collection, rangeShiftResult.range, false,
                            this._options.needScrollCalculation);
                        this.savePlaceholders(rangeShiftResult.placeholders);
                        resolve({
                            placeholders: rangeShiftResult.placeholders,
                            shadowVisibility: this._calcShadowVisibility(
                                this._options.collection,
                                rangeShiftResult.range
                            )
                        });
                    });
                } else {
                    resolve(null);
                }
            }
        });
    }

    updateItemsHeights(itemsHeights: IItemsHeights): boolean {
        if (this._virtualScroll) {
            const itemsUpdated = this._virtualScroll.rangeChanged;
            this._virtualScroll.updateItemsHeights(itemsHeights);
            return itemsUpdated;
        }
    }

    /**
     * Получает параметры для восстановления скролла
     */
    getParamsToRestoreScrollPosition(): IScrollRestoreParams {
        if (this._virtualScroll && this._virtualScroll.isNeedToRestorePosition) {
            return this._virtualScroll.getParamsToRestoreScroll();
        } else {
            return null;
        }
    }

    beforeRestoreScrollPosition(): void {
        this._fakeScroll = true;
        this._virtualScroll.beforeRestoreScrollPosition();
    }

    // TODO рано убирать костыль, ждем перехода на новую модель.
    // https://online.sbis.ru/opendoc.html?guid=1f95ff97-c952-40ef-8d61-077e8431c4be
    setIndicesAfterCollectionChange(): void {

        // TODO Уберется после https://online.sbis.ru/opendoc.html?guid=5ebdec7d-e95e-438d-94f8-079a17b323c6
        // На данный момент индексы в модели проставляются в двух местах: здесь и на уровне модели
        // Вследствие чего могут возникать коллизии и индексы проставленные здесь, могут быть перетерты моделью.
        // Такое происходит например при добавлении в узел дерева
        // После решения ошибки этот код будет не нужен и индексы проставляться будут только здесь
        if (this._virtualScroll) {
            this._setCollectionIndices(
                this._options.collection,
                this._virtualScroll.getRange(),
                false,
                this._options.needScrollCalculation
            );
        }
    }

    /**
     * Метод позволяет узнать, применяется ли для отображения элементов виртуальный скролл
     * @public
     */
    isAppliedVirtualScroll(): boolean {
        return !!this._virtualScroll;
    }

    handleMoveItems(
        addIndex: number,
        addedItems: object[],
        removeIndex: number,
        removedItems: object[],
        direction?: IDirection
    ): IScrollControllerResult {
        let result = {};
        if (!this._virtualScroll) {
            result = this._initVirtualScroll(
                {...this._options, forceInitVirtualScroll: true},
                (this._options.collection.getCount() - addedItems.length)
            );
        }

        this._virtualScroll.addItems(
            addIndex,
            addedItems.length,
            this._triggerVisibility,
            direction
        );
        const removeItemsResult = this._virtualScroll.removeItems(removeIndex, removedItems.length);
        this._setCollectionIndices(this._options.collection, removeItemsResult.range, false,
            this._options.needScrollCalculation);
        this.savePlaceholders(removeItemsResult.placeholders);
        return {
            ...result,
            placeholders: removeItemsResult.placeholders,
            shadowVisibility: this._calcShadowVisibility(this._options.collection, removeItemsResult.range)
        };
    }
    /**
     * Обработатывает добавление элементов в коллекцию
     * @param addIndex
     * @param items
     * @param direction направление добавления
     * @private
     */
    handleAddItems(addIndex: number, items: object[], direction?: IDirection): IScrollControllerResult {
        let result = {};
        if (!this._virtualScroll) {
            result = this._initVirtualScroll(
                {...this._options, forceInitVirtualScroll: true},
                (this._options.collection.getCount() - items.length)
            );
        }

        const rangeShiftResult = this._virtualScroll.addItems(
            addIndex,
            items.length,
            this._triggerVisibility,
            direction
        );

        this._setCollectionIndices(this._options.collection, rangeShiftResult.range, false,
            this._options.needScrollCalculation);
        this.savePlaceholders(rangeShiftResult.placeholders);
        return {
            ...result,
            placeholders: rangeShiftResult.placeholders,
            shadowVisibility: this._calcShadowVisibility(this._options.collection, rangeShiftResult.range)
        };
    }

    /**
     * Обрабатывает удаление элементов из коллекции
     * @param removeIndex
     * @param items
     * @private
     */
    handleRemoveItems(removeIndex: number, items: object[]): IScrollControllerResult {
        if (this._virtualScroll) {
            const rangeShiftResult = this._virtualScroll.removeItems(removeIndex, items.length);

            // todo временный фикс, убрать по
            //  https://online.sbis.ru/opendoc.html?guid=5c0a021b-38a6-4d28-8c5c-cf9d9f27e651
            this._setCollectionIndices(this._options.collection, rangeShiftResult.range, true,
                this._options.needScrollCalculation);
            this.savePlaceholders(rangeShiftResult.placeholders);
            return {
                placeholders: rangeShiftResult.placeholders,
                shadowVisibility: this._calcShadowVisibility(this._options.collection, rangeShiftResult.range)
            };
        }
    }

    handleResetItems(): IScrollControllerResult {
        return this._initVirtualScroll(this._options);
    }

    calculateVirtualScrollHeight(): number {
        return this._virtualScroll.calculateVirtualScrollHeight();
    }
    setResetInEnd(resetInEnd: boolean): void {
        this._resetInEnd = resetInEnd;
    }

    private getTriggerOffset(scrollHeight: number, viewportHeight: number, attachLoadTopTriggerToNull: boolean):
            {top: number, bottom: number} {
        this._triggerOffset =
            (scrollHeight && viewportHeight ? Math.min(scrollHeight, viewportHeight) : 0) *
            this._options._triggerPositionCoefficient;
        const topTriggerOffset = attachLoadTopTriggerToNull ? 0 : this._triggerOffset;
        return {top: topTriggerOffset, bottom: this._triggerOffset};
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

    static getDefaultOptions(): Partial<IOptions> {
        return {
            virtualScrollConfig: {
                mode: 'remove'
            },
            _triggerPositionCoefficient: 0.3
        };
    }
}
