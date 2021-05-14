import {
    COLUMN_SCROLL_JS_SELECTORS,
    ColumnScrollController,
    DRAG_SCROLL_JS_SELECTORS,
    DragScrollController,
    ScrollBar
} from 'Controls/columnScroll';

export {
    COLUMN_SCROLL_JS_SELECTORS,
    DRAG_SCROLL_JS_SELECTORS
};

import * as GridIsEqualUtil from 'Controls/Utils/GridIsEqualUtil';

interface IColumnScrollOptions {
    columnScrollStartPosition?: 'start' | 'end';
    isFullGridSupport?: boolean;
    stickyColumnsCount?: number;
    hasMultiSelectColumn?: boolean;
    columns: Array<{width: string}>,
    dragScrolling: boolean,
    backgroundStyle?: string;
    isActivated?: boolean,
    theme?: string;
    startDragNDropCallback?: Function;
    itemsDragNDrop?: boolean;
    columnScroll?: boolean;
    onOverlayChangedCallback?: Function;
    stickyLadderCellsCount?: number;
}

interface IActualizeOptions {
    scrollBar: ScrollBar,
    containers: {
        header: HTMLElement,
        wrapper: HTMLElement,
        content: HTMLElement,
        styles: HTMLStyleElement
    }
}


export default class ColumnScroll {
    private _options: IColumnScrollOptions;

    private _header: HTMLElement;
    private _scrollBar: ScrollBar;
    private _columnScroll: ColumnScrollController;
    private _dragScroll: DragScrollController;

    private _isGrabbing: boolean = false;

    private _classes: {
        columnScroll: { wrapper: string; content: string; shadow: { start: string; end: string; }  },
        dragScroll: { overlay: string, content: string, grabbing: string }
    } = {
        columnScroll: { content: '', wrapper: '', shadow: { start: '', end: '' } },
        dragScroll: { overlay: '', content: '', grabbing: '' }
    };

    constructor(options: IColumnScrollOptions) {
        this._options = this._updateOptions(options);
    }

    isVisible(): boolean {
        return !!this._columnScroll?.isVisible();
    }

    getSizes() {
        return this._columnScroll.getSizes();
    }

    getScrollPosition(): number {
        return this._columnScroll.getScrollPosition();
    }

    reset(): void {
        if (this._options.columnScrollStartPosition === 'start') {
            this._setScrollPosition(0);
        } else {
            const { contentSize, containerSize } = this.getSizes();
            this._setScrollPosition(contentSize - containerSize);
        }
    }

    getClasses(target: 'wrapper'): string;
    getClasses(target: 'content'): string;
    getClasses(target: 'overlay'): string;
    getClasses(target: 'shadowStart' | 'shadowEnd', params: {needBottomPadding: boolean}): string;
    getClasses(target: 'wrapper' | 'content' | 'overlay' | 'shadowStart' | 'shadowEnd', params?: {needBottomPadding: boolean}): string {
        switch (target) {
            case 'wrapper':
                return this._classes.columnScroll.wrapper;
            case 'content':
                return `${this._classes.columnScroll.content} ${this._classes.dragScroll.content} ${this._classes.dragScroll.grabbing}`;
            case 'overlay':
                return this._classes.dragScroll.overlay;
            case 'shadowStart':
                return this._getColumnScrollShadowClasses('start', params);
            case 'shadowEnd':
                return this._getColumnScrollShadowClasses('end', params);
        }
    }

    getColumnScrollFakeShadowStyles(position: 'start' | 'end'): string {
        if (this._options.columnScrollStartPosition === 'end') {
            if (position === 'end') {
                return '';
            }

            let offsetLeft = 0;

            for (let i = 0; i < this._options.columns.length && i < this._options.stickyColumnsCount; i++) {
                if (!(this._options.columns[i].width && this._options.columns[i].width.indexOf('px') !== -1)) {

                } else {
                    offsetLeft += Number.parseInt(this._options.columns[i].width);
                }
            }

            return `left: ${offsetLeft}px; z-index: 5;`;
        }
        return '';
    }

    getColumnScrollFakeShadowClasses(position: 'start' | 'end', needBottomPadding?: true): string {
        if (this._options.columnScrollStartPosition === 'end') {
            let classes = '';
            if (this._options.hasMultiSelectColumn) {
                classes += 'controls-Grid__ColumnScroll__shadow_withMultiselect ';
            }
            return classes + ColumnScrollController.getShadowClasses(position,{
                isVisible: position === 'start',
                theme: this._options.theme,
                backgroundStyle: this._options.backgroundStyle,
                needBottomPadding: !!needBottomPadding
            });
        }
        return '';
    }

