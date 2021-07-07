import {Model} from 'Types/entity';

import IItemsStrategy from './IItemsStrategy';
import {StrategyConstructor} from './Collection';
import CollectionItem from './CollectionItem';
import {default as PortionedSearchStrategy} from './itemsStrategy/PortionedSearch';
import {IEnumerableComparatorSession} from 'Types/collection';
import {TPortionedSearchIndicatorPosition} from './PortionedSearchIndicator';
import {TemplateFunction} from "UI/Base";

export default abstract class PortionedSearchMixin<
    S extends Model = Model,
    T extends CollectionItem<S> = CollectionItem<S>
> {
    protected _$portionedSearchTemplate: TemplateFunction|string;
    protected _$continueSearchTemplate: TemplateFunction|string;

    startPortionedSearch(position: TPortionedSearchIndicatorPosition): void {
        const strategy = this._getPortionedSearchStrategy();

        const session = this._startUpdateSession();
        const changed = strategy.showIndicator(position);
        if (changed) {
            this._reSort();
            this._reFilter();
            this._nextVersion();
            this._finishUpdateSession(session);
        }
    }

    endPortionedSearch(): void {
        const strategy = this._getPortionedSearchStrategy();

        const session = this._startUpdateSession();
        // пытаемся скрывать оба индикатора, т.к. мы умеем порционный поиск только в одну сторону и индикатор
        // будет показываться только один. То есть таким способом мы точно скроем индикатор.
        const topIndicatorHidden = strategy.hideIndicator('top');
        const bottomIndicatorHidden = strategy.hideIndicator('bottom');
        if (topIndicatorHidden || bottomIndicatorHidden) {
            this._reSort();
            this._reFilter();
            this._nextVersion();
            this._finishUpdateSession(session);
        }
    }

    showPortionedSearch(position: TPortionedSearchIndicatorPosition): void {
        const strategy = this._getPortionedSearchStrategy();
        strategy.showPortionedSearch(position);
    }

    showContinueSearch(position: TPortionedSearchIndicatorPosition): void {
        const strategy = this._getPortionedSearchStrategy();
        strategy.showContinueSearch(position);
    }

    private _getPortionedSearchStrategy(): PortionedSearchStrategy {
        return this.getStrategyInstance(PortionedSearchStrategy as any as StrategyConstructor<any>)
    }

    abstract getStrategyInstance<F extends IItemsStrategy<S, T>>(strategy: StrategyConstructor<F>): F;
    protected abstract _nextVersion(): void;
    protected abstract _reSort(): void;
    protected abstract _reFilter(): void;
    protected abstract _startUpdateSession(): IEnumerableComparatorSession;
    protected abstract _finishUpdateSession(session: IEnumerableComparatorSession, analize?: boolean): void;
}

Object.assign(PortionedSearchMixin.prototype, {
    'Controls/display:PortionedSearchMixin': true,
    _$portionedSearchTemplate: 'Controls/list:LoadingIndicatorTemplate',
    _$continueSearchTemplate: 'Controls/list:ContinueSearchTemplate'
});