define([
   'Controls/_explorer/PathWrapper'
], function(
   PathWrapper
) {
   describe('Controls.Explorer._PathController', function() {
      describe('needCrumbs', function() {
         const needCrumbs = PathWrapper.default._isNeedCrumbs;

         it('View mode "tile", items.length === 1', function() {
            assert.isTrue(
               needCrumbs({
                  breadCrumbsItems: ['first'],
                  rootVisible: false,
                  header: [{ title: 'back', isBreadCrumbs: true }],
                  viewMode: 'tile'
               })
            );
         });

         it('BackButton is in header, items.length === 1', function() {
            assert.isFalse(
               needCrumbs({
                  breadCrumbsItems: ['first'],
                  rootVisible: false,
                  header: [{ title: 'back', isBreadCrumbs: true }],
                  viewMode: 'table'
               })
            );
         });

         it('BackButton is not in header, items.length === 1', function() {
            assert.isTrue(needCrumbs({
               breadCrumbsItems: ['first'],
               rootVisible: false
            }));
         });

         it('BackButton is in header, items.length === 2', function() {
            assert.isTrue(needCrumbs({
               header: [{ title: 'back' }],
               breadCrumbsItems: ['first', 'second'],
               rootVisible: false
            }));
         });

         it('items === null', function() {
            assert.isFalse(needCrumbs({ rootVisible: false }));
         });

         it('items === null, rootVisible (when dragging from folder)', function() {
            assert.isTrue(needCrumbs({ rootVisible: true }));
         });

         it('Hide breadcrumbs by option breadcrumbsVisibility === "hidden"', function() {
            // BackButton is not in header, items.length === 1
            assert.isFalse(
               needCrumbs({
                  items: ['first'],
                  rootVisible: false,
                  breadcrumbsVisibility: 'hidden'
               })
            );

            // BackButton is in header, items.length === 2
            assert.isFalse(
               needCrumbs({
                  header: [{ title: 'back' }],
                  items: ['first', 'second'],
                  rootVisible: false,
                  breadcrumbsVisibility: 'hidden'
               })
            );

            // items === null, rootVisible (when dragging from folder)
            assert.isFalse(
               needCrumbs({
                  rootVisible: true,
                  breadcrumbsVisibility: 'hidden'
               })
            );
         });
      });
   });
});
