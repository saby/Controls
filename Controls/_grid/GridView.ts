import {TemplateFunction} from 'UI/Base';
import {ListView, CssClassList} from 'Controls/list';
import * as GridLayoutUtil from 'Controls/_grid/utils/GridLayoutUtil';
import * as GridIsEqualUtil from 'Controls/Utils/GridIsEqualUtil';
import {TouchContextField as isTouch} from 'Controls/context';
import {tmplNotify} from 'Controls/eventUtils';
import {prepareEmptyEditingColumns} from 'Controls/Utils/GridEmptyTemplateUtil';
import {JS_SELECTORS as COLUMN_SCROLL_JS_SELECTORS, ColumnScroll} from './resources/ColumnScroll';
import {JS_SELECTORS as DRAG_SCROLL_JS_SELECTORS, DragScroll} from './resources/DragScroll';
import {shouldAddActionsCell, shouldDrawColumnScroll, isInLeftSwipeRange} from 'Controls/_grid/utils/GridColumnScrollUtil';

import {getDimensions} from 'Controls/sizeUtils';

import * as GridViewTemplateChooser from 'wml!Controls/_grid/GridViewTemplateChooser';
import * as GridTemplate from 'wml!Controls/_grid/layout/grid/GridView';
import * as TableTemplate from 'wml!Controls/_grid/layout/table/GridView';

import * as GridHeader from 'wml!Controls/_grid/layout/grid/Header';
import * as TableHeader from 'wml!Controls/_grid/layout/table/Header';
import * as HeaderContentTpl from 'wml!Controls/_grid/HeaderContent';

import * as GridResults from 'wml!Controls/_grid/layout/grid/Results';
import * as TableResults from 'wml!Controls/_grid/layout/table/Results';
import 'wml!Controls/_grid/layout/common/ResultCellContent';

import * as GridItemTemplate from 'wml!Controls/_grid/layout/grid/Item';
import * as TableItemTemplate from 'wml!Controls/_grid/layout/table/Item';

import * as ColumnTpl from 'wml!Controls/_grid/layout/common/ColumnContent';
import * as GroupTemplate from 'wml!Controls/_grid/GroupTemplate';

import {Logger} from 'UI/Utils';
import { GridLadderUtil } from 'Controls/display';
import {SyntheticEvent} from "Vdom/Vdom";

