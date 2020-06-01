import {
    IRange,
    IContainerHeights,
    IDirection,
    IItemsHeights,
    IVirtualScrollOptions, IPlaceholders,
    IRangeShiftResult, ITriggerState, IScrollRestoreParams
} from './interfaces';
import * as getDimensions from 'Controls/Utils/getDimensions';

/**
 * Контроллер, управляющий виртуальным скроллом.
 * @class Controls/_list/ScrollContainer/VirtualScroll
 * @private
 * @author Авраменко А.С.
 */
export default class VirtualScroll {
    private _containerHeightsData: IContainerHeights = {scroll: 0, trigger: 0, viewport: 0};
    private _options: IVirtualScrollOptions;
    private _itemsHeightData: IItemsHeights = {itemsHeights: [], itemsOffsets: []};
    private _range: IRange = {start: 0, stop: 0};
    private _oldRange: IRange = {start: 0, stop: 0};
    private _savedDirection: IDirection;
    private _itemsCount: number;

    rangeChanged: boolean;

    readonly get isNeedToRestorePosition(): boolean {
        return Boolean(this._savedDirection);
    }

    constructor(
        options: Partial<IVirtualScrollOptions>,
        containerData: Partial<IContainerHeights>
    ) {
        this.setOptions(options);
        this.applyContainerHeightsData(containerData);
    }

    setOptions(options: Partial<IVirtualScrollOptions>): void {
        const pageSize = options.pageSize;
        let segmentSize: number = options.segmentSize;

        if (!segmentSize) {
            segmentSize = pageSize ? Math.ceil(pageSize / 4) : 0;
        }

        this._options = {...this._options, ...{segmentSize, pageSize}};
    }

    applyContainerHeightsData(containerData: Partial<IContainerHeights>): void {
        this._containerHeightsData = {...this._containerHeightsData, ...containerData};
    }

    /**
     * Создает новый диапазон видимых индексов
     * @remark Используется при инициализации
     * @param startIndex Начальный индекс создаваемого диапазона
     * @param itemsCount Общее количество элементов
     * @param itemsHeights Высоты элементов
     */
    resetRange(startIndex: number, itemsCount: number, itemsHeights?: Partial<IItemsHeights>): IRangeShiftResult {
        this._itemsCount = itemsCount;
        let createRangeResult: IRangeShiftResult;

        if (itemsHeights) {
            this._itemsHeightData = {...this._itemsHeightData, ...itemsHeights};

            createRangeResult = this._createRangeByItemHeightProperty(startIndex, itemsCount);
        } else {
            createRangeResult = this._createRangeByIndex(startIndex, itemsCount);
        }

        this._oldRange = {...this._range};

        return createRangeResult;
    }

    /**
     * Рассчет видимых индексов от позиции скролла
     * @remark
     * Вызывается при смещении скролла за счет движения скроллбара
     */
    shiftRangeToScrollPosition(virtualScrollPosition: number): IRangeShiftResult {
        const itemsHeights = this._itemsHeightData.itemsHeights;
        const pageSize = this._options.pageSize;
        const itemsCount = this._itemsCount;
        const triggerHeight = this._containerHeightsData.trigger;

        let start = 0;
        let stop: number;
        let tempPlaceholderSize = 0;

        while (tempPlaceholderSize + itemsHeights[start] <= virtualScrollPosition - triggerHeight) {
            tempPlaceholderSize += itemsHeights[start];
            start++;
        }

        start = Math.max(start - (Math.trunc(pageSize / 2)), 0);
        stop = Math.min(start + pageSize, itemsCount);

        // Если мы скроллим быстро к концу списка, startIndex может вычислиться такой,
        // что число отрисовываемых записей будет меньше virtualPageSize (например если
        // в списке из 100 записей по scrollTop вычисляется startIndex == 95, то stopIndex
        // будет равен 100 при любом virtualPageSize >= 5.
        // Нам нужно всегда рендерить virtualPageSize записей, если это возможно, т. е. когда
        // в коллекции достаточно записей. Поэтому если мы находимся в конце списка, пробуем
        // отодвинуть startIndex назад так, чтобы отрисовывалось нужное число записей.
        if (stop === itemsCount) {
            const missingCount = pageSize - (stop - start);
            if (missingCount > 0) {
                start = Math.max(start - missingCount, 0);
            }
        }

        return this._setRange({start, stop});
    }

