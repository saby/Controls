import {detection} from 'Env/Env';
import {Bus} from 'Env/Event';
import { SyntheticEvent } from 'UICommon/Events';
import {RegisterClass, RegisterUtil, UnregisterUtil} from 'Controls/event';
import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import {ResizeObserverUtil, RESIZE_OBSERVER_BOX} from 'Controls/sizeUtils';
import {SCROLL_DIRECTION} from './Utils/Scroll';
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
import {location} from 'Application/Env';

export interface IContainerBaseOptions extends IControlOptions {
    _notScrollableContent?: boolean; // Для HintWrapper, который сверстан максмально неудобно для скроллКонтейнера.
    scrollMode?: SCROLL_MODE;
}

const KEYBOARD_SHOWING_DURATION: number = 500;

const enum CONTENT_TYPE {
    regular = 'regular',
    notScrollable = 'notScrollable',
    // Размеры корня контента равны размерам скролл контейнера, а размер детей на каком то уровне вложенности больше.
    restricted = 'restricted'
}

export default class ContainerBase<T extends IContainerBaseOptions> extends Control<IContainerBaseOptions> {
    protected _template: TemplateFunction = template;
    protected _container: HTMLElement = null;
    protected _options: IContainerBaseOptions;

    private _registrars: {
        [key: string]: RegisterClass
    } = {};
    private _resizeObserver: ResizeObserverUtil;
    private _observedElements: HTMLElement[] = [];

    private _resizeObserverSupported: boolean;
    // private _edgeObservers: IntersectionObserver[] = [];

    private _scrollLockedPosition: number = null;
    protected _scrollCssClass: string;
    protected _contentWrapperCssClass: string;
    private _oldScrollState: ScrollState;
    protected _scrollModel: ScrollModel;

    protected _tmplNotify: Function = EventUtils.tmplNotify;

    // Виртуальный скролл
    private _topPlaceholderSize: number = 0;
    private _bottomPlaceholderSize: number = 0;

    private _savedScrollTop: number = 0;
    private _savedScrollPosition: number = 0;

    private _virtualNavigationRegistrar: RegisterClass;

    private _contentType: CONTENT_TYPE = CONTENT_TYPE.regular;

    private _isUnmounted: boolean = false;

    _beforeMount(options: IContainerBaseOptions, context?, receivedState?) {
        this._virtualNavigationRegistrar = new RegisterClass({register: 'virtualNavigation'});
        this._resizeObserver = new ResizeObserverUtil(this, this._resizeObserverCallback, this._resizeHandler);
        this._resizeObserverSupported = this._resizeObserver.isResizeObserverSupported();
        this._registrars.scrollStateChanged = new RegisterClass({register: 'scrollStateChanged'});
        // событие viewportResize используется только в списках.
        this._registrars.viewportResize = new RegisterClass({register: 'viewportResize'});
        this._registrars.scrollResize = new RegisterClass({register: 'scrollResize'});
        this._registrars.scrollMove = new RegisterClass({register: 'scrollMove'});
        this._registrars.virtualScrollMove = new RegisterClass({register: 'virtualScrollMove'});
        this._scrollCssClass = this._getScrollContainerCssClass(options);
        this._updateContentWrapperCssClass();
        this._registrars.listScroll = new RegisterClass({register: 'listScroll'});
        // Регистрар не из watcher а лежал на уровне самомго скролл контейнера. Дублирует подобное событие для списков.
        // Используется как минимум в попапах.
        this._registrars.scroll = new RegisterClass({register: 'scroll'});

        // Не восстанавливаем скролл на то место, на котором он был перед релоадом страницы
        if (window && window.history && 'scrollRestoration' in window.history) {
           window.history.scrollRestoration = 'manual';
        }

        if (options._notScrollableContent) {
            this._updateContentType(CONTENT_TYPE.restricted);
        }
    }

    protected _componentDidMount(): void {
        // Если одна область заменяется на другую с однотипной версткой и встроенным скролл контейнером,
        // то ядро не пересоздает dom контейнеры, и может так полуится, что вновь созданный скролл контейнер
        // может быть сразу проскролен. Исправляем эту ситуацию.
        // Не будем скроллить в случае, если на странице есть нативные якоря для скролла,
        // т.е. в ссылке присутсвует хэш
        if (!location.hash) {
            this._children.content.scrollTop = 0;
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
        } else if (this._options.scrollMode === SCROLL_MODE.VERTICAL_HORIZONTAL) {
            // Из-за особенности верстки, контейнер, с которого мы считываем размеры скролла, растягивается только
            // по высоте. По ширине он совпадает с размерами своего родителя. Из-за этого невозможно определить ширину
            // скролла. Будем считать ширину скролла с дочернего элемента.
            this._observeElementSize(this._children.userContent.children[0]);
        }

        this._observeElementSize(this._children.content);

        this._updateContentType();
        if (this._contentType === CONTENT_TYPE.regular) {
            this._observeElementSize(this._children.userContent);
        } else {
            this._observeContentSize();
        }

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
        this._updateContentType();
        if (this._contentType !== CONTENT_TYPE.regular) {
            this._observeContentSize();
            this._unobserveDeleted();
        }
        if (!this._resizeObserverSupported) {
            this._updateStateAndGenerateEvents(this._getFullStateFromDOM());
        }
    }

