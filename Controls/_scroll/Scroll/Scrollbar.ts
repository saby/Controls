import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import {detection} from 'Env/Env';
import * as ScrollBarTemplate from 'wml!Controls/_scroll/Scroll/Scrollbar/Scrollbar';
import 'Controls/event';
import 'css!theme?Controls/scroll';
import {SyntheticEvent} from 'Vdom/Vdom';
import * as newEnv from 'Core/helpers/isNewEnvironment';

type TDirection = 'vertical' | 'horizontal';

interface IScrollBarCoords {
    size: number;
    offset: number;
}

export interface IScrollBarOptions extends IControlOptions {
    position?: number;
    contentSize: number;
    direction: TDirection;
    trackVisible: boolean;
}
/**
 * Thin scrollbar.
 *
 * @class Controls/_scroll/resources/Scrollbar
 * @extends Core/Control
 *
 * @event scrollbarBeginDrag Начала перемещения ползунка мышью.
 * @param {SyntheticEvent} eventObject Дескриптор события.
 *
 * @event scrollbarEndDrag Конец перемещения ползунка мышью.
 * @param {SyntheticEvent} eventObject Дескриптор события.
 *
 * @name Controls/_scroll/resources/Scrollbar#position
 * @cfg {Number} Позиция ползунка спроецированная на контент.
 *
 * @name Controls/Container/resources/Scrollbar#contentSize
 * @cfg {Number} Размер контента на который проецируется тонкий скролл.
 * @remark Не может быть меньше размера контейнера или 0
 *
 * @name Controls/Container/resources/Scrollbar#direction
 * @cfg {String} Direction of the scroll bar
 * @variant vertical Vertical scroll bar.
 * @variant horizontal Horizontal scroll bar.
 * @default vertical
 *
 * @name Controls/_scroll/resources/Scrollbar#style
 * @cfg {String} Цветовая схема контейнера. Влияет на цвет тени и полоски скролла. Используется для того чтобы контейнер корректно отображался как на светлом так и на темном фоне.
 * @variant normal стандартная схема
 * @variant inverted противоположная схема
 *
 * @public
 * @control
 * @author Красильников А.С.
 */

class Scrollbar extends Control<IScrollBarOptions> {
    protected _template: TemplateFunction = ScrollBarTemplate;
    /**
     * Перемещается ли ползунок.
     * @type {boolean}
     */
    private _dragging: boolean = false;

    /**
     * Позиция ползунка спроецированная на контент в границах трека.
     * @type {number}
     */
    private _position: number = 0;
    private _thumbPosition: number = 0;
    private _thumbSize: number;
    private _scrollBarSize: number;
    // Запоминаемые на момент перетаскиваеия ползунка координаты самого скроллбара
    private _currentCoords: IScrollBarCoords | null = null;
    // Координата точки на ползунке, за которую начинаем тащить
    private _dragPointOffset: number | null = null;
    protected _trackVisible: boolean = false;

    protected _afterMount(): void {
        if (this._options.direction === 'horizontal') {
            this._trackVisible = !!this._options.trackVisible;
        }
        this._resizeHandler();
        this._forceUpdate();
        this._thumbPosition = this._getThumbCoordByScroll(this._scrollBarSize,
            this._thumbSize, this._options.position);

        //TODO Compatibility на старых страницах нет Register, который скажет controlResize
        this._resizeHandler = this._resizeHandler.bind(this);
        if (!newEnv() && window) {
            window.addEventListener('resize', this._resizeHandler);
        }
    }

    protected _afterUpdate(oldOptions: IScrollBarOptions): void {

        let shouldUpdatePosition = !this._dragging && this._position !== this._options.position;
        if (oldOptions.contentSize !== this._options.contentSize) {
            this._setSizes(this._options.contentSize);
            shouldUpdatePosition = true;
        }
        if (shouldUpdatePosition) {
            this._setPosition(this._options.position);
            this._thumbPosition = this._getThumbCoordByScroll(this._scrollBarSize,
                                                                this._thumbSize, this._options.position);
        }
    }

    protected _beforeUnmount(): void {
        //TODO Compatibility на старых страницах нет Register, который скажет controlResize
        if (!newEnv() && window) {
            window.removeEventListener('resize', this._resizeHandler);
        }
    }

    private _getThumbCoordByScroll(scrollbarSize: number, thumbSize: number, scrollPosition: number): number {
        let thumbCoord: number;
        let availableScale: number;
        let availableScroll: number;

        // ползунок перемещается на расстояние равное высоте скроллбара - высота ползунка
        availableScale = scrollbarSize - thumbSize;

        // скроллить можно на высоту контента, за вычетом высоты контейнера = высоте скроллбара
        availableScroll = this._options.contentSize - scrollbarSize;

        // решаем пропорцию, известна координата ползунка, высота его перемещения и величину скроллящегося контента
        thumbCoord = (scrollPosition * availableScale) / availableScroll;

        return thumbCoord;
    }

