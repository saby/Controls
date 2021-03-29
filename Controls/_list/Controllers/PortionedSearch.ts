import {IDirection} from '../interface/IVirtualScroll';

const SEARCH_MAX_DURATION = 30 * 1000;
const SEARCH_CONTINUED_MAX_DURATION = 2 * 60 * 1000;
enum SEARCH_STATES {
  NOT_STARTED = 0,
  STARTED = 'started',
  STOPPED = 'stopped',
  CONTINUED = 'continued'
}

export interface IPortionedSearchOptions {
    searchStopCallback: Function;
    searchResetCallback: Function;
    searchContinueCallback: Function;
    searchAbortCallback: Function;
    searchStartCallback: Function;
}

export default class PortionedSearch<PortionedSearchOptions> {
    protected _searchTimer: NodeJS.Timeout = null;
    protected _searchState: SEARCH_STATES = 0;
    protected _isAborted: boolean = false;
    protected _options: IPortionedSearchOptions = null;

    constructor(constructorOptions: IPortionedSearchOptions) {
        this._options = constructorOptions;
    }

    startSearch(): void {
        if (this._getSearchState() === SEARCH_STATES.NOT_STARTED) {
            this._setSearchState(SEARCH_STATES.STARTED);
            this._startTimer(SEARCH_MAX_DURATION);
            this._options.searchStartCallback();
        }
    }

    abortSearch(): void {
        this._setSearchState(SEARCH_STATES.STOPPED);
        this._isAborted = true;
        this._clearTimer();
        this._options.searchAbortCallback();
    }

    isAborted(): boolean {
        return this._isAborted;
    }

    reset(): void {
        this._setSearchState(SEARCH_STATES.NOT_STARTED);
        this._isAborted = false;
        this._clearTimer();
        this._options.searchResetCallback();
    }

    resetTimer(): void {
        if (!this._isSearchContinued()) {
            this._clearTimer();
            this._startTimer(SEARCH_MAX_DURATION);
        }
    }

    shouldSearch(): boolean {
        return this._getSearchState() !== SEARCH_STATES.STOPPED;
    }

    continueSearch(): void {
        this._setSearchState(SEARCH_STATES.CONTINUED);
        this._startTimer(SEARCH_CONTINUED_MAX_DURATION);
        this._options.searchContinueCallback();
    }

    stopSearch(direction?: IDirection): void {
        this._clearTimer();

        if (!this._isSearchContinued()) {
            this._stopSearch(direction);
        }
    }

    destroy(): void {
        this._clearTimer();
    }

    private _startTimer(duration: number): void {
        this._searchTimer = setTimeout(() => {
            this._stopSearch();
        }, duration);
    }

    private _clearTimer(): void {
        if (this._searchTimer) {
            clearTimeout(this._searchTimer);
            this._searchTimer = null;
        }
    }

    private _setSearchState(state: SEARCH_STATES): void {
        this._searchState = state;
    }

    private _getSearchState(): SEARCH_STATES {
        return this._searchState;
    }

    private _isSearchContinued(): boolean {
        return this._getSearchState() === SEARCH_STATES.CONTINUED;
    }

    private _stopSearch(direction?: IDirection): void {
        this._setSearchState(SEARCH_STATES.STOPPED);
        this._options.searchStopCallback(direction);
    }
}
