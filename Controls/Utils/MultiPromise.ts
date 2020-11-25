type TExecutor<T> = (resolve: (value?: T | PromiseLike<T>) => void, reject: (reason?: any) => void) => void;

export class MultiPromise<T> {
    private _promise;
    private _promiseResolver;
    private _isDone: boolean = false;

    private _handler: TExecutor<T>;
    private _pendingSteps: string[];
    private _doneSteps: string[] = [];

    constructor(steps: string[], handler: TExecutor<T>) {
        this._handler = handler;
        this._pendingSteps = steps;
        this._promise = new Promise((resolver) => {
            this._promiseResolver = resolver;
        }).then(() => new Promise(handler));
    }

    static resolve<T>(steps: string[]): MultiPromise<T> {
        return new MultiPromise<T>(steps, (resolve) => resolve() );
    }

    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): this {
        this._promise.then(onfulfilled, onrejected);
        return this;
    }

    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): this {
        this._promise.catch(onrejected);
        return this;
    }

    finally(onfinally?: () => void): this {
        this._promise.finally(onfinally);
        return this;
    }

    resolveStep(stepName: string): this {
        if (this._pendingSteps.length === 0) {
            throw Error();
        }
        if (this._pendingSteps.indexOf(stepName) === -1) {
            throw Error();
        }
        if (this._doneSteps.indexOf(stepName) !== -1) {
            return;
        }
        this._doneSteps.push(stepName);
        this._tryToResolve();
        return this;
    }

    private _tryToResolve(): void {
        if (this._pendingSteps.length !== this._doneSteps.length) {
            return;
        }
        this._resolve();
    }

    private _resolve(): void {
        this._promiseResolver();
        this._isDone = true;
    }

}