    /**
     * Производит смещение диапазона за счет добавления новых элементов
     * @param addIndex индекс начиная с которого происходит вставка элементов
     * @param count количество вставляемых элементов
     * @param triggerState видимость триггеров
     * @param predicatedDirection заранее высчитанное направление добавления(необходимо при вызове prepend и append у коллекции)
     */
    insertItems(
        addIndex: number,
        count: number,
        triggerState: ITriggerState,
        predicatedDirection?: IDirection
    ): IRangeShiftResult {
        const direction = predicatedDirection || (addIndex <= this._range.start ? 'up' : 'down');
        this._itemsCount += count;
        this._insertItemHeights(addIndex, count);

        if (direction === 'up' && predicatedDirection) {
            this._oldRange.start += count;
            this._oldRange.stop += count;
            this._range.start = Math.min(this._itemsCount, this._range.start + count);
            this._range.stop = Math.min(this._itemsCount, this._range.stop + count);
        }

        if (predicatedDirection) {
            this._savedDirection = predicatedDirection;
        }

        if (direction === 'down') {
            if (!predicatedDirection && triggerState[direction]) {
                return this.shiftRange(direction);
            } else {
                return this._setRange(this._shiftRangeBySegment(direction, count));
            }
        } else {
            return this._setRange(this._shiftRangeBySegment(direction, count));
        }
    }

    /**
     * Производит смещение диапазона за счет удаления элементов
     * @param removeIndex индекс начиная с которого происходит удаление элементов
     * @param count количество удаляемых элементов
     */
    removeItems(removeIndex: number, count: number): IRangeShiftResult {
        const direction = removeIndex < this._range.start ? 'up' : 'down';
        this._itemsCount -= count;
        this._removeItemHeights(removeIndex, count);

        return this._setRange(
            this.rangeChanged ? this._range : this._shiftRangeBySegment(direction, count)
        );
    }

    /**
     * Производит смещение диапазона по направлению на segmentSize
     * @param direction
     */
    shiftRange(direction: IDirection): IRangeShiftResult {
        this._oldRange = {...this._range};
        this._savedDirection = direction;
        const itemsHeightsData = this._itemsHeightData;
        const itemsCount = this._itemsCount;
        const segmentSize = this._options.segmentSize;
        let {start, stop} = this._range;

        if (segmentSize) {
            const quantity = this._getItemsToHideQuantity(direction);

            if (direction === 'up') {
                start = Math.max(0, start - segmentSize);
                stop -= quantity;
            } else {
                stop = Math.min(stop + segmentSize, itemsCount);
                start += quantity;
            }
        } else {
            start = 0;
            stop = itemsCount;
        }

        return this._setRange({start, stop});
    }

    /**
     * Запоминает данные из ресайза вьюпорта на инстанс
     * @param viewportHeight
     * @param triggerHeight
     * @param itemsContainer
     */
    resizeViewport(viewportHeight: number, triggerHeight: number, itemsContainer?: HTMLElement): void {
        this.applyContainerHeightsData({viewport: viewportHeight, trigger: triggerHeight});

        if (itemsContainer) {
            this._updateItemsHeights(itemsContainer);
        }
    }

    /**
     * Запоминает данные из ресайза вью на инстанс
     * @param viewHeight
     * @param triggerHeight
     * @param itemsContainer
     */
    resizeView(viewHeight: number, triggerHeight: number, itemsContainer?: HTMLElement): void {
        this.applyContainerHeightsData({scroll: viewHeight, trigger: triggerHeight});

        if (itemsContainer) {
            this._updateItemsHeights(itemsContainer);
        }
    }

