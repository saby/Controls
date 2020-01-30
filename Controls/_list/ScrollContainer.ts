import {Control, TemplateFunction, IControlOptions} from 'UI/Base';
import * as template from 'wml!Controls/_list/ScrollContainer/ScrollContainer';
import VirtualScroll from './ScrollContainer/VirtualScroll';
import {SyntheticEvent} from 'Vdom/Vdom';
import {detection} from 'Env/Env';
import scrollToElement = require('Controls/Utils/scrollToElement');
import InertialScrolling from './resources/utils/InertialScrolling';
import {throttle} from 'Types/function';
import {descriptor, Record as entityRecord} from 'Types/entity';
import {IDirection, IVirtualScrollConfig, IVirtualScrollMode} from './interface/IVirtualScroll';
import {Logger} from 'UI/Utils';
import {Collection} from 'Controls/display';

const SCROLLMOVE_DELAY = 150;
export const DEFAULT_VIRTUAL_PAGE_SIZE = 100;
const LOADING_INDICATOR_SHOW_TIMEOUT = 2000;

interface IDeprecatedOptions {
    virtualScrollMode: IVirtualScrollMode;
    virtualPageSize: number;
    virtualSegmentSize: number;
}
interface IOptions extends IControlOptions, IDeprecatedOptions {
    virtualScrollConfig: IVirtualScrollConfig;
    viewModel: Collection<entityRecord>;
    useNewModel: boolean;
    virtualScrolling: boolean;
    observeScroll: boolean;
    activeElement: string|number;
}

interface IScrollParams {
    scrollTop: number;
    clientHeight: number;
    scrollHeight?: number;
    viewPortRect?: number;
}

const DEFAULT_TRIGGER_OFFSET = 0;
const TRIGGER_VISIBILITY_DELAY = 101;
const SIZE_RELATION_TO_VIEWPORT = 0.3;

/**
 * Компонент управляющий скроллированием в списочных контролах
 * Нотифицирует о необходимости подгрузки данных
 * Управляет виртуальным скроллированием
 * @author Волоцкой В.Д.
 * @private
 * @control
 * @extends UI/Base:Control
 */
export default class ScrollContainer extends Control<IOptions> {
    protected _template: TemplateFunction = template;
    protected virtualScroll: VirtualScroll;
    private itemsContainer: HTMLElement;
    private scrollRegistered: boolean = false;

    private indicatorTimeout: number;

    // Стейт отвечающий за показ синхронного индикатора загрузки
    private indicatorState: 'up' | 'down';

    // Флаг фейкового скролла, необходим для корректного рассчета активного элемента
    private fakeScroll: boolean = false;

    // Сущность управляющая инерционным скроллингом на мобильных устройствах
    private inertialScrolling: InertialScrolling = new InertialScrolling();

    // Видимость триггеров загрузки
    private triggerVisibility: {
        up: boolean;
        down: boolean;
    } = {up: false, down: false};

    // Размер виртуальных распорок
    private placeholdersSizes: {
        top: number;
        bottom: number;
    } = {top: 0, bottom: 0};

    // Размер контейнера
    private viewportHeight: number;
    private viewSize: number;

    // Таймаут для проверки необходимости дозагрузки данных
    private checkTriggerVisibilityTimeout: number;

    // Флаг и стейт для индикации необходимости сохранения позиции скролла и его направления
    private saveScrollPosition: boolean;
    private savedScrollDirection: IDirection;

    // Стейт, хранящий ссылку на модель, нужен для сохранения индексов на _beforeMount, так как во время выполнения
    // _beforeMount модель не лежит в _options
    private viewModel: Collection<entityRecord>;

    // Коллбек, который нужно выполнить на следующую перерисовку
    private afterRenderCallback: Function;

    // Коллбек, восстававливающий позицию скролла
    private applyScrollTopCallback: Function;

    // Оффсеты загрузочных триггеров
    protected triggerOffset: number = DEFAULT_TRIGGER_OFFSET;
    private __mounted: boolean;


