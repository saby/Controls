import {SyntheticEvent} from 'Vdom/Vdom';

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

const CALM_DELAY: number = 40;

/**
 * Модуль, упрощающий открытие всплывающего окна через определенный промежуток времени
 * @public
 * @author Мочалов М.А.
 */
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

    /**
     * Открытие окна, находящегося внутри callback, через опеределенный промежуток времени.
     * Рекомендуется использовать во время события mouseMove, или когда нет необхожимости закрывать окно через определенны промежуток времени
     * @param {Function} callback
     * @param {number} delay
     */
    start(callback: Function, delay?: number): void {
        this._clearWaitTimer();
        this._waitTimer = setTimeout(() => {
            this._waitTimer = null;
            callback();
        }, delay || CALM_DELAY);
    }

    /**
     * Открытие окна, находящегося внутри callback, через определенный промежуток времени
     * @param {Function} callback
     * @param {number} delay
     */
    open(callback: Function, delay: number): void {
        this.resetTimeOut();
        this._openId = setTimeout(() => {
            this._openId = null;
            callback();
        }, delay);
    }

    /**
     * Закрытие окна, находящегося внутри callback, через определенный промежуток времени
     * @param {Function} callback
     * @param {number} delay
     */
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
