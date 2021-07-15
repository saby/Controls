import { Collection, EIndicatorState } from 'Controls/display';
import { RecordSet } from 'Types/collection';

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

type TPortionedSearchDirection = 'top'|'bottom';

export default class IndicatorsController {
    private _options: IIndicatorsControllerOptions;
    private _model: Collection;

    private _resetTopTriggerOffset: boolean;
    private _resetBottomTriggerOffset: boolean;
    private _showIndicatorTimer: number;

    private _portionedSearchDirection: TPortionedSearchDirection;
    private _portionedSearchTimer: number = null;
    private _searchState: SEARCH_STATES = 0;
    private _isAborted: boolean = false;

    constructor(options: IIndicatorsControllerOptions) {
        this._options = options;
        this._model = options.model;

        const hasItems = this._model && !!this._model.getCount();
        const displayTopIndicator = this.shouldDisplayTopIndicator() && hasItems;
        const displayBottomIndicator = this.shouldDisplayBottomIndicator() && hasItems;

        this._resetTopTriggerOffset = displayTopIndicator;
        this._resetBottomTriggerOffset = displayBottomIndicator;

        // Если верхний индикатор не будет показан, то сразу же показываем триггер,
        // чтобы в кейсе когда нет данных после моунта инициировать их загрузку
        if (!displayTopIndicator && this._model) {
            this._model.displayLoadingTopTrigger();
        }
        // Нижний индикатор сразу же показываем, т.к. не нужно скроллить
        if (displayBottomIndicator) {
            this.displayBottomIndicator();
        }
    }

    updateOptions(options: IIndicatorsControllerOptions): void {
        const shouldRecountAllIndicators = options.items && this._options.items !== options.items;

        this._options = options;
        this._model = options.model;

        if (shouldRecountAllIndicators) {
            this.recountIndicators('all')
        }
    }

    destroy(): void {
        clearTimeout(this._showIndicatorTimer);
        this._clearPortionedSearchTimer();
    }

    // region LoadingIndicator

    shouldDisplayTopIndicator(): boolean {
        return this._options.attachLoadTopTriggerToNull && this._options.hasMoreDataToTop
            && this._shouldDisplayIndicator('up');
    }

    shouldDisplayBottomIndicator(): boolean {
        return this._options.attachLoadDownTriggerToNull && this._options.hasMoreDataToBottom
            && this._shouldDisplayIndicator('down');
    }

    displayTopIndicator(scrollToFirstItem: boolean): void {
        const isDisplayedIndicator = this._model.hasLoadingIndicator('top');
        if (isDisplayedIndicator) {
            return;
        }

        this._model.displayIndicator('top', EIndicatorState.Loading);

        if (scrollToFirstItem) {
            this._options.scrollToFirstItem(() => this._model.displayLoadingTopTrigger());
        } else {
            this._model.displayLoadingTopTrigger();
        }
    }

    displayBottomIndicator(): void {
        const isDisplayedIndicator = this._model.hasLoadingIndicator('bottom');
        if (isDisplayedIndicator) {
            return;
        }

        this._model.displayIndicator('bottom', EIndicatorState.Loading);
    }

    displayGlobalIndicator(): void {
        if (!this._showIndicatorTimer) {
            this._startIndicatorTimer(
                () => this._model.displayIndicator('global', EIndicatorState.Loading)
            );
        }
    }

    hideGlobalIndicator(): void {
        this._model.hideIndicator('global');
        this._clearIndicatorTimer();
    }

    recountIndicators(direction: 'up'|'down'|'all', scrollToFirstItem: boolean = false): void {
        switch (direction) {
            case "up":
                this._recountTopIndicator(scrollToFirstItem);
                break;
            case "down":
                this._recountBottomIndicator();
                break;
            case 'all':
                // триггер после перезагрузки сбрасываем только если нужно показывать индикатор
                this._resetTopTriggerOffset = this.shouldDisplayTopIndicator();
                this._resetBottomTriggerOffset = this.shouldDisplayBottomIndicator();
                this._recountTopIndicator(scrollToFirstItem);
                this._recountBottomIndicator();
                // после перезагрузки скрываем глобальный индикатор
                this.hideGlobalIndicator();
                break;
        }
    }

    private _recountTopIndicator(scrollToFirstItem: boolean = false): void {
        // всегда скрываем индикатор и если нужно, то мы его покажем. Сделано так, чтобы если индикатор
        // и так был показан, подскроллить к нему.
        this._model.hideIndicator('top');

        // если нужно будет скроллить к первой записи, то значит что сверху записей нет
        // и не нужно будет их сразу подгружать, поэтому скрываем триггер
        if (scrollToFirstItem) {
            this._model.hideLoadingTopTrigger();
        }

        if (this.shouldDisplayTopIndicator()) {
            this.displayTopIndicator(scrollToFirstItem);
        }
    }

