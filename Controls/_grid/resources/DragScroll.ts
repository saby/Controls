import {SyntheticEvent} from 'Vdom/Vdom';
import {JS_SELECTORS as COLUMN_SCROLL_JS_SELECTORS} from './ColumnScroll';
import {constants} from 'Env/Env';

export interface IDragScrollParams {
    dragNDropDelay?: number;
    startDragNDropCallback?(): void;
    onOverlayShown?(): void;
    onOverlayHide?(): void;
}

export const JS_SELECTORS = {
    CONTENT: 'controls-Grid__DragScroll__content',
    CONTENT_GRABBING: 'controls-Grid__DragScroll__content_grabbing',
    NOT_DRAG_SCROLLABLE: 'js-controls-ColumnScroll__notDraggable',
    OVERLAY: 'controls-Grid__DragScroll__overlay',
    OVERLAY_ACTIVATED: 'controls-Grid__DragScroll__overlay_activated',
    OVERLAY_DEACTIVATED: 'controls-Grid__DragScroll__overlay_deactivated'
};

// TODO: В будущем этот селектор должен импортироваться из DND. Это селектор не DragScroll'a
const DRAG_N_DROP_NOT_DRAGGABLE = 'controls-DragNDrop__notDraggable';

const SCROLL_SPEED_BY_DRAG = 0.75;
const DISTANCE_TO_START_DRAG_N_DROP = 3;
const START_ITEMS_DRAG_N_DROP_DELAY = 250;

interface TPoint {
    x: number;
    y: number;
}

export class DragScroll {
    private _startDragNDropCallback: IDragScrollParams['startDragNDropCallback'];
    private _scrollLength: number = 0;
    private _scrollPosition: number = 0;
    private _onOverlayShownCallback: IDragScrollParams['onOverlayShown'];
    private _onOverlayHideCallback: IDragScrollParams['onOverlayHide'];

    private _isMouseDown: boolean = false;
    private _mouseDownTarget?: HTMLElement;
    private _isOverlayShown: boolean = false;

    private _startMousePosition: TPoint;
    private _maxMouseMoveDistance: TPoint;
    private _startScrollPosition: number;
    private _currentScrollPosition: number;

    private _startItemsDragNDropTimer: number;

    constructor(params: IDragScrollParams) {
        this._startDragNDropCallback = params.startDragNDropCallback;
        this._onOverlayShownCallback = params.onOverlayShown;
        this._onOverlayHideCallback = params.onOverlayHide;
    }

    setStartDragNDropCallback(newStartDragNDropCallback: IDragScrollParams['startDragNDropCallback']): void {
        this._startDragNDropCallback = newStartDragNDropCallback;
    }

    setScrollPosition(newScrollPosition: number): void {
        this._scrollPosition = newScrollPosition;
    }

    updateScrollData(params: {
        scrollLength: number;
        scrollPosition: number;
    }): void {
        this._scrollLength = params.scrollLength;
        this._scrollPosition = params.scrollPosition;
    }

    /**
     * Начинает скроллирование с помощью Drag'N'Drop.
     * Возвращает флаг типа boolean, указывающий возможен ли старт прокрутки с помощью Drag'N'Drop.
     * @private
     */
    private _manageDragScrollStart(startPosition: TPoint, target: HTMLElement): boolean {
        const hasDragNDrop = !!this._startDragNDropCallback;
        const isTargetDraggable = !target.closest(`.${DRAG_N_DROP_NOT_DRAGGABLE}`);

        // Если за данный элемент нельзя скролить, то при возможности сразу начинаем DragNDrop.
        if (!this._isTargetScrollable(target)) {
            if (hasDragNDrop && isTargetDraggable) {
                this._initDragNDrop();
            }
            return false;
        }

        this._isMouseDown = true;
        this._startMousePosition = startPosition;
        this._startScrollPosition = this._scrollPosition;
        this._maxMouseMoveDistance = {x: 0, y: 0};
        this._mouseDownTarget = target;

        // Если в списке доступен DragNDrop, то он запускается отложенно и только в том случае, если пользователь
        // не начал водить мышью.
        // Если недоступен, то overlay по клину не поднимаем, иначе не сработают события click, mouseup по записи.
        if (hasDragNDrop && isTargetDraggable) {
            this._initDelayedDragNDrop();
        }
        return true;
    }