    set itemsFromLoadToDirection(value) {
        this.virtualScroll.itemsFromLoadToDirection = value;
    }

    protected _beforeMount(options: IOptions): void {
        this.initModel(options);
    }

    protected _afterMount(): void {
        this.__mounted = true;

        if (this._options.virtualScrolling) {
            this.virtualScroll.itemsChanged = false;
        }

        if (this._options.observeScroll) {
            this.registerScroll();
        }

        if (this._options.activeElement) {
            this.scrollToItem(this._options.activeElement);
        }
    }

    protected _beforeUpdate(options: IOptions): void {
        if (this._options.viewModel !== options.viewModel) {
            this.initModel(options);

            if (options.activeElement) {
                this.afterRenderCallback = () => {
                    this.scrollToItem(options.activeElement);
                };
            }
        }

        if (this._options.observeScroll) {
            this.registerScroll();
        }

        if (this.indicatorState) {
            this.indicatorTimeout = setTimeout(() => {
                this._notify('changeIndicatorState', [true, this.indicatorState]);
            }, LOADING_INDICATOR_SHOW_TIMEOUT);
        }
    }

    protected _beforeRender(): void {
        if (this.saveScrollPosition) {
            this._notify('saveScrollPosition', [], {bubbling: true});
        }
    }

    protected _afterRender(): void {
        if (this.virtualScroll && this.virtualScroll.itemsContainer && this.virtualScroll.itemsChanged) {
            this.virtualScroll.recalcItemsHeights();
            this.virtualScroll.itemsChanged = false;
        }

        this.updateShadowMode();

        if (this.virtualScroll && this.applyScrollTopCallback) {
            this.applyScrollTopCallback();
            this.applyScrollTopCallback = null;

            this.checkTriggerVisibilityWithTimeout();
        }

        if (this.afterRenderCallback) {
            this.afterRenderCallback();
            this.afterRenderCallback = null;
        }

        if (this.indicatorState) {
            this._notify('changeIndicatorState', [false, this.indicatorState]);
            this.indicatorState = null;
            clearTimeout(this.indicatorTimeout);
        }

        if (this.saveScrollPosition) {
            if (this.savedScrollDirection) {
                this.scrollToPosition(this.virtualScroll.getRestoredScrollPosition(this.savedScrollDirection));
            }
            this.saveScrollPosition = false;
            this.savedScrollDirection = null;
            this.checkTriggerVisibilityWithTimeout();
        }
    }

    protected _beforeUnmount(): void {
        clearTimeout(this.checkTriggerVisibilityTimeout);
    }

    protected itemsContainerReadyHandler(_: SyntheticEvent<Event>, itemsContainer: HTMLElement): void {
        if (this._options.virtualScrolling) {
            this.virtualScroll.itemsContainer = itemsContainer;
        }

        this.itemsContainer = itemsContainer;
    }


    /**
     * Обновление режима тени, в зависимости от размеров виртуальных распорок
     * @remark Так как при виртуальном скроллировании отображается только некоторый "видимый" набор записей
     * то scrollContainer будет неверно рассчитывать наличие тени, поэтому управляем режимом тени вручную
     */
    private updateShadowMode(): void {
        this._notify('updateShadowMode', [this.placeholdersSizes]);
    }

    /**
     * Инициализация модели и подписка на ее изменения
     */
    private initModel(options: IOptions): void {
        this.viewModel = options.viewModel;

        if (options.virtualScrolling) {
            this.initModelObserving(options);
        }
    }

    private initModelObserving(options: IOptions): void {
        this.virtualScroll = new VirtualScroll({
            placeholderChangedCallback: this.placeholdersChangedCallback,
            indexesChangedCallback: this.indexesChangedCallback,
            loadMoreCallback: this.loadMoreCallback,
            saveScrollPositionCallback: this.saveScrollPositionCallback,
            viewModel: options.viewModel,
            useNewModel: options.useNewModel,
            ...this.getVirtualScrollConfig(options)
        });
        this.virtualScroll.triggerOffset = this.triggerOffset;
        this.reset(this.viewModel.getCount(), options.activeElement);
    }

