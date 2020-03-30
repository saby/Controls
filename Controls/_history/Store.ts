export default class Store<T> {
    private readonly _store: Record<string, T> = {};
    get(key: string): T {
        return this._store[key];
    }
    set(key: string, value: T): boolean {
        this._store[key] = value;
        return true;
    }
    remove(key: string): void {
        delete this._store[key];
    }
    getKeys(): string[] {
        return Object.keys(this._store);
    }

    toObject(): Record<string, T> {
        return {...this._store};
    }
}
