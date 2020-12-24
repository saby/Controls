import * as isEmpty from 'Core/helpers/Object/isEmpty';
import {detection} from 'Env/Env';
import {Bus} from 'Env/Event';
import {SyntheticEvent} from 'Vdom/Vdom';
import {RegisterClass, RegisterUtil, UnregisterUtil} from 'Controls/event';
import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import {ResizeObserverUtil} from 'Controls/sizeUtils';
import {canScrollByState, getContentSizeByState, getScrollPositionTypeByState, SCROLL_DIRECTION} from './Utils/Scroll';
import {scrollToElement} from './Utils/scrollToElement';
import {scrollTo} from './Utils/Scroll';
import ScrollState from './Utils/ScrollState';
import ScrollModel from './Utils/ScrollModel';
import {IScrollState} from './Utils/ScrollState';
import {SCROLL_MODE} from './Container/Type';
import template = require('wml!Controls/_scroll/ContainerBase/ContainerBase');
import {EventUtils} from 'UI/Events';
import {isHidden} from './StickyHeader/Utils';
import {getHeadersHeight} from './StickyHeader/Utils/getHeadersHeight';

export interface IContainerBaseOptions extends IControlOptions {
    scrollMode?: SCROLL_MODE;
}

const KEYBOARD_SHOWING_DURATION: number = 500;

export default class ContainerBase<T extends IContainerBaseOptions> extends Control<IContainerBaseOptions> {
    protected _template: TemplateFunction = template;
    protected _container: HTMLElement = null;
    protected _options: IContainerBaseOptions;

    private _registrars: any = [];

    private _resizeObserver: ResizeObserverUtil;
    private _observedElements: HTMLElement[] = [];

    private _resizeObserverSupported: boolean;
    // private _edgeObservers: IntersectionObserver[] = [];

    private _scrollLockedPosition: number = null;
    protected _scrollCssClass: string;
    private _oldScrollState: ScrollState;
    protected _scrollModel: ScrollModel;

    protected _tmplNotify: Function = EventUtils.tmplNotify;

    // Виртуальный скролл
    private _topPlaceholderSize: number = 0;
    private _bottomPlaceholderSize: number = 0;

    private _savedScrollTop: number = 0;
    private _savedScrollPosition: number = 0;

    private _virtualNavigationRegistrar: RegisterClass;

    _beforeMount(options: IContainerBaseOptions, context?, receivedState?) {
        this._virtualNavigationRegistrar = new RegisterClass({register: 'virtualNavigation'});
        this._resizeObserver = new ResizeObserverUtil(this, this._resizeObserverCallback, this._resizeHandler);
        this._resizeObserverSupported = this._resizeObserver.isResizeObserverSupported();
        this._registrars.scrollStateChanged = new RegisterClass({register: 'scrollStateChanged'});
        // событие viewportResize используется только в списках.
        this._registrars.viewportResize = new RegisterClass({register: 'viewportResize'});
        this._registrars.scrollResize = new RegisterClass({register: 'scrollResize'});
        this._registrars.scrollMove = new RegisterClass({register: 'scrollMove'});
        this._scrollCssClass = this._getScrollContainerCssClass(options);
        this._registrars.listScroll = new RegisterClass({register: 'listScroll'});
        // Регистрар не из watcher а лежал на уровне самомго скролл контейнера. Дублирует подобное событие для списков.
        // Используется как минимум в попапах.
        this._registrars.scroll = new RegisterClass({register: 'scroll'});

        // Не восстанавливаем скролл на то место, на котором он был перед релоадом страницы
        if (window && window.history && 'scrollRestoration' in window.history) {
           window.history.scrollRestoration = 'manual';
        }
    }

    _afterMount(): void {
        if (!this._scrollModel) {
            this._createScrollModel();
        }
        if (!this._resizeObserver.isResizeObserverSupported()) {
            RegisterUtil(this, 'controlResize', this._controlResizeHandler, { listenAll: true });
            // ResizeObserver при инициализации контрола стрелнет событием ресайза.
            // Вызваем метод при инициализации сами если браузер не поддерживает ResizeObserver
            this._controlResizeHandler();
        }
        this._resizeObserver.observe(this._children.content);

        this._observeContentSize();

        // this._createEdgeIntersectionObserver();

        if (detection.isMobileIOS) {
            this._lockScrollPositionUntilKeyboardShown = this._lockScrollPositionUntilKeyboardShown.bind(this);
            Bus.globalChannel().subscribe('MobileInputFocus', this._lockScrollPositionUntilKeyboardShown);
        }
    }

