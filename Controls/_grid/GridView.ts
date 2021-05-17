import { ListView } from 'Controls/list';
import { TemplateFunction } from 'UI/Base';
import { TouchContextField as isTouch } from 'Controls/context';
import { Logger} from 'UI/Utils';
import { GridCollection, GridRow, GridLadderUtil, GridLayoutUtil } from 'Controls/display';
import * as GridTemplate from 'wml!Controls/_grid/Render/grid/GridView';
import * as GridItem from 'wml!Controls/_grid/Render/grid/Item';
import * as GroupTemplate from 'wml!Controls/_grid/Render/GroupCellContentWithRightTemplate';
import { Model } from 'Types/entity';
import { SyntheticEvent } from 'Vdom/Vdom';

import {ColumnScrollViewMixin} from './ViewMixins/ColumnScrollViewMixin';

import { _Options } from 'UI/Vdom';
import {getDimensions} from 'Controls/sizeUtils';
import {Guid} from 'Types/entity';
import 'css!Controls/grid';
import 'css!Controls/CommonClasses';

const GridView = ListView.extend([ColumnScrollViewMixin], {
    _template: GridTemplate,
    _hoveredCellIndex: null,
    _hoveredCellItem: null,
    _groupTemplate: GroupTemplate,

    _ladderOffsetSelector: '',

    _beforeMount(options): void {
        const result = GridView.superclass._beforeMount.apply(this, arguments);
        this._columnScrollOnViewBeforeMount(options);
        if (options.footerTemplate || options.footer) {
            this._listModel.setFooter(options.footerTemplate, options.footer, true);
        }
        this._ladderOffsetSelector = `controls-GridView__ladderOffset-${this._createGuid()}`;
        return result;
    },

    _componentDidMount(): void {
        GridView.superclass._componentDidMount.apply(this, arguments);
        this._columnScrollOnViewDidMount();
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

        if (changes.includes('ladderProperties')) {
            listModel.setLadderProperties(options.ladderProperties);
        }

        if (changes.includes('emptyTemplateColumns')) {
            listModel.setEmptyTemplateColumns(options.emptyTemplateColumns);
        }
    },

    /**
     * Перекрываем метод базового класса, который вызывается из _beforeUpdate.
     * Т.к. у нас своя модель и свои проверки.
     */
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
            if (changedOptions.hasOwnProperty('ladderProperties')) {
                changes.push('ladderProperties');
            }
            if (changedOptions.hasOwnProperty('emptyTemplateColumns')) {
                changes.push('emptyTemplateColumns');
            }
        }

        if (changes.length) {
            // Набор колонок необходимо менять после перезагрузки. Иначе возникает ошибка, когда список
            // перерисовывается с новым набором колонок, но со старыми данными. Пример ошибки:
            // https://online.sbis.ru/opendoc.html?guid=91de986a-8cb4-4232-b364-5de985a8ed11
            this._freezeColumnScroll();
            this._doAfterReload(() => {
                this._doOnComponentDidUpdate(() => {
                    this._unFreezeColumnScroll();
                });
                this._applyChangedOptionsToModel(this._listModel, newOptions, changes);
            });
        }
    },

    _beforeUpdate(newOptions): void {
        GridView.superclass._beforeUpdate.apply(this, arguments);
        this._columnScrollOnViewBeforeUpdate(newOptions);

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

        this._listModel.setColspanGroup(!newOptions.columnScroll || !this.isColumnScrollVisible());
    },

    _componentDidUpdate(oldOptions): void {
        GridView.superclass._componentDidUpdate.apply(this, arguments);
        this._columnScrollOnViewDidUpdate(oldOptions);
    },

    _beforeUnmount(): void {
        GridView.superclass._beforeUnmount.apply(this, arguments);
        this._columnScrollOnViewBeforeUnmount();
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

        // Во время днд отключаем лесенку, а контент отображаем принудительно с помощью visibility: visible
        if (ladderStickyColumn && !this._listModel.isDragging()) {
            if (ladderStickyColumn.property.length === 2) {
                columnsWidths.splice(1, 0, '0px');
            }
            columnsWidths = ['0px'].concat(columnsWidths);
        }
        if (hasMultiSelect) {
            columnsWidths = ['max-content'].concat(columnsWidths);
        }

        // Дополнительная колонка для отображения застиканных операций над записью при горизонтальном скролле.
        if (this._columnScrollHasItemActionsCell(options)) {
            columnsWidths.push('0px');
        }

        return GridLayoutUtil.getTemplateColumnsStyle(columnsWidths);
    },

    _createGuid(): string {
        return Guid.create();
    },

    _getLadderTopOffsetStyles(): string {
        if (!this._container) {
            return '';
        }
        let headerHeight = 0;
        let resultsHeight = 0;
        const header = this._container.getElementsByClassName('controls-Grid__header')[0] as HTMLElement;
        const results = this._container.getElementsByClassName('controls-Grid__results')[0] as HTMLElement;
        const hasTopResults = results && this._listModel.getResultsPosition() !== 'bottom';
        if (header) {
            headerHeight = getDimensions(header).height;
        }
        if (hasTopResults) {
            resultsHeight = getDimensions(results).height;
        }
        const ladderClass = `controls-Grid__row-cell__ladder-spacing${header ? '_withHeader' : ''}${hasTopResults ? '_withResults' : ''}`;
        return `.${this._ladderOffsetSelector} .${ladderClass} {` +
                  `top: calc(var(--item_line-height_l_grid) + ${headerHeight + resultsHeight}px) !important;}` +
                `.${this._ladderOffsetSelector} .${ladderClass}_withGroup {` +
                   `top: calc(var(--item_line-height_l_grid) + var(--grouping_height_list) + ${headerHeight + resultsHeight}px) !important;}`;

    },

    _getGridViewWrapperClasses(options): string {
        return `controls_list_theme-${options.theme} ${this._getColumnScrollWrapperClasses(options)}`;
    },

    _getGridViewClasses(options): string {
        let classes = `controls-Grid controls-Grid_${options.style}`;
        if (GridLadderUtil.isSupportLadder(options.ladderProperties)) {
            classes += ` controls-Grid_support-ladder ${this._ladderOffsetSelector}`;
        }

        if (options.itemActionsPosition === 'outside' &&
            !this._listModel.getFooter() &&
            !(this._listModel.getResults() && this._listModel.getResultsPosition() === 'bottom')
        ) {
            classes += ' controls-GridView__paddingBottom__itemActionsV_outside';
        }

        // Во время днд отключаем лесенку, а контент отображаем принудительно с помощью visibility: visible
        if (this._listModel.isDragging()) {
            classes += ' controls-Grid_dragging_process';
        }

        classes += ` ${this._getColumnScrollContentClasses(options)}`;
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

    _getStickyLadderCellsCount(options): number {
        return GridLadderUtil.stickyLadderCellsCount(
            options.columns,
            options.stickyColumn,
            this._listModel.isDragging()
        );
    },

    _onFocusIn(e: SyntheticEvent): void {
        // TODO: Подскрол горизонтального скролла
    }
});

GridView.contextTypes = () => {
    return {
        isTouch
    };
};

export default GridView;
