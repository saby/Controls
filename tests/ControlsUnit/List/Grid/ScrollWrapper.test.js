define(['Controls/_grid/ScrollWrapper'], function(ScrollWrapper) {
   describe('calculating grid header offsets with protected method _getGridStyles()', function() {
      let wrapper;
      let options;

      const columns = [{}, {}, {}, {}, {}];
      const header = [{}, {}, {}, {}, {}];

      beforeEach(() => {
         options = {
            listModel: {
               isMultiHeader: () => false,
               getStickyColumnsCount: () => 1,
               getMultiSelectVisibility: () => 'custom',
               hasMultiSelectColumn: () => false,
               stickyLadderCellsCount: () => 0,
               _shouldAddActionsCell: () => false,
               getColumns: () => columns,
               getHeader: () => header,
               getResults: () => null,
               getResultsPosition: () => null,
            },
            topOffset: 25,
            scrollWidth: 500,
            positionChangeHandler: () => {},
         };
         wrapper = new ScrollWrapper.default(options);

         wrapper._beforeMount(options);
         wrapper.saveOptions(options);
      });


      it('should calculate grid header offset when no extra columns is set', () => {
         assert.equal('grid-column: 2 / 6;width: 500px', wrapper._getGridStyles(options));
      });
      it('should calculate grid header offset when MultiSelect column is visible', () => {
         wrapper._options.listModel.getMultiSelectVisibility = () => 'visible';
         wrapper._options.listModel.hasMultiSelectColumn = () => true;
         assert.equal('grid-column: 3 / 7;width: 500px', wrapper._getGridStyles(options));
      });
      it('should calculate grid header offset when MultiSelect column and sticky ladder should be added', () => {
         wrapper._options.listModel.getMultiSelectVisibility = () => 'visible';
         wrapper._options.listModel.hasMultiSelectColumn = () => true;
         wrapper._options.listModel.stickyLadderCellsCount = () => 1;
         assert.equal('grid-column: 4 / 8;width: 500px', wrapper._getGridStyles(options));
      });
   });
});
