import {COLUMN_SCROLL_JS_SELECTORS, ColumnScrollController} from 'Controls/columnScroll';

const shouldDrawColumnScroll = (viewContainers, isFullGridSupport): { status: boolean, sizes?: { scrollContainerSize: number, contentContainerSize: number } } => {
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

const updateSizes = (self, viewOptions, calcedSizes?) => {
    // Подсчет размеров, стилей с предпосчитанными размерами
    const wasUpdated = self._$columnScrollController.updateSizes(calcedSizes || true);

    if (wasUpdated) {
        // Установка размеров и позиции в скроллбар
        const {contentSizeForHScroll, scrollWidth} = self._$columnScrollController.getSizes();
        const scrollPosition = self._$columnScrollController.getScrollPosition();
        self._children.horizontalScrollBar.setSizes(contentSizeForHScroll, scrollWidth, scrollPosition);
    }
};

const createColumnScroll = (self, options) => {
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

    self._$columnScrollController = new ColumnScrollController({
        isFullGridSupport: options.isFullGridSupport,
        stickyColumnsCount: options.stickyColumnsCount || 1,
        backgroundStyle: options.backgroundStyle || 'default',
        isEmptyTemplateShown: !!options.needShowEmptyTemplate,
        transformSelector: self._$columnScrollSelector,
        newGrid: true,
        getFixedPartWidth: () => {
            // Находим последнюю фиксированную ячейку заголовка / результата
            const fixedElements = header.querySelectorAll(`.${COLUMN_SCROLL_JS_SELECTORS.FIXED_ELEMENT}`);
            const lastFixedCell = fixedElements[fixedElements.length - 1] as HTMLElement;

            // Ширина фиксированной части должна учитывать отступ таблицы от внешнего контейнера
            const fixedCellOffsetLeft = lastFixedCell.getBoundingClientRect().left - self._children.gridWrapper.getBoundingClientRect().left;
            return fixedCellOffsetLeft + lastFixedCell.offsetWidth;
        },
        containers: {
            scrollContainer: self._children.gridWrapper,
            contentContainer: self._children.grid,
            stylesContainer: self._children.columnScrollStylesContainer,
            transformStylesContainer: self._children.columnScrollPositionStylesContainer
        }
    });
};

const destroyColumnScroll = (self) => {
    self._$columnScrollController.destroy();
    self._$columnScrollController = null;
};

export const ColumnScrollViewMixin = {
    'Controls/_grid/ViewMixins/ColumnScrollViewMixin': true,
    _$columnScrollController: null,
    _$columnScrollSelector: null,
    _$isColumnScrollFrozen: false,

    _freezeColumnScroll(): void {
        if (!this._$isColumnScrollFrozen) {
            this._$isColumnScrollFrozen = true;
        }
    },
    _unFreezeColumnScroll(): void {
        if (this._$isColumnScrollFrozen) {
            this._$isColumnScrollFrozen = false;
        }
    },
    _isColumnScrollFrozen(): void {
        return this._$isColumnScrollFrozen;
    },

    // _beforeMount
    _columnScrollOnViewBeforeMount(options): void {
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

        // Запуск контроллера, подсчет размеров, отрисовка
        updateSizes(this, this._options, shouldDrawResult.sizes);
    },

    // _beforeUpdate
    _columnScrollOnViewBeforeUpdate(newOptions): void {
        if (!newOptions.columnScroll_1 && this._$columnScrollController) {
            destroyColumnScroll(this);
        }
    },

    // _afterUpdate
    _columnScrollOnViewUpdated(oldOptions): void {
        // Горизонтальный скролл выключен. Если он раньше был, то разрушился на beforeUpdate.
        if (!this._options.columnScroll_1 || this._$isColumnScrollFrozen) {
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

        if (!this._$columnScrollController) {
            createColumnScroll(this, this._options);
        } else {
            if (oldOptions.stickyColumnsCount !== this._options.stickyColumnsCount) {
                this._$columnScrollController.setStickyColumnsCount();
            }
        }

        updateSizes(this, this._options, shouldDrawResult.sizes);
    },

    _getColumnScrollThumbStyles(options): string {
        // TODO: Посмотреть на экшены, если не custom то добавить.
        return `grid-column: 3 / ${options.columns.length + 2}; display: none;`;
    },

    _getColumnScrollShadowClasses_new(position: 'start' | 'end'): string {
        return ColumnScrollController.getShadowClasses(position, {
            newGrid: true,
            backgroundStyle: this._options.backgroundStyle || 'default',
            needBottomPadding: !!this._options.needBottomPadding
        });
    },

    //#region EVENT HANDLERS
    _onColumnScrollThumbPositionChanged(e, newScrollPosition: number): void {
        if (!this._$columnScrollController) {
            throw Error('Called handler that should not be called while column scroll is not visible.');
        }
        this._$columnScrollController.setScrollPosition(newScrollPosition);
    },

    _onColumnScrollViewWheel(e): void {
        if (this._$columnScrollController) {
            const newScrollPosition = this._$columnScrollController.scrollByWheel(e);
            this._children.horizontalScrollBar.setPosition(newScrollPosition);
        }
    }
    //#endregion
};
