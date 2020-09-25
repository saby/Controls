import {RegisterUtil, UnregisterUtil} from 'Controls/event';

export default class ResizeObserverUtil {
    private readonly _control: any;
    private readonly _resizeObserverSupported: boolean = false;
    private _resizeObserver: any;
    private readonly _resizeObserverCallback: (entries: any) => void;
    private readonly _controlResizeCallback: (...args: any) => void;

    constructor(control: any, resizeObserverCallback: (entries: any) => void,
                controlResizeCallback: (...args: any) => void) {
        this._control = control;
        this._resizeObserverSupported = typeof window !== 'undefined' && window.ResizeObserver;
        this._resizeObserverCallback = resizeObserverCallback.bind(this._control);
        this._controlResizeCallback = controlResizeCallback.bind(this._control);
    }

    initialize(): void {
        if (this._resizeObserverSupported) {
            this._initResizeObserver();
        } else {
            RegisterUtil(this._control, 'controlResize', this._controlResizeCallback);
        }
    }

    private _initResizeObserver(): void {
        if (!this._resizeObserver) {
            this._resizeObserver = new ResizeObserver(this._resizeObserverCallback);
        }
    }

    terminate(): void {
        if (this._resizeObserverSupported) {
            this._resizeObserver.disconnect();
            this._resizeObserver = null;
        } else {
            UnregisterUtil(this._control, 'controlResize');
        }
    }

    observe(container: HTMLElement): void {
        if (this._resizeObserverSupported) {
            this._initResizeObserver();
            this._resizeObserver.observe(container);
        }
    }

    unobserve(container: HTMLElement): void {
        if (this._resizeObserverSupported) {
            this._resizeObserver.unobserve(container);
        }
    }

    controlResizeHandler(): void {
        if (!this._resizeObserverSupported) {
            this._controlResizeCallback();
        }
    }
}
