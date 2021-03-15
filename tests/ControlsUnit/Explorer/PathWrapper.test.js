define([
   'Controls/_explorer/PathWrapper'
], function(
   PathWrapper
) {
   describe('Controls.Explorer._PathController', function() {
      describe('_beforeMount', function() {
         it('returns deferred, and sets items from callback', function(done) {
            let pathWrapper = new PathWrapper.default();
            let resolver;
            let itemsAndHeaderPromise = new Promise((res) => { resolver = res; });
            let result = pathWrapper._beforeMount({itemsAndHeaderPromise: itemsAndHeaderPromise});
            let items = [1, 2, 3];
            assert.isTrue(!!(result.then), 'must return Promise');
            result.then(() => {
               assert.strictEqual(items, pathWrapper._items);
               done();
            });
            resolver({items: items});

         });
      });
      describe('needCrumbs', function() {
         var PathW = new PathWrapper.default();
         var needCrumbs = PathW._isNeedCrumbs.bind(PathW);
         it('BackButton is in header, items.length === 1', function() {
            assert.isFalse(
               needCrumbs([{ title: 'back', isBreadCrumbs: true }], ['first'], {rootVisible: false})
            );
         });
         it('BackButton is not in header, items.length === 1', function() {
            assert.isTrue(needCrumbs(undefined, ['first'], {rootVisible: false}));
         });
         it('BackButton is in header, items.length === 2', function() {
            assert.isTrue(needCrumbs([{ title: 'back' }], ['first', 'second'], {rootVisible: false}));
         });
         it('items === null', function() {
            assert.isFalse(needCrumbs(undefined, null, {rootVisible: false}));
         });
         it('items === null, rootVisible (when dragging from folder)', function() {
            assert.isTrue(needCrumbs(undefined, null, {rootVisible: true}));
         });
         it('Hide breadcrumbs by option breadcrumbsVisibility === "hidden"', function() {
            // BackButton is not in header, items.length === 1
            assert.isFalse(
               needCrumbs(
                  undefined,
                  ['first'],
                  {
                     rootVisible: false,
                     breadcrumbsVisibility: 'hidden'
                  }
               )
            );

            // BackButton is in header, items.length === 2
            assert.isFalse(
               needCrumbs(
                  [{ title: 'back' }],
                  ['first', 'second'],
                  {
                     rootVisible: false,
                     breadcrumbsVisibility: 'hidden'
                  }
               )
            );

            // items === null, rootVisible (when dragging from folder)
            assert.isFalse(
               needCrumbs(
                  undefined,
                  null,
                  {
                     rootVisible: true,
                     breadcrumbsVisibility: 'hidden'
                  }
               )
            );
         });
      });
   });
});