    private _getCurrentCoords(direction: TDirection): IScrollBarCoords {
        let offsetValue: number;
        let sizeValue: number;

        const scrollBarClientRect = this._children.scrollbar.getBoundingClientRect();
        if (direction === 'vertical') {
            offsetValue = scrollBarClientRect.top;
            sizeValue = scrollBarClientRect.height;
        } else {
            offsetValue = scrollBarClientRect.left;
            sizeValue = scrollBarClientRect.width;
        }
        return {
            offset: offsetValue,
            size: sizeValue
        };
    }

    private _getScrollCoordByThumb(scrollbarSize: number, thumbSize: number, thumbPosition: number): number {
        let scrollCoord: number;
        let availableScale: number;
        let availableScroll: number;
        // ползунок перемещается на расстояние равное высоте скроллбара - высота ползунка
        availableScale = scrollbarSize - thumbSize;

        // скроллить можно на высоту контента, за вычетом высоты контейнера = высоте скроллбара
        availableScroll = this._options.contentSize - scrollbarSize;

        // решаем пропорцию, известна координата ползунка, высота его перемещения и величину скроллящегося контента
        scrollCoord = (thumbPosition * availableScroll) / availableScale;

        return scrollCoord;
    }

    /**
     * Изменить позицию ползунка.
     * @param {number} position новая позиция.
     * @param {boolean} notify стрелять ли событием при изменении позиции.
     * @return {boolean} изменилась ли позиция.
     */
    private _setPosition(position: number, notify: boolean = false): boolean {
        if (this._position === position) {
            return false;
        } else {
            this._position = position;

            if (notify) {
                this._notify('positionChanged', [position]);
            }
            return true;
        }
    }

    public recalcSizes(): void {
        this._resizeHandler();
    }

    /**
     * Изменить свойства контрола отвечающего за размеры.
     * @param contentSize размер контента.
     * @return {boolean} изменились ли размеры.
     */
    private _setSizes(contentSize: number): boolean {
        const verticalDirection = this._options.direction === 'vertical';
        const scrollbar = this._children.scrollbar;
        if (!Scrollbar._isScrollBarVisible(scrollbar as HTMLElement)) {
            return false;
        }
        this._scrollBarSize = scrollbar[verticalDirection ? 'offsetHeight' : 'offsetWidth'];
        const scrollbarAvailableSize = scrollbar[verticalDirection ? 'clientHeight' : 'clientWidth'];
        let thumbSize: number;

        let viewportRatio: number;
        viewportRatio = Scrollbar._calcViewportRatio(this._scrollBarSize,
            contentSize);

        thumbSize = Scrollbar._calcThumbSize(
            this._children.thumb,
            scrollbarAvailableSize,
            viewportRatio,
            this._options.direction
        );

        if (this._thumbSize === thumbSize) {
            return false;
        } else {
            this._thumbSize = thumbSize;
            return true;
        }
    }

    protected _scrollbarMouseDownHandler(event: SyntheticEvent<MouseEvent>): void {
        const currentCoords = this._getCurrentCoords(this._options.direction);
        const mouseCoord = Scrollbar._getMouseCoord(event.nativeEvent, this._options.direction);

        this._thumbPosition = Scrollbar._getThumbPosition(
            currentCoords.size,
            currentCoords.offset,
            mouseCoord,
            this._thumbSize, this._thumbSize / 2);

        const position = this._getScrollCoordByThumb(currentCoords.size, this._thumbSize, this._thumbPosition);
        this._setPosition(position, true);
    }

    protected _thumbMouseDownHandler(event: Event): void {
        // to disable selection while dragging
        event.preventDefault();

        event.stopPropagation();
        this._scrollbarBeginDragHandler(event);
    }

    protected _scrollbarTouchStartHandler(event: Event): void {
        if (this._options.direction === 'horizontal') {
            this._scrollbarBeginDragHandler(event);
        }
    }

    protected _thumbTouchStartHandler(event: Event): void {
        event.stopPropagation();
        this._scrollbarBeginDragHandler(event);
    }

    /**
     * Обработчик начала перемещения ползунка мышью.
     * @param {SyntheticEvent} event дескриптор события.
     */
    private _scrollbarBeginDragHandler(event): void {
        const verticalDirection = this._options.direction === 'vertical';
        const thumbOffset = this._children.thumb.getBoundingClientRect()[verticalDirection ? 'top' : 'left'];
        const mouseCoord = Scrollbar._getMouseCoord(event.nativeEvent, this._options.direction);

        this._currentCoords = this._getCurrentCoords(this._options.direction);
        this._dragPointOffset = mouseCoord - thumbOffset;
        this._children.dragNDrop.startDragNDrop(null, event);
    }

    protected _scrollbarStartDragHandler(): void {
        this._dragging = true;
        this._notify('draggingChanged', [this._dragging]);
    }

