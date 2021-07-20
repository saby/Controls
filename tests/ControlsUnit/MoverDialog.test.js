define([ 'Controls/moverDialog'], function(moverDialog) {
   describe('Controls.moverDialog', function() {
      it('getDefaultOptions', function() {
         assert.deepEqual(moverDialog.Template.getDefaultOptions(), {
            displayProperty: 'title',
            filter: {},
            root: null
         });
      });
   });
});