    _beforeUnmount(): void {
        if (!this._resizeObserver.isResizeObserverSupported()) {
            UnregisterUtil(this, 'controlResize', {listenAll: true});
        }
        this._resizeObserver.terminate();
        for (const registrar in this._registrars) {
            if (this._registrars.hasOwnProperty(registrar)) {
                this._registrars[registrar].destroy();
            }
        }
        this._scrollModel = null;
        this._oldScrollState = null;
        this._isUnmounted = true;
    }

    _controlResizeHandler(): void {
        this._resizeObserver.controlResizeHandler();
    }

    _observeContentSize(): void {
        for (const element of this._getElementsForHeightCalculation()) {
            if (!this._observedElements.includes(element)) {
                this._observeElementSize(element);
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

    _observeElementSize(element: HTMLElement): void {
        this._resizeObserver.observe(element, { box: RESIZE_OBSERVER_BOX.borderBox });
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
        switch (registerType) {
            case 'scrollStateChanged':
                this._registrars.scrollStateChanged.register(event, registerType, component, callback);
                this._onRegisterNewComponent(component);
                break;
            case 'listScroll':
                // совместимость со списками
                this._registrars.listScroll.register(event, registerType, component, callback);
                this._onRegisterNewListScrollComponent(component);
                break;
            case 'virtualScrollMove':
                this._registrars.virtualScrollMove.register(event, registerType, component, callback);
                break;
            case 'scroll':
                this._registrars.scroll.register(event, registerType, component, callback, {listenAll: true});
                break;
            case 'virtualNavigation':
                this._virtualNavigationRegistrar.register(event, registerType, component, callback);
                break;
        }
    }

    _unRegisterIt(event: SyntheticEvent, registerType: string, component: any): void {
        switch (registerType) {
            case 'scrollStateChanged':
                this._registrars.scrollStateChanged.unregister(event, registerType, component);
                break;
            case 'listScroll':
                this._registrars.listScroll.unregister(event, registerType, component);
                break;
            case 'virtualScrollMove':
                this._registrars.virtualScrollMove.unregister(event, registerType, component);
                break;
            case 'scroll':
                this._registrars.scroll.unregister(event, registerType, component);
                break;
            case 'virtualNavigation':
                this._virtualNavigationRegistrar.unregister(event, registerType, component);
                break;
        }
    }

    protected _enableVirtualNavigationHandler(event: SyntheticEvent): void {
        event.stopImmediatePropagation()
        this._virtualNavigationRegistrar.start(true);

    }

    protected _disableVirtualNavigationHandler(event: SyntheticEvent): void {
        event.stopImmediatePropagation()
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
        // Списку нужны события canScroll и cantScroll в момент инициализации до того,
        // как у нас отработают обработчики и инициализируются состояние.
        if (!this._scrollModel) {
            this._createScrollModel();
        }
        const scrollState = this._scrollModel.clone();
        const oldScrollState = this._oldScrollState.clone();
        this._registrars.scrollStateChanged.startOnceTarget(component, scrollState, oldScrollState);

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
        if (isHidden(this._container)) {
            return;
        }
        const newState: IScrollState = {};
        for (const entry of entries) {
            if (entry.target === this._children.content) {
                newState.clientHeight = entry.contentRect.height;
                newState.clientWidth = entry.contentRect.width;
            } else if (entry.target === this._children.userContent.children[0] && this._options.scrollMode === SCROLL_MODE.VERTICAL_HORIZONTAL) {
                // Списки имуют ширину равную ширине скролл контейнера, но в данном сценарии используется дерево
                // и контент вылазит по горизонтали за пределы корня списка и соответсвенно скролл контейнера.
                // Иконки должны прижиматься к правому краю и, в том числе по этой причине, мы не можем растянуть
                // корневой контейнер списка шире скролл контейнера. Поэтому берем ширину с помощью scrollWidth.
                // В данном сценарии мы не можем отследить изменение ширины потому что она не меняется,
                // меняется высота. Но этого триггера достаточно, т.к. добавление людого контента в списках приводят
                // к изменению высоты. Нормально решение будет делаться в рамках проекта.
                // https://online.sbis.ru/opendoc.html?guid=b0f50709-5cc2-484f-ba2b-8502ccfa77f8
                newState.scrollWidth = this._children.content.scrollWidth;
            } else {
                this._updateContentType();
                // Свойство borderBoxSize учитывает размеры отступов при расчете. Поддерживается не во всех браузерах.
                if (entry.borderBoxSize) {
                    const scrollStateProperties = {
                        // scrollWidth: 'inlineSize',
                        scrollHeight: 'blockSize'
                    };
                    for (const property of Object.keys(scrollStateProperties)) {
                        const borderBoxSizeProperty = scrollStateProperties[property];
                        newState[property] = entry.borderBoxSize[borderBoxSizeProperty] === undefined ?
                            entry.borderBoxSize[0][borderBoxSizeProperty] : entry.borderBoxSize[borderBoxSizeProperty];
                    }
                } else {
                    // newState.scrollWidth = entry.contentRect.width;
                    newState.scrollHeight = entry.contentRect.height;
                }

                if (this._contentType === CONTENT_TYPE.restricted) {
                    newState.scrollHeight = this._getContentHeightByChildren();
                }
            }
        }

        if (newState.scrollHeight < newState.clientHeight) {
            newState.scrollHeight = newState.clientHeight;
        }
        if (newState.scrollWidth < newState.clientWidth) {
            newState.scrollWidth = newState.clientWidth;
        }

        this._updateStateAndGenerateEvents(newState);
    }

    _updateContentType(newValue?: CONTENT_TYPE): void {
        const contentType: CONTENT_TYPE = newValue || this._getContentType();
        if (this._contentType !== contentType) {
            this._contentType = contentType;
            this._updateContentWrapperCssClass();
        }
    }

    _getContentType(): CONTENT_TYPE {
        let contentType: CONTENT_TYPE = CONTENT_TYPE.regular;
        const firstContentChild: HTMLElement = this._children.userContent.children[0];
        if (firstContentChild) {
            const classList = firstContentChild.classList;
            if (classList.contains('controls-Scroll-Container__notScrollable')) {
                contentType = CONTENT_TYPE.notScrollable;
            } else if (classList.contains('Hint-ListWrapper')) {
                contentType = CONTENT_TYPE.restricted;
            }
        }
        return contentType;
    }

    _getContentHeightByChildren(): number {
        // Если контент был меньше скролируемой области, то его размер может не поменяться, когда меняется размер
        // скролл контейнера.
        // Плюс мы не можем брать размеры из события, т.к. на размеры скроллируемого контента могут влиять
        // маргины на вложенных контейнерах. Плюс в корне скрол контейнера может лежать несколько контейнеров.
        // Раньше scrollHeight считался следующим образом.
        // newState.scrollHeight = entry.contentRect.height;
        // newState.scrollWidth = entry.contentRect.width;
        let heigth = 0;

        for (const child of this._getElementsForHeightCalculation()) {
            heigth += this._calculateScrollHeight(child);
        }
        return heigth;
    }

    _getElementsForHeightCalculation(container?: HTMLElement): HTMLElement[] {
        const elements: HTMLElement[] = [];
        const _container: HTMLElement = container || this._children.userContent;

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
        const {content} = this._children;
        this._scrollModel = new ScrollModel(content, scrollState);
        this._oldScrollState = new ScrollModel(content, {});
    }

    _updateState(newState: IScrollState): boolean {
        if (!this._scrollModel) {
            this._createScrollModel();
        } else {
            this._oldScrollState = this._scrollModel.clone();
        }
        const isScrollStateUpdated = this._scrollModel.updateState(newState);
        return isScrollStateUpdated;
    }

    /* При получении фокуса input'ами на IOS13, может вызывается подскролл у ближайшего контейнера со скролом,
       IPAD пытается переместить input к верху страницы. Проблема не повторяется,
       если input будет выше клавиатуры после открытия. */
    _lockScrollPositionUntilKeyboardShown(): void {
        // Если модель не инициализирована, значить точно не было скролирования и scrollTop равен 0.
        this._scrollLockedPosition = this._scrollModel?.scrollTop || 0;
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

    protected _updateContentWrapperCssClass(): void {
        const cssClass: string = this._getContentWrapperCssClass()
        if (cssClass !== this._contentWrapperCssClass) {
            this._contentWrapperCssClass = this._getContentWrapperCssClass();
        }
    }

    protected _getContentWrapperCssClass(): string {
        return this._contentType !== CONTENT_TYPE.regular ? 'controls-Scroll-ContainerBase__contentNotScrollable' : '';
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
                // Т.к код выполняется асинхронно, может получиться, что контрол к моменту вызова функции уже уничтожился
                if (!this._isUnmounted) {
                    this._sendByListScrollRegistrar('scrollMove', {
                        scrollTop: this._scrollModel.scrollTop,
                        position: this._scrollModel.verticalPosition,
                        clientHeight: this._scrollModel.clientHeight,
                        scrollHeight: this._scrollModel.scrollHeight
                    });
                    this._scrollMoveTimer = null;
                }
            }, 0);
    }

    _onRegisterNewListScrollComponent(component: any): void {
        // Списку нужны события canScroll и cantScroll в момент инициализации до того,
        // как у нас отработают обработчики и инициализируются состояние.
        if (!this._scrollModel) {
            this._createScrollModel();
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
        const scrollContainer: HTMLElement = this._children.content;
        if (this._isVirtualPlaceholderMode() && !withoutPlaceholder) {
            const scrollState: IScrollState = this._scrollModel;
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
                const scrollState = this._scrollModel.clone();
                this._generateEvent('virtualScrollMove', [{
                    scrollTop,
                    scrollState,
                    applyScrollTopCallback: applyScrollTop
                }]);
                // TODO: Удалить после перехода списков на новые события
                //  https://online.sbis.ru/opendoc.html?guid=ca70827b-ee39-4d20-bf8c-32b10d286682
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
