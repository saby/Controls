import {
    Collection, EIndicatorState, ITriggerOffset,
    DEFAULT_BOTTOM_TRIGGER_OFFSET, DEFAULT_TOP_TRIGGER_OFFSET
} from 'Controls/display';
import {RecordSet} from 'Types/collection';

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

export const DIRECTION_COMPATIBILITY = {
    'top': 'up',
    'up': 'down',
    'bottom': 'down',
    'down': 'bottom',
}

export default class IndicatorsController {
    private _options: IIndicatorsControllerOptions;
    private _model: Collection;

    private _resetTopTriggerOffset: boolean;
    private _resetBottomTriggerOffset: boolean;
    private _displayIndicatorTimer: number;

    private _portionedSearchDirection: TPortionedSearchDirection;
    private _portionedSearchTimer: number = null;
    private _searchState: SEARCH_STATES = 0;

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

    updateOptions(options: IIndicatorsControllerOptions): boolean {
        const shouldRecountAllIndicators = options.items && this._options.items !== options.items;

        this._options = options;
        this._model = options.model;

        let changedResetTrigger = false;
        if (shouldRecountAllIndicators) {
            changedResetTrigger = this.recountIndicators('all', true)
        }
        return changedResetTrigger;
    }

    destroy(): void {
        this.clearPortionedSearchTimer();
    }

    // region LoadingIndicator

    shouldDisplayTopIndicator(): boolean {
        return this._options.attachLoadTopTriggerToNull && this._options.hasMoreDataToTop
            && this._shouldDisplayIndicator('up');
    }