    private _updateOptions(newOptions: IColumnScrollOptions): IColumnScrollOptions {
        const getValue = (name, type, defaultValue) => typeof newOptions[name] === type ? newOptions[name] : (this._options && this._options[name] || defaultValue);

        return {
            columnScrollStartPosition: getValue('columnScrollStartPosition', 'string', 'start'),
            isFullGridSupport: getValue('isFullGridSupport', 'boolean', true),
            stickyColumnsCount: getValue('stickyColumnsCount', 'number', 1),
            hasMultiSelectColumn: getValue('hasMultiSelectColumn', 'boolean', false),
            theme: getValue('theme', 'string', 'default'),
            backgroundStyle: getValue('backgroundStyle', 'string', 'default'),
            isActivated: getValue('isActivated', 'boolean', false),
            dragScrolling: getValue('dragScrolling', 'boolean', !getValue('itemsDragNDrop', 'boolean', false)),
            columns: newOptions.columns instanceof Array ? newOptions.columns : this._options.columns,
            startDragNDropCallback: getValue('startDragNDropCallback', 'function', undefined),
            itemsDragNDrop: getValue('itemsDragNDrop', 'boolean', false),
            columnScroll: getValue('columnScroll', 'boolean', true),
            onOverlayChangedCallback: getValue('onOverlayChangedCallback', 'function', undefined)
        };
    }

    static shouldDrawColumnScroll(scrollContainer: HTMLElement, contentContainer: HTMLElement, isFullGridSupport: boolean): boolean {
        return ColumnScrollController.shouldDrawColumnScroll(scrollContainer, contentContainer, isFullGridSupport);
    }

    actualizeColumnScroll(options: IActualizeOptions & IColumnScrollOptions,
                          oldOptions: IActualizeOptions & IColumnScrollOptions,
                          callback?: (status: 'actual' | 'updated' | 'destroyed' | 'created') => void
    ): Promise<{ status: 'actual' | 'updated' | 'destroyed' | 'created' }> {
        this._scrollBar = options.scrollBar;
        this._header = options.containers.header;

        const needBySize = ColumnScroll.shouldDrawColumnScroll(
            options.containers.wrapper,
            options.containers.content,
            this._options.isFullGridSupport
        );

        let resolvePromise;
        const resultPromise = new Promise<{ status: 'actual' | 'updated' | 'destroyed' | 'created' }>((resolver) => { resolvePromise = resolver });
        const resolve = (status) => {
            if (callback) {
                callback(status);
            } else {
                resolvePromise({status});
            }
        };

        if (needBySize) {
            if (!this._columnScroll) {
                    this._options = this._updateOptions(options);
                    this._createColumnScroll(options);
                    this._columnScroll.updateSizes((newSizes) => {
                        if (this._options.columnScrollStartPosition === 'end') {
                            this._columnScroll.setScrollPosition(newSizes.contentSize - newSizes.containerSize);
                        }
                        this._dragScroll?.updateScrollData({
                            scrollLength: this._columnScroll.getScrollLength(),
                            scrollPosition: this._columnScroll.getScrollPosition()
                        });
                        this._scrollBar.recalcSizes();
                        this._scrollBar.setPosition(this._columnScroll.getScrollPosition());
                        resolve('created');
                    }, true);
            } else {
                    const stickyColumnsCountChanged = oldOptions.stickyColumnsCount !== options.stickyColumnsCount;
                    const multiSelectVisibilityChanged = oldOptions.hasMultiSelectColumn !== options.hasMultiSelectColumn;
                    const dragScrollingChanged = oldOptions.dragScrolling !== options.dragScrolling;
                    const columnsChanged = !GridIsEqualUtil.isEqualWithSkip(oldOptions.columns, options.columns, { template: true, resultTemplate: true });

                    if (stickyColumnsCountChanged || multiSelectVisibilityChanged || columnsChanged) {
                        // Смена колонок может не вызвать событие resize на обёртке грида(ColumnScroll), если общая ширина колонок до обновления и после одинакова.
                        this._columnScroll.updateSizes(() => {
                            this._options = this._updateOptions(options);
                            resolve('updated');
                        }, true);

                    } else if (dragScrollingChanged && options.dragScrolling) {
                        // При включении перетаскивания не нужно ничего перерисовывать. Нужно просто отдать контроллеру перетаскивания размеры.
                        // Сделать при инициализации это нельзя, т.к. контроллеры drag и scroll создаются на разных хуках (before и after update соотв.)
                        // Создание dragScroll на afterUpdate вынудит делать _forceUpdate для обновления состояний (курсор над записями).
                        // Создание columnScroll на beforeUpdate невозможно, т.к. контроллер создается только по мере необходимости.
                        resolve('updated' );
                    } else {
                        const newContentSize = options.containers.content.scrollWidth;
                        const newContainerSize = options.isFullGridSupport ? options.containers.content.offsetWidth : options.containers.wrapper.offsetWidth;
                        const actualSizes = this.getSizes();

                        const isResized = actualSizes.containerSize !== newContainerSize || actualSizes.contentSize !== newContentSize;

                        if (isResized) {
                            // Смена колонок может не вызвать событие resize на обёртке грида(ColumnScroll), если общая ширина колонок до обновления и после одинакова.
                            this._columnScroll.updateSizes(() => {
                                resolve('updated');
                            });
                        } else {
                            resolve('actual');
                        }
                    }
                    this._scrollBar.recalcSizes();
                    this._scrollBar.setPosition(this._columnScroll.getScrollPosition());
            }
        } else {
            if (!this._columnScroll) {
                resolve('actual');
            } else {
                this._options = null;
                this._destroyColumnScroll();
                resolve('destroyed');
            }
        }

        return resultPromise;
    }