    _beforeUpdate(options: IContainerBaseOptions) {
        if (options.scrollMode !== this._options.scrollMode) {
            this._scrollCssClass = this._getScrollContainerCssClass(options);
        }
    }

    protected _afterUpdate(oldOptions?: IContainerBaseOptions): void {
        this._observeContentSize();
        this._unobserveDeleted();
        if (!this._resizeObserverSupported) {
            this._updateStateAndGenerateEvents(this._getFullStateFromDOM());
        }
    }

    _beforeUnmount(): void {
        if (!this._resizeObserver.isResizeObserverSupported()) {
            UnregisterUtil(this, 'controlResize', {listenAll: true});
        }
        this._resizeObserver.terminate();
        for (const registrar of this._registrars) {
            registrar.destroy();
        }
        this._scrollModel = null;
        this._oldScrollState = null;
    }

    _controlResizeHandler(): void {
        this._resizeObserver.controlResizeHandler();
    }

    _observeContentSize(): void {
        for (const element of this._getElementsForHeightCalculation()) {
            if (!this._observedElements.includes(element)) {
                this._resizeObserver.observe(element);
                this._observedElements.push(element);
            }
        }
    }
    _unobserveDeleted(): void {
        const contentElements: HTMLElement[] = this._getElementsForHeightCalculation();
        this._observedElements = this._observedElements.filter((element: HTMLElement) => {
            if (!contentElements.includes(element)) {
                this._resizeObserver.unobserve(element);
                return false;
            }
            return true;
        });
    }

    _isObserved(element: HTMLElement): boolean {
        return this._observedElements.includes(element);
    }

    protected _getScrollNotifyConfig(): any[] {
        return [
            this._scrollModel.scrollTop,
            this._scrollModel.scrollLeft
        ];
    }

    _resizeHandler(e: SyntheticEvent): void {
        this._onResizeContainer(this._getFullStateFromDOM());
    }

    protected _scrollHandler(e: SyntheticEvent): void {
        if (this._scrollLockedPosition !== null) {
            this._children.content.scrollTop = this._scrollLockedPosition;
            return;
        }
        this.onScrollContainer({
            scrollTop: e.currentTarget.scrollTop,
            scrollLeft: e.currentTarget.scrollLeft,
        });
    }

    _registerIt(event: SyntheticEvent, registerType: string, component: any,
                callback: () => void, triggers): void {
        this._registrars.scrollStateChanged.register(event, registerType, component, callback);
        if (registerType === 'scrollStateChanged') {
            this._onRegisterNewComponent(component);
        }
        // совместимость со списками
        this._registrars.listScroll.register(event, registerType, component, callback);
        if (registerType === 'listScroll') {
            this._onRegisterNewListScrollComponent(component);
        }

        this._registrars.scroll.register(event, registerType, component, callback, {listenAll: true});
        this._virtualNavigationRegistrar.register(event, registerType, component, callback);
    }

    _unRegisterIt(event: SyntheticEvent, registerType: string, component: any): void {
        this._registrars.scrollStateChanged.unregister(event, registerType, component);
        this._registrars.scroll.unregister(event, registerType, component);
        this._registrars.listScroll.unregister(event, registerType, component);
        this._virtualNavigationRegistrar.unregister(event, registerType, component);
    }

    protected _enableVirtualNavigationHandler(): void {
        this._virtualNavigationRegistrar.start(true);
    }

    protected _disableVirtualNavigationHandler(): void {
        this._virtualNavigationRegistrar.start(false);
    }

    // _createEdgeIntersectionObserver() {
    //     const rootMarginMap = {
    //         top: '0px 0px -99% 0px',
    //         bottom: '-99% 0px 0px 0px'
    //     }
    //     for (let edge in rootMarginMap) {
    //         this._edgeObservers[edge] = new IntersectionObserver(this._edgeIntersectionHandler.bind(this, edge), {
    //             root: this._children.content,
    //             rootMargin: rootMarginMap[edge]
    //         });
    //         this._edgeObservers[edge].observe(this._children.userContent);
    //     }
    // }
    //
    // _edgeIntersectionHandler(edge, entries, observer): void {
    //     // console.log(edge);
    // }

