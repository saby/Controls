import {detection} from 'Env/Env';
import {Bus} from 'Env/Event';
import {descriptor} from 'Types/entity';
import {SyntheticEvent} from 'Vdom/Vdom';
import {RegisterClass, RegisterUtil, UnregisterUtil} from 'Controls/event';
import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import {ResizeObserverUtil, RESIZE_OBSERVER_BOX} from 'Controls/sizeUtils';
import {getScrollContainerPageCoords, isCursorAtBorder, SCROLL_DIRECTION, SCROLL_POSITION} from './Utils/Scroll';
import {scrollToElement} from './Utils/scrollToElement';
import {scrollTo} from './Utils/Scroll';
import ScrollState from './Utils/ScrollState';
import ScrollModel from './Utils/ScrollModel';
import {IScrollState} from './Utils/ScrollState';
import {SCROLL_MODE} from './Container/Type';
import template = require('wml!Controls/_scroll/ContainerBase/ContainerBase');
import {EventUtils} from 'UI/Events';
import {isHidden} from './StickyBlock/Utils';
import {getHeadersHeight} from './StickyBlock/Utils/getHeadersHeight';
import {location} from 'Application/Env';
import {Entity} from 'Controls/dragnDrop';



interface IInitialScrollPosition {
    vertical: SCROLL_POSITION.START | SCROLL_POSITION.END;
    horizontal: SCROLL_POSITION.START | SCROLL_POSITION.END;
}
export interface IContainerBaseOptions extends IControlOptions {
    _notScrollableContent?: boolean; // Для HintWrapper, который сверстан максмально неудобно для скроллКонтейнера.
    scrollOrientation?: SCROLL_MODE;
    initialScrollPosition: IInitialScrollPosition;
}

const KEYBOARD_SHOWING_DURATION: number = 500;

/**
 * Величина виртуальной границы относительно верхнего/нижнего края скролл контейнера
 * при попадании в которую нужно запустить процесс автоскролла.
 */
const AUTOSCROLL_SIZE: number = 50;

const enum CONTENT_TYPE {
    regular = 'regular',
    notScrollable = 'notScrollable',
    // Размеры корня контента равны размерам скролл контейнера, а размер детей на каком то уровне вложенности больше.
    restricted = 'restricted'
}

const enum SCROLL_POSITION_CSS {
    verticalEnd = 'controls-Scroll-ContainerBase__scrollPosition-vertical-end',
    horizontalEnd = 'controls-Scroll-ContainerBase__scrollPosition-horizontal-end',
    regular = 'controls-Scroll-ContainerBase__scrollPosition-regular'
}

