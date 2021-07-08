import LoadingIndicator, {
    default as LoadingIndicatorItem,
    IOptions as ILoadingIndicatorOptions,
    TLoadingIndicatorPosition
} from './LoadingIndicator';
import LoadingTrigger, {
    TLoadingTriggerPosition,
    IOptions as ILoadingTriggerOptions,
} from './LoadingTrigger';

export interface ITriggerOffset {
    top: number;
    bottom: number;
}

export default abstract class LoadingIndicatorMixin<T = LoadingIndicator|LoadingTrigger> {
    protected _topLoadingIndicator: LoadingIndicatorItem = null;
    protected _bottomLoadingIndicator: LoadingIndicatorItem = null;
    protected _globalLoadingIndicator: LoadingIndicatorItem = null;

    protected _topLoadingTrigger: LoadingTrigger = null;
    protected _bottomLoadingTrigger: LoadingTrigger = null;

    // region Indicator

    hasLoadingIndicator(position: TLoadingIndicatorPosition): boolean {
        return !!this._getLoadingIndicator(position);
    }

    getGlobalLoadingIndicator(): LoadingIndicator {
        return this._globalLoadingIndicator;
    }

    getTopLoadingIndicator(): LoadingIndicator {
        return this._topLoadingIndicator;
    }

    getBottomLoadingIndicator(): LoadingIndicator {
        return this._bottomLoadingIndicator;
    }

    showLoadingIndicator(position: TLoadingIndicatorPosition): void {
        const indicatorIsHidden  = !this._getLoadingIndicator(position);
        if (indicatorIsHidden) {
            this._createLoadingIndicator(position);
            this._nextVersion();
        }
    }

    hideLoadingIndicator(position: TLoadingIndicatorPosition): boolean {
        const indicatorIsShowed = !!this._getLoadingIndicator(position);
        if (indicatorIsShowed) {
            const indicatorName = this._getLoadingIndicatorName(position);
            this[indicatorName] = null;
            this._nextVersion();
        }
    }

    private _getLoadingIndicatorName(position: TLoadingIndicatorPosition): string {
        return `_${position}LoadingIndicator`;
    }

    private _getLoadingIndicator(position: TLoadingIndicatorPosition): LoadingIndicatorItem {
        const indicatorName = this._getLoadingIndicatorName(position);
        return this[indicatorName];
    }

    private _createLoadingIndicator(position: TLoadingIndicatorPosition): void {
        const indicator = this.createItem({
            itemModule: 'Controls/display:LoadingIndicator',
            position
        });

        const indicatorName = this._getLoadingIndicatorName(position);
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

Object.assign(LoadingIndicatorMixin.prototype, {
    'Controls/display:LoadingIndicatorMixin': true,
    _topIndicator: null,
    _bottomIndicator: null,
    _globalIndicator: null,
    _topTrigger: null,
    _bottomTrigger: null,
});