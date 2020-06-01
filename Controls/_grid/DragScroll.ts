import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import * as template from 'wml!Controls/_grid/resources/DragScroll/DragScroll';
import {SyntheticEvent} from 'Vdom/Vdom';

export interface IDragScrollOptions extends IControlOptions {
    scrollLength: number;
    scrollPosition: number;
    dragNDropDelay?: number;
    startDragNDropCallback?(): void;
}

type TPoint = {
    x: number;
    y: number;
};

const SCROLL_SPEED_BY_DRAG = 0.75;
const DISTANCE_TO_START_DRAG_N_DROP = 3;
const START_ITEMS_DRAG_N_DROP_DELAY = 250;

// TODO: В будущем этот селектор должен импортироваться из DND. Это селектор не DragScroll'a
const DRAG_N_DROP_NOT_DRAGGABLE = 'controls-DragNDrop__notDraggable';

export const JS_SELECTORS = {
    NOT_DRAG_SCROLLABLE: 'js-controls-ColumnScroll__notDraggable'
};

export class DragScroll extends Control<IDragScrollOptions> {
    protected _template: TemplateFunction = template;
    private _dragNDropDelay: number;

    private _isMouseDown: boolean = false;
    private _mouseDownTarget?: HTMLElement;
    private _isOverlayShown: boolean = false;

    private _startMousePosition: TPoint;
    private _maxMouseMoveDistance: TPoint;
    private _startScrollPosition: number;
    private _currentScrollPosition: number;

    private _startItemsDragNDropTimer: number;

    protected _beforeMount(options: IDragScrollOptions): void {
        this._dragNDropDelay = this._getDragNDropDelay(options);
    }

    protected _beforeUpdate(options: IDragScrollOptions): void {
        if (this._options.dragNDropDelay !== options.dragNDropDelay) {
            this._dragNDropDelay = this._getDragNDropDelay(options);
        }
    }

    protected _beforeUnmount(): void {
        this._manageDragScrollStop();
    }

    /**
     * Начинает скроллирование с помощью Drag'N'Drop.
     * Возвращает флаг типа boolean, указывающий возможен ли старт прокрутки с помощью Drag'N'Drop.
     * @private
     */
    private _manageDragScrollStart(startPosition: TPoint, target: HTMLElement): boolean {
        const hasDragNDrop = !!this._options.startDragNDropCallback;
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
        this._startScrollPosition = this._options.scrollPosition;
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
    private _manageDragScrollMove(newMousePosition: TPoint): void {
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
            return;
        }

        // Если активно начали водить мышью по горизонтали, то считаем, что будет drag scrolling.
        // Сбрасываем таймер отложенного запуска Drag'n'drop'а записей, при скролле он не должен возникать.
        // Показывыем overlay во весь экран, чтобы можно было водить мышкой где угодно на экране.
        // Если в списке нет Drag'n'drop'а записей, то сразу начинаем скроллирование при движении мышки.
        const distanceToStartDragNDrop = this._options.startDragNDropCallback ? DISTANCE_TO_START_DRAG_N_DROP : 0;
        if (this._maxMouseMoveDistance.x > distanceToStartDragNDrop) {
            if (!this._isOverlayShown) {
                this._showOverlay();
            }
        }

        // Новая позиция скролла лежит в диапазоне от 0 до максимально возможной прокрутке в списке.
        const newScrollPosition = Math.min(
            Math.max(this._startScrollPosition - Math.floor(SCROLL_SPEED_BY_DRAG * mouseMoveDistance.x), 0),
            this._options.scrollLength
        );

        // Не надо стрелять событием, если позиция скролла не поменялась.
        if (this._currentScrollPosition !== newScrollPosition) {
            this._currentScrollPosition = newScrollPosition;
            this._notify('dragScrolling', [newScrollPosition], { bubbling: false });
        }
    }