    /*
       * Scrolls to the given position from the top of the container.
       * @function Controls/_scroll/Container#scrollTo
       * @param {Number} Offset
       */
    scrollTo(scrollPosition: number, direction: SCROLL_DIRECTION = SCROLL_DIRECTION.VERTICAL): void {
        scrollTo(this._children.content, scrollPosition, direction);
    }

    /**
     * Возвращает true, если можно прокрутить к позиции offset.
     * @name Controls/_scroll/Container#canScrollTo
     * @function
     * @param {Number} offset Позиция в пикселях
     * @see scrollToTop
     * @see scrollToBottom
     * @see scrollToLeft
     * @see scrollToRight
     * @see horizontalScrollTo
     */
    canScrollTo(offset: number): boolean {
        return offset <= this._scrollModel.scrollHeight - this._scrollModel.clientHeight;
    }

    /**
     * Прокручивает к выбранной позиции по горизонтали. Позиция определяется в пикселях от левого края контейнера.
     * @name Controls/_scroll/Container#horizontalScrollTo
     * @function
     * @param {Number} offset Позиция в пикселях.
     * @see scrollToTop
     * @see scrollToBottom
     * @see scrollToLeft
     * @see scrollToRight
     * @see canScrollTo
     */

    /*
     * Scrolls to the given position from the top of the container.
     * @function Controls/_scroll/Container#scrollTo
     * @param {Number} Offset
     */
    horizontalScrollTo(offset) {
        this.scrollTo(offset, SCROLL_DIRECTION.HORIZONTAL);
    }

    /**
     * Прокручивает к верху контейнера.
     * @name Controls/_scroll/Container#scrollToTop
     * @function
     * @see scrollToBottom
     * @see scrollToLeft
     * @see scrollToRight
     * @see horizontalScrollTo
     * @see canScrollTo
     */

    /*
     * Scrolls to the top of the container.
     * @name Controls/_scroll/Container#scrollToTop
     * @function
     */
    scrollToTop() {
        this._setScrollTop(0);
    }

    /**
     * Прокручивает к левому краю контейнера.
     * @name Controls/_scroll/Container#scrollToLeft
     * @function
     * @see scrollToTop
     * @see scrollToBottom
     * @see scrollToRight
     * @see horizontalScrollTo
     * @see canScrollTo
     */

    /*
     * Scrolls to the lefе of the container.
     * @name Controls/_scroll/Container#scrollToLeft
     * @function
     */
    scrollToLeft() {
        this.scrollTo(0, SCROLL_DIRECTION.HORIZONTAL);
    }

    /**
     * Прокручивает к низу контейнера.
     * @name Controls/_scroll/Container#scrollToBottom
     * @function
     * @see scrollToTop
     * @see scrollToLeft
     * @see scrollToRight
     * @see horizontalScrollTo
     * @see canScrollTo
     */

    /*
     * Scrolls to the bottom of the container.
     * @name Controls/_scroll/Container#scrollToBottom
     * @function
     */
    scrollToBottom() {
        this._setScrollTop(
            this._children.content.scrollHeight - this._children.content.clientHeight + this._topPlaceholderSize);
    }

    /**
     * Прокручивает к правому краю контейнера.
     * @name Controls/_scroll/Container#scrollToRight
     * @function
     * @see scrollToTop
     * @see scrollToBottom
     * @see scrollToLeft
     * @see horizontalScrollTo
     * @see canScrollTo
     */

    /*
     * Scrolls to the right of the container.
     * @name Controls/_scroll/Container#scrollToRight
     * @function
     */
    scrollToRight() {
        this.scrollTo(this._scrollModel.scrollWidth - this._scrollModel.clientWidth, SCROLL_DIRECTION.HORIZONTAL);
    }

    onScrollContainer(newState: IScrollState): void {
        this._updateStateAndGenerateEvents(newState);
    }

    _onRegisterNewComponent(component: Control): void {
        // Если состояние еще не инициализировано, то компонент получит его после инициализации.
        if (this._scrollModel) {
            const scrollState = this._scrollModel.clone();
            const oldScrollState = this._oldScrollState.clone();
            this._registrars.scrollStateChanged.startOnceTarget(component, scrollState, oldScrollState);
        }
    }

