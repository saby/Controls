import {date as formatDate} from 'Types/formatter';
import {Date as WSDate} from 'Types/entity';
import {debounce} from 'Types/function';
import {Base as BaseSource} from 'Types/source';
import {SyntheticEvent} from 'Vdom/Vdom';
import {Control, TemplateFunction, IControlOptions} from 'UI/Base';
import {detection} from 'Env/Env';
import {IMonthListSource, IMonthListSourceOptions} from './interfaces/IMonthListSource';
import {IMonthList, IMonthListOptions} from './interfaces/IMonthList';
import {IMonthListVirtualPageSize, IMonthListVirtualPageSizeOptions} from './interfaces/IMonthListVirtualPageSize';
import ExtDataModel, {TItems} from './MonthList/ExtDataModel';
import MonthsSource from './MonthList/MonthsSource';
import monthListUtils from './MonthList/Utils';
import ITEM_TYPES from './MonthList/ItemTypes';
import {IDisplayedRanges, IDisplayedRangesOptions} from 'Controls/interface';
import {IDateConstructor, IDateConstructorOptions} from 'Controls/interface';
import {IDayTemplate, IDayTemplateOptions} from 'Controls/interface';
import {IntersectionObserverSyntheticEntry, scrollToElement} from 'Controls/scroll';
import {Base as dateUtils} from 'Controls/dateUtils';
import {getDimensions} from 'Controls/sizeUtils';
import template = require('wml!Controls/_calendar/MonthList/MonthList');
import monthTemplate = require('wml!Controls/_calendar/MonthList/MonthTemplate');
import yearTemplate = require('wml!Controls/_calendar/MonthList/YearTemplate');
import {error as dataSourceError, parking} from 'Controls/dataSource';
import {Logger} from 'UI/Utils';

interface IModuleComponentOptions extends
    IControlOptions,
    IMonthListSourceOptions,
    IMonthListOptions,
    IMonthListVirtualPageSizeOptions,
    IDisplayedRangesOptions,
    IDayTemplateOptions,
    IDateConstructorOptions {
}

const ITEM_BODY_SELECTOR  = {
    day: '.controls-MonthViewVDOM__item',
    month: '.controls-MonthViewVDOM',
    year: '.controls-MonthList__year-months',
    mainTemplate: '.controls-MonthList__template'
};

const enum VIEW_MODE {
    month = 'month',
    year = 'year'
}

/**
 * Прокручивающийся список с месяцами. Позволяет выбирать период.
 *
 * @remark
 * Полезные ссылки:
 * * <a href="https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/aliases/_calendar.less">переменные тем оформления</a>
 *
 * @class Controls/_calendar/MonthList
 * @extends Core/Control
 * @mixes Controls/_calendar/interfaces/IMonthListSource
 * @mixes Controls/_interface/IDayTemplate
 * @mixes Controls/_calendar/interfaces/IMonth
 * @control
 * @public
 * @author Красильников А.С.
 * @demo Controls-demo/Date/MonthList
 */
