const MAX_SEARCH_DURATION = 10000;
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
    protected _searchTimer: number = null;
    protected _searchState: SEARCH_STATES = 0;
    protected _options: IPortionedSearchOptions = null;

    constructor(constructorOptions: IPortionedSearchOptions) {
        this._options = constructorOptions;
    }

    startSearch(): void {
        if (this._getSearchState() === SEARCH_STATES.NOT_STARTED) {
            this._setSearchState(SEARCH_STATES.STARTED);
            this._startTimer();
            this._options.searchStartCallback();
        }
    }

    abortSearch(): void {
        this._setSearchState(SEARCH_STATES.STOPPED);
        this._clearTimer();
        this._options.searchAbortCallback();
    }

    reset(): void {
        this._setSearchState(SEARCH_STATES.NOT_STARTED);
        this._clearTimer();
        this._options.searchResetCallback();
    }

    resetTimer(): void {
        if (!this._isSearchContinued()) {
            this._clearTimer();
            this._startTimer();
        }
    }

    shouldSearch(): boolean {
        return this._getSearchState() !== SEARCH_STATES.STOPPED;
    }

    continueSearch(): void {
        this._setSearchState(SEARCH_STATES.CONTINUED);
        this._options.searchContinueCallback();
    }

    private _startTimer(): void {
        this._searchTimer = setTimeout(() => {
            this._setSearchState(SEARCH_STATES.STOPPED);
            this._options.searchStopCallback();
        }, MAX_SEARCH_DURATION);
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
}