    _onResizeContainer(newState: IScrollState): void {
        if (this._resizeObserverSupported) {
            this._updateStateAndGenerateEvents(newState);
        } else {
            this._updateStateAndGenerateEvents(this._getFullStateFromDOM());
        }
    }

    protected _updateStateAndGenerateEvents(newState: IScrollState): void {
        const isStateUpdated = this._updateState(newState);
        const scrollState = this._scrollModel.clone();
        const oldScrollState = this._oldScrollState.clone();
        if (isStateUpdated) {
            // Новое событие
            this._generateEvent('scrollStateChanged', [scrollState, oldScrollState]);

            if (scrollState.scrollHeight !== oldScrollState.scrollHeight) {
                this._generateEvent('scrollResize', [{
                    scrollHeight: scrollState.scrollHeight,
                    clientHeight: scrollState.clientHeight
                }]);
            }

            if (oldScrollState.clientHeight !== scrollState.clientHeight) {
                this._generateEvent('viewportResize', [{
                    scrollHeight: scrollState.scrollHeight,
                    scrollTop: scrollState.scrollTop,
                    clientHeight: scrollState.clientHeight,
                    rect: scrollState.viewPortRect
                }]);
            }

            if (oldScrollState.scrollTop !== scrollState.scrollTop) {
                this._generateEvent('scrollMove', [{
                    scrollTop: scrollState.scrollTop,
                    position: scrollState.verticalPosition,
                    clientHeight: scrollState.clientHeight,
                    scrollHeight: scrollState.scrollHeight
                }]);

                // Используем разные аргументы в событии для совместимости со старым скроллом
                this._generateEvent(
                    'scroll',
                    [
                        new SyntheticEvent(null, {
                            type: 'scroll',
                            target: this._children.content,
                            currentTarget: this._children.content,
                            _bubbling: false
                        }),
                        scrollState.scrollTop
                    ], this._getScrollNotifyConfig());
            }

            this._generateCompatibleEvents();
        }
    }

    _generateEvent(eventType: string, params: object[], notifyParams: any[] = params): void {
        this._registrars[eventType].start(...params);
        this._notify(eventType, notifyParams);
    }

    _resizeObserverCallback(entries: any): void {
        if(isHidden(this._container)) {
            return;
        }
        const newState: IScrollState = {};
        for (const entry of entries) {
            if (entry.target === this._children.content) {
                newState.clientHeight = entry.contentRect.height;
                newState.clientWidth = entry.contentRect.width;
            }
        }

        // Если контент был меньше скролируемой области, то его размер может не поменяться, когда меняется размер
        // скролл контейнера.
        // Плюс мы не можем брать размеры из события, т.к. на размеры скроллируемого контента могут влиять
        // маргины на вложенных контейнерах. Плюс в корне скрол контейнера может лежать несколько контейнеров.
        // Раньше scrollHeight считался следующим образом.
        // newState.scrollHeight = entry.contentRect.height;
        // newState.scrollWidth = entry.contentRect.width;
        let children = this._children.content.children;
        let heigthValue = 0;
        let widthValue = 0;

        for (const child of this._getElementsForHeightCalculation()) {
            heigthValue += this._calculateScrollHeight(child);
        }

        newState.scrollHeight = heigthValue;

        if (newState.scrollHeight < newState.clientHeight) {
            newState.scrollHeight = newState.clientHeight;
        }
        for (let child of children) {
            widthValue += child.offsetWidth;
        }
        newState.scrollWidth = widthValue;
        if (newState.scrollWidth <  newState.clientWidth) {
            newState.scrollWidth = newState.clientWidth;
        }
        this._updateStateAndGenerateEvents(newState);
    }

    _getElementsForHeightCalculation(container?: HTMLElement): HTMLElement[] {
        const elements: HTMLElement[] = [];
        const _container: HTMLElement = container || this._children.content;

        for (const child of _container.children) {
            const ignoredChild = this._getIgnoredChild(child);
            if (ignoredChild) {
                for (const child of ignoredChild) {
                    elements.push(child);
                }
            } else {
                elements.push(child);
            }
        }

        return elements;
    }