var
    _private = {
        checkDeprecated: function(cfg, self) {
            // TODO: Удалить по задаче https://online.sbis.ru/opendoc.html?guid=2c5630f6-814a-4284-b3fb-cc7b32a0e245.
            if (cfg.showRowSeparator !== undefined) {
                Logger.error('IGridControl: Option "showRowSeparator" is deprecated and was removed in 20.4000. Use option "rowSeparatorSize={ null | s | l }".', self);
            }
            // TODO: Удалить по задаче https://online.sbis.ru/opendoc.html?guid=2c5630f6-814a-4284-b3fb-cc7b32a0e245.
            if (cfg.rowSeparatorVisibility !== undefined) {
                Logger.warn('IGridControl: Option "rowSeparatorVisibility" is deprecated and will be removed in 20.5000. Use option "rowSeparatorSize={ null | s | l }".', self);
            }
            if (cfg.stickyColumn !== undefined) {
                Logger.warn('IGridControl: Option "stickyColumn" is deprecated and removed in 19.200. Use "stickyProperty" option in the column configuration when setting up the columns.', self);
            }
            if (cfg.headerInEmptyListVisible !== undefined) {
                Logger.warn('IGridControl: Option "headerInEmptyListVisible" is deprecated and removed in 20.7000. Use "headerVisibility={ hasdata | visible }".', self);
            }
        },

        getGridTemplateColumns(self, columns: Array<{width?: string}>, hasMultiSelect: boolean): string {
            if (!columns || columns.length === 0) {
                Logger.warn('You must set "columns" option as not empty array to make grid work correctly!', self);
                return '';
            }
            let initialWidths = columns.map(((column) => column.width || GridLayoutUtil.getDefaultColumnWidth()));
            let columnsWidths: string[] = [];
            const stickyCellsCount = GridLadderUtil.stickyLadderCellsCount(columns, self._options.stickyColumn, self._options.listModel.getDragItemData());
            if (stickyCellsCount === 1) {
                columnsWidths = ['0px'].concat(initialWidths);
            } else if (stickyCellsCount === 2) {
                columnsWidths = ['0px', initialWidths[0], '0px'].concat(initialWidths.slice(1))
            } else {
                columnsWidths = initialWidths;
            }
            if (shouldAddActionsCell({
                hasColumnScroll: !!self._options.columnScroll,
                isFullGridSupport: GridLayoutUtil.isFullGridSupport(),
                hasColumns: !!columns.length,
                itemActionsPosition: self._options.itemActionsPosition
            })) {
                columnsWidths = columnsWidths.concat(['0px']);
            }
            if (hasMultiSelect) {
                columnsWidths = ['max-content'].concat(columnsWidths);
            }
            return GridLayoutUtil.getTemplateColumnsStyle(columnsWidths);
        },

        setBaseTemplates(self: GridView, isFullGridSupport: boolean): void {
            self._baseHeaderTemplate = isFullGridSupport ? GridHeader : TableHeader;
            self._baseResultsTemplate = isFullGridSupport ? GridResults : TableResults;

            // Несмотря на то, что шаблон грида и таблицы отличается тольок типом тегов блока-обертки
            // (div или table), использовать один шаблон нельзя.
            // На этапе построения страницы браузер не воспринимает стили элементов и считает верстку
            // div[display: table]>tr>td>div невалидной, т.к. tr не может лежать вне таблицы.
            // Дальнейшее поведение разнится от браузера к браузеру:
            // Chrome кладет невалидную верстку рядом с валидной, div[display: table], tr>td>div;
            // IE вырезает невалидное, div[display: table]>div
            // Эта особенность касается только тех случаев, когда верстка смешана изначально,
            // если "находу" вставить tr в div, браузер пропустит проверки и принудительно вставит tr.
            // Таким образом, ошибка будет заметна только при оживлении серверной верстки:
            // с сервера прилетела верстка -> браузер поменял ее и отобразил -> верстка с сервера отличается
            // от клиентской -> сгененрировалась новая верстка.
            self._gridTemplate = isFullGridSupport ? GridTemplate : TableTemplate;
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
                            self._saveColumnScrollSizes(newSizes);
                            self._updateColumnScrollData();
                            self._listModel?.setColumnScrollVisibility(self._isColumnScrollVisible());
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
                hasMultiSelect: options.multiSelectVisibility !== 'hidden' && options.multiSelectPosition === 'default',
                theme: options.theme,
                backgroundStyle: options.backgroundStyle,
                isEmptyTemplateShown: options.needShowEmptyTemplate
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
            let columnScrollChanged = false;

            if (columnScrollStatus === 'actual') {
                const isColumnScrollVisible = self._isColumnScrollVisible();
                columnScrollChanged = self._listModel.getColumnScrollVisibility() !== isColumnScrollVisible;
                if (columnScrollChanged) {
                    self._listModel.setColumnScrollVisibility(isColumnScrollVisible);
                }
            }

            if (columnScrollChanged ||
                stickyColumnsCountChanged ||
                multiSelectVisibilityChanged ||
                self._columnsHaveBeenChanged) {

                // Если горизонтльный скролл был только что создан, то он хранит актуальные размеры.
                if (columnScrollStatus !== 'created') {

                    // Смена колонок может не вызвать событие resize на обёртке грида(ColumnScroll), если общая ширина колонок до обновления и после одинакова.
                    self._columnScrollController.updateSizes((newSizes) => {
                        self._saveColumnScrollSizes(newSizes);
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
                self._listModel?.setColumnScrollVisibility(false);
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
            if (self._isGrabbing !== isGrabbing) {
                self._isGrabbing = isGrabbing;
                self._viewGrabbingClasses = isGrabbing ? DRAG_SCROLL_JS_SELECTORS.CONTENT_GRABBING : '';
            }
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
                        // Если колонки изменились, например, их кол-во, а данные остались те же, то
                        // то без перерисовки мы не можем корректно отобразить данные в новых колонках.
                        // правка конфликтует с https://online.sbis.ru/opendoc.html?guid=a8429971-3a3c-44d0-8cca-098887c9c717
                        self._listModel.setColumns(newOptions.columns, false);
                        self._listModel.setFooter(newOptions.footer || [{ template: newOptions.footerTemplate }], true);
                    });
                } else {
                    self._listModel.setColumns(newOptions.columns);
                    self._listModel.setFooter(newOptions.footer || [{ template: newOptions.footerTemplate }], true);
                }
            }
        },
        isFooterChanged(oldOptions, newOptions): boolean {
            if (
                // Подвал появился/скрылся
                (!oldOptions.footer && newOptions.footer) ||
                (oldOptions.footer && !newOptions.footer) ||
                (!oldOptions.footerTemplate && newOptions.footerTemplate) ||
                (oldOptions.footerTemplate && !newOptions.footerTemplate)
            ) {
                return true;
            } else if (
                // Подвала не было и нет
                !oldOptions.footer && !newOptions.footer &&
                !oldOptions.footerTemplate && !newOptions.footerTemplate
            ) {
                return false;
            } else {
                return false;
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
        _defaultItemTemplate: GridItemTemplate,
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
            if (cfg.headerInEmptyListVisible !== undefined) {
                this._listModel.setHeaderVisibility(cfg.headerInEmptyListVisible);
            }
            if (cfg.headerVisibility !== undefined) {
                this._listModel.setHeaderVisibility(cfg.headerVisibility);
            }

            // Коротко: если изменить опцию модели пока gridView не построена, то они и не применятся.
            // Подробнее: GridView управляет почти всеми состояниями модели. GridControl создает модель и отдает ее
            // в GridView через BaseControl. BaseControl занимается обработкой ошибок, в том
            // числе и разрывом соединения с сетью. При разрыве соединения BaseControl уничтожает GridView и показывает ошибку.
            // Если во время, пока GridView разрушена изменять ее опции, то это не приведет ни к каким реакциям.
            this._listModel.setColumnScroll(cfg.columnScroll, true);
            this._listModel.setColumns(cfg.columns, true);
            this._listModel.setHeader(cfg.header, true);

            if (cfg.footer || cfg.footerTemplate) {
                this._listModel.setFooter(cfg.footer || [{ template: cfg.footerTemplate }], true);
            }

            this._horizontalPositionChangedHandler = this._horizontalPositionChangedHandler.bind(this);

            // При прокидывании функции через шаблон и последующем вызове, она вызывается с областью видимости шаблона, а не контрола.
            // https://online.sbis.ru/opendoc.html?guid=756c49a6-13da-4e54-9333-fdd7a7fb6461
            this._prepareColumnsForEmptyEditingTemplate = this._prepareColumnsForEmptyEditingTemplate.bind(this);

            if (cfg.columnScroll && cfg.columnScrollStartPosition === 'end' && GridLayoutUtil.isFullGridSupport()) {
                // В таблице с горизонтальным скроллом изначально прокрученным в конец используется фейковая таблица.
                // Т.к. для отрисовки горизонтального скролла требуется знать размеры таблицы, инициализация горизонтального скролла
                // происходит на afterMount, который не вызывается на сервере. Чтобы измежать скачка, при оживлении таблицы с
                // прокрученными в конец колонками, на сервере строится фейковая таблица, состаящая из двух гридов.
                // Первый - фиксированные колонки, абсолютный блок, прижат к левому краю релативной обертки.
                // Второй - все остальные колонки, абсолютный блок, прижат к правому краю релативной обертки.
                // При построении настоящая таблица скрывается с помощью visibility и строится в обыччном порядке.
                // Затем проскроливается вконец и только после этого заменяет фейковую.
                // preventServerSideColumnScroll - запрещает построение с помощью данного механизма. Нужно например при поиске, когда
                // таблица перемонтируется. Простая проверка на window нам не подходит, т.к. нас интересует только первая отрисовка view
                // списочного контрола.
                this._showFakeGridWithColumnScroll = !cfg.preventServerSideColumnScroll;
            }

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
            const isColumnsScrollChanged = this._options.columnScroll !== newCfg.columnScroll;

            if (this._options.headerInEmptyListVisible !== newCfg.headerInEmptyListVisible) {
                if (this._listModel) {
                    this._listModel.setHeaderVisibility(newCfg.headerInEmptyListVisible);
                }
            }
            if (this._options.headerVisibility !== newCfg.headerVisibility) {
                if (this._listModel) {
                    this._listModel.setHeaderVisibility(newCfg.headerVisibility);
                }
            }
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
            if (this._options.multiSelectVisibility !== newCfg.multiSelectVisibility) {
                this._columnScrollController?.setMultiSelectVisibility(newCfg.multiSelectVisibility, true);
            }
            if (this._options.needShowEmptyTemplate !== newCfg.needShowEmptyTemplate) {
                this._columnScrollController?.setIsEmptyTemplateShown(newCfg.needShowEmptyTemplate);
            }

            // В зависимости от columnScroll вычисляются значения колонок для stickyHeader в методе setHeader.
            if (isColumnsScrollChanged) {
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
            if (isColumnsScrollChanged ||
                !GridIsEqualUtil.isEqualWithSkip(this._options.header, newCfg.header, { template: true })) {
                this._listModel.setHeader(newCfg.header);
            }

            if (!self._columnsHaveBeenChanged && (_private.isFooterChanged(this._options, newCfg) || (this._options.multiSelectVisibility !== newCfg.multiSelectVisibility))) {
                this._listModel.setFooter(newCfg.footer || [{ template: newCfg.footerTemplate }]);
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

        resizeNotifyOnListChanged(): void {
            GridView.superclass.resizeNotifyOnListChanged.apply(this, arguments);

            // TODO: Проверить https://online.sbis.ru/opendoc.html?guid=a768cb95-9c30-4f75-b1fb-9182228e5550 #rea_columnnScroll
            if (this._isFullMounted && this._options.columnScroll) {
                const columnScrollStatus = _private.actualizeColumnScroll(this, this._options);
                if (columnScrollStatus === 'actual') {
                    this._columnScrollController.updateSizes((newSizes) => {
                        this._saveColumnScrollSizes(newSizes);
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
            if (this._listModel.isSupportLadder(this._options.ladderProperties)) {
                classes.add('controls-Grid_support-ladder')
            }
            return classes.compile();
        },

        _getGridViewStyles(): string {
            let styles = '';
            if (GridLayoutUtil.isFullGridSupport()) {
                const hasMultiSelect = this._options.multiSelectVisibility !== 'hidden' && this._options.multiSelectPosition === 'default';
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
                this._notify('itemClick', [item, e, this._getCellIndexByEventTarget(e)]);
            }
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

        _onViewMouseEnter: function() {
            // При загрузке таблицы с проскроленным в конец горизонтальным скролом следует оживить таблицу при
            // вводе в нее указателя мыши, но после отрисовки thumb'а (скрыт через visibility) во избежание скачков
            if (this._showFakeGridWithColumnScroll) {
                if (this._canShowRealGridWithColumnScroll) {
                    this._showFakeGridWithColumnScroll = false;
                }
                this._canShowRealGridWithColumnScroll = true;
            }
        },

        _onItemMouseLeave: function() {
            GridView.superclass._onItemMouseLeave.apply(this, arguments);
            _private.setHoveredCell(this, null, null);
        },

        /* COLUMN SCROLL */
        _isColumnScrollVisible(): boolean {
            if (this._columnScrollController && this._columnScrollController.isVisible()) {
                const items = this._options.listModel.getItems();
                return this._options.headerInEmptyListVisible || (!!items && (!!items.getCount() || !!this._options.listModel.isEditing()));
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

        _setHorizontalScrollPosition(value: number): void {
            if (this._horizontalScrollPosition !== value) {
                this._horizontalScrollPosition = value;
            }
            this._children.horizontalScrollWrapper?.setPosition(value);
        },

        // Не вызывает реактивную перерисовку, т.к. данные пишутся в поля объекта. Перерисовка инициируется обновлением позиции скрола.
        _updateColumnScrollShadowClasses(options = this._options): void {
            const newStart = this._getColumnScrollShadowClasses(options, 'start');
            const newEnd = this._getColumnScrollShadowClasses(options, 'end');

            if (!this._columnScrollShadowClasses) {
                this._columnScrollShadowClasses = {};
            }
            if (
                this._columnScrollShadowClasses.start !== newStart ||
                this._columnScrollShadowClasses.end !== newEnd
            ) {
                this._columnScrollShadowClasses = {
                    start: newStart,
                    end: newEnd
                };
            }
        },

        _getColumnScrollShadowClasses(options, position: 'start' | 'end'): string {
            if (this._showFakeGridWithColumnScroll && options.columnScrollStartPosition === 'end') {
                let classes = '';
                if (options.multiSelectVisibility !== 'hidden' && options.multiSelectPosition !== 'custom') {
                    classes += `controls-Grid__ColumnScroll__shadow_withMultiselect_theme-${options.theme} `;
                }
                return classes + ColumnScroll.getShadowClasses({
                    position,
                    isVisible: position === 'start',
                    theme: options.theme,
                    backgroundStyle: options.backgroundStyle,
                    needBottomPadding: options.needBottomPadding
                });
            }
            return this._columnScrollController.getShadowClasses(position);
        },

        // Не вызывает реактивную перерисовку, т.к. данные пишутся в поля объекта. Перерисовка инициируется обновлением позиции скрола.
        _updateColumnScrollShadowStyles(options = this._options): void {
            const newStart = this._getColumnScrollShadowStyles(options, 'start');
            const newEnd = this._getColumnScrollShadowStyles(options, 'end');

            if (!this._columnScrollShadowStyles) {
                this._columnScrollShadowStyles = {};
            }
            if (
                this._columnScrollShadowStyles.start !== newStart ||
                this._columnScrollShadowStyles.end !== newEnd
            ) {
                this._columnScrollShadowStyles = {
                    start: newStart,
                    end: newEnd
                };
            }
        },

        _getColumnScrollShadowStyles(options, position: 'start' | 'end'): string {
            if (this._showFakeGridWithColumnScroll && options.columnScrollStartPosition === 'end') {
                if (position === 'end') {
                    return '';
                }

                let offsetLeft = 0;

                for (let i = 0; i < options.columns.length && i < options.stickyColumnsCount; i++) {
                    if (!(options.columns[i].width && options.columns[i].width.indexOf('px') !== -1)) {

                    } else {
                        offsetLeft += Number.parseInt(options.columns[i].width);
                    }
                }

                return `left: ${offsetLeft}px; z-index: 5;`
            }
            return this._columnScrollController.getShadowStyles(position);
        },

        _horizontalPositionChangedHandler(e, newScrollPosition: number): void {
            this._columnScrollController.setScrollPosition(newScrollPosition);
            this._setHorizontalScrollPosition(this._columnScrollController.getScrollPosition());
            this._updateColumnScrollData();
        },
        _columnScrollWheelHandler(e): void {
            if (this._isColumnScrollVisible()) {
                this._columnScrollController.scrollByWheel(e);
                this._setHorizontalScrollPosition(this._columnScrollController.getScrollPosition());
                this._updateColumnScrollData();
            }
        },
        _updateColumnScrollData(): void {
            this._updateColumnScrollShadowClasses();
            this._updateColumnScrollShadowStyles();
            this._setHorizontalScrollPosition(this._columnScrollController.getScrollPosition());
            this._dragScrollController?.updateScrollData({
                scrollLength: this._columnScrollController.getScrollLength(),
                scrollPosition: this._horizontalScrollPosition
            });
        },
        _saveColumnScrollSizes(newSizes): void {
            this._contentSizeForHScroll = newSizes.contentSizeForScrollBar;
            this._horizontalScrollWidth = newSizes.scrollWidth;
            this._containerSize = newSizes.containerSize;
            this._fixedColumnsWidth = newSizes.fixedColumnsWidth;
            this._scrollableColumnsWidth = newSizes.scrollableColumnsWidth;
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
            const multiSelectOffset = this._options.multiSelectVisibility !== 'hidden' && this._options.multiSelectPosition === 'default' ? 1 : 0;
            return Array.prototype.slice.call(gridCells).indexOf(currentCell) - multiSelectOffset;
        },
        _resizeHandler(e): void {
            if (this._options.columnScroll) {
                const columnScrollStatus = _private.actualizeColumnScroll(this, this._options);
                if (columnScrollStatus === 'actual') {
                    this._columnScrollController.updateSizes((newSizes) => {
                        this._saveColumnScrollSizes(newSizes);
                        this._updateColumnScrollData();
                    });
                }
            }
        },
        _onFocusInEditingCell(e: SyntheticEvent<FocusEvent>): void {
            if (!this._isColumnScrollVisible() || e.target.tagName !== 'INPUT' || !this._options.listModel.isEditing()) {
                return;
            }
            this._columnScrollController.scrollToElementIfHidden(e.target as HTMLElement);
            this._updateColumnScrollData();
        },
        _onNewHorizontalPositionRendered(e, newPosition) {
            e.stopPropagation();

            // При загрузке таблицы с проскроленным в конец горизонтальным скролом следует оживить таблицу при
            // вводе в нее указателя мыши, но после отрисовки thumb'а (скрыт через visibility) во избежание скачков
            if (this._showFakeGridWithColumnScroll && newPosition !== 0) {
                if (this._context?.isTouch?.isTouch || this._canShowRealGridWithColumnScroll) {
                    this._showFakeGridWithColumnScroll = false;
                }
                this._canShowRealGridWithColumnScroll = true;
            }
        },
        _startDragScrolling(e, startBy: 'mouse' | 'touch'): void {
            if (this._isColumnScrollVisible() && this._dragScrollController) {
                let isGrabbing: boolean;
                if (startBy === 'mouse') {
                    isGrabbing = this._dragScrollController.onViewMouseDown(e);
                } else {
                    // clientX - координата относительно документа, чтобы получить координату
                    // относиттельно начала списка, нужно учесть отступ самого списка
                    const touchClientX = e.nativeEvent.touches[0].clientX;
                    const containerLeft = this._children.columnScrollContainer.getBoundingClientRect().left;
                    if (!isInLeftSwipeRange(this._fixedColumnsWidth, this._scrollableColumnsWidth, touchClientX - containerLeft)) {
                        isGrabbing = this._dragScrollController.onViewTouchStart(e);
                    } else {
                        this._leftSwipeCanBeStarted = true;
                    }
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
                    if (startBy === 'touch') {
                        this._notify('closeSwipe', []);
                    }
                    this._columnScrollController.setScrollPosition(newPosition);
                    this._setHorizontalScrollPosition(this._columnScrollController.getScrollPosition());
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
                    this._leftSwipeCanBeStarted = false;
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
            this._leftSwipeCanBeStarted = false;
        },
        _onDragScrollOverlayMouseLeave(e) {
            this._dragScrollController?.onOverlayMouseLeave(e);
        },
        _onItemSwipe(event, itemData) {
            const direction = event.nativeEvent.direction;
            if (direction === 'top' || direction === 'bottom') {
                return;
            }

            event.stopPropagation();
            if (this._isColumnScrollVisible() && this._dragScrollController) {
                if (event.target.closest(`.${COLUMN_SCROLL_JS_SELECTORS.FIXED_ELEMENT}`)) {
                    // По фиксированной колонке допустим только свайп вправо
                    if (event.nativeEvent.direction === 'right') {
                        this._notify('itemSwipe', [itemData, event]);
                    }
                } else {
                    // Отличие настоящего свайпа от скроллирования условное.
                    // Если свайп берет начало от определенной области в правой границе скроллируемой
                    // области, то это свайп, иначе - скроллирование.
                    // В скроллируемой области допустим только левфй свайп.
                    if (this._leftSwipeCanBeStarted && event.nativeEvent.direction === 'left') {
                        this._notify('itemSwipe', [itemData, event]);
                    }
                }
            } else {
                this._notify('itemSwipe', [itemData, event]);
            }

            this._leftSwipeCanBeStarted = false;
        },

        _prepareColumnsForEmptyEditingTemplate(columns, topSpacing, bottomSpacing) {
            return prepareEmptyEditingColumns({
                gridColumns: this._options.columns,
                emptyTemplateSpacing: {
                    top: topSpacing,
                    bottom: bottomSpacing
                },
                isFullGridSupport: GridLayoutUtil.isFullGridSupport(),
                hasMultiSelect: this._options.multiSelectVisibility !== 'hidden' && this._options.multiSelectPosition === 'default',
                colspanColumns: columns.map((c) => ({...c, startColumn: c.startIndex, endColumn: c.endIndex})),
                itemPadding: this._options.itemPadding || {},
                theme: this._options.theme,
                editingBackgroundStyle: (this._options.editingConfig ? this._options.editingConfig.backgroundStyle : 'default')
            });
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
