import {IDirection} from '../interface/IVirtualScroll';
import {IObservable} from 'Types/collection';
import * as getDimension from 'Controls/Utils/getDimensions';
import {Collection} from 'Controls/display';

let displayLib: typeof import('Controls/display');

const DEFAULT_VIRTUAL_PAGE_SIZE = 100;
const DEFAULT_PAGE_SIZE_TO_SEGMENT_RELATION = 1 / 4;

type IVirtualItem = number;

interface IVirtualScrollControllerOptions {
    pageSize: number;
    segmentSize: number;
    indexesChangedCallback: Function;
    loadMoreCallback: Function;
    placeholderChangedCallback: Function;
    saveScrollPositionCallback: Function;
    itemHeightProperty: string;
    viewModel: Collection<entityRecord>;
    useNewModel: boolean;
    viewportHeight: number;
    mode: string;
}

type IPlaceholders = [number, number];

/**
 * Контроллер расчета видимых данных
 * @author Волоцкой В.Д.
 */
export default class VirtualScrollController {
    private startIndex: number = 0;
    private stopIndex: number = 0;
    private savedStartIndex: number = 0;
    private itemsHeights: IVirtualItem[] = [];
    private itemsOffsets: number[] = [];
    private _options: IVirtualScrollControllerOptions;
    triggerVisibility: {
        up: boolean;
        down: boolean;
    } = {up: false, down: false};
    triggerOffset: number = 0;
    itemsCount: number = 0;
    // Флаг того, что поменялся набор записей, необходим для пересчета высот
    itemsChanged: boolean = false;

    set viewportHeight(value: number) {
        this._options.viewportHeight = value;
    }

    get viewportHeight(): number {
        return this._options.viewportHeight;
    }

    scrollTop: number = 0;
    itemsContainerHeight: number = 0;
    itemsFromLoadToDirection: boolean = false;

    private _itemsContainer: HTMLElement;

    set itemsContainer(container: HTMLElement) {
        this._itemsContainer = container;
        this.recalcItemsHeights();
    }

    get itemsContainer(): HTMLElement {
        return this._itemsContainer;
    }

    constructor(options: IVirtualScrollControllerOptions) {
        const pageSize = options.pageSize || DEFAULT_VIRTUAL_PAGE_SIZE;
        const segmentSize = options.segmentSize || Math.ceil(pageSize * DEFAULT_PAGE_SIZE_TO_SEGMENT_RELATION);
        this._options = {
            ...options,
            pageSize, segmentSize
        };
        this.subscribeToModelChange(options.viewModel, options.useNewModel);
        if (options.useNewModel) {
            displayLib = require('Controls/display');
            this.setupModelController(options.viewModel, options.mode);
        }
    }

    /**
     * Пересчет индексов "видимого" набора данных от индекса
     * @param {number} itemIndex
     */
    recalcRangeFromIndex(itemIndex: number): void {
        let newStartIndex = this.startIndex;
        let newStopIndex = this.stopIndex;

        if (this._options.pageSize < this.itemsCount) {
            newStartIndex = itemIndex;
            newStopIndex = newStartIndex + this._options.pageSize;

            if (newStopIndex >= this.itemsCount) {
                newStopIndex = this.itemsCount;
                newStartIndex = newStopIndex - this._options.pageSize;
            }
        } else {
            newStartIndex = 0;
            newStopIndex = this.itemsCount;
        }

        this.checkIndexesChanged(newStartIndex, newStopIndex);
    }

    /**
     * Пересчет индексов "видимого" набора данных при скроллировании
     * @param {IDirection} direction
     * @param {boolean} shouldLoad
     */
    recalcRangeToDirection(direction: IDirection, shouldLoad: boolean = true): void {
        this.actualizeSavedIndexes();
        const segmentSize = this._options.segmentSize;
        let newStartIndex = this.startIndex;
        let newStopIndex = this.stopIndex;
        let needToLoadMore: boolean = false;

        if (this.startIndex === 0 && direction === 'up' || this.stopIndex === this.itemsCount && direction === 'down') {
            needToLoadMore = true;
        } else {
            const quantity = this.getItemsToHideQuantity(direction);

            if (direction === 'up') {
                if (newStartIndex <= segmentSize) {
                    needToLoadMore = true;
                }

                newStartIndex = Math.max(0, newStartIndex - segmentSize);
                newStopIndex -= quantity;
            } else {
                if (newStopIndex + segmentSize >= this.itemsCount) {
                    needToLoadMore = true;
                }

                newStopIndex = Math.min(newStopIndex + segmentSize, this.itemsCount);
                newStartIndex += quantity;
            }

            this.checkIndexesChanged(newStartIndex, newStopIndex, direction);
        }


        if (needToLoadMore && shouldLoad) {
            this._options.loadMoreCallback(direction);
        }
    }