    _getIgnoredChild(container: HTMLElement): HTMLCollection {
        // В контроле Hint/Template:ListWrapper на корневую ноду навешивается стиль height: 100% из-за чего
        // неправильно рассчитывается scrollHeight. Будем рассчитывать высоту через дочерние элементы.
        // Должно удалиться, когда перейдем на замеры по div скроллконтейнера
        if (container.classList.contains('Hint-ListWrapper')) {
            return container.children;
        } else if (container.classList.contains('Wizard-Vertical-Container__content')) {
            const wizardContainer = container.querySelector('.Wizard-Vertical-View');
            return wizardContainer?.children;
        }
        return null;
    }

    _calculateScrollHeight(element: HTMLElement): number {
        return element.offsetHeight + parseFloat(window.getComputedStyle(element).marginTop) +
            parseFloat(window.getComputedStyle(element).marginBottom);
    }

    _getFullStateFromDOM(): IScrollState {
        const newState = {
            scrollTop: this._children.content.scrollTop,
            scrollLeft: this._children.content.scrollLeft,
            clientHeight: this._children.content.clientHeight,
            scrollHeight: this._children.content.scrollHeight, // В observer берем со content, иначе значения будут отличаться
            clientWidth: this._children.content.clientWidth,
            scrollWidth: this._children.content.scrollWidth
        };
        return newState;
    }

    private _createScrollModel(): void {
        const scrollState = this._getFullStateFromDOM();
        this._scrollModel = new ScrollModel(this._children.content, scrollState);
    }

    _updateState(newState: IScrollState): boolean {
        if (!this._scrollModel) {
            this._createScrollModel();
        }
        this._oldScrollState = this._scrollModel.clone();
        const isScrollStateUpdated = this._scrollModel.updateState(newState);
        return isScrollStateUpdated;
    }

    /* При получении фокуса input'ами на IOS13, может вызывается подскролл у ближайшего контейнера со скролом,
       IPAD пытается переместить input к верху страницы. Проблема не повторяется,
       если input будет выше клавиатуры после открытия. */
    _lockScrollPositionUntilKeyboardShown(): void {
        this._scrollLockedPosition = this._scrollModel.scrollTop;
        setTimeout(() => {
            this._scrollLockedPosition = null;
        }, KEYBOARD_SHOWING_DURATION);
    }

    protected _doScrollHandler(e: SyntheticEvent<null>, scrollParam: number): void {
        this._doScroll(scrollParam);
        e.stopPropagation();
    }

    protected _doScroll(scrollParam) {
        if (scrollParam === 'top') {
            this._setScrollTop(0);
        } else {
            const
                headersHeight = getHeadersHeight(this._container, 'top', 'allFixed') || 0,
                clientHeight = this._scrollModel.clientHeight - headersHeight,
                scrollHeight = this._scrollModel.scrollHeight,
                currentScrollTop = this._scrollModel.scrollTop + (this._isVirtualPlaceholderMode() ? this._topPlaceholderSize : 0);
            if (scrollParam === 'bottom') {
                this._setScrollTop(scrollHeight - clientHeight);
            } else if (scrollParam === 'pageUp') {
                this._setScrollTop(currentScrollTop - clientHeight);
            } else if (scrollParam === 'pageDown') {
                this._setScrollTop(currentScrollTop + clientHeight);
            } else if (typeof scrollParam === 'number') {
                this._setScrollTop(scrollParam);
            }
        }
    }

    protected _getScrollContainerCssClass(options: IContainerBaseOptions): string {
        return options.scrollMode === SCROLL_MODE.VERTICAL ?
                   'controls-Scroll-ContainerBase__scroll_vertical' :
                   'controls-Scroll-ContainerBase__scroll_verticalHorizontal';
    }

    // Слой совместимости с таблицами

    private _observers: {
        [id: string]: IntersectionObserver;
    } = {};

    private _scrollMoveTimer: number;