    /**
     * Обработчик перемещения ползунка мышью.
     * @param {Event} event дескриптор события Vdom
     * @param {Event} nativeEvent дескриптор события мыши.
     */
    protected _scrollbarOnDragHandler(event: SyntheticEvent<Event>, dragObject): void {
        const mouseCoord = Scrollbar._getMouseCoord(dragObject.domEvent, this._options.direction);

        this._thumbPosition = Scrollbar._getThumbPosition(
            this._currentCoords.size,
            this._currentCoords.offset,
            mouseCoord,
            this._thumbSize, this._dragPointOffset);

        const position = this._getScrollCoordByThumb(this._currentCoords.size, this._thumbSize, this._thumbPosition);
        this._setPosition(position, true);
    }

    /**
     * Обработчик конца перемещения ползунка мышью.
     */
    protected _scrollbarEndDragHandler(): void {
        if (this._dragging) {
            this._dragging = false;
            this._notify('draggingChanged', [this._dragging]);
        }
    }

    /**
     * Обработчик прокрутки колесиком мыши.
     * @param {SyntheticEvent} event дескриптор события.
     */
    protected _wheelHandler(event: SyntheticEvent<Event>): void {
        let newPosition = this._position + Scrollbar._calcWheelDelta(detection.firefox, event.nativeEvent.deltaY);
        const maxPosition = this._options.contentSize - this._scrollBarSize;
        if (newPosition < 0) {
            newPosition = 0;
        } else if (newPosition > maxPosition) {
            newPosition = maxPosition;
        }
        this._setPosition(newPosition, true);
        this._thumbPosition = this._getThumbCoordByScroll(this._scrollBarSize,
            this._thumbSize, newPosition);
        event.preventDefault();
    }

    /**
     * Обработчик изменения размеров скролла.
     */
    private _resizeHandler(): void {
        this._setSizes(this._options.contentSize);
        this._setPosition(this._options.position);
        this._thumbPosition = this._getThumbCoordByScroll(this._scrollBarSize,
                                                            this._thumbSize, this._options.position);
    }

    private static _isScrollBarVisible(scrollbar: HTMLElement): boolean {
        return !!scrollbar.getClientRects().length;
    }

    private static _getMouseCoord(nativeEvent: Event, direction: TDirection): number {
        let offset: number;
        const offsetAxis = direction === 'vertical' ? 'pageY' : 'pageX';

        if (nativeEvent instanceof MouseEvent) {
            offset = nativeEvent[offsetAxis];
        } else {
            offset = (nativeEvent as TouchEvent).touches[0][offsetAxis];
        }

        return offset;
    }

    private static _getThumbPosition(scrollbarSize: number,
                                     scrollbarOffset: number,
                                     mouseCoord: number,
                                     thumbSize: number,
                                     thumbSizeCompensation: number): number {

        let thumbPosition: number;

        // ползунок должен оказываться относительно текущей позииции смещенным
        // при клике на половину своей высоты
        // при перетаскивании на то, расстояние, которое было до курсора в момент начала перетаскивания
        thumbPosition = mouseCoord - scrollbarOffset - thumbSizeCompensation;

        thumbPosition = Math.max(0, thumbPosition);
        thumbPosition = Math.min(thumbPosition, scrollbarSize - thumbSize);

        return thumbPosition;
    }
    /**
     * Посчитать размер ползунка.
     * @param thumb ползунок.
     * @param {number} scrollbarAvailableSize размер контейнера по которому может перемещаться ползунок.
     * @param {number} viewportRatio отношение размера контейнера ползунка к контенту.
     * @param {string} direction направление скроллбара.
     * @return {number} размер ползунка.
     */
    private static _calcThumbSize(thumb: HTMLElement, scrollbarAvailableSize: number,
                                  viewportRatio: number, direction: TDirection): number {
        const thumbSize = scrollbarAvailableSize * viewportRatio;
        const minSize = parseFloat(getComputedStyle(thumb)[direction === 'vertical' ? 'min-height' : 'min-width']);

        return Math.max(minSize, thumbSize);
    }

    /**
     * Посчитать отношение размеров контейнера ползунка к контенту.
     * @param {number} scrollbarSize размер контейнера ползунка.
     * @param {number} contentSize размер контента.
     * @return {number} отношение размеров контейнера ползунка к контенту.
     */
    private static _calcViewportRatio(scrollbarSize: number, contentSize: number): number {
        return scrollbarSize / contentSize;
    }
    /**
     * Определяем смещение ползунка.
     * В firefox в дескрипторе события в свойстве deltaY лежит маленькое значение,
     * поэтому установим его сами.
     * TODO: Нормальное значение есть в дескрипторе события MozMousePixelScroll в
     * свойстве detail, но на него нельзя подписаться.
     * https://online.sbis.ru/opendoc.html?guid=3e532f22-65a9-421b-ab0c-001e69d382c8
     */
    private static _calcWheelDelta(firefox: boolean, delta: number): number {
        if (firefox) {
            return Math.sign(delta) * 100;
        }
        return delta;
    }
}

Scrollbar.getDefaultOptions = function () {
    return {
        position: 0,
        direction: 'vertical'
    };
};

export default Scrollbar;
