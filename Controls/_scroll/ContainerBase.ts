import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import template = require('wml!Controls/_scroll/Scroll/ContainerBase/ContainerBase');
import {SyntheticEvent} from 'Vdom/Vdom';
import {RegisterClass} from 'Controls/event';
import {getVerticalPosition, getHorizontalPosition, canScroll} from 'Controls/_scroll/Scroll/Utils';
import ResizeObserverUtil from 'Controls/Utils/ResizeObserverUtil';

interface IContainerBaseOptions extends IControlOptions {
    scrollMode?: string;
}

interface IState {
    scrollTop?: number;
    scrollLeft?: number;
    clientHeight?: number;
    scrollHeight?: number;
    clientWidth?: number;
    scrollWidth?: number;
    verticalPosition?: string;
    horizontalPosition?: string;
    canScroll?: boolean;
    viewPortRect?: ClientRect;
}

export default class ContainerBase extends Control<IContainerBaseOptions> {
    protected _template: TemplateFunction = template;
    protected _container: HTMLElement = null;
    protected _options: IContainerBaseOptions;

    private _state: IState = {};
    private _oldState: IState = null;

    private _registrars: any = [];

    private _stickyHeaderObserver: ResizeObserverUtil;

    private _resizeObserverSupported: boolean;

    _beforeMount(): void {
        this._stickyHeaderObserver = new ResizeObserverUtil(this, this._resizeObserverCallback, this._resizeHandler);
        this._resizeObserverSupported = typeof window !== 'undefined' && window.ResizeObserver;
        this._registrars.scrollStateChanged = new RegisterClass({register: 'scrollStateChanged'});
        // событие viewportResize используется только в списках.
        this._registrars.viewportResize = new RegisterClass({register: 'viewportResize'});
        this._registrars.scrollResize = new RegisterClass({register: 'scrollResize'});
        this._registrars.scrollMove = new RegisterClass({register: 'scrollMove'});
    }

    _afterMount(): void {
        this._stickyHeaderObserver.observe(this._container);
        this._stickyHeaderObserver.observe(this._children.contentObserver);
        this._updateStateAndGenerateEvents({
            scrollTop: 0,
            scrollLeft: 0
        });
    }

    _beforeUnmount(): void {
        this._stickyHeaderObserver.terminate();
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

    scrollTo(scrollTop: number): void {
        this._container.scrollTop = scrollTop;
    }

    onScrollContainer(newState: IState): void {
        this._updateStateAndGenerateEvents(newState);
    }

    _onRegisterNewComponent(component: any): void {
        if (Object.keys(this._state).length === 0) {
            this._updateState(this._getFullStateFromDOM());
        }
        this._registrars.scrollStateChanged.startOnceTarget(component, {
            state: {...this._state},
            oldState: {...this._oldState}
        });
        this._notify('scrollStateChanged', [{...this._state}, {...this._oldState}]);
    }

    _onResizeContainer(newState: IState): void {
        if (this._resizeObserverSupported) {
            this._updateStateAndGenerateEvents(newState);
        } else {
            this._updateStateAndGenerateEvents(this._getFullStateFromDOM());
        }
    }

    _updateStateAndGenerateEvents(newState: IState): void {
        const isStateUpdated = this._updateState(newState);
        if (isStateUpdated) {
            // Новое событие
            this._sendByRegistrar('scrollStateChanged', {
                state: {...this._state},
                oldState: {...this._oldState}
            });

            // Старое событие
            if ((this._state.clientHeight !== this._oldState.clientHeight) ||
                (this._state.scrollHeight !== this._oldState.scrollHeight)) {
                this._sendByRegistrar('scrollResize', {
                    scrollHeight: this._state.scrollHeight,
                    clientHeight: this._state.clientHeight
                });
            }

            // Старое событие
            if (this._oldState.clientHeight !== this._state.clientHeight) {
                this._sendByRegistrar('viewportResize', {
                    scrollHeight: this._state.scrollHeight,
                    scrollTop: this._state.scrollTop,
                    clientHeight: this._state.clientHeight,
                    rect: this._state.viewPortRect
                });
            }

            // Старое событие
            if (this._oldState.verticalPosition !== this._state.verticalPosition) {
                this._sendByRegistrar('scrollMove', {
                    scrollTop: this._state.scrollTop,
                    position: this._state.verticalPosition,
                    clientHeight: this._state.clientHeight,
                    scrollHeight: this._state.scrollHeight
                });
            }
        }
    }

    _sendByRegistrar(eventType: string, params: object): void {
        this._registrars[eventType].start(params);
        this._notify(eventType, [params]);
    }

    _resizeObserverCallback(entries: any): void {
        const newState: IState = {};
        for (const entry of entries) {
            if (entry.target === this._container) {
                newState.clientHeight = entry.contentRect.height;
                newState.clientWidth = entry.contentRect.width;
            }
            if (entry.target === this._children.contentObserver) {
                newState.scrollHeight = entry.contentRect.height;
                newState.scrollWidth = entry.contentRect.width;
            }
        }
        this._onResizeContainer(newState);
    }

    _getFullStateFromDOM(): IState {
        const newState = {
            scrollTop: this._container.scrollTop,
            scrollLeft: this._container.scrollLeft,
            clientHeight: this._container.clientHeight,
            scrollHeight: this._children.contentObserver.scrollHeight,
            clientWidth: this._container.clientWidth,
            scrollWidth: this._children.contentObserver.scrollWidth
        };
        return newState;
    }

    _updateState(newState: IState): boolean {
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
        this._state.verticalPosition = getVerticalPosition(this._state.scrollTop, this._state.clientHeight,
            this._state.scrollHeight);
        this._state.horizontalPosition = getHorizontalPosition(this._state.scrollLeft, this._state.clientWidth,
            this._state.scrollWidth);
        this._state.canScroll = canScroll(this._state.scrollHeight, this._state.clientHeight);
        this._state.viewPortRect = this._children.contentObserver.getBoundingClientRect();
    }
}
