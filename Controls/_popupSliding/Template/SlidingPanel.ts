import {Control, TemplateFunction} from 'UI/Base';
import * as template from 'wml!Controls/_popupSliding/Template/SlidingPanel/SlidingPanel';
import {SyntheticEvent} from 'Vdom/Vdom';
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
    };
    private _currentTouchYPosition: number = null;
    private _scrollState: object = null;

    protected _beforeMount(options: ISlidingPanelTemplateOptions): void {
        this._scrollAvailable = this._isScrollAvailable(options);
        this._position = options.slidingPanelPosition?.position;
    }

    protected _beforeUpdate(options: ISlidingPanelTemplateOptions): void {
        if (options.slidingPanelPosition !== this._options.slidingPanelPosition) {
            this._scrollAvailable = this._isScrollAvailable(options);
            this._position = options.slidingPanelPosition?.position;
        }
    }

    protected _isScrollAvailable({slidingPanelPosition}: ISlidingPanelTemplateOptions): boolean {
        return slidingPanelPosition.height === slidingPanelPosition.maxHeight;
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
        return this._children.customContentWrapper.clientHeight;
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
        if (this._scrollAvailable && this._getScrollTop() !== 0) {
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
            this._dragStartScrollHeight = this._getScrollAvailableHeight();
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

    static _theme: string[] = ['Controls/popupSliding'];
    static getDefaultOptions(): Partial<ISlidingPanelTemplateOptions> {
        return {
            controlButtonVisibility: true,
            slidingPanelPosition: {
                height: undefined,
                maxHeight: undefined,
                minHeight: undefined,
                position: 'bottom'
            }
        };
    }
}
