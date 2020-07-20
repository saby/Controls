import {TemplateFunction} from 'UI/Base';
import {ListView} from 'Controls/list';
import * as GridLayoutUtil from 'Controls/_grid/utils/GridLayoutUtil';
import * as GridIsEqualUtil from 'Controls/_grid/utils/GridIsEqualUtil';
import {TouchContextField as isTouch} from 'Controls/context';
import tmplNotify = require('Controls/Utils/tmplNotify');
import {CssClassList} from '../Utils/CssClassList';
import {JS_SELECTORS as COLUMN_SCROLL_JS_SELECTORS, ColumnScroll} from './resources/ColumnScroll';
import {JS_SELECTORS as DRAG_SCROLL_JS_SELECTORS, DragScroll} from './resources/DragScroll';
import getDimensions = require("Controls/Utils/getDimensions");

import * as GridViewTemplateChooser from 'wml!Controls/_grid/GridViewTemplateChooser';
import * as GridLayout from 'wml!Controls/_grid/layout/grid/GridView';
import * as TableLayout from 'wml!Controls/_grid/layout/table/GridView';

import * as GridHeader from 'wml!Controls/_grid/layout/grid/Header';
import * as TableHeader from 'wml!Controls/_grid/layout/table/Header';
import * as HeaderContentTpl from 'wml!Controls/_grid/HeaderContent';

import * as GridResults from 'wml!Controls/_grid/layout/grid/Results';
import * as TableResults from 'wml!Controls/_grid/layout/table/Results';
import 'wml!Controls/_grid/layout/common/ResultCellContent';

import * as DefaultItemTpl from 'wml!Controls/_grid/ItemTemplateResolver';
import * as GridItemTemplate from 'wml!Controls/_grid/layout/grid/Item';
import * as TableItemTemplate from 'wml!Controls/_grid/layout/table/Item';

import * as ColumnTpl from 'wml!Controls/_grid/Column';
import * as GroupTemplate from 'wml!Controls/_grid/GroupTemplate';

import {Logger} from 'UI/Utils';
import {shouldAddActionsCell, shouldDrawColumnScroll} from 'Controls/_grid/utils/GridColumnScrollUtil';
import { stickyLadderCellsCount } from 'Controls/_grid/utils/GridLadderUtil';
import {SyntheticEvent} from "Vdom/Vdom";