    /**
     * Обрабатывает перемещение указателя при запущеном перемещении скроле колонок через Drag'N'Drop
     * @param {TPoint} newMousePosition Координаты текущей позиции указателя.
     * @private
     */
    private _manageDragScrollMove(newMousePosition: TPoint): number | null {
        // Расстояние, на которое был перемещен указатель мыши с момента нажатия клавиши ПКМ.
        const mouseMoveDistance: TPoint = {
            x: newMousePosition.x - this._startMousePosition.x,
            y: newMousePosition.y - this._startMousePosition.y
        };

        // Максимальное расстояние на которое был перемещен указатель мыши с момента нажатия клавиши ПКМ.
        this._maxMouseMoveDistance = {
            x: Math.max(Math.abs(this._maxMouseMoveDistance.x), Math.abs(mouseMoveDistance.x)),
            y: Math.max(Math.abs(this._maxMouseMoveDistance.y), Math.abs(mouseMoveDistance.y))
        };

        // Если начали водить мышью вертикально, то начинаем drag'n'drop (если он включен в списке)
        if (this._shouldInitDragNDropByVerticalMovement()) {
            this._initDragNDrop();
            return null;
        }

        // Если активно начали водить мышью по горизонтали, то считаем, что будет drag scrolling.
        // Сбрасываем таймер отложенного запуска Drag'n'drop'а записей, при скролле он не должен возникать.
        // Показывыем overlay во весь экран, чтобы можно было водить мышкой где угодно на экране.
        // Если в списке нет Drag'n'drop'а записей, то сразу начинаем скроллирование при движении мышки.
        const distanceToStartDragNDrop = this._startDragNDropCallback ? DISTANCE_TO_START_DRAG_N_DROP : 0;
        if (this._maxMouseMoveDistance.x > distanceToStartDragNDrop) {
            if (!this._isOverlayShown) {
                this._showOverlay();
            }
        }

        // Новая позиция скролла лежит в диапазоне от 0 до максимально возможной прокрутке в списке.
        const newScrollPosition = Math.min(
            Math.max(this._startScrollPosition - Math.floor(SCROLL_SPEED_BY_DRAG * mouseMoveDistance.x), 0),
            this._scrollLength
        );

        // Не надо стрелять событием, если позиция скролла не поменялась.
        if (this._currentScrollPosition !== newScrollPosition) {
            this._currentScrollPosition = newScrollPosition;
            this._scrollPosition = newScrollPosition;
            return newScrollPosition;
        } else {
            return null;
        }
    }

    /**
     * Завершает скроллирование с помощью Drag'N'Drop.
     * @private
     */
    private _manageDragScrollStop(): void {
        this._clearDragNDropTimer();
        this._isMouseDown = false;
        if (this._isOverlayShown && this._onOverlayHideCallback) {
            this._onOverlayHideCallback();
        }
        this._isOverlayShown = false;
        this._mouseDownTarget = null;
        this._startMousePosition = null;
        this._maxMouseMoveDistance = null;
        this._startScrollPosition = 0;
        this._currentScrollPosition = 0;
    }

    /**
     * Активирует overlay сколлирования перетаскиванием. Overlay - растянутый на все окно браузера блок,
     * необходимый для возможности скроллирования даже за пределами таблицы.
     * Если overlay активен, Drag'N'Drop записей невозможен.
     * @private
     */
    private _showOverlay(): void {
        this._isOverlayShown = true;
        if (this._onOverlayShownCallback) {
            this._onOverlayShownCallback();
        }
        this._clearDragNDropTimer();
    }

    /**
     * Определяет, нужно ли запускать Drag'N'Drop записей при вертикальном перемещении мышки до срабатывания таймера.
     * Если была зажата клавиша мыши над элементом и указатель был перемещен на достаточно большое расстояние по вертикали,
     * то нужно незамедлительно начать Drag'N'Drop записей, даже если еще не прошло время отложенного запуска Drag'N'Drop записей.
     * После срабатывания таймера, запускать Drag'N'Drop записей при вертикальном перемещении мыши нецелесообразно, т.к.
     * либо Drag'N'Drop уже начался по отложенному запуску, либо началось скроллирование таблицы.
     *
     * @see IDragScrollOptions.dragNDropDelay
     * @see START_ITEMS_DRAG_N_DROP_DELAY
     * @see DISTANCE_TO_START_DRAG_N_DROP
     * @private
     */
    private _shouldInitDragNDropByVerticalMovement(): boolean {
        // TODO: Убрать селектор .controls-Grid__row, логически о нем знать здесь мы не можем
        return !!this._startDragNDropCallback &&
            !this._isOverlayShown &&
            typeof this._startItemsDragNDropTimer === 'number' &&
            this._maxMouseMoveDistance.x < DISTANCE_TO_START_DRAG_N_DROP &&
            this._maxMouseMoveDistance.y > DISTANCE_TO_START_DRAG_N_DROP &&
            !!this._mouseDownTarget.closest('.controls-Grid__row');
    }

    /**
     * Запускает Drag'N'Drop записей. Скроллирование колонок прекращается.
     * @private
     */
    private _initDragNDrop(): void {
        this._manageDragScrollStop();
        this._startDragNDropCallback();
    }

