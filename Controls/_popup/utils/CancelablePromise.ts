export default class CancelablePromise<T> {
    private _promise: Promise<T>;
    private _canceled: boolean = false;

    constructor(callback: Function) {
        this._promise = new Promise((resolve, reject) => {
            callback(this, resolve, reject);
        });
    }

    then(callback: (value?: T) => void): Promise<void | T> {
        return this._promise.then(callback).catch(() => {
            // catch error
        });
    }

    catch(callback: (value: T) => void): Promise<void | T> {
        return this._promise.catch(callback);
    }

    cancelPromise(): void {
        this._canceled = true;
    }

    isCanceled(): boolean {
        return this._canceled;
    }
}
