import {date as formatDate} from 'Types/formatter';
import {Date as WSDate} from 'Types/entity';
import {debounce} from 'Types/function';
import {Base as BaseSource} from 'Types/source';
import {SyntheticEvent} from 'Vdom/Vdom';
import {Control, TemplateFunction, IControlOptions} from 'UI/Base';
import {IMonthListSource, IMonthListSourceOptions} from './interfaces/IMonthListSource';
import {IMonthList, IMonthListOptions} from './interfaces/IMonthList';
import {IMonthListVirtualPageSize, IMonthListVirtualPageSizeOptions} from './interfaces/IMonthListVirtualPageSize';
import ExtDataModel, {TItems} from './MonthList/ExtDataModel';
import MonthsSource from './MonthList/MonthsSource';
import monthListUtils from './MonthList/Utils';
import ITEM_TYPES from './MonthList/ItemTypes';
import {IDisplayedRanges, IDisplayedRangesOptions} from 'Controls/interface';
import {IDateConstructor, IDateConstructorOptions} from 'Controls/interface';
import {IntersectionObserverSyntheticEntry} from 'Controls/scroll';
import dateUtils = require('Controls/Utils/Date');
import getDimensions = require("Controls/Utils/getDimensions");
import scrollToElement = require('Controls/Utils/scrollToElement');
import template = require('wml!Controls/_calendar/MonthList/MonthList');
import monthTemplate = require('wml!Controls/_calendar/MonthList/MonthTemplate');
import yearTemplate = require('wml!Controls/_calendar/MonthList/YearTemplate');
import {Logger} from 'UI/Utils';

interface IModuleComponentOptions extends
    IControlOptions,
    IMonthListSourceOptions,
    IMonthListOptions,
    IMonthListVirtualPageSizeOptions,
    IDisplayedRangesOptions,
    IDateConstructorOptions {
}

const enum ITEM_BODY_SELECTOR {
    year = '.controls-MonthList__year-months',
    month = '.controls-MonthList__month-body',
    day = '.controls-MonthViewVDOM__item'
}

const enum VIEW_MODE {
    month = 'month',
    year = 'year'
}

/**
 * Прокручивающийся список с месяцами. Позволяет выбирать период.
 *
 * @class Controls/_calendar/MonthList
 * @extends Core/Control
 * @mixes Controls/_calendar/interfaces/IMonthListSource
 * @control
 * @public
 * @author Красильников А.С.
 * @demo Controls-demo/Date/MonthList
 */