    protected viewResizeHandler(): void {
        if (this.__mounted && this.virtualScroll) {
            this.virtualScroll.recalcItemsHeights();
        }

        this.viewSize = this._container.clientHeight;

        if (this._options.observeScroll) {
            this.updateTriggerOffset(this.viewportHeight, this.viewSize);
        }

        this._notify('viewResize');
    }

    protected virtualScrollMoveHandler(params): void {
        if (this.virtualScroll) {
            this.applyScrollTopCallback = params.applyScrollTopCallback;
            this.throttledUpdateIndexesByVirtualScrollMove(params);
        }
    }

    /**
     * Обработчик изменения позиции "виртуального" скролла
     * @type {Function}
     * @remark Для повышения производительности используем throttle, чтобы не вызывать пересчет "видимого" набора
     * данных слишком часто
     */
    protected throttledUpdateIndexesByVirtualScrollMove = throttle((params) => {
        this.virtualScroll.scrollTop = params.scrollTop;
        this.virtualScroll.recalcRangeFromScrollTop();
    }, SCROLLMOVE_DELAY, true);

    protected emitListScrollHandler(event: SyntheticEvent<Event>, type: string, params: IScrollParams | unknown[]): void {
        switch (type) {
            case 'virtualPageTopStart':
                this.updateViewWindow('up', params as IScrollParams);
                break;
            case 'virtualPageTopStop':
                this.changeTriggerVisibility('up', false);
                break;
            case 'virtualPageBottomStart':
                this.updateViewWindow('down', params as IScrollParams);
                break;
            case 'virtualPageBottomStop':
                this.changeTriggerVisibility('down', false);
                break;
            case 'scrollMoveSync':
                this.handleListScrollSync(params as IScrollParams);
                break;
            case 'viewportResize':
                this.updateViewport(params[0], params[1]);
                break;
            case 'virtualScrollMove':
                this.virtualScrollMoveHandler(params);
                break;
            case 'canScroll':
                this.updateViewport(
                    (params as IScrollParams).clientHeight,
                    (params as IScrollParams).viewPortRect,
                    false
                );
                this.proxyEvent(type, [params as IScrollParams]);
                break;
            case 'scrollResize':
            case 'scrollMove':
            case 'cantScroll':
                this.proxyEvent(type, [params as IScrollParams]);
                break;
        }
    }

    /**
     * Функция подскролла к элементу
     * @param {string | number} key
     * @remark Функция подскролливает к записи, если это возможно, в противном случае вызовется перестроение
     * от элемента
     */
    scrollToItem(key: string|number): Promise<void> {
        return new Promise((resolve, reject) => {
            let itemIndex = this._options.viewModel.getIndexByKey(key);

            if (itemIndex !== -1) {
                if (this._options.virtualScrolling) {
                    const callback = () => {
                        this.scrollToPosition(this.virtualScroll.getItemOffset(itemIndex));
                        resolve();
                    };
                    if (this.virtualScroll.canScrollToItem(itemIndex)) {
                        callback();
                    } else {
                        this.virtualScroll.recalcRangeFromIndex(itemIndex);
                        this.afterRenderCallback = callback;
                    }
                } else {
                    const container = this.itemsContainer.children[itemIndex];

                    if (container) {
                        this.scrollToElement(container as HTMLElement);
                        resolve();
                    } else {
                        reject();
                    }
                }
            } else {
                reject();
            }
        });
    }

    /**
     * Функция обнуляет текущий виртуальный скроллинг
     * @param {number} itemsCount
     * @param {string|number} initialKey
     */
    reset(itemsCount: number, initialKey?: string|number): void {
        if (this.virtualScroll) {
            let initialIndex: number;

            if (typeof initialKey !== 'undefined') {
                initialIndex = this.viewModel.getIndexByKey(initialKey);
            }

            this.virtualScroll.itemsChanged = true;
            this.virtualScroll.itemsCount = itemsCount;
            this.virtualScroll.reset(typeof initialIndex === 'undefined' ? 0 : initialIndex);
        }
    }

