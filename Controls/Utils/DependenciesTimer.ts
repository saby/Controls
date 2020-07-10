
const PRELOAD_DEPENDENCIES_HOVER_DELAY = 80;

export default class DependenciesTimer {
    protected _loadDependenciesTimer: number;

    start(callback: Function): void {
        this._loadDependenciesTimer = <any>setTimeout(callback, PRELOAD_DEPENDENCIES_HOVER_DELAY);
    }

    stop(): void {
        clearTimeout(this._loadDependenciesTimer);
    }

}