    /**
     * Вычисление индексов "видимого" набора данных от scrollTop
     * @remark Необходимо вызывать при изменении виртуального scrollTop
     */
    recalcRangeFromScrollTop(): void {
        const scrollTop = this.scrollTop;
        let newStartIndex = 0;
        let tempPlaceholderSize = 0;
        while (tempPlaceholderSize + this.itemsHeights[newStartIndex] <= scrollTop - this.triggerOffset) {
            tempPlaceholderSize += this.itemsHeights[newStartIndex];
            newStartIndex++;
        }

        this.startIndex = Math.max(newStartIndex - (Math.trunc(this._options.pageSize / 2)), 0);
        this.stopIndex = Math.min(this.startIndex + this._options.pageSize, this.itemsCount);

        // Если мы скроллим быстро к концу списка, startIndex может вычислиться такой,
        // что число отрисовываемых записей будет меньше virtualPageSize (например если
        // в списке из 100 записей по scrollTop вычисляется startIndex == 95, то stopIndex
        // будет равен 100 при любом virtualPageSize >= 5.
        // Нам нужно всегда рендерить virtualPageSize записей, если это возможно, т. е. когда
        // в коллекции достаточно записей. Поэтому если мы находимся в конце списка, пробуем
        // отодвинуть startIndex назад так, чтобы отрисовывалось нужное число записей.
        if (this.stopIndex === this.itemsCount) {
            const missingCount = this._options.pageSize - (this.stopIndex - this.startIndex);
            if (missingCount > 0) {
                this.startIndex = Math.max(this.startIndex - missingCount, 0);
            }
        }

        this._options.indexesChangedCallback(this.startIndex, this.stopIndex);
        this._options.placeholderChangedCallback(this.calcPlaceholderSize());

    }

    /**
     * Обнуляет данные о записях, стартует виртуальный скроллинг с нуля
     */
    reset(startIndex?: number): void {
        this.itemsHeights = [];
        this.itemsOffsets = [];
        const initialIndex = startIndex || 0;

        if (this._options.itemHeightProperty) {
            this.recalcFromItemHeightProperty(initialIndex);
        } else {
            this.recalcRangeFromIndex(initialIndex);
        }
        this.actualizeSavedIndexes();
    }

    /**
     * Пересчитывает высота "видимого" набора данных
     */
    recalcItemsHeights(): void {
        const startIndex = this.startIndex;
        const items = this._itemsContainer.children;
        const updateLength = Math.min(this.stopIndex - startIndex, items.length);

        this.updateItemsHeights(startIndex, updateLength);
        this.itemsContainerHeight = this._itemsContainer.offsetHeight;
    }

    actualizeSavedIndexes(): void {
        this.savedStartIndex = this.startIndex;
    }

    getRestoredScrollPosition(direction: IDirection): number {
        return direction === 'up' ? this.scrollTop + this.getItemsHeights(this.startIndex, this.savedStartIndex) :
            this.scrollTop - this.getItemsHeights(this.savedStartIndex, this.startIndex);
    }

    /**
     * Проверяет возможность подскроллить к элементу
     * @param {number} index
     * @returns {boolean}
     */
    canScrollToItem(index: number): boolean {
        let canScroll = false;

        if (this.stopIndex === this.itemsCount) {
            canScroll = true;
        } else if (this.startIndex <= index && this.stopIndex > index) {
            if (this._options.viewportHeight < this.itemsContainerHeight - this.itemsOffsets[index]) {
                canScroll = true;
            }
        }

        return canScroll;
    }

    /**
     * Выставляет стартовый индекс виртуальнного скролла
     * @param {number} index
     * @remark Нужен для загрузки данных вверх, так как в таком случае произойдет сдвиг "видимого" набора данных
     */
    setStartIndex(index: number): void {
        this.startIndex = Math.max(0, index);
        this.stopIndex = Math.min(this.itemsCount, this.startIndex + this._options.pageSize);
    }

    getActiveElement(): number {
        if (!this.itemsHeights.length) {
            return undefined;
        } else if (this.isScrolledToBottom()) {
            return this.stopIndex - 1;
        } else if (this.isScrolledToTop()) {
            return this.startIndex;
        } else {
            let itemIndex;
            const halfDivider = 2;
            const viewportCenter = this.scrollTop + (this._options.viewportHeight / halfDivider);

            for (let i = this.startIndex; i < this.stopIndex; i++) {
                if (this.itemsOffsets[i] < viewportCenter) {
                    itemIndex = i;
                } else {
                    break;
                }
            }

            return itemIndex;
        }
    }

    getItemOffset(index: number): number {
        return this.itemsOffsets[index];
    }

