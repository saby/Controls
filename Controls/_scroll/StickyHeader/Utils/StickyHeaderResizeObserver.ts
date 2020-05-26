import Component from '../Controller';
import {IResizeObserver} from '../interfaces';
import {RegisterUtil, UnregisterUtil} from 'Controls/event';

export default class StickyHeaderResizeObserver {
    private readonly _controller: Component;
    private readonly _resizeObserverSupported: boolean = false;
    private _resizeObserver: IResizeObserver;
    private _elementsHeight: object[] = [];
    private _firstResize: boolean = true;

    constructor(controller: Component) {
        this._controller = controller;
        this._resizeObserverSupported = typeof window !== 'undefined' && window.ResizeObserver;
    }

    initialize(): void {
        if (this._resizeObserverSupported) {
            this._initResizeObserver();
        } else {
            RegisterUtil(this._controller, 'controlResize', this._controller._resizeHandler.bind(this._controller));
        }
    }

    private _initResizeObserver(): void {
        if (!this._resizeObserver) {
            this._resizeObserver = new ResizeObserver((entries) => {
                let heightChanged = false;
                for (const entry of entries) {
                    heightChanged = this._elementsHeight.some((elemHeight) => {
                        if (elemHeight.key === entry.target && elemHeight.value !== entry.contentRect.height) {
                            elemHeight.value = entry.contentRect.height;
                            return true;
                        } else {
                            return false;
                        }
                    });
                }
                if (heightChanged || this._firstResize) {
                    this._firstResize = false;
                    this._controller._resizeHandler();
                }
            });
        }
    }

    terminate(): void {
        if (this._resizeObserverSupported) {
            this._resizeObserver.disconnect();
        } else {
            UnregisterUtil(this._controller, 'controlResize');
        }
    }

    observe(container: HTMLElement): void {
        if (this._resizeObserverSupported) {
            this._initResizeObserver();
            const stickyHeaders = this._getStickyHeaderElements(container);
            stickyHeaders.forEach((elem: HTMLElement) => {
                this._resizeObserver.observe(elem);
                this._elementsHeight.push({key: elem, value: elem.getBoundingClientRect().height});
            });
        }
    }

    unobserve(container: HTMLElement): void {
        if (this._resizeObserverSupported) {
            const stickyHeaders = this._getStickyHeaderElements(container);
            stickyHeaders.forEach((elem: HTMLElement) => {
                this._resizeObserver.unobserve(elem);
            });
        }
    }

    private _getStickyHeaderElements(container: HTMLElement): NodeListOf<HTMLElement> {
        if (getComputedStyle(container, null).display === 'contents') {
            return container.querySelectorAll('.controls-StickyHeader');
        } else {
            return [container];
        }
    }
}
