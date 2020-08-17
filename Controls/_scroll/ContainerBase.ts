import * as isEmpty from 'Core/helpers/Object/isEmpty';
import {detection} from 'Env/Env';
import {Bus} from 'Env/Event';
import {SyntheticEvent} from 'Vdom/Vdom';
import {RegisterClass, Registrar} from 'Controls/event';
import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import ResizeObserverUtil from 'Controls/Utils/ResizeObserverUtil';
import {canScrollByState, getContentSizeByState, getScrollPositionTypeByState, SCROLL_DIRECTION} from './Utils/Scroll';
import {scrollTo} from './Utils/Scroll';
import {IScrollState} from './Utils/ScrollState';
import {SCROLL_MODE} from './Container/Type';
import template = require('wml!Controls/_scroll/ContainerBase/ContainerBase');
import tmplNotify = require('Controls/Utils/tmplNotify');
import * as scrollToElement from 'Controls/Utils/scrollToElement';

export interface IContainerBaseOptions extends IControlOptions {
    scrollMode?: SCROLL_MODE;
}

const KEYBOARD_SHOWING_DURATION: number = 500;

export default class ContainerBase extends Control<IContainerBaseOptions> {
    protected _template: TemplateFunction = template;
    protected _container: HTMLElement = null;
    protected _options: IContainerBaseOptions;

    protected _state: IScrollState = {};
    protected _oldState: IScrollState = null;

    private _registrars: any = [];

    private _resizeObserver: ResizeObserverUtil;
    private _observedElements: HTMLElement[] = [];

    private _resizeObserverSupported: boolean;
    // private _edgeObservers: IntersectionObserver[] = [];

    private _scrollLockedPosition: number = null;
    protected _scrollCssClass: string;

    protected _tmplNotify: Function = tmplNotify;

    // Виртуальный скролл
    private _topPlaceholderSize: number = 0;
    private _bottomPlaceholderSize: number = 0;

    private _savedScrollTop: number = 0;
    private _savedScrollPosition: number = 0;

    _beforeMount(options: IContainerBaseOptions): void {
        this._resizeObserver = new ResizeObserverUtil(this, this._resizeObserverCallback, this._resizeHandler);
        this._resizeObserverSupported = typeof window !== 'undefined' && window.ResizeObserver;
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
    }

    _afterMount(): void {
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
        this._resizeObserver.terminate();
        for (const registrar of this._registrars) {
            registrar.destroy();
        }
        this._state = null;
        this._oldState = null;
    }