    /**
     * Завершает скроллирование с помощью Drag'N'Drop.
     * @private
     */
    private _manageDragScrollStop(): void {
        this._clearDragNDropTimer();
        this._isMouseDown = false;
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
        this._clearDragNDropTimer();
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
        return !!this._options.startDragNDropCallback &&
            !this._isOverlayShown &&
            typeof this._startItemsDragNDropTimer === 'number' &&
            this._maxMouseMoveDistance.x < DISTANCE_TO_START_DRAG_N_DROP &&
            this._maxMouseMoveDistance.y > DISTANCE_TO_START_DRAG_N_DROP &&
            !!this._mouseDownTarget.closest('.controls-Grid__row');
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
        }, this._dragNDropDelay);
    }

    /**
     * Запускает Drag'N'Drop записей. Скроллирование колонок прекращается.
     * @private
     */
    private _initDragNDrop(): void {
        this._manageDragScrollStop();
        this._options.startDragNDropCallback();
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
        * */
        return !target.closest(`.${JS_SELECTORS.NOT_DRAG_SCROLLABLE}`) && !target.closest('.controls-Grid__cell_fixed');
    }

    /**
     * Возвращает значение задержки в течении которой может начаться Drag'N'Drop записей.
     * Если за это время указатель не был перемещен достаточно далеко, должен начаться Drag'N'Drop записей.
     *
     * @param {IDragScrollOptions} options Опции контрола.
     * @see START_ITEMS_DRAG_N_DROP_DELAY
     * @see DISTANCE_TO_START_DRAG_N_DROP
     * @return {Number} Задержка в течении которой может начаться Drag'N'Drop записей
     * @private
     */
    private _getDragNDropDelay(options: IDragScrollOptions): number {
        return typeof options.dragNDropDelay === 'number' ? options.dragNDropDelay : START_ITEMS_DRAG_N_DROP_DELAY;
    }

    /**
     * Возвращает объект Selection, представленный в виде диапазона текста, который пользователь выделил на странице.
     * @private
     */
    private _getSelection(): Selection | null {
        return typeof window !== 'undefined' ? window.getSelection() : null;
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

    //#region View event handlers

    /**
     * Обработчик события mousedown над таблицей.
     * @param {SyntheticEvent} e Дескриптор события mousedown.
     * @protected
     */
    protected onViewMouseDown(e: SyntheticEvent<MouseEvent>): void {
        // Только по ПКМ. Если началось скроллирование перетаскиванием, нужно убрать предыдущее выделение и
        // запретить выделение в процессе скроллирования.
        if (validateEvent(e) && this._manageDragScrollStart(getCursorPosition(e), e.target as HTMLElement)) {
            e.preventDefault();
            this._clearSelection();
        }
    }

    /**
     * Обработчик события touchstart над таблицей.
     * @param {SyntheticEvent} e Дескриптор события touchstart.
     * @protected
     */
    protected onViewTouchStart(e: SyntheticEvent<TouchEvent>): void {
        // Обрабатываем только один тач. Если началось скроллирование перетаскиванием, нужно убрать предыдущее
        // выделение и запретить выделение в процессе скроллирования.
        if (validateEvent(e) && this._manageDragScrollStart(getCursorPosition(e), e.target as HTMLElement)) {
            e.preventDefault();
            this._clearSelection();
        } else {
            this._manageDragScrollStop();
        }
    }

    /**
     * Обработчик события mousemove над таблицей.
     * @param {SyntheticEvent} e Дескриптор события mousemove.
     * @protected
     */
    protected onViewMouseMove(e: SyntheticEvent<MouseEvent>): void {
        if (this._isMouseDown) {
            this._manageDragScrollMove(getCursorPosition(e));
        }
    }

    /**
     * Обработчик события touchmove над таблицей.
     * @param {SyntheticEvent} e Дескриптор события touchmove.
     * @protected
     */
    protected onViewTouchMove(e: SyntheticEvent<TouchEvent>): void {
        if (this._isMouseDown) {
            this._manageDragScrollMove(getCursorPosition(e));
        }
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
     * @protected
     */
    protected onViewMouseUp(e: SyntheticEvent<MouseEvent>): void {
        // Чтобы лишний раз не срабатывало, но не понятно, может ли чломаться что то. Если да, то ошибка скорее
        // всего не в этом, а в том почему мы вообще попали в onViewMouseUp(не был показан оверлэй)
        if (this._isMouseDown) {
            this._manageDragScrollStop();
        }
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
     * @protected
     */
    protected onViewTouchEnd(e: SyntheticEvent<TouchEvent>): void {
        // Чтобы лишний раз не срабатывало, но не понятно, может ли чломаться что то. Если да, то ошибка скорее
        // всего не в этом, а в том почему мы вообще попали в onViewMouseUp(не был показан оверлэй)
        if (this._isMouseDown) {
            this._manageDragScrollStop();
        }
    }

    //#endregion

    //#region Overlay event handlers

    /**
     * Обработчик события mousemove над overlay.
     * Происходит при скроллировании колонок мышью.
     * @param {SyntheticEvent} e Дескриптор события mousemove.
     * @protected
     */
    protected _onOverlayMouseMove(e: SyntheticEvent<MouseEvent>): void {
        if (this._isMouseDown) {
            this._manageDragScrollMove(getCursorPosition(e));
        }
    }

    /**
     * Обработчик события touchmove над overlay.
     * Происходит при скроллировании колонок через touch.
     * @param {SyntheticEvent} e Дескриптор события touchmove.
     * @protected
     */
    protected _onOverlayTouchMove(e: SyntheticEvent<TouchEvent>): void {
        if (this._isMouseDown) {
            this._manageDragScrollMove(getCursorPosition(e));
        }
    }

    /**
     * Обработчик события mouseup над overlay.
     * Происходит при завершении скроллирования колонок мышью.
     * @param {SyntheticEvent} e Дескриптор события mouseup.
     * @protected
     */
    protected _onOverlayMouseUp(e: SyntheticEvent<MouseEvent>): void {
        this._manageDragScrollStop();
    }

    /**
     * Обработчик события touchend над overlay.
     * Происходит при завершении скроллирования колонок через touch, прекращении touch.
     * @param {SyntheticEvent} e Дескриптор события touchend.
     * @protected
     */
    protected _onOverlayTouchEnd(e: SyntheticEvent<TouchEvent>): void {
        this._manageDragScrollStop();
    }

    /**
     * Обработчик события mouseleave над overlay.
     * Происходит, если при запущенном скроллировании колок указатель мыши был уведен за пределы окна(т.к. overlay растянут на все окно).
     * @param {SyntheticEvent} e Дескриптор события touchend.
     * @protected
     */
    protected _onOverlayMouseLeave(e: SyntheticEvent<TouchEvent>): void {
        this._manageDragScrollStop();
    }

    static _styles: string[] = ['Controls/_grid/resources/DragScroll/DragScroll'];

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

export default DragScroll;
