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
    IShadowVisibility,
    IScrollRestoreParams,
    IScrollControllerResult
} from './ScrollContainer/interfaces';
import InertialScrolling from './resources/utils/InertialScrolling';
import {detection} from 'Env/Env';
import {VirtualScrollHideController, VirtualScrollController} from 'Controls/display';
import { getDimensions as uDimension } from '../sizeUtils';
import { getStickyHeadersHeight } from '../scroll';
import {IVirtualScrollConfig} from 'Controls/_baseList/interface/IVirtualScroll';

const DEFAULT_TRIGGER_OFFSET = 0.3;
export interface IScrollParams {
    clientHeight: number;
    scrollTop: number;
    scrollHeight: number;
    rect?: DOMRect;
    applyScrollTopCallback?: Function;
}

export interface IOptions extends IControlOptions {
    virtualScrollConfig: IVirtualScrollConfig;
    disableVirtualScroll: boolean;
    needScrollCalculation: boolean;
    collection: Collection<Record>;
    activeElement: string | number;
    topTriggerOffsetCoefficient: number;
    bottomTriggerOffsetCoefficient: number;
    forceInitVirtualScroll: boolean;
    resetTopTriggerOffset: boolean;
    resetDownTriggerOffset: boolean;
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
    private _topTriggerOffset: number = 0;
    private _bottomTriggerOffset: number = 0;
    private _lastScrollTop: number = 0;

    private _triggerVisibility: ITriggerState = {up: false, down: false};

    private _continueScrollToItem: Function;
    private _completeScrollToItem: Function;
    private _applyScrollTopCallback: Function;

    private _isRendering: boolean = false;

    private _placeholders: IPlaceholders;

    private _shadowVisibility: IShadowVisibility;
    private _resetInEnd: boolean;