    /**
     * Обновляет данные об элементах
     * @param container
     */
    updateItemsHeights(container: HTMLElement): void {
        this._updateItemsHeights(container);
        this.rangeChanged = false;
    }

    /**
     * Возвращает параметры для восстановления скролла
     */
    getParamsToRestoreScroll(): IScrollRestoreParams {
        const itemsHeights = this._itemsHeightData.itemsHeights;
        let heightDifference;
        // Могут быть ситуации, когда newStopIndex > oldStopIndex. Например, когда подгружается вверх очередная пачка
        // данных и функция корректировки индекса изменяет не только startIndex, но и stopIndex (вместо 38 делает 40).
        // Тогда корректировку высоты нужно делать с отрицательным знаком, а саму высоту расчитывать обратном порядке.
        if (this._savedDirection === 'up') {
            heightDifference = this._range.stop > this._oldRange.stop ?
                - this._getItemsHeightsSum(this._oldRange.stop, this._range.stop, itemsHeights) :
                this._getItemsHeightsSum(this._range.stop, this._oldRange.stop, itemsHeights);
        } else {
            heightDifference = this._getItemsHeightsSum(this._oldRange.start, this._range.start, itemsHeights);
        }

        const paramsForRestore = {
            direction: this._savedDirection,
            heightDifference
        };

        this._savedDirection = undefined;
        this._oldRange = {...this._range};

        return paramsForRestore;
    }

    getItemContainerByIndex(index: number, itemsContainer: HTMLElement): HTMLElement {
        let startChildrenIndex = 0;

        for (let i = startChildrenIndex, len = itemsContainer.children.length; i < len; i++) {
            if (!itemsContainer.children[i].classList.contains('controls-ListView__hiddenContainer')) {
                startChildrenIndex = i;
                break;
            }
        }

        return itemsContainer.children[startChildrenIndex + index - this._range.start] as HTMLElement;
    }

    /**
     * Проверяет что виртуальное окно находится на переданном краю
     * @param edge
     */
    isRangeOnEdge(edge: IDirection): boolean {
        return edge === 'up' ? this._range.start === 0 : this._range.stop === this._itemsCount;
    }

    /**
     * Проверяет возможность подскроллить к элементу
     * @param itemIndex
     * @param toBottom
     * @param force
     * @remark К элементу можно подскроллить в случае если:
     * - мы скроллим к нижней границе элемента
     * - мы скроллим только если элемент не виден
     * - мы скроллим к верху элемента и его оффсет не превышает высоту вьюпорта
     */
    canScrollToItem(itemIndex: number, toBottom: boolean, force: boolean): boolean {
        let canScroll = false;
        const {viewport, scroll: scrollHeight} = this._containerHeightsData;
        const itemOffset = this._itemsHeightData.itemsOffsets[itemIndex];

        if (this._isItemInRange(itemIndex)) {
            if (
                this._range.stop === this._itemsCount ||
                toBottom ||
                !force ||
                (viewport < scrollHeight - itemOffset)
            ) {
                canScroll = true;
            }
        }

        return canScroll;
    }

    /**
     * Возвращает индекс активного элемента
     * @param scrollTop
     */
    getActiveElementIndex(scrollTop: number): number {
        const {viewport, scroll} = this._containerHeightsData;
        let fixedScrollTop: number;

        // На тач устройствах scroll может заходить за пределы границ контейнера,
        // такие ситуации нужно корректировать под крайние максимальные и минимальные значения
        // scrollTop
        if (scrollTop < 0) {
            fixedScrollTop = 0;
        } else if (viewport + scrollTop > scroll) {
            fixedScrollTop = scroll - viewport;
        } else {
            fixedScrollTop = scrollTop;
        }

        if (!this._itemsCount) {
            return undefined;
        } else if (this.isRangeOnEdge('up') && fixedScrollTop === 0) {
            return this._range.start;
        } else if (this.isRangeOnEdge('down') && fixedScrollTop + viewport === scroll) {
            return this._range.stop - 1;
        } else {
            let itemIndex;
            const {itemsOffsets} = this._itemsHeightData;
            const viewportCenter = fixedScrollTop + viewport / 2;

            for (let i = this._range.start ; i < this._range.stop; i++) {
                if (itemsOffsets[i] < viewportCenter) {
                    itemIndex = i;
                } else {
                    break;
                }
            }

            return itemIndex;
        }
    }

