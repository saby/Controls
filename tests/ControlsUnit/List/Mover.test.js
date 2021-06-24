define([
   'UI/Utils',
   'Controls/_list/Mover',
   'Types/source',
   'Types/collection',
   'Core/Deferred',
   'Core/core-clone',
   'Controls/_operations/MultiSelector/selectionToRecord',
   'Controls/popup'
], function(ui, Mover, source, collection, Deferred, cClone, selectionToRecord, popup) {
   describe('Controls.List.Mover', function() {
      let recordSet;
      let mover;
      let cfg;
      let stubLogger;

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

         recordSet = new collection.RecordSet({
            keyProperty: 'id',
            rawData: cClone(data)
         });

         cfg = {
            parentProperty: 'folder',
            nodeProperty: 'folder@',
            moveDialogTemplate: {},
            items: recordSet,
            source: new source.Memory({
               keyProperty: 'id',
               data: cClone(data)
            }),
            keyProperty: 'id'
         }
         mover = new Mover(cfg);
         mover._options.parentProperty = cfg.parentProperty;
         mover._options.nodeProperty = cfg.nodeProperty;
         mover._options.moveDialogTemplate = cfg.moveDialogTemplate;
         mover._items = cfg.items;
         mover._source = cfg.source;
         mover._keyProperty = cfg.keyProperty;
         mover._children.dialogOpener = {
            open: () => {}
         };
      });

      afterEach(function() {
         mover.destroy();
      });

      it('_beforeMount', function() {
         const options = {
            source: 'testSource',
            moveDialogTemplate: {
               templateName: 'testTemplateName',
               templateOptions: {
                  testOptions: 'testValueOfOption',
                  keyProperty: 'moveDialogId'
               }
            },
            keyProperty: 'id'
         };
         options._dataOptionsValue = { ...options };
         mover._beforeMount(options);

         assert.equal(mover._controller._popupOptions.template, 'testTemplateName');
         assert.deepEqual(mover._controller._popupOptions.templateOptions, options.moveDialogTemplate.templateOptions);
         assert.equal(mover._source, 'testSource');

         stubLogger = sinon.stub(ui.Logger, 'warn');
         mover._beforeMount({ moveDialogTemplate: 'testTemplate' }, {});
         stubLogger.restore();
         assert.equal(mover._controller._popupOptions.template, 'testTemplate');
      });

      it('_beforeUpdate', function() {
         let options = {
            moveDialogTemplate: {
               templateName: 'testTemplateName',
               templateOptions: {
                  testOptions: 'testValueOfOption1',
                  keyProperty: 'moveDialogId'
               }
            },
            keyProperty: 'id'
         };
         mover._beforeUpdate(options, {
            dataOptions: {}
         });

         assert.deepEqual(mover._controller._popupOptions.templateOptions, options.moveDialogTemplate.templateOptions);

         options = {
            moveDialogTemplate: {
               templateName: 'testTemplateName',
               templateOptions: {
                  testOptions: 'testValueOfOption2',
                  keyProperty: 'moveDialogId'
               }
            },
            keyProperty: 'id'
         };
         mover._beforeUpdate(options, {
            dataOptions: {}
         });

         assert.deepEqual(mover._controller._popupOptions.templateOptions, options.moveDialogTemplate.templateOptions);
      });

      describe('mover methods', () => {
         beforeEach(() => {
            const options = {
               ...cfg,
               moveDialogTemplate: {
                  templateName: () => 'testTemplateName',
                  templateOptions: {
                     testOptions: 'testValueOfOption'
                  }
               }
            };
            options._dataOptionsValue = { ...options };
            mover._beforeMount(options);
         });

         it('moveItemsWithDialog', function(done) {
            const items = [1, 2, 3];
            const stubOpenPopup = sinon.stub(mover._children.dialogOpener, 'open');

            // @ts-ignore
            stubOpenPopup.callsFake((openArgs) => {
               assert.deepEqual(openArgs.templateOptions.movedItems, items);
               assert.equal(openArgs.templateOptions.source, mover._source);
               assert.equal(openArgs.templateOptions.keyProperty, mover._keyProperty);
               Promise.resolve(openArgs.eventHandlers.onResult(recordSet.at(3)));
            });

            mover.moveItemsWithDialog(items)
               .then(() => {
                  stubOpenPopup.restore();
                  done();
               });
         });

         it('beforeItemsMove first param should be array of item id\'s', function(done) {
            let movedItems;
            let item = recordSet.at(0);
            const stubOpenPopup = sinon.stub(mover._children.dialogOpener, 'open')
               .callsFake((openArgs) => Promise.resolve(openArgs.eventHandlers.onResult(recordSet.at(1))));
            mover._notify = (event, args) => {
               if (event === 'beforeItemsMove') {
                  movedItems = args[0];
                  assert.equal(movedItems[0], item.getId());
                  done();
               }
            };
            mover.moveItemsWithDialog([item])
               .then(() => {
                  stubOpenPopup.restore();
                  done();
               });
         });

         it('moveItemsWithDialog for newLogic call moveItems', (done) => {
            const params = {
               selectedKeys: [1, 2, 3],
               excludedKeys: [11],
               filter: {
                  testProp: 'testValue'
               }
            };
            let moveItemsCalled = false;
            const stubOpenPopup = sinon.stub(mover._children.dialogOpener, 'open');

            // @ts-ignore
            stubOpenPopup.callsFake((openArgs) => {
               assert.deepEqual(openArgs.templateOptions.movedItems, params.selectedKeys);
               assert.equal(openArgs.templateOptions.source, mover._source);
               assert.equal(openArgs.templateOptions.keyProperty, mover._keyProperty);
               const stubMoveItems = sinon.stub(mover, 'moveItems');
               stubMoveItems.callsFake((callingParams) => {
                  moveItemsCalled = true;
                  assert.deepEqual(callingParams, params);
               });
               openArgs.eventHandlers.onResult(4);
               stubMoveItems.restore();
               assert.isTrue(moveItemsCalled);
               Promise.resolve(openArgs.eventHandlers.onResult(recordSet.at(3)));
            });

            mover.moveItemsWithDialog(params).then(() => {
               stubOpenPopup.restore();
               done();
            });
         });

         it('moveItemsWithDialog with search applied', () => {
            const selection = {
               selected: [1, 2, 3],
               excluded: [11]
            };
            const filter = {
               searchParam: 'searchValue'
            };
            const config = {...cfg, searchParam: 'searchParam', filter};
            const stubOpenPopup = sinon.stub(mover._children.dialogOpener, 'open');
            stubLogger = sinon.stub(ui.Logger, 'warn');
            mover._beforeUpdate(config, { dataOptions: config });
            stubLogger.restore();
            mover.saveOptions(config);


            stubLogger = sinon.stub(ui.Logger, 'warn');
            Mover._private.updateDataOptions(mover, config, config);
            stubLogger.restore();

            // @ts-ignore
            stubOpenPopup.callsFake((openArgs) => Promise.resolve(openArgs.eventHandlers.onResult(recordSet.at(3))));

            return new Promise((resolve) => {
               let queryFilter;
               mover._controller._source.query = (query) => {
                  queryFilter = query.getWhere();
                  return Promise.reject();
               };
               mover.moveItemsWithDialog(selection).then(() => {
                  assert.isTrue(!queryFilter.searchParam);
                  stubOpenPopup.restore();
                  resolve();
               });
            });
         });

         it('moveItemsWithDialog is called with items and with search applied', (done) => {
            const items = [1, 2, 3];
            const filter = {
               searchParam: 'searchValue'
            };

            const config = {...cfg, searchParam: 'searchParam', filter};
            stubLogger = sinon.stub(ui.Logger, 'warn');
            Mover._private.updateDataOptions(mover, config, config);
            stubLogger.restore();
            const stubOpenPopup = sinon.stub(mover._children.dialogOpener, 'open');

            // @ts-ignore
            stubOpenPopup.callsFake((openArgs) => {
               assert.deepEqual(openArgs.templateOptions.movedItems, items);
               assert.equal(openArgs.templateOptions.source, mover._source);
               assert.equal(openArgs.templateOptions.keyProperty, mover._keyProperty);
               Promise.resolve(openArgs.eventHandlers.onResult(recordSet.at(3)));
            });

            mover.moveItemsWithDialog(items).then(() => {
               stubOpenPopup.restore();
               done();
            });
         });

         it('moveItems for newLogic', () => {
            let callMethodCalled = false;
            const params = {
               selectedKeys: [1, 2, 3],
               excludedKeys: [11],
               filter: {
                  testProp: 'testValue'
               }
            };
            const bindings = {
               move: 'testMoveMethod',
               list: 'testListMethod'
            };
            const targetId = 4;
            mover._controller._source.getBinding = () => {
               return bindings;
            };
            mover._controller._source.call = (methodName, data) => {
               callMethodCalled = true;
               assert.equal(methodName, bindings.move);
               assert.equal(data.method, bindings.list);
               assert.equal(data.folder_id, targetId);
               assert.equal(data.filter.get('testProp'), 'testValue');
               assert.deepEqual(data.filter.get('selection').getRawData(),
                  selectionToRecord.default({
                     selected: params.selectedKeys,
                     excluded: params.excludedKeys
                  }, mover._controller._source.getAdapter()).getRawData()
               );
               return Promise.resolve();
            };

            return mover.moveItems(params, targetId, 'on')
               .then(() => {
                  assert.isTrue(callMethodCalled);
               });
         });

         it('moveItemsWithDialog with empty items', (done) => {
            const items = [];
            const spyOpenPopup = sinon.spy(mover._children.dialogOpener, 'open');
            const stubOpenConfirmation = sinon.stub(popup.Confirmation, 'openPopup');
            // @ts-ignore
            stubOpenConfirmation.callsFake((args) => {
               assert(args.message, 'Нет записей для обработки команды');
            });
            mover.moveItemsWithDialog(items).then(() => {
               sinon.assert.notCalled(spyOpenPopup);
               spyOpenPopup.restore();
               stubOpenConfirmation.restore();
               done();
            });
         });

         it('moveItemsWithDialog for models', (done) => {
            const movedItems = [1, 2, 3];
            const stubOpenPopup = sinon.stub(mover._children.dialogOpener, 'open');

            // @ts-ignore
            stubOpenPopup.callsFake((openArgs) => {
               assert.deepEqual(openArgs.templateOptions.movedItems, movedItems);
               assert.equal(openArgs.templateOptions.source, mover._source);
               assert.equal(openArgs.templateOptions.keyProperty, mover._keyProperty);
               Promise.resolve(openArgs.eventHandlers.onResult(recordSet.at(3)));
            });
            mover.moveItemsWithDialog([recordSet.at(0), recordSet.at(1), recordSet.at(2)]).then(() => {
               stubOpenPopup.restore();
               done();
            });
         });

         it('beforeItemsMove notify event with params', function(done) {
            var
                movedItems,
                item = recordSet.at(0),
                target = recordSet.at(1);
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
                item = recordSet.at(2),
                target = recordSet.at(1),
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
            var item = recordSet.getRecordById(3);

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
            var item = recordSet.at(2);

            mover._notify = function(event) {
               if (event === 'afterItemsMove') {
                  assert.equal(recordSet.at(1).getId(), item.getId());
                  done();
               }
            };
            mover.moveItemUp(item);
         });

         it('moveItemUp by id', function(done) {
            mover._notify = function(event) {
               if (event === 'afterItemsMove') {
                  assert.equal(recordSet.at(1).getId(), 3);
                  done();
               }
            };
            mover.moveItemUp(3);
         });

         it('moveItemUp first item', function() {
            var item = recordSet.at(0);

            mover.moveItemUp(item);
            assert.equal(recordSet.at(0).getId(), item.getId());
         });

         it('moveItemDown by item', function(done) {
            var item = recordSet.at(0);

            mover._notify = function(event) {
               if (event === 'afterItemsMove') {
                  assert.equal(recordSet.at(1).getId(), item.getId());
                  done();
               }
            };
            mover.moveItemDown(item);
         });

         it('moveItemDown by id', function(done) {
            mover._notify = function(event) {
               if (event === 'afterItemsMove') {
                  assert.equal(recordSet.at(1).getId(), 1);
                  done();
               }
            };
            mover.moveItemDown(1);
         });

         it('moveItemDown last item', function() {
            var item = recordSet.at(4);

            mover.moveItemDown(item);
            assert.equal(recordSet.at(4).getId(), item.getId());
         });

         it('moveItems by item', function(done) {
            var
                item = recordSet.at(0),
                target = recordSet.at(2);

            mover._notify = function(event) {
               if (event === 'afterItemsMove') {
                  assert.equal(recordSet.at(2).getId(), item.getId());
                  done();
               }
            };

            mover.moveItems([item], target, 'after');
         });

         it('moveItems by id', function(done) {
            var target = recordSet.at(2);

            mover._notify = function(event) {
               if (event === 'afterItemsMove') {
                  assert.equal(recordSet.at(0).getId(), target.getId());
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
                  assert.equal(recordSet.getRecordById(4).get('folder'), 1);
                  assert.equal(recordSet.getRecordById(5).get('folder'), 1);
                  done();
               }
            };

            mover.moveItems([4, 5], 1, 'on');
         });

         it('moveItems in folder with change order', function(done) {
            mover._notify = function(event) {
               if (event === 'afterItemsMove') {
                  assert.equal(recordSet.getRecordById(3).get('folder'), 1);
                  done();
               }
            };

            mover.moveItems([3], 4, 'after');
         });

         it('moveItems in root', function(done) {
            var movedItems = [];
            movedItems.push(recordSet.getRecordById(4));
            movedItems.push(recordSet.getRecordById(5));

            mover._notify = function(event) {
               if (event === 'afterItemsMove') {
                  assert.equal(recordSet.getRecordById(4).get('folder'), null);
                  assert.equal(recordSet.getRecordById(5).get('folder'), null);
                  done();
               }
            };

            mover.moveItems(movedItems, null, 'on');
         });

         it('moveItems in list', function() {
            mover.moveItems([4], 5, 'on');
            assert.equal(recordSet.getRecordById(4).get('folder'), 1);
         });

         it('moveItems folder in child folder', function() {
            mover.moveItems([1], 4, 'on');
            assert.equal(recordSet.getRecordById(1).get('folder'), null);
         });

         it('moveItems in himself', function() {
            mover.moveItems([1], 1, 'on');
            assert.equal(recordSet.getRecordById(1).get('folder'), null);
         });

         it('beforeItemsMove = MoveInItems', function(done) {
            var
                item = recordSet.at(0),
                target = recordSet.at(2);

            mover._notify = function(event) {
               if (event === 'beforeItemsMove') {
                  return Promise.resolve('MoveInItems');
               }
            };

            mover.moveItems([item], target, 'after').then(() => {
               assert.equal(recordSet.at(2).getId(), item.getId());
               mover._source.query().addCallback(function(dataSet) {
                  assert.equal(dataSet.getAll().at(0).getId(), item.getId());
                  done();
               });
            });
         });

         it('beforeItemsMove = Custom', function(done) {
            var
                item = recordSet.at(0),
                target = recordSet.at(2);

            mover._notify = function(event) {
               if (event === 'beforeItemsMove') {
                  return 'Custom';
               }
            };

            mover.moveItems([item], target, 'after');
            assert.equal(recordSet.at(0).getId(), item.getId());
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

            siblingItem = Mover._private.getTargetItem(mover, recordSet.getRecordById(6), 'before');
            assert.equal(siblingItem.getId(), 3);
            siblingItem = Mover._private.getTargetItem(mover, recordSet.getRecordById(6), 'after');
            assert.isNull(siblingItem);

            siblingItem = Mover._private.getTargetItem(mover, recordSet.getRecordById(3), 'after');
            assert.equal(siblingItem.getId(), 6);
            siblingItem = Mover._private.getTargetItem(mover, recordSet.getRecordById(3), 'before');
            assert.equal(siblingItem.getId(), 2);

            siblingItem = Mover._private.getTargetItem(mover, recordSet.getRecordById(1), 'after');
            assert.equal(siblingItem.getId(), 2);
            siblingItem = Mover._private.getTargetItem(mover, recordSet.getRecordById(1), 'before');
            assert.isNull(siblingItem);

            mover._options.root = 1;
            siblingItem = Mover._private.getTargetItem(mover, recordSet.getRecordById(4), 'after');
            assert.equal(siblingItem.getId(), 5);

         });

      });
   });
});