    updateControllers(newOptions: IColumnScrollOptions): 'columnScrollDisabled' | void {
        const oldOptions = this._options;
        this._options = this._updateOptions(newOptions);

        const isColumnScrollChanged = oldOptions.columnScroll !== this._options.columnScroll;

        // Если горизонтального скролла не было и нет либо он только появился - то ничего не делаем.
        // Создание произойдет после обновления, когда все размеры будут актуальны.
        if (isColumnScrollChanged && this._options.columnScroll || !isColumnScrollChanged && !this._options.columnScroll) {
            return;
        }

        // Выключение горизонтального скролла приводит к разрушению контроллера.
        // Попадаем сюда если опция columnScroll поменялась и стала false.
        if (!this._options.columnScroll) {
            this._destroyColumnScroll();
            return 'columnScrollDisabled';
        }

        // Включение/выключение перемещения мышкой приводит к созданию/разрушению контроллера.
        // Попадаем сюда, если опция columnScroll не поменялась и равна true.
        if (oldOptions.dragScrolling !== this._options.dragScrolling) {
            if (this._options.dragScrolling) {
                this._initDragScroll(this._options);
            } else {
                this._destroyDragScroll();
            }
            return;
        }

        // При включении/выключении перемещения записей мышкой необходимо уведомить контроллер скроллирования перетаскиванием.
        // Попадаем сюда, если опции columnScroll и dragScrolling не поменялась и равны true.
        // При опции dragScrolling = true, контроллера перетаскивания может не существовать, если нет скрола колонок,
        // поэтому проверка if (options.dragScrolling) не является достоверной.
        if (this._dragScroll && this._options.itemsDragNDrop !== oldOptions.itemsDragNDrop) {
            this._dragScroll.setStartDragNDropCallback(!this._options.itemsDragNDrop ? null : () => {
                this._setGrabbing(false);
                this._options.startDragNDropCallback();
            });
        }
    }

    private _createColumnScroll(options: IActualizeOptions): void {
        this._columnScroll = new ColumnScrollController({
            isFullGridSupport: this._options.isFullGridSupport,
            stickyColumnsCount: this._options.stickyColumnsCount,
            hasMultiSelect: this._options.hasMultiSelectColumn,
            theme: this._options.theme,
            backgroundStyle: this._options.backgroundStyle,
            stickyLadderCellsCount: this._options.stickyLadderCellsCount,
            isEmptyTemplateShown: options.needShowEmptyTemplate,
            getFixedPartWidth: () => {
                // Находим последнюю фиксированную ячейку заголовка / результата
                const fixedElements = options.containers.header.querySelectorAll(`.${COLUMN_SCROLL_JS_SELECTORS.FIXED_ELEMENT}`);
                const lastFixedCell = fixedElements[fixedElements.length - 1] as HTMLElement;

                // Ширина фиксированной части должна учитывать отступ таблицы от внешнего контейнера
                const fixedCellOffsetLeft = lastFixedCell.getBoundingClientRect().left - options.containers.content.getBoundingClientRect().left;
                return fixedCellOffsetLeft + lastFixedCell.offsetWidth;
            }
        });
        this._classes.columnScroll.wrapper = `${COLUMN_SCROLL_JS_SELECTORS.CONTAINER} ${this._columnScroll.getTransformSelector()}`;
        this._classes.columnScroll.content = `${COLUMN_SCROLL_JS_SELECTORS.CONTENT}`;

        if (this._options.dragScrolling) {
            this._initDragScroll(this._options);
        }

        this._columnScroll.setContainers({
            scrollContainer: options.containers.wrapper,
            contentContainer: options.containers.content,
            stylesContainer: options.containers.styles
        });
    }

