import {RegisterUtil, UnregisterUtil} from 'Controls/event';
import {constants} from 'Env/Env';

export default class ResizeObserverUtil {
    private readonly _control: any;
    private readonly _resizeObserverSupported: boolean = false;
    private _resizeObserver: any;
    private readonly _resizeObserverCallback: (entries: any) => void;
    private readonly _controlResizeCallback: (...args: any) => void;

    constructor(control: any, resizeObserverCallback: (entries: any) => void,
                controlResizeCallback?: (...args: any) => void) {
        this._control = control;
        this._resizeObserverSupported = constants.isBrowserPlatform && window.ResizeObserver;
        this._resizeObserverCallback = resizeObserverCallback.bind(this._control);
        // TODO должен быть 1 обработчик ресайза. controlResizeCallback нужно удалить.
        // + контекст на функцию должен биндиться не здесь.
        if (!controlResizeCallback) {
            this._controlResizeCallback = this._resizeObserverCallback;
        } else {
            this._controlResizeCallback = controlResizeCallback.bind(this._control);
        }
    }

    initialize(): void {
        if (this._resizeObserverSupported) {
            this._initResizeObserver();
        } else {
            // Обратная совместимость для мест где это еще используется, например старый скролл контэйнер.
            // Избавляемся от передачи this._control.
            // https://online.sbis.ru/opendoc.html?guid=1c50054d-615a-49b7-be10-24d512e97be7
            if (this._control) {
                RegisterUtil(this._control, 'controlResize', this._controlResizeCallback, { listenAll: true });
            }
        }
    }

    private _initResizeObserver(): void {
        if (!this._resizeObserver) {
            this._resizeObserver = new ResizeObserver(this._resizeObserverCallback);
        }
    }

    isResizeObserverSupported(): void {
        return this._resizeObserverSupported;
    }

    terminate(): void {
        if (this._resizeObserverSupported) {
            this._resizeObserver?.disconnect();
            this._resizeObserver = null;
        } else {
            if (this._control) {
                UnregisterUtil(this._control, 'controlResize');
            }
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
