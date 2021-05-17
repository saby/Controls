import {TColumnScrollViewMixin, IAbstractViewOptions} from './ColumnScroll/IColumnScroll';
import {
    COLUMN_SCROLL_JS_SELECTORS, DRAG_SCROLL_JS_SELECTORS,
    NewColumnScrollController as ColumnScrollController,
    DragScrollController
} from 'Controls/columnScroll';
import {SyntheticEvent} from 'UI/Vdom';

interface IShouldDrawColumnScrollResult {
    status: boolean;
    sizes?: { scrollContainerSize: number, contentContainerSize: number };
}
const shouldDrawColumnScroll = (viewContainers, isFullGridSupport: boolean): IShouldDrawColumnScrollResult => {
    const calcResult = () => {
        const contentContainerSize = viewContainers.grid.scrollWidth;
        const scrollContainerSize = isFullGridSupport ? viewContainers.grid.offsetWidth : viewContainers.gridWrapper.offsetWidth;
        return {
            status: contentContainerSize > scrollContainerSize,
            sizes: {
                scrollContainerSize, contentContainerSize
            }
        };
    };

    const scrollBarContainer = viewContainers.horizontalScrollBar._container;
    const origin = scrollBarContainer.style.display;
    scrollBarContainer.style.display = 'none';
    const result = calcResult();
    scrollBarContainer.style.display = origin;

    return result;
};

const recalculateSizes = (self: TColumnScrollViewMixin, viewOptions, calcedSizes?) => {
    // Подсчет размеров, стилей с предпосчитанными размерами
    const wasUpdated = self._$columnScrollController.updateSizes(calcedSizes || true);

    if (wasUpdated) {
        const {contentSizeForHScroll, scrollWidth} = self._$columnScrollController.getSizes();
        const scrollPosition = self._$columnScrollController.getScrollPosition();

        // Установка размеров и позиции в скроллбар
        self._children.horizontalScrollBar.setSizes({contentSize: contentSizeForHScroll, scrollWidth, scrollPosition});

        // Установка размеров и позиции в контроллер скроллирования мышью
        if (self._$dragScrollController) {
            updateSizesInDragScrollController(self);
        }
    }
};

const updateSizesInDragScrollController = (self: TColumnScrollViewMixin): void => {
    const {contentSize, containerSize} = self._$columnScrollController.getSizes();
    self._$dragScrollController.updateScrollData({
        scrollLength: contentSize - containerSize,
        scrollPosition: self._$columnScrollController.getScrollPosition()
    });
};

const getFixedPartWidth = (gridWrapper: HTMLDivElement, header: HTMLDivElement) => {
    // Находим последнюю фиксированную ячейку заголовка / результата
    const fixedElements = header.querySelectorAll(`.${COLUMN_SCROLL_JS_SELECTORS.FIXED_ELEMENT}`);
    const lastFixedCell = fixedElements[fixedElements.length - 1] as HTMLElement;

    // Ширина фиксированной части должна учитывать отступ таблицы от внешнего контейнера
    const fixedCellOffsetLeft = lastFixedCell.getBoundingClientRect().left - gridWrapper.getBoundingClientRect().left;
    return fixedCellOffsetLeft + lastFixedCell.offsetWidth;
};

const createColumnScroll = (self: TColumnScrollViewMixin, options: IAbstractViewOptions) => {
    let header;

    if ('results' in self._children) {
        header = self._children.results;
    } else if ('header' in self._children) {
        header = self._children.header;
    } else {
        throw Error('Cant display column scroll without header or results!');
    }

    if (!self._$columnScrollSelector) {
        self._$columnScrollSelector = ColumnScrollController.createUniqSelector();
    }

    const styleContainers = self._children.columnScrollStyleContainers.getContainers();

    self._$columnScrollController = new ColumnScrollController({
        isFullGridSupport: options.isFullGridSupport,
        stickyColumnsCount: options.stickyColumnsCount || 1,
        backgroundStyle: options.backgroundStyle || 'default',
        isEmptyTemplateShown: !!options.needShowEmptyTemplate,
        transformSelector: self._$columnScrollSelector,
        getFixedPartWidth: () => getFixedPartWidth(self._children.gridWrapper, header),
        containers: {
            scrollContainer: self._children.gridWrapper,
            contentContainer: self._children.grid,
            stylesContainer: styleContainers.staticStyles,
            transformStylesContainer: styleContainers.transformStyles,
            shadowsStylesContainer: styleContainers.shadowsStyles
        }
    });
};