    /**
     * Отложенно запускает Drag'N'Drop записей если в течение определенного промежутка времени указатель не был перемещен
     * или был перемещен на небольшое расстояние. Скроллирование колонок в таком случае прекращается.
     *
     * @see IDragScrollOptions.dragNDropDelay
     * @see START_ITEMS_DRAG_N_DROP_DELAY
     * @see DISTANCE_TO_START_DRAG_N_DROP
     * @private
     */
    private _initDelayedDragNDrop(): void {
        this._startItemsDragNDropTimer = setTimeout(() => {
            this._startItemsDragNDropTimer = null;
            if (this._maxMouseMoveDistance.x < DISTANCE_TO_START_DRAG_N_DROP) {
                this._initDragNDrop();
            }
        }, START_ITEMS_DRAG_N_DROP_DELAY);
    }

    /**
     * Возвращает флаг типа boolean указывающий, можно ли скроллировать таблицу мышью за данный HTML элемент
     *
     * @param {HTMLElement} target HTML элемент, над которым была зажата клавиша мыши.
     * @return {Boolean} Флаг указывающий, можно ли скроллировать таблицу мышью за данный HTML элемент.
     * @private
     */
    private _isTargetScrollable(target: HTMLElement): boolean {

        /*
        * TODO: https://online.sbis.ru/opendoc.html?guid=f5101ade-8716-40cb-a0be-3701b212b2fa
        * После закрытия везде, где вешается controls-Grid__cell_fixed начать вешать еще и
        * DragScroll.JS_SELECTORS.NOT_DRAG_SCROLLABLE. Отсюда controls-Grid__cell_fixed удалить.
        * COLUMN_SCROLL_JS_SELECTORS.FIXED_ELEMENT
        * */
        return !target.closest(`.${JS_SELECTORS.NOT_DRAG_SCROLLABLE}`) && !target.closest('.controls-Grid__cell_fixed');
    }

    /**
     * Сбросить таймер отложенного старта Drag'N'Drop'а записей.
     * Происходит например, если указатель увели достаточно далеко или Drag'N'Drop записей уже начался из-за
     * перемещения указателя вертикально.
     * @private
     */
    private _clearDragNDropTimer(): void {
        if (this._startItemsDragNDropTimer) {
            clearTimeout(this._startItemsDragNDropTimer);
            this._startItemsDragNDropTimer = null;
        }
    }

    /**
     * Возвращает объект Selection, представленный в виде диапазона текста, который пользователь выделил на странице.
     * @private
     */
    private _getSelection(): Selection | null {
        return constants.isBrowserPlatform ? window.getSelection() : null;
    }

    /**
     * Сбрасывает выделение текста в окне браузера.
     * @private
     */
    private _clearSelection(): void {
        const selection = this._getSelection();
        if (selection) {
            if (selection.removeAllRanges) {
                selection.removeAllRanges();
            } else if (selection.empty) {
                selection.empty();
            }
        }
    }

    destroy(): void {
        this._manageDragScrollStop();
    }

    //#region View mouse event handlers

    /**
     * Обработчик события mousedown над таблицей.
     * @param {SyntheticEvent} e Дескриптор события mousedown.
     */
    onViewMouseDown(e: SyntheticEvent<MouseEvent>): boolean {
        let isGrabStarted = false;
        // Только по ПКМ. Если началось скроллирование перетаскиванием, нужно убрать предыдущее выделение и
        // запретить выделение в процессе скроллирования.
        if (validateEvent(e)) {
            isGrabStarted = this._manageDragScrollStart(getCursorPosition(e), e.target as HTMLElement);
            if (isGrabStarted) {
                e.preventDefault();
                this._clearSelection();
            }
        }
        return isGrabStarted;
    }

    /**
     * Обработчик события mousemove над таблицей.
     * @param {SyntheticEvent} e Дескриптор события mousemove.
     */
    onViewMouseMove(e: SyntheticEvent<MouseEvent>): number | null {
        if (this._isMouseDown) {
            return this._manageDragScrollMove(getCursorPosition(e));
        }
        return null;
    }

    /**
     * Обработчик события mouseup над таблицей.
     * Происходит, если не был начат полноценный скролл колонок, а следовательно не был показан overlay.
     * Полноценный скролл колонок начинается, если в течении определенного времени указатель мыши был отведен на
     * достаточно большую дистанцию.
     * @see IDragScrollOptions.dragNDropDelay
     * @see START_ITEMS_DRAG_N_DROP_DELAY
     * @see DISTANCE_TO_START_DRAG_N_DROP
     * @param {SyntheticEvent} e Дескриптор события mouseup.
     */
    onViewMouseUp(e: SyntheticEvent<MouseEvent>): void {
        if (this._isMouseDown) {
            this._manageDragScrollStop();
        }
    }

    //#endregion

    //#region View touch event handlers

