import {TemplateFunction} from 'UI/Base';
import {BaseViewModel, ItemsUtil, ListViewModel} from 'Controls/list';
import * as GridLayoutUtil from 'Controls/_grid/utils/GridLayoutUtil';
import {Utils as stickyUtil} from 'Controls/scroll';
import * as LadderWrapper from 'wml!Controls/_grid/LadderWrapper';
import {detection} from 'Env/Env';
import {isEqual} from 'Types/object';
import {
    getBottomPaddingRowIndex,
    getFooterIndex,
    getIndexByDisplayIndex,
    getIndexById,
    getIndexByItem,
    getMaxEndRow,
    getResultsIndex,
    getRowsArray,
    getTopOffset,
    IBaseGridRowIndexOptions
} from 'Controls/_grid/utils/GridRowIndexUtil';
import cClone = require('Core/core-clone');
import ControlsConstants = require('Controls/Constants');
import collection = require('Types/collection');

const FIXED_HEADER_ZINDEX = 4;
const STICKY_HEADER_ZINDEX = 3;

interface IGridColumn {
    displayProperty?: string;
    template?: string | TemplateFunction;
    width?: string;
    compatibleWidth?: string;
}

interface IColgroupColumn {
    classes: string;
    style: string;
    index: number;
}

type GridColspanableElements = 'customResults' | 'fixedColumnOfColumnScroll' | 'scrollableColumnOfColumnScroll' | 'editingRow';

