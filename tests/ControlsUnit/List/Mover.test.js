define([
   'Controls/list',
   'Types/source',
   'Types/collection',
   'Core/Deferred',
   'Core/core-clone',
   'Controls/_operations/MultiSelector/selectionToRecord'
], function(lists, source, collection, Deferred, cClone, selectionToRecord) {
   describe('Controls.List.Mover', function() {
      var
         items,
         mover;

      beforeEach(function() {
         var
            data = [{
               id: 1,
               folder: null,
               'folder@': true
            }, {
               id: 2,
               folder: null,
               'folder@': null
            }, {
               id: 3,
               folder: null,
               'folder@': null
            }, {
               id: 4,
               folder: 1,
               'folder@': true
            }, {
               id: 5,
               folder: 1,
               'folder@': null
            }, {
               id: 6,
               folder: null,
               'folder@': null
            }];

         items = new collection.RecordSet({
            keyProperty: 'id',
            rawData: cClone(data)
         });
         mover = new lists.default.Mover({});
         mover._options.parentProperty = 'folder';
         mover._options.nodeProperty = 'folder@';
         mover._items = items;
         mover._source = new source.Memory({
            keyProperty: 'id',
            data: cClone(data)
         });
         mover._keyProperty = 'id';

      });

      afterEach(function() {
         mover.destroy();
      });

      it('_beforeMount', function() {
         mover._beforeMount({
            moveDialogTemplate: {
               templateName: 'testTemplateName',
               templateOptions: {
                  testOptions: 'testValueOfOption'
               }
            }
         }, {});

         assert.equal(mover._moveDialogTemplate, 'testTemplateName');
         assert.deepEqual(mover._moveDialogOptions, { testOptions: 'testValueOfOption' });

         mover._beforeMount({ moveDialogTemplate: 'testTemplate' }, {});
         assert.equal(mover._moveDialogTemplate, 'testTemplate');
      });

      it('_beforeUpdate', function() {
         mover._beforeUpdate({
            moveDialogTemplate: {
               templateOptions: {
                  testOptions: 'testValueOfOption1'
               }
            }
         }, {
            dataOptions: {}
         });

         assert.deepEqual(mover._moveDialogOptions, { testOptions: 'testValueOfOption1'});

         mover._beforeUpdate({
            moveDialogTemplate: {
               templateOptions: {
                  testOptions: 'testValueOfOption2'
               }
            }
         }, {
            dataOptions: {}
         });

         assert.deepEqual(mover._moveDialogOptions, {testOptions: 'testValueOfOption2'});
      });

      it('moveItemsWithDialog', function(done) {
         var items = [1, 2, 3];

         mover._children = {
            dialogOpener: {
               open: function(openArgs) {
                  assert.deepEqual(openArgs.templateOptions.movedItems, items);
                  assert.equal(openArgs.templateOptions.source, mover._source);
                  assert.equal(openArgs.templateOptions.keyProperty, mover._keyProperty);
                  done();
               }
            }
         };

         mover.moveItemsWithDialog(items);
      });

      it('moveItemsWithDialog for newLogic call moveItems', function(done) {
         var
            params = {
               selectedKeys: [1, 2, 3],
               excludedKeys: [11],
               filter: {
                  testProp: 'testValue'
               }
            },
            moveItemsCalled = false;

         mover._children = {
            dialogOpener: {
               open: function(openArgs) {
                  assert.deepEqual(openArgs.templateOptions.movedItems, params.selectedKeys);
                  assert.equal(openArgs.templateOptions.source, mover._source);
                  assert.equal(openArgs.templateOptions.keyProperty, mover._keyProperty);
                  var origMoveItems = mover.moveItems;
                  mover.moveItems = function(callingParams) {
                     moveItemsCalled = true;
                     assert.deepEqual(callingParams, params);
                  };
                  openArgs.eventHandlers.onResult(4);
                  mover.moveItems = origMoveItems;
                  assert.isTrue(moveItemsCalled);
                  done();
               }
            }
         };

         mover.moveItemsWithDialog(params);
      });

      it('moveItems for newLogic', function() {
         var
            callMethodCalled = false,
            params = {
               selectedKeys: [1, 2, 3],
               excludedKeys: [11],
               filter: {
                  testProp: 'testValue'
               }
            },
            bindings = {
               move: 'testMoveMethod',
               list: 'testListMethod'
            },
            targetId = 4,
            originaSourceGetBinding = mover._source.getBinding,
            originaSourceCall = mover._source.call;
         mover._source.getBinding = function() {
            return bindings;
         };
         mover._source.call = function(methodName, data) {
            callMethodCalled = true;
            assert.equal(methodName, bindings.move);
            assert.equal(data.method, bindings.list);
            assert.equal(data.folder_id, targetId);
            assert.equal(data.filter.testProp, 'testValue');
            assert.deepEqual(data.filter.selection.getRawData(),
               selectionToRecord({
                  selected: params.selectedKeys,
                  excluded: params.excludedKeys
               }, mover._source.getAdapter()).getRawData()
            );
            return Promise.resolve();
         };
         return mover.moveItems(params, targetId).then(function () {
            assert.isTrue(callMethodCalled);
            mover._source.getBinding = originaSourceGetBinding;
            mover._source.call = originaSourceCall;
         });
      });

      it('moveItemsWithDialog with empty items', function() {
         var items = [];

         mover._children = {
            dialogOpener: {
               open: function() {
                  throw new Error('Dialog opened for empty items.');
               }
            }
         };
         mover.moveItemsWithDialog(items);
      });

       it('moveItemsWithDialog for models', function(done) {
           var movedItems = [1, 2, 3];

           mover._children = {
               dialogOpener: {
                   open: function(openArgs) {
                       assert.deepEqual(openArgs.templateOptions.movedItems, movedItems);
                       assert.equal(openArgs.templateOptions.source, mover._source);
                       assert.equal(openArgs.templateOptions.keyProperty, mover._keyProperty);
                       done();
                   }
               }
           };

           mover.moveItemsWithDialog([items.at(0), items.at(1), items.at(2)]);
       });

      it('beforeItemsMove notify event with params', function(done) {
         var
            movedItems,
            item = items.at(0),
            target = items.at(1);
         mover._notify = function(event, args) {
            if (event === 'beforeItemsMove') {
               movedItems = args[0];
               assert.equal(movedItems[0].getId(), item.getId());
               assert.equal(args[1].getId(), target.getId());
               done();
            }
         };
         mover.moveItemDown(item);
      });

      it('afterItemsMove notify event with params', function(done) {
         var
            movedItems,
            item = items.at(2),
            target = items.at(1),
            result = 'custom_result';

         mover._source.move = function() {
            return Deferred.success(result);
         };
         mover._notify = function(event, args) {
            if (event === 'afterItemsMove') {
               movedItems = args[0];
               assert.equal(movedItems[0].getId(), item.getId());
               assert.equal(args[1].getId(), target.getId());
               assert.equal(args[3], 'custom_result');
               done();
            }
         };
         mover.moveItemUp(item);
      });

      it('sortingOrder', function(done) {
         var item = items.getRecordById(3);

         //Ascending sort.
         mover._options.sortingOrder = 'asc';
         mover._source.move = function(items, target, options) {
            assert.equal(target, 2);
            assert.equal(options.position, 'before');
            return Deferred.success();
         };
         mover.moveItemUp(item);

         mover._source.move = function(items, target, options) {
            assert.equal(target, 2);
            assert.equal(options.position, 'after');
            return Deferred.success();
         };
         mover.moveItemDown(item);

         //Descending sort.
         mover._options.sortingOrder = 'desc';
         mover._source.move = function(items, target, options) {
            assert.equal(target, 2);
            assert.equal(options.position, 'after');
            return Deferred.success();
         };
         mover.moveItemUp(item);

         mover._source.move = function(items, target, options) {
            assert.equal(target, 2);
            assert.equal(options.position, 'before');
            done();
            return Deferred.success();
         };
         mover.moveItemDown(item);
      });

      it('moveItemUp by item', function(done) {
         var item = items.at(2);

         mover._notify = function(event) {
            if (event === 'afterItemsMove') {
               assert.equal(items.at(1).getId(), item.getId());
               done();
            }
         };
         mover.moveItemUp(item);
      });

      it('moveItemUp by id', function(done) {
         mover._notify = function(event) {
            if (event === 'afterItemsMove') {
               assert.equal(items.at(1).getId(), 3);
               done();
            }
         };
         mover.moveItemUp(3);
      });

      it('moveItemUp first item', function() {
         var item = items.at(0);

         mover.moveItemUp(item);
         assert.equal(items.at(0).getId(), item.getId());
      });

      it('moveItemDown by item', function(done) {
         var item = items.at(0);

         mover._notify = function(event) {
            if (event === 'afterItemsMove') {
               assert.equal(items.at(1).getId(), item.getId());
               done();
            }
         };
         mover.moveItemDown(item);
      });

      it('moveItemDown by id', function(done) {
         mover._notify = function(event) {
            if (event === 'afterItemsMove') {
               assert.equal(items.at(1).getId(), 1);
               done();
            }
         };
         mover.moveItemDown(1);
      });

      it('moveItemDown last item', function() {
         var item = items.at(4);

         mover.moveItemDown(item);
         assert.equal(items.at(4).getId(), item.getId());
      });

      it('moveItems by item', function(done) {
         var
            item = items.at(0),
            target = items.at(2);

         mover._notify = function(event) {
            if (event === 'afterItemsMove') {
               assert.equal(items.at(2).getId(), item.getId());
               done();
            }
         };

         mover.moveItems([item], target, 'after');
      });

      it('moveItems by id', function(done) {
         var target = items.at(2);

         mover._notify = function(event) {
            if (event === 'afterItemsMove') {
               assert.equal(items.at(0).getId(), target.getId());
               done();
            }
         };

         mover.moveItems([1, 2], target, 'after');
      });

      it('moveItems not from recordSet', function(done) {
         var moveItems = [6];

         mover._notify = function(event, args) {
            if (event === 'afterItemsMove') {
               assert.deepEqual(args[0], moveItems);
               done();
            }
         };

         mover.moveItems(moveItems, 1, 'on');
      });

      it('moveItems in folder', function(done) {
         mover._notify = function(event) {
            if (event === 'afterItemsMove') {
               assert.equal(items.getRecordById(4).get('folder'), 1);
               assert.equal(items.getRecordById(5).get('folder'), 1);
               done();
            }
         };

         mover.moveItems([4, 5], 1, 'on');
      });

      it('moveItems in folder with change order', function(done) {
         mover._notify = function(event) {
            if (event === 'afterItemsMove') {
               assert.equal(items.getRecordById(3).get('folder'), 1);
               done();
            }
         };

         mover.moveItems([3], 4, 'after');
      });

      it('moveItems in root', function(done) {
         var movedItems = [];
         movedItems.push(items.getRecordById(4));
         movedItems.push(items.getRecordById(5));

         mover._notify = function(event) {
            if (event === 'afterItemsMove') {
               assert.equal(items.getRecordById(4).get('folder'), null);
               assert.equal(items.getRecordById(5).get('folder'), null);
               done();
            }
         };

         mover.moveItems(movedItems, null, 'on');
      });

      it('moveItems in list', function() {
         mover.moveItems([4], 5, 'on');
         assert.equal(items.getRecordById(4).get('folder'), 1);
      });

      it('moveItems folder in child folder', function() {
         mover.moveItems([1], 4, 'on');
         assert.equal(items.getRecordById(1).get('folder'), null);
      });

      it('moveItems in himself', function() {
         mover.moveItems([1], 1, 'on');
         assert.equal(items.getRecordById(1).get('folder'), null);
      });

      it('beforeItemsMove = MoveInItems', function(done) {
         var
            item = items.at(0),
            target = items.at(2);

         mover._notify = function(event) {
            if (event === 'beforeItemsMove') {
               return Promise.resolve('MoveInItems');
            }
         };

         mover.moveItems([item], target, 'after').then(() => {
            assert.equal(items.at(2).getId(), item.getId());
            mover._source.query().addCallback(function(dataSet) {
               assert.equal(dataSet.getAll().at(0).getId(), item.getId());
               done();
            });
         });
      });

      it('beforeItemsMove = Custom', function(done) {
         var
            item = items.at(0),
            target = items.at(2);

         mover._notify = function(event) {
            if (event === 'beforeItemsMove') {
               return 'Custom';
            }
         };

         mover.moveItems([item], target, 'after');
         assert.equal(items.at(0).getId(), item.getId());
         mover._source.query().addCallback(function(dataSet) {
            assert.equal(dataSet.getAll().at(0).getId(), item.getId());
            done();
         });
      });

      it('move returns deferred', function() {
         var result;

         //dont move moveItemUp
         result = mover.moveItemUp(1);
         assert.isTrue(result instanceof Deferred);

         //move moveItemUp
         result = mover.moveItemUp(2);
         assert.isTrue(result instanceof Deferred);

         //dont move moveItemDown
         result = mover.moveItemDown(5);
         assert.isTrue(result instanceof Deferred);

         //move moveItemDown
         result = mover.moveItemDown(4);
         assert.isTrue(result instanceof Deferred);

         //move without target moveItems
         result = mover.moveItems([1, 2]);
         assert.isTrue(result instanceof Deferred);

         //move without items moveItems
         result = mover.moveItems([], 3, 'after');
         assert.isTrue(result instanceof Deferred);

         //move moveItems
         result = mover.moveItems([1, 2], 3, 'after');
         assert.isTrue(result instanceof Deferred);
      });

      it('move by selection', function(done) {
         mover._notify = function(event, args) {
            if (event === 'beforeItemsMove') {
               assert.deepEqual(args[0], [1, 2]);
               done();
            }
         };

         mover.moveItems({
            selected: [1, 2],
            excluded: []
         }, 3, 'after');
      });

      it('getSiblingItem', function() {
         var siblingItem;

         siblingItem = mover.getSiblingItem(items.getRecordById(6), 'before');
         assert.equal(siblingItem.getId(), 3);
         siblingItem = mover.getSiblingItem(items.getRecordById(6), 'after');
         assert.isNull(siblingItem);

         siblingItem = mover.getSiblingItem(items.getRecordById(3), 'after');
         assert.equal(siblingItem.getId(), 6);
         siblingItem = mover.getSiblingItem(items.getRecordById(3), 'before');
         assert.equal(siblingItem.getId(), 2);

         siblingItem = mover.getSiblingItem(items.getRecordById(1), 'after');
         assert.equal(siblingItem.getId(), 2);
         siblingItem = mover.getSiblingItem(items.getRecordById(1), 'before');
         assert.isNull(siblingItem);

         mover._options.root = 1;
         siblingItem = mover.getSiblingItem(items.getRecordById(4), 'after');
         assert.equal(siblingItem.getId(), 5);

      });

   });
});
