define(['Controls/_grid/ScrollWrapper'], function(ScrollWrapper) {
   describe('Controls/_grid/ScrollWrapper', function() {
      it('_getGridStyles', function() {
         let
            options = {
               listModel: {
                  getMaxEndColumn: () => 0,
                  getStickyColumnsCount: () => 1,
                  getHeader: () => [{}, {}, {}, {}, {}],
                  getMultiSelectVisibility: () => 'hidden'
               },
               topOffset: 25,
               scrollWidth: 500,
               positionChangeHandler: () => {},
            },
            wrapper = new ScrollWrapper.default(options);

         wrapper._beforeMount(options);
         wrapper.saveOptions(options);
         assert.equal('grid-column: 2 / 6;width: 500px', wrapper._getGridStyles(options));
         wrapper._options.listModel.getMultiSelectVisibility = () => 'visible';
         assert.equal('grid-column: 3 / 7;width: 500px', wrapper._getGridStyles(options));
         wrapper._options.listModel.getMaxEndColumn = () => 11;
         assert.equal('grid-column: 3 / 12;width: 500px', wrapper._getGridStyles(options));
      })
   })
})
