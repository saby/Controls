import { ListView } from 'Controls/list';
import { TemplateFunction } from 'UI/Base';
import { TouchContextField as isTouch } from 'Controls/context';
import { Logger} from 'UI/Utils';
import { GridCollection, GridRow, GridLadderUtil, GridLayoutUtil, isFullGridSupport } from 'Controls/display';
import * as GridTemplate from 'wml!Controls/_gridNew/Render/grid/GridView';
import * as GridItem from 'wml!Controls/_gridNew/Render/grid/Item';
import * as GroupTemplate from 'wml!Controls/_gridNew/Render/GroupCellContentWithRightTemplate';
import { Model } from 'Types/entity';
import { SyntheticEvent } from 'Vdom/Vdom';
import ColumnScrollViewController, {COLUMN_SCROLL_JS_SELECTORS} from './ViewControllers/ColumnScroll';
import { _Options } from 'UI/Vdom';

const GridView = ListView.extend({
    _template: GridTemplate,
    _hoveredCellIndex: null,
    _hoveredCellItem: null,
    _groupTemplate: GroupTemplate,
    _isFullMounted: false,

    _columnScrollViewController: null,
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
            this._columnScrollViewController = this._createColumnScroll(options);
        }

        if (options.footerTemplate || options.footer) {
            this._listModel.setFooter(options.footerTemplate, options.footer, true);
        }

        return result;
    },

    _afterMount(): void {
        GridView.superclass._afterMount.apply(this, arguments);
        this._actualizeColumnScroll({
            ...this._options,
            isOnMount: true
        }, this._options);
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
    },

    _applyNewOptionsAfterReload(oldOptions, newOptions): void {
        const changes = [];

        const changedOptions = _Options.getChangedOptions(newOptions, this._options);

        if (changedOptions) {
            if (changedOptions.footer || changedOptions.footerTemplate) {
                changes.push('footer');
            }
            if (changedOptions.header) {
                changes.push('header');
            }
            if (changedOptions.columns) {
                changes.push('columns');
            }
        }

        if (changes.length) {
            // Набор колонок необходимо менять после перезагрузки. Иначе возникает ошибка, когда список
            // перерисовывается с новым набором колонок, но со старыми данными. Пример ошибки:
            // https://online.sbis.ru/opendoc.html?guid=91de986a-8cb4-4232-b364-5de985a8ed11
            this._doAfterReload(() => {
                this._applyChangedOptionsToModel(this._listModel, newOptions, changes);
            });
        }
    },

    _beforeUpdate(newOptions): void {
        GridView.superclass._beforeUpdate.apply(this, arguments);

        this._applyNewOptionsAfterReload(this._options, newOptions);

        if (newOptions.sorting !== this._options.sorting) {
            this._listModel.setSorting(newOptions.sorting);
        }

        // Создание или разрушение контроллеров горизонтального скролла и скроллирования мышкой при изменении опций
        // columnScroll и dragScroll.
        if (this._columnScrollViewController) {
            const action = this._columnScrollViewController?.updateControllers(newOptions);
            if (action === 'columnScrollDisabled') {
                this._columnScrollViewController.destroy();
                this._applyColumnScrollChanges();
                this._columnScrollViewController = null;
            }
        } else if (newOptions.columnScroll) {
            this._columnScrollViewController = this._createColumnScroll(newOptions);
        }

        if (this._options.columnSeparatorSize !== newOptions.columnSeparatorSize) {
            this._listModel.setColumnSeparatorSize(newOptions.columnSeparatorSize);
        }

        if (this._options.rowSeparatorSize !== newOptions.rowSeparatorSize) {
            this._listModel.setRowSeparatorSize(newOptions.rowSeparatorSize);
        }
    },

    _afterUpdate(oldOptions): void {
        GridView.superclass._afterUpdate.apply(this, arguments);
        this._actualizeColumnScroll(this._options, oldOptions);
    },

    _beforeUnmount(): void {
        GridView.superclass._beforeUnmount.apply(this, arguments);
        if (this._columnScrollViewController) {
            this._columnScrollViewController.destroy();
            this._columnScrollViewController = null;
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
        if (isFullGridSupport() && !!options.columnScroll && options.itemActionsPosition && options.itemActionsPosition !== 'custom' && this._listModel.getCount()) {
            columnsWidths.push('0px');
        }

        return GridLayoutUtil.getTemplateColumnsStyle(columnsWidths);
    },

    _getGridViewWrapperClasses(): string {
        return `${this._columnScrollWrapperClasses} ${this.isColumnScrollVisible() ? COLUMN_SCROLL_JS_SELECTORS.COLUMN_SCROLL_VISIBLE : ''}`
    },

    _getGridViewClasses(options): string {
        let classes = `controls-Grid controls-Grid_${options.style}_theme-${options.theme}`;
        if (GridLadderUtil.isSupportLadder(options.ladderProperties)) {
            classes += ' controls-Grid_support-ladder';
        }

        if (options.itemActionsPosition === 'outside' &&
            !this._listModel.getFooter() &&
            !(this._listModel.getResults() && this._listModel.getResultsPosition() === 'bottom')
        ) {
            classes += ` controls-GridView__paddingBottom__itemActionsV_outside_theme-${options.theme}`;
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

    isColumnScrollVisible(): boolean {
        return !!this._columnScrollViewController?.isVisible() && (
            !!this._listModel.getCount() ||
            this._listModel.isEditing() ||
            this._options.headerVisibility === 'visible' ||
            this._options.headerInEmptyListVisible === true
        );
    },

    _getColumnScrollFakeShadowStyles(position: 'start' | 'end'): string {
        return this._columnScrollViewController.getColumnScrollFakeShadowStyles(position);
    },
    _getColumnScrollFakeShadowClasses(position: 'start' | 'end'): string {
        return this._columnScrollViewController.getColumnScrollFakeShadowClasses(position, {
            needBottomPadding: this._options.needBottomPadding
        });
    },

    _getHorizontalScrollBarStyles(): string {
        if (!(this._columnScrollViewController && this.isColumnScrollVisible())) {
            return 'display: none;';
        }
        return this._columnScrollViewController.getScrollBarStyles(GridLadderUtil.stickyLadderCellsCount(
            this._options.columns,
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
        return new ColumnScrollViewController({
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

    _actualizeColumnScroll(options, oldOptions) {
        return this._columnScrollViewController?.actualizeColumnScroll({
            ...options,
            scrollBar: this._children.horizontalScrollBar,
            containers: {
                header: this._children.header || this._children.results,
                wrapper: this._children.gridWrapper as HTMLElement,
                content: this._children.grid as HTMLElement,
                styles: this._children.columnScrollStylesContainer as HTMLStyleElement
            },
            hasMultiSelectColumn: options.multiSelectVisibility !== 'hidden' && options.multiSelectPosition !== 'custom',
            isActivated: !this._showFakeGridWithColumnScroll,
        }, oldOptions)?.then((result) => {
            if (result.status !== 'destroyed') {
                this._applyColumnScrollChanges();
            }
        });
    },

    _applyColumnScrollChanges() {
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
        if (this._columnScrollViewController && this.isColumnScrollVisible()) {
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
            this._actualizeColumnScroll(this._options, this._options);
        }
    }

    //#endregion
});

GridView._theme = ['Controls/grid', 'Controls/Classes'];

GridView.contextTypes = () => {
    return {
        isTouch
    };
};

export default GridView;