    /**
     * Проверяет наличие элемента в диапазоне по его индексу
     * @param itemIndex
     */
    private _isItemInRange(itemIndex: number): boolean {
        return this._range.start <= itemIndex && this._range.stop > itemIndex;
    }

    /**
     * Получает размеры распорок исходя из текущего range
     * @private
     */
    private _getPlaceholders(): IPlaceholders {
        return {
            top: this._getItemsHeightsSum(
                0,
                this._range.start,
                this._itemsHeightData.itemsHeights
            ),
            bottom: this._getItemsHeightsSum(
                this._range.stop,
                this._itemsHeightData.itemsHeights.length,
                this._itemsHeightData.itemsHeights
            )
        };
    }

    /**
     * Обновляет данные о высотах элементов
     * @param container
     * @private
     */
    private _updateItemsHeights(container: HTMLElement): void {
        let sum = 0;
        let startChildrenIndex = 0;

        for (let i = startChildrenIndex, len = container.children.length; i < len; i++) {
            if (!container.children[i].classList.contains('controls-ListView__hiddenContainer')) {
                startChildrenIndex = i;
                break;
            }
        }

        for (let i = 0, len = Math.min(container.children.length, this._range.stop - this._range.start); i < len; i++) {
            const itemHeight = Math.round(getDimensions(container.children[startChildrenIndex + i] as HTMLElement).height);

            this._itemsHeightData.itemsHeights[this._range.start + i] = itemHeight;
            this._itemsHeightData.itemsOffsets[this._range.start + i] = sum;
            sum += itemHeight;
        }
    }

    /**
     * Расчет видимых индексов от заранее высчитанных высот
     * @remark
     * Используется для оптимизаций частных случаев, когда построить один лишний элемент будет очень дорого,
     * например если один элемент это огромный пункт с кучей контролов внутри)
     * @param startIndex Начальный индекс
     * @param itemsCount Количество элементов
     */
    private _createRangeByItemHeightProperty(startIndex: number, itemsCount: number): IRangeShiftResult {
        const itemsHeights = this._itemsHeightData.itemsHeights;
        const viewportHeight = this._containerHeightsData.viewport;

        let sumHeight = 0;
        let stop: number;
        let start: number = startIndex;

        for (let i = start; i < itemsCount; i++) {
            const itemHeight = itemsHeights[i];
            if (sumHeight + itemHeight <= viewportHeight) {
                sumHeight += itemHeight;
            } else {
                stop = i;
                break;
            }
        }

        if (typeof stop === 'undefined' || stop === itemsCount - 1) {
            stop = itemsCount - 1;
            sumHeight = 0;

            for (let i = stop; i > 0; i--) {
                const itemHeight = itemsHeights[i];

                if (sumHeight + itemHeight <= viewportHeight) {
                    sumHeight += itemHeight;
                } else {
                    start = i;
                    break;
                }
            }
        }

        /**
         * @remark Так как списки итерируются пока i < stopIndex, то нужно добавить 1
         * @example items: [{height: 20, ...}, {height: 40, ...}, {height: 50, ...}], itemHeightProperty: 'height'
         * viewportHeight: 70
         * Если бы мы не добавили единицу, то получили бы startIndex = 0 и stopIndex = 2, но так как итерируюется
         * пока i < stopIndex, то мы получим не три отрисованных элемента, а 2
         */
        return this._setRange({start, stop: stop + 1});
    }

    /**
     * Расчет видимых индексов от переданного индекса
     * @remark
     * Вызывается при инциализации виртуального скролла от переданного индекса
     * @param startIndex
     * @param itemsCount
     */
    private _createRangeByIndex(startIndex: number, itemsCount: number): IRangeShiftResult {
        const pageSize = this._options.pageSize;
        let start;
        let stop;

        if (pageSize && pageSize < itemsCount) {
            start = startIndex;
            stop = start + pageSize;

            if (stop >= itemsCount) {
                stop = itemsCount;
                start = stop - pageSize;
            }
        } else {
            start = 0;
            stop = itemsCount;
        }

        return this._setRange({start, stop});
    }