    displayTopIndicator(scrollToFirstItem: boolean): void {
        const isDisplayedIndicator = this._model.hasIndicator('top');
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

    shouldDisplayBottomIndicator(): boolean {
        return this._options.attachLoadDownTriggerToNull && this._options.hasMoreDataToBottom
            && this._shouldDisplayIndicator('down');
    }

    displayBottomIndicator(): void {
        const isDisplayedIndicator = this._model.hasIndicator('bottom');
        if (isDisplayedIndicator) {
            return;
        }

        const indicatorState = this._isPortionedSearch() ? EIndicatorState.PortionedSearch : EIndicatorState.Loading;
        this._model.displayIndicator('bottom', indicatorState);
    }

    displayGlobalIndicator(): void {
        if (!this._displayIndicatorTimer) {
            this._startDisplayIndicatorTimer(
                () => this._model.displayIndicator('global', EIndicatorState.Loading)
            );
        }
    }

    hideGlobalIndicator(): void {
        this._model.hideIndicator('global');
        this._clearDisplayIndicatorTimer();
    }

    recountIndicators(direction: 'up'|'down'|'all', scrollToFirstItem: boolean = false): boolean {
        let changedResetTrigger = false;

        // если поиск был прерван, то ничего делать не нужно, т.к. ромашек теперь точно не будет
        if (this._getSearchState() === SEARCH_STATES.ABORTED) {
            return changedResetTrigger;
        }

        switch (direction) {
            case "up":
                this._recountTopIndicator(scrollToFirstItem);
                break;
            case "down":
                this._recountBottomIndicator();
                break;
            case 'all':
                changedResetTrigger = this.recountResetTriggerOffsets('all');
                this._recountTopIndicator(scrollToFirstItem);
                this._recountBottomIndicator();
                // после перезагрузки скрываем глобальный индикатор
                this.hideGlobalIndicator();
                break;
        }

        return changedResetTrigger;
    }

    hasDisplayedIndicator(): boolean {
        return !!(
            this._model.hasIndicator('top') ||
            this._model.hasIndicator('bottom') ||
            this._model.hasIndicator('global')
        );
    }

    private _recountTopIndicator(scrollToFirstItem: boolean = false): void {
        // если сейчас порционный поиск и у нас еще не кончился таймер показа индикатора, то не нужно пересчитывать,
        // т.к. при порционном поиске индикатор покажется с задержкой в 2с, дожидаемся её
        if (this._isPortionedSearch() && this._displayIndicatorTimer) {
            return;
        }

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
        // если сейчас порционный поиск и у нас еще не кончился таймер показа индикатора, то не нужно пересчитывать,
        // т.к. при порционном поиске индикатор покажется с задержкой в 2с, дожидаемся её
        if (this._isPortionedSearch() && this._displayIndicatorTimer) {
            return;
        }

        if (this.shouldDisplayBottomIndicator()) {
            this.displayBottomIndicator();
        } else {
            this._model.hideIndicator('bottom');
        }
    }

    private _shouldDisplayIndicator(direction: 'up'|'down'): boolean {
        return this._options.isInfinityNavigation && !this._options.hasHiddenItemsByVirtualScroll(direction)
            && !this._options.shouldShowEmptyTemplate;
    }

    private _startDisplayIndicatorTimer(showIndicator: () => void): void {
        this._displayIndicatorTimer = setTimeout(() => {
            if (!this._model || this._model.destroyed) {
                return;
            }

            this._displayIndicatorTimer = null;
            showIndicator();
        }, INDICATOR_DELAY);
    }

    private _clearDisplayIndicatorTimer(): void {
        if (this._displayIndicatorTimer) {
            clearTimeout(this._displayIndicatorTimer);
            this._displayIndicatorTimer = null;
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

    /**
     * Сбрасывает флаг resetTriggerOffset для направления directionOfLoadItems
     * @param directionOfLoadItems Направление подгрузки данных
     */
    recountResetTriggerOffsets(directionOfLoadItems: 'up'|'down'|'all'): boolean {
        let changed = false;

        if (directionOfLoadItems === 'all') {
            // триггер после перезагрузки сбрасываем только если нужно показывать индикатор
            const displayTopTrigger = this.shouldDisplayTopIndicator();
            const displayBottomTrigger = this.shouldDisplayBottomIndicator();

            if (displayTopTrigger && !this._resetTopTriggerOffset) {
                this._resetTopTriggerOffset = true;
                changed = true;
            }

            if (displayBottomTrigger && !this._resetBottomTriggerOffset) {
                this._resetBottomTriggerOffset = true;
                changed = true;
            }
        }

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

    setLoadingTriggerOffset(offset: ITriggerOffset): void {
        const newOffset = this._correctTriggerOffset(offset);
        this._model.setLoadingTriggerOffset(newOffset);
    }

    /**
     * Корректируем оффсет на высоту индикатора, т.к. триггер отображается абсолютно, то он рисуется от края вьюхи,
     * а надо от края индикатора.
     * Значение офссета = 0, нам не подходит, т.к. триггер находится за индикатором
     * Поэтому дефолтный оффсет должен быть 48 для верхней ромашки и 47 для нижней.
     * 47 - чтобы сразу же не срабатывала загрузка вверх, а только после скролла к ромашке.
     * @param offset
     * @private
     */
    private _correctTriggerOffset(offset: ITriggerOffset): ITriggerOffset {
        const newOffset = {...offset};

        if (this._model.hasIndicator('top')) {
            newOffset.top = newOffset.top + DEFAULT_TOP_TRIGGER_OFFSET;
        }
        if (this._model.hasIndicator('bottom')) {
            newOffset.bottom = newOffset.bottom + DEFAULT_BOTTOM_TRIGGER_OFFSET;
        }

        return newOffset;
    }

    // endregion Trigger

    // region PortionedSearch

    startPortionedSearch(direction: TPortionedSearchDirection): void {
        const currentState = this._getSearchState();
        if (currentState === SEARCH_STATES.NOT_STARTED || currentState === SEARCH_STATES.ABORTED) {
            this._setSearchState(SEARCH_STATES.STARTED);
            this._startPortionedSearchTimer(SEARCH_MAX_DURATION);
            this._portionedSearchDirection = direction;

            // скрываем индикатор, т.к. после начала порционного поиска индикатор долежн показаться через 2с,
            // а на момент начала поиска может быть уже показан индикатор
            this._model.hideIndicator(direction);
            this._startDisplayIndicatorTimer(
                () => this._model.displayIndicator(direction, EIndicatorState.PortionedSearch)
            );
        }
    }

    /**
     * Определяем, нужно ли приостанавливать поиск
     * @remark
     * Поиск нужно приостановить если страница успела загрузиться быстрее 30с(при первой подгрузке)
     * или быстрее 2м(при последующних подгрузках)
     * @param pageLoaded Признак, который означает что загрузилась целая страница
     */
    shouldStopPortionedSearch(pageLoaded: boolean): boolean {
        return pageLoaded && this.isPortionedSearchInProgress() && !this._isSearchContinued();
    }

    stopPortionedSearch(): void {
        this.clearPortionedSearchTimer();
        this._setSearchState(SEARCH_STATES.STOPPED);
        this._model.displayIndicator(this._portionedSearchDirection, EIndicatorState.ContinueSearch)
        this._options.stopPortionedSearchCallback();
    }

    continuePortionedSearch(): void {
        this._setSearchState(SEARCH_STATES.CONTINUED);
        this._startPortionedSearchTimer(SEARCH_CONTINUED_MAX_DURATION);
        this._model.displayIndicator(this._portionedSearchDirection, EIndicatorState.PortionedSearch)
    }

    abortPortionedSearch(): void {
        this._setSearchState(SEARCH_STATES.ABORTED);
        this.clearPortionedSearchTimer();
        // скрываем все индикаторы, т.к. после abort никаких подгрузок не будет
        this._model.hideIndicator('top');
        this._model.hideIndicator('bottom');
        this._model.hideIndicator('global');
    }

    endPortionedSearch(): void {
        this._model.hideIndicator(this._portionedSearchDirection);
        this._portionedSearchDirection = null;
        this._setSearchState(SEARCH_STATES.NOT_STARTED);
        this.clearPortionedSearchTimer();
    }

    /**
     * Нужно ли перезапустить таймер для показа индикатора порционного поиска
     * Перезапускаем, только если порционный поиск был начат, таймер запущен и еще не выполнился
     */
    shouldResetShowPortionedSearchTimer(): boolean {
        return this.isPortionedSearchInProgress() && !!this._displayIndicatorTimer;
    }

    /**
     * Перезапускаем таймер для показа индикатора порционного поиска
     */
    resetShowPortionedSearchTimer(): void {
        this._clearDisplayIndicatorTimer();
        this._startDisplayIndicatorTimer(
            () => this._model.displayIndicator(
                this._portionedSearchDirection, EIndicatorState.PortionedSearch
            )
        );
    }

    shouldContinuePortionedSearch(): boolean {
        // TODO LI точно ли нужна проверка на STOPPED
        return this._getSearchState() !== SEARCH_STATES.STOPPED && this._getSearchState() !== SEARCH_STATES.ABORTED;
    }

    isPortionedSearchInProgress(): boolean {
        return this._getSearchState() === SEARCH_STATES.STARTED || this._getSearchState() === SEARCH_STATES.CONTINUED;
    }

    getPortionedSearchDirection(): 'up'|'down' {
        // Приводим новые названия направлений к старым
        return DIRECTION_COMPATIBILITY[this._portionedSearchDirection] as 'up'|'down';
    }

    clearPortionedSearchTimer(): void {
        this._clearDisplayIndicatorTimer();
        if (this._portionedSearchTimer) {
            clearTimeout(this._portionedSearchTimer);
            this._portionedSearchTimer = null;
        }
    }

    private _startPortionedSearchTimer(duration: number): void {
        this._portionedSearchTimer = setTimeout(() => {
            this.stopPortionedSearch();
        }, duration);
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

    private _isPortionedSearch(): boolean {
        const metaData = this._options.items && this._options.items.getMetaData();
        return !!(metaData && metaData['iterative']);
    }

    // endregion PortionedSearch
}