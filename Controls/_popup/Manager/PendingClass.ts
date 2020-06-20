import Deferred = require('Core/Deferred');
import ParallelDeferred = require('Core/ParallelDeferred');

let cnt = 0;

export interface IConfig {
    root?: string;
    showLoadingIndicator?: boolean;
    onPendingFail?: Function;
    validate?: Function;
    validateCompatible?: Function;
}

class PendingClass {
    private _pendings: object;
    private _parallelDef: object;

    private readonly _notify: (eventType: string, args: []) => string = null;

    constructor(_notifyHandler: (eventType: string, args: []) => string = null) {
        this._pendings = {};
        this._parallelDef = {};
        this._notify = _notifyHandler;
    }

    registerPending(deferred: Deferred, config: IConfig = {}): void {
        const root = config.root || null;
        if (!this._pendings[root]) {
            this._pendings[root] = {};
        }
        this._pendings[root][cnt] = {

            // its Promise what signalling about pending finish
            deferred,

            validate: config.validate,

            validateCompatible: config.validateCompatible,

            // its function what helps pending to finish when query goes from finishPendingOperations
            onPendingFail: config.onPendingFail,

            // show indicator when pending is registered
            showLoadingIndicator: config.showLoadingIndicator
        };
        if (config.showLoadingIndicator && !deferred.isReady()) {
            // show indicator if Promise still not finished on moment of registration
            const indicatorConfig = {id: this._pendings[root][cnt].loadingIndicatorId};
            this._pendings[root][cnt].loadingIndicatorId = this._notify('showIndicator', [indicatorConfig]);
        }

        deferred.addBoth(function(cnt: number, res) {
            this.unregisterPending(root, cnt);
            return res;
        }.bind(this, cnt));

        cnt++;
    }

    hideIndicators(root: string): void {
        const pending = this._pendings[root];
        Object.keys(pending).forEach((key) => {
            const indicatorId = pending[key].loadingIndicatorId;
            if (indicatorId) {
                this._notify('hideIndicator', [indicatorId]);
            }
        });
    }

    unregisterPending(root: string, id: number): void {
        // hide indicator if no more pendings with indicator showing
        this.hideIndicators(root);
        delete this._pendings[root][id];

        // notify if no more pendings
        if (!this.hasRegisteredPendings(root)) {
            this._notify('pendingsFinished', []);
        }
    }

    finishPendingOperations(forceFinishValue: boolean, isInside?: boolean, root: string = null): Deferred {
        const resultDeferred = new Deferred();
        const parallelDef = new ParallelDeferred();
        const pendingResults = [];

        const pendingRoot = this._pendings[root] || {};
        Object.keys(pendingRoot).forEach((key) => {
            const pending = pendingRoot[key];
            let isValid = true;
            if (pending.validate) {
                isValid = pending.validate(isInside);
            } else if (pending.validateCompatible) { //todo compatible
                isValid = pending.validateCompatible();
            }
            if (isValid) {
                if (pending.onPendingFail) {
                    pending.onPendingFail(forceFinishValue, pending.deferred);
                }

                // pending is waiting its deferred finish
                parallelDef.push(pending.deferred);
            }
        });

        // cancel previous query of pending finish. create new query.
        this.cancelFinishingPending(root);
        this._parallelDef[root] = parallelDef.done().getResult();

        this._parallelDef[root].addCallback((results) => {
            if (typeof results === 'object') {
                for (const resultIndex in results) {
                    if (results.hasOwnProperty(resultIndex)) {
                        const result = results[resultIndex];
                        pendingResults.push(result);
                    }
                }
            }
            this._parallelDef[root] = null;

            resultDeferred.callback(pendingResults);
        }).addErrback((e) => {
            resultDeferred.errback(e);
            return e;
        });

        return resultDeferred;
    }

    cancelFinishingPending(root: string = null): void {
        if (this._parallelDef && this._parallelDef[root]) {
            // its need to cancel result Promise of parallel defered. reset state of Promise to achieve it.
            this._parallelDef[root]._fired = -1;
            this._parallelDef[root].cancel();
        }
    }

    hasPendings(): boolean {
        let hasPending = false;
        Object.keys(this._pendings).forEach((root) => {
            if (this.hasRegisteredPendings(root)) {
                hasPending = true;
            }
        });
        return hasPending;
    }

    hasRegisteredPendings(root: string = null): boolean {
        let hasPending = false;
        const pendingRoot = this._pendings[root] || {};
        Object.keys(pendingRoot).forEach((key) => {
            const pending = pendingRoot[key];
            let isValid = true;
            if (pending.validate) {
                isValid = pending.validate();
            } else if (pending.validateCompatible) {
                // ignore compatible pendings
                isValid = false;
            }

            // We have at least 1 active pending
            if (isValid) {
                hasPending = true;
            }
        });
        return hasPending;
    }

    destroy(): void {
        this._pendings = null;
        this._parallelDef = null;
    }
}

export default PendingClass;
