import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import {constants, detection} from 'Env/Env';
import * as ScrollBarTemplate from 'wml!Controls/_scroll/Scroll/Scrollbar/Scrollbar';
import 'Controls/event';
import { SyntheticEvent } from 'UICommon/Events';
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
    thumbStyle?: string;
    thumbThickness?: string;
}
/**
 * Thin scrollbar.
 *
 * @class Controls/_scroll/resources/Scrollbar
 * @extends UI/Base:Control
 *
 * @public
 * 
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
    private _thumbThickness: string;
    private _thumbStyle: string;
    private _scrollBarSize: number;
    // Запоминаемые на момент перетаскиваеия ползунка координаты самого скроллбара
    private _currentCoords: IScrollBarCoords | null = null;
    // Координата точки на ползунке, за которую начинаем тащить
    private _dragPointOffset: number | null = null;
    protected _trackVisible: boolean = false;
    private _scrollPosition: number = 0;
    private _viewportSize: number | null = null;

    protected _beforeMount(options: IScrollBarOptions): void {
        //TODO Compatibility на старых страницах нет Register, который скажет controlResize
        this._resizeHandler = this._resizeHandler.bind(this);
        this._thumbStyle = this._getThumbStyle(options);
        this._thumbThickness = this._getThumbThickness(options);

        // Зачем этот код прописал в скроллконтейнере в самом геттере
        if (options.getParentScrollPosition) {
            this._scrollPosition = options.getParentScrollPosition();
        }
    }

    protected _afterMount(): void {
        if (this._options.direction === 'horizontal') {
            this._trackVisible = !!this._options.trackVisible;
        }
        this._resizeHandler();
        this._forceUpdate();
        const position = this._scrollPosition || this._options.position || 0;
        this._thumbPosition = this._getThumbCoordByScroll(this._scrollBarSize,
            this._thumbSize, position, this._options.contentSize);

        if (!newEnv() && constants.isBrowserPlatform) {
            window.addEventListener('resize', this._resizeHandler);
        }
    }

    protected _beforeUpdate(options: IScrollBarOptions): void {
        this._thumbStyle = this._getThumbStyle(options);
        this._thumbThickness = this._getThumbThickness(options);

        // TODO: Позиция сейчас принимается и через опции и через сеттер. чтобы не было лишних обновлений нужно оставить только сеттер
        const position = this._scrollPosition || options.position || 0;
        let shouldUpdatePosition = !this._dragging && this._position !== position;
        if (options.contentSize !== this._options.contentSize) {
            this._setSizes(options.contentSize);
            shouldUpdatePosition = true;
        }
        if (shouldUpdatePosition) {
            this._setPosition(position);
            this._thumbPosition = this._getThumbCoordByScroll(this._scrollBarSize,
                                                                this._thumbSize, position, options.contentSize);
        }
    }

    protected _afterUpdate(oldOptions?: IScrollBarOptions, oldContext?: any) {
        // Если после перерисовки поменялись размеры скролбара, то обновим его. Сценарий очень редкий,
        // например после фиксации заголовков надо сдвинуть вершнюю грань скролбара вниз.
        // Для оптимизации, если родитель заранее знает размер скролбара, можно задать его через метод setViewportSize,
        // тогда скроллбар заранее правильно рассчитает размеры и положение ползунка и перерисовки не будет.
        this._setSizes(this._options.contentSize);
        this._updatePosition();
    }

    protected _beforeUnmount(): void {
        //TODO Compatibility на старых страницах нет Register, который скажет controlResize
        if (!newEnv() && constants.isBrowserPlatform) {
            window.removeEventListener('resize', this._resizeHandler);
        }
    }

    private _getThumbStyle(options: IScrollBarOptions): string {
        if (options.thumbStyle) {
            return options.thumbStyle;
        }
        return (options.direction === 'vertical' ? 'accented' : 'unaccented');
    }

    private _getThumbThickness(options: IScrollBarOptions): string {
        if (options.thumbThickness) {
            return options.thumbThickness;
        }
        return (options.direction === 'vertical' ? 'l' : 's');
    }

    private _getThumbCoordByScroll(scrollbarSize: number, thumbSize: number, scrollPosition: number,
                                   contentSize: number): number {
        let thumbCoord: number;
        let availableScale: number;
        let availableScroll: number;

        // ползунок перемещается на расстояние равное высоте скроллбара - высота ползунка
        availableScale = scrollbarSize - thumbSize;

        // скроллить можно на высоту контента, за вычетом высоты контейнера = высоте скроллбара
        availableScroll = contentSize - scrollbarSize;

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

    setScrollPosition(position: number): void {
        if (this._scrollPosition !== position) {
            this._scrollPosition = position;
            this._updatePosition();
        }
    }

    setViewportSize(size: number): void {
        // В некоторых сценариях заранее известно, какой размер будет у скролбара после обновления.
        // Его можно задать через сеттер, тогда скролбар правильно расчитаетя на _beforeUpdate, а не на afterUpdate.
        // Можно переделать через опции, но api бедут не самое производительное.
        // Например, если задана опция, то используется значение из опции. Тогда родительский контрол
        // должен всегда отслеживать изменения размеров и сообщать новые размеры через опции. Это приведет к тому,
        // что при каждом изменении размеров родительскому контролу придется перерисовываться.
        this._viewportSize = size;
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

        let scrollbarAvailableSize: number;
        if (this._viewportSize !== null) {
            this._scrollBarSize = this._viewportSize;
            scrollbarAvailableSize = this._viewportSize;
        } else {
            this._scrollBarSize = scrollbar[verticalDirection ? 'offsetHeight' : 'offsetWidth'];
            scrollbarAvailableSize = scrollbar[verticalDirection ? 'clientHeight' : 'clientWidth'];
        }

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
            this._thumbSize, newPosition, this._options.contentSize);
        event.preventDefault();
    }

    /**
     * Обработчик изменения размеров скролла.
     */
    private _resizeHandler(): void {
        this._setSizes(this._options.contentSize);
        this._updatePosition();
    }

    private _updatePosition(): void {
        const position = this._scrollPosition || this._options.position || 0;
        this._setPosition(position);

        const thumbPosition: number = this._getThumbCoordByScroll(this._scrollBarSize,
            this._thumbSize, position, this._options.contentSize);

        if (thumbPosition !== this._thumbPosition) {
            this._thumbPosition = thumbPosition;
        }
    }

    private static _isScrollBarVisible(scrollbar: HTMLElement): boolean {
        return !!scrollbar && !scrollbar.closest('.ws-hidden');
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

Object.defineProperty(Scrollbar, 'defaultProps', {
   enumerable: true,
   configurable: true,

   get(): object {
      return Scrollbar.getDefaultOptions();
   }
});

Scrollbar._theme = ['Controls/scroll'];
/**
 * @event Начала перемещения ползунка мышью.
 * @name scrollbarBeginDrag
 * @param {SyntheticEvent} eventObject Дескриптор события.
 */

/**
 * @event Конец перемещения ползунка мышью.
 * @name scrollbarEndDrag
 * @param {SyntheticEvent} eventObject Дескриптор события.
 */

/**
 * @name Controls/_scroll/resources/Scrollbar#position
 * @cfg {Number} Позиция ползунка спроецированная на контент.
 */

/**
 * @name Controls/Container/resources/Scrollbar#contentSize
 * @cfg {Number} Размер контента на который проецируется тонкий скролл.
 * @remark Не может быть меньше размера контейнера или 0
 */

/**
 * @name Controls/Container/resources/Scrollbar#direction
 * @cfg {String} Direction of the scroll bar
 * @variant vertical Vertical scroll bar.
 * @variant horizontal Horizontal scroll bar.
 * @default vertical
 */

/**
 * @name Controls/_scroll/resources/Scrollbar#style
 * @cfg {String} Цветовая схема контейнера. Влияет на цвет тени и полоски скролла. Используется для того чтобы контейнер корректно отображался как на светлом так и на темном фоне.
 * @variant normal стандартная схема
 * @variant inverted противоположная схема
 */
export default Scrollbar;
