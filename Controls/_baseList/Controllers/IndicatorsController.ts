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
    private _showIndicatorTimer: number;

    private _portionedSearchDirection: TPortionedSearchIndicatorPosition;
    private _portionedSearchTimer: number = null;
    private _searchState: SEARCH_STATES = 0;
    private _isAborted: boolean = false;
    private _showPortionedSearchTimer: number;

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
        if (!this._showIndicatorTimer) {
            this._startIndicatorTimer(() => this._model.showLoadingIndicator('global'));
        }
    }

    hideGlobalIndicator(): void {
        this._model.hideLoadingIndicator('global');
        this._clearIndicatorTimer();
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

    startPortionedSearch(direction: TPortionedSearchIndicatorPosition): void {
        if (this._getSearchState() === SEARCH_STATES.NOT_STARTED) {
            this._setSearchState(SEARCH_STATES.STARTED);
            this._startPortionedSearchTimer(SEARCH_MAX_DURATION);
            this._portionedSearchDirection = direction;

            this._startIndicatorTimer(() => this._model.startPortionedSearch(direction));
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
        this._startIndicatorTimer(() => this._model.startPortionedSearch(direction));
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
        this._model.showContinueSearchState(this._portionedSearchDirection);
        this._options.stopPortionedSearchCallback();
    }

    private _isPortionedSearch(): boolean {
        const metaData = this._options.items && this._options.items.getMetaData();
        return !!(metaData && metaData['iterative']);
    }

    // endregion PortionedSearch
}