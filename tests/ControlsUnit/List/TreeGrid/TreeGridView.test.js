define(['Controls/treeGrid'], function(treeGrid) {
   describe('Controls.List.TreeGridView.TreeGridView', function() {
      it('TreeGridView._onLoadMoreClick', function() {
         var
            treeGridView = new treeGrid.TreeGridView(),
            notifyLoadMoreClickCalled = false;
         treeGridView._notify = function(eventName) {
            if (eventName === 'loadMoreClick') {
               notifyLoadMoreClickCalled = true;
            }
         };
         treeGridView._onLoadMoreClick(null, {});
         assert.isTrue(notifyLoadMoreClickCalled, 'Incorrect notify by "_onLoadMoreClick()".');
      });
   });
});