var
    _private = {
        calcItemColumnVersion: function(self, itemVersion, columnIndex, index) {
            let
                hasMultiselect = self._options.multiSelectVisibility !== 'hidden',
                version = `${itemVersion}_${self._columnsVersion}_${hasMultiselect ? columnIndex - 1 : columnIndex}`;

            version += _private.calcLadderVersion(self._ladder, index);

            return version;
        },
        isDrawActions: function(itemData, currentColumn, colspan) {
            return itemData.drawActions &&
                (itemData.getLastColumnIndex() === currentColumn.columnIndex ||
                colspan && currentColumn.columnIndex === (itemData.multiSelectVisibility === 'hidden' ? 0 : 1));
        },
        getCellStyle: function(itemData, currentColumn, colspan) {
           var
               style = '';
           if (currentColumn.styleForLadder) {
              style += currentColumn.styleForLadder;
           }
           if (colspan) {
                style += _private.getColspanStyles(
                   itemData.multiSelectVisibility,
                   currentColumn.columnIndex,
                   itemData.columns.length
                );
           }
           return style;
        },
        getColspan(itemData, isColspaned: boolean = false): number {
            if (!isColspaned) {
                return 1;
            }
            return itemData.columns.length - (itemData.multiSelectVisibility === 'hidden' ? 0 : 1);
        },

        //Google Chrome on winXP doesn't support colspan style, so we need to set colspan on <th> element
        getColspanForNoGridSupport(
            multiSelectVisibility: 'hidden' | 'visible' | 'onhover',

            // TODO: удалить isHeaderBreadCrumbs после https://online.sbis.ru/opendoc.html?guid=b3647c3e-ac44-489c-958f-12fe6118892f
            isHeaderBreadCrumbs: boolean = false
        ): number {
            let colspan = 1;
            if (multiSelectVisibility !== 'hidden' && isHeaderBreadCrumbs) {
                colspan = 2;
            }
            return colspan;
        },
        getColspanStyles(
           multiSelectVisibility: 'hidden' | 'visible' | 'onhover',
           columnIndex: number,
           columnsLength: number,

           // TODO: удалить isHeaderBreadCrumbs после https://online.sbis.ru/opendoc.html?guid=b3647c3e-ac44-489c-958f-12fe6118892f
           isHeaderBreadCrumbs: boolean = false,
           maxEndRow: number
        ): string {
            let
                multiselectOffset = (multiSelectVisibility === 'hidden' ? 0 : 1);

          if (columnIndex === multiselectOffset) {
              if (isHeaderBreadCrumbs) {
                 if (GridLayoutUtil.isNoGridSupport()) {
                    return ' colspan: 1;';
                 } else if (GridLayoutUtil.isPartialGridSupport()) {

                    // TODO: KINGO
                    // в edge, в отличие от ie воспринимаются стили grid-column, поэтому нужно для частичной поддержки грида задавать и их.
                    // перебивание стилей будет убрано по https://online.sbis.ru/opendoc.html?guid=a0c4964a-2474-4fb6-ab8c-ffab9db62dd0
                    return ` -ms-grid-column: ${multiselectOffset + 1}; -ms-grid-column-span: 1; grid-column: ${multiselectOffset + 1} / ${multiselectOffset + 2};`;
                 } else {
                    return ` grid-column: ${multiselectOffset + 1} / ${multiselectOffset + 2};` + ((maxEndRow > 2) ? ` grid-row: 1 / ${maxEndRow};` : '');
                 }
              } else {
                  if (GridLayoutUtil.isNoGridSupport()) {
                      return ` colspan: ${columnsLength - multiselectOffset};`;
                  } else if (GridLayoutUtil.isPartialGridSupport()) {
                      return ` grid-column: ${multiselectOffset + 1} / ${columnsLength + 1}; -ms-grid-column: ${multiselectOffset + 1}; -ms-grid-column-span: ${columnsLength - multiselectOffset};`;
                  } else {
                      return ` grid-column: ${multiselectOffset + 1} / ${columnsLength + 1};`;
                  }
              }
          }
        },
        getPaddingCellClasses: function(params, theme) {
            const { columns, columnIndex } = params;
            const { cellPadding } = columns[columnIndex];
            var
                preparedClasses = '';

            // Колонки
            if (params.multiSelectVisibility ? params.columnIndex > 1 : params.columnIndex > 0) {
                preparedClasses += (cellPadding && cellPadding.left ? ` controls-Grid__cell_spacingLeft_${cellPadding.left}` : ' controls-Grid__cell_spacingLeft') + `_theme-${theme}`;
            }
            if (params.columnIndex < params.columns.length - 1) {
                preparedClasses += (cellPadding && cellPadding.right ? ` controls-Grid__cell_spacingRight_${cellPadding.right}` : ' controls-Grid__cell_spacingRight') + `_theme-${theme}`;
            }

            // Отступ для первой колонки. Если режим мультиселект, то отступ обеспечивается чекбоксом.
            if (params.columnIndex === 0 && !params.multiSelectVisibility) {
                preparedClasses += ' controls-Grid__cell_spacingFirstCol_' + (params.itemPadding.left || 'default').toLowerCase() + `_theme-${theme}`;
            }

            // TODO: удалить isBreadcrumbs после https://online.sbis.ru/opendoc.html?guid=b3647c3e-ac44-489c-958f-12fe6118892f
            if (params.isBreadCrumbs) {
               preparedClasses += ' controls-Grid__cell_spacingFirstCol_null' + `_theme-${theme}`;
            }

            // Стиль колонки
            preparedClasses += ' controls-Grid__cell_' + (params.style || 'default');

            // Отступ для последней колонки
            if (params.columnIndex === params.columns.length - 1) {
                preparedClasses += ' controls-Grid__cell_spacingLastCol_' + (params.itemPadding.right || 'default').toLowerCase() + `_theme-${theme}`;
            }
            if (!params.isHeader && !params.isResult) {
                preparedClasses += ' controls-Grid__row-cell_rowSpacingTop_' + (params.itemPadding.top || 'default').toLowerCase() + `_theme-${theme}`;
                preparedClasses += ' controls-Grid__row-cell_rowSpacingBottom_' + (params.itemPadding.bottom || 'default').toLowerCase() + `_theme-${theme}`;
            }


            return preparedClasses;
        },

        getPaddingForCheckBox: function({ theme, itemPadding }) {
            let preparedClasses = '';
            preparedClasses += ' controls-Grid__row-cell_rowSpacingTop_' + (itemPadding.top || 'default').toLowerCase() + `_theme-${theme}`;
            preparedClasses += ' controls-Grid__row-cell_rowSpacingBottom_' + (itemPadding.bottom || 'default').toLowerCase() + `_theme-${theme}`;
            return preparedClasses;
        },

        getPaddingHeaderCellClasses: function(params, theme) {
            let preparedClasses = '';
            const { multiSelectVisibility, columnIndex, columns,
                rowIndex, itemPadding, isBreadCrumbs, style, maxEndColumn, cell: { endColumn } } = params;
            if (rowIndex === 0) {
                if (multiSelectVisibility ? columnIndex > 1 : columnIndex > 0) {
                    preparedClasses += ' controls-Grid__cell_spacingLeft' + `_theme-${theme}`;
                }
            } else {
                preparedClasses += ' controls-Grid__cell_spacingLeft' + `_theme-${theme}`;
            }

            if (columnIndex < columns.length - 1 || (maxEndColumn && endColumn < maxEndColumn)) {
                preparedClasses += ' controls-Grid__cell_spacingRight' + `_theme-${theme}`;
            }
            // Отступ для последней колонки
            const lastColClass = ' controls-Grid__cell_spacingLastCol_' + (itemPadding.right || 'default').toLowerCase() + `_theme-${theme}`;
            if (maxEndColumn) {
                // у мультихэдера последняя ячейка определяется по endColumn, а не по последнему элементу массива.
                if (maxEndColumn === endColumn) {
                    preparedClasses += lastColClass;
                }
            } else {
                if (columnIndex === columns.length - 1) {
                    preparedClasses += lastColClass;
                }
            }

            // Отступ для первой колонки. Если режим мультиселект, то отступ обеспечивается чекбоксом.
            if (columnIndex === 0 && !multiSelectVisibility && rowIndex === 0 && !isBreadCrumbs) {
                preparedClasses += ' controls-Grid__cell_spacingFirstCol_' + (itemPadding.left || 'default').toLowerCase() + `_theme-${theme}`;
            }

            // TODO: удалить isBreadcrumbs после https://online.sbis.ru/opendoc.html?guid=b3647c3e-ac44-489c-958f-12fe6118892f
            if (isBreadCrumbs) {
                preparedClasses += ' controls-Grid__cell_spacingFirstCol_null' + `_theme-${theme}`;
                if (params.multiSelectVisibility && !params.isTableLayout) {
                    preparedClasses += ' controls-Grid__cell_spacingBackButton_with_multiSelection' + `_theme-${theme}`;
                }
            }
            // Стиль колонки
            preparedClasses += ' controls-Grid__cell_' + (style || 'default');
            if (!params.isHeader) {
                preparedClasses += ' controls-Grid__row-cell_rowSpacingTop_' + (itemPadding.top || 'default').toLowerCase() + `_theme-${theme}`;
                preparedClasses += ' controls-Grid__row-cell_rowSpacingBottom_' + (itemPadding.bottom || 'default').toLowerCase() + `_theme-${theme}`;
            }

            return preparedClasses;
        },
        isLastItem: function(editingItem, rowCount, itemIndex) {
            if (editingItem && editingItem.index >= rowCount) {
                return itemIndex === editingItem.index;
            } else {
                return itemIndex === rowCount - 1;
            }
        },
        prepareRowSeparatorClasses: function(current, theme, editingItem) {
            let result = '';

            if (current.rowSeparatorVisibility) {
                const rowCount = current.dispItem.getOwner().getCount();
                if (current.isFirstInGroup && !current.isInHiddenGroup) {
                    result += ' controls-Grid__row-cell_first-row-in-group';
                } else {
                    if (current.index === 0) {
                        result += ' controls-Grid__row-cell_firstRow';
                        result += ' controls-Grid__row-cell_withRowSeparator_firstRow' + `_theme-${theme}`;
                    } else {
                        result += ' controls-Grid__row-cell_withRowSeparator' + `_theme-${theme}`;
                    }
                }
                if (_private.isLastItem(editingItem, rowCount, current.index)) {
                    result += ` controls-Grid__row-cell_lastRow_theme-${theme}`;
                    result += ` controls-Grid__row-cell_withRowSeparator_lastRow_theme-${theme}`;
                } else {
                    result += ` controls-Grid__row-cell_withRowSeparator_notLastRow_theme-${theme}`;
                }
            } else {
                result += ` controls-Grid__row-cell_withoutRowSeparator_theme-${theme}`;
            }
            return result;
        },

        isFixedCell: function(params) {
            const { multiSelectVisibility, stickyColumnsCount, columnIndex, rowIndex, isMultiHeader } = params;
            const
                hasMultiSelect = multiSelectVisibility !== 'hidden',
                columnOffset = hasMultiSelect ? 1 : 0;
            const isCellIndexLessTheFixedIndex = columnIndex < (stickyColumnsCount + columnOffset);
            if (isMultiHeader !== undefined) {
                return isCellIndexLessTheFixedIndex && rowIndex === 0;
            }
            return isCellIndexLessTheFixedIndex;
        },


        getHeaderZIndex: function(params) {
           return _private.isFixedCell(params) ? FIXED_HEADER_ZINDEX : STICKY_HEADER_ZINDEX;
        },

        getColumnScrollCellClasses: function(params, theme) {
           return _private.isFixedCell(params) ? ` controls-Grid__cell_fixed controls-Grid__cell_fixed_theme-${theme}` : ' controls-Grid__cell_transform';
        },

        getItemColumnCellClasses: function(current, theme, editingItem) {
            const cellClasses = `controls-Grid__row-cell controls-Grid__row-cell_theme-${theme} `;
            const checkBoxCell = current.multiSelectVisibility !== 'hidden' && current.columnIndex === 0;

            if (current.columnScroll) {
                cellClasses += _private.getColumnScrollCellClasses(current, theme);
            } else if (!checkBoxCell) {
                cellClasses += ' controls-Grid__cell_fit';
            }
            cellClasses += (current.isEditing ? ' controls-Grid__row-cell-background-editing' : ' controls-Grid__row-cell-background-hover') + `_theme-${theme}`;

            var currentStyle = current.style || 'default';

            cellClasses += _private.prepareRowSeparatorClasses(current, theme, editingItem);

            // Если включен множественный выбор и рендерится первая колонка с чекбоксом
            if (checkBoxCell) {
                cellClasses += ' controls-Grid__row-cell-checkbox' + `_theme-${theme}`;
                cellClasses += _private.getPaddingForCheckBox({ theme, itemPadding: current.itemPadding});
            } else {
                cellClasses += _private.getPaddingCellClasses({
                    columns: current.columns,
                    style: current.style,
                    columnIndex: current.columnIndex,
                    multiSelectVisibility: current.multiSelectVisibility !== 'hidden',
                    itemPadding: current.itemPadding,
                }, theme);
            }

            if (current.isSelected) {
                cellClasses += ' controls-Grid__row-cell_selected controls-Grid__row-cell_selected-' + currentStyle + `_theme-${theme}`;

                if (current.columnIndex === 0) {
                    cellClasses += ' controls-Grid__row-cell_selected__first-' + currentStyle + `_theme-${theme}`;
                }
                if (current.columnIndex === current.getLastColumnIndex()) {
                    cellClasses += ' controls-Grid__row-cell_selected__last controls-Grid__row-cell_selected__last-' + currentStyle + `_theme-${theme}`;
                }
            } else if (current.columnIndex === current.getLastColumnIndex()) {
                cellClasses += ' controls-Grid__row-cell__last controls-Grid__row-cell__last-' + currentStyle + `_theme-${theme}`;
            }

            return cellClasses;
        },
        getStickyColumn: function(cfg) {
            var
                result;
            if (cfg.stickyColumn) {
                result = {
                    index: cfg.stickyColumn.index,
                    property: cfg.stickyColumn.property
                };
            } else if (cfg.columns) {
                for (var idx = 0; idx < cfg.columns.length; idx++) {
                    if (cfg.columns[idx].stickyProperty) {
                        result = {
                            index: idx,
                            property: cfg.columns[idx].stickyProperty
                        };
                        break;
                    }
                }
            }
            return result;
        },
        prepareLadder: function(self) {
            var
                fIdx, idx, item, prevItem,
                ladderProperties = self._options.ladderProperties,
                stickyColumn = _private.getStickyColumn(self._options),
                supportLadder = self._isSupportLadder(ladderProperties),
                supportSticky = !!stickyColumn,
                ladder = {}, ladderState = {}, stickyLadder = {},
                stickyLadderState = {
                    ladderLength: 1
                };

            if (!supportLadder && !supportSticky) {
                return {};
            }

            function processLadder(params) {
                var
                    value = params.value,
                    prevValue = params.prevValue,
                    state = params.state;

                // isEqual works with any types
                if (isEqual(value, prevValue)) {
                    state.ladderLength++;
                } else {
                    params.ladder.ladderLength = state.ladderLength;
                    state.ladderLength = 1;
                }
            }

            function processStickyLadder(params) {
                processLadder(params);
                if (params.ladder.ladderLength && params.ladder.ladderLength > 1 && !detection.isNotFullGridSupport) {
                    params.ladder.headingStyle = 'grid-area: ' +
                        (params.itemIndex + 1) + ' / ' +
                        '1 / ' +
                        'span ' + params.ladder.ladderLength + ' / ' +
                        'span 1;';
                }
            }

            if (supportLadder) {
                for (fIdx = 0; fIdx < ladderProperties.length; fIdx++) {
                    ladderState[ladderProperties[fIdx]] = {
                        ladderLength: 1
                    };
                }
            }

            for (idx = self._model.getStopIndex() - 1; idx >= self._model.getStartIndex(); idx--) {
                item = self._model.getDisplay().at(idx).getContents();
                prevItem = idx - 1 >= 0 ? self._model.getDisplay().at(idx - 1).getContents() : null;

                if (supportLadder) {
                    ladder[idx] = {};
                    for (fIdx = 0; fIdx < ladderProperties.length; fIdx++) {
                        ladder[idx][ladderProperties[fIdx]] = {};
                        processLadder({
                            itemIndex: idx,
                            value: item.get ? item.get(ladderProperties[fIdx]) : undefined,
                            prevValue: prevItem && prevItem.get ? prevItem.get(ladderProperties[fIdx]) : undefined,
                            state: ladderState[ladderProperties[fIdx]],
                            ladder: ladder[idx][ladderProperties[fIdx]]
                        });
                    }
                }

                if (supportSticky) {
                    stickyLadder[idx] = {};
                    processStickyLadder({
                        itemIndex: idx,
                        value: item.get(stickyColumn.property),
                        prevValue: prevItem ? prevItem.get(stickyColumn.property) : undefined,
                        state: stickyLadderState,
                        ladder: stickyLadder[idx]
                    });
                }
            }
            return {
                ladder: ladder,
                stickyLadder: stickyLadder
            };
        },

        getSortingDirectionByProp: function(sorting, prop) {
            var sortingDirection;

            if (sorting) {
                sorting.forEach(function(elem) {
                    if (elem[prop]) {
                        sortingDirection = elem[prop];
                    }
                });
            }

            return sortingDirection;
        },

        isNeedToHighlight: function(item, dispProp, searchValue) {
            var itemValue = item.get(dispProp);
            return itemValue && searchValue && String(itemValue).toLowerCase().indexOf(searchValue.toLowerCase()) !== -1;
        },

        getFooterStyles: function (self): string {
            const cfg = {
                columnStart: 0,
                columnSpan: self._columns.length + (self.getMultiSelectVisibility() !== 'hidden' ? 1 : 0)
            };

            if (self._isFullGridSupport) {
                return GridLayoutUtil.getColumnStyles(cfg);
            } else {
                // TODO: Удалить после полного перехода на table-layout. По задаче https://online.sbis.ru/doc/5d2c482e-2b2f-417b-98d2-8364c454e635
                return GridLayoutUtil.getCellStyles({
                    ...cfg,
                    rowStart: self._getRowIndexHelper().getFooterIndex(),
                })
            }
        },

        getEmptyTemplateStyles: function (self): string {
            const cfg = {
                columnStart: self.getMultiSelectVisibility() !== 'hidden' ? 1 : 0,
                columnSpan: self._columns.length,
            };

            if (self._isFullGridSupport) {
                return GridLayoutUtil.getColumnStyles(cfg);
            } else {
                // TODO: Удалить после полного перехода на table-layout. По задаче https://online.sbis.ru/doc/5d2c482e-2b2f-417b-98d2-8364c454e635
                return GridLayoutUtil.getCellStyles({
                    ...cfg,
                    rowStart: self._getRowIndexHelper().getTopOffset(),
                })
            }
        },

        prepareColumnsWidth: function (self, itemData): Array<string> {
            let
                columns: Array<{ width: string }> = self._columns,
                hasMultiselect = self._options.multiSelectVisibility !== 'hidden',
                columnsWidth = hasMultiselect ? ['max-content'] : [],
                hasDynamicWidth = !!columns.find((column) => {
                    return !GridLayoutUtil.isCompatibleWidth(column.width);
                });

            // TODO Kingo
            // Метод getColumnsWidthForEditingRow добавляет в GridViewModel сам GridView
            // при его создании. Если его еще нет, используем ширину из конфигурации
            // колонок (вызывается только в IE)
            if (!hasDynamicWidth || !self.getColumnsWidthForEditingRow) {
                columnsWidth = columnsWidth.concat(columns.map((column) => column.width || '1fr'));
            } else {
                columnsWidth = columnsWidth.concat(self.getColumnsWidthForEditingRow(itemData));
            }

            return columnsWidth;
        },
        getEditingRowStyles(self, itemData): string {
            let editingRowStyles = '';

            // TODO: KINGO
            // В IE (едиственный поддерживаемый браузер с частичной поддержкой грида) обнаружился баг неясной природы.
            // В IE, из-за особенностей вёрстки, строка редактирования это сабгрид.
            // Для выравнивания колонок сабгрида строки редактирования, необходимо задать ему template-columns в px.
            // При взятии ширины колонки у родительского грида, getBoundingClientRect возвращает неправильную ширину.
            // Такое поведение встречается, только если задать -ms-grid-column-span !== 1.
            // https://online.sbis.ru/opendoc.html?guid=e61af344-59d8-4bc2-9645-fcbac1ddd767

            // Если единственное содержимое грида - это строка редактирования, то нужно растянуть строку по гриду,
            // т.к. больше его некому растянуть.
            // Также, если в таблице есть колонка чекбоксов (ее ширина задается как max-content), то попавшая на место
            // первой ячейки строка редактирования, растянет всю колонку на ширину таблицы. Поэтому нужно ее заколспанить.
            let columnSpan;
            if (self._options.fix1178162037) {
                columnSpan = self._columns.length;
            } else {
                columnSpan = ((self.getItems().getCount() || !!self.getHeader()) && self._options.multiSelectVisibility === 'hidden' && !detection.yandex) ? 1 : self._columns.length;
            }

            editingRowStyles += GridLayoutUtil.getGridLayoutStyles() + ' ';
            editingRowStyles += GridLayoutUtil.getTemplateColumnsStyle(_private.prepareColumnsWidth(self, itemData)) + ' ';
            editingRowStyles += GridLayoutUtil.getCellStyles({
                columnStart: 0,
                columnSpan,
                rowStart: itemData.rowIndex
            });

            return editingRowStyles;
        },
        prepareItemDataForPartialSupport(self, itemData): void {

            /* When using a custom item template, the scope of the base template becomes the same as the scope of custom template.
             * Because of this, the base handlers are lost. To fix this, need to remember the handlers where the scope is
             * still right and set them. But current event system prevent do this, because it looks for given event handler
             * only on closest control (which can be Browser, Explorer or smth else because of template scope).
             * Therefore it is required to create Cell as control with and subscribe on events in it.
             * https://online.sbis.ru/opendoc.html?guid=9d0f8d1a-576d-471d-bf02-991cd02f92e4
             */
            itemData.handlersForPartialSupport = self.getHandlersForPartialSupport();

            // In browsers with partial grid support grid requires explicit setting grid cell styles.
            if (!itemData.isGroup) {

                itemData.getEditingRowStyles = () => {
                    if (!self.editingRowGridStyles) {
                        self.editingRowGridStyles = _private.getEditingRowStyles(self, itemData);
                    }
                    return self.editingRowGridStyles;
                };

            } else {
                itemData.gridGroupStyles = GridLayoutUtil.toCssString([
                    {name: 'grid-row', value: itemData.rowIndex + 1},
                    {name: '-ms-grid-row', value: itemData.rowIndex + 1}
                ]);
            }

        },

        calcLadderVersion(ladder = {}, index): string {

            function getItemsLadderVersion(ladder) {
                let ladderVersion = '';

                Object.keys(ladder).forEach((ladderProperty) => {
                    ladderVersion += (ladder[ladderProperty].ladderLength || 0) + '_';
                });

                return ladderVersion;
            }

            let
                version = '',
                simpleLadder = ladder.ladder && ladder.ladder[index],
                stickyLadder = ladder.stickyLadder && ladder.stickyLadder[index];

            if (simpleLadder) {
                version += 'LP_' + getItemsLadderVersion(simpleLadder);
            }
            if (stickyLadder) {
                version += 'SP_' + getItemsLadderVersion(stickyLadder);
            }

            return version;
        },

        getColumnAlignGroupStyles(itemData: IGridItemData, columnAlignGroup: number = 0): {
            left: string
            right: string
        } {

            let
                start = 1,
                center = columnAlignGroup + (itemData.hasMultiSelect ? 1 : 0) + 1,
                stop = itemData.columns.length + 1,
                result = {right: '', left: ''};

            if (columnAlignGroup) {
                result.left = `grid-column: ${start} / ${center}; -ms-grid-column: ${start}; -ms-grid-column-span: ${center - 1};`;
                result.right = `grid-column: ${center} / ${stop}; -ms-grid-column: ${center}; -ms-grid-column-span: ${stop - center};`;
            } else {
                result.left = `grid-column: ${start} / ${stop}; -ms-grid-column: ${start}; -ms-grid-column-span: ${stop - 1};`;
            }

            return result
        },

        getColspanForColumnScroll(self): {
            fixedColumns: string,
            scrollableColumns: string
        } {

            const stickyColumnsCount = self._options.stickyColumnsCount || 1;
            const scrollableColumnsCount = self._columns.length - self._options.stickyColumnsCount;
            const start = (self._options.multiSelectVisibility !== 'hidden' ? 1 : 0) + 1;
            const center = start + (self._options.stickyColumnsCount || 1);
            const end = start + self._columns.length;

            return {
                fixedColumns: `grid-column: ${start} / ${center}; -ms-grid-column: ${start}; -ms-grid-column-span: ${stickyColumnsCount}; z-index: 3;`,
                scrollableColumns: `grid-column: ${center} / ${end}; -ms-grid-column: ${center}; -ms-grid-column-span: ${scrollableColumnsCount}; z-index: auto;`,
            };
        },

        // TODO: Удалить после полного перехода на table-layout. По задаче https://online.sbis.ru/doc/5d2c482e-2b2f-417b-98d2-8364c454e635
        // И перейти на detection после лечения https://online.sbis.ru/opendoc.html?guid=c058ed70-f505-4861-a906-96453ae6485f
        setGridSupportStatus(self: GridViewModel, useTableInOldBrowsers: boolean): void {
            self._isNoGridSupport = GridLayoutUtil.isNoGridSupport();
            self._isPartialGridSupport = GridLayoutUtil.isPartialGridSupport();
            self._isFullGridSupport = GridLayoutUtil.isFullGridSupport();

            const canUseTableLayout = !!useTableInOldBrowsers || self._isNoGridSupport;
            self._shouldUseTableLayout = canUseTableLayout && !self._isFullGridSupport;
        }
    },

    GridViewModel = BaseViewModel.extend({
        _model: null,
        _columnTemplate: null,

        _columns: [],
        _curColumnIndex: 0,

        _lastItemKey: undefined,
        _headerRows: [],
        _headerColumns: [],
        _curHeaderColumnIndex: 0,
        _maxEndRow: 0,
        _maxEndColumn: 0,
        _curHeaderRowIndex: 0,
        _multiHeaderOffset: 0,
        _headerCellMinHeight: null,
        _resultOffset: null,

        _resultsColumns: [],
        _curResultsColumnIndex: 0,

        _colgroupColumns: [],
        _curColgroupColumnIndex: 0,

        _ladder: null,
        _columnsVersion: 0,

        _eventHandlersForPartialSupport: {},
        _cachaedHeaderColumns: null,

        constructor: function(cfg) {
            this._options = cfg;
            GridViewModel.superclass.constructor.apply(this, arguments);
            this._model = this._createModel(cfg);
            _private.setGridSupportStatus(this, cfg.useTableInOldBrowsers);
            this._onListChangeFn = function(event, changesType, action, newItems, newItemsIndex, removedItems, removedItemsIndex) {
                if (changesType === 'collectionChanged') {
                    this._ladder = _private.prepareLadder(this);
                }
                this._nextVersion();
                this._notify('onListChange', changesType, action, newItems, newItemsIndex, removedItems, removedItemsIndex);
            }.bind(this);
            this._onMarkedKeyChangedFn = function(event, key) {
                this._notify('onMarkedKeyChanged', key);
            }.bind(this);
            this._onGroupsExpandChangeFn = function(event, changes) {
                this._notify('onGroupsExpandChange', changes);
            }.bind(this);
            this._onCollectionChangeFn = function(event, action) {
                this._updateLastItemKey();
                this._notify.apply(this, ['onCollectionChange'].concat(Array.prototype.slice.call(arguments, 1)));
                // In browsers that do not support "display: contents", need redraw all elements,
                // because row and column indices are set for all elements.
                // TODO: Удалить после полного перехода на table-layout. По задаче https://online.sbis.ru/doc/5d2c482e-2b2f-417b-98d2-8364c454e635
                // When item is added to or removed from the grid with ladder support, we have to recalculate
                // ladder styles for every cell, so we need to update prefix version
                if (
                    this._isPartialGridSupport && !this._shouldUseTableLayout && action === collection.IObservable.ACTION_ADD ||
                    (
                        this._isSupportLadder(this._options.ladderProperties) &&
                        (
                            action === collection.IObservable.ACTION_ADD ||
                            action === collection.IObservable.ACTION_REMOVE
                        ) &&
                        !this._options.disableColumnScrollCellStyles
                    )
                ) {
                    event.setResult('updatePrefix');
                }
            }.bind(this);
            // Events will not fired on the PresentationService, which is why setItems will not ladder recalculation.
            // Use callback for fix it. https://online.sbis.ru/opendoc.html?guid=78a1760a-bfcf-4f2c-8b87-7f585ea2707e
            this._model.setUpdateIndexesCallback(this._updateIndexesCallback.bind(this));
            this._model.subscribe('onListChange', this._onListChangeFn);
            this._model.subscribe('onMarkedKeyChanged', this._onMarkedKeyChangedFn);
            this._model.subscribe('onGroupsExpandChange', this._onGroupsExpandChangeFn);
            this._model.subscribe('onCollectionChange', this._onCollectionChangeFn);
            this._ladder = _private.prepareLadder(this);
            this._setColumns(this._options.columns);
            if (this._options.header && this._options.header.length) { this._isMultiHeader = this.isMultiHeader(this._options.header); }
            this._setHeader(this._options.header);
            this._updateLastItemKey();
        },
        _isSupportLadder(ladderProperties: []): boolean {
            return !!(ladderProperties && ladderProperties.length);
        },
        setTheme(theme: string): void {
            this._options.theme = theme;
        }
        _updateLastItemKey(): void {
            if (this.getItems()) {
                this._lastItemKey = ItemsUtil.getPropertyValue(this.getLastItem(), this._options.keyProperty);
            }
        },

        _updateIndexesCallback(): void {
            this._ladder = _private.prepareLadder(this);
        },

        setKeyProperty(keyProperty: string): void {
            this._options.keyProperty = keyProperty;
        },

        _nextModelVersion: function(notUpdatePrefixItemVersion) {
            this._model.nextModelVersion(notUpdatePrefixItemVersion);
        },

        _prepareCrossBrowserColumn(column: IGridColumn): IGridColumn {
            const result = cClone(column) as IGridColumn;

            if (this._shouldUseTableLayout) {
                if (column.compatibleWidth) {
                    result.width = column.compatibleWidth;
                } else {
                    result.width = GridLayoutUtil.isCompatibleWidth(column.width) ? column.width : 'auto';
                }
            }
            return result;
        },

        _prepareColumns(columns: IGridColumn[]): IGridColumn[] {
            const result: IGridColumn[] = [];
            for (let i = 0; i < columns.length; i++) {
                result.push(this._prepareCrossBrowserColumn(columns[i]));
            }
            return result;
        },

        _createModel: function(cfg) {
            return new ListViewModel(cfg);
        },

        setColumnTemplate: function(columnTpl) {
            this._columnTemplate = columnTpl;
        },

        // -----------------------------------------------------------
        // ---------------------- headerColumns ----------------------
        // -----------------------------------------------------------

        getHeader: function() {
            return this._header;
        },

        _setHeader: function(columns) {
            this._header = columns;
            this._prepareHeaderColumns(this._header, this._options.multiSelectVisibility !== 'hidden');
        },

        setHeader: function(columns) {
            this._setHeader(columns);
            this._nextModelVersion();
        },
        isMultiHeader: function(columns) {
            let k = 0;
            while(columns.length > k) {
                if (columns[k].endRow > 2) {
                    return true;
                }
                k++;
            }
            return false;
        },
        _prepareHeaderColumns: function(columns, multiSelectVisibility) {
            if (columns && columns.length) {
                this._isMultiHeader = this.isMultiHeader(columns);
                this._headerRows = getRowsArray(columns, multiSelectVisibility, this._isMultiHeader);
                [this._maxEndRow, this._maxEndColumn] = getMaxEndRow(this._headerRows);
            } else if (multiSelectVisibility) {
                this._headerRows = [{}];
            } else {
                this._headerRows = [];
            }
            this._multiHeaderOffset = this._headerRows.length ? this._headerRows.length - 1 : 0;
            this.resetHeaderRows();
        },
        getMultiHeaderOffset: function() {
          return this._multiHeaderOffset;
        },
        setHeaderCellMinHeight: function(data) {
            if (!isEqual(getRowsArray(data[0], this._options.multiSelectVisibility !== 'hidden'), this._headerRows)) {
                this._prepareHeaderColumns(data[0], this._options.multiSelectVisibility !== 'hidden');
                this._cachaedHeaderColumns = [...data[0]];
                if (data[1]) { this._setResultOffset(data[1]); }
                this._nextModelVersion();
            }
        },
        _setResultOffset: function(offset) {
            this._resultOffset = offset;
        },
        getResultOffset: function() {
            return this._resultOffset;
        },
        resetHeaderRows: function() {
            this._curHeaderRowIndex = 0;
        },
        goToNextHeaderRow: function() {
            this._curHeaderRowIndex++;
        },

        getStickyColumnsCount: function() {
            return this._options.stickyColumnsCount;
        },

        getMaxEndColumn: function() {
            return this._maxEndColumn;
        },

        isDrawHeaderWithEmptyList: function() {
            if (!this.headerInEmptyListVisible && !this.isGridListNotEmpty()) {
                return false;
            }
            return true;
        },

        isGridListNotEmpty(): boolean {
            const items = this.getItems();
            return !!items && items.getCount() > 0;
        },


        getCurrentHeaderRow: function() {
            const self = this;
            let obj = {
                curHeaderColumnIndex: 0,
                curRowIndex: this._curHeaderRowIndex,
                headerCells: this._headerRows[this._curHeaderRowIndex],
                getCurrentHeaderColumn: function() {
                    return self.getCurrentHeaderColumn(this.curRowIndex, this.curHeaderColumnIndex);
                }
            };
            obj.resetHeaderColumns = function() {
                this.curHeaderColumnIndex = 0;
            };
            obj.goToNextHeaderColumn = function() {
                this.curHeaderColumnIndex++;
            };
            obj.isEndHeaderColumn = function() {
                return this.curHeaderColumnIndex < this.headerCells.length;
            };
            return obj;
        },

        isEndHeaderRow: function() {
            return this._curHeaderRowIndex < this._headerRows.length;
        },

        getColumnsVersion: function() {
            return this._columnsVersion;
        },

        isStickyHeader: function() {
           return this._options.stickyHeader && this._isFullGridSupport;
        },

        getCurrentHeaderColumn: function(rowIndex, columnIndex) {
            const cell = this._headerRows[rowIndex][columnIndex];
            const theme = this._options.theme;
            let
                cellClasses = 'controls-Grid__header-cell controls-Grid__header-cell' + `_theme-${theme}` + (this._isMultiHeader ? ' controls-Grid__multi-header-cell_min-height' : ' controls-Grid__header-cell_min-height') + `_theme-${theme}`,
                headerColumn = {
                    column: cell,
                    index: columnIndex
                };

            if (this.isStickyHeader()) {
               headerColumn.zIndex = _private.getHeaderZIndex({
                  columnIndex: columnIndex,
                  rowIndex,
                  isMultiHeader: this._isMultiHeader,
                  multiSelectVisibility: this._options.multiSelectVisibility,
                  stickyColumnsCount: this._options.stickyColumnsCount
               });
            }

            if (!stickyUtil.isStickySupport()) {
                cellClasses = cellClasses + ' controls-Grid__header-cell_static';
            }

            if (this._options.columnScroll) {
                cellClasses += _private.getColumnScrollCellClasses({
                    columnIndex: columnIndex,
                    rowIndex,
                    isMultiHeader: this._isMultiHeader,
                    multiSelectVisibility: this._options.multiSelectVisibility,
                    stickyColumnsCount: this._options.stickyColumnsCount
                }, this._options.theme);
            }

            // Если включен множественный выбор и рендерится первая колонка с чекбоксом
            if (this._options.multiSelectVisibility !== 'hidden' && columnIndex === 0 && !cell.title) {
                cellClasses += ' controls-Grid__header-cell-checkbox' + `_theme-${theme}`;

                // В grid-layout хлебные крошки нельзя расположить в первой ячейке, если в таблице включен множественный выбор,
                // т.к. крошки растянут колонку, поэтому размещаем крошки во второй колонке и задаем отрицательный margin слева.
                // https://online.sbis.ru/doc/9fcac920-479a-40a3-8b8a-5aabb2886628
                // В table-layout проблемы с растягиванием нет, поэтому используем colspan на крошке.
                if (this._shouldUseTableLayout && this._headerRows[0][1] && this._headerRows[0][1].isBreadCrumbs) {
                    headerColumn.isHiddenForBreadcrumbs = true;
                }
            } else {
                cellClasses += _private.getPaddingHeaderCellClasses({
                    style: this._options.style,
                    columns: this._headerRows[rowIndex],
                    columnIndex: columnIndex,
                    multiSelectVisibility: this._options.multiSelectVisibility !== 'hidden',
                    isTableLayout: this._shouldUseTableLayout,
                    itemPadding: this._model.getItemPadding(),
                    isHeader: true,
                    cell,
                    rowIndex,
                    maxEndColumn: this._maxEndColumn,
                    // TODO: удалить isBreadcrumbs после https://online.sbis.ru/opendoc.html?guid=b3647c3e-ac44-489c-958f-12fe6118892f
                    isBreadCrumbs: headerColumn.column.isBreadCrumbs,
                }, this._options.theme);
            }

            // TODO: удалить isBreadcrumbs после https://online.sbis.ru/opendoc.html?guid=b3647c3e-ac44-489c-958f-12fe6118892f
            if (headerColumn.column.isBreadCrumbs) {
               headerColumn.style = _private.getColspanStyles(
                  this._options.multiSelectVisibility,
                  columnIndex,
                  this._headerRows[0].length,
                  true,
                  this._maxEndRow,
               );
               headerColumn.colSpan = _private.getColspanForNoGridSupport(this._options.multiSelectVisibility, true);
            }

            if (headerColumn.column.sortingProperty) {
                headerColumn.sortingDirection = _private.getSortingDirectionByProp(this.getSorting(), headerColumn.column.sortingProperty);
            }
            // -----------------------------------------------------------
            // ---------------------- multiHeader ------------------------
            // -----------------------------------------------------------

            let cellContentClasses = '';
            let cellStyles = '';
            let offsetTop = 0;
            let shadowVisibility = 'visible';

            if (cell.startRow || cell.startColumn) {
                let { endRow, startRow, endColumn, startColumn } = cell;

                if (!startRow) {
                    startRow = 1;
                    endRow = 2;
                }
                if (this._shouldUseTableLayout) {
                    headerColumn.rowSpan = endRow - startRow;
                    // Для хлебных крошек колспан проставляется выше и не зависит от мультишапки.
                    if (!headerColumn.column.isBreadCrumbs) {
                        headerColumn.colSpan = endColumn - startColumn;
                    }
                } else {
                    if (this.isStickyHeader()) {
                        offsetTop = cell.offsetTop ? cell.offsetTop : 0;
                        shadowVisibility = (rowIndex === this._headerRows.length - 1 || endRow === this._maxEndRow) && this.getResultsPosition() !== 'top' ? 'visible' : 'hidden';
                    }

                    const additionalColumn = this._options.multiSelectVisibility === 'hidden' ? 0 : 1;
                    const gridStyles = GridLayoutUtil.getMultiHeaderStyles(startColumn, endColumn, startRow, endRow, additionalColumn);
                    cellStyles += gridStyles;

                }
                cellClasses += endRow - startRow > 1 ? ' controls-Grid__header-cell_justify_content_center' : '';
                cellContentClasses += rowIndex !== this._headerRows.length - 1 && endRow - startRow === 1 ? ` controls-Grid__cell_header-content_border-bottom_theme-${this._options.theme}` : '';
                cellContentClasses += endRow - startRow === 1 ? ' control-Grid__cell_header-nowrap' : '';
            } else if (this._isPartialGridSupport && !this._shouldUseTableLayout) {
                // TODO: Удалить после полного перехода на table-layout. По задаче https://online.sbis.ru/doc/5d2c482e-2b2f-417b-98d2-8364c454e635
                cellStyles += GridLayoutUtil.getCellStyles({rowStart: rowIndex, columnStart: columnIndex});
            }

            if (columnIndex === 0 && rowIndex === 0 && this._options.multiSelectVisibility !== 'hidden' && this._headerRows[rowIndex][columnIndex + 1].startColumn && !cell.title) {
                cellStyles = GridLayoutUtil.getMultiHeaderStyles(1, 2, 1, this._maxEndRow, 0)
                if (this._shouldUseTableLayout) {
                    headerColumn.rowSpan = this._maxEndRow - 1;
                    headerColumn.colSpan = 1;
                }
            }
            if (headerColumn.column.align) {
                cellContentClasses += ' controls-Grid__header-cell_justify_content_' + headerColumn.column.align;
            }
            if (headerColumn.column.valign) {
                cellContentClasses += ' controls-Grid__header-cell_align_items_' + headerColumn.column.valign;
            }

            if (GridLayoutUtil.isOldIE()) {
                cellContentClasses += ' controls-Grid__header-cell-content-block';
            }

            headerColumn.shadowVisibility = shadowVisibility;
            headerColumn.offsetTop = offsetTop;
            headerColumn.cellStyles = cellStyles;
            headerColumn.cellClasses = cellClasses;
            headerColumn.cellContentClasses = cellContentClasses;

            return headerColumn;
        },

        // -----------------------------------------------------------
        // ---------------------- resultColumns ----------------------
        // -----------------------------------------------------------

        getResultsPosition: function() {
            if (this.isDrawResults()) {
                if (this._options.results) {
                    return this._options.results.position;
                }
                return this._options.resultsPosition;
            }
        },

        setHasMoreData: function(hasMore: boolean) {
            this._model.setHasMoreData(hasMore);
        },

        getHasMoreData: function() {
          return this._model.getHasMoreData();
        },

        isDrawResults: function() {
            if (this._options.resultsVisibility === 'visible') {
                return true;
            }
            const items = this.getItems();
            return this.getHasMoreData() || items && items.getCount() > 1;
        },

        setResultsPosition: function(position) {
            this._options.resultsPosition = position;

            // TODO Kingo
            // Из-за появления/скрытия строки итогов могут сдвинуться строки грида. Так
            // как в IE на каждую ячейку вешается номер строки вручную, эти номера нужно
            // пересчитать. В других браузерах появившаяся строка сдвинет другие автоматически
            // TODO: Удалить после полного перехода на table-layout. По задаче https://online.sbis.ru/doc/5d2c482e-2b2f-417b-98d2-8364c454e635
            if (this._isPartialGridSupport && !this._shouldUseTableLayout) {
                this._nextModelVersion();
            }
        },

        // TODO: Изменить(возвращать только grid-column-span: this._columns.length;) после полного перехода на table-layout. По задаче https://online.sbis.ru/doc/5d2c482e-2b2f-417b-98d2-8364c454e635
        getStyleForCustomResultsTemplate: function() {
            return _private.getColspanStyles(
               this._options.multiSelectVisibility,
               0,
               this._columns.length
            );
        },

        _prepareResultsColumns: function(columns, multiSelectVisibility) {
            if (multiSelectVisibility) {
                this._resultsColumns = [{}].concat(columns);
            } else {
                this._resultsColumns = columns;
            }

            this.resetResultsColumns();
        },

        resetResultsColumns: function() {
            this._curResultsColumnIndex = 0;
        },

        getCurrentResultsColumn: function() {
            var
                columnIndex = this._curResultsColumnIndex,
                cellClasses = `controls-Grid__results-cell controls-Grid__results-cell_theme-${this._options.theme}`,
                resultsColumn = {
                    column: this._resultsColumns[columnIndex],
                    index: columnIndex
                };

            if (resultsColumn.column.align) {
                cellClasses += ` controls-Grid__row-cell__content_halign_${resultsColumn.column.align}`;
            }

            if (this.isStickyHeader()) {
                resultsColumn.zIndex = _private.getHeaderZIndex({
                    columnIndex: columnIndex,
                    multiSelectVisibility: this._options.multiSelectVisibility,
                    stickyColumnsCount: this._options.stickyColumnsCount
                });
            }

            if (this._options.columnScroll) {
                cellClasses += _private.getColumnScrollCellClasses({
                    columnIndex: columnIndex,
                    multiSelectVisibility: this._options.multiSelectVisibility,
                    stickyColumnsCount: this._options.stickyColumnsCount
                }, this._options.theme);
            }

            // Если включен множественный выбор и рендерится первая колонка с чекбоксом
            if ((this._options.multiSelectVisibility !== 'hidden') && columnIndex === 0) {
                cellClasses += ' controls-Grid__results-cell-checkbox' + `_theme-${this._options.theme}`;
            } else {
                cellClasses += _private.getPaddingCellClasses({
                    style: this._options.style,
                    columns: this._resultsColumns,
                    columnIndex: columnIndex,
                    multiSelectVisibility: this._options.multiSelectVisibility !== 'hidden',
                    itemPadding: this._model.getItemPadding(),
                    isResult: true
                }, this._options.theme);
            }
            resultsColumn.cellClasses = cellClasses;

            // For browsers with partial grid support need to set its grid-row and grid-column
            // TODO: Удалить после полного перехода на table-layout. По задаче https://online.sbis.ru/doc/5d2c482e-2b2f-417b-98d2-8364c454e635
            if (this._isPartialGridSupport && !this._shouldUseTableLayout) {
                resultsColumn.rowIndex = this._getRowIndexHelper().getResultsIndex();
                resultsColumn.gridCellStyles = GridLayoutUtil.getCellStyles({
                    rowStart: resultsColumn.rowIndex,
                    columnStart: columnIndex
                });
            }
            return resultsColumn;
        },

        goToNextResultsColumn: function() {
            this._curResultsColumnIndex++;
        },

        isEndResultsColumn: function() {
            return this._curResultsColumnIndex < this._resultsColumns.length;
        },

        // -----------------------------------------------------------
        // -------------------------- items --------------------------
        // -----------------------------------------------------------

        _setColumns(columns: IGridColumn[]): void {
            this._columns = this._prepareColumns(columns);
            this._ladder = _private.prepareLadder(this);
            this._prepareResultsColumns(this._columns, this._options.multiSelectVisibility !== 'hidden');
            this._prepareColgroupColumns(this._columns, this._options.multiSelectVisibility !== 'hidden');
            this._columnsVersion++;
        },

        setColumns(columns: IGridColumn[]): void {
            this._setColumns(columns);
            this._nextModelVersion();
        },

        setLeftSpacing: function(leftSpacing) {
            //TODO: Выпилить в 19.200 https://online.sbis.ru/opendoc.html?guid=837b45bc-b1f0-4bd2-96de-faedf56bc2f6
            this._model.setLeftSpacing(leftSpacing);
        },

        setRightSpacing: function(rightSpacing) {
            //TODO: Выпилить в 19.200 https://online.sbis.ru/opendoc.html?guid=837b45bc-b1f0-4bd2-96de-faedf56bc2f6
            this._model.setRightSpacing(rightSpacing);
        },

        setLeftPadding: function(leftPadding) {
            //TODO: Выпилить в 19.200 https://online.sbis.ru/opendoc.html?guid=837b45bc-b1f0-4bd2-96de-faedf56bc2f6
            this._model.setLeftPadding(leftPadding);
        },

        setRightPadding: function(rightPadding) {
            //TODO: Выпилить в 19.200 https://online.sbis.ru/opendoc.html?guid=837b45bc-b1f0-4bd2-96de-faedf56bc2f6
            this._model.setRightPadding(rightPadding);
        },

        setRowSpacing: function(rowSpacing) {
            //TODO: Выпилить в 19.200 https://online.sbis.ru/opendoc.html?guid=837b45bc-b1f0-4bd2-96de-faedf56bc2f6
            this._model.setRowSpacing(rowSpacing);
        },

        isAllGroupsCollapsed(): boolean {
            return this._model.isAllGroupsCollapsed();
        },

        getColumns: function() {
            return this._columns;
        },

        getMultiSelectVisibility: function() {
            return this._model.getMultiSelectVisibility();
        },

        setMultiSelectVisibility: function(multiSelectVisibility) {
            var
                hasMultiSelect = multiSelectVisibility !== 'hidden';
            this._model.setMultiSelectVisibility(multiSelectVisibility);
            this._prepareColgroupColumns(this._columns, hasMultiSelect);
            if (this._cachaedHeaderColumns && this._isMultiHeader) {
                this._prepareHeaderColumns(this._cachaedHeaderColumns, hasMultiSelect);
            } else {
                this._prepareHeaderColumns(this._header, hasMultiSelect);
            }
            this._prepareResultsColumns(this._columns, hasMultiSelect);
        },

        hasItemById: function(id, keyProperty) {
            return this._model.hasItemById(id, keyProperty);
        },

        getItemById: function(id, keyProperty) {
            return this._model.getItemById(id, keyProperty);
        },

        markAddingItem() {
            this._model.markAddingItem();
        },

        restoreMarker() {
            this._model.restoreMarker();
        },

        setMarkedKey: function(key) {
            this._model.setMarkedKey(key);
        },

        setMarkerVisibility: function(markerVisibility) {
            this._model.setMarkerVisibility(markerVisibility);
        },

        getMarkedKey: function() {
            return this._model.getMarkedKey();
        },
        getMarkedItem: function() {
            return this._model.getMarkedItem();
        },
        getFirstItem: function() {
            return this._model.getFirstItem.apply(this._model, arguments);
        },
        getLastItem: function() {
            return this._model.getLastItem.apply(this._model, arguments);
        },
        getIndexByKey: function() {
            return this._model.getIndexByKey.apply(this._model, arguments);
        },

        getSelectionStatus: function() {
            return this._model.getSelectionStatus.apply(this._model, arguments);
        },

        getNextItemKey: function() {
            return this._model.getNextItemKey.apply(this._model, arguments);
        },
        setMarkerOnValidItem: function(index) {
            this._model.setMarkerOnValidItem(index);
        }
        setIndexes: function(startIndex, stopIndex) {
            return this._model.setIndexes(startIndex, stopIndex);
        },

        getPreviousItemKey: function() {
            return this._model.getPreviousItemKey.apply(this._model, arguments);
        },

        setSorting: function(sorting) {
            this._model.setSorting(sorting);
        },

        setSearchValue: function(value) {
            this._model.setSearchValue(value);
        },

        getSorting: function() {
            return this._model.getSorting();
        },
        setEditingConfig: function(editingConfig) {
            this._model.setEditingConfig(editingConfig);
        },

        setItemPadding: function(itemPadding) {
            this._model.setItemPadding(itemPadding);
        },

        getSwipeItem: function() {
            return this._model.getSwipeItem();
        },

        setCollapsedGroups: function(collapsedGroups) {
            this._model.setCollapsedGroups(collapsedGroups);
        },

        reset: function() {
            this._model.reset();
        },

        isEnd: function() {
            return this._model.isEnd();
        },

        goToNext: function() {
            this._model.goToNext();
        },

        _calcRowIndex: function(current) {
            if (current.isGroup) {
                return this._getRowIndexHelper().getIndexByDisplayIndex(current.index);
            } else if (current.index !== -1) {
                return this._getRowIndexHelper().getIndexById(current.key);
            }
        },

        _getRowIndexHelper() {
            let
                cfg: IBaseGridRowIndexOptions = {
                    display: this.getDisplay(),
                    hasHeader: !!this.getHeader(),
                    resultsPosition: this.getResultsPosition(),
                    multiHeaderOffset: this.getMultiHeaderOffset(),
                    hasBottomPadding: this._options._needBottomPadding,
                    hasColumnScroll: this._options.columnScroll
                },
                hasEmptyTemplate = !!this._options.emptyTemplate;

            if (this.getEditingItemData()) {
                cfg.editingRowIndex = this.getEditingItemData().index;
            }

            return {
                getIndexByItem: (item) => getIndexByItem({item, ...cfg}),
                getIndexById: (id) => getIndexById({id, ...cfg}),
                getIndexByDisplayIndex: (index) => getIndexByDisplayIndex({index, ...cfg}),
                getResultsIndex: () => getResultsIndex({...cfg, hasEmptyTemplate}),
                getBottomPaddingRowIndex: () => getBottomPaddingRowIndex(cfg),
                getFooterIndex: () => getFooterIndex({...cfg, hasEmptyTemplate}),
                getTopOffset: () => getTopOffset(cfg.hasHeader, cfg.resultsPosition, cfg.multiHeaderOffset,  cfg.hasColumnScroll)
            };
        },

        setMenuState(state: string): void {
            this._model.setMenuState(state);
        },

        isCachedItemData: function(itemKey) {
            return this._model.isCachedItemData(itemKey);
        },
        getCachedItemData: function(itemKey) {
            return this._model.getCachedItemData(itemKey);
        },
        setCachedItemData: function(itemKey, cache) {
            this._model.setCachedItemData(itemKey, cache);
        },
        resetCachedItemData: function(itemKey?) {
            this._model.resetCachedItemData(itemKey);
        },

        getItemDataByItem: function(dispItem) {
            var
                self = this,
                current = this._model.getItemDataByItem(dispItem),
                stickyColumn, isStickedColumn;

            if (current._gridViewModelCached) {
                return current;
            } else {
                current._gridViewModelCached = true;
            }

            stickyColumn = _private.getStickyColumn(this._options)

            //TODO: Выпилить в 19.200 или если закрыта -> https://online.sbis.ru/opendoc.html?guid=837b45bc-b1f0-4bd2-96de-faedf56bc2f6
            current.rowSpacing = this._options.rowSpacing;

            current.shouldUseTableLayout = this._shouldUseTableLayout;
            current.isFullGridSupport = this.isFullGridSupport.bind(this);
            current.isPartialGridSupport = this.isPartialGridSupport.bind(this);
            current.isNoGridSupport = this.isNoGridSupport.bind(this);
            current.resolveBaseItemTemplate = this._baseItemTemplateResolver;

            current.columnScroll = this._options.columnScroll;
            current.getColspanForColumnScroll = () => _private.getColspanForColumnScroll(self);
            current.getColspanFor = (elementName: string) => self.getColspanFor.apply(self, [elementName]);
            current.stickyColumnsCount = this._options.stickyColumnsCount;

            current.style = this._options.style;
            current.multiSelectClassList += current.hasMultiSelect ? ` controls-GridView__checkbox_theme-${this._options.theme}` : '';

            current.getColumnAlignGroupStyles = (columnAlignGroup: number) => _private.getColumnAlignGroupStyles(current, columnAlignGroup);

            const superShouldDrawMarker = current.shouldDrawMarker;
            current.shouldDrawMarker = (marker?: boolean, columnIndex: number): boolean => {
                return columnIndex === 0 && superShouldDrawMarker.apply(this, [marker]);
            };
            const superGetMarkerClasses = current.getMarkerClasses;
            current.getMarkerClasses = (rowSeparatorVisibility): string => {
                let classes = ' controls-GridView__itemV_marker controls-GridView__itemV_marker_theme-' + self._options.theme;

                if (rowSeparatorVisibility) {
                    classes += ' controls-GridView-with-rowSeparator_item_marker';
                } else {
                    classes += ' controls-GridView-without-rowSeparator_item_marker';
                }
                classes += '_theme-' + self._options.theme;

                return superGetMarkerClasses.apply(this) + classes;
            }

            if (current.multiSelectVisibility !== 'hidden') {
                current.columns = [{}].concat(this._columns);
            } else {
                current.columns = this._columns;
            }


            current.isHovered = !!self._model.getHoveredItem() && self._model.getHoveredItem().getId() === current.key;

            if (stickyColumn && !detection.isNotFullGridSupport) {
                current.styleLadderHeading = self._ladder.stickyLadder[current.index].headingStyle;
                current.stickyColumnIndex = stickyColumn.index;
            }

            // TODO: Удалить проверку после полного перехода на table-layout. По задаче https://online.sbis.ru/doc/5d2c482e-2b2f-417b-98d2-8364c454e635
            if (this._isPartialGridSupport && !this._shouldUseTableLayout || current.columnScroll) {
                current.rowIndex = this._calcRowIndex(current);
                if (this.getEditingItemData() && (current.rowIndex >= this.getEditingItemData().rowIndex)) {
                    current.rowIndex++;
                }
            }

            // TODO: Удалить проверку после полного перехода на table-layout. По задаче https://online.sbis.ru/doc/5d2c482e-2b2f-417b-98d2-8364c454e635
            if (this._isPartialGridSupport && !this._shouldUseTableLayout) {
                _private.prepareItemDataForPartialSupport(this, current);
            }

            if (current.isGroup) {
                current.groupResultsSpacingClass = ' controls-Grid__cell_spacingLastCol_' + ((current.itemPadding && current.itemPadding.right) || current.rightSpacing || 'default').toLowerCase() + `_theme-${this._options.theme}`;
                return current;
            }

            const itemGroupId = !current.isGroup && this._getItemGroup(current.item);
            current.isInHiddenGroup = itemGroupId === ControlsConstants.view.hiddenGroup;
            current.isFirstInGroup = this._isFirstInGroup(current.item, itemGroupId);

            if (
                current.isFirstInGroup &&
                !current.isInHiddenGroup &&
                current.item !== self.getLastItem()
            ) {
                current.rowSeparatorVisibility = false;
            } else {
                current.rowSeparatorVisibility = this._options.showRowSeparator !== undefined ? this._options.showRowSeparator : this._options.rowSeparatorVisibility;
            }

            current.columnIndex = 0;

            current.getVersion = function() {
                return self._calcItemVersion(current.item, current.key, current.index);
            };

            current.getItemColumnCellClasses = _private.getItemColumnCellClasses;

            current.resetColumnIndex = () => {
                current.columnIndex = 0;
            };
            current.goToNextColumn = () => {
                current.columnIndex++;
            };
            current.getLastColumnIndex = () => {
                return current.columns.length - 1;
            };
            current.hasNextColumn = (isColumnColspaned: boolean) => {
                if (isColumnColspaned) {
                    return current.columnIndex <= (current.hasMultiSelect ? 1 : 0);
                } else {
                    return current.getLastColumnIndex() >= current.columnIndex;
                }
            };
            current.isDrawActions = _private.isDrawActions;
            current.getCellStyle = _private.getCellStyle;
            current.getColspan = _private.getColspan;

            current.getCurrentColumnKey = function() {
                return self._columnsVersion + '_' +
                    (self._options.multiSelectVisibility === 'hidden' ? current.columnIndex : current.columnIndex - 1);
            };

            current.getCurrentColumn = function() {
                var
                    currentColumn = {
                        item: current.item,
                        style: current.style,
                        isMenuShown: current.isMenuShown,
                        dispItem: current.dispItem,
                        keyProperty: current.keyProperty,
                        displayProperty: current.displayProperty,
                        index: current.index,
                        columnIndex: current.columnIndex,
                        key: current.key,
                        getPropValue: current.getPropValue,
                        isEditing: current.isEditing,
                        isActive: current.isActive,
                        showEditArrow: current.showEditArrow,
                        getVersion: function() {
                           return _private.calcItemColumnVersion(self, current.getVersion(), current.columnIndex, current.index);
                        },
                        _preferVersionAPI: true
                    };
                currentColumn.cellClasses = current.getItemColumnCellClasses(current, self._options.theme, self.getEditingItemData());
                currentColumn.column = current.columns[current.columnIndex];
                currentColumn.template = currentColumn.column.template ? currentColumn.column.template : self._columnTemplate;
                if (self._isSupportLadder(self._options.ladderProperties)) {
                    currentColumn.ladder = self._ladder.ladder[current.index];
                    currentColumn.ladderWrapper = LadderWrapper;
                }
                if (current.item.get) {
                    currentColumn.column.needSearchHighlight = !!_private.isNeedToHighlight(current.item, currentColumn.column.displayProperty, current.searchValue);
                    currentColumn.searchValue = current.searchValue;
                }
                if (stickyColumn) {
                    isStickedColumn = stickyColumn.index === (current.multiSelectVisibility !== 'hidden' ? currentColumn.columnIndex + 1 : currentColumn.columnIndex);
                    if (detection.isNotFullGridSupport) {
                        currentColumn.hiddenForLadder = isStickedColumn && !self._ladder.stickyLadder[current.index].ladderLength;
                    } else {
                        currentColumn.hiddenForLadder = isStickedColumn && self._ladder.stickyLadder[current.index].ladderLength !== 1;
                        currentColumn.styleForLadder = currentColumn.cellStyleForLadder = 'grid-area: ' +
                            (current.index + 1) + ' / ' +
                            (currentColumn.columnIndex + 1) + ' / ' +
                            'span 1 / ' +
                            'span 1;';
                    }
                }

                // For browsers with partial grid support need to set explicit rows' style with grid-row and grid-column
                // TODO: Удалить проверку после полного перехода на table-layout. По задаче https://online.sbis.ru/doc/5d2c482e-2b2f-417b-98d2-8364c454e635
                if (self._isPartialGridSupport && !self._shouldUseTableLayout || current.columnScroll && !self._options.disableColumnScrollCellStyles) {
                    currentColumn.gridCellStyles = GridLayoutUtil.getCellStyles({
                        rowStart: current.rowIndex,
                        columnStart: currentColumn.columnIndex
                    });
                } else {
                    currentColumn.gridCellStyles = '';
                }
                return currentColumn;
            };
            return current;
        },

        getCurrent: function() {
            var dispItem = this._model._display.at(this._model._curIndex);
            return this.getItemDataByItem(dispItem);
        },

        toggleGroup: function(group, state) {
            this._model.toggleGroup(group, state);
        },

        getNext: function() {
            return this._model.getNext();
        },

        isLast: function() {
            return this._model.isLast();
        },

        setStickyColumn: function(stickyColumn) {
            this._options.stickyColumn = stickyColumn;
            this._ladder = _private.prepareLadder(this);
            this._nextModelVersion();
        },

        setColumnScroll(columnScroll: boolean): void {
            this._options.columnScroll = columnScroll;
            this._nextModelVersion();
        },

        setLadderProperties: function(ladderProperties) {
            if (!isEqual(this._options.ladderProperties, ladderProperties)) {
                this._options.ladderProperties = ladderProperties;
                this._ladder = _private.prepareLadder(this);
                this._nextModelVersion();
            }
        },

        updateIndexes: function(startIndex, stopIndex) {
            this._model.updateIndexes(startIndex, stopIndex);
        },

        setItems: function(items) {
            this._model.setItems(items);
            this._updateLastItemKey();
        },

        setItemTemplateProperty: function(itemTemplateProperty) {
            this._model.setItemTemplateProperty(itemTemplateProperty);
        },

        setBaseItemTemplateResolver(baseItemTemplateResolver: () => TemplateFunction): void {
            this._baseItemTemplateResolver = baseItemTemplateResolver;
            this.resetCachedItemData();
        },

        getItems: function() {
            return this._model.getItems();
        },

        setActiveItem: function(itemData) {
            this._model.setActiveItem(itemData);
        },

        mergeItems: function(items) {
            this._model.mergeItems(items);
        },

        appendItems: function(items) {
            this._model.appendItems(items);
        },

        prependItems: function(items) {
            this._model.prependItems(items);
        },

        setItemActions: function(item, actions) {
            return this._model.setItemActions(item, actions);
        },

        nextModelVersion: function() {
            this._model.nextModelVersion.apply(this._model, arguments);
        },

        _setEditingItemData: function (itemData) {
            // TODO: Удалить после полного перехода на table-layout. По задаче https://online.sbis.ru/doc/5d2c482e-2b2f-417b-98d2-8364c454e635
            if (this._isPartialGridSupport && !this._shouldUseTableLayout) {
                if (itemData) {
                    itemData.rowIndex = itemData.index + this._getRowIndexHelper().getTopOffset();
                    this.editingRowGridStyles = _private.getEditingRowStyles(this, itemData);
                } else {
                    this.editingRowGridStyles = null;
                }
            }
            this._model._setEditingItemData(itemData);

            /*
            * https://online.sbis.ru/opendoc.html?guid=8a8dcd32-104c-4564-8748-2748af03b4f1
            * Нужно пересчитать и перерисовать записи после начала и завершения редактирования.
            * При старте редактирования индексы пересчитываются, и, в случе если началось добавление, индексы записей после добавляемой увеличиваются на 1.
            * При отмене добавления индексы нужно вернуть в изначальное состояние.
            *
            * При переходе на table-layout и отказе от partialGrid данное поведение изменится на более оптимальное
            * https://online.sbis.ru/doc/5d2c482e-2b2f-417b-98d2-8364c454e635
            * */
            // TODO: Удалить проверку после полного перехода на table-layout. По задаче https://online.sbis.ru/doc/5d2c482e-2b2f-417b-98d2-8364c454e635
            if (this._isPartialGridSupport && !this._shouldUseTableLayout || this._options.columnScroll) {
                this._nextModelVersion();
            }
        },

        getEditingItemData(): object | null {
            return this._model.getEditingItemData();
        },

        setItemActionVisibilityCallback: function(callback) {
            this._model.setItemActionVisibilityCallback(callback);
        },

        _calcItemVersion: function(item, key, index) {
            var
                version = this._model._calcItemVersion(item, key) + (item.getId ? item.getId() : '');

            if (this._lastItemKey === key) {
                version = 'LAST_ITEM_' + version;
            }

            // TODO: Удалить проверку после полного перехода на table-layout. По задаче https://online.sbis.ru/doc/5d2c482e-2b2f-417b-98d2-8364c454e635
            if (this._isPartialGridSupport && !this._shouldUseTableLayout && this._model.getHoveredItem() === item) {
                version = 'HOVERED_' + version;
            }

            version += _private.calcLadderVersion(this._ladder, index);

            return version;
        },

        _prepareDisplayItemForAdd: function(item) {
            return this._model._prepareDisplayItemForAdd(item);
        },

        getCurrentIndex: function() {
            return this._model.getCurrentIndex();
        },

        getItemActions: function(item) {
            return this._model.getItemActions(item);
        },

        getIndexBySourceItem: function(item) {
            return this._model.getIndexBySourceItem(item);
        },

        at: function(index) {
            return this._model.at(index);
        },

        getCount: function() {
            return this._model.getCount();
        },

        setSwipeItem: function(itemData) {
            this._model.setSwipeItem(itemData);
        },

        setRightSwipedItem: function(itemData) {
            this._model.setRightSwipedItem(itemData);
        },

        setShowRowSeparator: function(showRowSeparator) {
            this._options.showRowSeparator = showRowSeparator;
            this._nextModelVersion();
        },

        setRowSeparatorVisibility: function(rowSeparatorVisibility) {
            this._options.rowSeparatorVisibility = rowSeparatorVisibility;
            this._nextModelVersion();
        },

        setStickyColumnsCount: function(stickyColumnsCount) {
            this._options.stickyColumnsCount = stickyColumnsCount;
            this._nextModelVersion();
        },

        updateSelection: function(selectedKeys) {
            this._model.updateSelection(selectedKeys);
        },

        setDragTargetPosition: function(position) {
            this._model.setDragTargetPosition(position);
        },

        getDragTargetPosition: function() {
            return this._model.getDragTargetPosition();
        },

        setDragEntity: function(entity) {
            this._model.setDragEntity(entity);
        },

        getDragEntity: function() {
            return this._model.getDragEntity();
        },

        setDragItemData: function(itemData) {
            this._model.setDragItemData(itemData);
        },

        getDragItemData: function() {
            return this._model.getDragItemData();
        },

        calculateDragTargetPosition: function(targetData, position) {
            return this._model.calculateDragTargetPosition(targetData, position);
        },

        getActiveItem: function() {
            return this._model.getActiveItem();
        },

        getChildren: function() {
            return this._model.getChildren.apply(this._model, arguments);
        },

        getStartIndex(): number {
            return this._model.getStartIndex();
        },

        getStopIndex(): number {
            return this._model.getStopIndex();
        },

        setHoveredItem: function (item) {
            this._model.setHoveredItem(item);
        },

        getHoveredItem: function () {
            return this._model.getHoveredItem();
        },

        getDisplay: function () {
            return this._model.getDisplay();
        },

        isFullGridSupport(): boolean {
            return this._isFullGridSupport;
        },

        // TODO: Удалить после полного перехода на table-layout. По задаче https://online.sbis.ru/doc/5d2c482e-2b2f-417b-98d2-8364c454e635
        isPartialGridSupport(): boolean {
            return this._isPartialGridSupport;
        },

        // TODO: Возможно тоже можно удалить проверку после полного перехода на table-layout. По задаче https://online.sbis.ru/doc/5d2c482e-2b2f-417b-98d2-8364c454e635
        isNoGridSupport(): boolean {
            return this._isNoGridSupport;
        },

        // TODO: Удалить после полного перехода на table-layout. По задаче https://online.sbis.ru/doc/5d2c482e-2b2f-417b-98d2-8364c454e635
        shouldUseTableLayout(): boolean {
            return this._shouldUseTableLayout;
        },

        // TODO: Удалить после полного перехода на table-layout. По задаче https://online.sbis.ru/doc/5d2c482e-2b2f-417b-98d2-8364c454e635
        // Only for browsers with partial grid support. Explicit grid styles for footer with grid row and grid column
        getFooterStyles: function (): string {
            // Can't calc grid-row classes for old browser without display
            return this.getDisplay() ? _private.getFooterStyles(this) : '';
        },

        // TODO: Удалить после полного перехода на table-layout. По задаче https://online.sbis.ru/doc/5d2c482e-2b2f-417b-98d2-8364c454e635
        // Only for browsers with partial grid support. Explicit grid styles for empty template with grid row and grid column
        getEmptyTemplateStyles: function() {
            return _private.getEmptyTemplateStyles(this);
        },

        getBottomPaddingStyles(): string {
            let styles = '';

            // Везде, кроме таблиц
            // TODO: Поправить проверку после полного перехода на table-layout. По задаче https://online.sbis.ru/doc/5d2c482e-2b2f-417b-98d2-8364c454e635
            if (!this._shouldUseTableLayout) {
                const columnStart = this.getMultiSelectVisibility() === 'hidden' ? 0 : 1;
                const rowIndex = this._getRowIndexHelper().getBottomPaddingRowIndex();

                styles += GridLayoutUtil.getCellStyles({
                    rowStart: rowIndex,
                    columnStart,
                    columnSpan: this._columns.length
                });
            }

            return styles;
        },

        // TODO: Удалить после полного перехода на table-layout. По задаче https://online.sbis.ru/doc/5d2c482e-2b2f-417b-98d2-8364c454e635
        setHandlersForPartialSupport(handlersList: Record<string, Function>): void {
            this._eventHandlersForPartialSupport = handlersList;
        },

        // TODO: Удалить после полного перехода на table-layout. По задаче https://online.sbis.ru/doc/5d2c482e-2b2f-417b-98d2-8364c454e635
        getHandlersForPartialSupport(): Record<string, Function> {
            return this._eventHandlersForPartialSupport;
        },

        _isFirstInGroup: function(item, groupId?): boolean {
            const display = this._model._display;
            let currentGroupItems;

            groupId = groupId || this._getItemGroup(item);
            if (groupId === undefined || groupId === null) {
                return false;
            }

            currentGroupItems = display.getGroupItems(groupId);

            // If current item is out of any group.
            if (!currentGroupItems || currentGroupItems.length === 0) {
                return false;
            }


            return item === currentGroupItems[0].getContents();
        },

        _getItemGroup: function(item): boolean {
            const groupingKeyCallback = this._options.groupingKeyCallback;
            if (groupingKeyCallback) {
                return groupingKeyCallback(item);
            } else {
                return null;
            }
        },

        markItemReloaded: function(key) {
            this._model.markItemReloaded(key);
        },

        clearReloadedMarks: function() {
            this._model.clearReloadedMarks();
        },

        destroy: function() {
            this._model.unsubscribe('onListChange', this._onListChangeFn);
            this._model.unsubscribe('onMarkedKeyChanged', this._onMarkedKeyChangedFn);
            this._model.unsubscribe('onGroupsExpandChange', this._onGroupsExpandChangeFn);
            this._model.unsubscribe('onCollectionChange', this._onCollectionChangeFn);
            this._model.destroy();
            GridViewModel.superclass.destroy.apply(this, arguments);
        },

        // region Table Layout

        _isFixedLayout(): boolean {
            return true;
        },

        _prepareWidthForTableColumn(column: IGridColumn): string {
            let resultWidth;

            if (column.compatibleWidth) {
                resultWidth = column.compatibleWidth;
            } else if (!column.width) {
                resultWidth = 'auto';
            } else {
                if (
                    column.width.match(GridLayoutUtil.RegExps.pxValue) ||
                    column.width.match(GridLayoutUtil.RegExps.percentValue)
                ) {
                    resultWidth = column.width;
                } else {
                    resultWidth = 'auto';
                }
            }
            return resultWidth;
        },

        getColspanFor(gridElementName: GridColspanableElements): number {
            switch (gridElementName) {
                case 'customResults':
                case 'editingRow':
                    return this._columns.length;
                case 'fixedColumnOfColumnScroll':
                    return this._options.stickyColumnsCount || 1;
                case 'scrollableColumnOfColumnScroll':
                    return this._columns.length - (this._options.stickyColumnsCount || 1);
                default:
                    return 1;
            }
        },

        // region Colgroup columns

        _prepareColgroupColumns(columns: IGridColumn[], hasMultiSelect: boolean): void {

            const colgroupColumns: IColgroupColumn[] = [];

            columns.forEach((column, index) => {
                colgroupColumns.push({
                    classes: 'controls-Grid__colgroup-column',
                    style: `width: ${this._prepareWidthForTableColumn(column)};`,
                    index: index + (hasMultiSelect ? 1 : 0)
                });
            });

            if (hasMultiSelect) {
                colgroupColumns.unshift({
                    classes: 'controls-Grid__colgroup-column controls-Grid__colgroup-columnMultiSelect' + `_theme-${this._options.theme}`,
                    // Ширина колонки чекбоксов задается через CSS класс
                    style: '',
                    index: 0
                });
            }

            this._colgroupColumns = colgroupColumns;
        },

        getCurrentColgroupColumn(): IColgroupColumn {
            return this._colgroupColumns[this._curColgroupColumnIndex];
        },

        resetColgroupColumns(): void {
            this._curColgroupColumnIndex = 0;
        },

        isEndColgroupColumn(): boolean {
            return this._curColgroupColumnIndex < this._colgroupColumns.length;
        },

        goToNextColgroupColumn(): void {
            this._curColgroupColumnIndex++;
        }

        // endregion Colgroup columns

        // endregion Table Layout

    });

GridViewModel._private = _private;

export = GridViewModel;