    /**
     * Обработчик события touchstart над таблицей.
     * @param {SyntheticEvent} e Дескриптор события touchstart.
     */
    onViewTouchStart(e: SyntheticEvent<TouchEvent>): boolean {
        let isGrabStarted = false;
        // Обрабатываем только один тач. Если началось скроллирование перетаскиванием, нужно убрать предыдущее
        // выделение и запретить выделение в процессе скроллирования.
        if (validateEvent(e)) {
            isGrabStarted = this._manageDragScrollStart(getCursorPosition(e), e.target as HTMLElement);
            if (isGrabStarted) {
                this._clearSelection();
            }
        } else {
            this._manageDragScrollStop();
        }
        return isGrabStarted;
    }

    /**
     * Обработчик события touchmove над таблицей.
     * @param {SyntheticEvent} e Дескриптор события touchmove.
     */
    onViewTouchMove(e: SyntheticEvent<TouchEvent>): number | null {
        if (this._isMouseDown) {
            return this._manageDragScrollMove(getCursorPosition(e));
        }
        return null;
    }

    /**
     * Обработчик события touchend над таблицей.
     * Происходит, если не был начат полноценный скролл колонок, а следовательно не был показан overlay.
     * Полноценный скролл колонок начинается, если в течении определенного времени был выполнен touch на достаточно
     * большую дистанцию.
     * @see IDragScrollOptions.dragNDropDelay
     * @see START_ITEMS_DRAG_N_DROP_DELAY
     * @see DISTANCE_TO_START_DRAG_N_DROP
     * @param {SyntheticEvent} e Дескриптор события touchend.
     */
    onViewTouchEnd(e: SyntheticEvent<TouchEvent>): void {
        // Чтобы лишний раз не срабатывало, но не понятно, может ли чломаться что то. Если да, то ошибка скорее
        // всего не в этом, а в том почему мы вообще попали в onViewMouseUp(не был показан оверлэй)
        if (this._isMouseDown) {
            this._manageDragScrollStop();
        }
    }

    //#endregion

    //#region Overlay mouse event handlers

    /**
     * Обработчик события mousemove над overlay.
     * Происходит при скроллировании колонок мышью.
     * @param {SyntheticEvent} e Дескриптор события mousemove.
     */
    onOverlayMouseMove(e: SyntheticEvent<MouseEvent>): number | null {
        if (this._isMouseDown) {
            return this._manageDragScrollMove(getCursorPosition(e));
        }
        return null;
    }

    /**
     * Обработчик события mouseup над overlay.
     * Происходит при завершении скроллирования колонок мышью.
     * @param {SyntheticEvent} e Дескриптор события mouseup.
     */
    onOverlayMouseUp(e: SyntheticEvent<MouseEvent>): void {
        this._manageDragScrollStop();
    }

    /**
     * Обработчик события mouseleave над overlay.
     * Происходит, если при запущенном скроллировании колок указатель мыши был уведен за пределы окна(т.к. overlay растянут на все окно).
     * @param {SyntheticEvent} e Дескриптор события touchend.
     */
    onOverlayMouseLeave(e: SyntheticEvent<TouchEvent>): void {
        this._manageDragScrollStop();
    }

    //#endregion

    //#region Overlay touch event handlers

    /**
     * Обработчик события touchmove над overlay.
     * Происходит при скроллировании колонок через touch.
     * @param {SyntheticEvent} e Дескриптор события touchmove.
     */
    onOverlayTouchMove(e: SyntheticEvent<TouchEvent>): number | null {
        if (this._isMouseDown) {
            return this._manageDragScrollMove(getCursorPosition(e));
        }
        return null;
    }

    /**
     * Обработчик события touchend над overlay.
     * Происходит при завершении скроллирования колонок через touch, прекращении touch.
     * @param {SyntheticEvent} e Дескриптор события touchend.
     */
    onOverlayTouchEnd(e: SyntheticEvent<TouchEvent>): void {
        this._manageDragScrollStop();
    }

    //#endregion
}

function getCursorPosition(e: SyntheticEvent<MouseEvent | TouchEvent>): TPoint {
    if ((e.nativeEvent as TouchEvent).touches) {
        const touchEvent = e.nativeEvent as TouchEvent;
        return {
            x: touchEvent.touches[0].clientX,
            y: touchEvent.touches[0].clientY
        };
    } else {
        const mouseEvent = e.nativeEvent as MouseEvent;
        return {
            x: mouseEvent.clientX,
            y: mouseEvent.clientY
        };
    }
}

function validateEvent(e: SyntheticEvent<MouseEvent | TouchEvent>): boolean {
    if ((e.nativeEvent as TouchEvent).touches) {
        return (e.nativeEvent as TouchEvent).touches.length === 1;
    } else {
        return (e.nativeEvent as MouseEvent).buttons === 1;
    }
}