    private _generateCompatibleEvents(): void {
        if ((this._scrollModel.clientHeight !== this._oldScrollState.clientHeight) ||
            (this._scrollModel.scrollHeight !== this._oldScrollState.scrollHeight)) {
            this._sendByListScrollRegistrar('scrollResize', {
                scrollHeight: this._scrollModel.scrollHeight,
                clientHeight: this._scrollModel.clientHeight
            });
        }

        if (this._scrollModel.clientHeight !== this._oldScrollState.clientHeight) {
            this._sendByListScrollRegistrar('viewportResize', {
                scrollHeight: this._scrollModel.scrollHeight,
                scrollTop: this._scrollModel.scrollTop,
                clientHeight: this._scrollModel.clientHeight,
                rect: this._scrollModel.viewPortRect
            });
        }

        if (this._scrollModel.scrollTop !== this._oldScrollState.scrollTop) {
            this._sendByListScrollRegistrar('scrollMoveSync', {
                scrollTop: this._scrollModel.scrollTop,
                position: this._scrollModel.verticalPosition,
                clientHeight: this._scrollModel.clientHeight,
                scrollHeight: this._scrollModel.scrollHeight
            });

            this._sendScrollMoveAsync();
        }

        if (this._scrollModel.canVerticalScroll !== this._oldScrollState.canVerticalScroll) {
            this._sendByListScrollRegistrar(
                this._scrollModel.canVerticalScroll ? 'canScroll' : 'cantScroll',
                {
                    clientHeight: this._scrollModel.clientHeight,
                    scrollHeight: this._scrollModel.scrollHeight,
                    viewPortRect: this._scrollModel.viewPortRect
                });
        }
    }

    _sendScrollMoveAsync(): void {
        if (this._scrollMoveTimer) {
                clearTimeout(this._scrollMoveTimer);
            }

            this._scrollMoveTimer = setTimeout(() => {
                this._sendByListScrollRegistrar('scrollMove', {
                    scrollTop: this._scrollModel.scrollTop,
                    position: this._scrollModel.verticalPosition,
                    clientHeight: this._scrollModel.clientHeight,
                    scrollHeight: this._scrollModel.scrollHeight
                });
                this._scrollMoveTimer = null;
            }, 0);
    }

    _onRegisterNewListScrollComponent(component: any): void {
        // Списку нужны события canScroll и cantScroll в момент инициализации до того,
        // как у нас отработают обработчики и инициализируются состояние.
        if (!this._scrollModel) {
            this._createScrollModel();
            this._updateStateAndGenerateEvents(this._getFullStateFromDOM());
        }
        this._sendByListScrollRegistrarToComponent(
            component,
        this._scrollModel.canVerticalScroll ? 'canScroll' : 'cantScroll',
        {
            clientHeight: this._scrollModel.clientHeight,
            scrollHeight: this._scrollModel.scrollHeight,
            viewPortRect: this._scrollModel.viewPortRect
        });

        this._sendByListScrollRegistrarToComponent(
            component,
            'viewportResize',
            {
                scrollHeight: this._scrollModel.scrollHeight,
                scrollTop: this._scrollModel.scrollTop,
                clientHeight: this._scrollModel.clientHeight,
                rect: this._scrollModel.viewPortRect
            }
        );
    }

    _sendByListScrollRegistrar(eventType: string, params: object): void {
        this._registrars.listScroll.start(eventType, params);
        this._notify(eventType, [params]);
    }

    _sendByListScrollRegistrarToComponent(component: Control, eventType: string, params: object): void {
        this._registrars.listScroll.startOnceTarget(component, eventType, params);
    }

    _scrollToElement(event: SyntheticEvent<Event>, {itemContainer, toBottom, force}): void {
        event.stopPropagation();
        scrollToElement(itemContainer, toBottom, force);
        /**
         * Синхронно обновляем состояние скрол контейнера, что бы корректно работали другие синхронные вызовы api скролл контейнера которое зависят от текущего состояния.
         */
        this.onScrollContainer({
            scrollTop: this._children.content.scrollTop,
            scrollLeft: this._children.content.scrollLeft,
        });
    }

    // Виртуальный скролл

    private _isVirtualPlaceholderMode(): boolean {
        return !!this._topPlaceholderSize || !!this._bottomPlaceholderSize;
    }

    updatePlaceholdersSize(placeholdersSizes: object): void {
        this._topPlaceholderSize = placeholdersSizes.top;
        this._bottomPlaceholderSize = placeholdersSizes.bottom;
    }