    private _initDragScroll(options: IColumnScrollOptions): void {
        const startDragNDropCallback = !options.startDragNDropCallback ? null : () => {
            this._setGrabbing(false);
            options.startDragNDropCallback();
        };
        this._dragScroll = new DragScrollController({
            startDragNDropCallback,
            onOverlayShown: () => {
                this._classes.dragScroll.overlay = `${DRAG_SCROLL_JS_SELECTORS.OVERLAY} ${DRAG_SCROLL_JS_SELECTORS.OVERLAY_ACTIVATED}`;
                this._options?.onOverlayChangedCallback(true);
            },
            onOverlayHide: () => {
                this._setGrabbing(false);
                this._classes.dragScroll.overlay = `${DRAG_SCROLL_JS_SELECTORS.OVERLAY} ${DRAG_SCROLL_JS_SELECTORS.OVERLAY_DEACTIVATED}`;
                this._options?.onOverlayChangedCallback(false);
            }
        });
        this._setGrabbing(false);
        this._classes.dragScroll.overlay = `${DRAG_SCROLL_JS_SELECTORS.OVERLAY} ${DRAG_SCROLL_JS_SELECTORS.OVERLAY_DEACTIVATED}`;
        this._classes.dragScroll.content = DRAG_SCROLL_JS_SELECTORS.CONTENT;
    }

    private _getColumnScrollShadowClasses(position: 'start' | 'end', options?: {needBottomPadding: boolean}): string {
        if (this._options.isActivated && this._options.columnScrollStartPosition === 'end') {
            return ColumnScrollController.getShadowClasses(position, {
                isVisible: position === 'start',
                theme: this._options.theme,
                backgroundStyle: this._options.backgroundStyle,
                needBottomPadding: !!options?.needBottomPadding
            });
        }
        return this._columnScroll.getShadowClasses(position, {
            needBottomPadding: options.needBottomPadding
        });
    }

    scrollToElementIfHidden(columnRect: DOMRect): void {
        if (this._columnScroll) {
            this._columnScroll.scrollToElementIfHidden(columnRect);
            this._scrollBar.setPosition(this._columnScroll.getScrollPosition());
        }
    }

    getScrollBarStyles({columns, itemActionsPosition, multiSelectVisibility, multiSelectPosition}, stickyColumns: number = 0): string {
        let offset = 0;
        let lastCellOffset = 0;
        const hasMultiSelectColumn = multiSelectVisibility !== 'hidden' && multiSelectPosition !== 'custom';

        // Учёт колонки с чекбоксами для выбора записей
        if (hasMultiSelectColumn) {
            offset += 1;
        }

        // Учёт колонки(или колонок) с лесенкой
        offset += stickyColumns;

        if (!!columns && itemActionsPosition !== 'custom') {
            lastCellOffset++;
        }

        return `grid-column: ${this._options.stickyColumnsCount + 1 + offset} / ${(columns.length + lastCellOffset + 1) + offset};`
            + ` width: ${this.getSizes().scrollWidth}px;`;
    }

    onScrollByWheel(e) {
        const oldPosition = this._columnScroll.getScrollPosition();
        this._columnScroll.scrollByWheel(e);
        const newPosition = this._columnScroll.getScrollPosition();
        if (oldPosition !== newPosition) {
            this.onScrollEnded();
        }
    }

    onPositionChanged(newPosition: number): void {
        this._setScrollPosition(newPosition);
    }

    _setScrollPosition(newPosition: number): void {
        this._columnScroll.setScrollPosition(newPosition);
        this._dragScroll?.setScrollPosition(this._columnScroll.getScrollPosition());
    }

