import {TColumnScrollViewMixin, IAbstractViewOptions} from './ColumnScroll/IColumnScroll';
import {
    COLUMN_SCROLL_JS_SELECTORS, DRAG_SCROLL_JS_SELECTORS,
    NewColumnScrollController as ColumnScrollController,
    DragScrollController
} from 'Controls/columnScroll';
import {_Options, SyntheticEvent} from 'UI/Vdom';

const recalculateSizes = (self: TColumnScrollViewMixin, viewOptions, calcedSizes?) => {
    // Подсчет размеров, стилей с предпосчитанными размерами
    const wasUpdated = self._$columnScrollController.updateSizes(calcedSizes);

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
    self._$dragScrollStylesContainer = null;
    if (self._$dragScrollController) {
        destroyDragScroll(self);
    }
};

const scrollToEnd = (self: TColumnScrollViewMixin) => {
    const {contentSize, containerSize} = self._$columnScrollController.getSizes();
    setScrollPosition(self, contentSize - containerSize);
};

const createDragScroll = (self: TColumnScrollViewMixin, options: IAbstractViewOptions) => {
    self._$dragScrollStylesContainer = self._children.columnScrollStyleContainers.getContainers().dragScrollStyles;
    self._$dragScrollController = new DragScrollController({
        startDragNDropCallback: !options.startDragNDropCallback ? null : () => {
            options.startDragNDropCallback();
        },
        onOverlayHide(): void {
            self._$dragScrollStylesContainer.innerHTML = '';
        },
        onOverlayShown(): void {
            self._$dragScrollStylesContainer.innerHTML = `.${self._$columnScrollSelector}>.controls-Grid__DragScrollNew__overlay{display: block;}`;
        }
    });
};

const destroyDragScroll = (self: TColumnScrollViewMixin): void => {
    self._$dragScrollController.destroy();
    self._$dragScrollController = null;
};

const setScrollPosition = (self: TColumnScrollViewMixin, newPosition: number): void => {
    const correctedScrollPosition = self._$columnScrollController.setScrollPosition(newPosition);
    self._children.horizontalScrollBar.setScrollPosition(correctedScrollPosition);
    if (self._$dragScrollController) {
        self._$dragScrollController.setScrollPosition(correctedScrollPosition);
    }
};