    _observeContentSize(): void {
        for (const element of this._children.content.children) {
            if (!this._observedElements.includes(element)) {
                this._resizeObserver.observe(element);
                this._observedElements.push(element);
            }
        }
    }
    _unobserveDeleted(): void {
        const contentElements: HTMLElement[] = [...this._children.content.children];
        this._observedElements.filter((element: HTMLElement) => {
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

    _resizeHandler(e: SyntheticEvent): void {
        this._onResizeContainer(this._getFullStateFromDOM());
    }

    _scrollHandler(e: SyntheticEvent): void {
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
            if (triggers) {
                this._initIntersectionObserver(triggers, component);
            }
        }

        this._registrars.scroll.register(event, registerType, component, callback);
    }

    _unRegisterIt(e: SyntheticEvent, registerType: string, component: any): void {
        this._registrars.scrollStateChanged.unregister(e, registerType, component);
        this._registrars.scroll.unregister(e, registerType, component);
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
     * Возвращает true если есть возможность вроскролить к позиции offset.
     * @function Controls/_scroll/Container#canScrollTo
     * @param offset Позиция в пикселях
     * @noshow
     */
    canScrollTo(offset: number): boolean {
        return offset <= this._state.scrollHeight - this._state.clientHeight;
    }

    /**
     * Скроллит к выбранной позиции по горизонтале. Позиция определяется в пикселях от левого края контейнера.
     * @function Controls/_scroll/Container#horizontalScrollTo
     * @param {Number} Позиция в пикселях
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
     * Скроллит к верху контейнера
     * @function Controls/_scroll/Container#scrollToTop
     */

    /*
     * Scrolls to the top of the container.
     * @function Controls/_scroll/Container#scrollToTop
     */
    scrollToTop() {
        this.setScrollTop(0);
    }

    /**
     * Скроллит к левому краю контейнера
     * @function Controls/_scroll/Container#scrollToTop
     */

    /*
     * Scrolls to the lefе of the container.
     * @function Controls/_scroll/Container#scrollToTop
     */
    scrollToLeft() {
        this.scrollTo(0, SCROLL_DIRECTION.HORIZONTAL);
    }

    /**
     * Скроллит к низу контейнера
     * @function Controls/_scroll/Container#scrollToBottom
     */

    /*
     * Scrolls to the bottom of the container.
     * @function Controls/_scroll/Container#scrollToBottom
     */
    scrollToBottom() {
        this.setScrollTop(this._state.scrollHeight - this._state.clientHeight + this._topPlaceholderSize);
    }

    /**
     * Скроллит к правому краю контейнера
     * @function Controls/_scroll/Container#scrollToBottom
     */

    /*
     * Scrolls to the right of the container.
     * @function Controls/_scroll/Container#scrollToBottom
     */
    scrollToRight() {
        this.scrollTo(this._state.scrollWidth - this._state.clientWidth);
    }

    onScrollContainer(newState: IScrollState): void {
        this._updateStateAndGenerateEvents(newState);
    }

    _onRegisterNewComponent(component: Control): void {
        // Если состояние еще не инициализировано, то компонент получит его после инициализации.
        if (Object.keys(this._state).length !== 0) {
            this._registrars.scrollStateChanged.startOnceTarget(component, {...this._state}, {...this._oldState});
        }
    }

    _onResizeContainer(newState: IScrollState): void {
        if (this._resizeObserverSupported) {
            this._updateStateAndGenerateEvents(newState);
        } else {
            this._updateStateAndGenerateEvents(this._getFullStateFromDOM());
        }
    }

    _updateStateAndGenerateEvents(newState: IScrollState): void {
        const isStateUpdated = this._updateState(newState);
        if (isStateUpdated) {
            // Новое событие
            this._sendByRegistrar('scrollStateChanged', [{...this._state}, {...this._oldState}]);

            if (this._state.scrollHeight !== this._oldState.scrollHeight) {
                this._sendByRegistrar('scrollResize', [{
                    scrollHeight: this._state.scrollHeight,
                    clientHeight: this._state.clientHeight
                }]);
            }

            if (this._oldState.clientHeight !== this._state.clientHeight) {
                this._sendByRegistrar('viewportResize', [{
                    scrollHeight: this._state.scrollHeight,
                    scrollTop: this._state.scrollTop,
                    clientHeight: this._state.clientHeight,
                    rect: this._state.viewPortRect
                }]);
            }

            if (this._oldState.scrollTop !== this._state.scrollTop) {
                this._sendByRegistrar('scrollMove', [{
                    scrollTop: this._state.scrollTop,
                    position: this._state.verticalPosition,
                    clientHeight: this._state.clientHeight,
                    scrollHeight: this._state.scrollHeight
                }]);
                this._sendByRegistrar(
                    'scroll',
                    [
                        new SyntheticEvent(null, {
                            type: 'scroll',
                            target: this._children.content,
                            currentTarget: this._children.content,
                            _bubbling: false
                        }),
                        this._state.scrollTop
                    ]);
            }

            this._generateCompatibleEvents();
        }
    }

    _sendByRegistrar(eventType: string, params: object[]): void {
        this._registrars[eventType].start(...params);
        this._notify(eventType, params);
    }

    _resizeObserverCallback(entries: any): void {
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
        if (newState.scrollHeight === undefined) {
            newState.scrollHeight = this._children.content.scrollHeight;
        }
        if (newState.scrollWidth === undefined) {
            newState.scrollWidth = this._children.content.scrollWidth;
        }

        this._updateStateAndGenerateEvents(newState);
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

    _updateState(newState: IScrollState): boolean {
        let isStateUpdated = false;
        this._oldState = {...this._state};
        Object.keys(newState).forEach((key) => {
            if (this._state[key] !== newState[key]) {
                this._state[key] = newState[key];
                isStateUpdated = true;
            }
        }, newState);
        if (isStateUpdated) {
            this._updateCalculatedState();
        }
        return isStateUpdated;
    }

    _updateCalculatedState(): void {
        this._state.verticalPosition = getScrollPositionTypeByState(this._state, SCROLL_DIRECTION.VERTICAL);
        this._state.horizontalPosition = getScrollPositionTypeByState(this._state, SCROLL_DIRECTION.HORIZONTAL);
        this._state.canVerticalScroll = canScrollByState(this._state, SCROLL_DIRECTION.VERTICAL);
        this._state.canHorizontalScroll = canScrollByState(this._state, SCROLL_DIRECTION.HORIZONTAL);
        this._state.viewPortRect = this._children.content.getBoundingClientRect();
    }

    /* При получении фокуса input'ами на IOS13, может вызывается подскролл у ближайшего контейнера со скролом,
       IPAD пытается переместить input к верху страницы. Проблема не повторяется,
       если input будет выше клавиатуры после открытия. */
    _lockScrollPositionUntilKeyboardShown(): void {
        this._scrollLockedPosition = this._state.scrollTop;
        setTimeout(() => {
            this._scrollLockedPosition = null;
        }, KEYBOARD_SHOWING_DURATION);
    }

    protected _doScroll(scrollParam) {
        if (scrollParam === 'top') {
            this.setScrollTop(0);
        } else {
            const
                clientHeight = this._state.clientHeight,
                scrollHeight = this._state.scrollHeight,
                currentScrollTop = this._state.scrollTop + (this._isVirtualPlaceholderMode() ? this._topPlaceholderSize : 0);
            if (scrollParam === 'bottom') {
                this.setScrollTop(scrollHeight - clientHeight);
            } else if (scrollParam === 'pageUp') {
                this.setScrollTop(currentScrollTop - clientHeight);
            } else if (scrollParam === 'pageDown') {
                this.setScrollTop(currentScrollTop + clientHeight);
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
        if ((this._state.clientHeight !== this._oldState.clientHeight) ||
            (this._state.scrollHeight !== this._oldState.scrollHeight)) {
            this._sendByListScrollRegistrar('scrollResize', {
                scrollHeight: this._state.scrollHeight,
                clientHeight: this._state.clientHeight
            });
        }

        if (this._state.clientHeight !== this._oldState.clientHeight) {
            this._sendByListScrollRegistrar('viewportResize', {
                scrollHeight: this._state.scrollHeight,
                scrollTop: this._state.scrollTop,
                clientHeight: this._state.clientHeight,
                rect: this._state.viewPortRect
            });
        }

        if (this._state.scrollTop !== this._oldState.scrollTop) {
            this._sendByListScrollRegistrar('scrollMoveSync', {
                scrollTop: this._state.scrollTop,
                position: this._state.verticalPosition,
                clientHeight: this._state.clientHeight,
                scrollHeight: this._state.scrollHeight
            });

            this._sendScrollMoveAsync();
        }

        if (this._state.canVerticalScroll !== this._oldState.canVerticalScroll) {
            this._sendByListScrollRegistrar(
                this._state.canVerticalScroll ? 'canScroll' : 'cantScroll',
                {
                    clientHeight: this._state.clientHeight,
                    scrollHeight: this._state.scrollHeight,
                    viewPortRect: this._state.viewPortRect
                });
        }
    }

    _sendScrollMoveAsync(): void {
        if (this._scrollMoveTimer) {
                clearTimeout(this._scrollMoveTimer);
            }

            this._scrollMoveTimer = setTimeout(() => {
                this._sendByListScrollRegistrar('scrollMove', {
                    scrollTop: this._state.scrollTop,
                    position: this._state.verticalPosition,
                    clientHeight: this._state.clientHeight,
                    scrollHeight: this._state.scrollHeight
                });
                this._scrollMoveTimer = null;
            }, 0);
    }

    _onRegisterNewListScrollComponent(component: any): void {
        // Если состояние еще не инициализировано, то компонент получит его после инициализации.
        if (Object.keys(this._state).length === 0) {
            return;
        }
        this._sendByListScrollRegistrarToComponent(
            component,
        this._state.canVerticalScroll ? 'canScroll' : 'cantScroll',
        {
            clientHeight: this._state.clientHeight,
            scrollHeight: this._state.scrollHeight,
            viewPortRect: this._state.viewPortRect
        });

        this._sendByListScrollRegistrarToComponent(
            component,
            'viewportResize',
            {
                scrollHeight: this._state.scrollHeight,
                scrollTop: this._state.scrollTop,
                clientHeight: this._state.clientHeight,
                rect: this._state.viewPortRect
            }
        );
    }

    private _initIntersectionObserver(elements, component): void {
        if (!this._observers[component.getInstanceId()]) {
            let eventName;
            let curObserver: IntersectionObserver;

            curObserver = new IntersectionObserver((changes) => {
                /**
                 * Баг IntersectionObserver на Mac OS: сallback может вызываться после отписки от слежения. Отписка происходит в
                 * _beforeUnmount. Устанавливаем защиту.
                 */
                if (this._observers === null) {
                    return;
                }
                // Изменения необходимо проходить с конца, чтобы сначала нотифицировать о видимости нижнего триггера
                // Это необходимо для того, чтобы когда вся высота записей списочного контрола была меньше вьюпорта, то
                // сначала список заполнялся бы вниз, а не вверх, при этом сохраняя положение скролла
                for (var i = changes.length - 1; i > -1; i--) {
                    switch (changes[i].target) {
                        case elements.topLoadTrigger:
                            if (changes[i].isIntersecting) {
                                eventName = 'loadTopStart';
                            } else {
                                eventName = 'loadTopStop';
                            }
                            break;
                        case elements.bottomLoadTrigger:
                            if (changes[i].isIntersecting) {
                                eventName = 'loadBottomStart';
                            } else {
                                eventName = 'loadBottomStop';
                            }
                            break;
                        case elements.bottomVirtualScrollTrigger:
                            if (changes[i].isIntersecting) {
                                eventName = 'virtualPageBottomStart';
                            } else {
                                eventName = 'virtualPageBottomStop';
                            }
                            break;
                        case elements.topVirtualScrollTrigger:
                            if (changes[i].isIntersecting) {
                                eventName = 'virtualPageTopStart';
                            } else {
                                eventName = 'virtualPageTopStop';
                            }
                            break;
                    }
                    if (eventName) {
                        this._sendByListScrollRegistrarToComponent(component, eventName, {
                            scrollTop: this._state.scrollTop,
                            clientHeight: this._state.clientHeight,
                            scrollHeight: this._state.scrollHeight
                        });
                        this._notify(eventName);
                        eventName = null;
                    }
                }
            }, {root: this._container});
            curObserver.observe(elements.topLoadTrigger);
            curObserver.observe(elements.bottomLoadTrigger);

            curObserver.observe(elements.topVirtualScrollTrigger);
            curObserver.observe(elements.bottomVirtualScrollTrigger);

            this._observers[component.getInstanceId()] = curObserver;
        }
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
    }

    // Виртуальный скролл

    private _isVirtualPlaceholderMode(): boolean {
        return !!this._topPlaceholderSize || !!this._bottomPlaceholderSize;
    }

    updatePlaceholdersSize(placeholdersSizes: object): void {
        this._topPlaceholderSize = placeholdersSizes.top;
        this._bottomPlaceholderSize = placeholdersSizes.bottom;
    }

    setScrollTop(scrollTop: number, withoutPlaceholder?: boolean): void {
        const scrollContainer: HTMLElement = this._children.content;
        if (this._isVirtualPlaceholderMode() && !withoutPlaceholder) {
            const scrollState: IScrollState = this._state;
            const cachedScrollTop = scrollTop;
            const realScrollTop = scrollTop - this._topPlaceholderSize;
            const scrollTopOverflow = scrollState.scrollHeight - realScrollTop - scrollState.clientHeight < 0;
            const applyScrollTop = () => {

                // нужный scrollTop будет отличным от realScrollTop, если изменился _topPlaceholderSize. Вычисляем его по месту
                scrollContainer.scrollTop = cachedScrollTop - this._topPlaceholderSize;
            };
            if (realScrollTop >= 0 && !scrollTopOverflow) {
                scrollContainer.scrollTop = realScrollTop;
            } else if (this._topPlaceholderSize === 0 && realScrollTop < 0 || scrollTopOverflow && this._bottomPlaceholderSize === 0) {
                applyScrollTop();
            } else {
                this._sendByListScrollRegistrar(
                    'virtualScrollMove',
                    {
                        scrollTop,
                        scrollHeight: scrollState.scrollHeight,
                        clientHeight: scrollState.clientHeight,
                        applyScrollTopCallback: applyScrollTop
                    });
            }
        } else {
            scrollContainer.scrollTop = scrollTop;
            this._updateStateAndGenerateEvents({
                scrollTop: scrollTop
            });
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

        this.setScrollTop(newPosition, true);
    }

    _updatePlaceholdersSize(e: SyntheticEvent<Event>, placeholdersSizes): void {
        this._topPlaceholderSize = placeholdersSizes.top;
        this._bottomPlaceholderSize = placeholdersSizes.bottom;
    }

    private _setOverflowScrolling(value: string): void {
        this._children.content.style.overflow = value;
    }

    static _theme: string[] = ['Controls/scroll'];
}
