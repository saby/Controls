define(['Controls/_grid/ScrollWrapper'], function(ScrollWrapper) {
   describe('calculating grid header offsets with protected method _getGridStyles()', function() {
      let wrapper;
      let options;

      const header = [{}, {}, {}, {}, {}];

      beforeEach(() => {
         options = {
            listModel: {
               getHeaderMaxEndColumn: () => header.length,
               isMultiHeader: () => false,
               getStickyColumnsCount: () => 1,
               getHeader: () => header,
               getMultiSelectVisibility: () => 'hidden'
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
         assert.equal('grid-column: 3 / 7;width: 500px', wrapper._getGridStyles(options));
      });
      it('should calculate grid header offset when MaxEndColumn is set and isMultiHeader is false', () => {
         wrapper._options.listModel.getMultiSelectVisibility = () => 'visible';
         wrapper._options.listModel.getHeaderMaxEndColumn = () => 10;
         assert.equal('grid-column: 3 / 12;width: 500px', wrapper._getGridStyles(options));
      });
   });
});
