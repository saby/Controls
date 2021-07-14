import Indicator, {
    default as LoadingIndicatorItem, IOptions as ILoadingIndicatorOptions,
    TIndicatorPosition, TIndicatorState
} from './Indicator';
import LoadingTrigger, {
    TLoadingTriggerPosition,
    IOptions as ILoadingTriggerOptions,
} from './LoadingTrigger';

export interface ITriggerOffset {
    top: number;
    bottom: number;
}

export default abstract class IndicatorsMixin<T = Indicator|LoadingTrigger> {
    protected _topIndicator: LoadingIndicatorItem = null;
    protected _bottomIndicator: LoadingIndicatorItem = null;
    protected _globalIndicator: LoadingIndicatorItem = null;

    protected _topLoadingTrigger: LoadingTrigger = null;
    protected _bottomLoadingTrigger: LoadingTrigger = null;

    // region Indicator

    hasLoadingIndicator(position: TIndicatorPosition): boolean {
        return !!this._getIndicator(position);
    }

    getGlobalLoadingIndicator(): Indicator {
        return this._globalIndicator;
    }

    getTopLoadingIndicator(): Indicator {
        return this._topIndicator;
    }

    getBottomLoadingIndicator(): Indicator {
        return this._bottomIndicator;
    }

    displayIndicator(position: TIndicatorPosition, state: TIndicatorState): void {
        const indicator = this._getIndicator(position);
        if (indicator) {
            const changedState = indicator.setState(state);
            if (changedState) {
                this._nextVersion();
            }
        } else {
            this._createIndicator(position, state);
            this._nextVersion();
        }
    }

    hideIndicator(position: TIndicatorPosition): void {
        const indicatorIsShowed = !!this._getIndicator(position);
        if (indicatorIsShowed) {
            const indicatorName = this._getIndicatorName(position);
            this[indicatorName] = null;
            this._nextVersion();
        }
    }

    private _getIndicatorName(position: TIndicatorPosition): string {
        return `_${position}Indicator`;
    }

    private _getIndicator(position: TIndicatorPosition): LoadingIndicatorItem {
        const indicatorName = this._getIndicatorName(position);
        return this[indicatorName];
    }

    private _createIndicator(position: TIndicatorPosition, state: TIndicatorState): void {
        const indicator = this.createItem({
            itemModule: 'Controls/display:Indicator',
            position,
            state
        });

        const indicatorName = this._getIndicatorName(position);
        this[indicatorName] = indicator;
    }

    // endregion Indicator

    // region Trigger

    getTopLoadingTrigger(): LoadingTrigger {
        return this._getLoadingTrigger('top');
    }

    getBottomLoadingTrigger(): LoadingTrigger {
        return this._getLoadingTrigger('bottom');
    }

    showLoadingTopTrigger(): void {
        this._showTrigger('top');
    }

    setLoadingTriggerOffset(offset: ITriggerOffset): void {
        let changed = false;
        if (this._topLoadingTrigger) {
            const topOffsetChanged = this._topLoadingTrigger.setOffset(offset.top);
            changed = changed || topOffsetChanged;
        }
        if (this._bottomLoadingTrigger) {
            const bottomOffsetChanged = this._bottomLoadingTrigger.setOffset(offset.bottom);
            changed = changed || bottomOffsetChanged;
        }
        if (changed) {
            this._nextVersion();
        }
    }

    private _getLoadingTriggerName(position: TLoadingTriggerPosition): string {
        return `_${position}LoadingTrigger`;
    }

    private _showTrigger(position: TLoadingTriggerPosition): void {
        const trigger = this._getLoadingTrigger(position);
        const changed = trigger.show();
        if (changed) {
            this._nextVersion();
        }
    }

    private _getLoadingTrigger(position: TLoadingTriggerPosition): LoadingTrigger {
        const triggerName = this._getLoadingTriggerName(position);

        let trigger = this[triggerName];

        if (!trigger) {
            this._createLoadingTrigger(position);
        }
        return this[triggerName];
    }

    private _createLoadingTrigger(position: TLoadingTriggerPosition): void {
        const isTopTrigger = position === 'top';
        // У верхнего триггера оффсет должен быть изначально -1, иначе обсервер сразу сработает
        const offset = isTopTrigger ? -1 : 0;
        const visible = !isTopTrigger;
        const trigger = this.createItem({
            itemModule: 'Controls/display:LoadingTrigger',
            position,
            offset,
            visible
        });

        const triggerName = this._getLoadingTriggerName(position);
        this[triggerName] = trigger;
    }

    // endregion Trigger

    abstract createItem(options: ILoadingIndicatorOptions|ILoadingTriggerOptions): T;
    protected abstract _nextVersion(): void;
}

Object.assign(IndicatorsMixin.prototype, {
    'Controls/display:IndicatorsMixin': true,
    _topIndicator: null,
    _bottomIndicator: null,
    _globalIndicator: null,
    _topTrigger: null,
    _bottomTrigger: null,
});