class  ModuleComponent extends Control<IModuleComponentOptions> implements
        IMonthListSource, IMonthList, IMonthListVirtualPageSize, IDateConstructor, IDisplayedRanges, IDayTemplate {
    readonly '[Controls/_calendar/interface/IMonthListSource]': boolean = true;
    readonly '[Controls/_calendar/interface/IMonthList]': boolean = true;
    readonly '[Controls/_calendar/interface/IMonthListVirtualPageSize]': boolean = true;
    readonly '[Controls/_interface/IDateConstructor]': boolean = true;
    readonly '[Controls/_interface/IDisplayedRanges]': boolean = true;
    readonly '[Controls/_interface/IDayTemplate]': boolean = true;

    protected _template: TemplateFunction = template;

    protected _viewSource: BaseSource;
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

    protected _virtualPageSize: number;
    protected _errorViewConfig: parking.ViewConfig;
    private _errorController: dataSourceError.Controller = new dataSourceError.Controller({});

    protected _beforeMount(options: IModuleComponentOptions, context?: object, receivedState?: TItems):
                           Promise<TItems> | void {

        const now = new WSDate();
        let position = options.position;

        if (!position) {
            position = options.viewMode === VIEW_MODE.year ?
                dateUtils.getStartOfYear(now) : dateUtils.getStartOfMonth(now);
        }

        const normalizedPosition = this._normalizeDate(position, options.viewMode);

        this._enrichItemsDebounced = debounce(this._enrichItems, 150);

        this._updateItemTemplate(options);
        this._updateSource(options);
        this._updateVirtualPageSize(options);
        this._startPositionId = monthListUtils.dateToId(normalizedPosition);
        this._positionToScroll = position;
        this._displayedPosition = position;
        this._lastNotifiedPositionChangedDate = normalizedPosition;

        if (this._extData) {
            if (receivedState) {
                this._extData.updateData(receivedState);
            } else {
                const displayedDates = this._getDisplayedRanges(normalizedPosition, options.virtualPageSize, options.viewMode);
                return this._extData.enrichItems(displayedDates).catch((error: Error) => this._errorHandler(error));
            }
        }
    }

    protected _afterMount(): void {
        this._updateScrollAfterViewModification(true);
    }

    protected _beforeUpdate(options: IModuleComponentOptions): void {
        this._updateItemTemplate(options);
        const sourceUpdated = this._updateSource(options, this._options);
        if (sourceUpdated) {
            this._enrichItems();
        }
        this._updateVirtualPageSize(options, this._options);
        // Сравниваем по ссылке, а не по значению. position обновляется только при смене года или если
        // напрямую менять position через опцию. Таким обзразом, если мы попробуем подскролить календарь к дате, которую
        // устанавливали через опцию ранее, значения окажутся одинаковыми и подскролла не произайдет.
        // В то же время ссылки окажутся разыми
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

    // Хуки на момент вызова группируются, нужно использовать _beforePaint вместо _afterRender (так же как в списке).
    protected _beforePaint(): void {
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

    private  _getDisplayedRanges(position: Date, virtualPageSize: number, viewMode): number[] {
        const displayedRanges = [];
        if ( viewMode === 'year') {
            virtualPageSize *= 12;
        }
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
    protected _getTemplate(data): TemplateFunction {
        switch (data.get('type')) {
            case ITEM_TYPES.header:
                return this._itemHeaderTemplate;
            case ITEM_TYPES.stub:
                return this._options.stubTemplate;
            default:
                return this._itemTemplate;
        }
    }

    private _updateSource(options: IModuleComponentOptions, oldOptions?: IModuleComponentOptions): boolean {
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
            return true;
        }
        return false;
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

        const normalizedPosition: Date = this._normalizeDate(position)

        this._positionToScroll = position;
        this._lastNotifiedPositionChangedDate = normalizedPosition;

        if (this._container && this._canScroll(position)) {
            // Update scroll position without waiting view modification
            this._updateScrollAfterViewModification();
        } else {
            this._displayedDates = [];
            const oldPositionId = this._startPositionId;
            this._startPositionId = monthListUtils.dateToId(normalizedPosition);
            // After changing the navigation options, we must call the "reload" to redraw the control,
            // because the last time we could start rendering from the same position.
            // Position option is the initial position from which control is initially drawn.
            if (oldPositionId === this._startPositionId && this._children.months) {
                this._children.months.reload();
            }
        }
    }

    private _normalizeDate(date: Date, viewMode?: VIEW_MODE): Date {
        return (viewMode || this._options.viewMode) === VIEW_MODE.year ?
            dateUtils.getStartOfYear(date) : dateUtils.getStartOfMonth(date);
    }

    protected _intersectHandler(event: SyntheticEvent, entries: IntersectionObserverSyntheticEntry[]): void {
        // Don't update if the observer is triggered after hiding the component.
        if (!this._monthListVisible()) {
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
            if (entry.data) {
                if (entry.data.type !== ITEM_TYPES.body) {
                    continue;
                }
                const entryDate: Date = entry.data.date;
                const rootBounds: DOMRect = entry.nativeEntry.rootBounds;
                // На Ipad приходит уже не актуальное положение элементов.
                // При дальнейшем скролировании обсервер уже не вызывается.
                const boundingClientRect: DOMRect = detection.isMobileIOS ?
                    entry.nativeEntry.target.getBoundingClientRect() : entry.nativeEntry.boundingClientRect;

                // We select only those containers that are not fully displayed
                // and intersect with the scrolled container in its upper part, or lie higher.
                if (boundingClientRect.top - rootBounds.top <= 0) {
                    if (boundingClientRect.bottom - rootBounds.top > 0) {
                        // If the bottom of the container lies at or below the top of the scrolled container, then we found the right date
                        date = entryDate;
                        break;
                    } else if (rootBounds.top - boundingClientRect.bottom < entry.nativeEntry.target.offsetHeight) {
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
        }

        if (date && !dateUtils.isMonthsEqual(date, this._lastNotifiedPositionChangedDate) && !this._lastPositionFromOptions) {
            this._lastNotifiedPositionChangedDate = date;
            this._displayedPosition = date;
            this._notify('positionChanged', [date]);
        }
    }

    private _updateDisplayedItems(entry: IntersectionObserverSyntheticEntry): void {

        //TODO: убрать `!entry.data` после https://online.sbis.ru/opendoc.html?guid=fee96058-62bc-4af3-8a74-b9d3b680f8ef
        if (!this._options.source || !entry.data) {
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
    protected invalidatePeriod(start: Date, end: Date): void {
        if (this._extData) {
            this._extData.invalidatePeriod(start, end);
            this._extData.enrichItems(this._displayedDates).catch((error: Error) => this._errorHandler(error));
        }
    }

    private _enrichItems(): void {
        if (this._extData) {
            this._extData.enrichItems(this._displayedDates).catch((error: Error) => this._errorHandler(error));
        }
    }

    protected  _formatMonth(date: Date): string {
        return date ? formatDate(date, formatDate.FULL_MONTH) : '';
    }

    private _updateScrollAfterViewModification(notResetPositionToScroll: boolean): void {
        if (this._positionToScroll && this._canScroll(this._positionToScroll)) {
            if (this._scrollToDate(this._positionToScroll)) {
                // Список после mount заказывает перерисовку, после которой он добавляет отступ 1px и устанавливает
                // scrollTop = 1px. Поэтому после MonthList::mount не нужно сбрасывать positionToScroll, ведь в
                // beforePaint нужен повторный подскролл к отображаемой дате.
                if (notResetPositionToScroll) {
                    this._forceUpdate();
                } else {
                    if (+this._lastPositionFromOptions === +this._positionToScroll) {
                        this._lastPositionFromOptions = null;
                    }
                    this._positionToScroll = null;
                }
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

    protected _scrollHandler(event: SyntheticEvent, scrollTop: number) {
        this._scrollTop = scrollTop;
        this._enrichItemsDebounced();
    }

    private _findElementByDate(date: Date): HTMLElement {
        let element: HTMLElement | null;
        const templates = {
            day: {
                condition: date.getDate() !== 1,
                dateId: date
            },
            month: {
                condition: date.getMonth() !== 0,
                dateId: dateUtils.getStartOfMonth(date)
            },
            // В шаблоне может использоваться headerTemplate, нужно подскроллить к месяцу/году под ним
            year: {
                condition: true,
                dateId: dateUtils.getStartOfYear(date)
            },
            // В случае, если используется кастомный шаблон, пытаемся подскроллить к нему
            mainTemplate: {
                condition: true,
                dateId: dateUtils.getStartOfYear(date)
            }
        };

        for (const item in templates) {
            const element =  this._getElementByDate(
                ITEM_BODY_SELECTOR[item],
                monthListUtils.dateToId(templates[item].dateId)
            );
            if (element && templates[item].condition) {
                return element;
            }
        }
    }

    private _getNormalizedContainer(): HTMLElement {
        //TODO remove after complete https://online.sbis.ru/opendoc.html?guid=7c921a5b-8882-4fd5-9b06-77950cbe2f79
        return this._container.get ? this._container.get(0) : this._container;
    }

    private _monthListVisible(): boolean {
        return this._getNormalizedContainer().offsetParent !== null;
    }

    private _getElementByDate(selector: string, dateId: string): HTMLElement {
        return this._getNormalizedContainer().querySelector(selector + '[data-date="' + dateId + '"]');
    }

    protected _dateToDataString(date: Date): string {
        return monthListUtils.dateToId(date);
    }

    private _errorHandler(error: Error): Promise<unknown> {
        return this._errorController.process({
            error,
            mode: dataSourceError.Mode.dialog
        }).then((errorViewConfig) => {
            this._errorViewConfig = errorViewConfig;
            return error;
        });
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
 *    <Controls.calendar:MonthList position="_date" on:positionChanged="_positionChangedHandler()"/>
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
