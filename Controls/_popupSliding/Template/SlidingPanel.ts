import {Control, TemplateFunction} from 'UI/Base';
import * as template from 'wml!Controls/_popupSliding/Template/SlidingPanel/SlidingPanel';
import {SyntheticEvent} from 'Vdom/Vdom';
import {IDragObject, Container} from 'Controls/dragnDrop';
import {ISlidingPanelTemplateOptions} from 'Controls/_popupSliding/interface/ISlidingPanelTemplate';
import {RegisterUtil, UnregisterUtil} from 'Controls/event';
import {detection} from 'Env/Env';

/**
 * Интерфейс для шаблона попапа-шторки.
 *
 * @interface Controls/_popupSliding/Template/SlidingPanel
 * @private
 * @author Красильников А.С.
 */
export default class SlidingPanel extends Control<ISlidingPanelTemplateOptions> {
    protected _template: TemplateFunction = template;
    protected _dragStartHeightDimensions: {
        scrollHeight: number;
        contentHeight: number;
    };
    protected _touchDragOffset: IDragObject['offset'];
    protected _scrollAvailable: boolean = false;
    protected _position: string = 'bottom';
    protected _children: {
        dragNDrop: Container;
        customContent: Element;
        customContentWrapper: Element;
        controlLine: Element;
    };
    private _isPanelMounted: boolean = false;
    private _currentTouchYPosition: number = null;
    private _startTouchYPosition: number = null;
    private _scrollState: object = null;
    private _swipeInProcess: boolean = false;

    protected _beforeMount(options: ISlidingPanelTemplateOptions): void {
        this._position = options.slidingPanelOptions?.position;
        this._scrollAvailable = this._isScrollAvailable(options);
    }

    protected _beforeUpdate(options: ISlidingPanelTemplateOptions): void {
        if (options.slidingPanelOptions !== this._options.slidingPanelOptions) {
            this._position = options.slidingPanelOptions?.position;
            this._scrollAvailable = this._isScrollAvailable(options);
        }
    }

    protected _afterMount(options: ISlidingPanelTemplateOptions): void {
        /*
            Если высотка контента максимальная, то нужно отпустить скролл,
            т.к. внутри могут быть поля со своим скроллом, а мы превентим touchmove и не даем им скроллиться.
         */
        const scrollAvailable = this._isScrollAvailable(options);
        if (scrollAvailable !== this._scrollAvailable) {
            this._scrollAvailable = scrollAvailable;
        }
        this._isPanelMounted = true;
        if (detection.isMobileIOS) {
            this._toggleScrollObserveForKeyboardClose(true);
        }
    }

    protected _beforeUnmount(): void {
        if (detection.isMobileIOS) {
            this._toggleScrollObserveForKeyboardClose(false);
        }
    }

    protected _isScrollAvailable({
        slidingPanelOptions
    }: ISlidingPanelTemplateOptions): boolean {
        const contentHeight = this._getHeight();
        const hasMoreContent = this._scrollState ?
            this._scrollState.clientHeight < this._scrollState.scrollHeight : false;

        return slidingPanelOptions.height === slidingPanelOptions.maxHeight ||
            slidingPanelOptions.height === contentHeight && !hasMoreContent;
    }

    private _getHeight(): number {
        return this._isPanelMounted ? this._container.clientHeight : 0;
    }

    protected _dragEndHandler(): void {
        this._notifyDragEnd();
    }

    protected _dragMoveHandler(event: SyntheticEvent<Event>, dragObject: IDragObject): void {
        this._notifyDragStart(dragObject.offset);
    }

    protected _startDragNDrop(event: SyntheticEvent<MouseEvent>): void {
        this._children.dragNDrop.startDragNDrop(null, event);
    }

    protected _scrollStateChanged(event: SyntheticEvent<MouseEvent>, scrollState: object): void {
        this._scrollState = scrollState;
    }

    protected _getCustomContentHeight(): number {
        return this._children.customContent.clientHeight;
    }

    /**
     * Запоминаем начальную позицию тача, чтобы считать offset от нее
     * @param {<TouchEvent>} event
     * @private
     */
    protected _touchStartHandler(event: SyntheticEvent<TouchEvent>): void {
        this._startTouchYPosition = this._currentTouchYPosition = event.nativeEvent.targetTouches[0].clientY;
        this._swipeInProcess = true;
    }

    /**
     * Раворот шторки через свайп, делается аналогично, через события dragStart/dragEnd
     * @param {<TouchEvent>} event
     * @private
     */
    protected _touchMoveHandler(event: SyntheticEvent<TouchEvent>): void {
        if (this._scrollAvailable && this._isSwipeForScroll(event)) {
            // Расчет оффсета тача должен начинаться только с того момента как закончится скролл, а не со старта тача
            this._currentTouchYPosition = null;
            return;
        }

        // Чтобы во время свайпов на IOS Safari не драгался body
        if (event.nativeEvent.cancelable) {
            event.preventDefault();
        }

        // Если тач начался со скролла, то оффсет нужно начинать с того момента, как закончился скролл
        if (!this._currentTouchYPosition) {
            this._currentTouchYPosition = event.nativeEvent.changedTouches[0].clientY;
        }

        const currentTouchY = event.nativeEvent.changedTouches[0].clientY;
        const offsetY = currentTouchY - this._currentTouchYPosition;

        this._currentTouchYPosition = currentTouchY;

        // Аналогичный drag'n'drop функционал. Собираем общий offset относительно начальной точки тача.
        if (this._touchDragOffset) {
            this._touchDragOffset.y += offsetY;
        } else {
            this._touchDragOffset = {
                x: 0,
                y: offsetY
            };
        }
        event.stopPropagation();
        this._notifyDragStart(this._touchDragOffset);
    }