/**
 * Контейнер со скроллом.
 *
 * @remark
 * Контрол работает как нативный скролл: нативные скроллбары появляются, когда размеры контента больше размеров контрола. Для корректной работы контрола необходимо ограничить его высоту.
 *
 * @class Controls/_scroll/ContainerBase
 *
 * @public
 * @author Миронов А.Ю.
 * @demo Controls-demo/Scroll/ContainerBase/Index
 *
 */
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
    private _virtualNavigationState: {top: boolean, bottom: boolean} = { top: false, bottom: false };

    private _contentType: CONTENT_TYPE = CONTENT_TYPE.regular;

    protected _initialScrollPositionCssClass: string;

    // Флаг, идентифицирующий включен или выключен в текущий момент
    // функционал автоскролла при приближении мыши к верхней/нижней границе
    // скролл контейнера
    private _autoScroll: boolean = false;
    private _autoScrollInterval: NodeJS.Timeout;
    // Флаг, идентифицирующий что нужно пропустить обработку автоскролла
    private _skipAutoscroll: boolean = false;

    private _isUnmounted: boolean = false;

    private _scrollMoveTimer: number;

    _beforeMount(options: IContainerBaseOptions, context?, receivedState?) {
        this._virtualNavigationRegistrar = new RegisterClass({register: 'virtualNavigation'});
        if (!this._isHorizontalScroll(options.scrollOrientation)) {
            this._resizeObserver = new ResizeObserverUtil(this, this._resizeObserverCallback, this._resizeHandler);
        }
        this._resizeObserverSupported = this._resizeObserver?.isResizeObserverSupported();
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
        this._initialScrollPositionInit(options);
    }

    protected _componentDidMount(): void {
        const isInitialScrollPositionStart: boolean = !this._options.initialScrollPosition ||
            !this._options.initialScrollPosition?.vertical ||
            this._options.initialScrollPosition?.vertical === SCROLL_POSITION.START;
        // Если одна область заменяется на другую с однотипной версткой и встроенным скролл контейнером,
        // то ядро не пересоздает dom контейнеры, и может так полуится, что вновь созданный скролл контейнер
        // может быть сразу проскролен. Исправляем эту ситуацию.
        // Не будем скроллить в случае, если на странице есть нативные якоря для скролла,
        // т.е. в ссылке присутсвует хэш
        if (isInitialScrollPositionStart && (!location.hash && this._container.dataset?.scrollContainerNode)) {
            this._children.content.scrollTop = 0;
        }
        this._initialScrollPositionResetAfterInitialization();
    }

    _afterMount(): void {
        const scrollOrientation = this._options.scrollOrientation;
        if (!this._scrollModel) {
            this._createScrollModel();
        }
        if (!this._resizeObserver?.isResizeObserverSupported() || this._isHorizontalScroll(scrollOrientation)) {
            RegisterUtil(this, 'controlResize', this._controlResizeHandler, { listenAll: true });
            // ResizeObserver при инициализации контрола стрелнет событием ресайза.
            // Вызваем метод при инициализации сами если браузер не поддерживает ResizeObserver
            this._controlResizeHandler();
        } else if (scrollOrientation === SCROLL_MODE.VERTICAL_HORIZONTAL) {
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

        // Регистрируем события о начале и окончании перетаскивания, что бы включать/выключать
        // режим автоскролла при приближении мышки верхнему/нижнему краю скролл контейнера
        this._notify('register', ['documentDragStart', this, this._onDragStart], { bubbling: true });
        this._notify('register', ['documentDragEnd', this, this._onDragEnd], { bubbling: true });
    }

    _beforeUpdate(options: IContainerBaseOptions) {
        if (options.scrollOrientation !== this._options.scrollOrientation) {
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
        // Установим дата аттрибут, чтобы в будущем была возможность определить, был ли в этой ноде скролл контейнер.
        // Подробности в комментарии в _componentDidMount.
        this._container.dataset?.scrollContainerNode = 'true';
        if (!this._resizeObserver?.isResizeObserverSupported()) {
            UnregisterUtil(this, 'controlResize', {listenAll: true});
        }
        this._resizeObserver?.terminate();
        for (const registrar in this._registrars) {
            if (this._registrars.hasOwnProperty(registrar)) {
                this._registrars[registrar].destroy();
            }
        }

        if (detection.isMobileIOS) {
            Bus.globalChannel().unsubscribe('MobileInputFocus', this._lockScrollPositionUntilKeyboardShown);
        }

        this._scrollModel = null;
        this._oldScrollState = null;
        this._isUnmounted = true;

        this._notify('unregister', ['documentDragStart', this], {bubbling: true});
        this._notify('unregister', ['documentDragEnd', this], {bubbling: true});
        this._autoScroll = false;
        clearInterval(this._autoScrollInterval);
    }

    private _isHorizontalScroll(scrollOrientationOption: string): boolean {
        const scrollOrientation = scrollOrientationOption.toLowerCase();
        // При горизонтальном скролле будет работать с событием controlResize
        return scrollOrientation.indexOf('horizontal') !== -1;
    }

    private _initialScrollPositionInit(options): void {
        if (options.initialScrollPosition?.vertical === SCROLL_POSITION.END) {
            this._initialScrollPositionCssClass = SCROLL_POSITION_CSS.verticalEnd;
        } else if (options.initialScrollPosition?.horizontal === SCROLL_POSITION.END) {
            this._initialScrollPositionCssClass = SCROLL_POSITION_CSS.horizontalEnd;
        } else {
            this._initialScrollPositionCssClass = SCROLL_POSITION_CSS.regular;
        }
    }

    private _initialScrollPositionResetAfterInitialization(): void {
        if (this._options.initialScrollPosition?.vertical === SCROLL_POSITION.END ||
                this._options.initialScrollPosition?.horizontal === SCROLL_POSITION.END) {
            const container = this._children.content;

            this._initialScrollPositionCssClass = SCROLL_POSITION_CSS.regular;

            container.classList.add(SCROLL_POSITION_CSS.regular);

            if (this._options.initialScrollPosition?.vertical === SCROLL_POSITION.END) {
                container.classList.remove(SCROLL_POSITION_CSS.verticalEnd);
                // В режиме "flex-direction: column-reverse" контенейнер прокручен к концу,
                // и scrollTop считается с конца. Т.е. scrollTop в этот сосент равен 0. А когда скролируют
                // в обратную сторону он становтися отрицательным. После того как мы меняем flex-direction,
                // скролл прокручивается в начало, его необходимо вернуть в конец.
                container.scrollTop = container.scrollHeight;
            } else if (this._options.initialScrollPosition?.horizontal === SCROLL_POSITION.END) {
                container.classList.remove(SCROLL_POSITION_CSS.horizontalEnd);
                container.scrollLeft = container.scrollWidth;
            }

        }
    }

    _controlResizeHandler(): void {
        if (this._resizeObserver) {
            this._resizeObserver.controlResizeHandler();
        } else {
            this._resizeHandler();
        }
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
                this._resizeObserver?.unobserve(element);
                return false;
            }
            return true;
        });
    }

    _observeElementSize(element: HTMLElement): void {
        this._resizeObserver?.observe(element, { box: RESIZE_OBSERVER_BOX.borderBox });
    }

    _isObserved(element: HTMLElement): boolean {
        return this._observedElements.includes(element);
    }

    protected _getScrollNotifyConfig(): number[] {
        return [
            this._scrollModel.scrollTop,
            this._scrollModel.scrollLeft
        ];
    }

    _resizeHandler(): void {
        this._onResizeContainer(this._getFullStateFromDOM());
    }

    protected _scrollHandler(e: SyntheticEvent): void {
        if (this._scrollLockedPosition !== null) {
            this._children.content.scrollTop = this._scrollLockedPosition;
            return;
        }
        this.onScrollContainer({
            scrollTop: e.currentTarget.scrollTop,
            scrollLeft: e.currentTarget.scrollLeft
        });
    }

    _registerIt(event: SyntheticEvent, registerType: string, component: Control,
                callback: Function, triggers): void {
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

                // Список на afterMount сообщает о том, нужно ли показывать контент сверху и снизу.
                // Но контент ниже списка строится после списка, и на момент события еще не построен.
                // Сообщаем нижнему VirtualScrollContainer'у состояние виртуальной навигации при его регистрации.
                callback('bottom', this._virtualNavigationState.bottom);
                break;
            case 'scrollResize':
                this._registrars.scrollResize.register(event, registerType, component, callback);
                break;
        }
    }

    _unRegisterIt(event: SyntheticEvent, registerType: string, component: Control): void {
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
                this._registrars.scroll.unregister(event, registerType, component, {listenAll: true});
                break;
            case 'virtualNavigation':
                this._virtualNavigationRegistrar.unregister(event, registerType, component);
                break;
            case 'scrollResize':
                this._registrars.scrollResize.unregister(event, registerType, component);
                break;
        }
    }

    protected _enableVirtualNavigationHandler(event: SyntheticEvent, position: 'top' | 'bottom'): void {
        event.stopImmediatePropagation();
        this._virtualNavigationState[position] = true;
        this._virtualNavigationRegistrar.start(position, true);

    }

    protected _disableVirtualNavigationHandler(event: SyntheticEvent, position: 'top' | 'bottom'): void {
        event.stopImmediatePropagation();
        this._virtualNavigationState[position] = false;
        this._virtualNavigationRegistrar.start(position, false);
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

    _generateEvent(eventType: string, params: object[], notifyParams: object[] = params): void {
        this._registrars[eventType].start(...params);
        this._notify(eventType, notifyParams);
    }

    _resizeObserverCallback(entries: object[]): void {
        if (isHidden(this._container)) {
            return;
        }
        const newState: IScrollState = {};
        for (const entry of entries) {
            if (entry.target === this._children.content) {
                newState.clientHeight = entry.contentRect.height;
                newState.clientWidth = entry.contentRect.width;
            } else {
                this._updateContentType();
                // Свойство borderBoxSize учитывает размеры отступов при расчете. Поддерживается не во всех браузерах.
                if (entry.borderBoxSize) {
                    const scrollStateProperties = {
                        scrollHeight: 'blockSize'
                    };
                    for (const property of Object.keys(scrollStateProperties)) {
                        const borderBoxSizeProperty = scrollStateProperties[property];
                        newState[property] = entry.borderBoxSize[borderBoxSizeProperty] === undefined ?
                            entry.borderBoxSize[0][borderBoxSizeProperty] : entry.borderBoxSize[borderBoxSizeProperty];
                    }
                } else {
                    newState.scrollHeight = entry.contentRect.height;
                }

                if (this._contentType === CONTENT_TYPE.restricted) {
                    newState.scrollHeight = this._getContentHeightByChildren();
                }
            }
        }

        // Списки имуют ширину равную ширине скролл контейнера, но в данном сценарии используется дерево
        // и контент вылазит по горизонтали за пределы корня списка и соответсвенно скролл контейнера.
        // Иконки должны прижиматься к правому краю и, в том числе по этой причине, мы не можем растянуть
        // корневой контейнер списка шире скролл контейнера. Поэтому берем ширину с помощью scrollWidth.
        // В данном сценарии мы не можем отследить изменение ширины потому что она не меняется,
        // меняется высота. Но этого триггера достаточно, т.к. добавление людого контента в списках приводят
        // к изменению высоты.
        newState.scrollWidth = this._children.content.scrollWidth;

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

        for (const containerChild of _container.children) {
            const ignoredChild = this._getIgnoredChild(containerChild);
            if (ignoredChild) {
                for (const child of ignoredChild) {
                    elements.push(child);
                }
            } else {
                elements.push(containerChild);
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
        // Используем getBoundingClientRect а не clientHeight и clientWidth потому что, clientHeight и clientWidth
        // возвращают округленные целые значения. В событиях ресайза приходят дробные значения соответсвующие
        // getBoundingClientRect. Если использовать clientHeight и clientWidth, то будут генериоваться лишние
        // события сообщающие что изменился размер скорлл контейнера на значения меньше одного пикселя.
        const containerRect: DOMRect = this._children.content.getBoundingClientRect();
        const newState = {
            scrollTop: this._children.content.scrollTop,
            scrollLeft: this._children.content.scrollLeft,
            clientHeight: containerRect.height,
            // В observer берем со content, иначе значения будут отличаться
            scrollHeight: this._children.content.scrollHeight,
            clientWidth: containerRect.width,
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
            const headersHeight = getHeadersHeight(this._container, 'top', 'allFixed') || 0;
            const clientHeight = this._scrollModel.clientHeight - headersHeight;
            const scrollHeight = this._scrollModel.scrollHeight;
            const currentScrollTop = this._scrollModel.scrollTop + (this._isVirtualPlaceholderMode() ?
                this._topPlaceholderSize :
                0);
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
        switch (options.scrollOrientation) {
            case SCROLL_MODE.VERTICAL:
                return 'controls-Scroll-ContainerBase__scroll_vertical';
            case SCROLL_MODE.HORIZONTAL:
                return 'controls-Scroll-ContainerBase__scroll_horizontal';
            case SCROLL_MODE.NONE:
                return  'controls-Scroll-ContainerBase__scroll_none';
            default:
                return 'controls-Scroll-ContainerBase__scroll_verticalHorizontal';

        }
    }

    protected _updateContentWrapperCssClass(): void {
        const cssClass: string = this._getContentWrapperCssClass();
        if (cssClass !== this._contentWrapperCssClass) {
            this._contentWrapperCssClass = this._getContentWrapperCssClass();
        }
    }

    protected _getContentWrapperCssClass(): string {
        return this._contentType !== CONTENT_TYPE.regular ? 'controls-Scroll-ContainerBase__contentNotScrollable' : '';
    }

    // Слой совместимости с таблицами

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
                // Т.к код выполняется асинхронно, может получиться, что контрол к моменту вызова функции уже
                // уничтожился
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

    _onRegisterNewListScrollComponent(component: Control): void {
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
            scrollLeft: this._children.content.scrollLeft
        });
    }

    // Autoscroll

    private _onDragStart(dragObject: {entity: Entity, domEvent: MouseEvent}): void {
        const coords = getScrollContainerPageCoords(this._container);

        this._autoScroll = !!dragObject.entity?.allowAutoscroll;
        // Если при начале перетаскивания курсор уже находится около границы контейнера,
        // то автоскролл запускать не нужно, надо дождаться пока он выйдет из области и только
        // при следующем заходе запустить процесс автоскроллинга
        this._skipAutoscroll = isCursorAtBorder(coords, dragObject.domEvent, AUTOSCROLL_SIZE).near;
    }

    private _onDragEnd(): void {
        this._autoScroll = false;
    }

    protected _onMouseLeave(): void {
        // При выходе мыши за границы контейнера нужно стопнуть интервал
        clearInterval(this._autoScrollInterval);
        // При выходе курсора за границы скролл контейнера так же нужно сбросить
        // флаг что бы автоскролл запустился при следующем заходе в область
        this._skipAutoscroll = false;
    }

    /**
     * Обрабатываем движение курсором мыши для того, что бы инициировать автоскролл когда курсор
     * подходит к верхней или нижней границе контейнера
     */
    protected _onMouseMove(event: SyntheticEvent): void {
        if (!this._autoScroll) {
            return;
        }

        const mouseEvent = event.nativeEvent as MouseEvent;
        const cords = getScrollContainerPageCoords(this._container);
        const cursorAtBorder = isCursorAtBorder(cords, mouseEvent, AUTOSCROLL_SIZE);

        clearInterval(this._autoScrollInterval);
        // Если курсор не внутри скролл контейнера и не рядом с его верхней/нижней границей
        // или сказано что нужно пропустить обработку, то выходим
        if (!cursorAtBorder.near || this._skipAutoscroll) {
            // Если курсор не в границах области в которой включается автоскролл,
            // то сбрасываем _skipAutoscroll что бы автоскролл запустился при следующем заходе в область
            if (!cursorAtBorder.near) {
                this._skipAutoscroll = false;
            }

            return;
        }

        // Величина на которую делаем подскролл
        const delta = 30;
        const delay = 100;
        // Вешаем интервал что бы если пользователь остановил курсор автоскролл продолжал работать
        this._autoScrollInterval = setInterval(() => {
            if (!this._autoScroll) {
                clearInterval(this._autoScrollInterval);
                return;
            }

            const scrollTop = (this._children.content as HTMLElement).scrollTop;
            if (cursorAtBorder.near && cursorAtBorder.nearTop) {
                this._setScrollTop(scrollTop - delta);
            }

            if (cursorAtBorder.near && cursorAtBorder.nearBottom) {
                this._setScrollTop(scrollTop + delta);
            }
        }, delay);
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

                // нужный scrollTop будет отличным от realScrollTop, если изменился _topPlaceholderSize.
                // Вычисляем его по месту
                scrollContainer.scrollTop = cachedScrollTop - this._topPlaceholderSize;
            };
            if (realScrollTop >= 0 && !scrollTopOverflow) {
                scrollContainer.scrollTop = realScrollTop;
            } else if (this._topPlaceholderSize === 0 && realScrollTop < 0 || scrollTopOverflow
                && this._bottomPlaceholderSize === 0) {
                applyScrollTop();
            } else {
                const scrollStateClone = this._scrollModel.clone();
                this._generateEvent('virtualScrollMove', [{
                    scrollTop,
                    scrollState: scrollStateClone,
                    applyScrollTopCallback: applyScrollTop
                }]);
                // TODO: Удалить после перехода списков на новые события
                //  https://online.sbis.ru/opendoc.html?guid=ca70827b-ee39-4d20-bf8c-32b10d286682
                this._sendByListScrollRegistrar(
                    'virtualScrollMove',
                    {
                        scrollTop,
                        scrollHeight: scrollStateClone.scrollHeight,
                        clientHeight: scrollStateClone.clientHeight,
                        applyScrollTopCallback: applyScrollTop
                    });
            }
        } else {
            scrollContainer.scrollTop = scrollTop;
            this._updateStateAndGenerateEvents({
                scrollTop
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

    static getOptionTypes(): object {
        return {
            scrollOrientation: descriptor(String).oneOf([
                SCROLL_MODE.VERTICAL,
                SCROLL_MODE.HORIZONTAL,
                SCROLL_MODE.VERTICAL_HORIZONTAL,
                SCROLL_MODE.NONE
            ])
        };
    }

    static getDefaultOptions(): object {
        return {
            scrollOrientation: 'vertical'
        };
    }
}

/**
 * @typedef {String} Controls/_scroll/ContainerBase/TInitialScrollPosition
 * @variant start Положение скрола в скролл контейнере находиться в начале.
 * @variant end Положение скрола в скролл контейнере находиться в конце.
 */

/**
 * @typedef {Object} Controls/_scroll/ContainerBase/initialScrollPosition
 * @property {Controls/_scroll/ContainerBase/TInitialScrollPosition} [vertical] Определяет положение скрола в момент инициализации по вертикали.
 * @property {Controls/_scroll/ContainerBase/TInitialScrollPosition} [horizontal] Определяет положение скрола в момент инициализации по горизонтали.
 */

/**
 * @name Controls/_scroll/Container#initialScrollPosition
 * @cfg {Controls/_scroll/ContainerBase/initialScrollPosition} initialScrollPosition Определяет положение скрола в момент инициализации.
 * @demo Controls-demo/Scroll/Container/InitialScrollPosition/Index
 */
