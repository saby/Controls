define('Controls/List/Grid/GridViewModel', [
   'Controls/List/BaseViewModel',
   'Controls/List/ListViewModel'
], function(BaseViewModel, ListViewModel) {

   'use strict';

   var
      _private = {
         getPaddingCellClasses: function(params) {
            var
               preparedClasses = '';

            // Колонки
            if (params.multiselect ? params.columnIndex > 1 :  params.columnIndex > 0) {
               preparedClasses += ' controls-Grid__cell_spacingLeft';
            }
            if (params.columnIndex < params.columns.length - 1) {
               preparedClasses += ' controls-Grid__cell_spacingRight';
            }

            // Отступ для первой колонки. Если режим мультиселект, то отступ обеспечивается чекбоксом.
            if (params.columnIndex === 0 && !params.multiselect) {
               preparedClasses += ' controls-Grid__cell_spacingFirstCol_' + (params.leftPadding || 'default');
            }

            // Отступ для последней колонки
            if (params.columnIndex === params.columns.length - 1) {
               preparedClasses += ' controls-Grid__cell_spacingLastCol_' + (params.rightPadding || 'default');
            }

            // Межстрочный интервал
            preparedClasses += ' controls-Grid__row-cell_rowSpacing_' + (params.rowSpacing || 'default');

            // Горизонтальное выравнивание колонок
            if (params.columns[params.columnIndex].align) {
               preparedClasses += ' controls-Grid__row-cell_halign_' + params.columns[params.columnIndex].align;
            }

            // Вертикальное выравнивание хедера
            if (params.columns[params.columnIndex].valign) {
               preparedClasses += ' controls-Grid__header-cell_valign_' + params.columns[params.columnIndex].valign;
            }
            return preparedClasses;
         },

         prepareRowSeparatorClasses: function(showRowSeparator, rowIndex, rowCount) {
            var
               result = '';
            if (showRowSeparator) {
               if (rowIndex === 0) {
                  result += ' controls-Grid__row-cell_firstRow';
                  result += ' controls-Grid__row-cell_withRowSeparator_firstRow';
               } else {
                  if (rowIndex === rowCount - 1) {
                     result += ' controls-Grid__row-cell_lastRow';
                     result += ' controls-Grid__row-cell_withRowSeparator_lastRow';
                  }
               }
               result += ' controls-Grid__row-cell_withRowSeparator';
            } else {
               result += ' controls-Grid__row-cell_withoutRowSeparator';
            }
            return result;
         },

         getItemColumnCellClasses: function(current) {
            var
               cellClasses = 'controls-Grid__row-cell';

            cellClasses += _private.prepareRowSeparatorClasses(current.showRowSeparator, current.index, current.dispItem.getOwner().getCount() - 1);

            // Если включен множественный выбор и рендерится первая колонка с чекбоксом
            if (current.multiselect && current.columnIndex === 0) {
               cellClasses += ' controls-Grid__row-cell-checkbox';
            } else {
               cellClasses += _private.getPaddingCellClasses({
                  columns: current.columns,
                  columnIndex: current.columnIndex,
                  multiselect: current.multiselect,
                  leftPadding: current.leftPadding,
                  rightPadding: current.rightPadding,
                  rowSpacing: current.rowSpacing
               });
            }

            cellClasses += ' controls-Grid__row-cell_rowSpacing_default';

            if (current.isSelected) {
               if (current.columnIndex === 0) {
                  cellClasses += ' controls-Grid__row-cell_withSelectionMarker';
               }
            }

            return cellClasses;
         }
      },

      GridViewModel = BaseViewModel.extend({
         _model: null,
         _columnTemplate: null,

         _columns: [],
         _curColumnIndex: 0,

         _headerColumns: [],
         _curHeaderColumnIndex: 0,

         _resultsColumns: [],
         _curResultsColumnIndex: 0,

         _colgroupColumns: [],
         _curColgroupColumnIndex: 0,

         _withLadder: false,
         _drawLadder: false,
         _ladder: {
            ladderValue: null,
            currentColumn: null,
            rowIndex: null,
            columnIndex: null,
            ladderLength: null
         },

         constructor: function(cfg) {
            var
               self = this;
            this._options = cfg;
            GridViewModel.superclass.constructor.apply(this, arguments);
            this._model = this._createModel(cfg);
            this._model.subscribe('onListChange', function() {
               self._nextVersion();
               self._notify('onListChange');
            });
            this._prepareHeaderColumns(this._options.header, this._options.multiselect);
            this._prepareResultsColumns(this._options.columns, this._options.multiselect);
            this._prepareColgroupColumns(this._options.columns, this._options.multiselect);
         },

         _createModel: function(cfg) {
            return new ListViewModel({
               items: cfg.items,
               keyProperty: cfg.keyProperty,
               displayProperty: cfg.displayProperty,
               markedKey: cfg.markedKey,
               multiselect: cfg.multiselect
            });
         },

         setColumnTemplate: function(columnTpl) {
            this._columnTemplate = columnTpl;
         },

         // -----------------------------------------------------------
         // ---------------------- headerColumns ----------------------
         // -----------------------------------------------------------

         getHeader: function() {
            return this._options.header;
         },

         setHeader: function(columns) {
            this._options.header = columns;
            this._prepareHeaderColumns(this._options.header, this._options.multiselect);
         },

         _prepareHeaderColumns: function(columns, multiselect) {
            if (multiselect) {
               this._headerColumns = [{}].concat(columns);
            } else {
               this._headerColumns = columns;
            }
            this.resetHeaderColumns();
         },

         resetHeaderColumns: function() {
            this._curHeaderColumnIndex = 0;
         },

         getCurrentHeaderColumn: function() {
            var
               columnIndex = this._curHeaderColumnIndex,
               cellClasses = 'controls-Grid__header-cell';

            // Если включен множественный выбор и рендерится первая колонка с чекбоксом
            if (this.getMultiselect() && columnIndex === 0) {
               cellClasses += ' controls-Grid__header-cell-checkbox';
            } else {
               cellClasses += _private.getPaddingCellClasses({
                  columns: this._headerColumns,
                  columnIndex: columnIndex,
                  multiselect: this._options.multiselect,
                  leftPadding: this._options.leftPadding,
                  rightPadding: this._options.rightPadding,
                  rowSpacing: this._options.rowSpacing
               });
            }

            return {
               column: this._headerColumns[this._curHeaderColumnIndex],
               cellClasses: cellClasses,
               index: columnIndex
            };
         },

         goToNextHeaderColumn: function() {
            this._curHeaderColumnIndex++;
         },

         isEndHeaderColumn: function() {
            return this._curHeaderColumnIndex < this._headerColumns.length;
         },

         // -----------------------------------------------------------
         // ---------------------- resultColumns ----------------------
         // -----------------------------------------------------------

         getResults: function() {
            return this._options.results;
         },

         _prepareResultsColumns: function(columns, multiselect) {
            if (multiselect) {
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
               cellClasses = 'controls-Grid__results-cell';

            // Если включен множественный выбор и рендерится первая колонка с чекбоксом
            if (this.getMultiselect() && columnIndex === 0) {
               cellClasses += ' controls-Grid__results-cell-checkbox';
            } else {
               cellClasses += _private.getPaddingCellClasses({
                  columns: this._resultsColumns,
                  columnIndex: columnIndex,
                  multiselect: this._options.multiselect,
                  leftPadding: this._options.leftPadding,
                  rightPadding: this._options.rightPadding,
                  rowSpacing: this._options.rowSpacing
               });
            }

            return {
               column: this._resultsColumns[columnIndex],
               cellClasses: cellClasses,
               index: columnIndex
            };
         },

         goToNextResultsColumn: function() {
            this._curResultsColumnIndex++;
         },

         isEndResultsColumn: function() {
            return this._curResultsColumnIndex < this._resultsColumns.length;
         },

         // -----------------------------------------------------------
         // ------------------------ colgroup -------------------------
         // -----------------------------------------------------------

         _prepareColgroupColumns: function(columns, multiselect) {
            if (multiselect) {
               this._colgroupColumns = [{}].concat(columns);
            } else {
               this._colgroupColumns = columns;
            }
            this.resetColgroupColumns();
         },

         getCurrentColgroupColumn: function() {
            var
               column = this._colgroupColumns[this._curColgroupColumnIndex];
            return {
               column: column,
               index: this._curColgroupColumnIndex,
               style: typeof column.width !== 'undefined' ? 'width: ' + column.width : ''
            };
         },

         resetColgroupColumns: function() {
            this._curColgroupColumnIndex = 0;
         },

         isEndColgroupColumn: function() {
            return this._curColgroupColumnIndex < this._colgroupColumns.length;
         },

         goToNextColgroupColumn: function() {
            this._curColgroupColumnIndex++;
         },

         // -----------------------------------------------------------
         // -------------------------- items --------------------------
         // -----------------------------------------------------------

         getColumns: function() {
            return this._options.columns;
         },

         getMultiselect: function() {
            return this._options.multiselect;
         },

         setMultiselect: function(multiselect) {
            this._options.multiselect = multiselect;
            this._prepareHeaderColumns(this._options.header, this._options.multiselect);
            this._prepareResultsColumns(this._options.columns, this._options.multiselect);
         },

         getItemById: function(id, keyProperty) {
            return this._model.getItemById(id, keyProperty);
         },

         setMarkedKey: function(key) {
            this._model.setMarkedKey(key);
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

         getCurrent: function() {
            var
               self = this,
               current = this._model.getCurrent();
            current.leftPadding = this._options.leftPadding;
            current.rightPadding = this._options.rightPadding;
            current.rowSpacing = this._options.rowSpacing;
            current.multiselect = this._options.multiselect;
            current.showRowSeparator = this._options.showRowSeparator;
            current.ladderSupport = !!this._options.stickyFields;

            if (current.multiselect) {
               current.columns = [{}].concat(this._options.columns);
            } else {
               current.columns = this._options.columns;
            }
            current.columnIndex = 0;
            current.resetColumnIndex = function() {
               current.columnIndex = 0;
            };
            current.goToNextColumn = function() {
               current.columnIndex++;
            };
            current.getLastColumnIndex = function() {
               return current.columns.length - 1;
            };
            current.getCurrentColumn = function() {
               var
                  currentColumn = {
                     item: current.item,
                     dispItem: current.dispItem,
                     keyProperty: current.keyProperty,
                     displayProperty: current.displayProperty,
                     index: current.index,
                     key: current.key,
                     getPropValue: current.getPropValue,
                     isEditing: current.isEditing
                  };
               currentColumn.columnIndex = current.columnIndex;
               currentColumn.cellClasses = _private.getItemColumnCellClasses(current);
               currentColumn.column = current.columns[current.columnIndex];
               currentColumn.template = currentColumn.column.template ? currentColumn.column.template : self._columnTemplate;
               if (current.ladderSupport) {
                  if (self._withLadder && self._ladder.columnIndex === currentColumn.columnIndex) {
                     currentColumn.withLadder = true;
                  }
                  currentColumn.cellStyleForLadder = 'grid-area: ' +
                     +(current.index + 1) + ' / ' +
                     (currentColumn.columnIndex + 1) + ' / ' +
                     'span 1 / ' +
                     'span 1;';
               }
               return currentColumn;
            };

            if (current.ladderSupport) {
               this._processLadder(current);
               if (this._drawLadder) {
                  current.ladder = this._ladder;
                  current.ladder.style = 'grid-area: ' +
                     (current.ladder.rowIndex + 1) + ' / ' +
                     (current.ladder.columnIndex + 1) + ' / ' +
                     'span ' + current.ladder.ladderLength + ' / ' +
                     'span 1;';
               }
            }
            return current;
         },

         _processLadder: function(current) {
            var
               ladderField = this._options.stickyFields[0],
               nextItem,
               nextLadderValue;

            // если рисуем первый элемент
            if (current.index === 0) {
               this._ladder.ladderValue = current.getPropValue(current.item, ladderField);
            }

            if (this._drawLadder) {
               this._withLadder = false;
               this._drawLadder = false;
               this._ladder.currentColumn = null;
               this._ladder.rowIndex = null;
               this._ladder.columnIndex = null;
               this._ladder.ladderLength = null;
            }

            if (this.isLast()) {
               if (this._ladder.ladderLength > 1) {
                  this._drawLadder = true;
               }
               return;
            }
            nextItem = this.getNext();

            // смотрим на следующий item
            nextLadderValue = nextItem.getPropValue(nextItem.item, ladderField);

            // если лесенка у следующего item такая же, то увеличиваем длинну лесенки, запоминаем current и rowIndex
            if (this._ladder.ladderValue === nextLadderValue) {
               this._withLadder = true;

               // запоминаем только если ранее не запоминали
               if (!this._ladder.currentColumn) {
                  this._ladder.currentColumn = current.getCurrentColumn();
                  this._ladder.rowIndex = current.index;
                  this._ladder.columnIndex = 0;
                  this._ladder.ladderLength = 1;
               }
               this._ladder.ladderLength++;
            } else {
               if (this._ladder.ladderLength > 1) {
                  this._drawLadder = true;
               }
               this._ladder.ladderValue = nextLadderValue;
            }
         },

         getNext: function() {
            return this._model.getNext();
         },

         isLast: function() {
            return this._model.isLast();
         },

         updateIndexes: function(startIndex, stopIndex) {
            this._model.updateIndexes(startIndex, stopIndex);
         },

         setItems: function(items) {
            this._model.setItems(items);
         },

         setActiveItem: function(itemData) {
            this._model.setActiveItem(itemData);
         },

         appendItems: function(items) {
            this._model.appendItems(items);
         },

         prependItems: function(items) {
            this._model.prependItems(items);
         },

         setItemActions: function(item, actions) {
            this._model.setItemActions(item, actions);
         },

         _setEditingItemData: function(itemData) {
            this._model._setEditingItemData(itemData);
            this._nextVersion();
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

         _prepareDisplayItemForAdd: function(item) {
            return this._model._prepareDisplayItemForAdd(item);
         },

         getDragTargetPosition: function() {
            return this._model.getDragTargetPosition();
         },

         getDragTargetPosition: function() {
            return this._model.getDragTargetPosition();
         },

         destroy: function() {
            this._model.destroy();
            GridViewModel.superclass.destroy.apply(this, arguments);
         }
      });

   GridViewModel._private = _private;

   return GridViewModel;
});