    // Массив с отрендерреными ключами
    private _collectionRenderedKeys: string[] = [];

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
        if (options.needScrollCalculation && options.virtualScrollConfig) {
            if (options.collection) {
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
                                                     this._lastScrollTop,
                                                     this._options.resetTopTriggerOffset,
                                                     this._options.resetDownTriggerOffset)};
            newParams.topTrigger = this._topTriggerOffset;
            newParams.bottomTrigger = this._bottomTriggerOffset;
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
                if (options.needScrollCalculation && options.virtualScrollConfig) {
                    ScrollController._setCollectionIterator(options.collection, options.virtualScrollConfig.mode);
                }
                result = this._initVirtualScroll(options);
                this._options.collection = options.collection;
                this._options.needScrollCalculation = options.needScrollCalculation;
                this._isRendering = true;
            }
            if (options.resetTopTriggerOffset !== this._options.resetTopTriggerOffset || options.resetDownTriggerOffset !== this._options.resetDownTriggerOffset) {
                this._options.resetTopTriggerOffset = options.resetTopTriggerOffset;
                this._options.resetDownTriggerOffset = options.resetDownTriggerOffset;
                if (!params) {
                    result.triggerOffset = this.getTriggerOffset(this._viewHeight,
                                                                 this._viewportHeight,
                                                                 this._lastScrollTop,
                                                                 this._options.resetTopTriggerOffset,
                                                                 this._options.resetDownTriggerOffset);
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

    getShadowVisibility(): IShadowVisibility {
        if (!this._shadowVisibility && this._virtualScroll) {
            this._calcShadowVisibility(this._options.collection, this._virtualScroll.getRange());
        }
        return this._shadowVisibility;
    }

    setRendering(state: boolean): void {
        this._isRendering = state;
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
    completeVirtualScrollIfNeed(): boolean {
        let result = false;
        if (this._applyScrollTopCallback) {
                this._applyScrollTopCallback();
                this._applyScrollTopCallback = null;
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
        const placeholder = this._virtualScroll?.rangeChanged ? this._placeholders.top : 0;
        const verticalOffset = scrollTop - topOffset - placeholder + (getStickyHeadersHeight(baseContainer, 'top', 'fixed') || 0);

        let firstItemIndex = this._options.collection.getStartIndex();
        firstItemIndex += this._getFirstVisibleItemIndex(listViewContainer.children, verticalOffset);
        firstItemIndex = Math.min(firstItemIndex, this._options.collection.getStopIndex());

        // TODO: Отрефакторить. Задача: https://online.sbis.ru/opendoc.html?guid=0c097079-0143-4b19-9f43-dc38c68ba3bc
        if (this._options.collection.getStartIndex() && this._options.collection.at(0)['[Controls/_display/GroupItem]'] ) {
            firstItemIndex--;
        }
        return this._options.collection.at(firstItemIndex);
    }

    getLastVisibleRecord(listViewContainer: HTMLElement, baseContainer: HTMLElement, scrollTop: number): Model {
        const topOffset = this._getTopOffsetForItemsContainer(listViewContainer, baseContainer);
        const verticalOffset = this._viewportHeight + scrollTop - topOffset + (getStickyHeadersHeight(baseContainer, 'top', 'allFixed') || 0);

        let lastItemIndex = this._options.collection.getStartIndex();
        lastItemIndex += this._getFirstVisibleItemIndex(listViewContainer.children, verticalOffset);
        lastItemIndex = Math.min(lastItemIndex, this._options.collection.getStopIndex());
        return this._options.collection.at(lastItemIndex - 1);
    }

    /**
     * Возращает индекс первого полностью видимого элемента
     * @param {HTMLElement[]} items
     * @param {number} verticalOffset
     * @private
     */
    private _getFirstVisibleItemIndex(items: HTMLElement[], verticalOffset: number): number {
        const firstElementIndex = this._options.virtualScrollConfig.mode === 'hide' ? this._virtualScroll.getRange().start : 0;
        const itemsCount = items.length;
        let itemsHeight = firstElementIndex;
        let i = 0;
        if (verticalOffset <= 0) {
            return 0;
        }
        while (itemsHeight < verticalOffset && i < itemsCount) {
            itemsHeight += uDimension(items[i]).height;
            i++;
        }
        return i - firstElementIndex;
    }

    private _getTopOffsetForItemsContainer(listViewContainer: HTMLElement, baseControlContainer: HTMLElement): number {
        const firstElementIndex = this._options.virtualScrollConfig.mode === 'hide' ? this._virtualScroll.getRange().start : 0;
        let offsetTop = uDimension(listViewContainer.children[firstElementIndex], true).top;
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
                 scrollCallback: Function): Promise<IScrollControllerResult | void> {
        const index = this._options.collection.getIndexByKey(key);

        if (index !== -1) {
            return new Promise((resolve) => {
                if (!this._virtualScroll || !this._options.needScrollCalculation
                            || this._virtualScroll.canScrollToItem(index, toBottom, force)
                            && !this._virtualScroll.rangeChanged) {
                    this._fakeScroll = true;
                    scrollCallback(index);
                    resolve();
                } else {
                    this._inertialScrolling.callAfterScrollStopped(() => {
                        if (this._virtualScroll && this._virtualScroll.rangeChanged) {
                            // Нельзя менять диапазон отображемых элементов во время перерисовки
                            // поэтому нужно перенести scrollToItem на следующий цикл синхронизации (после отрисовки)
                            // Для этого используем _scrollToItemAfterRender.
                            // https://online.sbis.ru/opendoc.html?guid=2a97761f-e25a-4a10-9735-ded67e36e527
                            this._continueScrollToItem = () => {
                                this.scrollToItem(key, toBottom, force, scrollCallback).then(() => {
                                    resolve();
                                });
                            };
                        } else {
                            this._continueScrollToItem = () => {
                                if (this._virtualScroll) {
                                    const rangeShiftResult = this._virtualScroll.resetRange(
                                        index,
                                        this._options.collection.getCount()
                                    );
                                    const newCollectionRenderedKeys: void | string[] = this._setCollectionIndices(
                                        this._options.collection,
                                        rangeShiftResult.range,
                                        false,
                                        this._options.needScrollCalculation
                                    );

                                    // Скролл нужно восстанавливать после отрисовки, для этого используем
                                    // _completeScrollToItem
                                    this._completeScrollToItem = () => {
                                        this._fakeScroll = true;
                                        this.savePlaceholders(rangeShiftResult.placeholders);
                                        scrollCallback(index, {
                                            placeholders: rangeShiftResult.placeholders,
                                            shadowVisibility: this._calcShadowVisibility(
                                                this._options.collection,
                                                rangeShiftResult.range
                                            ),
                                            newCollectionRenderedKeys
                                        });
                                        resolve();
                                    };
                                }
                            };
                        }
                        if (!this._isRendering && this._virtualScroll && !this._virtualScroll.rangeChanged) {
                            this.continueScrollToItemIfNeed();
                        }
                    });
                }
            });
        } else {
            return Promise.resolve();
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
                    topTrigger: this._topTriggerOffset,
                    bottomTrigger: this._bottomTriggerOffset
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
            const newCollectionRenderedKeys: void | string[] = this._setCollectionIndices(
                options.collection,
                rangeShiftResult.range,
                true,
                options.needScrollCalculation
            );
            this.savePlaceholders(rangeShiftResult.placeholders);
            return {
                    newCollectionRenderedKeys,
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
        this._shadowVisibility = {
            up: range.start > 0,
            down: range.stop < collection.getCount()
        };
        return this._shadowVisibility;
    }

    private _setCollectionIndices(
        collection: Collection<Record>,
        {start, stop}: IRange,
        force?: boolean,
        needScrollCalculation?: boolean
    ): void | string[] {
        if (needScrollCalculation) {
            let collectionStartIndex: number;
            let collectionStopIndex: number;
            const newCollectionRenderedKeys: string[] = [];

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

                // При удалении нескольких групп записей из коллекции с использованием setEventRaising(false),
                // приходит нескольно событий удаления, причем после того, как все записи уже удалены.
                // Получается, что после первого события, индексы виртуального скролла превышают размер коллекции.
                // А правильные индексы будут проставлены только после обработки последнего события.
                // А до того момента, вызов итератора приводит к ошибке переполнения индексов.
                // Проставление индексов в коллекцию по событию afterCollectionChange не решило проблему, так как
                // до того, как это событие дойдет до baseControl, вызывается итератор коллекции со старыми индексами,
                // что приводит к той же проблеме.
                // Самый надежный вариант - не ставить в коллекцию stopIndex, который заведомо превышает ее размер.
                collection.setIndexes(start, Math.min(stop, collection.getCount()));
            }
            if (this._options.notifyKeyOnRender) {
                for (let i = start; i < stop; i++) {
                    const collectionItemKey = collection.at(i)?.key;
                    if (collectionItemKey && !this._collectionRenderedKeys.includes(collectionItemKey)) {
                        this._collectionRenderedKeys.push(collectionItemKey);
                        newCollectionRenderedKeys.push(collectionItemKey);
                    }
                }
                return newCollectionRenderedKeys;
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
    scrollPositionChange(params: IScrollParams, virtual: boolean): IScrollControllerResult {
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
        if (this._virtualScroll) {
            const rangeShiftResult = this._virtualScroll.shiftRangeToScrollPosition(params.scrollTop);
            const newCollectionRenderedKeys: void | string[] = this._setCollectionIndices(
               this._options.collection, rangeShiftResult.range, false, this._options.needScrollCalculation);
            this._applyScrollTopCallback = params.applyScrollTopCallback;
            if (!this._isRendering && !this._virtualScroll.rangeChanged) {
                this.completeVirtualScrollIfNeed();
            }
            this.savePlaceholders(rangeShiftResult.placeholders);
            return {
                newCollectionRenderedKeys,
                placeholders: rangeShiftResult.placeholders,
                shadowVisibility: this._calcShadowVisibility(this._options.collection, rangeShiftResult.range)
            };
        }
    }

    isRangeOnEdge(direction: IDirection): boolean {
        return !this._virtualScroll || this._virtualScroll.isRangeOnEdge(direction);
    }

    /**
     * Производит пересчет диапазона в переданную сторону
     * @param direction
     */
    shiftToDirection(direction: IDirection): Promise<IScrollControllerResult> {
        return new Promise((resolve) => {

            if (!this._virtualScroll ||
                this._virtualScroll &&
                !this._virtualScroll.rangeChanged &&
                this.isRangeOnEdge(direction) ||
                !this._virtualScroll && this._options.virtualScrollConfig &&
                this._options.virtualScrollConfig.pageSize > this._options.collection.getCount()) {
                resolve(null);
            } else {
                if (this._virtualScroll && !this._virtualScroll.rangeChanged) {
                    this._inertialScrolling.callAfterScrollStopped(() => {
                        const rangeShiftResult = this._virtualScroll.shiftRange(direction);
                        const newCollectionRenderedKeys: void | string[] =
                           this._setCollectionIndices(this._options.collection, rangeShiftResult.range, false,
                            this._options.needScrollCalculation);
                        this.savePlaceholders(rangeShiftResult.placeholders);
                        resolve({
                            newCollectionRenderedKeys,
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
                true,
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

    handleMoveItems(addIndex: number, addedItems: object[], removeIndex: number, removedIitems: object[],  direction?: IDirection): IScrollControllerResult {
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
        const removeItemsResult = this._virtualScroll.removeItems(removeIndex, removedIitems.length);
        const newCollectionRenderedKeys: void | string[] =
           this._setCollectionIndices(this._options.collection, removeItemsResult.range, false,
            this._options.needScrollCalculation);
        this.savePlaceholders(removeItemsResult.placeholders);
        return {
            ...result,
            newCollectionRenderedKeys,
            placeholders: removeItemsResult.placeholders,
            shadowVisibility: this._calcShadowVisibility(this._options.collection, removeItemsResult.range)
        };
    }
    /**
     * Обработатывает добавление элементов в коллекцию
     * @param addIndex
     * @param items
     * @param direction направление добавления
     * @param shift автоматически сдвинуть диапазон в направлении direction
     * @private
     */
    handleAddItems(addIndex: number, items: object[], direction?: IDirection, shift: boolean = false): IScrollControllerResult {
        let result = {};
        if (!this._virtualScroll) {
            result = this._initVirtualScroll(
                {...this._options, forceInitVirtualScroll: true},
                (this._options.collection.getCount() - items.length)
            );
        }

        let rangeShiftResult = this._virtualScroll.addItems(
            addIndex,
            items.length,
            this._triggerVisibility,
            direction
        );
        if (shift && this._options.collection.getCount() - items.length >= this._options.virtualScrollConfig.pageSize) {
            rangeShiftResult = this._virtualScroll.shiftRange(direction);
        }
        const newCollectionRenderedKeys: void | string[] =
           this._setCollectionIndices(this._options.collection, rangeShiftResult.range, false,
            this._options.needScrollCalculation);
        this.savePlaceholders(rangeShiftResult.placeholders);
        return {
            ...result,
            newCollectionRenderedKeys,
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
        let result = {};
        if (!this._virtualScroll) {
            result = this._initVirtualScroll(
                {...this._options, forceInitVirtualScroll: true},
                (this._options.collection.getCount() + items.length)
            );
        }
        if (this._virtualScroll) {
            const rangeShiftResult = this._virtualScroll.removeItems(removeIndex, items.length);
            this.savePlaceholders(rangeShiftResult.placeholders);
            return {
                ...result,
                placeholders: rangeShiftResult.placeholders,
                shadowVisibility: this._calcShadowVisibility(this._options.collection, rangeShiftResult.range)
            };
        }
    }

    handleResetItems(): IScrollControllerResult {
        return this._initVirtualScroll(this._options);
    }

    calculateVirtualScrollHeight(): number {
        return Math.max(this._virtualScroll.calculateVirtualScrollHeight(),
                        this._viewHeight + this._placeholders.top + this._placeholders.bottom);
    }
    setResetInEnd(resetInEnd: boolean) {
        this._resetInEnd = resetInEnd;
    }

    destroy() {
        this._options.collection && this._options.collection.setIndexes(0, 0);
    }

    private getTriggerOffset(scrollHeight: number, viewportHeight: number, scrollTop: number, resetTopTriggerOffset: boolean, resetDownTriggerOffset: boolean):
            {top: number, bottom: number} {
        const maxTopOffset = Math.min(scrollTop + viewportHeight / 2, scrollHeight / 2);
        const maxBottomOffset = scrollHeight - maxTopOffset;

        this._topTriggerOffset = Math.min((scrollHeight && viewportHeight ? Math.min(scrollHeight, viewportHeight) : 0) *
            (this._options.topTriggerOffsetCoefficient || DEFAULT_TRIGGER_OFFSET), maxTopOffset);
        this._bottomTriggerOffset = Math.min((scrollHeight && viewportHeight ? Math.min(scrollHeight, viewportHeight) : 0) *
            (this._options.bottomTriggerOffsetCoefficient || DEFAULT_TRIGGER_OFFSET), maxBottomOffset);

        // Сбрасываем топ триггер в -1, чтобы триггер сразу же не сработал, раньше был паддинг в темплейте
        const topTriggerOffset = resetTopTriggerOffset ? -1 : this._topTriggerOffset;
        const bottomTriggerOffset = resetDownTriggerOffset ? 0 : this._bottomTriggerOffset;
        return {top: topTriggerOffset, bottom: bottomTriggerOffset};
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
            topTriggerOffsetCoefficient: DEFAULT_TRIGGER_OFFSET,
            bottomTriggerOffsetCoefficient: DEFAULT_TRIGGER_OFFSET
        };
    }
}