class  ModuleComponent extends Control<IModuleComponentOptions> implements
        IMonthListSource, IMonthList, IMonthListVirtualPageSize, IDateConstructor, IDisplayedRanges {
    readonly '[Controls/_calendar/interface/IMonthListSource]': boolean = true;
    readonly '[Controls/_calendar/interface/IMonthList]': boolean = true;
    readonly '[Controls/_calendar/interface/IMonthListVirtualPageSize]': boolean = true;
    readonly '[Controls/_interface/IDateConstructor]': boolean = true;
    readonly '[Controls/_interface/IDisplayedRanges]': boolean = true;

    protected _template: TemplateFunction = template;

    private _viewSource: BaseSource;
    private _startPositionId: string;
    private _positionToScroll: Date;
    private _displayedPosition: Date;
    private _lastPositionFromOptions: Date;

    private _itemTemplate: TemplateFunction;
    private _itemHeaderTemplate: TemplateFunction;

    private _lastNotifiedPositionChangedDate: Date;

    private _displayedDates: number[] = [];
    private _extData: ExtDataModel;
    private _extDataLastVersion: number;

    private _scrollTop: number = 0;

    private _enrichItemsDebounced: Function;

    private _virtualPageSize: number;

    protected _beforeMount(options: IModuleComponentOptions, context?: object, receivedState?: TItems):
                           Promise<TItems> | void {

        const now = new WSDate();
        let position = options.startPosition || options.position;

        if (!position) {
            position = options.viewMode === VIEW_MODE.year ?
                dateUtils.getStartOfYear(now) : dateUtils.getStartOfMonth(now);
        }

        if (options.startPosition) {
            Logger.warn('MonthList: Используется устаревшая опция startPosition, используйте опцию position', this);
        }

        this._enrichItemsDebounced = debounce(this._enrichItems, 150);

        this._updateItemTemplate(options);
        this._updateSource(options);
        this._updateVirtualPageSize(options);
        this._startPositionId = monthListUtils.dateToId(this._normalizeStartPosition(position));
        this._positionToScroll = position;
        this._displayedPosition = position;
        this._lastNotifiedPositionChangedDate = position;

        if (this._extData) {
            if (receivedState) {
                this._extData.updateData(receivedState);
            } else {
                this._displayedDates = this._getDisplayedRanges(position, options.virtualPageSize);
                return this._extData.enrichItems(this._displayedDates);
            }
        }
    }

    protected _afterMount(): void {
        this._updateScrollAfterViewModification();
    }

    protected _beforeUpdate(options: IModuleComponentOptions): void {
        this._updateItemTemplate(options);
        this._updateSource(options, this._options);
        this._updateVirtualPageSize(options, this._options);
        if (options.position !== this._displayedPosition) {
            // Не инициализируем перестроение списка пока не завершится пребыбущая перерисовка.
            // https://online.sbis.ru/opendoc.html?guid=4c2ee6ae-c41d-4bc2-97e7-052963074621
            if (!this._lastPositionFromOptions) {
                this._displayedPosition = options.position;
                // Обновляем _lastPositionFromOptions перед вызовом _scrollToPosition потому что
                // если элемент уже отрисован, то подскол может произойти синхронно.
                // В этом случае _lastPositionFromOptions обнулиться сразу же.
                this._lastPositionFromOptions = options.position;
                this._scrollToPosition(options.position);
            } else {
                this._lastPositionFromOptions = options.position;
            }

        }

    }

    protected _afterUpdate(oldOptions?: IModuleComponentOptions, oldContext?: any): void {
        const newVersion = this._extData.getVersion();
        if (this._extDataLastVersion !== newVersion) {
            this._extDataLastVersion = newVersion;
            this._notify('enrichItems');
        }
    }

    protected _afterRender(): void {
        this._updateScrollAfterViewModification();
    }

    protected _getMonth(year: number, month: number): Date {
        return new WSDate(year, month, 1);
    }

    protected _drawItemsHandler(): void {
        // Подскроливаем к нужной позиции только если не меняли позицию через опции пока список перерисовывался.
        // Иначе перерисовываем список по самой последней позиции установленной через опции.
        // https://online.sbis.ru/opendoc.html?guid=4c2ee6ae-c41d-4bc2-97e7-052963074621
        if (+this._displayedPosition === +this._lastPositionFromOptions) {
            this._updateScrollAfterViewModification();
            this._lastPositionFromOptions = null;
        } else if (this._lastPositionFromOptions) {
            this._displayedPosition = this._lastPositionFromOptions;
            this._scrollToPosition(this._displayedPosition);
        }
    }

    private  _getDisplayedRanges(position: Date, virtualPageSize: number): number[] {
        const displayedRanges = [];
        for (let i = 0; i < virtualPageSize; i++) {
            displayedRanges.push(Date.parse(new Date(position.getFullYear(), position.getMonth() + i)));
        }
        return displayedRanges;
    }

    private _updateItemTemplate(options: IModuleComponentOptions): void {
        this._itemHeaderTemplate = options.viewMode === VIEW_MODE.year ?
            options.yearHeaderTemplate : options.monthHeaderTemplate;

        this._itemTemplate = options.viewMode === VIEW_MODE.year ?
            options.yearTemplate : options.monthTemplate;
    }
    private _getTemplate(data): TemplateFunction {
        switch (data.get('type')) {
            case ITEM_TYPES.header:
                return this._itemHeaderTemplate;
            case ITEM_TYPES.stub:
                return this._options.stubTemplate;
            default:
                return this._itemTemplate;
        }
    }

    private _updateSource(options: IModuleComponentOptions, oldOptions?: IModuleComponentOptions): void {
        if (!oldOptions || options.viewMode !== oldOptions.viewMode) {
            this._viewSource = new MonthsSource({
                header: Boolean(this._itemHeaderTemplate),
                dateConstructor: options.dateConstructor,
                displayedRanges: options.displayedRanges,
                viewMode: options.viewMode,
                order: options.order,
                stubTemplate: options.stubTemplate
            });
        }
        if (!oldOptions || options.viewMode !== oldOptions.viewMode || options.source !== oldOptions.source) {
            this._extData = new ExtDataModel({
                viewMode: options.viewMode,
                source: options.source,
                dateConstructor: options.dateConstructor
            });
            this._extDataLastVersion = this._extData.getVersion();
        }
    }
    private _updateVirtualPageSize(options: IModuleComponentOptions, oldOptions?: IModuleComponentOptions): void {
        if (!oldOptions || options.virtualPageSize !== oldOptions.virtualPageSize) {
            // If we draw the headers as a separate element, then the virtual page should be 2 times larger,
            // because instead of one element, we draw two. Header and body.
            this._virtualPageSize = this._itemHeaderTemplate ? options.virtualPageSize * 2 : options.virtualPageSize;
        }
    }

    private _scrollToPosition(position: Date): void {
        if (!position) {
            return;
        }

        this._positionToScroll = position;
        this._lastNotifiedPositionChangedDate = dateUtils.getStartOfMonth(position);

        if (this._container && this._canScroll(position)) {
            // Update scroll position without waiting view modification
            this._updateScrollAfterViewModification();
        } else {
            this._displayedDates = [];
            const oldPositionId = this._startPositionId;
            this._startPositionId = monthListUtils.dateToId(this._normalizeStartPosition(position));
            // After changing the navigation options, we must call the "reload" to redraw the control,
            // because the last time we could start rendering from the same position.
            // Position option is the initial position from which control is initially drawn.
            if (oldPositionId === this._startPositionId && this._children.months) {
                this._children.months.reload();
            }
        }
    }

    private _normalizeStartPosition(date: Date): Date {
        return this._options.viewMode === VIEW_MODE.year ?
            dateUtils.getStartOfYear(date) : dateUtils.getStartOfMonth(date);
    }

    private _intersectHandler(event: SyntheticEvent, entries: IntersectionObserverSyntheticEntry[]): void {
        // Don't update if the observer is triggered after hiding the component.
        if (!this.isVisible()) {
            return;
        }
        for (const entry of entries) {
            this._updateDisplayedItems(entry);
        }
        this._updateDisplayedPosition(entries);
    }

    private _updateDisplayedPosition(entries: IntersectionObserverSyntheticEntry[]): void {
        let date;

        // We go around all the elements where the intersection with the scrolled container has changed and
        // find the element that is at the top and it is not fully displayed.
        for (const entry of entries) {
            if (entry.data.type !== ITEM_TYPES.body) {
                continue;
            }
            const entryDate = entry.data.date;

            // We select only those containers that are not fully displayed
            // and intersect with the scrolled container in its upper part, or lie higher.
            if (entry.nativeEntry.boundingClientRect.top - entry.nativeEntry.rootBounds.top <= 0) {
                if (entry.nativeEntry.boundingClientRect.bottom - entry.nativeEntry.rootBounds.top > 0) {
                    // If the bottom of the container lies at or below the top of the scrolled container, then we found the right date
                    date = entryDate;
                    break;
                } else if (entry.nativeEntry.rootBounds.top - entry.nativeEntry.boundingClientRect.bottom < entry.nativeEntry.target.offsetHeight) {
                    // If the container is completely invisible and lies on top of the scrolled area,
                    // then the next container may intersect with the scrolled area.
                    // We save the date, and check the following. This condition branch is needed,
                    // because a situation is possible when the container partially intersected from above, climbed up,
                    // persecuted, and the lower container approached the upper edge and its intersection did not change.
                    const delta: number = this._options.order === 'asc' ? 1 : -1;
                    if (this._options.viewMode === VIEW_MODE.year) {
                        date = new this._options.dateConstructor(entryDate.getFullYear() + delta, entryDate.getMonth());
                    } else {
                        date = new this._options.dateConstructor(entryDate.getFullYear(), entryDate.getMonth() + delta);
                    }
                }
            }
        }

        if (date && !dateUtils.isMonthsEqual(date, this._lastNotifiedPositionChangedDate) && !this._lastPositionFromOptions) {
            this._lastNotifiedPositionChangedDate = date;
            this._displayedPosition = date;
            this._notify('positionChanged', [date]);
        }
    }

    private _updateDisplayedItems(entry: IntersectionObserverSyntheticEntry): void {
        if (!this._options.source) {
            return;
        }

        const
            time = entry.data.date.getTime(),
            index = this._displayedDates.indexOf(time),
            isDisplayed = index !== -1;

        if (entry.nativeEntry.isIntersecting && !isDisplayed && entry.data.type === ITEM_TYPES.body) {
            this._displayedDates.push(time);
            this._enrichItemsDebounced();
        } else if (!entry.nativeEntry.isIntersecting && isDisplayed && entry.data.type === ITEM_TYPES.body) {
            this._displayedDates.splice(index, 1);
        }
    }

    /**
     * Перезагружает данные для периода. Если переданный период не пересекается с отбражаемым периодом,
     * то данные не будут обновляться сразу же, а обновятся при подскроле к ним.
     * @function Controls/_calendar/MonthList#invalidatePeriod
     * @param {Date} start Начало периода
     * @param {Date} end Конец периода
     * @see Controls/_calendar/interface/IMonthListSource#source
     */
    private invalidatePeriod(start: Date, end: Date): void {
        if (this._extData) {
            this._extData.invalidatePeriod(start, end);
            this._extData.enrichItems(this._displayedDates);
        }
    }

    private _enrichItems(): void {
        if (this._extData) {
            this._extData.enrichItems(this._displayedDates);
        }
    }

    protected  _formatMonth(date: Date): string {
        return date ? formatDate(date, formatDate.FULL_MONTH) : '';
    }

    private _updateScrollAfterViewModification(): void {
        if (this._positionToScroll && this._canScroll(this._positionToScroll)) {
            if (this._scrollToDate(this._positionToScroll)) {
                this._positionToScroll = null;
                this._lastPositionFromOptions = null;
            }
        }
    }

    private _scrollToDate(date: Date): boolean {
        const containerToScroll: HTMLElement = this._findElementByDate(date);

        if (containerToScroll) {
            scrollToElement(containerToScroll, false, true);
            return true;
        }
        return false;
    }

    private _canScroll(date: Date): boolean {
        const itemContainer: HTMLElement = this._findElementByDate(date);

        let itemDimensions: ClientRect,
            containerDimensions: ClientRect,
            scrollTop: number;

        if (!itemContainer) {
            return false;
        }

        // If the data is drawn over the years, and the displayed period is not the first month of the year,
        // then scroll to it unconditionally. In this case, the last month can be scrolled to the bottom
        // of the scrolled area. But this configuration is used only in a large selection of the period,
        // and there it is valid.
        if ((this._options.viewMode === VIEW_MODE.year && date.getMonth() !== 0)) {
            return true;
        }

        const container = this._getNormalizedContainer();

        itemDimensions = getDimensions(itemContainer);
        containerDimensions = getDimensions(container);

        scrollTop = this._scrollTop + (itemDimensions.top - containerDimensions.top);
        return this._children.scroll.canScrollTo(scrollTop);

    }

    private _scrollHandler(event: SyntheticEvent, scrollTop: number) {
        this._scrollTop = scrollTop;
        this._enrichItemsDebounced();
    }

    private _findElementByDate(date: Date): HTMLElement {
        let element: HTMLElement;

        if (date.getDate() !== 1) {
            element = this._getElementByDate(ITEM_BODY_SELECTOR.day, monthListUtils.dateToId(date));
        }
        if (!element && date.getMonth() !== 0) {
            element = this._getElementByDate(
                ITEM_BODY_SELECTOR.month, monthListUtils.dateToId(dateUtils.getStartOfMonth(date)));
        }
        if (!element) {
            element = this._getElementByDate(
                ITEM_BODY_SELECTOR.year,
                monthListUtils.dateToId(dateUtils.getStartOfYear(date)));
        }
        return element;
    }

    private _getNormalizedContainer(): HTMLElement {
        //TODO remove after complete https://online.sbis.ru/opendoc.html?guid=7c921a5b-8882-4fd5-9b06-77950cbe2f79
        return this._container.get ? this._container.get(0) : this._container;
    }

    private isVisible(): boolean {
        return this._getNormalizedContainer().offsetParent !== null;
    }

    private _getElementByDate(selector: string, dateId: string): HTMLElement {
        return this._getNormalizedContainer().querySelector(selector + '[data-date="' + dateId + '"]');
    }

    protected _dateToDataString(date: Date): string {
        return monthListUtils.dateToId(date);
    }

    // Формируем дату для шаблона элемента через эту функцию несмотря на то,
    // что дата и так содержится в данных для элемента. Проблема в том, что если страница строится на сервере,
    // и клиент находится в часовом поясе меньшем чем сервер, то даты после десериализации теряют несколько часов.
    // В результате этого происходит переход на сутки назад.
    // Десериализуем даты сами из текстового идентификатора пока не будет сделана следующая задача.
    // https://online.sbis.ru/opendoc.html?guid=d3d0fc8a-06cf-49fb-ad80-ce0a9d9a8632
    protected _idToDate(dateId: string): Date {
        return monthListUtils.idToDate(dateId);
    }

    static _ITEM_BODY_SELECTOR = ITEM_BODY_SELECTOR;

    static getDefaultOptions(): object {
        return {
            viewMode: VIEW_MODE.year,
            yearTemplate,
            monthTemplate,
            // In most places where control is used, no more than 4 elements are displayed at the visible area.
            // Draw the elements above and below.
            virtualPageSize: 6,
            _limit: 8,
            order: 'asc',
            dateConstructor: WSDate,
            displayedRanges: null,
            topShadowVisibility: 'visible',
            bottomShadowVisibility: 'visible'
        };
    }
}

export default ModuleComponent;

/**
 * @event Происходит когда меняется год или месяц.
 * Т.е. когда год или месяц пересекают верхнюю границу.
 * @name Controls/_calendar/MonthList#positionChanged
 * @param {Vdom/Vdom:SyntheticEvent} eventObject Дескриптор события.
 * @param {date} Date отображаемый в самом верху год или месяц.
 * @example
 * Обновляем заголовок в зависимости от отображаемого года.
 * <pre>
 *    <Controls.calendar:MonthList startPosition="_date" on:positionChanged="_positionChangedHandler()"/>
 * </pre>
 * <pre>
 *    class  ModuleComponent extends Control {
 *       ...
 *       _positionChangedHandler(e, date) {
 *          this.setTitle(date);
 *       }
 *       ...
 *    }
 * </pre>
 */