const destroyColumnScroll = (self: TColumnScrollViewMixin) => {
    self._$columnScrollController.destroy();
    self._$columnScrollController = null;
    if (self._$dragScrollController) {
        destroyDragScroll(self);
    }
};

const scrollToEnd = (self: TColumnScrollViewMixin) => {
    const {contentSize, containerSize} = self._$columnScrollController.getSizes();
    setScrollPosition(self, contentSize - containerSize);
};

const createDragScroll = (self: TColumnScrollViewMixin, options: IAbstractViewOptions) => {
    self._$dragScrollController = new DragScrollController({
        startDragNDropCallback: !options.startDragNDropCallback ? null : () => {
            options.startDragNDropCallback();
        }
    });
};

const destroyDragScroll = (self: TColumnScrollViewMixin): void => {
    self._$dragScrollController.destroy();
    self._$dragScrollController = null;
};

const setScrollPosition = (self: TColumnScrollViewMixin, newPosition: number): void => {
    const correctedScrollPosition = self._$columnScrollController.setScrollPosition(newPosition);
    self._children.horizontalScrollBar.setPosition(correctedScrollPosition);
    if (self._$dragScrollController) {
        self._$dragScrollController.setScrollPosition(correctedScrollPosition);
    }
};

const isDragScrollEnabledByOptions = (options: IAbstractViewOptions): boolean => {
    if (typeof options.dragScroll === 'boolean') {
        return options.dragScroll;
    } else {
        return !options.itemsDragNDrop;
    }
};

