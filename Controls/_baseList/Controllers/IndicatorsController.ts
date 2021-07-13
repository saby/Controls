import { Collection } from 'Controls/display';
import {RecordSet} from "Types/collection";
import {TPortionedSearchIndicatorPosition} from "Controls/_display/PortionedSearchIndicator";

export interface IIndicatorsControllerOptions {
    model: Collection;
    items: RecordSet;
    isInfinityNavigation: boolean;
    hasMoreDataToTop: boolean;
    hasMoreDataToBottom: boolean;
    shouldShowEmptyTemplate: boolean;
    scrollToFirstItem: (afterScrollCallback: () => void) => void;
    hasHiddenItemsByVirtualScroll: (direction: 'up'|'down') => boolean;
    attachLoadTopTriggerToNull: boolean; // TODO LI переименовать
    attachLoadDownTriggerToNull: boolean; // TODO LI переименовать
    stopPortionedSearchCallback: () => void;
}

const INDICATOR_DELAY = 2000;
const SEARCH_MAX_DURATION = 30 * 1000;
const SEARCH_CONTINUED_MAX_DURATION = 2 * 60 * 1000;
enum SEARCH_STATES {
    NOT_STARTED = 0,
    STARTED = 'started',
    STOPPED = 'stopped',
    CONTINUED = 'continued',
    ABORTED = 'aborted'
}


export default class IndicatorsController {
    private _options: IIndicatorsControllerOptions;
    private _model: Collection;

    private _resetTopTriggerOffset: boolean;
    private _resetBottomTriggerOffset: boolean;
    private _showGlobalIndicatorTimer: number;

    private _portionedSearchDirection: TPortionedSearchIndicatorPosition;
    protected _portionedSearchTimer: NodeJS.Timeout = null;
    protected _searchState: SEARCH_STATES = 0;
    protected _isAborted: boolean = false;

    constructor(options: IIndicatorsControllerOptions) {
        this._options = options;
        this._model = options.model;

        const displayTopIndicator = this.shouldDisplayTopIndicator();
        const displayBottomIndicator = this.shouldDisplayBottomIndicator();

        this._resetTopTriggerOffset = displayTopIndicator;
        this._resetBottomTriggerOffset = displayBottomIndicator;

        // Если верхний индикатор не будет показан, то сразу же показываем триггер,
        // чтобы в кейсе когда нет данных после моунта инициировать их загрузку
        if (!displayTopIndicator) {
            this._model.showLoadingTopTrigger();
        }
        // Нижний индикатор сразу же показываем, т.к. не нужно скроллить
        if (displayBottomIndicator) {
            this.displayBottomIndicator();
        }
    }

    updateOptions(options: IIndicatorsControllerOptions): void {
        const shouldRecountAllIndicators = options.items && this._options.items !== options.items;

        this._options = options;

        if (shouldRecountAllIndicators) {
            this.recountIndicators('all')
        }
    }

    destroy(): void {
        clearTimeout(this._showGlobalIndicatorTimer);
        this._clearPortionedSearchTimer();
    }

    // region LoadingIndicator

    shouldDisplayTopIndicator(): boolean {
        // TODO LI нужно продумать логику для не infinity навигаций

        // В случае с pages, demand и maxCount проблема дополнительной загрузки после инициализации списка отсутствует.
        return this._options.attachLoadTopTriggerToNull && this._options.isInfinityNavigation
            && this._options.hasMoreDataToTop && this._shouldDisplayIndicator('up');
    }

    shouldDisplayBottomIndicator(): boolean {
        // TODO LI нужно продумать логику для не infinity навигаций

        // В случае с pages, demand и maxCount проблема дополнительной загрузки после инициализации списка отсутствует.
        return this._options.attachLoadDownTriggerToNull && this._options.isInfinityNavigation
            && this._options.hasMoreDataToBottom && this._shouldDisplayIndicator('down');
    }

    displayTopIndicator(scrollToFirstItem: boolean): void {
        const isDisplayedIndicator = this._model.hasLoadingIndicator('top');
        if (isDisplayedIndicator) {
            return;
        }

        this._model.showLoadingIndicator('top');

        if (scrollToFirstItem) {
            this._options.scrollToFirstItem(() => this._model.showLoadingTopTrigger());
        } else {
            this._model.showLoadingTopTrigger();
        }
    }

    displayBottomIndicator(): void {
        const isDisplayedIndicator = this._model.hasLoadingIndicator('bottom');
        if (isDisplayedIndicator) {
            return;
        }

        this._model.showLoadingIndicator('bottom');
    }

    displayGlobalIndicator(): void {
        if (!this._showGlobalIndicatorTimer) {
            this._showGlobalIndicatorTimer = setTimeout(() => {
                if (!this._model || this._model.destroyed) {
                    return;
                }

                this._showGlobalIndicatorTimer = null;
                this._model.showLoadingIndicator('global');
            }, INDICATOR_DELAY);
        }
    }

    hideGlobalIndicator(): void {
        this._model.hideLoadingIndicator('global');
        if (this._showGlobalIndicatorTimer) {
            clearTimeout(this._showGlobalIndicatorTimer);
            this._showGlobalIndicatorTimer = null;
        }
    }

