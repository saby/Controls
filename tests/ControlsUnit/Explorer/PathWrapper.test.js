define([
   'Controls/_explorer/PathWrapper'
], function(
   PathWrapper
) {
   describe('Controls.Explorer._PathController', function() {
      describe('_beforeMount', function() {
         it('returns deferred, and sets items from callback', function(done) {
            let pathWrapper = new PathWrapper();
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
         var needCrumbs = PathWrapper._private.needCrumbs;
         it('BackButton is in header, items.length === 1', function() {
            assert.isFalse(needCrumbs([{ title: 'back', isBreadCrumbs: true }], ['first'], false));
         });
         it('BackButton is not in header, items.length === 1', function() {
            assert.isTrue(needCrumbs(undefined, ['first'], false));
         });
         it('BackButton is in header, items.length === 2', function() {
            assert.isTrue(needCrumbs([{ title: 'back' }], ['first', 'second'], false));
         });
         it('items === null', function() {
            assert.isFalse(needCrumbs(undefined, null, false));
         });
         it('items === null, rootVisible (when dragging from folder)', function() {
            assert.isTrue(needCrumbs(undefined, null, true));
         });
      });
   });
});