    checkTriggerVisibilityWithTimeout(): void {
        this.checkTriggerVisibilityTimeout = setTimeout(() => {
            this.checkTriggerVisibility();
            clearTimeout(this.checkTriggerVisibilityTimeout);
        }, TRIGGER_VISIBILITY_DELAY);
    }

    private getVirtualScrollConfig(options: IOptions): IVirtualScrollConfig {
        let virtualScrollConfig: IVirtualScrollConfig = {
            pageSize: null,
            segmentSize: null,
            itemHeightProperty: null,
            viewportHeight: null,
            mode: 'remove'
        };

        if (options.virtualScrollConfig) {
            virtualScrollConfig = options.virtualScrollConfig;
        } else {
            Logger.warn('Controls.list: Use virtualScrollConfig instead of old virtual scroll config options');

            virtualScrollConfig.segmentSize = options.virtualSegmentSize;
            virtualScrollConfig.pageSize = options.virtualPageSize;
            virtualScrollConfig.mode = options.virtualScrollMode;
        }

        return virtualScrollConfig;
    }

    /**
     * Проверка на видимость триггеров
     * @remark Иногда, уже после загрузки данных триггер остается видимым, в таком случае вызвать повторную загрузку
     * данных
     */
    private checkTriggerVisibility(): void {
        if (!this.applyScrollTopCallback) {
            if (this.triggerVisibility.up) {
                this.updateViewWindow('up');
            }

            if (this.triggerVisibility.down) {
                this.updateViewWindow('down');
            }
        }

    }

    private scrollToPosition(position: number): void {
        this.fakeScroll = true;
        this._notify('restoreScrollPosition', [ position ], {bubbling: true});
        this.fakeScroll = false;
    }

    /**
     * Подскролливает к переданному HTML-элементу
     * @param {HTMLElement} container
     */
    private scrollToElement(container: HTMLElement): void {
        scrollToElement(container, false);
    }

    private updateViewport(viewportHeight: number, viewportRect: DOMRect, shouldNotify: boolean = true): void {
        this.viewportHeight = viewportHeight;
        this.updateTriggerOffset(this.viewportHeight, this.viewSize);

        if (this._options.virtualScrolling) {
            this.virtualScroll.viewportHeight = viewportHeight;
            this.virtualScroll.triggerOffset = this.triggerOffset = SIZE_RELATION_TO_VIEWPORT * viewportHeight;
            this._notify('triggerOffsetChanged', [this.triggerOffset, this.triggerOffset]);
        }

        if (shouldNotify) {
            this.proxyEvent('viewPortResize', [viewportHeight, viewportRect]);
        }
    }

    private handleListScrollSync(params: IScrollParams): void {
        if (detection.isMobileIOS) {
            this.inertialScrolling.scrollStarted();
        }

        if (this._options.virtualScrolling) {
            this.virtualScroll.scrollTop = params.scrollTop;
            this.virtualScroll.viewportHeight = params.clientHeight;
            this.virtualScroll.itemsContainerHeight = params.scrollHeight;

            if (!this.afterRenderCallback && !this.fakeScroll) {
                const activeIndex = this.virtualScroll.getActiveElement();

                if (typeof activeIndex !== 'undefined') {
                    this._notify('activeElementChanged', [
                        this._options.viewModel.at(activeIndex).getUid()
                    ]);
                }
            }
        }

        this.proxyEvent('scrollMoveSync', [params]);
    }

    private proxyEvent(type: string, params: unknown[]): void {
        this._notify(type, [...params]);
    }

