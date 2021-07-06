import {Model} from 'Types/entity';

import IItemsStrategy from './IItemsStrategy';
import {StrategyConstructor} from './Collection';
import CollectionItem from './CollectionItem';
import {default as LoadingIndicatorStrategy} from './itemsStrategy/LoadingIndicator';
import LoadingIndicator, {TLoadingIndicatorPosition} from './LoadingIndicator';
import {IEnumerableComparatorSession} from 'Types/collection';

export interface ITriggerOffset {
    top: number;
    bottom: number;
}

export default abstract class LoadingIndicatorMixin<
    S extends Model = Model,
    T extends CollectionItem<S> = CollectionItem<S>
> {

    showIndicator(position: TLoadingIndicatorPosition): void {
        const strategy = this._getLoadingIndicatorStrategy();

        const session = this._startUpdateSession();
        const changed = strategy.showIndicator(position);
        if (changed) {
            this._reSort();
            this._reFilter();
            this._nextVersion();
            this._finishUpdateSession(session);
        }
    }

    hideIndicator(position: TLoadingIndicatorPosition): void {
        const strategy = this._getLoadingIndicatorStrategy();

        const session = this._startUpdateSession();
        const changed = strategy.hideIndicator(position);
        if (changed) {
            this._reSort();
            this._reFilter();
            this._nextVersion();
            this._finishUpdateSession(session);
        }
    }

    hasIndicator(position: TLoadingIndicatorPosition): boolean {
        const strategy = this._getLoadingIndicatorStrategy();
        return !!strategy.getIndicator(position);
    }

    showTopTrigger(displaceTriggerToUp: boolean = true): void {
        const strategy = this._getLoadingIndicatorStrategy();

        const session = this._startUpdateSession();
        const changed = strategy.showTrigger('top', displaceTriggerToUp);
        if (changed) {
            this._reSort();
            this._reFilter();
            this._nextVersion();
            this._finishUpdateSession(session);
        }
    }

    setTriggerOffset(offset: ITriggerOffset): void {
        const strategy = this._getLoadingIndicatorStrategy();
        const changed = strategy.setTriggerOffset(offset);
        if (changed) {
            this._nextVersion();
        }
    }

    private _getLoadingIndicatorStrategy(): LoadingIndicatorStrategy {
        return this.getStrategyInstance(LoadingIndicatorStrategy as any as StrategyConstructor<any>)
    }

    abstract getStrategyInstance<F extends IItemsStrategy<S, T>>(strategy: StrategyConstructor<F>): F;
    protected abstract _nextVersion(): void;
    protected abstract _reSort(): void;
    protected abstract _reFilter(): void;
    protected abstract _startUpdateSession(): IEnumerableComparatorSession;
    protected abstract _finishUpdateSession(session: IEnumerableComparatorSession, analize?: boolean): void;
}

Object.assign(LoadingIndicatorMixin.prototype, {
    'Controls/display:LoadingIndicatorMixin': true
});