    protected _touchEndHandler(): void {
        if (this._touchDragOffset) {
            this._notifyDragEnd();
            this._touchDragOffset = null;
        }
        this._startTouchYPosition = null;
        this._swipeInProcess = false;
    }

    /**
     * Возвращает признак того, что свайп приведет к скроллу
     * Скроллим когда:
     * 1. Скролл доступен (см. isScrollAvailable)
     * 2. Свайп внутри сролла
     * 3. Либо уже проскроллено, либо свайп в ту сторону, в которую двигается скролл
     * @param event
     * @private
     */
    private _isSwipeForScroll(event: SyntheticEvent<TouchEvent>): boolean {
        return this._scrollAvailable && this._isSwipeInsideScroll(event) && (
            this._getScrollTop() !== 0 ||
            this._startTouchYPosition - event.nativeEvent.changedTouches[0].clientY > 0
        );
    }

    /**
     * Проверка на то, что тач произошел внутри скролла.
     * Если тач внутри скролла, то мы не тянем шторку в случае если скролл проскроллен.
     * @param touchEvent
     * @protected
     */
    protected _isSwipeInsideScroll(touchEvent: SyntheticEvent<TouchEvent>): boolean {
        /**
         * TODO: Нужно избавиться от связности.
         * https://online.sbis.ru/opendoc.html?guid=64510772-df48-4af8-a240-7ac2b7509cff
         */
        const scrollClassName = 'controls-Scroll';
        let currentNode: HTMLElement = touchEvent.target;
        while (currentNode && currentNode !== this._container) {
            const isScroll = currentNode.classList.contains(scrollClassName);
            if (isScroll) {
                return true;
            } else {
                currentNode = currentNode.parentElement;
            }
        }
        return false;
    }

    private _notifyDragStart(offset: IDragObject['offset']): void {

        /*
           Запоминаем высоту скролла, чтобы при увеличении проверять на то,
           что не увеличим шторку больше, чем есть контента
        */
        if (!this._dragStartHeightDimensions) {
            this._dragStartHeightDimensions = {
                scrollHeight: this._children.customContentWrapper.clientHeight,
                contentHeight: this._getCustomContentHeight()
            };
        }
        this._notify('popupDragStart', [
            this._getDragOffsetWithOverflowChecking(offset)
        ], {bubbling: true});
    }

    protected _notifyDragEnd(): void {
        this._notify('popupDragEnd', [], {bubbling: true});
        this._dragStartHeightDimensions = null;
    }

    private _getDragOffsetWithOverflowChecking(dragOffset: IDragObject['offset']): IDragObject['offset'] {
        let offsetY = dragOffset.y;
        const contentHeight = this._getCustomContentHeight();

        // В зависимости от позиции высоту шторки увеличивает либо положительный, либо отрицательный сдвиг по оси "y"
        const realHeightOffset = this._position === 'top' ? offsetY : -offsetY;
        const {
            scrollHeight: startScrollHeight,
            contentHeight: startContentHeight
        } = this._dragStartHeightDimensions;
        const scrollContentOffset = contentHeight - startScrollHeight;

        // Если остаток доступного контента меньше сдвига, то сдвигаем на размер оставшегося контента
        if (
            realHeightOffset > scrollContentOffset &&
            this._getHeight() > this._options.slidingPanelOptions.minHeight
        ) {

            /*
                Если изначально контент меньше высоты шторки, и шторку пытаюстся развернуть,
                то не учитываем разницу в скролле и контенте, т.к. шторка всё равно не будет сдвигаться,
                А если пытаюся свернуть, то вызываем закрытие передавая текущий оффсет
             */
            if (startContentHeight < startScrollHeight) {
                offsetY = realHeightOffset > 0 ? 0 : offsetY;
            } else {
                offsetY = this._position === 'top' ? scrollContentOffset : -scrollContentOffset;
            }
        }
        return {
            x: dragOffset.x,
            y: offsetY
        };
    }

    /**
     * Получение текущего положения скролла
     * @return {number}
     * @private
     */
    private _getScrollTop(): number {
        return this._scrollState?.scrollTop || 0;
    }

    /**
     * Фикс для сафари, чтобы при скролле убиралась клавиатура
     * Вылезают проблемы с лишней белой полосой внизу
     * @param container
     * @param state
     * @private
     */
    private _toggleScrollObserveForKeyboardClose(state: boolean): void {
        if (state) {
            RegisterUtil(this, 'scroll', this._scrollHandler.bind(this));
        } else {
            UnregisterUtil(this, 'scroll');
        }
    }

    /**
     * При скролле на сафари убираем фокус, чтобы клавиатура закрылась.
     * Делаем это только если фокус в инпуте в текущей шторке(чтобы не было множественных вызовов, если шторок много)
     */
    private _scrollHandler(): void {
        const focusedElement = document.activeElement;
        const isFocusInsideCurrentPanel = focusedElement.closest('.controls-SlidingPanel') === this._container;
        if (this._swipeInProcess && isFocusInsideCurrentPanel && focusedElement.tagName === 'INPUT') {
            const newFocusElement = focusedElement.parentElement;
            newFocusElement.focus();
        }
    }

    static getDefaultOptions(): Partial<ISlidingPanelTemplateOptions> {
        return {
            controlButtonVisibility: true,
            slidingPanelOptions: {
                height: undefined,
                maxHeight: undefined,
                minHeight: undefined,
                position: 'bottom',
                desktopMode: 'stack'
            }
        };
    }
}
