define([
   'Controls/_grid/utils/GridRowIndexUtil',
   'Controls/_list/resources/utils/ItemsUtil',
   'Controls/grid',
   'Types/collection'
], function(RowUtil, ItemsUtil, gridLib, collection) {

   describe('Controls._grid.utils.GridRowIndexUtil', function() {


      let
         gridData = [
            {
               'id': '1',
               'title': 'Хлеб',
               'price': 50
            },
            {
               'id': '2',
               'title': 'Хлеб',
               'price': 150
            },
            {
               'id': '3',
               'title': 'Масло',
               'price': 100
            },
            {
               'id': '4',
               'title': 'Помидор',
               'price': 75
            },
            {
               'id': '5',
               'title': 'Капуста китайская',
               'price': 35
            }
         ],
         gridColumns = [
            {
               displayProperty: 'title',
               width: '1fr',
            },
            {
               displayProperty: 'price',
               width: 'auto',
            }
         ],
         gridHeader = [
            { title: '' },
            { title: 'Цена' },
         ];

      function createModel(cfg, data) {
         cfg = cfg || {};
         cfg.keyProperty = cfg.keyProperty || 'id';
         cfg.displayProperty = cfg.displayProperty || 'title';
         cfg.columns = 'columns' in cfg ? cfg.columns : gridColumns;
         cfg.header = 'header' in cfg ? cfg.header : gridHeader;
         cfg.items = new collection.RecordSet({
            rawData: data || gridData,
            keyProperty: cfg.keyProperty
         });
         cfg.columnScroll = cfg.columnScroll || false;
         return new gridLib.GridViewModel(cfg);
      }

      let gridModel;

      afterEach(function() {
         gridModel.destroy();
         gridModel = null;
      });

      describe('Grid with header', function() {

         describe('columnScroll', function() {

            beforeEach(function() {
               gridModel = createModel({
                  resultsPosition: 'top',
                  columnScroll: true
               });
            });

            it('getBottomPaddingRowIndex', function() {
               assert.equal(gridModel._getRowIndexHelper().getBottomPaddingRowIndex(), 8);
            });

            it('getFooterIndex', function() {
               assert.equal(gridModel._getRowIndexHelper().getFooterIndex(), 8);
               gridModel._options._needBottomPadding = true;
               assert.equal(gridModel._getRowIndexHelper().getFooterIndex(), 9);
            });
         });

         describe('getHeaderRowsArray', function() {
            beforeEach(function() {
               gridModel = createModel({
                  resultsPosition: 'top',
                  columnScroll: true
               });
            });
            it('getHeaderRowsArray without multiheader', function() {
               var headerRows = RowUtil.getHeaderRowsArray(gridHeader, false, false);
               assert.deepEqual([gridHeader], headerRows);
            });
            it('getHeaderRowsArray with simple stickyLadder', () => {
               const headerWithLadderResult = [
                  [
                     { ladderCell: true },
                     { title: '' },
                     { title: 'Цена' }
                  ]
               ];
               var headerRows = RowUtil.getHeaderRowsArray(gridHeader, false, false, false, 1);
               assert.deepEqual(headerWithLadderResult, headerRows);
            });
            it('getHeaderRowsArray with double stickyLadder', () => {
               const headerWithLadderResult = [
                  [
                     { ladderCell: true },
                     { title: '' },
                     { ladderCell: true },
                     { title: 'Цена' }
                  ]
               ];
               var headerRows = RowUtil.getHeaderRowsArray(gridHeader, false, false, false, 2);
               assert.deepEqual(headerWithLadderResult, headerRows);
            });
            it('getHeaderRowsArray with multiheader', function() {
               var header = [
                  {
                     align: 'center',
                     endColumn: 2,
                     endRow: 2,
                     startColumn: 1,
                     startRow: 1,
                     title: 'Наименование',
                  },
                  {
                     align: 'center',
                     endColumn: 3,
                     endRow: 2,
                     startColumn: 2,
                     startRow: 1,
                     title: 'Price',
                  },
                  {
                     align: 'center',
                     endColumn: 2,
                     endRow: 3,
                     startColumn: 1,
                     startRow: 2,
                     title: 'Cell',
                  },
                  {
                     align: 'center',
                     endColumn: 3,
                     endRow: 3,
                     startColumn: 2,
                     startRow: 2,
                     title: 'Общие',
                  }
               ];
               var headerRows = RowUtil.getHeaderRowsArray(header, false, true);
               assert.deepEqual([[header[0], header[1]], [header[2], header[3]]], headerRows);
            });
         });

         describe('results in top', function() {

            beforeEach(function() {
               gridModel = createModel({ resultsPosition: 'top' });
            });

            it('getIndexById', function() {
               assert.equal(gridModel._getRowIndexHelper().getIndexById('1'), 2);
               assert.equal(gridModel._getRowIndexHelper().getIndexById('3'), 4);
               assert.equal(gridModel._getRowIndexHelper().getIndexById('5'), 6);
            });

            it('getIndexByItem', function() {
               assert.equal(gridModel._getRowIndexHelper().getIndexByItem(gridModel.getDisplay().at(0)), 2);
               assert.equal(gridModel._getRowIndexHelper().getIndexByItem(gridModel.getDisplay().at(2)), 4);
               assert.equal(gridModel._getRowIndexHelper().getIndexByItem(gridModel.getDisplay().at(4)), 6);
            });

            it('getIndexByDisplayIndex', function() {
               assert.equal(gridModel._getRowIndexHelper().getIndexByDisplayIndex(0), 2);
               assert.equal(gridModel._getRowIndexHelper().getIndexByDisplayIndex(2), 4);
               assert.equal(gridModel._getRowIndexHelper().getIndexByDisplayIndex(4), 6);
            });

            it('getResultsIndex', function() {
               assert.equal(gridModel._getRowIndexHelper().getResultsIndex(), 1);
               assert.equal(gridModel._getRowIndexHelper().getResultsIndex(), 1);
               gridModel._options._needBottomPadding = true;
               assert.equal(gridModel._getRowIndexHelper().getResultsIndex(), 1);
            });

            it('getBottomPaddingRowIndex', function() {
               assert.equal(gridModel._getRowIndexHelper().getBottomPaddingRowIndex(), 7);
            });

            it('getFooterIndex', function() {
               assert.equal(gridModel._getRowIndexHelper().getFooterIndex(), 7);
               gridModel._options._needBottomPadding = true;
               assert.equal(gridModel._getRowIndexHelper().getFooterIndex(), 8);
            });
         });

         describe('results in bottom', function() {

            beforeEach(function() {
               gridModel = createModel({ resultsPosition: 'bottom' });
            });

            it('getIndexById', function() {
               assert.equal(gridModel._getRowIndexHelper().getIndexById('1'), 1);
               assert.equal(gridModel._getRowIndexHelper().getIndexById('3'), 3);
               assert.equal(gridModel._getRowIndexHelper().getIndexById('5'), 5);
            });

            it('getIndexByItem', function() {
               assert.equal(gridModel._getRowIndexHelper().getIndexByItem(gridModel.getDisplay().at(0)), 1);
               assert.equal(gridModel._getRowIndexHelper().getIndexByItem(gridModel.getDisplay().at(2)), 3);
               assert.equal(gridModel._getRowIndexHelper().getIndexByItem(gridModel.getDisplay().at(4)), 5);
            });

            it('getIndexByDisplayIndex', function() {
               assert.equal(gridModel._getRowIndexHelper().getIndexByDisplayIndex(0), 1);
               assert.equal(gridModel._getRowIndexHelper().getIndexByDisplayIndex(2), 3);
               assert.equal(gridModel._getRowIndexHelper().getIndexByDisplayIndex(4), 5);
            });

            it('getBottomPaddingRowIndex', function() {
               assert.equal(gridModel._getRowIndexHelper().getBottomPaddingRowIndex(), 6);
            });

            it('getResultsIndex', function() {
               assert.equal(gridModel._getRowIndexHelper().getResultsIndex(), 6);
               gridModel._options._needBottomPadding = true;
               assert.equal(gridModel._getRowIndexHelper().getResultsIndex(), 7);
            });

            it('getFooterIndex', function() {
               assert.equal(gridModel._getRowIndexHelper().getFooterIndex(), 7);
               gridModel._options._needBottomPadding = true;
               assert.equal(gridModel._getRowIndexHelper().getFooterIndex(), 8);
            });
         });

         describe('no results', function() {

            beforeEach(function() {
               gridModel = createModel();
            });

            it('getIndexById', function() {
               assert.equal(gridModel._getRowIndexHelper().getIndexById('1'), 1);
               assert.equal(gridModel._getRowIndexHelper().getIndexById('3'), 3);
               assert.equal(gridModel._getRowIndexHelper().getIndexById('5'), 5);
            });

            it('getIndexByItem', function() {
               assert.equal(gridModel._getRowIndexHelper().getIndexByItem(gridModel.getDisplay().at(0)), 1);
               assert.equal(gridModel._getRowIndexHelper().getIndexByItem(gridModel.getDisplay().at(2)), 3);
               assert.equal(gridModel._getRowIndexHelper().getIndexByItem(gridModel.getDisplay().at(4)), 5);
            });

            it('getIndexByDisplayIndex', function() {
               assert.equal(gridModel._getRowIndexHelper().getIndexByDisplayIndex(0), 1);
               assert.equal(gridModel._getRowIndexHelper().getIndexByDisplayIndex(2), 3);
               assert.equal(gridModel._getRowIndexHelper().getIndexByDisplayIndex(4), 5);
            });

            it('getBottomPaddingRowIndex', function() {
               assert.equal(gridModel._getRowIndexHelper().getBottomPaddingRowIndex(), 6);
            });

            it('getFooterIndex', function() {
               assert.equal(gridModel._getRowIndexHelper().getFooterIndex(), 6);
               gridModel._options._needBottomPadding = true;
               assert.equal(gridModel._getRowIndexHelper().getFooterIndex(), 7);
            });
         });

      });

      describe('Grid without header', function() {

         describe('results in top', function() {

            beforeEach(function() {
               gridModel = createModel({
                  resultsPosition: 'top',
                  header: null
               });
            });

            it('getIndexById', function() {
               assert.equal(gridModel._getRowIndexHelper().getIndexById('1'), 1);
               assert.equal(gridModel._getRowIndexHelper().getIndexById('3'), 3);
               assert.equal(gridModel._getRowIndexHelper().getIndexById('5'), 5);
            });

            it('getIndexByItem', function() {
               assert.equal(gridModel._getRowIndexHelper().getIndexByItem(gridModel.getDisplay().at(0)), 1);
               assert.equal(gridModel._getRowIndexHelper().getIndexByItem(gridModel.getDisplay().at(2)), 3);
               assert.equal(gridModel._getRowIndexHelper().getIndexByItem(gridModel.getDisplay().at(4)), 5);
            });

            it('getIndexByDisplayIndex', function() {
               assert.equal(gridModel._getRowIndexHelper().getIndexByDisplayIndex(0), 1);
               assert.equal(gridModel._getRowIndexHelper().getIndexByDisplayIndex(2), 3);
               assert.equal(gridModel._getRowIndexHelper().getIndexByDisplayIndex(4), 5);
            });

            it('getBottomPaddingRowIndex', function() {
               assert.equal(gridModel._getRowIndexHelper().getBottomPaddingRowIndex(), 6);
            });

            it('getResultsIndex', function() {
               assert.equal(gridModel._getRowIndexHelper().getResultsIndex(), 0);
               gridModel._options._needBottomPadding = true;
               assert.equal(gridModel._getRowIndexHelper().getResultsIndex(), 0);
            });

            it('getFooterIndex', function() {
               assert.equal(gridModel._getRowIndexHelper().getFooterIndex(), 6);
               gridModel._options._needBottomPadding = true;
               assert.equal(gridModel._getRowIndexHelper().getFooterIndex(), 7);
            });

         });

         describe('results in bottom', function() {

            beforeEach(function() {
               gridModel = createModel({
                  resultsPosition: 'bottom',
                  header: null
               });
            });

            it('getIndexById', function() {
               assert.equal(gridModel._getRowIndexHelper().getIndexById('1'), 0);
               assert.equal(gridModel._getRowIndexHelper().getIndexById('3'), 2);
               assert.equal(gridModel._getRowIndexHelper().getIndexById('5'), 4);
            });

            it('getIndexByItem', function() {
               assert.equal(gridModel._getRowIndexHelper().getIndexByItem(gridModel.getDisplay().at(0)), 0);
               assert.equal(gridModel._getRowIndexHelper().getIndexByItem(gridModel.getDisplay().at(2)), 2);
               assert.equal(gridModel._getRowIndexHelper().getIndexByItem(gridModel.getDisplay().at(4)), 4);
            });

            it('getIndexByDisplayIndex', function() {
               assert.equal(gridModel._getRowIndexHelper().getIndexByDisplayIndex(0), 0);
               assert.equal(gridModel._getRowIndexHelper().getIndexByDisplayIndex(2), 2);
               assert.equal(gridModel._getRowIndexHelper().getIndexByDisplayIndex(4), 4);
            });

            it('getBottomPaddingRowIndex', function() {
               assert.equal(gridModel._getRowIndexHelper().getBottomPaddingRowIndex(), 5);
            });

            it('getResultsIndex', function() {
               assert.equal(gridModel._getRowIndexHelper().getResultsIndex(), 5);
               gridModel._options._needBottomPadding = true;
               assert.equal(gridModel._getRowIndexHelper().getResultsIndex(), 6);
            });

            it('getFooterIndex', function() {
               assert.equal(gridModel._getRowIndexHelper().getFooterIndex(), 6);
               gridModel._options._needBottomPadding = true;
               assert.equal(gridModel._getRowIndexHelper().getFooterIndex(), 7);
            });
         });

         describe('no results', function() {

            beforeEach(function() {
               gridModel = createModel({ header: null });
            });

            it('getIndexById', function() {
               assert.equal(gridModel._getRowIndexHelper().getIndexById('1'), 0);
               assert.equal(gridModel._getRowIndexHelper().getIndexById('3'), 2);
               assert.equal(gridModel._getRowIndexHelper().getIndexById('5'), 4);
            });

            it('getIndexByItem', function() {
               assert.equal(gridModel._getRowIndexHelper().getIndexByItem(gridModel.getDisplay().at(0)), 0);
               assert.equal(gridModel._getRowIndexHelper().getIndexByItem(gridModel.getDisplay().at(2)), 2);
               assert.equal(gridModel._getRowIndexHelper().getIndexByItem(gridModel.getDisplay().at(4)), 4);
            });

            it('getIndexByDisplayIndex', function() {
               assert.equal(gridModel._getRowIndexHelper().getIndexByDisplayIndex(0), 0);
               assert.equal(gridModel._getRowIndexHelper().getIndexByDisplayIndex(2), 2);
               assert.equal(gridModel._getRowIndexHelper().getIndexByDisplayIndex(4), 4);
            });

            it('getBottomPaddingRowIndex', function() {
               assert.equal(gridModel._getRowIndexHelper().getBottomPaddingRowIndex(), 5);
            });

            it('getFooterIndex', function() {
               assert.equal(gridModel._getRowIndexHelper().getFooterIndex(), 5);
               gridModel._options._needBottomPadding = true;
               assert.equal(gridModel._getRowIndexHelper().getFooterIndex(), 6);
            });

         });

      });

      describe('Empty grid', function() {

         describe('With empty template', function() {

            describe('Grid with header', function() {

               describe('results in top', function() {

                  beforeEach(function() {
                     gridModel = createModel({
                        resultsPosition: 'top',
                        emptyTemplate: 'qwe'
                     }, []);
                  });

                  it('getResultsIndex', function() {
                     assert.equal(gridModel._getRowIndexHelper().getResultsIndex(), 1);
                     assert.equal(gridModel._getRowIndexHelper().getResultsIndex(), 1);
                     gridModel._options._needBottomPadding = true;
                     assert.equal(gridModel._getRowIndexHelper().getResultsIndex(), 1);
                  });

                  it('getFooterIndex', function() {
                     assert.equal(gridModel._getRowIndexHelper().getFooterIndex(), 2);
                     gridModel._options._needBottomPadding = true;
                     assert.equal(gridModel._getRowIndexHelper().getFooterIndex(), 3);
                  });
               });

               describe('results in bottom', function() {

                  beforeEach(function() {
                     gridModel = createModel({
                        resultsPosition: 'bottom',
                        emptyTemplate: 'qwe'
                     });
                  });

                  it('getResultsIndex', function() {
                     assert.equal(gridModel._getRowIndexHelper().getResultsIndex(), 6);
                     gridModel._options._needBottomPadding = true;
                     assert.equal(gridModel._getRowIndexHelper().getResultsIndex(), 7);
                  });

                  it('getFooterIndex', function() {
                     assert.equal(gridModel._getRowIndexHelper().getFooterIndex(), 7);
                     gridModel._options._needBottomPadding = true;
                     assert.equal(gridModel._getRowIndexHelper().getFooterIndex(), 8);
                  });
               });

               describe('no results', function() {

                  beforeEach(function() {
                     gridModel = createModel({ emptyTemplate: 'qwe' }, []);
                  });

                  it('getFooterIndex', function() {
                     assert.equal(gridModel._getRowIndexHelper().getFooterIndex(), 2);
                     gridModel._options._needBottomPadding = true;
                     assert.equal(gridModel._getRowIndexHelper().getFooterIndex(), 3);
                  });
               });

            });

            describe('Grid without header', function() {

               describe('results in top', function() {

                  beforeEach(function() {
                     gridModel = createModel({
                        resultsPosition: 'top',
                        header: null
                     }, gridData.slice(0, 1));
                  });

                  it('getResultsIndex', function() {
                     assert.equal(gridModel._getRowIndexHelper().getResultsIndex(), 0);
                     assert.equal(gridModel._getRowIndexHelper().getResultsIndex(), 0);
                     gridModel._options._needBottomPadding = true;
                     assert.equal(gridModel._getRowIndexHelper().getResultsIndex(), 0);
                  });

                  it('getFooterIndex', function() {
                     assert.equal(gridModel._getRowIndexHelper().getFooterIndex(), 1);
                     gridModel._options._needBottomPadding = true;
                     assert.equal(gridModel._getRowIndexHelper().getFooterIndex(), 2);
                  });

               });

               describe('results in bottom', function() {

                  beforeEach(function() {
                     gridModel = createModel({
                        resultsPosition: 'bottom',
                        header: null
                     });
                  });

                  it('getResultsIndex', function() {
                     assert.equal(gridModel._getRowIndexHelper().getResultsIndex(), 5);
                     gridModel._options._needBottomPadding = true;
                     assert.equal(gridModel._getRowIndexHelper().getResultsIndex(), 6);
                  });

                  it('getFooterIndex', function() {
                     assert.equal(gridModel._getRowIndexHelper().getFooterIndex(), 6);
                     gridModel._options._needBottomPadding = true;
                     assert.equal(gridModel._getRowIndexHelper().getFooterIndex(), 7);
                  });
               });

               describe('no results', function() {

                  beforeEach(function() {
                     gridModel = createModel({
                        header: null,
                        emptyTemplate: 'qwe'
                     }, []);
                  });

                  it('getFooterIndex', function() {
                     assert.equal(gridModel._getRowIndexHelper().getFooterIndex(), 1);
                     gridModel._options._needBottomPadding = true;
                     assert.equal(gridModel._getRowIndexHelper().getFooterIndex(), 2);
                  });

               });

            });
         });

         describe('Without empty template', function() {

            describe('Grid with header', function() {

               describe('results in top', function() {

                  beforeEach(function() {
                     gridModel = createModel({ resultsPosition: 'top' });
                  });

                  it('getResultsIndex', function() {
                     assert.equal(gridModel._getRowIndexHelper().getResultsIndex(), 1);
                     assert.equal(gridModel._getRowIndexHelper().getResultsIndex(), 1);
                     gridModel._options._needBottomPadding = true;
                     assert.equal(gridModel._getRowIndexHelper().getResultsIndex(), 1);
                  });

                  it('getFooterIndex', function() {
                     assert.equal(gridModel._getRowIndexHelper().getFooterIndex(), 7);
                     gridModel._options._needBottomPadding = true;
                     assert.equal(gridModel._getRowIndexHelper().getFooterIndex(), 8);
                  });
               });

               describe('results in bottom', function() {

                  beforeEach(function() {
                     gridModel = createModel({ resultsPosition: 'bottom' }, []);
                  });

                  it('getFooterIndex', function() {
                     assert.equal(gridModel._getRowIndexHelper().getFooterIndex(), 1);
                     gridModel._options._needBottomPadding = true;
                     assert.equal(gridModel._getRowIndexHelper().getFooterIndex(), 2);
                  });
               });

               describe('no results', function() {

                  beforeEach(function() {
                     gridModel = createModel({}, []);
                  });

                  it('getFooterIndex', function() {
                     assert.equal(gridModel._getRowIndexHelper().getFooterIndex(), 1);
                     gridModel._options._needBottomPadding = true;
                     assert.equal(gridModel._getRowIndexHelper().getFooterIndex(), 2);
                  });
               });

            });

            describe('Grid without header', function() {

               describe('results in top', function() {

                  beforeEach(function() {
                     gridModel = createModel({
                        resultsPosition: 'top',
                        header: null
                     });
                  });

                  it('getResultsIndex', function() {
                     assert.equal(gridModel._getRowIndexHelper().getResultsIndex(), 0);
                     gridModel._options._needBottomPadding = true;
                     assert.equal(gridModel._getRowIndexHelper().getResultsIndex(), 0);
                  });

                  it('getFooterIndex', function() {
                     assert.equal(gridModel._getRowIndexHelper().getFooterIndex(), 6);
                     gridModel._options._needBottomPadding = true;
                     assert.equal(gridModel._getRowIndexHelper().getFooterIndex(), 7);
                  });

               });

               describe('results in bottom', function() {

                  beforeEach(function() {
                     gridModel = createModel({
                        resultsPosition: 'bottom',
                        header: null
                     });
                  });

                  it('getResultsIndex', function() {
                     assert.equal(gridModel._getRowIndexHelper().getResultsIndex(), 5);
                     gridModel._options._needBottomPadding = true;
                     assert.equal(gridModel._getRowIndexHelper().getResultsIndex(), 6);
                  });

                  it('getFooterIndex', function() {
                     assert.equal(gridModel._getRowIndexHelper().getFooterIndex(), 6);
                     gridModel._options._needBottomPadding = true;
                     assert.equal(gridModel._getRowIndexHelper().getFooterIndex(), 7);
                  });
               });

               describe('no results', function() {

                  beforeEach(function() {
                     gridModel = createModel({ header: null }, []);
                  });

                  it('getFooterIndex', function() {
                     assert.equal(gridModel._getRowIndexHelper().getFooterIndex(), 0);
                     gridModel._options._needBottomPadding = true;
                     assert.equal(gridModel._getRowIndexHelper().getFooterIndex(), 1);
                  });

               });

            });
         });

      });

   });
});