    /**
     * Высчитывает индексы видимого набора исходя из itemHeightProperty
     * @param {number} startIndex
     * @remark Если разработчик знает данные о высотах элементов и viewport, то он может указать их в данных элемента
     * и рассчет видимого набора элементов будет выполнен без подсчета высот элементов
     */
    private recalcFromItemHeightProperty(startIndex: number): void {
        let sumHeight = 0;
        let stopIndex: number;

        for (let i = startIndex; i < this.itemsCount; i++) {
            const itemHeight = this._options.viewModel.at(i).getContents().get(this._options.itemHeightProperty);
            if (sumHeight + itemHeight <= this._options.viewportHeight) {
                sumHeight += itemHeight;
            } else {
                stopIndex = i;
                break;
            }
        }

        /**
         * @remark Так как списки итерируются пока i < stopIndex, то нужно добавить 1
         * @example items: [{height: 20, ...}, {height: 40, ...}, {height: 50, ...}], itemHeightProperty: 'height'
         * viewportHeight: 70
         * Если бы мы не добавили единицу, то получили бы startIndex = 0 и stopIndex = 2, но так как итерируюется
         * пока i < stopIndex, то мы получим не три отрисованных элемента, а 2
         */
        this.checkIndexesChanged(startIndex, stopIndex + 1);
    }

    /**
     * Возвращает сумму высот элементов с startIndex до stopIndex
     * @param {number} startIndex
     * @param {number} stopIndex
     * @returns {number}
     */
    private getItemsHeights(startIndex: number, stopIndex: number): number {
        let height = 0;
        const fixedStartIndex = Math.max(startIndex, 0);
        const fixedStopIndex = Math.min(stopIndex, this.itemsHeights.length);
        const items = this.itemsHeights;

        for (let i = fixedStartIndex; i < fixedStopIndex; i++) {
            height += items[i];
        }

        return height;
    }

    /**
     * Добавляет высоты записей
     * @remark Используется при загрузке вверх, когда необходимо сместить индексы записей
     * @param {number} itemIndex
     * @param {number} itemsHeightsCount
     */
    private insertItemsHeights(itemIndex: number, itemsHeightsCount: number): void {
        let topItemsHeight = this.itemsHeights.slice(0, itemIndex),
            insertedItemsHeights = [],
            bottomItemsHeight = this.itemsHeights.slice(itemIndex);

        for (let i = 0; i < itemsHeightsCount; i++) {
            insertedItemsHeights[i] = 0;
        }

        this.itemsHeights = [...topItemsHeight, ...insertedItemsHeights, ...bottomItemsHeight];
    }

    /**
     * Удаляет высоты записей
     * @param {number} itemIndex
     * @param {number} itemsHeightsCount
     */
    private cutItemsHeights(itemIndex: number, itemsHeightsCount: number): void {
        this.itemsHeights.splice(itemIndex, itemsHeightsCount);
    }

    private subscribeToModelChange(model: Collection<entityRecord>, useNewModel: boolean) {
        if (useNewModel) {
            model.subscribe('onCollectionChange', (...args: unknown[]) => {
                this.collectionChangedHandler.apply(this, [args[0], null, ...args.slice(1)]);
            });
        } else {
            model.subscribe('onListChange', this.collectionChangedHandler);
        }
    }

    /**
     * Обработчик смены данных в модели
     * @param {string} event
     * @param {string} changesType
     * @param {string} action
     * @param {CollectionItem<entityRecord>[]} newItems
     * @param {number} newItemsIndex
     * @param {CollectionItem<entityRecord>[]} removedItems
     * @param {number} removedItemsIndex
     */
    private collectionChangedHandler = (event: string, changesType: string, action: string, newItems: object[],
                                        newItemsIndex: number, removedItems: object[], removedItemsIndex: number): void => {
        const newModelChanged = this._options.useNewModel && action && action !== IObservable.ACTION_CHANGE;

        if ((changesType === 'collectionChanged' || newModelChanged) && action) {
            this.itemsCount = this._options.viewModel.getCount();

            if (action === IObservable.ACTION_ADD || action === IObservable.ACTION_MOVE) {
                this.itemsAddedHandler(newItemsIndex, newItems);
            }

            if (action === IObservable.ACTION_REMOVE || action === IObservable.ACTION_MOVE) {
                this.itemsRemovedHandler(removedItemsIndex, removedItems);
            }

            if (action === IObservable.ACTION_RESET) {
                this.reset();
            }

            this._options.indexesChangedCallback(this.startIndex, this.stopIndex);
        }
    }

