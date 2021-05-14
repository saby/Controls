import { ListView } from 'Controls/list';
import { TemplateFunction } from 'UI/Base';
import { TouchContextField as isTouch } from 'Controls/context';
import { Logger} from 'UI/Utils';
import { GridCollection, GridRow, GridLadderUtil, GridLayoutUtil, isFullGridSupport } from 'Controls/display';
import * as GridTemplate from 'wml!Controls/_grid/Render/grid/GridView';
import * as GridItem from 'wml!Controls/_grid/Render/grid/Item';
import * as GroupTemplate from 'wml!Controls/_grid/Render/GroupCellContentWithRightTemplate';
import { Model } from 'Types/entity';
import { SyntheticEvent } from 'Vdom/Vdom';
import ColumnScrollViewController, {COLUMN_SCROLL_JS_SELECTORS} from './ViewControllers/ColumnScroll';
import { _Options } from 'UI/Vdom';
import 'css!Controls/grid';
import 'css!Controls/CommonClasses';

const GridView = ListView.extend({
    _template: GridTemplate,
    _hoveredCellIndex: null,
    _hoveredCellItem: null,
    _groupTemplate: GroupTemplate,
    _isFullMounted: false,

    _columnScrollViewController: null,
    _isColumnScrollUpdateFrozen: false,
    _columnScrollWrapperClasses: '',
    _columnScrollContentClasses: '',
    _dragScrollOverlayClasses: '',
    _columnScrollShadowClasses: '',
    _contentSizeForHScroll: 0,
    _horizontalScrollWidth: 0,
    _fixedColumnsWidth: 0,
    _scrollableColumnsWidth: 0,

    _beforeMount(options): void {
        let result = GridView.superclass._beforeMount.apply(this, arguments);

        if (options.columnScroll && options.columnScrollStartPosition === 'end' && isFullGridSupport()) {
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
            // TODO: Включить по задаче https://online.sbis.ru/opendoc.html?guid=07aaefb8-3790-4e8b-bd58-6ac7613a1c8b
            this._showFakeGridWithColumnScroll = false && !options.preventServerSideColumnScroll;
        }

        if (options.columnScroll) {
            this._createColumnScroll(options);
        }

        if (options.footerTemplate || options.footer) {
            this._listModel.setFooter(options.footerTemplate, options.footer, true);
        }

        return result;
    },

    _afterMount(): void {
        GridView.superclass._afterMount.apply(this, arguments);
        if (this._options.columnScroll) {
            this._actualizeColumnScroll(this._options);
        }
        this._isFullMounted = true;
    },

    _applyChangedOptionsToModel(listModel, options, changes): void {
        if (changes.includes('columns')) {
            // Если колонки изменились, например, их кол-во, а данные остались те же, то
            // то без перерисовки мы не можем корректно отобразить данные в новых колонках.
            // правка конфликтует с https://online.sbis.ru/opendoc.html?guid=a8429971-3a3c-44d0-8cca-098887c9c717
            listModel.setColumns(options.columns, false);
        }

        if (changes.includes('footer')) {
            listModel.setFooter(options.footerTemplate, options.footer);
        }

        if (changes.includes('header')) {
            listModel.setHeader(options.header);
        }

        if (changes.includes('headerVisibility')) {
            listModel.setHeaderVisibility(options.headerVisibility);
        }

        if (changes.includes('columnScroll')) {
            listModel.setColumnScroll(options.columnScroll);
        }

        if (changes.includes('resultsPosition')) {
            listModel.setResultsPosition(options.resultsPosition);
        }
    },

    _applyChangedOptions(newOptions, oldOptions, changes): void {
        this._doAfterUpdate(() => {
            this._isColumnScrollUpdateFrozen = false;
            this._actualizeColumnScroll(newOptions, oldOptions);
        });
    },

    _applyNewOptionsAfterReload(oldOptions, newOptions): void {
        const changes = [];

        const changedOptions = _Options.getChangedOptions(newOptions, this._options);

        if (changedOptions) {
            if (changedOptions.hasOwnProperty('footer') || changedOptions.hasOwnProperty('footerTemplate')) {
                changes.push('footer');
            }
            if (changedOptions.hasOwnProperty('header')) {
                changes.push('header');
            }
            if (changedOptions.hasOwnProperty('headerVisibility')) {
                changes.push('headerVisibility');
            }
            if (changedOptions.hasOwnProperty('columns')) {
                changes.push('columns');
            }
            if (changedOptions.hasOwnProperty('columnScroll')) {
                changes.push('columnScroll');
            }
            if (changedOptions.hasOwnProperty('dragScrolling')) {
                changes.push('dragScrolling');
            }
            if (changedOptions.hasOwnProperty('resultsPosition')) {
                changes.push('resultsPosition');
            }
            if (changedOptions.hasOwnProperty('items')) {
                changes.push('items');
            }
        }

        if (changes.length) {
            // Набор колонок необходимо менять после перезагрузки. Иначе возникает ошибка, когда список
            // перерисовывается с новым набором колонок, но со старыми данными. Пример ошибки:
            // https://online.sbis.ru/opendoc.html?guid=91de986a-8cb4-4232-b364-5de985a8ed11
            this._isColumnScrollUpdateFrozen = true;
            this._doAfterReload(() => {
                this._applyChangedOptions(newOptions, oldOptions, changes);
                this._applyChangedOptionsToModel(this._listModel, newOptions, changes);
            });
        } else if (!this._isColumnScrollUpdateFrozen) {
            this._doAfterUpdate(() => {
                this._actualizeColumnScroll(newOptions, oldOptions);
            });
        }
    },

    _beforeUpdate(newOptions): void {
        GridView.superclass._beforeUpdate.apply(this, arguments);

        this._applyNewOptionsAfterReload(this._options, newOptions);

        if (newOptions.sorting !== this._options.sorting) {
            this._listModel.setSorting(newOptions.sorting);
        }

        if (this._options.columnSeparatorSize !== newOptions.columnSeparatorSize) {
            this._listModel.setColumnSeparatorSize(newOptions.columnSeparatorSize);
        }

        if (this._options.rowSeparatorSize !== newOptions.rowSeparatorSize) {
            this._listModel.setRowSeparatorSize(newOptions.rowSeparatorSize);
        }
    },

    _beforeUnmount(): void {
        GridView.superclass._beforeUnmount.apply(this, arguments);
        if (this._columnScrollViewController) {
            this._destroyColumnScroll();
        }
    },

    getListModel(): GridCollection<any> {
        return this._listModel;
    },

    _resolveItemTemplate(options): TemplateFunction {
        return options.itemTemplate || this._resolveBaseItemTemplate(options);
    },

    _resolveBaseItemTemplate(options): TemplateFunction {
        return GridItem;
    },
    _getGridTemplateColumns(options): string {
        // todo Вынести расчёт на viewModel: https://online.sbis.ru/opendoc.html?guid=09307163-7edb-4423-999d-525271e05586
        // тогда метод можно покрыть нормально юнитом и проблемы с актуализацией колонок на самом grid-элементе не будет
        const columns = this._listModel ? this._listModel.getColumnsConfig() : options.columns;
        const hasMultiSelect = options.multiSelectVisibility !== 'hidden' && options.multiSelectPosition !== 'custom';

        if (!options.columns) {
            Logger.warn('You must set "columns" option to make grid work correctly!', this);
            return '';
        }
        const initialWidths = columns.map(((column) => column.width || GridLayoutUtil.getDefaultColumnWidth()));
        let columnsWidths: string[] = [];
        columnsWidths = initialWidths;
        const ladderStickyColumn = GridLadderUtil.getStickyColumn({
            columns
        });
        if (ladderStickyColumn) {
            if (ladderStickyColumn.property.length === 2) {
                columnsWidths.splice(1, 0, '0px');
            }
            columnsWidths = ['0px'].concat(columnsWidths);
        }
        if (hasMultiSelect) {
            columnsWidths = ['max-content'].concat(columnsWidths);
        }

        // Дополнительная колонка для отображения застиканных операций над записью при горизонтальном скролле.
        // Если в списке нет данных, дополнительная колонка не нужна, т.к. операций над записью точно нет.
        if (isFullGridSupport() && !!options.columnScroll && options.itemActionsPosition !== 'custom' && this._listModel.getCount()) {
            columnsWidths.push('0px');
        }

        return GridLayoutUtil.getTemplateColumnsStyle(columnsWidths);
    },

    _getGridViewWrapperClasses(): string {
        return `${this._columnScrollWrapperClasses} ${this.isColumnScrollVisible() ? COLUMN_SCROLL_JS_SELECTORS.COLUMN_SCROLL_VISIBLE : ''}`
    },

    _getGridViewClasses(options): string {
        let classes = `controls-Grid controls-Grid_${options.style}`;
        if (GridLadderUtil.isSupportLadder(options.ladderProperties)) {
            classes += ' controls-Grid_support-ladder';
        }

        if (options.itemActionsPosition === 'outside' &&
            !this._listModel.getFooter() &&
            !(this._listModel.getResults() && this._listModel.getResultsPosition() === 'bottom')
        ) {
            classes += ` controls-GridView__paddingBottom__itemActionsV_outside`;
        }

        classes += ` ${this._columnScrollContentClasses}`;
        return classes;
    },

    _getGridViewStyles(options): string {
        return this._getGridTemplateColumns(options);
    },

    _isEmpty(): boolean {
        return this._options.needShowEmptyTemplate;
    },

    _onItemClick(e, dispItem): boolean {
        // Флаг preventItemEvent выставлен, если нужно предотвратить возникновение
        // событий itemClick, itemMouseDown по нативному клику, но по какой-то причине
        // невозможно остановить всплытие события через stopPropagation
        // TODO: Убрать, preventItemEvent когда это больше не понадобится
        // https://online.sbis.ru/doc/cefa8cd9-6a81-47cf-b642-068f9b3898b7
        if (!e.preventItemEvent) {
            const contents = dispItem.getContents();
            if (dispItem['[Controls/_display/GroupItem]']) {
                this._notify('groupClick', [contents, e, dispItem], {bubbling: true});
                return;
            }
            this._notify('itemClick', [contents, e, this._getCellIndexByEventTarget(e)]);
        }
    },

    _onHeaderRowClick(event: SyntheticEvent): void {
        const target = event.target as HTMLElement;
        const headerRow = this._listModel.getHeader();

        // Если шапка зафиксирована, то нужно прокинуть событие arrowClick при клике по шеврону,
        // иначе оно не дойдет до прикладников
        if (headerRow.isSticked() && target.closest('.js-BreadCrumbsPath__backButtonArrow')) {
            event.stopImmediatePropagation();
            this._notify('arrowClick', []);
            return;
        }
    },

    _onEditingItemClick(e, dispItem, nativeEvent): void {
        e.stopImmediatePropagation();
        if (this._listModel.getEditingConfig()?.mode === 'cell') {
            const columnIndex = this._getCellIndexByEventTarget(nativeEvent);
            if (dispItem.getEditingColumnIndex() !== columnIndex) {
                this._notify('itemClick', [dispItem.getContents(), nativeEvent, columnIndex]);
            }
        }
    },

    _onItemMouseMove(event, collectionItem) {
        GridView.superclass._onItemMouseMove.apply(this, arguments);
        this._setHoveredCell(collectionItem.item, event.nativeEvent);
    },

    _onItemMouseLeave() {
        GridView.superclass._onItemMouseLeave.apply(this, arguments);
        this._setHoveredCell(null, null);
    },

    _onEditArrowClick(event: SyntheticEvent, row: GridRow<Model>): void {
        this._notify('editArrowClick', [row.getContents()]);
        event.stopPropagation();
    },

    _getCellIndexByEventTarget(event): number {
        if (!event) {
            return null;
        }
        const target = this._getCorrectElement(event.target);

        const gridRow = target.closest('.controls-Grid__row');
        if (!gridRow) {
            return null;
        }
        const gridCells = gridRow.querySelectorAll('.controls-Grid__row-cell');
        const currentCell = this._getCellByEventTarget(target);
        const multiSelectOffset = this._options.multiSelectVisibility !== 'hidden' ? 1 : 0;
        return Array.prototype.slice.call(gridCells).indexOf(currentCell) - multiSelectOffset;
    },

    _getCorrectElement(element: HTMLElement): HTMLElement {
        // В FF целью события может быть элемент #text, у которого нет метода closest, в этом случае рассматриваем как
        // цель его родителя.
        if (element && !element.closest && element.parentElement) {
            return element.parentElement;
        }
        return element;
    },

    _getCellByEventTarget(target: HTMLElement): HTMLElement {
        return target.closest('.controls-Grid__row-cell') as HTMLElement;
    },

    _setHoveredCell(item, nativeEvent): void {
        const hoveredCellIndex = this._getCellIndexByEventTarget(nativeEvent);
        if (item !== this._hoveredCellItem || hoveredCellIndex !== this._hoveredCellIndex) {
            this._hoveredCellItem = item;
            this._hoveredCellIndex = hoveredCellIndex;
            let container = null;
            let hoveredCellContainer = null;
            if (nativeEvent) {
                const target = this._getCorrectElement(nativeEvent.target);
                container = target.closest('.controls-ListView__itemV');
                hoveredCellContainer = this._getCellByEventTarget(target);
            }
            this._notify('hoveredCellChanged', [item, container, hoveredCellIndex, hoveredCellContainer]);
        }
    },

    _onWrapperMouseEnter: function() {
        // При загрузке таблицы с проскроленным в конец горизонтальным скролом следует оживить таблицу при
        // вводе в нее указателя мыши, но после отрисовки thumb'а (скрыт через visibility) во избежание скачков
        if (this._showFakeGridWithColumnScroll) {
            this._showFakeGridWithColumnScroll = false;
        }
    },

    //#region COLUMN SCROLL

    resetColumnScroll(): void {
        this._columnScrollViewController?.reset();
    },

    isColumnScrollVisible(): boolean {
        return !!this._columnScrollViewController?.isVisible() && (
            !!this._listModel.getCount() ||
            this._listModel.isEditing() ||
            this._options.headerVisibility === 'visible' ||
            this._options.headerInEmptyListVisible === true
        );
    },

    _getHorizontalScrollBarStyles(): string {
        if (!this.isColumnScrollVisible()) {
            this._horizontalScrollWidth = 0;
            return 'display: none;';
        }
        return this._columnScrollViewController.getScrollBarStyles(this._options, GridLadderUtil.stickyLadderCellsCount(
            this._listModel.getColumnsConfig(),
            this._options.stickyColumn,
            this._listModel.getDraggableItem()
        ));
    },

    _createColumnScroll(options): ColumnScrollViewController {
        const stickyLadderCellsCount = GridLadderUtil.stickyLadderCellsCount(
            this._options.columns,
            this._options.stickyColumn,
            this._listModel.getDraggableItem()
        );
        this._columnScrollViewController = new ColumnScrollViewController({
            ...options,
            hasMultiSelectColumn: options.multiSelectVisibility !== 'hidden' && options.multiSelectPosition !== 'custom',
            stickyLadderCellsCount,
            isActivated: !this._showFakeGridWithColumnScroll,
            onOverlayChangedCallback: (newState) => {
                if (newState) {
                    this._applyColumnScrollChanges();
                }
            }
        });
    },

    _destroyColumnScroll(): void {
        this._columnScrollViewController.destroy();
        this._columnScrollViewController = null;
        this._columnScrollWrapperClasses = '';
        this._columnScrollContentClasses = '';
        this._dragScrollOverlayClasses = '';
        this._columnScrollShadowClasses = {start: '', end: ''};
        this._containerSize = 0;
        this._contentSizeForHScroll = 0;
        this._horizontalScrollWidth = 0;
        this._fixedColumnsWidth = 0;
        this._scrollableColumnsWidth = 0;
    },

    _actualizeColumnScroll(newOptions, oldOptions = newOptions) {
        if (!newOptions.columnScroll && !this._columnScrollViewController) {
            return;
        }
        if (!this._columnScrollViewController) {
            if (ColumnScrollViewController.shouldDrawColumnScroll(
                this._children.gridWrapper as HTMLElement,
                this._children.grid,
                newOptions.isFullGridSupport
            )) {
                this._createColumnScroll(newOptions);
            } else {
                return;
            }
        } else if (this._columnScrollViewController.updateControllers(newOptions) === 'columnScrollDisabled') {
            this._destroyColumnScroll();
            return;
        }

        const getHasMultiSelectColumn = (options) => options.multiSelectVisibility !== 'hidden' && options.multiSelectPosition !== 'custom';
        const oldUpdateOptions = {
            ...oldOptions, hasMultiSelectColumn: getHasMultiSelectColumn(oldOptions)
        };
        const newUpdateOptions = {
            ...newOptions,
            scrollBar: this._children.horizontalScrollBar,
            containers: {
                header: this._children.header || this._children.results,
                wrapper: this._children.gridWrapper as HTMLElement,
                content: this._children.grid as HTMLElement,
                styles: this._children.columnScrollStylesContainer as HTMLStyleElement
            },
            hasMultiSelectColumn: getHasMultiSelectColumn(newOptions),
            isActivated: !this._showFakeGridWithColumnScroll
        };

        return this._columnScrollViewController.actualizeColumnScroll(newUpdateOptions, oldUpdateOptions, (status) => {
            this._applyColumnScrollChanges(status);
        });
    },

    _applyColumnScrollChanges(status): void {
        if (status === 'actual') {
            return;
        }
        if (status === 'destroyed') {
            this._destroyColumnScroll();
            return;
        }
        this._columnScrollWrapperClasses = this._columnScrollViewController.getClasses('wrapper');
        this._columnScrollContentClasses = this._columnScrollViewController.getClasses('content');
        this._dragScrollOverlayClasses = this._columnScrollViewController.getClasses('overlay');

        const params = { needBottomPadding: this._options.needBottomPadding };
        const start = this._columnScrollViewController.getClasses('shadowStart', params);
        const end = this._columnScrollViewController.getClasses('shadowEnd', params);

        if (this._columnScrollShadowClasses?.start !== start || this._columnScrollShadowClasses?.end !== end) {
            this._columnScrollShadowClasses = { start, end };
        }

        const sizes = this._columnScrollViewController.getSizes();
        this._containerSize = sizes.containerSize;
        this._contentSizeForHScroll = sizes.contentSizeForHScroll;
        this._horizontalScrollWidth = sizes.scrollWidth;
        this._fixedColumnsWidth = sizes.fixedColumnsWidth;
        this._scrollableColumnsWidth = sizes.scrollableColumnsWidth;
    },

    _onHorizontalPositionChangedHandler(e, newScrollPosition: number): void {
        if (this._columnScrollViewController && this.isColumnScrollVisible()) {
            this._columnScrollViewController.onPositionChanged(newScrollPosition);
            this._applyColumnScrollChanges();
        }
    },

    _onGridWrapperWheel(e) {
        if (this._columnScrollViewController && this.isColumnScrollVisible()) {
            this._columnScrollViewController.onScrollByWheel(e);
            this._applyColumnScrollChanges();
        }
    },

    _onScrollBarMouseUp(e) {
        e.stopPropagation();
        if (this._columnScrollViewController && this.isColumnScrollVisible()) {
            this._columnScrollViewController.onScrollEnded();
            this._applyColumnScrollChanges();
        }
    },

    _onStartDragScrolling(e, startBy: 'mouse' | 'touch'): void {
        // DragScrolling нужен только чтобы тащить скроллируемые колонки.
        if (e.target.closest(`.${COLUMN_SCROLL_JS_SELECTORS.SCROLLABLE_ELEMENT}`) &&
            this._columnScrollViewController && this.isColumnScrollVisible()) {
            this._columnScrollViewController?.startDragScrolling(e, startBy);
            this._applyColumnScrollChanges();
        }
    },

    _onMoveDragScroll(e, startBy: 'mouse' | 'touch') {
        if (this._columnScrollViewController && this.isColumnScrollVisible()) {
            const oldPosition = this._columnScrollViewController.getScrollPosition();
            const newPosition = this._columnScrollViewController.moveDragScroll(e, startBy);

            if (oldPosition !== newPosition) {
                this._applyColumnScrollChanges();
            }
        }
    },

    _onStopDragScrolling(e, startBy: 'mouse' | 'touch') {
        if (this._columnScrollViewController && this.isColumnScrollVisible()) {
            this._columnScrollViewController?.stopDragScrolling(e, startBy);
            this._applyColumnScrollChanges();
        }
    },

    _resizeHandler(): void {
        if (this._columnScrollViewController && this.isColumnScrollVisible()) {
            this._actualizeColumnScroll(this._options);
        }
    },

    _onFocusIn(e: SyntheticEvent): void {
        const target = e.target as HTMLElement;
        if (!this.isColumnScrollVisible()
            || !(e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')
            || !this._listModel.isEditing()
            || !!target.closest(`.${COLUMN_SCROLL_JS_SELECTORS.FIXED_ELEMENT}`)) {
            return;
        }
        let targetRect;
        if (this._listModel.getEditingConfig()?.mode === 'cell') {
            targetRect = (target.closest('.controls-Grid__row-cell') || target).getBoundingClientRect();
        } else {
            targetRect = target.getBoundingClientRect();
        }
        this._columnScrollViewController.scrollToElementIfHidden(targetRect);
        this._applyColumnScrollChanges();
    }

    //#endregion
});

GridView.contextTypes = () => {
    return {
        isTouch
    };
};

export default GridView;
