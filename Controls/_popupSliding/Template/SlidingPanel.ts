import {Control, TemplateFunction} from 'UI/Base';
import * as template from 'wml!Controls/_popupSliding/Template/SlidingPanel/SlidingPanel';
import { SyntheticEvent } from 'UICommon/Events';
import {IDragObject, Container} from 'Controls/dragnDrop';
import {ISlidingPanelTemplateOptions} from 'Controls/_popupSliding/interface/ISlidingPanelTemplate';

/**
 * Интерфейс для шаблона попапа-шторки.
 *
 * @interface Controls/_popupSliding/Template/SlidingPanel
 * @private
 * @author Красильников А.С.
 */
export default class SlidingPanel extends Control<ISlidingPanelTemplateOptions> {
    protected _template: TemplateFunction = template;
    protected _dragStartScrollHeight: number;
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
    private _scrollState: object = null;

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
    }

    protected _isScrollAvailable({
        slidingPanelOptions,
        controlButtonVisibility
    }: ISlidingPanelTemplateOptions): boolean {
        const scrollContentHeight = this._isPanelMounted ? this._getScrollAvailableHeight() : 0;
        const controllerContainer = this._children.controlLine;
        const controllerHeight = this._isPanelMounted && controlButtonVisibility ? controllerContainer.clientHeight : 0;
        const contentHeight = scrollContentHeight + controllerHeight;
        return slidingPanelOptions.height === slidingPanelOptions.maxHeight ||
            slidingPanelOptions.height === contentHeight;
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

    protected _scrollStateChanged(event: SyntheticEvent<MouseEvent>, scrollState: object) {
        this._scrollState = scrollState;
    }

    protected _getScrollAvailableHeight(): number {
        return this._children.customContent.clientHeight;
    }

    /**
     * Запоминаем начальную позицию тача, чтобы считать offset от нее
     * @param {<TouchEvent>} event
     * @private
     */
    protected _touchStartHandler(event: SyntheticEvent<TouchEvent>): void {
        this._currentTouchYPosition = event.nativeEvent.targetTouches[0].clientY;
    }

    /**
     * Раворот шторки через свайп, делается аналогично, через события dragStart/dragEnd
     * @param {<TouchEvent>} event
     * @private
     */
    protected _touchMoveHandler(event: SyntheticEvent<TouchEvent>): void {
        /*
            Если свайпают внутри скролла и скролл не в самом верху,
            то не тянем шторку, т.к. пользователь пытается скроллить
         */
        if (this._scrollAvailable && (this._getScrollTop() !== 0 || this._isSwipeInsideScroll(event))) {
            return;
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

    /**
     * Проверка на то, что тач произошел внутри скролла.
     * Если тач внутри скролла, то мы не тянем шторку в случае если скролл проскроллен.
     * @param touchEvent
     * @protected
     */
    protected _isSwipeInsideScroll(touchEvent: SyntheticEvent<TouchEvent>): boolean {
        const scrollClassName = 'controls-SlidingPanel__scrollWrapper';
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

    protected _touchEndHandler(): void {
        if (this._touchDragOffset) {
            this._notifyDragEnd();
            this._touchDragOffset = null;
        }
    }

    private _notifyDragStart(offset: IDragObject['offset']): void {

        /* Запоминаем высоту скролла, чтобы при увеличении проверять на то,
           что не увеличим шторку больше, чем есть контента */
        if (!this._dragStartScrollHeight) {
            this._dragStartScrollHeight = this._children.customContentWrapper.clientHeight;
        }
        this._notify('popupDragStart', [
            this._getDragOffsetWithOverflowChecking(offset)
        ], {bubbling: true});

    }

    protected _notifyDragEnd(): void {
        this._notify('popupDragEnd', [], {bubbling: true});
        this._dragStartScrollHeight = null;
    }

    private _getDragOffsetWithOverflowChecking(dragOffset: IDragObject['offset']): IDragObject['offset'] {
        let offsetY = dragOffset.y;
        const contentHeight = this._children.customContent.clientHeight;

        // В зависимости от позиции высоту шторки увеличивает либо положительный, либо отрицательный сдвиг по оси "y"
        const realHeightOffset = this._position === 'top' ? offsetY : -offsetY;
        const scrollContentOffset = contentHeight - this._dragStartScrollHeight;
        if (realHeightOffset > scrollContentOffset) {
            offsetY = this._position === 'top' ? scrollContentOffset : -scrollContentOffset;
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