    private itemsAddedHandler(newItemsIndex: number, newItems: object[]): void {
        this.insertItemsHeights(newItemsIndex, newItems.length);

        // Обновляем виртуальный скроллинг, только если он инициализирован, так как в другом случае,
        // мы уже не можем на него повлиять
        if (this.itemsContainer) {
            const startIndex =
                this._options.useNewModel
                ? displayLib.VirtualScrollController.getStartIndex(this._options.viewModel)
                : this._options.viewModel.getStartIndex();
            const direction = newItemsIndex <= startIndex ? 'up' : 'down';

            if (direction === 'up' && this.itemsFromLoadToDirection) {
                this.savedStartIndex += newItems.length;
                this.setStartIndex(this.startIndex + newItems.length);
            }

            if (this.triggerVisibility[direction] && !this.itemsChanged) {
                this.recalcRangeToDirection(direction, false);
                this._options.saveScrollPositionCallback(direction);
            }
        }
    }

    private itemsRemovedHandler(removedItemsIndex: number, removedItems: object[]): void {
        this.cutItemsHeights(removedItemsIndex, removedItems.length);

        // Сдвигаем виртуальный скролл только если он уже проинициализирован. Если коллекция
        // изменилась после создания BaseControl'a, но до инициализации скролла, (или сразу
        // после уничтожения BaseControl), сдвинуть его мы все равно не можем.
        if (this.itemsContainer && !this.itemsChanged) {
            const startIndex =
                this._options.useNewModel
                ? displayLib.VirtualScrollController.getStartIndex(this._options.viewModel)
                : this._options.viewModel.getStartIndex();
            this.recalcRangeToDirection(
                removedItemsIndex < startIndex ? 'up' : 'down', false
            );
        }
    }

    private isScrolledToBottom(): boolean {
        return this.stopIndex === this.itemsCount &&
            this.scrollTop + this._options.viewportHeight === this.itemsContainerHeight;
    }

    private isScrolledToTop(): boolean {
        return this.scrollTop === 0 && this.startIndex === 0;
    }

    /**
     * Проверяет поменялись ли индексы "видимого" набора данных
     * @param {number} newStartIndex
     * @param {number} newStopIndex
     * @param {string} direction
     */
    private checkIndexesChanged(newStartIndex: number, newStopIndex: number, direction?: string): void {
        if (this.stopIndex !== newStopIndex || this.startIndex !== newStartIndex) {
            this._options.indexesChangedCallback(this.startIndex = newStartIndex, this.stopIndex = newStopIndex, direction);
            this._options.placeholderChangedCallback(this.calcPlaceholderSize());
        }
    }

    /**
     * Вычисляет размеры виртуальных распорок
     * @returns {IPlaceholders}
     */
    private calcPlaceholderSize(): IPlaceholders {
        return [
            this.getItemsHeights(0, this.startIndex),
            this.getItemsHeights(this.stopIndex, this.itemsCount)
        ];
    }

    /**
     * Обновляет высоты "видимого" набора данных
     * @param {number} startUpdateIndex
     * @param {number} updateLength
     */
    private updateItemsHeights(startUpdateIndex: number, updateLength: number): void {
        let startChildrenIndex = 0;
        let sum = 0;

        for (let i = startChildrenIndex, len = this._itemsContainer.children.length; i < len; i++) {
            if (this._itemsContainer.children[i].className.indexOf('controls-ListView__hiddenContainer') === -1) {
                startChildrenIndex = i;
                break;
            }
        }

        for (let i = 0; i < updateLength; i++) {
            const itemHeight = getDimension(this._itemsContainer.children[startChildrenIndex + i] as HTMLElement).height;

            this.itemsHeights[startUpdateIndex + i] = itemHeight;
            this.itemsOffsets[startUpdateIndex + i] = sum;
            sum += itemHeight;
        }
    }

    /**
     * Вычисляет количество элементов, которые необходимо скрыть
     * @remark Оставляем запас в 2 viewport, чтобы обеспечить плавное скроллирование
     * @param {IDirection} direction
     * @returns {number}
     */
    private getItemsToHideQuantity(direction: IDirection): number {
        let quantity = 0;
        const items = this.itemsHeights;

        if (direction === 'up') {
            let stopIndex = this.stopIndex - 1;
            const offsetDistance = this._options.viewportHeight * 2 + this.scrollTop + this.triggerOffset;

            while (this.itemsOffsets[stopIndex] > offsetDistance) {
                stopIndex--;
                quantity++;
            }
        } else {
            let startIndex = this.startIndex;
            let sumHeight = 0;
            const offsetDistance = this.scrollTop - this.triggerOffset - this._options.viewportHeight;


            while (sumHeight + items[startIndex] < offsetDistance) {
                sumHeight += items[startIndex];
                quantity++;
                startIndex++;
            }
        }

        return quantity;
    }

    /**
     * Настраивает модель на работу в переданном режиме виртуального скролла (сейчас hide или remove)
     * @param model
     * @param scrollMode
     */
    private setupModelController(model: unknown, scrollMode: string): void {
        switch (scrollMode) {
            case 'hide':
                displayLib.VirtualScrollHideController.setup(model);
                break;
            default:
                displayLib.VirtualScrollController.setup(model);
                break;
        }
    }
}