export const ColumnScrollViewMixin: TColumnScrollViewMixin = {
    '[Controls/_grid/ViewMixins/ColumnScrollViewMixin]': true,
    _$columnScrollController: null,
    _$dragScrollController: null,

    _$columnScrollSelector: null,
    _$columnScrollFreezeCount: 0,

    //#region IFreezable

    _freezeColumnScroll(): void {
        this._$columnScrollFreezeCount++;
    },
    _unFreezeColumnScroll(): void {
        this._$columnScrollFreezeCount--;
        if (this._$columnScrollFreezeCount < 0) {
            throw Error('Too cold');
        }
    },
    _isColumnScrollFrozen(): boolean {
        return !!this._$columnScrollFreezeCount;
    },
    //#endregion

    //#region HOOKS

    // _beforeMount
    _columnScrollOnViewBeforeMount(options: IAbstractViewOptions): void {
        if (options.columnScroll_1) {
            this._$columnScrollSelector = ColumnScrollController.createUniqSelector();
        }
    },

    // _afterMount
    _columnScrollOnViewMounted(): void {
        // Скролл выключен через опции
        if (!this._options.columnScroll_1) {
            return;
        }

        // Проверяем, нужен ли горизонтальный скролл по размерам таблицы.
        // Не создаем, если не нужен
        const shouldDrawResult = shouldDrawColumnScroll(this._children, this._options.isFullGridSupport);
        if (!shouldDrawResult.status) {
            return;
        }

        // Создания контроллера
        createColumnScroll(this, this._options);

        if (isDragScrollEnabledByOptions(this._options)) {
            createDragScroll(this, this._options);
        }

        // Запуск контроллера, подсчет размеров, отрисовка
        recalculateSizes(this, this._options, shouldDrawResult.sizes);

        if (this._options.columnScrollStartPosition === 'end') {
            scrollToEnd(this);
        }
    },

    // _beforeUpdate
    _columnScrollOnViewBeforeUpdate(newOptions: IAbstractViewOptions): void {
        // Скроллирование мышью отключили -> разрушаем контроллер скроллирования мышью
        if (!isDragScrollEnabledByOptions(newOptions) && this._$dragScrollController) {
            destroyDragScroll(this);
        }
        // Горизонтальный скролл отключили -> разрушаем оба контроллера при наличии
        if (!newOptions.columnScroll_1 && this._$columnScrollController) {
            destroyColumnScroll(this);
        }
    },

    // _afterUpdate
    _columnScrollOnViewUpdated(oldOptions: IAbstractViewOptions): void {
        // Горизонтальный скролл выключен. Если он раньше был, то разрушился на beforeUpdate.
        if (!this._options.columnScroll_1 || this._isColumnScrollFrozen()) {
            return;
        }

        // Считаем размеры, если горизонтальный скролл не нужен, то удаляем.
        // Если нужен, то запомним размеры, они пригодятся для обновления.
        const shouldDrawResult = shouldDrawColumnScroll(this._children, this._options.isFullGridSupport);
        if (!shouldDrawResult.status) {
            if (this._$columnScrollController) {
                destroyColumnScroll(this);
            }
            return;
        }

        let shouldResetColumnScroll: boolean = false;
        if (!this._$columnScrollController) {
            shouldResetColumnScroll = true;
            createColumnScroll(this, this._options);
        } else {
            if (oldOptions.stickyColumnsCount !== this._options.stickyColumnsCount) {
                this._$columnScrollController.setStickyColumnsCount(oldOptions.stickyColumnsCount, true);
            }
        }

        if (isDragScrollEnabledByOptions(this._options) && !this._$dragScrollController) {
            createDragScroll(this, this._options);

            // Проинициализируем размеры в контроллере скроллирования мышью, т.к.
            // перемещение мыши могло включиться без изменения размров.
            updateSizesInDragScrollController(this);
        }

        recalculateSizes(this, this._options, shouldDrawResult.sizes);

        if (shouldResetColumnScroll && this._options.columnScrollStartPosition === 'end') {
            scrollToEnd(this);
        }
    },
    //#endregion

    //#region METHODS

    _getColumnScrollThumbStyles(options: IAbstractViewOptions): string {
        // TODO: Посмотреть на экшены, если не custom то добавить.
        return `grid-column: 3 / ${options.columns.length + 2}; display: none;`;
    },

    _getColumnScrollWrapperClasses(options: IAbstractViewOptions): string {
        if (options.columnScroll_1) {
            return this._$columnScrollSelector;
        }
        return '';
    },

    _getColumnScrollContentClasses(options: IAbstractViewOptions): string {
        let classes = '';
        if (options.columnScroll_1) {
            classes += `${COLUMN_SCROLL_JS_SELECTORS.CONTENT}`;

            if (isDragScrollEnabledByOptions(options)) {
                classes += ` ${DRAG_SCROLL_JS_SELECTORS.CONTENT}`;
            }
        }
        return classes;
    },
    //#endregion

    //#region EVENT HANDLERS
    _onColumnScrollThumbPositionChanged(e: SyntheticEvent<null>, newScrollPosition: number): void {
        if (!this._$columnScrollController) {
            throw Error('Called handler that should not be called while column scroll is not visible.');
        }
        setScrollPosition(this, newScrollPosition);
    },

    _onColumnScrollViewWheel(e: SyntheticEvent<WheelEvent>): void {
        if (this._$columnScrollController) {
            // Игнорируем вращение колеса мыши над скроллбаром. Это обработает скроллбар.
            const target = e.nativeEvent.target as HTMLDivElement;
            if (target && target.closest('.js-controls-Grid_columnScroll_thumb-wrapper')) {
                return;
            }
            const newScrollPosition = this._$columnScrollController.scrollByWheel(e);
            setScrollPosition(this, newScrollPosition);
        }
    },

    _onColumnScrollStartDragScrolling(e: SyntheticEvent<TouchEvent | MouseEvent>, startBy: 'mouse' | 'touch'): void {
        // DragScrolling нужен только чтобы тащить скроллируемые колонки.
        if (this._$dragScrollController) {
            if (startBy === 'mouse') {
                this._$dragScrollController.onViewMouseDown(e);
            } else {
                this._$dragScrollController.onViewTouchStart(e);
            }
        }
    },

    _onColumnScrollDragScrolling(e: SyntheticEvent<TouchEvent | MouseEvent>, startBy: 'mouse' | 'touch'): void {
        if (this._$dragScrollController && this._$dragScrollController.isStarted()) {
            const isOverlay = e.target.className.indexOf && e.target.className.indexOf(DRAG_SCROLL_JS_SELECTORS.OVERLAY) !== -1;
            const isTouch = startBy === 'touch';
            const action = `on${isOverlay ? 'Overlay' : 'View'}${isTouch ? 'Touch' : 'Mouse'}Move`;
            const newPosition = this._$dragScrollController[action](e);

            if (newPosition !== null) {
                e.stopImmediatePropagation();
                e.nativeEvent.stopImmediatePropagation();
                setScrollPosition(this, newPosition);
            }
        }
    },

    _onColumnScrollStopDragScrolling(e: SyntheticEvent<TouchEvent | MouseEvent>, startBy: 'mouse' | 'touch'): void {
        if (this._$dragScrollController && this._$dragScrollController.isStarted()) {
            const isOverlay = e.target.className.indexOf(DRAG_SCROLL_JS_SELECTORS.OVERLAY) !== -1;
            const isTouch = startBy === 'touch';
            const action = `on${isOverlay ? 'Overlay' : 'View'}${isTouch ? 'Touch' : 'Mouse'}${isTouch ? 'End' : 'Up'}`;
            this._$dragScrollController[action](e);
        }
    }

    //#endregion
};
