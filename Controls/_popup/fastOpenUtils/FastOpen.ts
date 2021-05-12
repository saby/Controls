import { SyntheticEvent } from 'UICommon/Events';

const PRELOAD_DEPENDENCIES_HOVER_DELAY = 80;

export class DependencyTimer {
    protected _loadDependenciesTimer: number;

    start(callback: Function): void {
        this._loadDependenciesTimer = <any>setTimeout(callback, PRELOAD_DEPENDENCIES_HOVER_DELAY);
    }

    stop(): void {
        clearTimeout(this._loadDependenciesTimer);
    }
}

const CALM_DELAY: number = 100;

export class CalmTimer {
    protected _openId: number;
    protected _waitTimer: number;
    protected _closeId: number;

    private _clearWaitTimer(): void {
        if (this._waitTimer) {
            clearTimeout(this._waitTimer);
        }
    }

    resetTimeOut(): void {
        this._clearWaitTimer();
        if (this._openId) {
            clearTimeout(this._openId);
        }
        if (this._closeId) {
            clearTimeout(this._closeId);
        }
        this._openId = null;
        this._closeId = null;
    }

    start(callback: Function, delay?: number): void {
        this._clearWaitTimer();
        this._waitTimer = setTimeout(() => {
            this._waitTimer = null;
            callback();
        }, delay || CALM_DELAY);
    }

    open(callback: Function, delay: number): void {
        this.resetTimeOut();
        this._openId = setTimeout(() => {
            this._openId = null;
            callback();
        }, delay);
    }

    close(callback: Function, delay: number): void {
        this._clearWaitTimer();
        clearTimeout(this._openId);
        this._closeId = setTimeout(() => {
            this._closeId = null;
            callback();
        }, delay);
    }
}

export function isLeftMouseButton(event: SyntheticEvent<MouseEvent>): boolean {
    return event.nativeEvent.button === 0;
}
