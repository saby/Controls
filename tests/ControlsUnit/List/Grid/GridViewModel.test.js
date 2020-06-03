define(['Controls/grid', 'Core/core-merge', 'Types/collection', 'Types/entity', 'Core/core-clone', 'Controls/_grid/utils/GridLayoutUtil', 'Env/Env', 'ControlsUnit/CustomAsserts'], function(gridMod, cMerge, collection, entity, clone, GridLayoutUtil, Env, cAssert) {
   var
      theme = 'default',
      gridData = [
         {
            'id': '123',
            'title': 'Хлеб',
            'price': 50,
            'balance': 15
         },
         {
            'id': '234',
            'title': 'Хлеб',
            'price': 150,
            'balance': 3
         },
         {
            'id': '345',
            'title': 'Масло',
            'price': 100,
            'balance': 5
         },
         {
            'id': '456',
            'title': 'Помидор',
            'price': 75,
            'balance': 7
         },
         {
            'id': '567',
            'title': 'Капуста китайская',
            'price': 35,
            'balance': 2
         }
      ],
      gridColumns = [
         {
            displayProperty: 'title',
            width: '1fr',
            valign: 'top',
            style: 'default',
            textOverflow: 'ellipsis'
         },
         {
            displayProperty: 'price',
            width: 'auto',
            align: 'right',
            valign: 'bottom',
            style: 'default'
         },
         {
            displayProperty: 'balance',
            width: 'auto',
            align: 'right',
            valign: 'middle',
            style: 'default'
         }
      ],
      gridHeader = [
            {
               title: '',
               style: 'default',
               startRow: 1,
               endRow: 2,
               startColumn: 1,
               endColumn: 2
            },
            {
               title: 'Цена',
               align: 'right',
               style: 'default',
               sortingProperty: 'price',
               startRow: 1,
               endRow: 2,
               startColumn: 2,
               endColumn: 3
            },
            {
               title: 'Остаток',
               align: 'right',
               style: 'default',
               startRow: 1,
               endRow: 2,
               startColumn: 3,
               endColumn: 4
            }
      ],
      gridHeaderWithColumns = [
         {
            endColumn: 2,
            endRow: 2,
            startColumn: 1,
            startRow: 1,
            style: 'default',
            title: ''
         },
         {
            title: 'Цена',
            align: 'right',
            style: 'default',
            sortingProperty: 'price',
            startColumn: 2,
            endColumn: 3
         },
         {
            title: 'Остаток',
            align: 'right',
            style: 'default',
            startColumn: 3,
            endColumn: 4
         }
      ],
      itemActions = [],
      cfg = {
         theme: theme,
         keyProperty: 'id',
         displayProperty: 'title',
         markedKey: '123',
         markerVisibility: 'visible',
         multiSelectVisibility: 'visible',
         stickyColumnsCount: 1,
         header: gridHeader,
         columns: gridColumns,
         items: new collection.RecordSet({
            rawData: gridData,
            keyProperty: 'id'
         }),
         itemActions: itemActions,
         itemPadding: {
            left: 'XL',
            right: 'L',
            top: 'L',
            bottom: 'L'
         },
         rowSeparatorVisibility: true,
         rowSeparatorSize: 's',
         style: 'default',
         sorting: [{price: 'DESC'}],
         searchValue: 'test'
      };

   describe('Controls.List.Grid.GridViewModel', function() {
      describe('DragNDrop methods', function() {
         var gridViewModel = new gridMod.GridViewModel(cfg);

         it('setDragTargetPosition', function() {
            var dragTargetPosition = {};
            gridViewModel.setDragTargetPosition(dragTargetPosition);
            assert.equal(gridViewModel.getDragTargetPosition(), dragTargetPosition);
         });

         it('setDragEntity', function() {
            var dragEntity = {};
            gridViewModel.setDragEntity(dragEntity);
            assert.equal(gridViewModel.getDragEntity(), dragEntity);
         });

         it('setDragItemData', function() {
            var dragItemData = {};
            gridViewModel.setDragItemData(dragItemData);
            assert.equal(gridViewModel.getDragItemData(), dragItemData);
         });
      });

      describe('"_private" block', function() {
         const dummyDispitem = {
            getContents: () => [],
            getInstanceId: () => 1,
            isEditing: () => false,
            setEditing: (v) => {}
         };

         it('calcItemColumnVersion', function() {
            assert.equal(gridMod.GridViewModel._private.calcItemColumnVersion({
               _columnsVersion: 1,
               _options: {
                  multiSelectVisibility: 'hidden'
               }
            }, 1, 0), '1_1_0');
            assert.equal(gridMod.GridViewModel._private.calcItemColumnVersion({
               _columnsVersion: 1,
               _options: {
                  multiSelectVisibility: 'visible'
               }
            }, 1, 0), '1_1_-1');
            assert.equal(gridMod.GridViewModel._private.calcItemColumnVersion({
               _columnsVersion: 1,
               _options: {
                  multiSelectVisibility: 'visible'
               }
            }, 1, 1), '1_1_0');
         });

         it('isNeedToHighlight', function() {
            var item = new entity.Model({
               rawData: {
                  id: 0,
                  title: 'test'
               },
               keyProperty: 'id'
            });
            assert.isFalse(!!gridMod.GridViewModel._private.isNeedToHighlight(item, 'title', 'xxx'));
            assert.isFalse(!!gridMod.GridViewModel._private.isNeedToHighlight(item, 'title', ''));
            assert.isTrue(!!gridMod.GridViewModel._private.isNeedToHighlight(item, 'title', 'tes'));
         });
         it('calcLadderVersion', function () {
            var
                onlySimpleLadder = {
                   ladder: {
                      0: {
                         'property1': {
                            ladderLength: 2
                         },
                         'property2': {
                            ladderLength: 1
                         },
                         'property3': {}
                      },
                      1: {

                      }
                   },
                   stickyLadder: {}
                },
               withSticky = {
                  ladder: {
                     0: {
                        'property1': {
                           ladderLength: 2
                        },
                        'property2': {
                           ladderLength: 1
                        },
                        'property3': {}
                     },
                     1: {
                     }
                  },
                  stickyLadder: {
                     0: {
                        ladderLength: 2,
                        headingStyle: 'grid-row: span 2'
                     },
                     1: {},
                  }
               };
            assert.equal('LP_', gridMod.GridViewModel._private.calcLadderVersion(onlySimpleLadder, 0));
            assert.equal('LP_', gridMod.GridViewModel._private.calcLadderVersion(onlySimpleLadder, 1));

            assert.equal('LP_SP_2', gridMod.GridViewModel._private.calcLadderVersion(withSticky, 0));
            assert.equal('LP_SP_0', gridMod.GridViewModel._private.calcLadderVersion(withSticky, 1));


         });
         it('isDrawActions', function() {
            var
               testCases = [
                  {
                     inputData: {
                        itemData: {
                           shouldDisplayActions: () => false,
                           multiSelectVisibility: 'hidden',
                           getLastColumnIndex: function() {
                              return 0;
                           },
                           isActive: () => true
                        },
                        currentColumn: {
                           columnIndex: 0
                        },
                        colspan: false
                     },
                     resultData: false
                  },
                  {
                     inputData: {
                        itemData: {
                           shouldDisplayActions: () => true,
                           multiSelectVisibility: 'hidden',
                           getLastColumnIndex: function() {
                              return 0;
                           },
                           isActive: () => true
                        },
                        currentColumn: {
                           columnIndex: 0
                        },
                        colspan: false
                     },
                     resultData: true
                  },
                  {
                     inputData: {
                        itemData: {
                           shouldDisplayActions: () => true,
                           multiSelectVisibility: 'hidden',
                           getLastColumnIndex: function() {
                              return 1;
                           },
                           isActive: () => true
                        },
                        currentColumn: {
                           columnIndex: 0
                        },
                        colspan: false
                     },
                     resultData: false
                  },
                  {
                     inputData: {
                        itemData: {
                           shouldDisplayActions: () => true,
                           multiSelectVisibility: 'visible',
                           getLastColumnIndex: function() {
                              return 2;
                           },
                           isActive: () => true
                        },
                        currentColumn: {
                           columnIndex: 1
                        },
                        colspan: false
                     },
                     resultData: false
                  },
                  {
                     inputData: {
                        itemData: {
                           shouldDisplayActions: () => true,
                           multiSelectVisibility: 'visible',
                           getLastColumnIndex: function() {
                              return 2;
                           },
                           isActive: () => true
                        },
                        currentColumn: {
                           columnIndex: 1
                        },
                        colspan: true
                     },
                     resultData: true
                  }
               ];
            testCases.forEach(function(testCase, idx) {
               assert.equal(testCase.resultData,
                  gridMod.GridViewModel._private.isDrawActions(testCase.inputData.itemData, testCase.inputData.currentColumn, testCase.inputData.colspan),
                  'Invalid result data in test #' + idx);
            });
         });

         it('getPaddingCellClasses', function() {
            var
               paramsWithoutMultiselect = {
                  columns: gridColumns,
                  multiSelectVisibility: false,
                  itemPadding: {
                     left: 'XL',
                     right: 'L',
                     top: 'L',
                     bottom: 'L'
                  },
                  cell: {},
                  style: 'default'
               },
               paramsWithMultiselect = {
                  columns: [{}].concat(gridColumns),
                  multiSelectVisibility: true,
                  itemPadding: {
                     left: 'XL',
                     right: 'L',
                     top: 'L',
                     bottom: 'L'
                  },
                  cell: {},
                  style: 'default'
               },
               expectedResultWithoutMultiselect = [
                  ' controls-Grid__cell_spacingRight_theme-default controls-Grid__cell_spacingFirstCol_xl_theme-default controls-Grid__cell_default controls-Grid__row-cell_rowSpacingTop_l_theme-default controls-Grid__row-cell_rowSpacingBottom_l_theme-default',
                  ' controls-Grid__cell_spacingLeft_theme-default controls-Grid__cell_spacingRight_theme-default controls-Grid__cell_default controls-Grid__row-cell_rowSpacingTop_l_theme-default controls-Grid__row-cell_rowSpacingBottom_l_theme-default',
                  ' controls-Grid__cell_spacingLeft_theme-default controls-Grid__cell_spacingLastCol_l_theme-default controls-Grid__cell_default controls-Grid__row-cell_rowSpacingTop_l_theme-default controls-Grid__row-cell_rowSpacingBottom_l_theme-default',
                  ' controls-Grid__cell_spacingRight_theme-default controls-Grid__cell_spacingFirstCol_null_theme-default controls-Grid__cell_default controls-Grid__row-cell_rowSpacingTop_l_theme-default controls-Grid__row-cell_rowSpacingBottom_l_theme-default'],
               expectedResultWithMultiselect = [
                  ' controls-Grid__cell_spacingRight_theme-default controls-Grid__cell_default controls-Grid__row-cell_rowSpacingTop_l_theme-default controls-Grid__row-cell_rowSpacingBottom_l_theme-default',
                  ' controls-Grid__cell_spacingRight_theme-default controls-Grid__cell_default controls-Grid__row-cell_rowSpacingTop_l_theme-default controls-Grid__row-cell_rowSpacingBottom_l_theme-default',
                  ' controls-Grid__cell_spacingLeft_theme-default controls-Grid__cell_spacingRight_theme-default controls-Grid__cell_default controls-Grid__row-cell_rowSpacingTop_l_theme-default controls-Grid__row-cell_rowSpacingBottom_l_theme-default',
                  ' controls-Grid__cell_spacingLeft_theme-default controls-Grid__cell_spacingLastCol_l_theme-default controls-Grid__cell_default controls-Grid__row-cell_rowSpacingTop_l_theme-default controls-Grid__row-cell_rowSpacingBottom_l_theme-default',
                  ' controls-Grid__cell_spacingRight_theme-default controls-Grid__cell_spacingFirstCol_null_theme-default controls-Grid__cell_spacingBackButton_with_multiSelection_theme-default controls-Grid__cell_default controls-Grid__row-cell_rowSpacingTop_l_theme-default controls-Grid__row-cell_rowSpacingBottom_l_theme-default'];
            assert.equal(expectedResultWithoutMultiselect[0],
               gridMod.GridViewModel._private.getPaddingHeaderCellClasses(cMerge(paramsWithoutMultiselect, {columnIndex: 0, rowIndex: 0}), theme),
               'Incorrect value "GridViewModel._private.getPaddingCellClasses(paramsWithoutMultiselect)".');
            assert.equal(expectedResultWithoutMultiselect[1],
               gridMod.GridViewModel._private.getPaddingHeaderCellClasses(cMerge(paramsWithoutMultiselect, {columnIndex: 1}), theme),
               'Incorrect value "GridViewModel._private.getPaddingCellClasses(paramsWithoutMultiselect)".');
            assert.equal(expectedResultWithoutMultiselect[2],
               gridMod.GridViewModel._private.getPaddingHeaderCellClasses(cMerge(paramsWithoutMultiselect, {columnIndex: 2, rowIndex: 0}), theme),
               'Incorrect value "GridViewModel._private.getPaddingCellClasses(paramsWithoutMultiselect)".');
            assert.equal(expectedResultWithoutMultiselect[3],
               gridMod.GridViewModel._private.getPaddingHeaderCellClasses(cMerge(paramsWithoutMultiselect, {columnIndex: 0, rowIndex: 0, isBreadCrumbs: true}), theme),
               'Incorrect value "GridViewModel._private.getPaddingCellClasses(paramsWithoutMultiselect)".');

            let headerWitchActionCell = [
               {
                  title: '',
                  style: 'default',
                  startRow: 1,
                  endRow: 2,
                  startColumn: 1,
                  endColumn: 2
               },
               {
                  title: 'Цена',
                  align: 'right',
                  style: 'default',
                  sortingProperty: 'price',
                  startRow: 1,
                  endRow: 2,
                  startColumn: 2,
                  endColumn: 3
               },
               {
                  title: 'Остаток',
                  align: 'right',
                  style: 'default',
                  startRow: 1,
                  endRow: 2,
                  startColumn: 3,
                  endColumn: 4
               },
               {
                  isActionCell: true,
                  startRow: 1,
                  endRow: 2,
                  startColumn: 4,
                  endColumn: 5
               }
            ];

            //------ with actionCell ----
            var paramsWithActionCell = {
                  columns: headerWitchActionCell,
                  multiSelectVisibility: false,
                  itemPadding: {
                     left: 'XL',
                     right: 'L',
                     top: 'L',
                     bottom: 'L'
                  },
                  cell: {},
                  style: 'default',
                  maxEndColumn: 5,
                  hasActionCell: true
               };

            assert.equal(expectedResultWithoutMultiselect[0],
               gridMod.GridViewModel._private.getPaddingHeaderCellClasses({ ...paramsWithActionCell, cell: headerWitchActionCell[0], rowIndex: 0, columnIndex: 0 }, theme),
               'Incorrect value "GridViewModel._private.getPaddingCellClasses(paramsWithoutMultiselect)".');
            assert.equal(expectedResultWithoutMultiselect[1],
               gridMod.GridViewModel._private.getPaddingHeaderCellClasses({ ...paramsWithActionCell, cell: headerWitchActionCell[1], rowIndex: 0, columnIndex: 1 }, theme),
               'Incorrect value "GridViewModel._private.getPaddingCellClasses(paramsWithoutMultiselect)".');
            assert.equal(expectedResultWithoutMultiselect[2],
               gridMod.GridViewModel._private.getPaddingHeaderCellClasses({ ...paramsWithActionCell, cell: headerWitchActionCell[2], rowIndex: 0, columnIndex: 2 }, theme),
               'Incorrect value "GridViewModel._private.getPaddingCellClasses(paramsWithoutMultiselect)".');
            assert.equal('',
               gridMod.GridViewModel._private.getPaddingHeaderCellClasses({ ...paramsWithActionCell, cell: headerWitchActionCell[3], rowIndex: 0, columnIndex: 3 }, theme),
               'Incorrect value "GridViewModel._private.getPaddingCellClasses(paramsWithoutMultiselect)".');



            assert.equal(expectedResultWithMultiselect[0],
               gridMod.GridViewModel._private.getPaddingHeaderCellClasses(cMerge(paramsWithMultiselect, {columnIndex: 0, rowIndex: 0}), theme),
               'Incorrect value "GridViewModel._private.getPaddingCellClasses(paramsWithMultiselect)".');
            assert.equal(expectedResultWithMultiselect[1],
               gridMod.GridViewModel._private.getPaddingHeaderCellClasses(cMerge(paramsWithMultiselect, {columnIndex: 1, rowIndex: 0}), theme),
               'Incorrect value "GridViewModel._private.getPaddingCellClasses(paramsWithMultiselect)".');
            assert.equal(expectedResultWithMultiselect[2],
               gridMod.GridViewModel._private.getPaddingHeaderCellClasses(cMerge(paramsWithMultiselect, {columnIndex: 2, rowIndex: 0}), theme),
               'Incorrect value "GridViewModel._private.getPaddingCellClasses(paramsWithMultiselect)".');
            assert.equal(expectedResultWithMultiselect[3],
               gridMod.GridViewModel._private.getPaddingHeaderCellClasses(cMerge(paramsWithMultiselect, {columnIndex: 3, rowIndex: 0}), theme),
               'Incorrect value "GridViewModel._private.getPaddingCellClasses(paramsWithMultiselect)".');
            assert.equal(expectedResultWithMultiselect[4],
               gridMod.GridViewModel._private.getPaddingHeaderCellClasses(cMerge(paramsWithMultiselect, {columnIndex: 0, rowIndex: 0, isBreadCrumbs: true}), theme),
               'Incorrect value "GridViewModel._private.getPaddingCellClasses(paramsWithMultiselect)".');

         });
         it('getPaddingCellClasses for breadCrumbs in table layout should not add margin class', function () {
            const columnsWithMultiSelect = [{}].concat(clone(gridColumns));
            columnsWithMultiSelect[1].isBreadCrumbs = true;

            const paramsWithMultiselect = {
               columns: columnsWithMultiSelect,
               multiSelectVisibility: true,
               isBreadCrumbs: true,
               isTableLayout: true,
               itemPadding: {
                  left: 'XL',
                  right: 'L',
                  top: 'L',
                  bottom: 'L'
               },
                cell: {},
               columnIndex: 1,
               rowIndex: 0,
               style: 'default'
            };
            const nativeIsFullGridSupport = GridLayoutUtil.isFullGridSupport;
            GridLayoutUtil.isFullGridSupport = () => false;
            assert.equal(
                ' controls-Grid__cell_spacingRight_theme-default controls-Grid__cell_spacingFirstCol_null_theme-default controls-Grid__cell_default controls-Grid__row-cell_rowSpacingTop_l_theme-default controls-Grid__row-cell_rowSpacingBottom_l_theme-default',
                gridMod.GridViewModel._private.getPaddingHeaderCellClasses(paramsWithMultiselect, theme)
            );

            GridLayoutUtil.isFullGridSupport = () => true;

            assert.equal(
                ' controls-Grid__cell_spacingRight_theme-default controls-Grid__cell_spacingFirstCol_null_theme-default controls-Grid__cell_spacingBackButton_with_multiSelection_theme-default controls-Grid__cell_default controls-Grid__row-cell_rowSpacingTop_l_theme-default controls-Grid__row-cell_rowSpacingBottom_l_theme-default',
                gridMod.GridViewModel._private.getPaddingHeaderCellClasses(paramsWithMultiselect, theme)
            );
            GridLayoutUtil.isFullGridSupport = nativeIsFullGridSupport;
         });
         it('getPaddingHeaderCellClasses for multiHeader', function() {
           /*
             ________________________
            |  1  |__2__|__3__|   4  |
            |_____|__5__|__6__|______|
           */
            const headerRows = [
                [
                    {startRow: 1, endRow: 3, startColumn: 1, endColumn: 2},
                    {startRow: 1, endRow: 2, startColumn: 2, endColumn: 3},
                    {startRow: 1, endRow: 2, startColumn: 3, endColumn: 4},
                    {startRow: 1, endRow: 3, startColumn: 4, endColumn: 5},
                ],
               [
                  {startRow: 2, endRow: 3, startColumn: 2, endColumn: 3},
                  {startRow: 2, endRow: 3, startColumn: 3, endColumn: 4},
               ]
            ];

            const expectedResultRow = [
               ' controls-Grid__cell_spacingRight_theme-default controls-Grid__cell_spacingFirstCol_xl_theme-default controls-Grid__cell_default controls-Grid__row-cell_rowSpacingTop_l_theme-default controls-Grid__row-cell_rowSpacingBottom_l_theme-default',
               ' controls-Grid__cell_spacingLeft_theme-default controls-Grid__cell_spacingRight_theme-default controls-Grid__cell_default controls-Grid__row-cell_rowSpacingTop_l_theme-default controls-Grid__row-cell_rowSpacingBottom_l_theme-default',
               ' controls-Grid__cell_spacingLeft_theme-default controls-Grid__cell_spacingLastCol_l_theme-default controls-Grid__cell_default controls-Grid__row-cell_rowSpacingTop_l_theme-default controls-Grid__row-cell_rowSpacingBottom_l_theme-default',
            ]
            const paramsForFirstRow = {
               columns: headerRows[0],
               multiSelectVisibility: false,
               maxEndColumn: 5,
               isMultiHeader: true,
               style: 'default',
               itemPadding: {
                  left: 'XL',
                  right: 'L',
                  top: 'L',
                  bottom: 'L'
               },
            };

            assert.equal(expectedResultRow[0],
                gridMod.GridViewModel._private.getPaddingHeaderCellClasses({...paramsForFirstRow, columnIndex: 0, rowIndex: 0, cell: headerRows[0][0]}, theme),
                'Incorrect value "GridViewModel._private.getPaddingHeaderCellClasses()".');
            assert.equal(expectedResultRow[1],
                gridMod.GridViewModel._private.getPaddingHeaderCellClasses({...paramsForFirstRow, columnIndex: 1, rowIndex: 0, cell: headerRows[0][1]}, theme),
                'Incorrect value "GridViewModel._private.getPaddingHeaderCellClasses()".');
            assert.equal(expectedResultRow[1],
                gridMod.GridViewModel._private.getPaddingHeaderCellClasses({...paramsForFirstRow, columnIndex: 2, rowIndex: 0, cell: headerRows[0][2]}, theme),
                'Incorrect value "GridViewModel._private.getPaddingHeaderCellClasses()".');
            assert.equal(expectedResultRow[2],
                gridMod.GridViewModel._private.getPaddingHeaderCellClasses({...paramsForFirstRow, columnIndex: 3, rowIndex: 0, cell: headerRows[0][3]}, theme),
                'Incorrect value "GridViewModel._private.getPaddingHeaderCellClasses()".');

            const paramsForSecondRow = {
               columns: headerRows[1],
               multiSelectVisibility: false,
               maxEndColumn: 5,
               style: 'default',
               isMultiHeader: true,
               itemPadding: {
                  left: 'XL',
                  right: 'L',
                  top: 'L',
                  bottom: 'L'
               },
            };
            assert.equal(expectedResultRow[1],
                gridMod.GridViewModel._private.getPaddingHeaderCellClasses({...paramsForSecondRow, columnIndex: 0, rowIndex: 1, cell: headerRows[1][0]}, theme),
                'Incorrect value "GridViewModel._private.getPaddingHeaderCellClasses()".');
            assert.equal(expectedResultRow[1],
                gridMod.GridViewModel._private.getPaddingHeaderCellClasses({...paramsForSecondRow, columnIndex: 1, rowIndex: 1, cell: headerRows[1][1]}, theme),
                'Incorrect value "GridViewModel._private.getPaddingHeaderCellClasses()".');
         });

         it('getSortingDirectionByProp', function() {
            assert.equal(gridMod.GridViewModel._private.getSortingDirectionByProp([{test: 'ASC'}, {test2: 'DESC'}], 'test'), 'ASC');
            assert.equal(gridMod.GridViewModel._private.getSortingDirectionByProp([{test: 'ASC'}, {test2: 'DESC'}], 'test2'), 'DESC');
            assert.equal(gridMod.GridViewModel._private.getSortingDirectionByProp([{test: 'ASC'}, {test2: 'DESC'}], 'test3'), undefined);
            assert.equal(gridMod.GridViewModel._private.getSortingDirectionByProp([{test: 'ASC'}, {test2: 'DESC'}], 'test3'), undefined);
         });

         it('getItemColumnCellClasses for old browsers', function() {
            var
               gridViewModel = new gridMod.GridViewModel(cfg),
               current,
               expected = {
                  withMarker: 'controls-Grid__row-cell controls-Grid__row-cell_theme-default controls-Grid__row-cell-background-hover_theme-default ' +
                      'controls-Grid__row-cell_withRowSeparator_size-s_theme-default controls-Grid__rowSeparator_size-s_theme-default controls-Grid__row-cell-checkbox_theme-default ' +
                      'controls-Grid__row-checkboxCell_rowSpacingTop_l_theme-default controls-Grid__row-cell_rowSpacingBottom_l_theme-default ' +
                      'controls-Grid__row-cell_selected controls-Grid__row-cell_selected-default_theme-default controls-Grid__row-cell_selected__first-default_theme-default',
                  withoutMarker: 'controls-Grid__row-cell controls-Grid__row-cell_theme-default controls-Grid__row-cell-background-hover_theme-default ' +
                      'controls-Grid__row-cell_withRowSeparator_size-s_theme-default controls-Grid__rowSeparator_size-s_theme-default controls-Grid__row-cell-checkbox_theme-default ' +
                      'controls-Grid__row-checkboxCell_rowSpacingTop_l_theme-default controls-Grid__row-cell_rowSpacingBottom_l_theme-default ' +
                      'controls-Grid__row-cell_selected controls-Grid__row-cell_selected-default_theme-default controls-Grid__row-cell_selected__first-default_theme-default'
               };

            gridViewModel.setMarkedKey(123);
            assert.equal(gridViewModel.getMarkedKey(), 123);

            current = gridViewModel.getCurrent();
            current.isNotFullGridSupport = true;

            cAssert.isClassesEqual(gridMod.GridViewModel._private.getItemColumnCellClasses(current, theme).getAll(),
                expected.withMarker,
               'Incorrect value "GridViewModel._private.getPaddingCellClasses(params)".');

            current.markerVisibility = 'hidden';
            current.resetColumnIndex();

            cAssert.isClassesEqual(gridMod.GridViewModel._private.getItemColumnCellClasses(current, theme).getAll(),
                expected.withoutMarker,
               'Incorrect value "GridViewModel._private.getPaddingCellClasses(params)".');
         });
         it('should update last item after append items', function () {
            var
               gridViewModel = new gridMod.GridViewModel(cfg),
                oldLastIndex = gridViewModel.getCount()-1,
                firstItem = gridViewModel.getItemDataByItem(gridViewModel._model._display.at(0)),
                lastItem = gridViewModel.getItemDataByItem(gridViewModel._model._display.at(oldLastIndex)),
                newLastItem;

            // first item should have updated version identificator
            assert.isTrue(firstItem.getVersion().indexOf('LAST_ITEM') === -1);

            // last item should have updated version identificator
            assert.isTrue(lastItem.getVersion().indexOf('LAST_ITEM') !== -1);

            gridViewModel.appendItems(new collection.RecordSet({
               keyProperty: 'id',
               rawData: [
                  { id: 121212, title: 'i0'},
                  { id: 231313, title: 'i1'}
               ]
            }));

            // old last item now must be updated and shouldn't have prefix "LAST_ITEM" in version identificator
            lastItem = gridViewModel.getItemDataByItem(gridViewModel._model._display.at(oldLastIndex));
            assert.isTrue(lastItem.getVersion().indexOf('LAST_ITEM') === -1);

            // last item should have updated version identificator
            newLastItem = gridViewModel.getItemDataByItem(gridViewModel._model._display.at(gridViewModel.getCount()-1));
            assert.isTrue(newLastItem.getVersion().indexOf('LAST_ITEM') !== -1);

         });

         it('getItemDataByItem', function() {
            let gridViewModel = new gridMod.GridViewModel(cfg);
            let data = gridViewModel.getItemDataByItem(dummyDispitem);

            assert.isFalse(!!data.isFirstInGroup);
         });

         it('getItemDataByItem cache is reset on base template change', () => {
            const gridViewModel = new gridMod.GridViewModel(cfg);
            let data = gridViewModel.getItemDataByItem(dummyDispitem);

            assert.isNotOk(data.resolveBaseItemTemplate);

            const resolver = {};
            gridViewModel.setBaseItemTemplateResolver(resolver);
            data = gridViewModel.getItemDataByItem(dummyDispitem);

            assert.strictEqual(data.resolvers.baseItemTemplate, resolver);
         });

         it('getMultiSelectClassList visible', function() {
            let gridViewModel = new gridMod.GridViewModel(cfg);
            gridViewModel._options.multiSelectVisibility = 'visible';
            let data = gridViewModel.getItemDataByItem(dummyDispitem);

            assert.equal(data.multiSelectClassList, 'js-controls-ListView__checkbox js-controls-ListView__notEditable controls-GridView__checkbox_theme-default');
         });

         it('getMultiSelectClassList hidden', function() {
            let gridViewModel = new gridMod.GridViewModel(cfg);
            gridViewModel._options.multiSelectVisibility = 'hidden';
            let data = gridViewModel.getItemDataByItem(dummyDispitem);

            assert.equal(data.multiSelectClassList, '');
         });

         it('shouldDrawMarker', function() {
            const gridViewModel = new gridMod.GridViewModel(cfg);
            gridViewModel.setMarkedKey(123);
            assert.equal(gridViewModel.getMarkedKey(), 123);
            const firstItem = gridViewModel._model.getDisplay().at(0);
            let itemData = gridViewModel.getItemDataByItem(firstItem);

            assert.equal(itemData.shouldDrawMarker(undefined, 0), true);
            assert.equal(itemData.shouldDrawMarker(undefined, 1), false);
            assert.equal(itemData.shouldDrawMarker(true, 0), true);
            assert.equal(itemData.shouldDrawMarker(true, 1), false);
            assert.equal(itemData.shouldDrawMarker(false, 0), false);
            assert.equal(itemData.shouldDrawMarker(false, 1), false);
         });

         it('getMultiSelectClassList onhover selected', function() {
            let gridViewModel = new gridMod.GridViewModel(cfg);
            gridViewModel._options.multiSelectVisibility = 'onhover';
            gridViewModel._model._selectedKeys = {'123': true};
            let data = gridViewModel.getItemDataByItem(gridViewModel.getItemById('123', 'id'));

            assert.equal(data.multiSelectClassList, 'js-controls-ListView__checkbox js-controls-ListView__notEditable controls-GridView__checkbox_theme-default');
         });

         it('getMultiSelectClassList onhover unselected', function() {
            let gridViewModel = new gridMod.GridViewModel(cfg);
            gridViewModel._options.multiSelectVisibility = 'onhover';
            let data = gridViewModel.getItemDataByItem(dummyDispitem);

            assert.equal(data.multiSelectClassList, 'js-controls-ListView__checkbox js-controls-ListView__notEditable controls-ListView__checkbox-onhover controls-GridView__checkbox_theme-default');
            gridViewModel._options.multiSelectVisibility = 'visible';
         });

         it('getItemColumnCellClasses', function() {
            var
               gridViewModel = new gridMod.GridViewModel(cfg),
               current,
               expectedResult = [
                  'controls-Grid__row-cell controls-Grid__row-cell_theme-default  controls-Grid__row-cell-background-hover_theme-default controls-Grid__row-cell_rowSpacingBottom_l_theme-default ' +
                  'controls-Grid__row-cell_withRowSeparator_size-s_theme-default controls-Grid__rowSeparator_size-s_theme-default controls-Grid__row-cell-checkbox_theme-default ' +
                  'controls-Grid__row-checkboxCell_rowSpacingTop_l_theme-default ' +
                  'controls-Grid__row-cell_selected controls-Grid__row-cell_selected-default_theme-default controls-Grid__row-cell_selected__first-default_theme-default',

                  'controls-Grid__row-cell controls-Grid__row-cell_theme-default controls-Grid__cell_fit controls-Grid__row-cell-background-hover_theme-default ' +
                  'controls-Grid__row-cell_withRowSeparator_size-s_theme-default controls-Grid__rowSeparator_size-s_theme-default controls-Grid__cell_spacingRight_theme-default controls-Grid__cell_default ' +
                  'controls-Grid__row-cell_rowSpacingTop_l_theme-default controls-Grid__row-cell_rowSpacingBottom_l_theme-default controls-Grid__row-cell_selected ' +
                  'controls-Grid__row-cell_selected-default_theme-default',

                  'controls-Grid__row-cell controls-Grid__row-cell_theme-default  controls-Grid__cell_fit controls-Grid__row-cell-background-hover_theme-default ' +
                  'controls-Grid__row-cell_withRowSeparator_size-s_theme-default controls-Grid__rowSeparator_size-s_theme-default controls-Grid__cell_spacingLeft_theme-default ' +
                  'controls-Grid__cell_spacingRight_theme-default controls-Grid__cell_default controls-Grid__row-cell_rowSpacingTop_l_theme-default ' +
                  'controls-Grid__row-cell_rowSpacingBottom_l_theme-default controls-Grid__row-cell_selected controls-Grid__row-cell_selected-default_theme-default',

                  'controls-Grid__row-cell controls-Grid__row-cell_theme-default  controls-Grid__cell_fit controls-Grid__row-cell-background-hover_theme-default ' +
                  'controls-Grid__row-cell_withRowSeparator_size-s_theme-default controls-Grid__rowSeparator_size-s_theme-default controls-Grid__cell_spacingLeft_theme-default controls-Grid__cell_default ' +
                  'controls-Grid__cell_spacingLastCol_l_theme-default controls-Grid__row-cell_rowSpacingTop_l_theme-default ' +
                  'controls-Grid__row-cell_rowSpacingBottom_l_theme-default controls-Grid__row-cell_selected controls-Grid__row-cell_selected-default_theme-default ' +
                  'controls-Grid__row-cell_selected__last controls-Grid__row-cell_selected__last-default_theme-default',

                  'controls-Grid__row-cell controls-Grid__row-cell_theme-default  controls-Grid__cell_fit controls-Grid__row-cell-background-hover_theme-default ' +
                  'controls-Grid__row-cell_withRowSeparator_size-s_theme-default controls-Grid__rowSeparator_size-s_theme-default controls-Grid__cell_spacingLeft_theme-default ' +
                  'controls-Grid__cell_default controls-Grid__cell_spacingLastCol_l_theme-default controls-Grid__row-cell_rowSpacingTop_l_theme-default ' +
                  'controls-Grid__row-cell_rowSpacingBottom_l_theme-default controls-Grid__row-cell__last controls-Grid__row-cell__last-default_theme-default'
               ];

            gridViewModel.setMarkedKey(123);
            assert.equal(gridViewModel.getMarkedKey(), 123);

            current = gridViewModel.getCurrent();

            cAssert.isClassesEqual(gridMod.GridViewModel._private.getItemColumnCellClasses(current, theme).getAll(), expectedResult[0]);
            current.goToNextColumn();

            cAssert.isClassesEqual(gridMod.GridViewModel._private.getItemColumnCellClasses(current, theme).getAll(), expectedResult[1]);
            current.goToNextColumn();

            cAssert.isClassesEqual(gridMod.GridViewModel._private.getItemColumnCellClasses(current, theme).getAll(), expectedResult[2]);
            current.goToNextColumn();

            cAssert.isClassesEqual(gridMod.GridViewModel._private.getItemColumnCellClasses(current, theme).getAll(), expectedResult[3]);

            current._isSelected = false;
            cAssert.isClassesEqual(gridMod.GridViewModel._private.getItemColumnCellClasses(current, theme).getAll(), expectedResult[4]);

         });
      });
      describe('getCurrent', function() {
         var
            gridViewModel = new gridMod.GridViewModel(cfg),
            current;
         gridViewModel.setMarkedKey(123);
         assert.equal(gridViewModel.getMarkedKey(), 123);

         current = gridViewModel.getCurrent();

         it('configuration', function() {
            assert.equal(cfg.keyProperty, current.keyProperty, 'Incorrect value "current.keyProperty".');
            assert.equal(cfg.displayProperty, current.displayProperty, 'Incorrect value "current.displayProperty".');
            assert.isTrue(current.multiSelectVisibility === 'visible');
            assert.deepEqual([{}].concat(gridColumns), current.columns, 'Incorrect value "current.columns".');
            assert.deepEqual({
               left: 'xl',
               right: 'l',
               top: 'l',
               bottom: 'l'
            }, current.itemPadding, 'Incorrect value "current.itemPadding".');
            assert.equal(current.rowSeparatorSize, 's', 'Incorrect value "current.rowSeparatorSize".');
         });

         it('item', function() {
            assert.equal(gridData[0][cfg.keyProperty], current.key, 'Incorrect value "current.keyProperty".');
            assert.equal(0, current.index, 'Incorrect value "current.index".');
            assert.deepEqual(gridData[0], current.item.getRawData(), 'Incorrect value "current.item".');
            assert.deepEqual(gridData[0], current.dispItem.getContents().getRawData(), 'Incorrect value "current.dispItem".');
            assert.equal(gridData[0][cfg.displayProperty], current.getPropValue(current.item, cfg.displayProperty), 'Incorrect value "current.displayProperty".');
         });

         it('state', function() {
            assert.isTrue(current._isSelected, 'Incorrect value "current.isSelected".');
            assert.equal(false, current.isActive(), 'Incorrect value "current.isActive".');
            assert.isTrue(current.multiSelectVisibility === 'visible');
            assert.equal(false, current.isSwiped(), 'Incorrect value "current.isSwiped".');
         });

         it('columns', function() {
            function checkBaseProperties(checkedColumn, expectedData) {
               assert.equal(expectedData.columnIndex, checkedColumn.columnIndex, 'Incorrect value "columnIndex" when checking columns.');
               assert.deepEqual(expectedData.column, checkedColumn.column, 'Incorrect value "column" when checking columns.');
               assert.deepEqual(expectedData.item, checkedColumn.item.getRawData(), 'Incorrect value "item" when checking columns.');
               assert.deepEqual(expectedData.item, checkedColumn.dispItem.getContents().getRawData(), 'Incorrect value "dispItem" when checking columns.');
               assert.equal(expectedData.keyProperty, checkedColumn.keyProperty, 'Incorrect value "keyProperty" when checking columns.');
               assert.equal(expectedData.displayProperty, checkedColumn.displayProperty, 'Incorrect value "displayProperty" when checking columns.');
               assert.equal(expectedData.item[expectedData.keyProperty], checkedColumn.key, 'Incorrect value "getPropValue(item, displayProperty)" when checking columns.');
               assert.equal(expectedData.item[expectedData.displayProperty],
                  checkedColumn.getPropValue(checkedColumn.item, expectedData.displayProperty), 'Incorrect value "" when checking columns.');
               assert.equal(expectedData.template, checkedColumn.template, 'Incorrect value "template" when checking columns.');
               cAssert.isClassesEqual(checkedColumn.classList.getAll(), expectedData.cellClasses, 'Incorrect value "cellClasses" when checking columns.');
            }

            var gridColumn;
            const topSpacingClasses = ' controls-Grid__row-checkboxCell_rowSpacingTop_l_theme-default controls-Grid__row-cell_rowSpacingBottom_l_theme-default ';

            // check first column (multiselect checkbox column)
            assert.equal(0, current.columnIndex, 'Incorrect value "current.columnIndex".');
            assert.isFalse(current.getLastColumnIndex() === current.columnIndex, 'Incorrect value "current.getLastColumnIndex() === current.columnIndex".');
            checkBaseProperties(current.getCurrentColumn(), {
               columnIndex: 0,
               keyProperty: cfg.keyProperty,
               displayProperty: cfg.displayProperty,
               column: {needSearchHighlight: false},
               item: gridData[0],
               template: null,
               cellClasses: 'controls-Grid__row-cell controls-Grid__row-cell_theme-default  controls-Grid__row-cell-background-hover_theme-default controls-Grid__row-cell_withRowSeparator_size-s_theme-default ' +
                  'controls-Grid__row-cell-checkbox_theme-default' + topSpacingClasses + 'controls-Grid__row-cell_selected controls-Grid__row-cell_selected-default_theme-default ' +
                  'controls-Grid__row-cell_selected__first-default_theme-default controls-Grid__row-cell_withRowSeparator_size-s_theme-default'
            });

            // check next column
            current.goToNextColumn();
            gridColumn = clone(gridColumns[0]);
            cMerge(gridColumn, {needSearchHighlight: false});
            assert.equal(1, current.columnIndex, 'Incorrect value "current.columnIndex" after "goToNextColumn()".');
            assert.isFalse(current.getLastColumnIndex() === current.columnIndex, 'Incorrect value "current.getLastColumnIndex() === current.columnIndex" after "goToNextColumn()".');
            assert.isTrue(gridColumn.textOverflow === 'ellipsis', 'Incorrect value "current.textOverflow".');
            checkBaseProperties(current.getCurrentColumn(), {
               columnIndex: 1,
               keyProperty: cfg.keyProperty,
               displayProperty: cfg.displayProperty,
               column: gridColumn,
               item: gridData[0],
               template: null,
               cellClasses: 'controls-Grid__row-cell controls-Grid__row-cell_theme-default  controls-Grid__cell_fit controls-Grid__row-cell-background-hover_theme-default ' +
                  'controls-Grid__row-cell_withRowSeparator_size-s_theme-default controls-Grid__row-cell_withRowSeparator_size-s_theme-default controls-Grid__cell_spacingRight_theme-default controls-Grid__cell_default ' +
                   'controls-Grid__row-cell_rowSpacingTop_l_theme-default controls-Grid__row-cell_rowSpacingBottom_l_theme-default controls-Grid__row-cell_selected ' +
                   'controls-Grid__row-cell_selected-default_theme-default'
            });

            // check next column
            current.goToNextColumn();
            gridColumn = clone(gridColumns[1]);
            cMerge(gridColumn, {needSearchHighlight: false});
            assert.equal(2, current.columnIndex, 'Incorrect value "current.columnIndex" after "goToNextColumn()".');
            assert.isFalse(current.getLastColumnIndex() === current.columnIndex, 'Incorrect value "current.getLastColumnIndex() === current.columnIndex" after goToNextColumn().');
            checkBaseProperties(current.getCurrentColumn(), {
               columnIndex: 2,
               keyProperty: cfg.keyProperty,
               displayProperty: cfg.displayProperty,
               column: gridColumn,
               item: gridData[0],
               template: null,
               cellClasses: 'controls-Grid__row-cell controls-Grid__row-cell_theme-default  controls-Grid__cell_fit controls-Grid__row-cell-background-hover_theme-default ' +
                  'controls-Grid__row-cell_withRowSeparator_size-s_theme-default controls-Grid__row-cell_withRowSeparator_size-s_theme-default ' +
                  'controls-Grid__cell_spacingLeft_theme-default controls-Grid__cell_spacingRight_theme-default controls-Grid__cell_default ' +
                  'controls-Grid__row-cell_rowSpacingTop_l_theme-default controls-Grid__row-cell_rowSpacingBottom_l_theme-default controls-Grid__row-cell_selected ' +
                  'controls-Grid__row-cell_selected-default_theme-default'
            });

            // check last column
            current.goToNextColumn();
            gridColumn = clone(gridColumns[2]);
            cMerge(gridColumn, {needSearchHighlight: false});
            assert.equal(3, current.columnIndex, 'Incorrect value "current.columnIndex" after "goToNextColumn()".');
            assert.isTrue(current.getLastColumnIndex() === current.columnIndex, 'Incorrect value "current.getLastColumnIndex() === current.columnIndex" after "gotToNextColumn()".');
            checkBaseProperties(current.getCurrentColumn(), {
               columnIndex: 3,
               keyProperty: cfg.keyProperty,
               displayProperty: cfg.displayProperty,
               column: gridColumn,
               item: gridData[0],
               template: null,
               cellClasses: 'controls-Grid__row-cell controls-Grid__row-cell_theme-default  controls-Grid__cell_fit controls-Grid__row-cell-background-hover_theme-default ' +
                  'controls-Grid__row-cell_withRowSeparator_size-s_theme-default controls-Grid__row-cell_withRowSeparator_size-s_theme-default ' +
                  'controls-Grid__cell_spacingLeft_theme-default controls-Grid__cell_default controls-Grid__cell_spacingLastCol_l_theme-default ' +
                  'controls-Grid__row-cell_rowSpacingTop_l_theme-default controls-Grid__row-cell_rowSpacingBottom_l_theme-default controls-Grid__row-cell_selected ' +
                  'controls-Grid__row-cell_selected-default_theme-default controls-Grid__row-cell_selected__last controls-Grid__row-cell_selected__last-default_theme-default'
            });

            // check the absence of other columns
            current.goToNextColumn();
            assert.equal(4, current.columnIndex, 'Incorrect value "current.columnIndex" after "goToNextColumn()".');

            // check reset column index and retest first column
            current.resetColumnIndex();

            assert.equal(0, current.columnIndex, 'Incorrect value "current.columnIndex" after "resetColumnIndex()".');
            assert.isFalse(current.getLastColumnIndex() === current.columnIndex, 'Incorrect value "current.getLastColumnIndex() === current.columnIndex" after "resetColumnIndex()".');
            checkBaseProperties(current.getCurrentColumn(), {
               columnIndex: 0,
               keyProperty: cfg.keyProperty,
               displayProperty: cfg.displayProperty,
               column: {needSearchHighlight: false},
               item: gridData[0],
               template: null,
               cellClasses: 'controls-Grid__row-cell controls-Grid__row-cell_theme-default  controls-Grid__row-cell-background-hover_theme-default ' +
                  'controls-Grid__row-cell_withRowSeparator_size-s_theme-default controls-Grid__row-cell_withRowSeparator_size-s_theme-default controls-Grid__row-cell-checkbox_theme-default' + topSpacingClasses +
                   'controls-Grid__row-cell_selected controls-Grid__row-cell_selected-default_theme-default controls-Grid__row-cell_selected__first-default_theme-default'
            });
         });

         it('getColspanedPaddingClassList', function() {
            // Skip checkbox column
            current.resetColumnIndex();
            current.goToNextColumn();
            const currColumn = current.getCurrentColumn();
            assert.equal(currColumn.getColspanedPaddingClassList(currColumn).right, 'controls-Grid__cell_spacingLastCol_l_theme-default');
         });
      });
      describe('methods for processing with items', function() {
         var
            gridViewModel = new gridMod.GridViewModel(cfg);
         it('getColumns', function() {
            assert.deepEqual(gridColumns, gridViewModel.getColumns(), 'Incorrect value "getColumns()".');
         });
         it('setMultiSelectVisibility && getMultiSelectVisibility', function() {
            assert.equal('visible', gridViewModel.getMultiSelectVisibility(), 'Incorrect value "getMultiSelectVisibility()" before "setMultiSelectVisibility()".');
            gridViewModel.setMultiSelectVisibility('');
            assert.equal('', gridViewModel.getMultiSelectVisibility(), 'Incorrect value "getMultiSelectVisibility()" after "setMultiSelectVisibility()".');
            gridViewModel.setMultiSelectVisibility('visible');
            assert.equal('visible', gridViewModel.getMultiSelectVisibility(), 'Incorrect value "getMultiSelectVisibility()" after "setMultiSelectVisibility(visible)".');
         });
         it('methods throwing a call into the model', function() {
            var
               gridViewModel = new gridMod.GridViewModel(cfg),
               callMethods = ['getItemById', 'setMarkedKey', 'reset', 'isEnd', 'goToNext', 'getNext', 'isLast',
                  'updateIndexes', 'setItems', 'setActiveItem', 'appendItems', 'prependItems', 'getDragTargetPosition',
                  'getIndexBySourceItem', 'at', 'getCount', 'setSwipeItem', 'getSwipeItem', 'updateSelection', 'getCurrentIndex',
                  '_prepareDisplayItemForAdd', 'mergeItems', 'toggleGroup', '_setEditingItemData', 'getMarkedKey',
                  'getChildren','getStartIndex', 'getActiveItem', 'setRightSwipedItem', 'destroy', 'nextModelVersion', 'getEditingItemData'],
               callStackMethods = [];

            gridViewModel._model = {
               getItems: function() {}
            };
            callMethods.forEach(function(item) {
               gridViewModel._model[item] = function() {
                  callStackMethods.push(item);
               };
            });
            gridViewModel._model.subscribe = gridViewModel._model.unsubscribe = function() {};
            callMethods.forEach(function(item) {
               gridViewModel[item]();
            });
            assert.deepEqual(callMethods, callStackMethods, 'Incorrect call stack methods.');
         });
         it('setIndexes return superclass result', function() {
            var gridViewModel = new gridMod.GridViewModel(cfg);
            gridViewModel._model = {
                setIndexes: function() {
                    return 'test_return_value';
                }
            };
            assert.equal(gridViewModel.setIndexes(), 'test_return_value');
         });
      });
      describe('ladder and sticky column', function() {
         it('TODO: split this into cases', function() {
         // for ladder by date check, ladder field can be any JS type
         var date1 = new Date(2017, 00, 01),
            date2 = new Date(2017, 00, 03),
            date3 = new Date(2017, 00, 05),
            date4 = new Date(2017, 00, 07),
            date5 = new Date(2017, 00, 09),
            initialColumns = [{
               width: '1fr',
               displayProperty: 'title'
            }, {
               width: '1fr',
               template: 'wml!MyTestDir/Photo',
               stickyProperty: 'photo'
            }],
            resultLadder = {
               0: { date: { ladderLength: 1 } },
               1: { date: { ladderLength: 3 } },
               2: { date: { } },
               3: { date: { } },
               4: { date: { ladderLength: 2 } },
               5: { date: { } },
               6: { date: { ladderLength: 1 } },
               7: { date: { ladderLength: 3 } },
               8: { date: { } },
               9: { date: { } }
            },
            resultStickyLadder = {
               "0": {
                  "ladderLength": 3,
                  "headingStyle": "grid-row: span 3"
               },
               "1": {},
               "2": {},
               "3": {
                  "ladderLength": 1,
                  "headingStyle": "grid-row: span 1"
               },
               "4": {
                  "ladderLength": 4,
                  "headingStyle": "grid-row: span 4"
               },
               "5": {},
               "6": {},
               "7": {},
               "8": {
                  "ladderLength": 1,
                  "headingStyle": "grid-row: span 1"
               },
               "9": {
                  "ladderLength": 1,
                  "headingStyle": "grid-row: span 1"
               }
            },
            ladderViewModel = new gridMod.GridViewModel({
               items: new collection.RecordSet({
                  keyProperty: 'id',
                  rawData: [
                     { id: 0, title: 'i0', date: date1, photo: '1.png' },
                     { id: 1, title: 'i1', date: date2, photo: '1.png' },
                     { id: 2, title: 'i2', date: date2, photo: '1.png' },
                     { id: 3, title: 'i3', date: date2, photo: '2.png' },
                     { id: 4, title: 'i4', date: date3, photo: '3.png' },
                     { id: 5, title: 'i5', date: date3, photo: '3.png' },
                     { id: 6, title: 'i6', date: date4, photo: '3.png' },
                     { id: 7, title: 'i7', date: date5, photo: '3.png' },
                     { id: 8, title: 'i8', date: date5, photo: '4.png' },
                     { id: 9, title: 'i9', date: date5, photo: '5.png' }
                  ]
               }),
               keyProperty: 'id',
               columns: initialColumns,
               ladderProperties: ['date']
            });
         assert.deepEqual(ladderViewModel._ladder.ladder, resultLadder, 'Incorrect value prepared ladder.');
         assert.deepEqual(ladderViewModel._ladder.stickyLadder, resultStickyLadder, 'Incorrect value prepared stickyLadder.');

         var
            newItems = new collection.RecordSet({
               keyProperty: 'id',
               rawData: [
                  { id: 0, title: 'i0', date: '01 янв', photo: '1.png' },
                  { id: 1, title: 'i1', date: '03 янв', photo: '1.png' },
                  { id: 2, title: 'i2', date: '03 янв', photo: '1.png' }
               ]
            }),
            newResultLadder = {
               0: { date: { ladderLength: 1 } },
               1: { date: { ladderLength: 2 } },
               2: { date: { } }
            },
            newResultStickyLadder = {
               "0": {
                  "ladderLength": 3,
                  "headingStyle": "grid-row: span 3"
               },
               "1": {},
               "2": {}
            };

         ladderViewModel.setItems(newItems);

         assert.deepEqual(ladderViewModel._ladder.ladder, newResultLadder, 'Incorrect value prepared ladder after setItems.');
         assert.deepEqual(ladderViewModel._ladder.stickyLadder, newResultStickyLadder, 'Incorrect value prepared stickyLadder after setItems.');

         // check ladder and grouping
         var
            groupingLadderViewModel = new gridMod.GridViewModel({
               items: new collection.RecordSet({
                  keyProperty: 'id',
                  rawData: [
                     { id: 0, title: 'i0', group: 'g1', date: '01 янв' },
                     { id: 1, title: 'i1', group: 'g1', date: '03 янв' },
                     { id: 2, title: 'i2', group: 'g1', date: '03 янв' },
                     { id: 3, title: 'i3', group: 'g2', date: '03 янв' },
                     { id: 4, title: 'i4', group: 'g2', date: '03 янв' }
                  ]
               }),
               keyProperty: 'id',
               columns: [{
                  width: '1fr',
                  displayProperty: 'title'
               }],
               ladderProperties: ['date'],
               groupingKeyCallback: function(item) {
                  return item.get('group');
               }
            });
         assert.deepEqual(groupingLadderViewModel._ladder.ladder, {
            '0': {
               'date': {}
            },
            '1': {
               'date': {
                  'ladderLength': 1
               }
            },
            '2': {
               'date': {
                  'ladderLength': 2
               }
            },
            '3': {
               'date': {}
            },
            '4': {
               'date': {
                  'ladderLength': 1
               }
            },
            '5': {
               'date': {
                  'ladderLength': 2
               }
            },
            '6': {
               'date': {}
            }
         }, 'Incorrect value prepared ladder with grouping.');

         var curLadderViewModelVersion = ladderViewModel.getVersion();
         ladderViewModel.setLadderProperties(['date']);
         assert.equal(curLadderViewModelVersion, ladderViewModel.getVersion());
         });

         it('prepareLadder should use virtualScroll indexes', function () {
            const date1 = new Date(2017, 0, 1);
            const date2 = new Date(2017, 0, 3);
            const ladderViewModel = new gridMod.GridViewModel({
               items: new collection.RecordSet({
                  keyProperty: 'id',
                  rawData: [
                     { id: 0, title: 'i0', date: date1, photo: '1.png' },
                     { id: 1, title: 'i1', date: date2, photo: '1.png' },
                     { id: 2, title: 'i2', date: date2, photo: '1.png' },
                     { id: 3, title: 'i3', date: date2, photo: '2.png' }
                  ]
               }),
               keyProperty: 'id',
               columns: [{
                  width: '1fr',
                  displayProperty: 'title'
               }, {
                  width: '1fr',
                  template: 'wml!MyTestDir/Photo',
                  stickyProperty: 'photo'
               }],
               ladderProperties: ['date']
            });

            ladderViewModel._model._stopIndex = 2;

            // Without vs uses display stop index;
            let ladder = gridMod.GridViewModel._private.prepareLadder(ladderViewModel);
            assert.equal(4, Object.keys(ladder.stickyLadder).length);
            assert.equal(4, Object.keys(ladder.ladder).length);

            ladderViewModel._options.virtualScrolling = true;

            // With vs uses its' stopIndex;
            ladder = gridMod.GridViewModel._private.prepareLadder(ladderViewModel);
            assert.equal(2, Object.keys(ladder.stickyLadder).length);
            assert.equal(2, Object.keys(ladder.ladder).length);
         });

         it('shouldn\'t assign ladder if there is no ladder for current item', () => {
            const date1 = new Date(2017, 0, 1);
            const date2 = new Date(2017, 0, 3);
            const ladderViewModel = new gridMod.GridViewModel({
               items: new collection.RecordSet({
                  keyProperty: 'id',
                  rawData: [
                     { id: 0, title: 'i0', date: date1, photo: '1.png' },
                     { id: 1, title: 'i1', date: date1, photo: '1.png' },
                     { id: 2, title: 'i2', date: date1, photo: '1.png' },
                     { id: 3, title: 'i3', date: date2, photo: '2.png' }
                  ]
               }),
               keyProperty: 'id',
               columns: [{
                  width: '1fr',
                  displayProperty: 'title'
               }, {
                  width: '1fr',
                  template: 'wml!MyTestDir/Photo',
                  stickyProperty: 'photo'
               }],
               ladderProperties: ['date'],
               virtualScrolling: true
            });

            ladderViewModel._model._startIndex = 2;
            ladderViewModel._model._stopIndex = 4;
            ladderViewModel._ladder = gridMod.GridViewModel._private.prepareLadder(ladderViewModel);
            ladderViewModel._model._curIndex = 0;
            let current = ladderViewModel.getCurrent();

            assert.isUndefined(current.styleLadderHeading, 'shouldn\'t assign ladder');

            
            ladderViewModel._model._curIndex = 2;
            current = ladderViewModel.getCurrent();

            assert.isOk(current.styleLadderHeading, 'should assign ladder');
         });
         it('prepareLadder should reset cache of updated items', function () {
            const date1 = new Date(2017, 0, 1);
            const date2 = new Date(2017, 0, 3);
            const ladderViewModel = new gridMod.GridViewModel({
               items: new collection.RecordSet({
                  keyProperty: 'id',
                  rawData: [
                     { id: 0, title: 'i0', date: date1, photo: '1.png' },
                     { id: 1, title: 'i1', date: date1, photo: '1.png' },
                     { id: 2, title: 'i2', date: date1, photo: '1.png' },
                     { id: 3, title: 'i3', date: date2, photo: '2.png' }
                  ]
               }),
               keyProperty: 'id',
               columns: [{
                  width: '1fr',
                  displayProperty: 'title'
               }, {
                  width: '1fr',
                  template: 'wml!MyTestDir/Photo',
                  stickyProperty: 'photo'
               }],
               ladderProperties: ['date'],
               virtualScrolling: true
            });

            ladderViewModel._model._startIndex = 0;
            ladderViewModel._model._stopIndex = 4;
            ladderViewModel._ladder = gridMod.GridViewModel._private.prepareLadder(ladderViewModel);
            assert.equal(4, Object.keys(ladderViewModel._ladder.stickyLadder).length);
            assert.equal(4, Object.keys(ladderViewModel._ladder.ladder).length);

            
            let resetCacheKey = null;
            let fullCacheReset = false;
            ladderViewModel.resetCachedItemData = (key) => {
               if (!key) {
                  fullCacheReset = true;
               }
               resetCacheKey = key;
            };
            ladderViewModel._model._startIndex = 1;
            ladderViewModel._ladder = gridMod.GridViewModel._private.prepareLadder(ladderViewModel);
            assert.equal(3, Object.keys(ladderViewModel._ladder.stickyLadder).length);
            assert.equal(3, Object.keys(ladderViewModel._ladder.ladder).length);
            assert.isFalse(fullCacheReset, 'Не должен сбрасываться весь кэш');
            assert.equal(resetCacheKey, ladderViewModel.getDisplay().at(1).getInstanceId(), 'Неверный id записи со сброшенным кэшем');
         });
      });
      describe('other methods of the class', function() {
         var
            gridViewModel = new gridMod.GridViewModel(cfg),
            imitateTemplate = function() {};
         it('setTheme', function() {
            gridViewModel.setTheme('themeName');
            assert.equal(gridViewModel._options.theme, 'themeName');
            gridViewModel.setTheme('default');
            assert.equal(gridViewModel._options.theme, 'default');
         });
         it('setColumnTemplate', function() {
            assert.equal(null, gridViewModel._columnTemplate, 'Incorrect value "_columnTemplate" before "setColumnTemplate(imitateTemplate)".');
            gridViewModel.setColumnTemplate(imitateTemplate);
            assert.equal(imitateTemplate, gridViewModel._columnTemplate, 'Incorrect value "_columnTemplate" after "setColumnTemplate(imitateTemplate)".');
         });
         it('getHeader && setHeader', function() {
            assert.deepEqual(gridHeader, gridViewModel.getHeader(), 'Incorrect value "getHeader()" before "setHeader(null)".');
            gridViewModel.setHeader(null);
            assert.equal(null, gridViewModel.getHeader(), 'Incorrect value "getHeader()" after "setHeader(null)".');
            gridViewModel.setHeader(gridHeader);
            assert.deepEqual(gridHeader, gridViewModel.getHeader(), 'Incorrect value "getHeader()" after "setHeader(gridHeader)".');
         });
         it('getColumns && setColumns', function() {
            var newColumns = [{
               displayProperty: 'field1'
            }, {
               displayProperty: 'field2'
            }];
            assert.deepEqual(gridColumns, gridViewModel.getColumns(), 'Incorrect value "getColumns()" before "setColumns(newColumns)".');
            gridViewModel.setColumns(newColumns);
            assert.deepEqual(newColumns, gridViewModel.getColumns(), 'Incorrect value "getColumns()" after "setColumns(newColumns)".');
            gridViewModel.setColumns(gridColumns);
            assert.deepEqual(gridColumns, gridViewModel.getColumns(), 'Incorrect value "getColumns()" before "setColumns(gridColumns)".');
         });

         it('isLastColumn', function () {
            // has multiselect, 5 columns
            const itemData = gridViewModel.getItemDataByItem(gridViewModel.getDisplay().at(2));

            // checkBox
            assert.equal(itemData.hasNextColumn(), true);
            assert.equal(itemData.hasNextColumn(true), true);

            itemData.goToNextColumn();

            assert.equal(itemData.hasNextColumn(), true);
            assert.equal(itemData.hasNextColumn(true), true);

            itemData.goToNextColumn();

            assert.equal(itemData.hasNextColumn(), true);
            assert.equal(itemData.hasNextColumn(true), false);
         });

         it('getCurrentHeaderColumn && goToNextHeaderColumn && isEndHeaderColumn && resetHeaderColumns', function() {
            const gridHeaderClone = gridHeader.map(function(obj) {
               return Object.assign({}, obj);
            });

            gridViewModel._prepareHeaderColumns(gridHeaderClone, true);
            gridViewModel._headerRows[0][0].title = '123';

            let headerRow = gridViewModel.getCurrentHeaderRow();
            assert.deepEqual({
               column: {title : '123'},
               cellClasses: 'controls-Grid__header-cell controls-Grid__header-cell_theme-default controls-Grid__header-cell_min-height_theme-default controls-background-default_theme-default controls-Grid__cell_spacingRight_theme-default controls-Grid__cell_default controls-Grid__header-cell_min-width',
               index: 0,
               cellContentClasses: '',
               cellStyles: '',
               shadowVisibility: 'visible',
            }, headerRow.getCurrentHeaderColumn(), 'Incorrect value first call "getCurrentHeaderColumn()".');

            headerRow = gridViewModel.getCurrentHeaderRow();
            delete gridViewModel._headerRows[0][0].title;
            assert.deepEqual({
               column: {},
               cellClasses: 'controls-Grid__header-cell controls-Grid__header-cell_theme-default controls-Grid__header-cell_min-height_theme-default controls-background-default_theme-default controls-Grid__header-cell-checkbox_theme-default controls-Grid__header-cell-checkbox_min-width_theme-default',
               index: 0,
               cellContentClasses: '',
               cellStyles: 'grid-column-start: 1; grid-column-end: 2; grid-row-start: 1; grid-row-end: 2;',
               shadowVisibility: 'visible',
            }, headerRow.getCurrentHeaderColumn(), 'Incorrect value first call "getCurrentHeaderColumn()".');


            assert.equal(true, headerRow.isEndHeaderColumn(), 'Incorrect value "isEndHeaderColumn()" after first call "getCurrentHeaderColumn()".');
            headerRow.goToNextHeaderColumn();

            const secondCell = headerRow.getCurrentHeaderColumn().column;

            assert.deepEqual({
               column: gridHeaderClone[0],
               cellClasses: 'controls-Grid__header-cell controls-Grid__header-cell_theme-default controls-Grid__header-cell_min-height_theme-default controls-background-default_theme-default controls-Grid__cell_spacingRight_theme-default controls-Grid__cell_default controls-Grid__header-cell_min-width',
               index: 1,
               shadowVisibility: "visible",
               cellContentClasses: "",
               cellStyles: 'grid-column-start: 2; grid-column-end: 3; grid-row-start: 1; grid-row-end: 2;',
            }, headerRow.getCurrentHeaderColumn(), 'Incorrect value second call "getCurrentHeaderColumn()".');

            assert.equal(
               'grid-column-start: 2; grid-column-end: 3; grid-row-start: 1; grid-row-end: 2;',
               GridLayoutUtil.getMultiHeaderStyles(secondCell.startColumn, secondCell.endColumn, secondCell.startRow, secondCell.endRow, 1),
               'Incorrect headerCellGridStyles'
               )

            assert.equal(true, headerRow.isEndHeaderColumn(), 'Incorrect value "isEndHeaderColumn()" after second call "getCurrentHeaderColumn()".');
            headerRow.goToNextHeaderColumn();

            const thirdCell = headerRow.getCurrentHeaderColumn().column;

            assert.deepEqual({
               column: gridHeaderClone[1],
               cellClasses: 'controls-Grid__header-cell controls-Grid__header-cell_theme-default controls-Grid__header-cell_min-height_theme-default controls-background-default_theme-default controls-Grid__cell_spacingLeft_theme-default controls-Grid__cell_spacingRight_theme-default controls-Grid__cell_default controls-Grid__header-cell_min-width',
               index: 2,
               sortingDirection: 'DESC',
               cellContentClasses: " controls-Grid__header-cell_justify_content_right",
               cellStyles: 'grid-column-start: 3; grid-column-end: 4; grid-row-start: 1; grid-row-end: 2;',
               shadowVisibility: "visible",
            }, headerRow.getCurrentHeaderColumn(), 'Incorrect value third call "getCurrentHeaderColumn()".');

            assert.equal(
               'grid-column-start: 3; grid-column-end: 4; grid-row-start: 1; grid-row-end: 2;',
               GridLayoutUtil.getMultiHeaderStyles(thirdCell.startColumn, thirdCell.endColumn, thirdCell.startRow, thirdCell.endRow, 1),
               'Incorrect headerCellGridStyles'
            )

            assert.equal(true, headerRow.isEndHeaderColumn(), 'Incorrect value "isEndHeaderColumn()" after third call "getCurrentHeaderColumn()".');
            headerRow.goToNextHeaderColumn();

            const fourthCell = headerRow.getCurrentHeaderColumn().column;

            assert.deepEqual({
               column: gridHeaderClone[2],
               cellClasses: 'controls-Grid__header-cell controls-Grid__header-cell_theme-default controls-Grid__header-cell_min-height_theme-default controls-background-default_theme-default controls-Grid__cell_spacingLeft_theme-default controls-Grid__cell_spacingLastCol_l_theme-default controls-Grid__cell_default controls-Grid__header-cell_min-width',
               index: 3,
               cellContentClasses: " controls-Grid__header-cell_justify_content_right",
               cellStyles: 'grid-column-start: 4; grid-column-end: 5; grid-row-start: 1; grid-row-end: 2;',
               shadowVisibility: "visible",
            }, headerRow.getCurrentHeaderColumn(), 'Incorrect value fourth call "getCurrentHeaderColumn()".');

            assert.equal(
               'grid-column-start: 4; grid-column-end: 5; grid-row-start: 1; grid-row-end: 2;',
               GridLayoutUtil.getMultiHeaderStyles(fourthCell.startColumn, fourthCell.endColumn, fourthCell.startRow, fourthCell.endRow, 1),
               'Incorrect headerCellGridStyles'
            )

            assert.equal(true, headerRow.isEndHeaderColumn(), 'Incorrect value "isEndHeaderColumn()" after fourth call "getCurrentHeaderColumn()".');
            headerRow.goToNextHeaderColumn();
            assert.equal(false, headerRow.isEndHeaderColumn(), 'Incorrect value "isEndHeaderColumn()" after last call "getCurrentHeaderColumn()".');

            assert.equal(4, headerRow.curHeaderColumnIndex, 'Incorrect value "_curHeaderColumnIndex" before "resetHeaderColumns()".');
            headerRow.resetHeaderColumns();
            assert.equal(0, headerRow.curHeaderColumnIndex, 'Incorrect value "_curHeaderColumnIndex" after "resetHeaderColumns()".');

         });

         it('getCurrentHeaderColumn checkbox cell with breadcrumbs', function() {
               const header = [
                  {
                     isBreadCrumbs: true,
                  },
                  {
                     title: 'second'
                  },
                  {
                     title: 'third'
                  }
               ]
               gridViewModel._prepareHeaderColumns(header, true);
               const headerRow = gridViewModel.getCurrentHeaderRow();
               assert.deepEqual({
                  column: {},
                  cellClasses: 'controls-Grid__header-cell controls-Grid__header-cell_theme-default controls-Grid__header-cell_min-height_theme-default controls-background-default_theme-default controls-Grid__header-cell-checkbox_theme-default controls-Grid__header-cell-checkbox_min-width_theme-default',
                  index: 0,
                  cellContentClasses: '',
                  cellStyles: '',
                  shadowVisibility: 'hidden',
               }, headerRow.getCurrentHeaderColumn(), 'Incorrect value first call "getCurrentHeaderColumn()".');

         })

         it('getCurrentHeaderColumn with header (startColumn and endColumn)', function() {
            gridViewModel._prepareHeaderColumns(gridHeaderWithColumns, true);
            const headerRow = gridViewModel.getCurrentHeaderRow();
            assert.deepEqual({
               column: {},
               cellClasses: 'controls-Grid__header-cell controls-Grid__header-cell_theme-default controls-Grid__header-cell_min-height_theme-default controls-background-default_theme-default controls-Grid__header-cell-checkbox_theme-default controls-Grid__header-cell-checkbox_min-width_theme-default',
               index: 0,
               cellContentClasses: '',
               cellStyles: 'grid-column-start: 1; grid-column-end: 2; grid-row-start: 1; grid-row-end: 2;',
               shadowVisibility: 'visible',
            }, headerRow.getCurrentHeaderColumn(), 'Incorrect value first call "getCurrentHeaderColumn()".');

            headerRow.goToNextHeaderColumn();

            const secondCell = headerRow.getCurrentHeaderColumn().column;

            assert.deepEqual({
               column: gridHeaderWithColumns[0],
               cellClasses: 'controls-Grid__header-cell controls-Grid__header-cell_theme-default controls-Grid__header-cell_min-height_theme-default controls-background-default_theme-default controls-Grid__cell_spacingRight_theme-default controls-Grid__cell_default controls-Grid__header-cell_min-width',
               index: 1,
               shadowVisibility: "visible",
               cellContentClasses: "",
               cellStyles: 'grid-column-start: 2; grid-column-end: 3; grid-row-start: 1; grid-row-end: 2;',
            }, headerRow.getCurrentHeaderColumn(), 'Incorrect value second call "getCurrentHeaderColumn()".');

         });

         it('getResultsPosition()', function() {
            assert.deepEqual(undefined, gridViewModel.getResultsPosition(), 'Incorrect value "getResultsPosition()".');
            gridViewModel._options.resultsPosition = 'top'
            assert.deepEqual('top', gridViewModel.getResultsPosition(), 'Incorrect value "getResultsPosition()".');
            let newGridModel = null;
            newGridModel = new gridMod.GridViewModel({
               keyProperty: 'id',
               displayProperty: 'title',
               header: gridHeader,
               columns: gridColumns,
               items: new collection.RecordSet({
                  rawData: [],
                  keyProperty: 'id'
               }),
               resultsPosition: 'top'
            })
            assert.deepEqual(undefined, newGridModel.getResultsPosition(), 'Incorrect value "getResultsPosition()".');
            newGridModel = new gridMod.GridViewModel({
               keyProperty: 'id',
               displayProperty: 'title',
               header: gridHeader,
               columns: gridColumns,
               items: new collection.RecordSet({
                  rawData: gridData,
                  keyProperty: 'id'
               }),
               resultsPosition: 'top'
            })
            assert.deepEqual('top', newGridModel.getResultsPosition(), 'Incorrect value "getResultsPosition()".');
            assert.isTrue(newGridModel.isDrawResults())
            newGridModel.getItems = () => ({
               getCount: () => [1]
            })
            assert.isFalse(newGridModel.isDrawResults())
         });

          it('getResultsPosition with setHasMoreData', function() {
              var newGrid = new gridMod.GridViewModel({
                  keyProperty: 'id',
                  displayProperty: 'title',
                  header: gridHeader,
                  columns: gridColumns,
                  items: new collection.RecordSet({
                      rawData: gridData.slice(0, 1),
                      idProperty: 'id'
                  }),
                  resultsPosition: 'top'
              })

              assert.equal(undefined, newGrid.getResultsPosition());
              newGrid.setHasMoreData(true);
              assert.equal('top', newGrid.getResultsPosition());
              newGrid.setHasMoreData(false);
              assert.equal(undefined, newGrid.getResultsPosition());
          });

         it('isDrawResults if empty data', function() {
            const newGridModel = new gridMod.GridViewModel({
               keyProperty: 'id',
               displayProperty: 'title',
               header: gridHeader,
               columns: gridColumns,
               items: new collection.RecordSet({
                  rawData: [],
                  idProperty: 'id'
               }),
               resultsPosition: 'top',
               resultsVisibility: 'visible'
            });
            assert.isTrue(newGridModel.isDrawResults());
         });

         it('getFooterStyles', function() {
            let gridViewModel = new gridMod.GridViewModel(cfg);
            assert.equal('grid-column-start: 1; grid-column-end: 5;', gridViewModel.getFooterStyles());
            gridViewModel._options.stickyColumn = {
               index: 0,
               property: ''
            };
            assert.equal('grid-column-start: 1; grid-column-end: 6;', gridViewModel.getFooterStyles());
            gridViewModel._model._draggingItemData = {}
            assert.equal('grid-column-start: 1; grid-column-end: 5;', gridViewModel.getFooterStyles());
            gridViewModel._options.stickyColumn = undefined;
            gridViewModel._model._draggingItemData = undefined;
         });

         it('is multiheader', function() {

            let gridViewModel = new gridMod.GridViewModel(cfg);
            assert.isFalse(gridViewModel.isMultiHeader([{startRow: 1, endRow: 2}]),"simple header");
            assert.isTrue(gridViewModel.isMultiHeader([{startRow: 1, endRow: 3}]),"multiHeader header");
         });

         it('right breadcrumbs colspan for table layout', function() {

            const gridViewModel = new gridMod.GridViewModel({...cfg, multiSelectVisibility: 'visible'});
            gridViewModel._isMultyHeader = true;
            gridViewModel._headerRows[0][1].isBreadCrumbs = true;

            assert.equal(2, gridViewModel.getCurrentHeaderColumn(0, 1).colSpan);
         });

         it('_prepareHeaderColumns', function() {
            gridViewModel._headerRows = [];
            // gridViewModel._prepareHeaderColumns(gridHeader, false);
            assert.deepEqual([], gridViewModel._headerRows, 'Incorrect value "_headerColumns" before "_prepareHeaderColumns([])" without multiselect.');
            console.log('hello', gridViewModel._headerRows);
            gridViewModel._prepareHeaderColumns([], false);
            assert.deepEqual([], gridViewModel._headerRows, 'Incorrect value "_headerColumns" after "_prepareHeaderColumns([])" without multiselect.');
            gridViewModel._prepareHeaderColumns(gridHeader, false);
            assert.deepEqual([gridHeader], gridViewModel._headerRows, 'Incorrect value "_headerColumns" after "_prepareHeaderColumns(gridHeader)" without multiselect.');
            gridViewModel._prepareHeaderColumns([], true);
            assert.deepEqual([{}], gridViewModel._headerRows, 'Incorrect value "_headerColumns" after "_prepareHeaderColumns([])" with multiselect.');
            gridViewModel._prepareHeaderColumns(gridHeader, true);
            assert.deepEqual([[{}, ...gridHeader]], gridViewModel._headerRows, 'Incorrect value "_headerColumns" after "_prepareHeaderColumns(gridHeader)" with multiselect.');
         });

         it('_prepareResultsColumns', function() {
            assert.deepEqual([{}].concat(gridColumns), gridViewModel._resultsColumns, 'Incorrect value "_headerColumns" before "_prepareResultsColumns([])" without multiselect.');
            gridViewModel._prepareResultsColumns([], false);
            assert.deepEqual([], gridViewModel._resultsColumns, 'Incorrect value "_resultsColumns" after "_prepareResultsColumns([])" without multiselect.');
            gridViewModel._prepareResultsColumns(gridColumns, false);
            assert.deepEqual(gridColumns, gridViewModel._resultsColumns, 'Incorrect value "_resultsColumns" after "_prepareResultsColumns(gridColumns)" without multiselect.');

            gridViewModel._prepareResultsColumns([], true);
            assert.deepEqual([{}], gridViewModel._resultsColumns, 'Incorrect value "_resultsColumns" after "_prepareResultsColumns([])" with multiselect.');
            gridViewModel._prepareResultsColumns(gridColumns, true);
            assert.deepEqual([{}].concat(gridColumns), gridViewModel._resultsColumns, 'Incorrect value "_resultsColumns" after "_prepareResultsColumns(gridColumns)" with multiselect.');
         });

         it('getCurrentResultsColumn && goToNextResultsColumn && isEndResultsColumn && resetResultsColumns', function() {
            const offset = gridViewModel._maxEndRow ? (gridViewModel._maxEndRow - 1 ) * gridViewModel._headerCellMinHeight : 0;

            function assertColumn(actual, expected) {
               assert.deepEqual(actual.column, expected.column);
               assert.equal(actual.index, expected.index);
               cAssert.isClassesEqual(actual.cellClasses, expected.cellClasses);
            }

            assertColumn(gridViewModel.getCurrentResultsColumn(), {
               column: {},
               cellClasses: 'controls-Grid__results-cell controls-Grid__results-cell_theme-default controls-Grid__results-cell-checkbox_theme-default',
               index: 0
            });
            assert.equal(true, gridViewModel.isEndResultsColumn(), 'Incorrect value "isEndResultsColumn()" after first call "getCurrentResultsColumn()".');
            gridViewModel.goToNextResultsColumn();

            assertColumn(gridViewModel.getCurrentResultsColumn(), {
               column: gridColumns[0],
               cellClasses: 'controls-Grid__results-cell controls-Grid__results-cell_theme-default controls-Grid__cell_spacingRight_theme-default controls-Grid__cell_default',
               index: 1
            });
            assert.equal(true, gridViewModel.isEndResultsColumn(), 'Incorrect value "isEndResultsColumn()" after second call "getCurrentResultsColumn()".');
            gridViewModel.goToNextResultsColumn();

            assertColumn(gridViewModel.getCurrentResultsColumn(), {
               column: gridColumns[1],
               cellClasses: 'controls-Grid__results-cell controls-Grid__results-cell_theme-default controls-Grid__row-cell__content_halign_right controls-Grid__cell_spacingLeft_theme-default controls-Grid__cell_spacingRight_theme-default controls-Grid__cell_default',
               index: 2
            });
            assert.equal(true, gridViewModel.isEndResultsColumn(), 'Incorrect value "isEndResultsColumn()" after third call "getCurrentResultsColumn()".');
            gridViewModel.goToNextResultsColumn();

            assertColumn(gridViewModel.getCurrentResultsColumn(), {
               column: gridColumns[2],
               cellClasses: 'controls-Grid__results-cell controls-Grid__results-cell_theme-default controls-Grid__row-cell__content_halign_right controls-Grid__cell_spacingLeft_theme-default controls-Grid__cell_default controls-Grid__cell_spacingLastCol_l_theme-default',
               index: 3
            });
            assert.equal(true, gridViewModel.isEndResultsColumn(), 'Incorrect value "isEndResultsColumn()" after fourth call "getCurrentResultsColumn()".');

            gridViewModel.goToNextResultsColumn();
            assert.equal(false, gridViewModel.isEndResultsColumn(), 'Incorrect value "isEndResultsColumn()" after last call "getCurrentResultsColumn()".');

            assert.equal(4, gridViewModel._curResultsColumnIndex, 'Incorrect value "_curResultsColumnIndex" before "resetResultsColumns()".');
            gridViewModel.resetResultsColumns();
            assert.equal(0, gridViewModel._curResultsColumnIndex, 'Incorrect value "_curResultsColumnIndex" after "resetResultsColumns()".');
         });

         it('first header cell with breadcrumbs should renders from first column', function () {
              const originBreadcrumbsCell = gridViewModel._headerRows[0][1];
              gridViewModel._headerRows[0][1] = {
                  isBreadCrumbs: true,
                  startColumn: 1,
                  endColumn: 2
              };
              const firstHeaderCell = gridViewModel.getCurrentHeaderColumn(0, 1);
              assert.equal(firstHeaderCell.cellStyles, 'grid-column-start: 2; grid-column-end: 3; grid-row-start: 1; grid-row-end: 2;');

              gridViewModel._headerRows[0][1] = originBreadcrumbsCell;
          });

         it('getCellStyle', function() {
            let gvm = new gridMod.GridViewModel({...cfg, multiSelectVisibility: 'hidden', columns: [{}, {}]});

            assert.equal(
                gridMod.GridViewModel._private.getCellStyle(gvm, {},  {
                   styleForLadder: 'LADDER_STYLE;',
                   columnIndex: 0
                }, false, false),
                ''
            );

            assert.equal(
                gridMod.GridViewModel._private.getCellStyle(gvm, {},  {
                   columnIndex: 0
                }, false, false),
                ''
            );

            assert.equal(
                gridMod.GridViewModel._private.getCellStyle(gvm, {},  {
                   styleForLadder: 'LADDER_STYLE;',
                   columnIndex: 0
                }, true, false),
                'grid-column-start: 1; grid-column-end: 3;'
            );
         });

          it('_prepareColgroupColumns', function() {
            assert.deepEqual(gridViewModel._colgroupColumns, [
               {
                  classes: 'controls-Grid__colgroup-column controls-Grid__colgroup-columnMultiSelect_theme-default',
                  index: 0,
                  style: '',
               },
               {
                  classes: 'controls-Grid__colgroup-column',
                  index: 1,
                  style: 'width: auto;',
               },
               {
                  classes: 'controls-Grid__colgroup-column',
                  index: 2,
                  style: 'width: auto;',
               },
               {
                  classes: 'controls-Grid__colgroup-column',
                  index: 3,
                  style: 'width: auto;',
               },
            ], 'Incorrect value "_colgroupColumns" before "_prepareColgroupColumns([])" without multiselect.');

            gridViewModel._prepareColgroupColumns([], false);
            assert.deepEqual([], gridViewModel._colgroupColumns, 'Incorrect value "_colgroupColumns" after "_prepareColgroupColumns([])" without multiselect.');

            gridViewModel._prepareColgroupColumns(gridColumns, false);
            assert.deepEqual(gridViewModel._colgroupColumns, [
               {
                  classes: 'controls-Grid__colgroup-column',
                  index: 0,
                  style: 'width: auto;',
               },
               {
                  classes: 'controls-Grid__colgroup-column',
                  index: 1,
                  style: 'width: auto;',
               },
               {
                  classes: 'controls-Grid__colgroup-column',
                  index: 2,
                  style: 'width: auto;',
               },
            ], 'Incorrect value "_colgroupColumns" after "_prepareColgroupColumns(gridColumns)" without multiselect.');

            gridViewModel._prepareColgroupColumns([], true);
            assert.deepEqual(gridViewModel._colgroupColumns, [{
               classes: 'controls-Grid__colgroup-column controls-Grid__colgroup-columnMultiSelect_theme-default',
               style: '',
               index: 0
            }], 'Incorrect value "_colgroupColumns" after "_prepareColgroupColumns([])" with multiselect.');

            gridViewModel._prepareColgroupColumns(gridColumns, true);
            assert.deepEqual(gridViewModel._colgroupColumns, [
               {
                  classes: 'controls-Grid__colgroup-column controls-Grid__colgroup-columnMultiSelect_theme-default',
                  index: 0,
                  style: '',
               },
               {
                  classes: 'controls-Grid__colgroup-column',
                  index: 1,
                  style: 'width: auto;',
               },
               {
                  classes: 'controls-Grid__colgroup-column',
                  index: 2,
                  style: 'width: auto;',
               },
               {
                  classes: 'controls-Grid__colgroup-column',
                  index: 3,
                  style: 'width: auto;',
               },
            ], 'Incorrect value "_colgroupColumns" after "_prepareColgroupColumns(gridColumns)" with multiselect.');
         });

         it('getCurrentColgroupColumn && goToNextColgroupColumn && isEndColgroupColumn && resetColgroupColumns', function () {
            assert.deepEqual({
               classes: 'controls-Grid__colgroup-column controls-Grid__colgroup-columnMultiSelect_theme-default',
               index: 0,
               style: ''
            }, gridViewModel.getCurrentColgroupColumn(), 'Incorrect value first call "getCurrentColgroupColumn()".');

            assert.equal(true, gridViewModel.isEndColgroupColumn(), 'Incorrect value "isEndColgroupColumn()" after first call "getCurrentColgroupColumn()".');
            gridViewModel.goToNextColgroupColumn();

            assert.deepEqual({
               classes: 'controls-Grid__colgroup-column',
               index: 1,
               style: 'width: auto;'
            }, gridViewModel.getCurrentColgroupColumn(), 'Incorrect value second call "getCurrentColgroupColumn()".');

            assert.equal(true, gridViewModel.isEndColgroupColumn(), 'Incorrect value "isEndColgroupColumn()" after second call "getCurrentColgroupColumn()".');
            gridViewModel.goToNextColgroupColumn();

            assert.deepEqual({
               classes: 'controls-Grid__colgroup-column',
               index: 2,
               style: 'width: auto;'
            }, gridViewModel.getCurrentColgroupColumn(), 'Incorrect value third call "getCurrentColgroupColumn()".');

            assert.equal(true, gridViewModel.isEndColgroupColumn(), 'Incorrect value "isEndColgroupColumn()" after third call "getCurrentColgroupColumn()".');
            gridViewModel.goToNextColgroupColumn();

            assert.deepEqual({
               classes: 'controls-Grid__colgroup-column',
               index: 3,
               style: 'width: auto;'
            }, gridViewModel.getCurrentColgroupColumn(), 'Incorrect value fourth call "getCurrentColgroupColumn()".');

            assert.equal(true, gridViewModel.isEndColgroupColumn(), 'Incorrect value "isEndColgroupColumn()" after fourth call "getCurrentColgroupColumn()".');

            gridViewModel.goToNextColgroupColumn();
            assert.equal(false, gridViewModel.isEndColgroupColumn(), 'Incorrect value "isEndColgroupColumn()" after last call "getCurrentColgroupColumn()".');

            assert.equal(4, gridViewModel._curColgroupColumnIndex, 'Incorrect value "_curColgroupColumnIndex" before "resetColgroupColumns()".');
            gridViewModel.resetColgroupColumns();
            assert.equal(0, gridViewModel._curColgroupColumnIndex, 'Incorrect value "_curColgroupColumnIndex" after "resetColgroupColumns()".');
         });
         it('getItemDataByItem: hovered item should be compared by key', function () {
            let current = gridViewModel.getCurrent();
            assert.isFalse(current.isHovered);
            gridViewModel.setHoveredItem(clone(current.item));
            assert.isTrue(gridViewModel.getCurrent().isHovered);
         });

         it('getItemDataByItem: groupPaddingClasses', function () {
            const groupedVM = new gridMod.GridViewModel({
               ...cfg,
               items: new collection.RecordSet({
                  rawData: [ { id: 1, group: 'once'} ],
                  keyProperty: 'id'
               }),
               groupingKeyCallback: (item) => {
                  return item.get('group')
               }
            });
            const groupItem = groupedVM.getCurrent();
            assert.deepEqual(
                groupItem.groupPaddingClasses,
                {
                   left: 'controls-Grid__groupContent__spacingLeft_withCheckboxes_theme-default',
                   right: 'controls-Grid__groupContent__spacingRight_l_theme-default'
                }
            );

         });

         it('isFixedCell', function() {
            var testCases = [
               {
                  settings: {
                     multiSelectVisibility: 'visible',
                     stickyColumnsCount: 1
                  },
                  tests: [
                     [0, true],
                     [1, true],
                     [2, false]
                  ]
               },
               {
                  settings: {
                     multiSelectVisibility: 'hidden',
                     stickyColumnsCount: 1
                  },
                  tests: [
                     [0, true],
                     [1, false]
                  ]
               },
               {
                  settings: {
                     multiSelectVisibility: 'visible',
                     stickyColumnsCount: 2
                  },
                  tests: [
                     [0, true],
                     [1, true],
                     [2, true],
                     [3, false]
                  ]
               },
               {
                  settings: {
                     multiSelectVisibility: 'hidden',
                     stickyColumnsCount: 2
                  },
                  tests: [
                     [0, true],
                     [1, true],
                     [2, false]
                  ]
               }
            ];

            testCases.forEach(function(t) {
               t.tests.forEach(function(test) {
                  var settings = Object.assign({}, t.settings, { columnIndex: test[0] });
                  assert.strictEqual(
                     gridMod.GridViewModel._private.isFixedCell(settings),
                     test[1],
                     'Expected "' + test[1] + '" for settings ' + JSON.stringify(settings)
                  );
               });
            });
            var firstRow = gridMod.GridViewModel._private.isFixedCell({
               multiSelectVisibility: false,
               stickyColumnsCount: 1,
               columnIndex: 0,
               rowIndex: 0,
               isMultiHeader: true
            })
            assert.isTrue(firstRow);
            var secondRow = gridMod.GridViewModel._private.isFixedCell({
               multiSelectVisibility: false,
               stickyColumnsCount: 1,
               columnIndex: 0,
               rowIndex: 1,
               isMultiHeader: true
            })
            assert.isFalse(secondRow);
         });
         it('getColumnScrollCellClasses', function() {
            const backgroundStyle = 'controls-background-default_theme-default';
            const fixedCell = ` controls-Grid__cell_fixed controls-Grid__cell_fixed_theme-${theme}`;
            const transformCell = ' controls-Grid__cell_transform';
            const params = {
               multiSelectVisibility: 'hidden',
               stickyColumnsCount: 1,
               columnIndex: 0,
               rowIndex: 0,
               isMultiHeader: false
            };
            assert.equal(fixedCell, gridMod.GridViewModel._private.getColumnScrollCellClasses(params, theme));
            assert.equal(transformCell, gridMod.GridViewModel._private.getColumnScrollCellClasses({ ...params, columnIndex: 2 }, theme));
            assert.equal(backgroundStyle, gridMod.GridViewModel._private.getBackgroundStyle({...params, theme}));
            assert.equal(' ' + backgroundStyle, gridMod.GridViewModel._private.getBackgroundStyle({...params, theme}, true));
         });

         it('getBottomPaddingStyles', function() {
            assert.equal('grid-column-start: 2; grid-column-end: 5; grid-row-start: 10; grid-row-end: 11;', gridViewModel.getBottomPaddingStyles());
         });

         it('getColumnAlignGroupStyles', function () {

            let itemData = {
               hasMultiSelect: false,
               columns: [{}, {}, {}]
            };

            assert.deepEqual(
                gridMod.GridViewModel._private.getColumnAlignGroupStyles(itemData, undefined),
                {
                   left: `grid-column: 1 / 4; -ms-grid-column: 1; -ms-grid-column-span: 3;`,
                   right: ''
                }
            );

            assert.deepEqual(
                gridMod.GridViewModel._private.getColumnAlignGroupStyles(itemData, 2),
                {
                   left: 'grid-column: 1 / -2; -ms-grid-column: 1; -ms-grid-column-span: 2;',
                   right: 'grid-column: span 1 / auto; -ms-grid-column: 3; -ms-grid-column-span: 1;'
                }
            );

            itemData.columns = [{}, {}, {}, {}, {}, {}, {}];
            assert.deepEqual(
               gridMod.GridViewModel._private.getColumnAlignGroupStyles(itemData, 4),
               {
                  left: 'grid-column: 1 / -4; -ms-grid-column: 1; -ms-grid-column-span: 4;',
                  right: 'grid-column: span 3 / auto; -ms-grid-column: 5; -ms-grid-column-span: 3;'
               }
            );

            itemData.hasMultiSelect = true;
            itemData.columns = [{}, {}, {}, {}];

            assert.deepEqual(
                gridMod.GridViewModel._private.getColumnAlignGroupStyles(itemData, undefined),
                {
                   left: `grid-column: 1 / 5; -ms-grid-column: 1; -ms-grid-column-span: 4;`,
                   right: ''
                }
            );

            assert.deepEqual(
                gridMod.GridViewModel._private.getColumnAlignGroupStyles(itemData, 2),
                {
                   left: 'grid-column: 1 / -2; -ms-grid-column: 1; -ms-grid-column-span: 3;',
                   right: 'grid-column: span 1 / auto; -ms-grid-column: 4; -ms-grid-column-span: 1;'
                }
            );

            itemData.columns = [{}, {}, {}, {}, {}, {}, {}, {}];
            assert.deepEqual(
               gridMod.GridViewModel._private.getColumnAlignGroupStyles(itemData, 5),
               {
                  left: 'grid-column: 1 / -3; -ms-grid-column: 1; -ms-grid-column-span: 6;',
                  right: 'grid-column: span 2 / auto; -ms-grid-column: 7; -ms-grid-column-span: 2;'
               }
            );

         });

         it('getColspanForColumnScroll', function () {
            assert.deepEqual(
                {
                   fixedColumns: 'grid-column: 1 / 3; -ms-grid-column: 1; -ms-grid-column-span: 2; z-index: 3;',
                   scrollableColumns: 'grid-column: 3 / 11; -ms-grid-column: 3; -ms-grid-column-span: 8; z-index: auto;',
                   actions: 'grid-column: 3 / 11; -ms-grid-column: 3; -ms-grid-column-span: 8;'
                },
                gridMod.GridViewModel._private.getColspanForColumnScroll({
                   _options: {
                      multiSelectVisibility: 'hidden',
                      columnScroll: true,
                      stickyColumnsCount: 2,
                   },
                   _columns: {length: 10}
                })
            );

            assert.deepEqual(
                {
                   fixedColumns: 'grid-column: 2 / 4; -ms-grid-column: 2; -ms-grid-column-span: 2; z-index: 3;',
                   scrollableColumns: 'grid-column: 4 / 12; -ms-grid-column: 4; -ms-grid-column-span: 8; z-index: auto;',
                   actions: 'grid-column: 4 / 12; -ms-grid-column: 4; -ms-grid-column-span: 8;'
                },
                gridMod.GridViewModel._private.getColspanForColumnScroll({
                   _options: {
                      multiSelectVisibility: 'visible',
                      columnScroll: true,
                      stickyColumnsCount: 2,
                   },
                   _columns: {length: 10}
                })
            );

         });
         it('setMultiselect with multiheader', () => {
            let gridModel = new gridMod.GridViewModel({
               ...cfg,
               header: [{}, {}, {}],
               items: new collection.RecordSet({
                  rawData: [],
                  keyProperty: 'id'
               })
            });
            let isMultiHeader = false;
            gridModel._prepareHeaderColumns = (array) => {
               isMultiHeader = Array.isArray(array[0]);
            };
            gridModel.setMultiSelectVisibility('visible');
            assert.isFalse(isMultiHeader);
            gridModel._header = [[{}, {}], [{}]];
            gridModel._isMultiHeader = true;
            gridModel.setMultiSelectVisibility('visible');
            assert.isTrue(isMultiHeader);
         });

         it('ladder can be on full grid Mac Os', function() {
            let gridModel = new gridMod.GridViewModel({
               ...cfg,
               stickyColumn: {
                  index: 0,
                  property: ''
               },
               items: new collection.RecordSet({
                  rawData: [{
                     id: 1
                  }],
                  keyProperty: 'id'
               })
            });

            gridModel._ladder = {
               stickyLadder: [
                  {
                     headingStyle: '123'
                  }
               ]
            };

            assert.equal(gridModel.getCurrent().styleLadderHeading, '123');
         });
      });

      describe('no grid support', () => {
         let
             nativeIsFullGridSupport = GridLayoutUtil.isFullGridSupport,
             nativeGetDefaultColumnWidth = GridLayoutUtil.getDefaultColumnWidth,
             model;


         beforeEach(() => {
            model = new gridMod.GridViewModel(cfg);
            GridLayoutUtil.isFullGridSupport = () => false;
            GridLayoutUtil.getDefaultColumnWidth = () => 'auto';
         });
         afterEach(() => {
            model.destroy();
            model = null;
            GridLayoutUtil.isFullGridSupport = nativeIsFullGridSupport;
            GridLayoutUtil.getDefaultColumnWidth = nativeGetDefaultColumnWidth;
         });

         it('isFixedLayout', function () {
            model = new gridMod.GridViewModel({...cfg, columnScroll: true});
            assert.isFalse(model.isFixedLayout());
            model = new gridMod.GridViewModel({...cfg, columnScroll: false});
            assert.isTrue(model.isFixedLayout());
            model = new gridMod.GridViewModel({...cfg});
            assert.isTrue(model.isFixedLayout());
         });

         describe('header', () => {
            it('valign header cell', function () {
               model._headerRows = [
                  [ /* Первая строка шапки */
                     {
                        /* Checkbox */
                        startRow: 0,
                        startColumn: 0
                     },
                     { startColumn: 1 }
                  ],
                  [ /* Вторая строка шапки */ ]
               ];
               model._maxEndRow = 3;

               cAssert.isClassesEqual(model.getCurrentHeaderColumn(0, 1).cellClasses, 'controls-Grid__header-cell_align_items_top');
            });
         });

         it('_prepareCrossBrowserColumn', function () {
            const initialColumns = [
               {title: 'first', width: ''},
               {title: 'second', compatibleWidth: '100px', width: '1fr'},
               {title: 'third', width: '100px'},
               {title: 'fourth', width: 'max-content', compatibleWidth: '12%' },
               {title: 'last', width: 'auto'}
            ];
            const resultColumns = [
               {title: 'first', width: 'auto'},
               {title: 'second', width: '100px', compatibleWidth: '100px'},
               {title: 'third', width: '100px'},
               {title: 'fourth', width: '12%', compatibleWidth: '12%'},
               {title: 'last', width: 'auto'}
            ];

            for (let i = 0; i < initialColumns.length; i++) {
               assert.deepEqual(
                   resultColumns[i],
                   model._prepareCrossBrowserColumn(initialColumns[i]),
                   'Incorrect result "_prepareCrossBrowserColumn(initialColumns[' + i + '])".'
               );
            }

         });

         it('TableCellStyles', function() {
            model = new gridMod.GridViewModel({
               ...cfg,
               multiSelectVisibility: 'hidden',
               columns: [
                  { title: 'first', width: '101px' },
                  { title: 'second', compatibleWidth: '102px', width: '1fr' },
                  { title: 'third' }
               ],
               columnScroll: true
            });
            const current = model.getCurrent();
            assert.equal(current.getCurrentColumn().tableCellStyles, 'min-width: 101px; max-width: 101px;');
            current.goToNextColumn();
            assert.equal(current.getCurrentColumn().tableCellStyles, 'min-width: 102px; max-width: 102px;');
            current.goToNextColumn();
            assert.equal(current.getCurrentColumn().tableCellStyles, '');
         });

         it('tableCellStyles for results', function() {
            model = new gridMod.GridViewModel({
               ...cfg,
               multiSelectVisibility: 'hidden',
               columns: [
                  { title: 'first', width: '101px' },
                  { title: 'second', compatibleWidth: '102px', width: '1fr' },
                  { title: 'third' }
               ],
               columnScroll: true
            });

            const current = model.getCurrentResultsColumn();
            assert.equal(current.tableCellStyles, 'min-width: 101px; max-width: 101px;');
         });

         it('should rowspan checkbox th if multiheader', function () {
            model._headerRows = [
                [ /* Первая строка шапки */
                   {
                      /* Checkbox */
                      startRow: 0,
                      startColumn: 0
                   },
                   { startColumn: 1 }
                ],
                [ /* Вторая строка шапки */ ]
            ];
            model._maxEndRow = 3;
            const checkboxCell = model.getCurrentHeaderColumn(0, 0);
            assert.equal(checkboxCell.rowSpan, 2);
            assert.equal(checkboxCell.colSpan, 1);
         });

      });

      describe('grid separators', () => {

         describe('rowSeparators', () => {

            it('without row separators', () => {
               const classList = {base: '', columnContent: ''};
               const current = {
                  rowSeparatorSize: null,
                  columnSeparatorSize: null,
                  columnIndex: 0
               };
               gridMod.GridViewModel._private.prepareSeparatorClasses(current, classList, theme);
               cAssert.isClassesEqual(classList.base, 'controls-Grid__row-cell_withRowSeparator_size-null');
            });

            it('with row separators s', () => {
               const classList = {base: '', columnContent: ''};
               const current = {
                  rowSeparatorSize: 's',
                  columnSeparatorSize: null,
                  columnIndex: 0
               };
               gridMod.GridViewModel._private.prepareSeparatorClasses(current, classList, theme);
               cAssert.isClassesEqual(classList.base, 'controls-Grid__row-cell_withRowSeparator_size-s_theme-default controls-Grid__rowSeparator_size-s_theme-default');
            });

            it('with row separators l', () => {
               const classList = {base: '', columnContent: ''};
               const current = {
                  rowSeparatorSize: 'l',
                  columnSeparatorSize: null,
                  columnIndex: 0
               };
               gridMod.GridViewModel._private.prepareSeparatorClasses(current, classList, theme);
               cAssert.isClassesEqual(classList.base, 'controls-Grid__row-cell_withRowSeparator_size-l_theme-default controls-Grid__rowSeparator_size-l_theme-default');
            });

         });

         describe('column separator', () => {
            it('without column separators, no multiselect', () => {
               const classList = {base: '', columnContent: ''};
               const current = {
                  rowSeparatorSize: null,
                  columnSeparatorSize: null,
                  columnIndex: 0
               };
               [
                  [' controls-Grid__row-cell_withRowSeparator_size-null', ''],
                  [' controls-Grid__row-cell_withRowSeparator_size-null', ''],
                  [' controls-Grid__row-cell_withRowSeparator_size-null', '']
               ].forEach((expectedClasses, index) => {
                  current.columnIndex = index;

                  gridMod.GridViewModel._private.prepareSeparatorClasses(current, classList, theme);
                  assert.equal(classList.base, expectedClasses[0]);
                  assert.equal(classList.columnContent, expectedClasses[1]);

                  // go to next column
                  classList.base = '';
                  classList.columnContent = '';
               });
            });

            it('without column separators size s, has multiselect', () => {
               const classList = {base: '', columnContent: ''};
               const current = {
                  columns: [
                     {/*first, shouldnt left border by standart*/},
                     {/*second, need border*/},
                     {/* also need*/}
                  ],
                  rowSeparatorSize: null,
                  columnSeparatorSize: null,
                  columnIndex: 0,
                  hasMultiSelect: false
               };
               [
                  [' controls-Grid__row-cell_withRowSeparator_size-null', ''],
                  [' controls-Grid__row-cell_withRowSeparator_size-null', ''],
                  [' controls-Grid__row-cell_withRowSeparator_size-null', '']
               ].forEach((expectedClasses, index) => {
                  current.columnIndex = index;

                  gridMod.GridViewModel._private.prepareSeparatorClasses(current, classList, theme);
                  assert.equal(classList.base, expectedClasses[0]);
                  assert.equal(classList.columnContent, expectedClasses[1]);

                  // go to next column
                  classList.base = '';
                  classList.columnContent = '';
               });
            });

            it('with column separators size s, no multiselect', () => {
               const classList = {base: '', columnContent: ''};
               const current = {
                  columns: [
                     {/*first, shouldnt left border by standart*/},
                     {/*second, need border*/},
                     {/* also need*/}
                  ],
                  rowSeparatorSize: null,
                  columnSeparatorSize: 's',
                  columnIndex: 0,
                  hasMultiSelect: false
               };
               [
                  [' controls-Grid__row-cell_withRowSeparator_size-null', ''],
                  [' controls-Grid__row-cell_withRowSeparator_size-null controls-Grid__row-cell_withColumnSeparator', ' controls-Grid__columnSeparator_size-s_theme-default'],
                  [' controls-Grid__row-cell_withRowSeparator_size-null controls-Grid__row-cell_withColumnSeparator', ' controls-Grid__columnSeparator_size-s_theme-default']
               ].forEach((expectedClasses, index) => {
                  current.columnIndex = index;

                  gridMod.GridViewModel._private.prepareSeparatorClasses(current, classList, theme);
                  assert.equal(classList.base, expectedClasses[0]);
                  assert.equal(classList.columnContent, expectedClasses[1]);

                  // go to next column
                  classList.base = '';
                  classList.columnContent = '';
               });
            });

            it('with column separators size s, has multiselect', () => {
               const classList = {base: '', columnContent: ''};
               const current = {
                  columns: [
                     {/*multiselect*/},
                     {/*first, shouldnt left border by standart*/},
                     {/*second, need border*/}
                  ],
                  rowSeparatorSize: null,
                  columnSeparatorSize: 's',
                  columnIndex: 0,
                  hasMultiSelect: true
               };
               [
                  [' controls-Grid__row-cell_withRowSeparator_size-null', ''],
                  [' controls-Grid__row-cell_withRowSeparator_size-null', ''],
                  [' controls-Grid__row-cell_withRowSeparator_size-null controls-Grid__row-cell_withColumnSeparator', ' controls-Grid__columnSeparator_size-s_theme-default']
               ].forEach((expectedClasses, index) => {
                  current.columnIndex = index;

                  gridMod.GridViewModel._private.prepareSeparatorClasses(current, classList, theme);
                  assert.equal(classList.base, expectedClasses[0]);
                  assert.equal(classList.columnContent, expectedClasses[1]);

                  // go to next column
                  classList.base = '';
                  classList.columnContent = '';
               });
            });
         });
      });

      describe('_onCollectionChangeFn prefix update', () => {
         it('does not update prefix version without ladder', () => {
            const model = new gridMod.GridViewModel({
               ...cfg,
               ladderProperties: null
            });
            const event = {
               result: undefined,
               setResult(result) {
                  this.result = result;
               }
            };

            model._onCollectionChangeFn(event, collection.IObservable.ACTION_ADD);
            assert.isUndefined(event.result, 'Add action should not update prefix version without ladder');

            model._onCollectionChangeFn(event, collection.IObservable.ACTION_REMOVE);
            assert.isUndefined(event.result, 'Remove action should not update prefix version without ladder');

            model._onCollectionChangeFn(event, collection.IObservable.ACTION_CHANGE);
            assert.isUndefined(event.result, 'Change action should not update prefix version without ladder');
         });

         it('getHeaderZIndex with or without columnScroll', function() {
            const params = {
               multiSelectVisibility: false,
               stickyColumnsCount: 1,
               columnIndex: 0,
               rowIndex: 0,
               isMultiHeader: false,
               columnScroll: true
            }
            // first fixed coll with columnScroll
            assert.equal(4, gridMod.GridViewModel._private.getHeaderZIndex(params));
            // first fit coll withoutColumnScroll
            assert.equal(3, gridMod.GridViewModel._private.getHeaderZIndex({...params, columnScroll: false}));
         })

         it('updates prefix version with ladder only on add and remove', () => {
            const model = new gridMod.GridViewModel({
               ...cfg,
               ladderProperties: ['date']
            });
            const event = {
               result: undefined,
               setResult(result) {
                  this.result = result;
               }
            };

            model._onCollectionChangeFn(event, collection.IObservable.ACTION_CHANGE);
            assert.isUndefined(event.result, 'Change action should not update prefix version with ladder');

            model._onCollectionChangeFn(event, collection.IObservable.ACTION_ADD);
            assert.isUndefined(event.result, 'Add action should not update prefix version with ladder');

            event.result = undefined;
            model._onCollectionChangeFn(event, collection.IObservable.ACTION_REMOVE);
            assert.isUndefined(event.result, 'Remove action should not update prefix version with ladder');
         });
      });

      describe('Calculation of empty template columns', () => {
         let model;

         it('should calculate empty template with this.getMultiSelectVisibility() === "hidden"', () => {
            model = new gridMod.GridViewModel({
               ...cfg,
               multiSelectVisibility: 'hidden',
               columnScroll: false
            });
            assert.equal(model.getEmptyTemplateStyles(), 'grid-column-start: 1; grid-column-end: 4;');
         });

         it('should calculate empty template with this.getMultiSelectVisibility() === "visible"', () => {
            model = new gridMod.GridViewModel({
               ...cfg,
               multiSelectVisibility: 'visible',
               columnScroll: false
            });
            assert.equal(model.getEmptyTemplateStyles(), 'grid-column-start: 2; grid-column-end: 5;');
         });

         it('should calculate empty template with _options.columnScroll', () => {
            model = new gridMod.GridViewModel({
               ...cfg,
               columns: [],
               multiSelectVisibility: 'visible',
               columnScroll: true
            });
            assert.equal(model.getEmptyTemplateStyles(), 'grid-column-start: 1; grid-column-end: 5;');
         });

         it('should calculate empty template with ActionsCell', () => {
            model = new gridMod.GridViewModel({
               ...cfg,
               multiSelectVisibility: 'visible',
               columnScroll: true
            });
            assert.equal(model.getEmptyTemplateStyles(), 'grid-column-start: 1; grid-column-end: 6;');
         });

         it('should calculate empty template with sticky column', () => {
            model = new gridMod.GridViewModel({
               ...cfg,
               multiSelectVisibility: 'visible',
               columnScroll: false,
               stickyColumn: {
                  index: 0,
                  property: ''
               }
            });
            assert.equal(model.getEmptyTemplateStyles(), 'grid-column-start: 2; grid-column-end: 6;');
         });

         it('should calculate empty template when this._columns.length === 0', () => {
            model = new gridMod.GridViewModel({
               ...cfg,
               multiSelectVisibility: 'visible',
               columns: [],
               header: [],
               columnScroll: false
            });
            model.getEmptyTemplateStyles();
            assert.equal(model.getEmptyTemplateStyles(), 'grid-column-start: 2; grid-column-end: 3;');
         });

         it('should calculate empty template when this._columns.length === 0 and this._header.length > 0', () => {
            model = new gridMod.GridViewModel({
               ...cfg,
               multiSelectVisibility: 'visible',
               columns: [],
               columnScroll: false
            });
            model.getEmptyTemplateStyles()
            assert.equal(model.getEmptyTemplateStyles(), 'grid-column-start: 2; grid-column-end: 5;');
         });

         it('should calculate empty template when this._columns.length === 0 and this._header is undefined', () => {
            model = new gridMod.GridViewModel({
               ...cfg,
               multiSelectVisibility: 'visible',
               columns: [],
               header: undefined,
               columnScroll: false
            });
            model.getEmptyTemplateStyles();
            assert.equal(model.getEmptyTemplateStyles(), 'grid-column-start: 2; grid-column-end: 3;');
         });
      });
   });
});