var
    _private = {
        checkDeprecated: function(cfg, self) {
            // TODO: Удалить по задаче https://online.sbis.ru/opendoc.html?guid=2c5630f6-814a-4284-b3fb-cc7b32a0e245.
            if (cfg.showRowSeparator !== undefined) {
                Logger.error('IGridControl: Option "showRowSeparator" is deprecated and was removed in 20.4000. Use option "rowSeparatorSize={ none | s | l }".', self);
            }
            // TODO: Удалить по задаче https://online.sbis.ru/opendoc.html?guid=2c5630f6-814a-4284-b3fb-cc7b32a0e245.
            if (cfg.rowSeparatorVisibility !== undefined) {
                Logger.warn('IGridControl: Option "rowSeparatorVisibility" is deprecated and will be removed in 20.5000. Use option "rowSeparatorSize={ none | s | l }".', self);
            }
            if (cfg.stickyColumn !== undefined) {
                Logger.warn('IGridControl: Option "stickyColumn" is deprecated and removed in 19.200. Use "stickyProperty" option in the column configuration when setting up the columns.', self);
            }
        },

        getGridTemplateColumns(self, columns: Array<{width?: string}>, hasMultiSelect: boolean): string {
            let initialWidths = columns.map(((column) => column.width || GridLayoutUtil.getDefaultColumnWidth()));
            let columnsWidths: string[] = [];
            const stickyCellsCount = stickyLadderCellsCount(columns, self._options.stickyColumn, self._options.listModel.getDragItemData());
            if (stickyCellsCount === 1) {
                columnsWidths = ['0px'].concat(initialWidths);
            } else if (stickyCellsCount === 2) {
                columnsWidths = ['0px', initialWidths[0]].concat(['0px']).concat(initialWidths.slice(1))
            } else {
                columnsWidths = initialWidths;
            }
            if (shouldAddActionsCell({
                hasColumnScroll: !!self._options.columnScroll,
                isFullGridSupport: GridLayoutUtil.isFullGridSupport(),
                hasColumns: !!columns.length
            })) {
                columnsWidths = columnsWidths.concat(['0px']);
            }
            if (hasMultiSelect) {
                columnsWidths = ['max-content'].concat(columnsWidths);
            }
            return GridLayoutUtil.getTemplateColumnsStyle(columnsWidths);
        },

        setBaseTemplates(self: GridView, isFullGridSupport: boolean): void {
            self._gridTemplate = isFullGridSupport ? GridLayout : TableLayout;
            self._baseHeaderTemplate = isFullGridSupport ? GridHeader : TableHeader;
            self._baseResultsTemplate = isFullGridSupport ? GridResults : TableResults;
        },

        setHoveredCell(self, item, nativeEvent): void {
            const hoveredCellIndex = self._getCellIndexByEventTarget(nativeEvent);
            if (item !== self._hoveredCellItem || hoveredCellIndex !== self._hoveredCellIndex) {
                self._hoveredCellItem = item;
                self._hoveredCellIndex = hoveredCellIndex;
                let container = null;
                let hoveredCellContainer = null;
                if (nativeEvent) {
                    let target = self._getCorrectElement(nativeEvent.target);
                    container = target.closest('.controls-ListView__itemV');
                    hoveredCellContainer = self._getCellByEventTarget(target);
                }
                self._notify('hoveredCellChanged', [item, container, hoveredCellIndex, hoveredCellContainer]);
            }
        },

        // uDimensions for unit tests
        getMultiHeaderHeight(headerContainer: HTMLElement, uDimensions: Function = getDimensions): number {
            const cells = headerContainer.children;
            if (cells.length === 0) {
                return 0;
            }
            const bounds = {
                min: Number.MAX_VALUE,
                max: Number.MIN_VALUE
            };
            Array.prototype.forEach.call(cells, (cell) => {
                const dimensions = uDimensions(cell);
                bounds.min = bounds.min < dimensions.top ? bounds.min : dimensions.top;
                bounds.max = bounds.max > dimensions.bottom ? bounds.max : dimensions.bottom
            });
            return bounds.max - bounds.min;
        },

        /**
         * Создает или удаляет контроллер горизонтального скролла в зависимости от того, нужен ли он списку
         *  should be called in the end of life cycle
         */
        actualizeColumnScroll(self, options, isOnMount?: boolean): 'created' | 'actual' | 'destroyed' {
            let result: 'created' | 'actual' | 'destroyed';

            if (options.columnScroll) {
                const scrollContainer = self._children.columnScrollContainer;
                const contentContainer = scrollContainer.getElementsByClassName(COLUMN_SCROLL_JS_SELECTORS.CONTENT)[0];
                const needBySize = shouldDrawColumnScroll(scrollContainer, contentContainer);

                if (needBySize) {
                    if (!self._columnScrollController) {
                        _private.createColumnScroll(self, options);
                        self._columnScrollController.updateSizes((newSizes) => {
                            if (isOnMount && self._options.columnScrollStartPosition === 'end') {
                                self._columnScrollController.setScrollPosition(newSizes.contentSize - newSizes.containerSize);
                            }
                            self._contentSizeForHScroll = newSizes.contentSizeForScrollBar;
                            self._horizontalScrollWidth = newSizes.scrollWidth;
                            self._containerSize = newSizes.containerSize;
                            self._updateColumnScrollData();
                        }, true);
                        result = 'created';
                    } else {
                        result = 'actual';
                    }
                } else {
                    _private.destroyColumnScroll(self);
                    result = 'destroyed';
                }
            } else {
                _private.destroyColumnScroll(self);
                result = 'destroyed';
            }

            return result;
        },
        createColumnScroll(self, options): void {
            self._columnScrollController = new ColumnScroll({
                needBottomPadding: options._needBottomPadding,
                stickyColumnsCount: options.stickyColumnsCount,
                hasMultiSelect: options.multiSelectVisibility !== 'hidden',
                theme: options.theme,
                backgroundStyle: options.backgroundStyle
            });
            const uniqueSelector = self._columnScrollController.getTransformSelector();
            self._columnScrollContainerClasses = `${COLUMN_SCROLL_JS_SELECTORS.CONTAINER} ${uniqueSelector}`;
            self._columnScrollShadowClasses = { start: '', end: '' };
            self._columnScrollShadowStyles = { start: '', end: '' };

            if (self._isDragScrollingEnabled(options) && !self._dragScrollController) {
                _private.initDragScroll(self, options);
            }

            self._columnScrollController.setContainers({
                scrollContainer: self._children.columnScrollContainer,
                contentContainer: self._children.columnScrollContainer.getElementsByClassName(COLUMN_SCROLL_JS_SELECTORS.CONTENT)[0],
                stylesContainer: self._children.columnScrollStylesContainer
            });
        },
        initDragScroll(self, options, pure?: boolean): void {
            const startDragNDropCallback = !options.startDragNDropCallback ? null : () => {
                _private.setGrabbing(self, false);
                options.startDragNDropCallback();
            };
            self._dragScrollController = new DragScroll({
                startDragNDropCallback,
                dragNDropDelay: options.dragNDropDelay,
                onOverlayShown: () => {
                    self._dragScrollOverlayClasses = `${DRAG_SCROLL_JS_SELECTORS.OVERLAY} ${DRAG_SCROLL_JS_SELECTORS.OVERLAY_ACTIVATED}`;
                },
                onOverlayHide: () => {
                    _private.setGrabbing(self, false);
                    self._dragScrollOverlayClasses = `${DRAG_SCROLL_JS_SELECTORS.OVERLAY} ${DRAG_SCROLL_JS_SELECTORS.OVERLAY_DEACTIVATED}`;
                }
            });
            _private.setGrabbing(self, false);
            self._dragScrollOverlayClasses = `${DRAG_SCROLL_JS_SELECTORS.OVERLAY} ${DRAG_SCROLL_JS_SELECTORS.OVERLAY_DEACTIVATED}`;
        },
        updateColumnScrollByOptions(self, oldOptions, newOptions): void {
            const columnScrollStatus = _private.actualizeColumnScroll(self, newOptions);
            if (columnScrollStatus === 'destroyed') {
                return;
            }

            const stickyColumnsCountChanged = newOptions.stickyColumnsCount !== oldOptions.stickyColumnsCount;
            const multiSelectVisibilityChanged = newOptions.multiSelectVisibility !== oldOptions.multiSelectVisibility;
            const dragScrollingChanged = newOptions.dragScrolling !== oldOptions.dragScrolling;

            if (stickyColumnsCountChanged || multiSelectVisibilityChanged || self._columnsHaveBeenChanged) {

                // Если горизонтльный скролл был только что создан, то он хранит актуальные размеры.
                if (columnScrollStatus !== 'created') {

                    // Смена колонок может не вызвать событие resize на обёртке грида(ColumnScroll), если общая ширина колонок до обновления и после одинакова.
                    self._columnScrollController.updateSizes((newSizes) => {
                        self._contentSizeForHScroll = newSizes.contentSizeForScrollBar;
                        self._horizontalScrollWidth = newSizes.scrollWidth;
                        self._containerSize = newSizes.containerSize;
                        self._updateColumnScrollData();
                    }, true);
                }
            } else if (dragScrollingChanged && newOptions.dragScrolling) {
                // При включении перетаскивания не нужно ничего перерисовывать. Нужно просто отдать контроллеру перетаскивания размеры.
                // Сделать при инициализации это нельзя, т.к. контроллеры drag и scroll создаются на разных хуках (before и after update соотв.)
                // Создание dragScroll на afterUpdate вынудит делать _forceUpdate для обновления состояний (курсор над записями).
                // Создание columnScroll на beforeUpdate невозможно, т.к. контроллер создается только по мере необходимости.
                self._updateColumnScrollData();
            }
        },
        destroyColumnScroll(self): void {
            if (self._columnScrollController) {
                self._columnScrollController.destroy();
                self._columnScrollController = null;
                self._columnScrollContainerClasses = COLUMN_SCROLL_JS_SELECTORS.CONTAINER;
                self._columnScrollShadowClasses = null;
                self._columnScrollShadowStyles = null;
                _private.destroyDragScroll(self);
            }
        },
        destroyDragScroll(self): void {
            if (self._dragScrollController) {
                self._dragScrollController.destroy();
                self._dragScrollController = null;
                self._dragScrollOverlayClasses = '';
            }
        },
        setGrabbing(self, isGrabbing: boolean): void {
            self._isGrabbing = isGrabbing;
            self._viewGrabbingClasses = isGrabbing ? DRAG_SCROLL_JS_SELECTORS.CONTENT_GRABBING : '';
        },
        applyNewOptionsAfterReload(self, oldOptions, newOptions): void {
            // todo remove isEqualWithSkip by task https://online.sbis.ru/opendoc.html?guid=728d200e-ff93-4701-832c-93aad5600ced
            self._columnsHaveBeenChanged = !GridIsEqualUtil.isEqualWithSkip(oldOptions.columns, newOptions.columns,
                { template: true, resultTemplate: true });
            if (self._columnsHaveBeenChanged) {
                if (oldOptions.task1179424529) {
                    // Набор колонок необходимо менять после перезагрузки. Иначе возникает ошибка, когда список
                    // перерисовывается с новым набором колонок, но со старыми данными. Пример ошибки:
                    // https://online.sbis.ru/opendoc.html?guid=91de986a-8cb4-4232-b364-5de985a8ed11
                    self._doAfterReload(() => {
                        self._listModel.setColumns(newOptions.columns);
                    });
                } else {
                    self._listModel.setColumns(newOptions.columns);
                }
            }
        }
    },
    GridView = ListView.extend({

        /* Base templates */
        _template: GridViewTemplateChooser,
        _gridTemplate: null,
        _baseHeaderTemplate: null,
        _baseResultsTemplate: null,

        /* Custom templates */
        _resultsTemplate: null,

        _groupTemplate: GroupTemplate,
        _defaultItemTemplate: DefaultItemTpl,
        _headerContentTemplate: HeaderContentTpl,

        _notifyHandler: tmplNotify,
        _columnScrollContainerClasses: '',
        _dragScrollOverlayClasses: '',
        _horizontalScrollPosition: 0,
        _contentSizeForHScroll: 0,
        _horizontalScrollWidth: 0,
        _containerSize: 0,

        _beforeMount(cfg) {
            _private.checkDeprecated(cfg, this);
            _private.setBaseTemplates(this, GridLayoutUtil.isFullGridSupport());
            const resultSuper = GridView.superclass._beforeMount.apply(this, arguments);
            this._listModel.setBaseItemTemplateResolver(this._resolveBaseItemTemplate.bind(this));
            this._listModel.setColumnTemplate(ColumnTpl);
            this._setResultsTemplate(cfg);
            this._listModel.headerInEmptyListVisible = cfg.headerInEmptyListVisible;

            // Коротко: если изменить набор колонок или заголовков пока gridView не построена, то они и не применятся.
            // Подробнее: GridControl создает модель и отдает ее в GridView через BaseControl. BaseControl занимается обработкой ошибок, в том
            // числе и разрывом соединения с сетью. При разрыве соединения BaseControl уничтожает GridView и показывает ошибку.
            // Если во время, пока GridView разрушена изменять ее опции, то это не приведет ни к каким реакциям.
            this._listModel.setColumns(cfg.columns, true);
            this._listModel.setHeader(cfg.header, true);

            this._horizontalPositionChangedHandler = this._horizontalPositionChangedHandler.bind(this);

            return resultSuper;
        },

        _afterMount(): void {
            GridView.superclass._afterMount.apply(this, arguments);
            if (this._options.columnScroll) {
                _private.actualizeColumnScroll(this, this._options, true);
            }
            this._isFullMounted = true;
        },

        _beforeUpdate(newCfg) {
            GridView.superclass._beforeUpdate.apply(this, arguments);
            const self = this;
            if (this._options.resultsPosition !== newCfg.resultsPosition) {
                if (this._listModel) {
                    this._listModel.setResultsPosition(newCfg.resultsPosition);
                }
            }
            if (this._options.theme !== newCfg.theme) {
                this._listModel.setTheme(newCfg.theme);
            }
            if (this._options.stickyColumnsCount !== newCfg.stickyColumnsCount) {
                this._listModel.setStickyColumnsCount(newCfg.stickyColumnsCount);
                this._columnScrollController?.setStickyColumnsCount(newCfg.stickyColumnsCount, true);
            }
            if (this._options.multiSelectVisibility !== newCfg.stickyColumnsCount) {
                this._columnScrollController?.setMultiSelectVisibility(newCfg.multiSelectVisibility, true);
            }

            // В зависимости от columnScroll вычисляются значения колонок для stickyHeader в методе setHeader.
            if (this._options.columnScroll !== newCfg.columnScroll) {
                this._listModel.setColumnScroll(newCfg.columnScroll);
                if (!newCfg.columnScroll) {
                    _private.destroyColumnScroll(this);
                }
            }
            if (this._options.resultsVisibility !== newCfg.resultsVisibility) {
                this._listModel.setResultsVisibility(newCfg.resultsVisibility);
            }
            _private.applyNewOptionsAfterReload(self, this._options, newCfg);
            // Вычисления в setHeader зависят от columnScroll.
            if (!GridIsEqualUtil.isEqualWithSkip(this._options.header, newCfg.header, { template: true })) {
                this._listModel.setHeader(newCfg.header);
            }
            if (this._options.stickyColumn !== newCfg.stickyColumn) {
                this._listModel.setStickyColumn(newCfg.stickyColumn);
            }
            if (this._options.ladderProperties !== newCfg.ladderProperties) {
                this._listModel.setLadderProperties(newCfg.ladderProperties);
            }

            // TODO: Удалить по задаче https://online.sbis.ru/opendoc.html?guid=2c5630f6-814a-4284-b3fb-cc7b32a0e245.
            if (this._options.rowSeparatorVisibility !== newCfg.rowSeparatorVisibility) {
                this._listModel.setRowSeparatorVisibility(newCfg.rowSeparatorVisibility);
            }
            if (this._options.rowSeparatorSize !== newCfg.rowSeparatorSize) {
                this._listModel.setRowSeparatorSize(newCfg.rowSeparatorSize);
            }
            if (this._options.columnSeparatorSize !== newCfg.columnSeparatorSize) {
                this._listModel.setColumnSeparatorSize(newCfg.columnSeparatorSize);
            }
            if (this._options.resultsTemplate !== newCfg.resultsTemplate) {
                this._resultsTemplate = newCfg.resultsTemplate || this._baseResultsTemplate;
            }

            if (this._options.dragScrolling !== newCfg.dragScrolling) {
                if (newCfg.dragScrolling) {
                    _private.initDragScroll(this, newCfg);
                } else {
                    _private.destroyDragScroll(this);
                }
            } else if (this._dragScrollController && (this._options.itemsDragNDrop !== newCfg.itemsDragNDrop)) {
                this._dragScrollController.setStartDragNDropCallback(!newCfg.itemsDragNDrop ? null : () => {
                    _private.setGrabbing(self, false);
                    newCfg.startDragNDropCallback();
                });
            }
        },

        _afterUpdate(oldOptions): void {
            GridView.superclass._afterUpdate.apply(this, arguments);

            if (this._options.columnScroll) {
                _private.updateColumnScrollByOptions(this, oldOptions, this._options);
            }

            this._columnsHaveBeenChanged = false;
        },

        _beforeUnmount(): void {
            GridView.superclass._beforeUnmount.apply(this, arguments);
            _private.destroyColumnScroll(this);
        },

        /**
         * Производит расчёт CSS классов для футера grid'а
         * @protected
         */
        _getFooterClasses(): string {
            let leftPadding;
            if (this._options.multiSelectVisibility !== 'hidden') {
                leftPadding = 'withCheckboxes';
            } else {
                leftPadding = (this._options.itemPadding && this._options.itemPadding.left || 'default').toLowerCase();
            }
            let classList = CssClassList
                .add('controls-GridView__footer')
                .add(COLUMN_SCROLL_JS_SELECTORS.FIXED_ELEMENT, !!this._options.columnScroll)
                .add(`controls-GridView__footer__paddingLeft_${leftPadding}_theme-${this._options.theme}`);

            // Для предотвращения скролла одной записи в таблице с экшнами.
            // _options._needBottomPadding почему-то иногда не работает.
            if (this._options.itemActionsPosition === 'outside' &&
                !this._options._needBottomPadding &&
                this._options.resultsPosition !== 'bottom') {
                classList = classList.add(`controls-GridView__footer__itemActionsV_outside_theme-${this._options.theme}`);
            }
            return classList.compile();
        },

        resizeNotifyOnListChanged(): void {
            GridView.superclass.resizeNotifyOnListChanged.apply(this, arguments);

            // TODO: Проверить https://online.sbis.ru/opendoc.html?guid=a768cb95-9c30-4f75-b1fb-9182228e5550 #rea_columnnScroll
            if (this._isFullMounted && this._options.columnScroll) {
                const columnScrollStatus = _private.actualizeColumnScroll(this, this._options);
                if (columnScrollStatus === 'actual') {
                    this._columnScrollController.updateSizes((newSizes) => {
                        this._contentSizeForHScroll = newSizes.contentSizeForScrollBar;
                        this._horizontalScrollWidth = newSizes.scrollWidth;
                        this._containerSize = newSizes.containerSize;
                        this._updateColumnScrollData();
                    });
                }
            }
        },

        _resolveItemTemplate(options): TemplateFunction {
            return options.itemTemplate || this._resolveBaseItemTemplate();
        },

        _resolveBaseItemTemplate(): TemplateFunction {
            return GridLayoutUtil.isFullGridSupport() ? GridItemTemplate : TableItemTemplate;
        },

        getHeaderHeight(): number {
            const headerContainer = this._children.header;
            if (!headerContainer) {
                return 0;
            }
            return this._listModel._isMultiHeader ? _private.getMultiHeaderHeight(headerContainer) : headerContainer.getBoundingClientRect().height;
        },

        getResultsHeight(): number {
            return this._children.results ? getDimensions(this._children.results).height : 0;
        },

        _getGridViewClasses(options): string {
            const classes = new CssClassList();
            classes
                .add('controls-Grid')
                .add(`controls-Grid_${this._options.style}_theme-${this._options.theme}`);

            if (!GridLayoutUtil.isFullGridSupport()) {
                const isFixedLayout = this._listModel.isFixedLayout();
                classes
                    .add('controls-Grid_table-layout')
                    .add('controls-Grid_table-layout_fixed', isFixedLayout)
                    .add('controls-Grid_table-layout_auto', !isFixedLayout);
            }
            if (this._listModel.getDragItemData()) {
                classes.add('controls-Grid_dragging_process');
            }
            if (this._options.columnScroll) {
                classes.add(COLUMN_SCROLL_JS_SELECTORS.CONTENT);
                classes.add(DRAG_SCROLL_JS_SELECTORS.CONTENT, this._isDragScrollingVisible(options));
            }
            return classes.compile();
        },

        _getGridViewStyles(): string {
            let styles = '';
            if (GridLayoutUtil.isFullGridSupport()) {
                const hasMultiSelect = this._options.multiSelectVisibility !== 'hidden';
                styles += _private.getGridTemplateColumns(this, this._options.columns, hasMultiSelect);
            }
            return styles;
        },

        _setResultsTemplate(options): void {
            if (options.results && options.results.template) {
                this._resultsTemplate = options.results.template;
            } else {
                this._resultsTemplate =  options.resultsTemplate || this._baseResultsTemplate;
            }
        },

        _onItemClick(e, dispItem): void {
            e.stopImmediatePropagation();
            // Флаг preventItemEvent выставлен, если нужно предотвратить возникновение
            // событий itemClick, itemMouseDown по нативному клику, но по какой-то причине
            // невозможно остановить всплытие события через stopPropagation
            // TODO: Убрать, preventItemEvent когда это больше не понадобится
            // https://online.sbis.ru/doc/cefa8cd9-6a81-47cf-b642-068f9b3898b7
            if (!e.preventItemEvent) {
                const item = dispItem.getContents();
                this._notify('itemClick', [item, e, this._getCellIndexByEventTarget(e)], {bubbling: true});
            }
        },

        _onItemMouseUp(e, dispItem): void {
            const item = dispItem.getContents();
            this._notify('itemMouseUp', [item, e, this._getCellIndexByEventTarget(e)], {bubbling: true});
        },

        _onEditArrowClick(e, item): void {
            this._notify('editArrowClick', [item]);

            // we do not need to fire itemClick on clicking on editArrow
            e.stopPropagation();
        },

        _getGridTemplateColumns(columns, hasMultiSelect) {
            return _private.getGridTemplateColumns(this, columns, hasMultiSelect);
        },

        _onItemMouseMove: function(event, itemData) {
            GridView.superclass._onItemMouseMove.apply(this, arguments);
            _private.setHoveredCell(this, itemData.item, event.nativeEvent);
        },

        _onItemMouseLeave: function() {
            GridView.superclass._onItemMouseLeave.apply(this, arguments);
            _private.setHoveredCell(this, null, null);
        },

        /* COLUMN SCROLL */
        _isColumnScrollVisible(): boolean {
            if (this._columnScrollController && this._columnScrollController.isVisible()) {
                const items = this._options.listModel.getItems();
                return !!items && (!!items.getCount() || !!this._options.editingItemData);
            } else {
                return false;
            }
        },
        isColumnScrollVisible(): boolean {
          return this._isColumnScrollVisible();
        },

        _isDragScrollingEnabled(options): boolean {
            const hasOption = typeof options.dragScrolling === 'boolean';
            return hasOption ? options.dragScrolling : !options.itemsDragNDrop;
        },

        _isDragScrollingVisible(options): boolean {
            return this._isColumnScrollVisible() && this._isDragScrollingEnabled(options);
        },

        // Не вызывает реактивную перерисовку, т.к. данные пишутся в поля объекта. Перерисовка инициируется обновлением позиции скрола.
        _updateColumnScrollShadowClasses(): void {
            const newStart = this._columnScrollController.getShadowClasses('start');
            const newEnd = this._columnScrollController.getShadowClasses('end');

            if (this._columnScrollShadowClasses.start !== newStart) {
                this._columnScrollShadowClasses.start = newStart;
            }

            if (this._columnScrollShadowClasses.end !== newEnd) {
                this._columnScrollShadowClasses.end = newEnd;
            }
        },

        // Не вызывает реактивную перерисовку, т.к. данные пишутся в поля объекта. Перерисовка инициируется обновлением позиции скрола.
        _updateColumnScrollShadowStyles(): void {
            const newStart = this._columnScrollController.getShadowStyles('start');
            const newEnd = this._columnScrollController.getShadowStyles('end');

            if (this._columnScrollShadowStyles.start !== newStart) {
                this._columnScrollShadowStyles.start = newStart;
            }

            if (this._columnScrollShadowStyles.end !== newEnd) {
                this._columnScrollShadowStyles.end = newEnd;
            }
        },
        _horizontalPositionChangedHandler(e, newScrollPosition: number): void {
            this._columnScrollController.setScrollPosition(newScrollPosition);
            this._horizontalScrollPosition = this._columnScrollController.getScrollPosition();
            this._updateColumnScrollData();
        },
        _columnScrollWheelHandler(e): void {
            if (this._isColumnScrollVisible()) {
                this._columnScrollController.scrollByWheel(e);
                this._horizontalScrollPosition = this._columnScrollController.getScrollPosition();
                this._updateColumnScrollData();
            }
        },
        _updateColumnScrollData(): void {
            this._updateColumnScrollShadowClasses();
            this._updateColumnScrollShadowStyles();
            const newScrollPosition = this._columnScrollController.getScrollPosition();
            if (this._horizontalScrollPosition !== newScrollPosition) {
                this._horizontalScrollPosition = newScrollPosition;
            }
            this._dragScrollController?.updateScrollData({
                scrollLength: this._columnScrollController.getScrollLength(),
                scrollPosition: this._horizontalScrollPosition
            });
        },
        _getCorrectElement(element: HTMLElement): HTMLElement {
            // В FF целью события может быть элемент #text, у которого нет метода closest, в этом случае рассматриваем как цель его родителя.
            if (element && !element.closest && element.parentElement) {
                return element.parentElement;
            }
            return element;
        },
        _getCellByEventTarget(target: HTMLElement): HTMLElement {
            return target.closest('.controls-Grid__row-cell');
        },
        _getCellIndexByEventTarget(event): number {
            if (!event) {
                return null;
            }
            let target = this._getCorrectElement(event.target);

            const gridRow = target.closest('.controls-Grid__row');
            if (!gridRow) {
                return null;
            }
            const gridCells = gridRow.querySelectorAll('.controls-Grid__row-cell');
            const currentCell = this._getCellByEventTarget(target);
            const multiSelectOffset = this._options.multiSelectVisibility !== 'hidden' ? 1 : 0;
            return Array.prototype.slice.call(gridCells).indexOf(currentCell) - multiSelectOffset;
        },
        _resizeHandler(e): void {
            if (this._options.columnScroll) {
                const columnScrollStatus = _private.actualizeColumnScroll(this, this._options);
                if (columnScrollStatus === 'actual') {
                    this._columnScrollController.updateSizes((newSizes) => {
                        this._contentSizeForHScroll = newSizes.contentSizeForScrollBar;
                        this._horizontalScrollWidth = newSizes.scrollWidth;
                        this._containerSize = newSizes.containerSize;
                        this._updateColumnScrollData();
                    });
                }
            }
        },
        _onFocusInEditingCell(e: SyntheticEvent<FocusEvent>): void {
            if (!this._isColumnScrollVisible() || e.target.tagName !== 'INPUT' || !this._options.listModel.getEditingItemData()) {
                return;
            }
            this._columnScrollController.scrollToElementIfHidden(e.target as HTMLElement);
            this._updateColumnScrollData();
        },
        _startDragScrolling(e, startBy: 'mouse' | 'touch'): void {
            if (this._isColumnScrollVisible() && this._dragScrollController) {
                let isGrabbing: boolean;
                if (startBy === 'mouse') {
                    isGrabbing = this._dragScrollController.onViewMouseDown(e);
                } else {
                    isGrabbing = this._dragScrollController.onViewTouchStart(e);
                }
                _private.setGrabbing(this, isGrabbing);
            }
        },
        _moveDragScroll(e, startBy: 'mouse' | 'touch') {
            if (this._isColumnScrollVisible() && this._dragScrollController) {
                let newPosition: number;
                if (startBy === 'mouse') {
                    newPosition = this._dragScrollController.onViewMouseMove(e);
                } else {
                    newPosition = this._dragScrollController.onViewTouchMove(e);
                }
                if (newPosition !== null) {
                    this._columnScrollController.setScrollPosition(newPosition);
                    this._horizontalScrollPosition = this._columnScrollController.getScrollPosition();
                    this._updateColumnScrollData();
                }
            }
        },
        _stopDragScrolling(e, startBy: 'mouse' | 'touch') {
            if (this._isColumnScrollVisible() && this._dragScrollController) {
                if (startBy === 'mouse') {
                    this._dragScrollController.onViewMouseUp(e);
                } else {
                    this._dragScrollController.onViewTouchEnd(e);
                }
                _private.setGrabbing(this, false);
            }
        },
        _onDragScrollOverlayMouseMove(e): void {
            if (this._isColumnScrollVisible() && this._dragScrollController) {
                const newPosition = this._dragScrollController.onOverlayMouseMove(e);
                if (newPosition !== null) {
                    this._columnScrollController.setScrollPosition(newPosition);
                    this._updateColumnScrollData();
                }
            }
        },
        _onDragScrollOverlayTouchMove(e): void {
            if (this._isColumnScrollVisible() && this._dragScrollController) {
                const newPosition = this._dragScrollController.onOverlayTouchMove(e);
                if (newPosition !== null) {
                    this._columnScrollController.setScrollPosition(newPosition);
                    this._updateColumnScrollData();
                }
            }
        },
        _onDragScrollOverlayMouseUp(e) {
            this._dragScrollController?.onOverlayMouseUp(e);
        },
        _onDragScrollOverlayTouchEnd(e) {
            this._dragScrollController?.onOverlayTouchEnd(e);
        },
        _onDragScrollOverlayMouseLeave(e) {
            this._dragScrollController?.onOverlayMouseLeave(e);
        }
    });

GridView._private = _private;
GridView.contextTypes = () => {
    return {
        isTouch
    };
};

GridView._theme = ['Controls/grid', 'Controls/Classes'];

export = GridView;
