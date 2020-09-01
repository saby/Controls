define([
   'Controls/list',
   'Types/source',
   'Types/collection',
   'Core/Deferred',
   'Core/core-clone',
], function(lists, sourceLib, collection, Deferred, cClone) {
   describe('Controls.List.Remover', function() {
      var remover;

      beforeEach(function() {
         var
            data = [{
               id: 1,
               title: 'Первый'
            }, {
               id: 2,
               title: 'Второй'
            }, {
               id: 3,
               title: 'Третий'
            }],
            rs = new collection.RecordSet({
               keyProperty: 'id',
               rawData: cClone(data)
            }),
            source = new sourceLib.Memory({
               keyProperty: 'id',
               data: cClone(data)
            });

         remover = new lists.Remover();
         const cfg = {
            source: source,
            items: rs,
            filter: {}
         };
         remover._beforeMount(cfg, {dataOptions: cfg});
      });

      afterEach(function() {
         remover.destroy();
      });

      it('beforeItemsRemove notify event with params', function(done) {
         var items = [1];
         remover._notify = function(event, args) {
            if (event === 'beforeItemsRemove') {
               assert.equal(args[0], items);
               done();
            }
         };
         remover.removeItems(items);
      });

      it('afterItemsRemove notify event with params', function(done) {
         var
            items = [2, 3],
            unselectAllNotified = false;
         remover._controller._source.destroy = function() {
            return Promise.resolve();
         };
         remover._notify = function(event, args) {
            if (event === 'afterItemsRemove') {
               assert.equal(args[0], items);
            }
            if (event === 'selectedTypeChanged') {
               assert.equal(args[0], 'unselectAll');
               unselectAllNotified = true;
            }
         };

         remover.removeItems(items).then(() => {
            assert.isTrue(unselectAllNotified);
            done();
         });
      });

      it('beforeItemsRemove return false', function(done) {
         remover._notify = function(event) {
            if (event === 'beforeItemsRemove') {
               return false;
            }
         };

         remover.removeItems([2, 3]).then(() => {
            assert.equal(remover._controller._items.getCount(), 3);
            done();
         });
      });

      it('beforeItemsRemove return Deferred', function(done) {
         remover._notify = function(event) {
            if (event === 'beforeItemsRemove') {
               return Deferred.success();
            }
         };

         remover.removeItems([1, 2, 3]).then(() => {
            assert.equal(remover._controller._items.getCount(), 0);
            done();
         });
      });

      it('removeItems from source', function(done) {
         let destroyItemsInSourceCalled = false;
         remover._controller._source.destroy = () => {
            destroyItemsInSourceCalled = true;
            return Promise.resolve();
         };
         remover.removeItems([1, 2]).then(() => {
            assert.isTrue(destroyItemsInSourceCalled);
            done();
         });
      });

      it('removeItems from items', function(done) {
         remover.removeItems([1, 2]).then(() => {
            assert.equal(remover._controller._items.getCount(), 1);
            done();
         });
      });

      it('remove by selection', async function() {
         await remover.removeItems({
            selected: [1, 2],
            excluded: []
         }).then(() => {
            assert.equal(remover._controller._items.getCount(), 1);
         });

         await remover.removeItems({
            selected: [3],
            excluded: []
         }).then(() => {
            assert.equal(remover._controller._items.getCount(), 0);
         });
      });
   });
});
