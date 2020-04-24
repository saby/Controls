define(['Controls/treeGrid', 'ControlsUnit/CustomAsserts'], function(treeGrid, cAssert) {
   describe('Controls.List.TreeGridView.TreeGridView', function() {
      it('TreeGridView._onExpanderClick', function() {
         var
            stopImmediatePropagationCalled = true,
            treeGridView = new treeGrid.TreeGridView(),
            event = {
               stopImmediatePropagation: function() {
                  stopImmediatePropagationCalled = true;
               }
            },
            notifyCalled = false;
         treeGridView._notify = function() {
            notifyCalled = true;
         };
         treeGridView._onExpanderClick(event);
         assert.isTrue(notifyCalled, 'Incorrect notify by "_onExpanderClick()".');
         assert.isTrue(stopImmediatePropagationCalled, 'Incorrect call "stopImmediatePropagation" by "_onExpanderClick()".');
      });
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
      it('TreeGridView._getFooterClasses', function() {
         const treeGridView = new treeGrid.TreeGridView();
         let hasNodes = true;
         treeGridView._listModel = {
            hasNodes: () => hasNodes
         };
         treeGridView._options.theme = 'default';

         cAssert.isClassesEqual(treeGridView._getFooterClasses(), 'controls-TreeGridView__footer controls-TreeGridView__footer__expanderPadding-default_theme-default');

         hasNodes = false;
         cAssert.isClassesEqual(treeGridView._getFooterClasses(), 'controls-TreeGridView__footer');
         cAssert.hasNoClasses(treeGridView._getFooterClasses(), 'controls-TreeGridView__footer__expanderPadding-default_theme-default');
      });
   });
});
