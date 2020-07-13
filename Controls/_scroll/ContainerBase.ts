import {detection} from 'Env/Env';
import {Bus} from 'Env/Event';
import {SyntheticEvent} from 'Vdom/Vdom';
import {RegisterClass} from 'Controls/event';
import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import ResizeObserverUtil from 'Controls/Utils/ResizeObserverUtil';
import {canScrollByState, getScrollPositionTypeByState, SCROLL_DIRECTION} from './Utils/Scroll';
import {scrollTo} from './Utils/Scroll';
import {IScrollState} from './Utils/ScrollState';
import {SCROLL_MODE} from './Container/Type';
import template = require('wml!Controls/_scroll/ContainerBase/ContainerBase');
import tmplNotify = require('Controls/Utils/tmplNotify');

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

    private _resizeObserverSupported: boolean;
    // private _edgeObservers: IntersectionObserver[] = [];

    private _scrollLockedPosition: number = null;

    protected _tmplNotify: tmplNotify;

    _beforeMount(): void {
        this._resizeObserver = new ResizeObserverUtil(this, this._resizeObserverCallback, this._resizeHandler);
        this._resizeObserverSupported = typeof window !== 'undefined' && window.ResizeObserver;
        this._registrars.scrollStateChanged = new RegisterClass({register: 'scrollStateChanged'});
        // событие viewportResize используется только в списках.
        this._registrars.viewportResize = new RegisterClass({register: 'viewportResize'});
        this._registrars.scrollResize = new RegisterClass({register: 'scrollResize'});
        this._registrars.scrollMove = new RegisterClass({register: 'scrollMove'});
    }

    _afterMount(): void {
        this._resizeObserver.observe(this._children.scrollContainer);
        this._resizeObserver.observe(this._children.content);
        this._updateStateAndGenerateEvents(this._getFullStateFromDOM());
        // this._createEdgeIntersectionObserver();

        if (detection.isMobileIOS) {
            this._lockScrollPositionUntilKeyboardShown = this._lockScrollPositionUntilKeyboardShown.bind(this);
            Bus.globalChannel().subscribe('MobileInputFocus', this._lockScrollPositionUntilKeyboardShown);
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

    _resizeHandler(e: SyntheticEvent): void {
        this._onResizeContainer(null);
    }

    _scrollHandler(e: SyntheticEvent): void {
        if (this._scrollLockedPosition !== null) {
            this._children.scrollContainer.scrollTop = this._scrollLockedPosition;
            return;
        }
        this.onScrollContainer({
            scrollTop: e.currentTarget.scrollTop,
            scrollLeft: e.currentTarget.scrollLeft,
        });
    }

    _registerIt(event: SyntheticEvent, registerType: string, component: any,
                callback: () => void): void {
        this._registrars.scrollStateChanged.register(event, registerType, component, callback);
        this._onRegisterNewComponent(component);
    }

    _unRegisterIt(e: SyntheticEvent, registerType: string, component: any): void {
        this._registrars.scrollStateChanged.unregister(e, registerType, component);
    }

    // _createEdgeIntersectionObserver() {
    //     const rootMarginMap = {
    //         top: '0px 0px -99% 0px',
    //         bottom: '-99% 0px 0px 0px'
    //     }
    //     for (let edge in rootMarginMap) {
    //         this._edgeObservers[edge] = new IntersectionObserver(this._edgeIntersectionHandler.bind(this, edge), {
    //             root: this._children.scrollContainer,
    //             rootMargin: rootMarginMap[edge]
    //         });
    //         this._edgeObservers[edge].observe(this._children.content);
    //     }
    // }
    //
    // _edgeIntersectionHandler(edge, entries, observer): void {
    //     // console.log(edge);
    // }

    scrollTo(scrollPosition: number, direction: SCROLL_DIRECTION = SCROLL_DIRECTION.VERTICAL): void {
        scrollTo(this._children.scrollContainer, scrollPosition, direction);
    }

    onScrollContainer(newState: IScrollState): void {
        this._updateStateAndGenerateEvents(newState);
    }

    _onRegisterNewComponent(component: any): void {
        // Возможно тут лучше не вычитывать стэйт, а дождаться когда контрол его инициализирует и после этого послать событие.
        if (Object.keys(this._state).length === 0) {
            this._updateState(this._getFullStateFromDOM());
        }
        this._registrars.scrollStateChanged.startOnceTarget(component, {...this._state}, {...this._oldState});
        this._notify('scrollStateChanged', [{...this._state}, {...this._oldState}]);
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

            // Старое событие
            if ((this._state.clientHeight !== this._oldState.clientHeight) ||
                (this._state.scrollHeight !== this._oldState.scrollHeight)) {
                this._sendByRegistrar('scrollResize', [{
                    scrollHeight: this._state.scrollHeight,
                    clientHeight: this._state.clientHeight
                }]);
            }

            // Старое событие
            if (this._oldState.clientHeight !== this._state.clientHeight) {
                this._sendByRegistrar('viewportResize', [{
                    scrollHeight: this._state.scrollHeight,
                    scrollTop: this._state.scrollTop,
                    clientHeight: this._state.clientHeight,
                    rect: this._state.viewPortRect
                }]);
            }

            // Старое событие
            if (this._oldState.verticalPosition !== this._state.verticalPosition) {
                this._sendByRegistrar('scrollMove', [{
                    scrollTop: this._state.scrollTop,
                    position: this._state.verticalPosition,
                    clientHeight: this._state.clientHeight,
                    scrollHeight: this._state.scrollHeight
                }]);
            }
        }
    }

    _sendByRegistrar(eventType: string, params: object[]): void {
        this._registrars[eventType].start(...params);
        this._notify(eventType, params);
    }

    _resizeObserverCallback(entries: any): void {
        const newState: IScrollState = {};
        for (const entry of entries) {
            if (entry.target === this._children.scrollContainer) {
                newState.clientHeight = entry.contentRect.height;
                newState.clientWidth = entry.contentRect.width;
            }
            if (entry.target === this._children.content) {
                // Не можем брать размеры из события, т.к. на размеры скроллируемого контента могут влиять
                // маргины на вложенных контейнерах.
                // newState.scrollHeight = entry.contentRect.height;
                // newState.scrollWidth = entry.contentRect.width;
                newState.scrollHeight = this._children.scrollContainer.scrollHeight;
                newState.scrollWidth = this._children.scrollContainer.scrollWidth;
            }
        }
        this._onResizeContainer(newState);
    }

    _getFullStateFromDOM(): IScrollState {
        const newState = {
            scrollTop: this._children.scrollContainer.scrollTop,
            scrollLeft: this._children.scrollContainer.scrollLeft,
            clientHeight: this._children.scrollContainer.clientHeight,
            scrollHeight: this._children.content.scrollHeight,
            clientWidth: this._children.scrollContainer.clientWidth,
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

    static _theme: string[] = ['Controls/scroll'];
}
