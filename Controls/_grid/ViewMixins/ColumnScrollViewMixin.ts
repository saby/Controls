import {TColumnScrollViewMixin, IAbstractViewOptions} from './ColumnScroll/IColumnScroll';
import {
    COLUMN_SCROLL_JS_SELECTORS, DRAG_SCROLL_JS_SELECTORS,
    NewColumnScrollController as ColumnScrollController,
    DragScrollController
} from 'Controls/columnScroll';
import {_Options, SyntheticEvent} from 'UI/Vdom';

const ERROR_MESSAGES = {
    MISSING_HEADER: 'Невозможно отобразить горизонтальны скролл без заголовков или результатов сверху!',
    HEADER_IS_EMPTY: 'Опция Controls/grid:View::header задана как пустой массив. Такое значение является неправльным. Горизонтальный скролл не может быть создан при такой конфигурации.',
    TOO_FREEZE: 'Внутренняя ошибка Controls.grid:View! Ошибка ColumnScroll::IFreezable. Количество разморозок обновления размеров не равно количеству заморозок!',
    NEEDLESS_CONTROLLER_ALREADY_EXISTS: 'Внутренняя ошибка Controls.grid:View! Горизонтальный скролл только должен появиться, но контроллер уже создан!',
    CALLED_POSITION_CHANGE_HANDLER: 'Внутренняя ошибка Controls.grid:View! Обработчик перемещения скроллбара горизонтального скролла был вызван при разрушенном контроллере скрола!'
};

//#region private methods

const canShowColumnScroll = (self, options: IAbstractViewOptions): boolean => {
    if (options.header instanceof Array && options.header.length === 0) {
        throw Error(ERROR_MESSAGES.HEADER_IS_EMPTY);
    }
    return Boolean(
        !self._listModel.destroyed && (
            !options.needShowEmptyTemplate ||
            options.headerVisibility === 'visible' ||
            options.headerInEmptyListVisible === true
        )
    );
};

const getViewHeader = (self) => {
    let header;
    if ('results' in self._children) {
        header = self._children.results;
    } else if ('header' in self._children) {
        header = self._children.header;
    } else {
        throw Error(ERROR_MESSAGES.MISSING_HEADER);
    }
    return header;
};

const isSizeAffectsOptionsChanged = (newOptions: IAbstractViewOptions, oldOptions: IAbstractViewOptions): boolean => {
    const changedOptions: Record<string, unknown> = _Options.getChangedOptions(newOptions, oldOptions);
    const hasCheckboxColumn = (o) => o.multiSelectVisibility !== 'visible' && o.multiSelectPosition !== 'custom';

    return Boolean(
        changedOptions.hasOwnProperty('columns') ||
        changedOptions.hasOwnProperty('header') ||
        changedOptions.hasOwnProperty('breadCrumbsMode') ||
        changedOptions.hasOwnProperty('sorting') ||
        changedOptions.hasOwnProperty('source') ||
        changedOptions.hasOwnProperty('stickyColumnsCount') ||
        (hasCheckboxColumn(oldOptions) !== hasCheckboxColumn(newOptions))
    );
};

const disablePendingMouseEnterActivation = (self: TColumnScrollViewMixin) => {
    self._$pendingMouseEnterForActivate = false;
    if (self._$columnScrollController) {
        self._doAfterReload(() => {
            self._doOnComponentDidUpdate(() => {
                self._$columnScrollController.disableFakeRender();
            });
        });
    }
};

//#region Создание, обновление и разрушение контроллеров

const createColumnScroll = (self: TColumnScrollViewMixin, options: IAbstractViewOptions) => {
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
        getFixedPartWidth: () => getFixedPartWidth(self._children.gridWrapper, getViewHeader(self)),
        containers: {
            scrollContainer: self._children.gridWrapper,
            contentContainer: self._children.grid,
            ...styleContainers
        },
        useFakeRender: self._$columnScrollUseFakeRender
    });

    self._notify('toggleHorizontalScroll', [true]);
};

