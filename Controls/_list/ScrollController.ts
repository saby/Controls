import {IControlOptions} from 'UI/Base';
import {Collection} from 'Controls/display';
import VirtualScroll from './ScrollContainer/VirtualScroll';
import {Record, Model} from 'Types/entity';
import {IObservable} from 'Types/collection';
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
 * @control
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
    private _applyScrollTopCallback: Function;

    private _isRendering: boolean = false;

    private _placeholders: IPlaceholders;


    // Флаг, который необходимо включать, чтобы не реагировать на скроллы происходящие вследствие
    // подскроллов создаваемых самим контролом (scrollToItem, восстановление позиции скролла после перерисовок)
    private _fakeScroll: boolean;

    // Сущность управляющая инерционным скроллингом на мобильных устройствах
    private _inertialScrolling: InertialScrolling = new InertialScrolling();

    protected _options: any;

    constructor(options: any) {
        this._options = {...ScrollController.getDefaultOptions(), ...options};
        if (options.needScrollCalculation) {
            if (options.useNewModel) {
                ScrollController._setCollectionIterator(options.collection, options.virtualScrollConfig.mode);
            }
        }
        this._initVirtualScroll(options);
    }

    private savePlaceholders(placeholders: IPlaceholders = null): void {
        if (placeholders) {
            this._placeholders = placeholders;
        }
    }

    callAfterScrollStopped(callback: Function): void {
        this._inertialScrolling.callAfterScrollStopped(callback);
    }

    private updateContainerHeightsData(params: Partial<IScrollParams>):  IScrollControllerResult {
        if (this._virtualScroll && params) {
            let newParams: Partial<IContainerHeights> = {};
            if (params.clientHeight) {
                newParams.viewport = params.clientHeight;
                this._viewportHeight = params.clientHeight;
            }
            if (params.scrollHeight) {
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
                options.needScrollCalculation && !this._options.needScrollCalculation
            )) {
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
                this._options.attachLoadTopTriggerToNull = options.attachLoadTopTriggerToNull
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

    setRendering(state: boolean) {
        this._isRendering = state;
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
     * @return {Model}
     */
    getFirstVisibleRecord(listViewContainer: any, baseContainer: any, scrollTop: number): Model {
        const topOffset = this._getTopOffsetForItemsContainer(listViewContainer, baseContainer);
        const verticalOffset = scrollTop - topOffset + (getStickyHeadersHeight(baseContainer, 'top', 'allFixed') || 0);

        let firstItemIndex = this._options.collection.getStartIndex();
        firstItemIndex += this._getFirstVisibleItemIndex(listViewContainer.children, verticalOffset);
        firstItemIndex = Math.min(firstItemIndex, this._options.collection.getStopIndex());
        const item = this._options.collection.at(firstItemIndex);
        return item.getContents();
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

    private _getTopOffsetForItemsContainer(listViewContainer: any, baseControlContainer: any): number {
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
    scrollToItem(key: string | number, toBottom: boolean = true, force: boolean = false, scrollCallback): Promise<IScrollControllerResult> {
        const index = this._options.collection.getIndexByKey(key);

        if (index !== -1) {
            return new Promise((resolve) => {
                if (this._virtualScroll && this._virtualScroll.canScrollToItem(index, toBottom, force)) {
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
                                this.scrollToItem(key, toBottom, force, scrollCallback).then((result) => resolve(result));
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
                                        resolve({ placeholders: rangeShiftResult.placeholders });
                                    }
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
        const virtualScrollConfig = options.virtualScrollConfig || {};
        if (options.collection && (
            !virtualScrollConfig.pageSize ||
            options.collection.getCount() >= virtualScrollConfig.pageSize ||
            options.forceInitVirtualScroll ||
            this._virtualScroll
        )) {
            this._virtualScroll = new VirtualScroll(
                options.virtualScrollConfig || {},
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
                    activeElement: options.activeElement,
                    scrollToActiveElement: options.activeElement !== undefined
                };
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
            this._setCollectionIndices(this._options.collection, rangeShiftResult.range, false,
                this._options.needScrollCalculation);
            this._applyScrollTopCallback = params.applyScrollTopCallback;
            if (!this._isRendering) {
                this.completeVirtualScrollIfNeed();
            }
            this.savePlaceholders(rangeShiftResult.placeholders);
            return {placeholders: rangeShiftResult.placeholders};
        }
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
                        resolve({placeholders: rangeShiftResult.placeholders});
                    });
                } else {
                    resolve(null);
                }
            }
        });
    }

    updateItemsHeights(itemsHeights: IItemsHeights) {
        if (this._virtualScroll) {
            this._virtualScroll.updateItemsHeights(itemsHeights);
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
     * Обработатывает добавление элементов в коллекцию
     * @param addIndex
     * @param items
     * @param direction направление добавления
     * @private
     */
    handleAddItems(addIndex: number, items: object[], direction?: IDirection): IScrollControllerResult {
        let result = {}
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
        return {...result, placeholders: rangeShiftResult.placeholders };
    }

    /**
     * Обрабатывает удаление элементов из коллекции
     * @param removeIndex
     * @param items
     * @param forcedShift
     * @private
     */
    handleRemoveItems(removeIndex: number, items: object[], forcedShift: boolean): IScrollControllerResult {
        if (this._virtualScroll) {
            const rangeShiftResult = this._virtualScroll.removeItems(removeIndex, items.length, forcedShift);
            this._setCollectionIndices(this._options.collection, rangeShiftResult.range, false,
                this._options.needScrollCalculation);
            this.savePlaceholders(rangeShiftResult.placeholders);
            return { placeholders: rangeShiftResult.placeholders };
        }
    }

    handleResetItems(): IScrollControllerResult {
        /**
         * Бывают случаи, когда activeElement не существует, поэтому проверяем его наличие,
         * и в случае отсутствия меняем activeElement
         */
        if (typeof this._options.collection.at(this._options.activeElement) === 'undefined') {
            const activeIndex = this._virtualScroll.getActiveElementIndex(this._lastScrollTop);
            this._options.activeElement = this._options.collection.at(activeIndex).getUid();
        }
        let result = this._initVirtualScroll(this._options);
        return result;
    }

    private getTriggerOffset(scrollHeight: number, viewportHeight: number, attachLoadTopTriggerToNull: boolean): {top: number, bottom: number} {
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

    calculateVirtualScrollHeight(): number {
        return this._virtualScroll.calculateVirtualScrollHeight();
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
