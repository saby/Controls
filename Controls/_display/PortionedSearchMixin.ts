import PortionedSearchIndicator, {
    TPortionedSearchIndicatorPosition,
    IOptions as IPortionedSearchIndicatorOptions
} from './PortionedSearchIndicator';
import {TemplateFunction} from 'UI/Base';

export default abstract class PortionedSearchMixin<T = PortionedSearchIndicator> {
    protected _$portionedSearchTemplate: TemplateFunction|string;
    protected _$continueSearchTemplate: TemplateFunction|string;

    protected _topPortionedSearchIndicator: PortionedSearchIndicator = null;
    protected _bottomPortionedSearchIndicator: PortionedSearchIndicator = null;

    getTopPortionedSearchIndicator(): PortionedSearchIndicator {
        return this._topPortionedSearchIndicator;
    }

    getBottomPortionedSearchIndicator(): PortionedSearchIndicator {
        return this._bottomPortionedSearchIndicator;
    }

    startPortionedSearch(position: TPortionedSearchIndicatorPosition): void {
        const indicatorIsHidden  = !this._getPortionedSearchIndicator(position);
        if (indicatorIsHidden) {
            this._createPortionedSearchIndicator(position);
            this._nextVersion();
        }
    }

    endPortionedSearch(): void {
        // пытаемся скрывать оба индикатора, т.к. мы умеем порционный поиск только в одну сторону и индикатор
        // будет показываться только один. То есть таким способом мы точно скроем индикатор.
        this._hidePortionedSearchIndicator('top');
        this._hidePortionedSearchIndicator('bottom');
    }

    showPortionedSearchState(position: TPortionedSearchIndicatorPosition): void {
        const indicator = this._getPortionedSearchIndicator(position);
        indicator.showPortionedSearchState();
    }

    showContinueSearchState(position: TPortionedSearchIndicatorPosition): void {
        const indicator = this._getPortionedSearchIndicator(position);
        indicator.showContinueSearchState();
    }

    private _hidePortionedSearchIndicator(position: TPortionedSearchIndicatorPosition): void {
        const indicatorIsShowed = !!this._getPortionedSearchIndicator(position);
        if (indicatorIsShowed) {
            const indicatorName = this._getPortionedSearchIndicatorName(position);
            this[indicatorName] = null;
            this._nextVersion();
        }
    }

    private _getPortionedSearchIndicatorName(position: TPortionedSearchIndicatorPosition): string {
        return `_${position}PortionedSearchIndicator`;
    }

    private _getPortionedSearchIndicator(position: TPortionedSearchIndicatorPosition): PortionedSearchIndicator {
        const indicatorName = this._getPortionedSearchIndicatorName(position);
        return this[indicatorName];
    }

    private _createPortionedSearchIndicator(position: TPortionedSearchIndicatorPosition): void {
        const indicator = this.createItem({
            itemModule: 'Controls/display:PortionedSearchIndicator',
            position,
            portionedSearchTemplate: this._$portionedSearchTemplate,
            continueSearchTemplate: this._$continueSearchTemplate
        });

        const indicatorName = this._getPortionedSearchIndicatorName(position);
        this[indicatorName] = indicator;
    }

    abstract createItem(options: IPortionedSearchIndicatorOptions): T;
    protected abstract _nextVersion(): void;
}

Object.assign(PortionedSearchMixin.prototype, {
    'Controls/display:PortionedSearchMixin': true,
    _$portionedSearchTemplate: 'Controls/list:LoadingIndicatorTemplate',
    _$continueSearchTemplate: 'Controls/list:ContinueSearchTemplate',
    _topIndicator: null,
    _bottomIndicator: null
});