const destroyColumnScroll = (self: TColumnScrollViewMixin) => {
    self._$columnScrollController.destroy();
    self._$columnScrollController = null;
    self._$dragScrollStylesContainer = null;
    self._$columnScrollUseFakeRender = false;
    if (self._$dragScrollController) {
        destroyDragScroll(self);
    }
    self._notify('toggleHorizontalScroll', [false]);
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

const updateSizesInDragScrollController = (self: TColumnScrollViewMixin): void => {
    const {contentSize, containerSize} = self._$columnScrollController.getSizes();
    self._$dragScrollController.updateScrollData({
        scrollLength: contentSize - containerSize,
        scrollPosition: self._$columnScrollController.getScrollPosition()
    });
};

const destroyDragScroll = (self: TColumnScrollViewMixin): void => {
    self._$dragScrollController.destroy();
    self._$dragScrollController = null;
};

//#endregion

//#region Изменение позиции скролла

const scrollToEnd = (self: TColumnScrollViewMixin) => {
    const {contentSize, containerSize} = self._$columnScrollController.getSizes();
    setScrollPosition(self, contentSize - containerSize, true);
};

const scrollToColumnEdge = (self): void => {
    const oldScrollPosition = self._$columnScrollController.getScrollPosition();
    self._$columnScrollController.scrollToColumnWithinContainer(getViewHeader(self));
    const newScrollPosition = self._$columnScrollController.getScrollPosition();
    if (oldScrollPosition !== newScrollPosition) {
        setScrollPosition(self, newScrollPosition);
    }
};

const setScrollPosition = (self: TColumnScrollViewMixin, newPosition: number, immediate?: boolean): void => {
    const correctedScrollPosition = self._$columnScrollController.setScrollPosition(newPosition, immediate);
    self._children.horizontalScrollBar.setScrollPosition(correctedScrollPosition);
    if (self._$dragScrollController) {
        self._$dragScrollController.setScrollPosition(correctedScrollPosition);
    }
};
//#endregion

//#region Изменение, обновление размеров

const recalculateSizes = (self: TColumnScrollViewMixin, viewOptions, calcedSizes?) => {
    // Подсчет размеров, стилей с предпосчитанными размерами
    const wasUpdated = self._$columnScrollController.updateSizes(calcedSizes);

    if (wasUpdated) {
        const {contentSizeForHScroll, scrollWidth, containerSize} = self._$columnScrollController.getSizes();
        const scrollPosition = self._$columnScrollController.getScrollPosition();

        self._$columnScrollEmptyViewMaxWidth = containerSize;

        // Установка размеров и позиции в скроллбар
        self._children.horizontalScrollBar.setSizes({contentSize: contentSizeForHScroll, scrollWidth, scrollPosition});

        // Установка размеров и позиции в контроллер скроллирования мышью
        if (self._$dragScrollController) {
            updateSizesInDragScrollController(self);
        }
    }
};

const getFixedPartWidth = (gridWrapper: HTMLDivElement, header: HTMLDivElement) => {
    // Находим последнюю фиксированную ячейку заголовка / результата
    const fixedElements = header.querySelectorAll(`.${COLUMN_SCROLL_JS_SELECTORS.FIXED_ELEMENT}`);
    const lastFixedCell = fixedElements[fixedElements.length - 1] as HTMLElement;

    // Ширина фиксированной части должна учитывать отступ таблицы от внешнего контейнера
    const fixedCellOffsetLeft = lastFixedCell.getBoundingClientRect().left - gridWrapper.getBoundingClientRect().left;
    return fixedCellOffsetLeft + lastFixedCell.offsetWidth;
};
//#endregion

//#endregion

export const ColumnScrollViewMixin: TColumnScrollViewMixin = {
    '[Controls/_grid/ViewMixins/ColumnScroll]': true,
    _$columnScrollSelector: null,
    _$columnScrollController: null,
    _$dragScrollController: null,
    _$dragScrollStylesContainer: null,
    _$columnScrollFreezeCount: 0,
    _$columnScrollEmptyViewMaxWidth: 0,
    _$columnScrollUseFakeRender: false,
    _$pendingMouseEnterForActivate: false,

    //#region IFreezable

    _freezeColumnScroll(): void {
        this._$columnScrollFreezeCount++;
    },
    _unFreezeColumnScroll(): void {
        this._$columnScrollFreezeCount--;
        if (this._$columnScrollFreezeCount < 0) {
            throw Error(ERROR_MESSAGES.TOO_FREEZE);
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
            if (options.isFullGridSupport && options.columnScrollStartPosition === 'end' && !options.preventServerSideColumnScroll) {
                this._$columnScrollUseFakeRender = true;
            }
        }
    },

    // _componentDidMount
    _columnScrollOnViewDidMount(): void {
        // Скролл выключен через опции
        if (!this._options.columnScroll) {
            return;
        }

        // Пустой список, с запретом на показ шапки. Пустое представление должно быть ограничено по ширине,
        // т.к. колонки все могут быть заданы фиксированно.
        // TODO: Подумать над этим, возможно стоит при пустом представлении
        //  показывать 1 колонку(grid-template-columns: 1fr;)?
        if (!canShowColumnScroll(this, this._options)) {
            if (this._options.needShowEmptyTemplate) {
                this._$columnScrollEmptyViewMaxWidth = ColumnScrollController.getEmptyViewMaxWidth(this._children, this._options);
            }
            if (this._$columnScrollUseFakeRender) {
                this._$columnScrollUseFakeRender = false;
                this._$pendingMouseEnterForActivate = false;
            }
            return;
        }

        // Проверяем, нужен ли горизонтальный скролл по размерам таблицы.
        // Не создаем, если не нужен
        const shouldDrawResult = ColumnScrollController.shouldDrawColumnScroll(
            this._children,
            getFixedPartWidth,
            this._options.isFullGridSupport
        );
        if (!shouldDrawResult.status) {
            if (this._$columnScrollUseFakeRender) {
                this._$columnScrollUseFakeRender = false;
                this._$pendingMouseEnterForActivate = false;
            }
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

        if (this._$columnScrollUseFakeRender) {
            this._$columnScrollUseFakeRender = false;
            this._$pendingMouseEnterForActivate = true;
        }
    },

    // _beforeUpdate
    _columnScrollOnViewBeforeUpdate(newOptions: IAbstractViewOptions): void {
        // Скроллирование мышью отключили -> разрушаем контроллер скроллирования мышью
        if (this._$dragScrollController && !this._isDragScrollEnabledByOptions(newOptions)) {
            destroyDragScroll(this);
        }
        // Горизонтальный скролл отключили -> разрушаем оба контроллера при наличии
        if (this._$columnScrollController && (!newOptions.columnScroll || !canShowColumnScroll(this, newOptions))) {
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

    // _componentDidUpdate
    _columnScrollOnViewDidUpdate(oldOptions: IAbstractViewOptions): void {
        // Горизонтальный скролл выключен. Если он раньше был, то разрушился на beforeUpdate.
        if (
            !this._options.columnScroll ||
            !canShowColumnScroll(this, this._options) || this._isColumnScrollFrozen()
        ) {
            return;
        }

        let shouldCheckSizes = false;
        let shouldCreateDragScroll = false;
        let shouldResetColumnScroll = false;

        // Опции, при смене которых в любом случае придется пересчитать размеры
        shouldCheckSizes = isSizeAffectsOptionsChanged(this._options, oldOptions);

        // Включили горизонтальный скролл, либо изменили опции, при которых скролл
        // недопустим, например пустой список без зеголовков. Не факт что он будет нужен.
        // Необходимо взять размеры.
        if (
            !shouldCheckSizes && (
                (this._options.columnScroll && !oldOptions.columnScroll) ||
                (!this._$columnScrollController && (
                    !canShowColumnScroll(this, oldOptions) && canShowColumnScroll(this, this._options)
                ))
            )
        ) {
            shouldCheckSizes = true;
            shouldResetColumnScroll = true;
            if (this._$columnScrollController) {
                throw Error(ERROR_MESSAGES.NEEDLESS_CONTROLLER_ALREADY_EXISTS);
            }
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
                throw Error(ERROR_MESSAGES.NEEDLESS_CONTROLLER_ALREADY_EXISTS);
            }
        }

        if (shouldCheckSizes) {
            const calcResult = (this._$columnScrollController || ColumnScrollController).shouldDrawColumnScroll(
                this._children,
                getFixedPartWidth,
                this._options.isFullGridSupport
            );

            if (!calcResult.status) {
                // Оказалось, что по размерам горизонтальный скролл не требуется
                if (this._$columnScrollController) {
                    destroyColumnScroll(this);
                }
                return;
            }

            if (!this._$columnScrollController) {
                // Создания контроллера
                shouldResetColumnScroll = true;
                createColumnScroll(this, this._options);
            }

            if (this._isDragScrollEnabledByOptions(this._options) && !this._$dragScrollController) {
                createDragScroll(this, this._options);
                updateSizesInDragScrollController(this);
            }

            recalculateSizes(this, this._options, calcResult.sizes);

            if (shouldResetColumnScroll) {
                this._resetColumnScroll(this._options);
            }

            if (this._$pendingMouseEnterForActivate) {
                disablePendingMouseEnterActivation(this);
            }
        } else if (this._$columnScrollController && shouldCreateDragScroll) {
            // Скроллирование перетаскиванеим - это часть горизонтального скролла,
            // которая не может без него существовать. Создаем, только если горизонтальный скролл есть и
            // включили/стало доступно скролливование перетаскиванием. В остальных случаях, контроллер создастся
            // при включении горизонтального скролла.
            createDragScroll(this, this._options);
            updateSizesInDragScrollController(this);
        }
    },

    // _beforeUnmount
    _columnScrollOnViewBeforeUnmount(): void {
        if (this._$columnScrollController) {
            destroyColumnScroll(this);
        }
    },
    //#endregion

    //#region METHODS

    isColumnScrollVisible(): boolean {
        return !!this._$columnScrollController;
    },

    _resetColumnScroll(options: IAbstractViewOptions = this._options): void {
        if (!this._$columnScrollController) {
            return;
        }
        if (options.columnScrollStartPosition === 'end') {
            scrollToEnd(this);
        } else if (this._$columnScrollController.getScrollPosition() !== 0) {
            setScrollPosition(this, 0);
        }
    },

    _isDragScrollEnabledByOptions(options: IAbstractViewOptions): boolean {
        if (typeof options.dragScrolling === 'boolean') {
            return options.dragScrolling;
        } else {
            return !options.itemsDragNDrop;
        }
    },

    _columnScrollHasItemActionsCell(options: IAbstractViewOptions): boolean {
        return Boolean(
            options.isFullGridSupport &&
            options.columnScroll &&
            options.itemActionsPosition !== 'custom'
        );
    },

    _getColumnScrollEmptyViewMaxWidth(): number {
        return this._$columnScrollEmptyViewMaxWidth;
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
        let classes = '';
        if (options.columnScroll) {
            classes += this._$columnScrollSelector;
            if (this._$columnScrollUseFakeRender) {
                classes += ' controls-Grid__ColumnScrollWrapper_withFakeRender';
            }
        }
        return classes;
    },

    _getColumnScrollContentClasses(options: IAbstractViewOptions, columnScrollPartName?: 'fixed' | 'scrollable'): string {
        let classes = '';
        if (options.columnScroll) {
            classes += `${COLUMN_SCROLL_JS_SELECTORS.CONTENT}`;

            if (this._$columnScrollUseFakeRender && columnScrollPartName === 'fixed') {
                classes += ' controls-Grid__ColumnScroll__fakeFixedPart';
            }

            if (this._isDragScrollEnabledByOptions(options)) {
                classes += ` ${DRAG_SCROLL_JS_SELECTORS.CONTENT}`;
            }
        }
        return classes;
    },

    _columnScrollScrollIntoView(target: HTMLElement): void {
        if (this._$columnScrollController) {
            const cell = target.closest('.controls-Grid__row-cell') || target;
            if (cell.className.indexOf(COLUMN_SCROLL_JS_SELECTORS.FIXED_ELEMENT) !== -1) {
                return;
            }
            // Стили должны быть применены незамедлительно, в не через requestAnimationFrame,
            // иначе нативный подскролл сработает раньше, затем подскролл горизонтального скролла.
            const isScrolled = this._$columnScrollController.scrollToElementIfHidden(cell.getBoundingClientRect(), true);
            if (isScrolled) {
                setScrollPosition(this, this._$columnScrollController.getScrollPosition(), true);
            }
        }
    },
    //#endregion

    //#region EVENT HANDLERS

    _onColumnScrollThumbPositionChanged(e: SyntheticEvent<null>, newScrollPosition: number): void {
        if (!this._$columnScrollController) {
            throw Error(ERROR_MESSAGES.CALLED_POSITION_CHANGE_HANDLER);
        }
        setScrollPosition(this, newScrollPosition);
    },

    _onColumnScrollThumbDragEnd(e: SyntheticEvent<null>): void {
        scrollToColumnEdge(this);
    },

    _onColumnScrollViewMouseEnter(e: SyntheticEvent): void {
        if (this._$pendingMouseEnterForActivate) {
            disablePendingMouseEnterActivation(this);
        }
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

    _onColumnScrollViewResized(): void {
        if (this._options.columnScroll && canShowColumnScroll(this, this._options)) {

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
                }
                return;
            }

            let shouldResetColumnScroll: boolean = false;
            if (!this._$columnScrollController) {
                shouldResetColumnScroll = true;
                createColumnScroll(this, this._options);
            }

            if (this._isDragScrollEnabledByOptions(this._options) && !this._$dragScrollController) {
                createDragScroll(this, this._options);
            }

            recalculateSizes(this, this._options, shouldDrawResult.sizes);

            if (shouldResetColumnScroll) {
                this._resetColumnScroll(this._options);
            }

            if (this._$pendingMouseEnterForActivate) {
                disablePendingMouseEnterActivation(this);
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
        // TODO: Поправить пахины правки, здесь не работает скорее всего на IPAD.
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
        // TODO: Поправить пахины правки, здесь не работает скорее всего на IPAD.
        if (this._$dragScrollController && this._$dragScrollController.isStarted()) {
            const isOverlay = e.target.className.indexOf(DRAG_SCROLL_JS_SELECTORS.OVERLAY) !== -1;
            const isTouch = startBy === 'touch';
            const action = `on${isOverlay ? 'Overlay' : 'View'}${isTouch ? 'Touch' : 'Mouse'}${isTouch ? 'End' : 'Up'}`;
            const isScrolled = this._$dragScrollController.isScrolled();
            this._$dragScrollController[action](e);

            if (isScrolled) {
                scrollToColumnEdge(this);
            }
        }
    }

    //#endregion
};