    recountIndicators(direction: 'up'|'down'|'all'): void {
        switch (direction) {
            case "up":
                this._recountTopIndicator();
                break;
            case "down":
                this._recountBottomIndicator();
                break;
            case 'all':
                // триггер после перезагрузки сбрасываем только если нужно показывать индикатор
                this._resetTopTriggerOffset = this.shouldDisplayTopIndicator();
                this._resetBottomTriggerOffset = this.shouldDisplayBottomIndicator();
                this._recountTopIndicator();
                this._recountBottomIndicator();
                // после перезагрузки скрываем глобальный индикатор
                this.hideGlobalIndicator();
                break;
        }
    }

    private _recountTopIndicator(): void {
        if (this.shouldDisplayTopIndicator()) {
            this.displayTopIndicator(false);
        } else {
            this._model.hideLoadingIndicator('top');
        }
    }

    private _recountBottomIndicator(): void {
        if (this.shouldDisplayBottomIndicator()) {
            this.displayBottomIndicator();
        } else {
            this._model.hideLoadingIndicator('bottom');
        }
    }

    private _shouldDisplayIndicator(direction: 'up'|'down'): boolean {
        // Если нет элементов, то должен отображаться глобальный индикатор
        const hasItems = !!this._model && !!this._model.getCollection().getCount();
        const isPortionedSearchShowed = !!this._portionedSearchDirection;
        // Если порционный поиск был прерван, то никаких ромашек не должно показываться, т.к. больше не будет подгрузок
        const isPortionedSearchAborted = this._isAborted;
        return hasItems && !this._options.hasHiddenItemsByVirtualScroll(direction) && !isPortionedSearchShowed
            && !isPortionedSearchAborted && !this._options.shouldShowEmptyTemplate;
    }

    // endregion LoadingIndicator

    // region Trigger

    isResetTopTriggerOffset(): boolean {
        return this._resetTopTriggerOffset;
    }

    isResetBottomTriggerOffset(): boolean {
        return this._resetBottomTriggerOffset;
    }

    recountResetTriggerOffsets(directionOfLoadItems: 'up'|'down'): boolean {
        let changed = false;
        // после первого запроса остальные запросы нужно загружать заранее

        if (directionOfLoadItems === 'up' && this._resetTopTriggerOffset) {
            this._resetTopTriggerOffset = false;
            changed = true;
        }

        if (directionOfLoadItems === 'down' && this._resetBottomTriggerOffset) {
            this._resetBottomTriggerOffset = false;
            changed = true;
        }

        return changed;
    }

    // endregion Trigger

    // region PortionedSearch

    startPortionedSearch(direction: TPortionedSearchIndicatorPosition): void {
        if (this._getSearchState() === SEARCH_STATES.NOT_STARTED) {
            this._setSearchState(SEARCH_STATES.STARTED);
            this._startTimer(SEARCH_MAX_DURATION);
            this._portionedSearchDirection = direction;
            // TODO LI нужно показать с задержкой в 2c
            this._model.startPortionedSearch(direction);
        }
    }

    stopPortionedSearch(): void {
        this._clearPortionedSearchTimer();

        if (!this._isSearchContinued()) {
            this._stopPortionedSearch();
        }
    }

    continuePortionedSearch(): void {
        this._setSearchState(SEARCH_STATES.CONTINUED);
        this._startTimer(SEARCH_CONTINUED_MAX_DURATION);
        this._model.showPortionedSearchState(this._portionedSearchDirection);
    }

    abortPortionedSearch(): void {
        this._setSearchState(SEARCH_STATES.ABORTED);
        this._isAborted = true;
        this._clearPortionedSearchTimer();
        this._model.endPortionedSearch();
    }

    endPortionedSearch(): void {
        this._portionedSearchDirection = null;
        this._setSearchState(SEARCH_STATES.NOT_STARTED);
        this._isAborted = false;
        this._clearPortionedSearchTimer();
        this._model.endPortionedSearch();
    }

    shouldPortionedSearch(): boolean {
        return this._getSearchState() !== SEARCH_STATES.STOPPED && this._getSearchState() !== SEARCH_STATES.ABORTED;
    }

    isPortionedSearchInProgress(): boolean {
        return this._getSearchState() === SEARCH_STATES.STARTED || this._getSearchState() === SEARCH_STATES.CONTINUED;
    }

    getPortionedSearchDirection(): 'up'|'down' {
        // Приводим новые названия направлений к старым
        const portionedSearchDirection = this._portionedSearchDirection
            ? this._portionedSearchDirection.replace('top', 'up').replace('bottom', 'down')
            : null;
        return portionedSearchDirection as 'up'|'down';
    }

    private _startTimer(duration: number): void {
        this._portionedSearchTimer = setTimeout(() => {
            this._stopPortionedSearch();
        }, duration);
    }

    private _clearPortionedSearchTimer(): void {
        if (this._portionedSearchTimer) {
            clearTimeout(this._portionedSearchTimer);
            this._portionedSearchTimer = null;
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

    private _stopPortionedSearch(): void {
        this._setSearchState(SEARCH_STATES.STOPPED);
        this._model.showContinueSearchState(this._portionedSearchDirection);
        this._options.stopPortionedSearchCallback();
    }

    // region PortionedSearch
}