    private _recountBottomIndicator(): void {
        if (this.shouldDisplayBottomIndicator()) {
            this.displayBottomIndicator();
        } else {
            this._model.hideIndicator('bottom');
        }
    }

    private _shouldDisplayIndicator(direction: 'up'|'down'): boolean {
        // TODO LI нужно на навигацию смотреть
        return this._options.isInfinityNavigation && !this._options.hasHiddenItemsByVirtualScroll(direction)
            && !this._options.shouldShowEmptyTemplate;
    }

    private _startIndicatorTimer(showIndicator: () => void): void {
        this._showIndicatorTimer = setTimeout(() => {
            if (!this._model || this._model.destroyed) {
                return;
            }

            this._showIndicatorTimer = null;
            showIndicator();
        }, INDICATOR_DELAY);
    }

    private _clearIndicatorTimer(): void {
        if (this._showIndicatorTimer) {
            clearTimeout(this._showIndicatorTimer);
            this._showIndicatorTimer = null;
        }
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

    startPortionedSearch(direction: TPortionedSearchDirection): void {
        if (this._getSearchState() === SEARCH_STATES.NOT_STARTED) {
            this._setSearchState(SEARCH_STATES.STARTED);
            this._startPortionedSearchTimer(SEARCH_MAX_DURATION);
            this._portionedSearchDirection = direction;

            this._startIndicatorTimer(
                () => this._model.displayIndicator(direction, EIndicatorState.PortionedSearch)
            );
        }
    }

    /**
     * Нужно ли перезапустить таймер для показа индикатора порционного поиска
     * Перезапускаем, только если порционный поиск был начат, таймер запущен и еще не выполнился
     */
    shouldResetShowPortionedSearchTimer(): boolean {
        return this.isPortionedSearchInProgress() && !!this._showIndicatorTimer;
    }

    /**
     * Перезапускаем таймер для показа индикатора порционного поиска
     */
    resetShowPortionedSearchTimer(): void {
        this._clearIndicatorTimer();
        const direction = this._portionedSearchDirection;
        this._startIndicatorTimer(
            () => this._model.displayIndicator(direction, EIndicatorState.PortionedSearch)
        );
    }

    stopPortionedSearch(): void {
        this._clearPortionedSearchTimer();

        if (!this._isSearchContinued()) {
            this._stopPortionedSearch();
        }
    }

    continuePortionedSearch(): void {
        this._setSearchState(SEARCH_STATES.CONTINUED);
        this._startPortionedSearchTimer(SEARCH_CONTINUED_MAX_DURATION);
        this._model.displayIndicator(this._portionedSearchDirection, EIndicatorState.PortionedSearch)
    }

    abortPortionedSearch(): void {
        this._setSearchState(SEARCH_STATES.ABORTED);
        this._isAborted = true;
        this._clearPortionedSearchTimer();
        // скрываем все индикаторы, т.к. после abort никаких подгрузок не будет
        this._model.hideIndicator('top');
        this._model.hideIndicator('bottom');
        this._model.hideIndicator('global');
    }

    endPortionedSearch(): void {
        this._portionedSearchDirection = null;
        this._setSearchState(SEARCH_STATES.NOT_STARTED);
        this._isAborted = false;
        this._clearPortionedSearchTimer();
        this._model.hideIndicator(this._portionedSearchDirection);
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

    /**
     * Должны ли очистить таймеры для порционного поиск.
     * Очищаем только если сейчас идет порционный поиск и триггер перестал быть виден, то есть загрузили страницу.
     * По стандарту если за 30с успели загрузить страницу, то никаких индикаторов показываться не должно
     * @param triggerVisibility
     */
    shouldClearPortionedSearchTimer(triggerVisibility: {up: boolean, down: boolean}): boolean {
        const portionedSearchDirection = this.getPortionedSearchDirection();
        return this._isPortionedSearch() && this._portionedSearchTimer && (
            !triggerVisibility.down && portionedSearchDirection === 'down' ||
            !triggerVisibility.up && portionedSearchDirection === 'up'
        );
    }

    clearPortionedSearchTimer(): void {
        this._clearIndicatorTimer();
        this._clearPortionedSearchTimer();
    }

    private _startPortionedSearchTimer(duration: number): void {
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
        this._model.displayIndicator(this._portionedSearchDirection, EIndicatorState.ContinueSearch)
        this._options.stopPortionedSearchCallback();
    }

    private _isPortionedSearch(): boolean {
        const metaData = this._options.items && this._options.items.getMetaData();
        return !!(metaData && metaData['iterative']);
    }

    // endregion PortionedSearch
}