    onScrollEnded() {
        this._columnScroll.scrollToColumnWithinContainer(this._header);
        this._scrollBar.setPosition(this._columnScroll.getScrollPosition());
        this._dragScroll?.setScrollPosition(this._columnScroll.getScrollPosition());
    }

    startDragScrolling(e, startBy: 'mouse' | 'touch'): void {
        if (!this._dragScroll) {
            return;
        }

        let isGrabbing: boolean;
        if (startBy === 'mouse') {
            isGrabbing = this._dragScroll.onViewMouseDown(e);
        } else {
            // clientX - координата относительно документа, чтобы получить координату
            // относиттельно начала списка, нужно учесть отступ самого списка
            // const touchClientX = e.nativeEvent.touches[0].clientX;
            // const containerLeft = this._children.columnScrollContainer.getBoundingClientRect().left;
            // if (!isInLeftSwipeRange(this._fixedColumnsWidth, this._scrollableColumnsWidth, touchClientX - containerLeft)) {

            isGrabbing = this._dragScroll.onViewTouchStart(e);

            // } else {
            //     this._leftSwipeCanBeStarted = true;
            // }
        }
        this._setGrabbing(isGrabbing);
    }

    moveDragScroll(e, startBy: 'mouse' | 'touch'): number {
        if (this._dragScroll) {
            const isOverlay = e.target.className.indexOf && e.target.className.indexOf(DRAG_SCROLL_JS_SELECTORS.OVERLAY) !== -1;
            const isTouch = startBy === 'touch';
            const action = `on${isOverlay ? 'Overlay' : 'View'}${isTouch ? 'Touch' : 'Mouse'}Move`;

            const newPosition = this._dragScroll[action](e);
            if (newPosition !== null) {
                // if (!isOverlay && startBy === 'touch') {
                //     this._notify('closeSwipe', []);
                // }
                e.stopImmediatePropagation();
                e.nativeEvent.stopImmediatePropagation();
                this._columnScroll.setScrollPosition(newPosition);
                this._dragScroll.setScrollPosition(this._columnScroll.getScrollPosition());
                this._scrollBar.setPosition(this._columnScroll.getScrollPosition());
            }
        }
        return this._columnScroll.getScrollPosition();
    }

    stopDragScrolling(e, startBy: 'mouse' | 'touch') {
        if (!this._dragScroll || !this._isGrabbing) {
            return;
        }
        if (this._dragScroll.isScrolled()) {
            this._columnScroll.scrollToColumnWithinContainer(this._header);
        }
        this._dragScroll.setScrollPosition(this._columnScroll.getScrollPosition());
        this._scrollBar.setPosition(this._columnScroll.getScrollPosition());

        const isOverlay = e.target.className.indexOf(DRAG_SCROLL_JS_SELECTORS.OVERLAY) !== -1;
        const isTouch = startBy === 'touch';
        const action = `on${isOverlay ? 'Overlay' : 'View'}${isTouch ? 'Touch' : 'Mouse'}${isTouch ? 'End' : 'Up'}`;
        this._dragScroll[action](e);

        // if (isTouch) {
            // this._leftSwipeCanBeStarted = false;
        // }
        this._setGrabbing(false);
    }

    _setGrabbing(isGrabbing: boolean): void {
        if (this._isGrabbing !== isGrabbing) {
            this._isGrabbing = isGrabbing;
            this._classes.dragScroll.grabbing = isGrabbing ? ` ${DRAG_SCROLL_JS_SELECTORS.CONTENT_GRABBING}` : '';
        }
    }

    destroy(): void {
        this._destroyColumnScroll();
        this._options = null;
        this._scrollBar = null;
        this._columnScroll = null;
        this._dragScroll = null;
    }

    private _destroyColumnScroll(): void {
        if (this._columnScroll) {
            this._columnScroll.destroy();
            this._columnScroll = null;
            this._classes.columnScroll.wrapper = '';
            this._classes.columnScroll.shadow.start = '';
            this._classes.columnScroll.shadow.end = '';
            this._destroyDragScroll();
        }
    }

    private _destroyDragScroll(): void {
        if (this._dragScroll) {
            this._dragScroll.destroy();
            this._dragScroll = null;
            this._classes.dragScroll.overlay = '';
            this._classes.dragScroll.content = '';
            this._classes.dragScroll.grabbing = '';
        }
    }
}