    protected _setScrollTop(scrollTop: number, withoutPlaceholder?: boolean): void {
        const scrollContainer = this._children.content as HTMLElement;

        if (this._isVirtualPlaceholderMode() && !withoutPlaceholder) {
            const scrollState = this._scrollModel;
            const realScrollTop = scrollTop - this._topPlaceholderSize;
            const scrollTopOverflow = scrollState.scrollHeight - realScrollTop - scrollState.clientHeight < 0;

            if (
                // Нужно проскролить в рамках от [нижней границы topPlaceholder, до конца scrollContainer]
                realScrollTop >= 0 && !scrollTopOverflow ||
                // или вверх при отсутствующем topPlaceholder
                this._topPlaceholderSize === 0 && realScrollTop < 0 ||
                // или вниз за гранцы scrollContainer при отсутствии bottomPlaceholder
                scrollTopOverflow && this._bottomPlaceholderSize === 0
            ) {
                scrollContainer.scrollTop = realScrollTop;
            } else {
                this._sendByListScrollRegistrar(
                    'virtualScrollMove',
                    {
                        scrollTop,
                        scrollHeight: scrollState.scrollHeight,
                        clientHeight: scrollState.clientHeight
                    });
            }
        } else {
            scrollContainer.scrollTop = scrollTop;
            this._updateStateAndGenerateEvents({scrollTop});
        }
    }

    private _saveScrollPosition(event: SyntheticEvent<Event>): void {
        const scrollContainer: HTMLElement = this._children.content;
        // На это событие должен реагировать только ближайший скролл контейнер.
        // В противном случае произойдет подскролл в ненужном контейнере
        event.stopPropagation();

        this._savedScrollTop = scrollContainer.scrollTop;
        this._savedScrollPosition = scrollContainer.scrollHeight - this._savedScrollTop;
        // Инерционный скролл приводит к дерганью: мы уже
        // восстановили скролл, но инерционный скролл продолжает работать и после восстановления, как итог - прыжки,
        // дерганья и лишняя загрузка данных.
        // Поэтому перед восстановлением позиции скрола отключаем инерционный скролл, а затем включаем его обратно.
        // https://popmotion.io/blog/20170704-manually-set-scroll-while-ios-momentum-scroll-bounces/
        if (detection.isMobileIOS) {
            this._setOverflowScrolling('hidden');
        }
    }

    private _restoreScrollPosition(event: SyntheticEvent<Event>, heightDifference: number, direction: string,
                           correctingHeight: number = 0): void {
        // На это событие должен реагировать только ближайший скролл контейнер.
        // В противном случае произойдет подскролл в ненужном контейнере
        event.stopPropagation();
        // Инерционный скролл приводит к дерганью: мы уже
        // восстановили скролл, но инерционный скролл продолжает работать и после восстановления, как итог - прыжки,
        // дерганья и лишняя загрузка данных.
        // Поэтому перед восстановлением позиции скрола отключаем инерционный скролл, а затем включаем его обратно.
        if (detection.isMobileIOS) {
            this._setOverflowScrolling('');
        }
        const newPosition = direction === 'up' ?
            this._children.content.scrollHeight - this._savedScrollPosition + heightDifference - correctingHeight :
            this._savedScrollTop - heightDifference + correctingHeight;

        this._setScrollTop(newPosition, true);
    }

    _updatePlaceholdersSize(e: SyntheticEvent<Event>, placeholdersSizes): void {
        this._topPlaceholderSize = placeholdersSizes.top;
        this._bottomPlaceholderSize = placeholdersSizes.bottom;
    }

    private _setOverflowScrolling(value: string): void {
        this._children.content.style.overflow = value;
    }

    // TODO: система событий неправильно прокидывает аргументы из шаблонов, будет исправлено тут:
    // https://online.sbis.ru/opendoc.html?guid=19d6ff31-3912-4d11-976f-40f7e205e90a
    protected _selectedKeysChanged(event): void {
        this._proxyEvent(event, 'selectedKeysChanged', Array.prototype.slice.call(arguments, 1));
    }

    protected _excludedKeysChanged(event): void {
        this._proxyEvent(event, 'excludedKeysChanged', Array.prototype.slice.call(arguments, 1));
    }

    protected _itemClick(event): void {
        return this._proxyEvent(event, 'itemClick', Array.prototype.slice.call(arguments, 1));
    }

    protected _proxyEvent(event, eventName, args): void {
        // Forwarding bubbling events makes no sense.
        if (!event.propagating()) {
            return this._notify(eventName, args) || event.result;
        }
    }

    static _theme: string[] = ['Controls/scroll'];
}
