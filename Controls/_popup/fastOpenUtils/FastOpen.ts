import {SyntheticEvent} from 'Vdom/Vdom';
import {detection} from 'Env/Env';

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

    constructor(callback?: Function) {
        this._callback = callback;
    }

    isStarted(): boolean {
        return !!this._openId;
    }

    /**
     * Выполнение callback, через опеределенный промежуток времени.
     */
    start(): void {
        this.resetTimeOut();
        if (!detection.isMobilePlatform) {
            const args = arguments;
            this._openId = setTimeout(() => {
                this._openId = null;
                this._callback(...args);
            }, CALM_DELAY);
        } else {
            this._callback(...arguments);
        }
    }

    /**
     * Сброс timeout
     */
    stop(): void {
        if (this._openId) {
            clearTimeout(this._openId);
        }
        this._openId = null;
    }
}

export function isLeftMouseButton(event: SyntheticEvent<MouseEvent>): boolean {
    return event.nativeEvent.button === 0;
}
