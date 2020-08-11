define([
   'Controls/list',
   'UI/Vdom',
   'Types/source',
   'Types/collection',
   'Core/Deferred',
   'Core/core-clone'
], function(lists, Vdom, sourceLib, collection, Deferred, cClone) {
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
         remover._source = source;
         remover._items = rs;
      });

      afterEach(function() {
         Vdom.Synchronizer.unMountControlFromDOM(remover, {});
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
            result = 'custom_result',
            unselectAllNotified = false;
         remover._source.destroy = function() {
            return Deferred.success(result);
         };
         remover._notify = function(event, args) {
            if (event === 'afterItemsRemove') {
               assert.equal(args[0], items);
               assert.equal(args[1], result);
               done();
            }
            if (event === 'selectedTypeChanged') {
               assert.equal(args[0], 'unselectAll');
               unselectAllNotified = true;
            }
         };

         remover.removeItems(items);
         assert.isTrue(unselectAllNotified);
      });

      it('beforeItemsRemove return false', function() {
         remover._notify = function(event) {
            if (event === 'beforeItemsRemove') {
               return false;
            }
         };

         remover.removeItems([2, 3]);
         assert.equal(remover._items.getCount(), 3);
      });

      it('beforeItemsRemove return Deferred', function() {
         remover._notify = function(event) {
            if (event === 'beforeItemsRemove') {
               return Deferred.success();
            }
         };

         remover.removeItems([1, 2, 3]);
         assert.equal(remover._items.getCount(), 0);
      });

      it('removeItems from source', function(done) {
         remover.removeItems([1, 2]);
         remover._source.query().addCallback(function(dataSet) {
            assert.equal(dataSet.getAll().getCount(), 1);
            done();
         });
      });

      it('removeItems from items', function() {
         remover.removeItems([1, 2]);
         assert.equal(remover._items.getCount(), 1);
      });

      it('remove by selection', function() {
         remover.removeItems({
            selected: [1, 2],
            excluded: []
         });
         assert.equal(remover._items.getCount(), 1);

         remover.removeItems({
            selected: [3],
            excluded: []
         });
         assert.equal(remover._items.getCount(), 0);
      });
   });
});