    private changeTriggerVisibility(direction: IDirection, state: boolean): void {
        this.triggerVisibility[direction] = state;

        if (this._options.virtualScrolling) {
            this.virtualScroll.triggerVisibility[direction] = state;
        }

        this._notify('triggerVisibilityChanged', [direction, state]);
    }

    /**
     * Обновляет "видимый" набор данных
     * @param {"up" | "down"} direction
     * @param {unknown} params
     * @remark Если виртуальный скроллинг отключен, то вызывает подгрузку данных
     */
    private updateViewWindow(direction: IDirection, params?: IScrollParams): void {
        this.changeTriggerVisibility(direction, true);
        if (this._options.virtualScrolling) {
            if (!this.virtualScroll.itemsChanged) {
                if (params) {
                    this.virtualScroll.viewportHeight = params.clientHeight;
                }

                this.inertialScrolling.callAfterScrollStopped(() => {
                    this.virtualScroll.recalcRangeToDirection(direction);
                });
            }
        } else {
            this._notify('loadMore', [direction]);
        }
    }

    private loadMoreCallback = (direction: IDirection): void => {
        this._notify('loadMore', [direction]);
    }

    private placeholdersChangedCallback = ([top, bottom]: [number, number]): void => {
        if (this.__mounted) {
            this._notify('updatePlaceholdersSize', [{top, bottom}], {bubbling: true});
            this.placeholdersSizes = {top, bottom};
        }
    }

    private indexesChangedCallback = (startIndex: number, stopIndex: number, direction?: IDirection): void => {
        // Пересчет активных элементов
        const model = this.viewModel;

        if (direction) {
            this.indicatorState = direction;
        }

        if (this.applyIndexesToModel(model, startIndex, stopIndex)) {
            if (direction) {
                this.savedScrollDirection = direction;
            }

            this.saveScrollPosition = true;
            this.virtualScroll.itemsChanged = true;
        } else if (this.applyScrollTopCallback) {
            this.applyScrollTopCallback();
            this.applyScrollTopCallback = null;
        }
    }

    private saveScrollPositionCallback = (direction: IDirection): void => {
        this.savedScrollDirection = direction;
        this.saveScrollPosition = true;
    }

    /**
     * Применяет "видимый" набор в модель
     * @param {unknown} model
     * @param {number} startIndex
     * @param {number} stopIndex
     * @returns {boolean}
     */

    private applyIndexesToModel(model: Collection<entityRecord>, startIndex: number, stopIndex: number): boolean {
        if (model.getViewIterator) {
            return model.getViewIterator().setIndices(startIndex, stopIndex);
        } else {
            // @ts-ignore
            return model.setIndexes(startIndex, stopIndex);
        }
    }

    private registerScroll(): void {
        if (!this.scrollRegistered) {

            // @ts-ignore
            this._children.scrollEmitter.startRegister(this._children);
            this.scrollRegistered = true;
        }
    }

    private updateTriggerOffset(viewportSize: number, viewSize: number): void {
        this.triggerOffset = this.getTriggerOffset(viewportSize, viewSize);
        this._children.topVirtualScrollTrigger.style.top = `${this.triggerOffset}px`;
        this._children.bottomVirtualScrollTrigger.style.bottom = `${this.triggerOffset}px`;

        if (this.virtualScroll) {
            this.virtualScroll.triggerOffset = this.triggerOffset;
        }

        this._notify('triggerOffsetChanged', [this.triggerOffset, this.triggerOffset]);
    }

    private getTriggerOffset(viewportSize: number, viewSize: number): number {
        return (viewportSize && viewSize ? Math.min(viewportSize, viewSize) : 0) * SIZE_RELATION_TO_VIEWPORT;
    }

    static getDefaultOptions(): Partial<IOptions> {
        return {
            virtualPageSize: DEFAULT_VIRTUAL_PAGE_SIZE
        };
    }

    static getOptionTypes(): Record<string, Function> {
        return {
            virtualSegmentSize: descriptor(Number),
            virtualPageSize: descriptor(Number)
        };
    }
}
