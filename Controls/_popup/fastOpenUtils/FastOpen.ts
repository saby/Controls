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
    protected _callback: Function;
    protected _closeId: number;

    constructor(callback: Function) {
        this._callback = callback;
    }

    resetTimeOut(): void {
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
     * Выполнение callback, через опеределенный промежуток времени.
     */
    start(): void {
        this.resetTimeOut();
        this._openId = setTimeout(() => {
            this._openId = null;
            this._callback();
        }, CALM_DELAY);
    }

    /**
     * Закрытие окна, находящегося внутри callback, через определенный промежуток времени
     * @param {Function} callback
     */
    stop(callback: Function): void {
        clearTimeout(this._openId);
        this._closeId = setTimeout(() => {
            this._closeId = null;
            callback();
        }, CALM_DELAY);
    }
}

export function isLeftMouseButton(event: SyntheticEvent<MouseEvent>): boolean {
    return event.nativeEvent.button === 0;
}