const applyContainersClasses = (self: TColumnScrollViewMixin): void => {
    self._forceUpdate();
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
        if (options.columnScroll) {
            this._$columnScrollSelector = ColumnScrollController.createUniqSelector();
        }
    },

    // _afterMount
    _columnScrollOnViewMounted(): void {
        // Скролл выключен через опции
        if (!this._options.columnScroll) {
            return;
        }

        // Проверяем, нужен ли горизонтальный скролл по размерам таблицы.
        // Не создаем, если не нужен
        const shouldDrawResult = ColumnScrollController.shouldDrawColumnScroll(this._children, getFixedPartWidth, this._options.isFullGridSupport);
        if (!shouldDrawResult.status) {
            return;
        }

        // Создания контроллера
        createColumnScroll(this, this._options);

        if (this._isDragScrollEnabledByOptions(this._options)) {
            createDragScroll(this, this._options);
        }

        // Запуск контроллера, подсчет размеров, отрисовка
        recalculateSizes(this, this._options, shouldDrawResult.sizes);

        if (this._options.columnScrollStartPosition === 'end') {
            scrollToEnd(this);
        }

        applyContainersClasses(this);
    },

    // _beforeUpdate
    _columnScrollOnViewBeforeUpdate(newOptions: IAbstractViewOptions): void {
        // Скроллирование мышью отключили -> разрушаем контроллер скроллирования мышью
        if (this._$dragScrollController && !this._isDragScrollEnabledByOptions(newOptions)) {
            destroyDragScroll(this);
        }
        // Горизонтальный скролл отключили -> разрушаем оба контроллера при наличии
        if (this._$columnScrollController && (!newOptions.columnScroll || !this._canShowColumnScroll(newOptions))) {
            destroyColumnScroll(this);
        }

        // FIXME: Удалить, при следующем этапе рефакторинга, когда пойду внутрь контроллера, нужно от этого избавиться,
        //  как и от большинства стейтов. #should_refactor
        if (this._$columnScrollController && this._options.needShowEmptyTemplate !== newOptions.needShowEmptyTemplate) {
            this._$columnScrollController.setIsEmptyTemplateShown(newOptions.needShowEmptyTemplate);
        }

        if (this._options.stickyColumnsCount !== newOptions.stickyColumnsCount) {
            this._listModel.setStickyColumnsCount(newOptions.stickyColumnsCount);
        }
    },

    // _afterUpdate
    _columnScrollOnViewUpdated(oldOptions: IAbstractViewOptions): void {
        // Горизонтальный скролл выключен. Если он раньше был, то разрушился на beforeUpdate.
        if (!this._options.columnScroll || !this._canShowColumnScroll(this._options) || this._isColumnScrollFrozen()) {
            return;
        }

        const changedOptions = _Options.getChangedOptions(this._options, oldOptions);
        let shouldCheckSizes = false;
        let shouldCreateDragScroll = false;
        let shouldResetColumnScroll = false;

        // Включили горизонтальный скролл. Не факт что он нужен, посчитаем размеры.
        if (
            (this._options.columnScroll && !oldOptions.columnScroll) ||
            (this._canShowColumnScroll(this._options) && !this._$columnScrollController)
        ) {
            shouldCheckSizes = true;
            shouldResetColumnScroll = true;
            if (this._$columnScrollController) {
                throw Error('Что то пошло не так, возможно гонки или ошибка в миксине. Горизонтальный скролл только включили, а контроллер уже создан.');
            }
        }

        // В любом случае считаем размеры при смене колонок,
        // т.к. нет практики кидания события resize вниз при смене колонок. Аналогично с header'om
        if (
            changedOptions.hasOwnProperty('columns') ||
            changedOptions.hasOwnProperty('header') ||
            changedOptions.hasOwnProperty('stickyColumnsCount')
        ) {
            shouldCheckSizes = true;
        }

        // Включили dragScroll.
        // Про исмене dragScrolling нужно быть хитрее.
        // Нужно проверить что разньше он был недоступен по опциям, а сейчас доступен.
        // И даже так его создание сейчас не обязывает нас пересчитывать размеры,
        // если это единственное изменение опций. Его включение не меняет размеров.
        if (!shouldCheckSizes &&
            this._options.columnScroll &&
            this._isDragScrollEnabledByOptions(this._options) &&
            !this._isDragScrollEnabledByOptions(oldOptions)
        ) {
            shouldCreateDragScroll = true;
            if (this._$dragScrollController) {
                throw Error('Что то пошло не так, возможно гонки или ошибка в миксине. Скроллирование мышью только включили, а контроллер уже создан.');
            }
        }

        if (shouldCheckSizes) {
            const calcResult = (this._$columnScrollController || ColumnScrollController).shouldDrawColumnScroll(
                this._children,
                getFixedPartWidth,
                this._options.isFullGridSupport
            );

            if (!calcResult.status) {
                // Оказалось, что по размерам он нам не нужен. Ничего не создаем.
                return;
            }

            if (!this._$columnScrollController) {
                // Создания контроллера
                createColumnScroll(this, this._options);
                applyContainersClasses(this);
            }

            if (this._isDragScrollEnabledByOptions(this._options) && !this._$dragScrollController) {
                createDragScroll(this, this._options);
                updateSizesInDragScrollController(this);
                applyContainersClasses(this);
            }

            recalculateSizes(this, this._options, calcResult.sizes);

            if (shouldResetColumnScroll && this._options.columnScrollStartPosition === 'end') {
                scrollToEnd(this);
            }
        } else if (shouldCreateDragScroll) {
            createDragScroll(this, this._options);
            updateSizesInDragScrollController(this);
            applyContainersClasses(this);
        }
    },

    _columnScrollOnViewBeforeUnmount(): void {
        if (this._$columnScrollController) {
            destroyColumnScroll(this);
        }
    },
    //#endregion

    //#region METHODS

    resetColumnScroll(options: IAbstractViewOptions = this._options): void {
        if (!this._$columnScrollController) {
            return;
        }
        if (options.columnScrollStartPosition === 'end') {
            scrollToEnd(this);
        } else {
            setScrollPosition(this, 0);
        }
    },

    isColumnScrollVisible(): boolean {
        return !!this._$columnScrollController;
    },

    _columnScrollHasItemActionsCell(options: IAbstractViewOptions): boolean {
        return Boolean(
            options.isFullGridSupport &&
            options.columnScroll &&
            options.itemActionsPosition !== 'custom'
        );
    },

    _canShowColumnScroll(options: IAbstractViewOptions): boolean {
        return Boolean(
            !this._listModel.destroyed && (
                !options.needShowEmptyTemplate ||
                options.headerVisibility === 'visible' ||
                options.headerInEmptyListVisible === true
            )
        );
    },

    _getColumnScrollThumbStyles(options: IAbstractViewOptions): string {
        // TODO: Посмотреть на экшены, если не custom то добавить.
        const hasMultiSelectColumn = options.multiSelectVisibility !== 'hidden'
                                  && options.multiSelectPosition !== 'custom';
        const hasItemActionsCell = this._columnScrollHasItemActionsCell(options);
        const stickyColumnsCount = this._getStickyLadderCellsCount(options);

        const startColumn = +hasMultiSelectColumn + stickyColumnsCount + (options.stickyColumnsCount || 1) + 1;
        const endColumn = +hasMultiSelectColumn + +hasItemActionsCell + stickyColumnsCount + options.columns.length + 1;

        return `grid-column: ${startColumn} / ${endColumn};`;
    },

    _getColumnScrollWrapperClasses(options: IAbstractViewOptions): string {
        if (options.columnScroll) {
            return this._$columnScrollSelector;
        }
        return '';
    },

    _getColumnScrollContentClasses(options: IAbstractViewOptions): string {
        let classes = '';
        if (this._$columnScrollController) {
            classes += `${COLUMN_SCROLL_JS_SELECTORS.CONTENT}`;

            if (this._$dragScrollController) {
                classes += ` ${DRAG_SCROLL_JS_SELECTORS.CONTENT}`;
            }
        }
        return classes;
    },

    _isDragScrollEnabledByOptions(options: IAbstractViewOptions): boolean {
        if (typeof options.dragScrolling === 'boolean') {
            return options.dragScrolling;
        } else {
            return !options.itemsDragNDrop;
        }
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
            if (target && target.closest('.js-controls-ColumnScroll__thumb')) {
                return;
            }
            const newScrollPosition = this._$columnScrollController.scrollByWheel(e);
            setScrollPosition(this, newScrollPosition);
        }
    },

    _onColumnScrollWrapperResized(): void {
        if (this._options.columnScroll) {

            // Считаем размеры, если горизонтальный скролл не нужен, то удаляем.
            // Если нужен, то запомним размеры, они пригодятся для обновления.
            // Подсчет производится:
            //  + простым сравнением размеров, если горизонтального скролла нет в данный момент.
            //  + с предварительным сбросом текущего состояния прокрутки, если скролл есть.
            const shouldDrawResult = (this._$columnScrollController || ColumnScrollController).shouldDrawColumnScroll(
                this._children,
                getFixedPartWidth,
                this._options.isFullGridSupport
            );

            if (!shouldDrawResult.status) {
                if (this._$columnScrollController) {
                    destroyColumnScroll(this);
                    applyContainersClasses(this);
                }
                return;
            }

            let shouldResetColumnScroll: boolean = false;
            if (!this._$columnScrollController) {
                shouldResetColumnScroll = true;
                createColumnScroll(this, this._options);
                applyContainersClasses(this);
            }

            if (this._isDragScrollEnabledByOptions(this._options) && !this._$dragScrollController) {
                createDragScroll(this, this._options);
                applyContainersClasses(this);
            }

            recalculateSizes(this, this._options, shouldDrawResult.sizes);

            if (shouldResetColumnScroll && this._options.columnScrollStartPosition === 'end') {
                scrollToEnd(this);
            }
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