    private _insertItemHeights(insertIndex: number, length: number): void {
        const topItemsHeight = this._itemsHeightData.itemsHeights.slice(0, insertIndex);
        const insertedItemsHeights = [];
        const bottomItemsHeight = this._itemsHeightData.itemsHeights.slice(insertIndex);

        for (let i = 0; i < length; i++) {
            insertedItemsHeights[i] = 0;
        }

        this._itemsHeightData = {
            ...this._itemsHeightData,
            itemsHeights: topItemsHeight.concat(insertedItemsHeights, bottomItemsHeight)
        };
    }

    private _removeItemHeights(removeIndex: number, length: number): void {
        this._itemsHeightData.itemsHeights.splice(removeIndex, length);
    }

    private _shiftRangeBySegment(direction: IDirection, segmentSize: number): IRange {
        const fixedSegmentSize = Math
            .min(segmentSize, Math.max(this._options.pageSize - (this._range.stop - this._range.start), 0));
        const itemsCount = this._itemsCount;
        let {start, stop} = this._range;

        // TODO Совместимость, пока виртуальный скролл не включен у всех безусловно
        if (!this._options.pageSize) {
            start = 0;
            stop = itemsCount;
        } else if (direction === 'up') {
            start = Math.max(0, start - fixedSegmentSize);
            stop = Math.min(itemsCount, Math.max(this._range.stop, start + this._options.pageSize));
        } else {
            stop = Math.min(stop + fixedSegmentSize, itemsCount);
        }

        return {
            start, stop
        };
    }

    /**
     * Рассчитывает сколько элементов нужно скрыть
     * @remark Оставляем элементов с запасом на 2 вьюпорта для плавного скроллинга
     */
    private _getItemsToHideQuantity(direction: string): number {
        if (direction === 'up') {
            return this._getItemsToHideQuantityToUp();
        } else {
            return this._getItemsToHideQuantityToDown();
        }
    }

    /**
     * Рассчитывает сколько элементов нужно скрыть сверху
     */
    private _getItemsToHideQuantityToUp(): number {
        let quantity = 0;
        let stop = this._range.stop - 1;
        const {viewport, trigger} = this._containerHeightsData;
        const {itemsOffsets} = this._itemsHeightData;
        const offsetDistance = viewport * 2 + trigger;

        while (itemsOffsets[stop] > offsetDistance) {
            stop--;
            quantity++;
        }

        return quantity;
    }

    /**
     * Рассчитывает сколько элементов нужно скрыть сверху
     */
    private _getItemsToHideQuantityToDown(): number {
        let quantity = 0;
        let start = this._range.start;
        let sumHeight = 0;
        const {viewport, trigger, scroll} = this._containerHeightsData;
        const {itemsHeights} = this._itemsHeightData;
        const offsetDistance = (scroll - viewport) - trigger - viewport;

        while (sumHeight + itemsHeights[start] < offsetDistance) {
            sumHeight += itemsHeights[start];
            quantity++;
            start++;
        }

        return quantity;
    }

    private _setRange(range: IRange): IRangeShiftResult {
        if (range.start !== this._range.start || range.stop !== this._range.stop) {
            this._range = range;
            this.rangeChanged = true;
        }

        return {
            range: this._range,
            placeholders: this._getPlaceholders()
        };
    }

    private _getItemsHeightsSum(startIndex: number, stopIndex: number, itemsHeights: number[]): number {
        let sum = 0;
        const fixedStartIndex = Math.max(startIndex, 0);
        const fixedStopIndex = Math.min(stopIndex, itemsHeights.length);

        for (let i = fixedStartIndex; i < fixedStopIndex; i++) {
            sum += itemsHeights[i] || 0;
        }

        return sum;
    }
}
