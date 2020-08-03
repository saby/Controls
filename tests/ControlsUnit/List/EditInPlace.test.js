define([
   'Controls/_editInPlace/EditInPlace',
   'Types/collection',
   'Types/entity',
   'Core/Deferred',
   'Types/source',
   'Controls/list',
   'Controls/tree',
   'Controls/treeGrid',
   'Controls/Constants'
], function(
   EditInPlaceModule,
   collection,
   entity,
   Deferred,
   sourceLib,
   lists,
   tree,
   treeGrid,
   Constants
) {
   const EditInPlace = EditInPlaceModule.default;
   describe('Controls.List.EditInPlace', function() {
      var eip, items, newItem, listViewModel, listViewModelWithGroups, data, treeData, treeModel, source;
      beforeEach(function() {
         data = [
            {
               id: 1,
               title: 'Первый',
               type: 'goods'
            },
            {
               id: 2,
               title: 'Второй',
               type: 'goods'
            },
            {
               id: 3,
               title: 'Третий',
               type: 'services'
            }
         ];
         treeData = [{
            id: 1,
            'parent': null,
            'parent@': true,
            title: 'Документы отделов'
         }, {
            id: 11,
            'parent': 1,
            'parent@': true,
            title: '1. Электронный документооборот'
         }, {
            id: 12,
            'parent': 1,
            'parent@': true,
            title: '2. Отчетность через интернет'
         }, {
            id: 13,
            'parent': 1,
            'parent@': null,
            title: 'Сравнение условий конкурентов по ЭДО.xlsx',
            isDocument: true
         }, {
            id: 111,
            'parent': 11,
            'parent@': true,
            title: 'Задачи'
         }, {
            id: 112,
            'parent': 11,
            'parent@': null,
            title: 'Сравнение систем по учету рабочего времени.xlsx',
            isDocument: true
         }, {
            id: 2,
            'parent': null,
            'parent@': true,
            title: 'Техническое задание'
         }, {
            id: 21,
            'parent': 2,
            'parent@': null,
            title: 'PandaDoc.docx',
            isDocument: true
         }, {
            id: 22,
            'parent': 2,
            'parent@': null,
            title: 'SignEasy.docx',
            isDocument: true
         }, {
            id: 3,
            'parent': null,
            'parent@': true,
            title: 'Анализ конкурентов'
         }, {
            id: 4,
            'parent': null,
            'parent@': null,
            title: 'Договор на поставку печатной продукции'
         }];
         items = new collection.RecordSet({
            rawData: data,
            keyProperty: 'id'
         });
         newItem = new entity.Model({
            rawData: {
               id: 4,
               title: 'Четвёртый'
            },
            keyProperty: 'id'
         });
         listViewModel = new lists.ListViewModel({
            items: items.clone(),
            keyProperty: 'id',
            displayProperty: 'title'
         });
         treeModel = new tree.TreeViewModel({
            items: new collection.RecordSet({
               rawData: treeData,
               keyProperty: 'id'
            }),
            keyProperty: 'id',
            columns: [{
               displayProperty: 'title'
            }],
            parentProperty: 'parent',
            nodeProperty: 'parent@'
         });
         listViewModelWithGroups = new lists.ListViewModel({
            items: items.clone(),
            keyProperty: 'id',
            displayProperty: 'title',
            groupingKeyCallback: function(item) {
               return item.get('type');
            }
         });
         source = new sourceLib.Memory({
            keyProperty: 'id',
            data: items
         });
         eip = new EditInPlace({
            notify: () => undefined,
            forceUpdate: () => undefined,
            source: source,
            updateMarkedKey: () => undefined,
            updateItemActions: () => undefined,
            multiSelectVisibility: false,
            notify: () => undefined,
            forceUpdate: () => undefined,
            readOnly: false,
            listViewModel: listViewModel

         });
         eip._formController = {
            deferSubmit: function() {
               return this.submit();
            },
            submit: function() {
               return Promise.resolve();
            },
            setValidationResult: function() {
               return;
            }
         }
      });

      afterEach(function() {
         listViewModel.destroy();
         listViewModelWithGroups.destroy();
         eip = undefined;
         listViewModel = undefined;
         listViewModelWithGroups = undefined;
         newItem = undefined;
         items = undefined;
      });

      describe('createEditingData', function() {
         it('Edit', async function() {
            eip._editingConfig =
               await eip.createEditingData({
                     item: listViewModel.at(0)
                        .getContents()
                  }, listViewModel
               );
            assert.equal(listViewModel.at(0)
               .getContents(), eip._editingItem);
            assert.equal(listViewModel.at(0)
               .getContents(), eip._originalItem);
         });

         it('Add', async function() {
            await eip.createEditingData({
               item: newItem,
               toolbarVisibility: true
            }, listViewModel);
            assert.equal(newItem, eip._editingItem);
            assert.isTrue(eip._isAdd);
            assert.isTrue(eip._editingItemData.drawActions);
         });

         it('Adding to the top of the list', async function() {
            await eip.createEditingData({
               item: newItem,
               addPosition: 'top'
            }, listViewModel);
            assert.equal(newItem, eip._editingItem);
            assert.isTrue(eip._isAdd);
            assert.equal(0, eip._editingItemData.index);
         });
      });

      describe('beginEdit', function() {
         it('Cancel', function() {
            eip._options.notify = function(e) {
               if (e === 'beforeBeginEdit') {
                  return Constants.editing.CANCEL;
               }
            };

            Object.assign(eip._options, {
               listViewModel: listViewModel
            });

            return eip.beginEdit({
               item: listViewModel.at(0)
                  .getContents()
            });
         });

         it('Without handler', async function() {
            Object.assign(eip._options, {
               listViewModel: listViewModel
            });

            await eip.beginEdit({
               item: listViewModel.at(0)
                  .getContents()
            });
            assert.isTrue(listViewModel.at(0)
               .getContents()
               .isEqual(eip._editingItem));
            listViewModel.at(0)
               .setEditing(false);
            assert.equal(listViewModel.at(0)
               .getContents(), eip._originalItem);
         });

         it('Without changes', async function() {
            var validateCalled;
            Object.assign(eip._options, {
               listViewModel: listViewModel
            });
            eip._formController = {
               deferSubmit: function() {
                  return this.submit();
               },
               submit: function() {
                  validateCalled = true;
                  return Deferred.success();
               },
               setValidationResult: () => undefined
            };
            await eip.beginEdit({
               item: listViewModel.at(0)
                  .getContents()
            });
            validateCalled = false;
            await eip.beginEdit({
               item: listViewModel.at(1)
                  .getContents()
            });
            assert.isFalse(validateCalled);
            eip._editingItem.set('title', 'test');
            await eip.beginEdit({
               item: listViewModel.at(2)
                  .getContents()
            });
            assert.isTrue(validateCalled);
         });

         it('Deferred', async function() {
            eip._options.notify = function(e) {
               if (e === 'beforeBeginEdit') {
                  return Deferred.success({
                     item: listViewModel.at(1)
                        .getContents()
                  });
               }
            };

            Object.assign(eip._options, {
               listViewModel: listViewModel
            });

            await eip.beginEdit({
               item: listViewModel.at(0)
                  .getContents()
            });
            assert.isTrue(listViewModel.at(1)
               .getContents()
               .isEqual(eip._editingItem));
            assert.equal(listViewModel.at(0)
               .getContents(), eip._originalItem);
         });

         it('Record', async function() {
            eip._options.notify = function(e) {
               if (e === 'beforeBeginEdit') {
                  return {
                     item: listViewModel.at(1)
                        .getContents()
                  };
               }
            };

            Object.assign(eip._options, {
               listViewModel: listViewModel
            });

            await eip.beginEdit({
               item: listViewModel.at(0)
                  .getContents()
            });
            assert.isTrue(listViewModel.at(1)
               .getContents()
               .isEqual(eip._editingItem));
            assert.equal(listViewModel.at(0)
               .getContents(), eip._originalItem);
         });

         it('afterBeginEdit', function(done) {
            let afterBeginEditNotified = false;
            Object.assign(eip._options, {
               listViewModel: listViewModel,
               source: source
            });
            eip._setEditingItemData = function() {
               assert.isFalse(afterBeginEditNotified);
            };
            eip._options.notify = function(event, args) {
               if (event === 'afterBeginEdit') {
                  assert.equal(eip._editingItem, args[0]);
                  assert.isNotOk(args[1]);
                  done();
                  afterBeginEditNotified = true;
               }
            };

            eip.beginEdit({
               item: listViewModel.at(0)
                  .getContents()
            });
         });

         it('beginEdit always returns Promise', async function() {
            eip._options.notify = function(e) {
               if (e === 'beforeBeginEdit') {
                  return {
                     item: listViewModel.at(1)
                        .getContents()
                  };
               }
            };

            Object.assign(eip._options, {
               listViewModel: listViewModel
            });

            await eip.beginEdit({
               item: listViewModel.at(0)
                  .getContents()
            });
            assert.isTrue(listViewModel.at(1)
               .getContents()
               .isEqual(eip._editingItem));
            assert.equal(listViewModel.at(0)
               .getContents(), eip._originalItem);

            // This item edit already editing, so begin edit canceled
            const result = eip.beginEdit({
               item: listViewModel.at(0)
                  .getContents()
            });

            assert.isTrue(result instanceof Promise);
         });

         // Необходимо устанавливать состояние "модель редактируется" для новой и старой модели
         it('should set isEditing() for model', async() => {
            Object.assign(eip._options, {
               listViewModel: listViewModel,
               source: source
            });
            assert.isNotTrue(listViewModel.isEditing(), 'Model shouldn\'t be in editing state before beginEdit()');
            await eip.beginEdit({
               item: listViewModel.at(0)
                  .getContents()
            });
            assert.isTrue(listViewModel.isEditing(), 'Model should be in editing state after what had happened to her.');
         });
      });

      describe('beginAdd', function() {
         it('new item should not take itemActions from existing items', async function() {
            Object.assign(eip._options, {
               listViewModel: listViewModel,
               source: source
            });

            listViewModel.at(0)
               .setActions({
                  all: {
                     id: 0,
                     title: 'Удалить'
                  },
                  showed: {
                     id: 0,
                     title: 'Удалить'
                  }
               });
            await eip.beginAdd();
            assert.isNull(eip._editingItemData.getActions());
         });

         it('Without handler', function(done) {
            Object.assign(eip._options, {
               listViewModel: listViewModel,
               source: source
            });

            eip.beginAdd()
               .addCallback(function() {
                  assert.instanceOf(eip._editingItem, entity.Model);
                  assert.isTrue(eip._isAdd);
                  done();
               });
         });

         it('Empty list', function(done) {
            listViewModel.setItems(new collection.RecordSet({
               rawData: [],
               keyProperty: 'id'
            }));
            Object.assign(eip._options, {
               listViewModel: listViewModel,
               source: source
            });

            eip.beginAdd()
               .addCallback(function() {
                  assert.instanceOf(eip._editingItem, entity.Model);
                  assert.equal(eip._editingItemData.index, 0);
                  assert.isTrue(eip._isAdd);
                  done();
               });
         });

         it('Object without item', function(done) {
            eip._options.notify = function(e) {
               if (e === 'beforeBeginEdit') {
                  return {
                     addPosition: 'bottom'
                  };
               }
            };

            Object.assign(eip._options, {
               listViewModel: listViewModel,
               source: source
            });

            eip.beginAdd()
               .addCallback(function() {
                  assert.instanceOf(eip._editingItem, entity.Model);
                  assert.isTrue(eip._isAdd);
                  done();
               });
         });

         it('afterBeginEdit', function(done) {
            Object.assign(eip._options, {
               listViewModel: listViewModel,
               source: source
            });

            let updateMarkedKeyCalled = false;
            eip._options.updateMarkedKey = (key) => {
               updateMarkedKeyCalled = true;
            };

            eip._options.notify = function(event, args) {
               if (event === 'afterBeginEdit') {
                  assert.equal(eip._editingItem, args[0]);
                  assert.isTrue(args[1]);
               }
            };

            eip.beginAdd({
               item: newItem
            })
               .then(() => {
                  assert.isTrue(updateMarkedKeyCalled);
                  done()
               });
         });

         it('adding item was changed before begin add', function(done) {
            Object.assign(eip._options, {
               listViewModel: treeModel,
               source: source
            });
            treeModel.setExpandedItems([1]);

            source.create()
               .addCallback(function(model) {
                  model.set('parent', 1);
                  model.set('parent@', false);
                  eip.beginAdd({
                     item: model
                  })
                     .addCallback(function() {
                        assert.isTrue(model.isChanged());
                        assert.isFalse(eip._editingItem.isChanged());
                        done();
                     });
               });
         });

         it('add item to a folder', function() {
            Object.assign(eip._options, {
               listViewModel: treeModel,
               source: source
            });
            treeModel.setExpandedItems([1]);

            return source.create()
               .then(function(model) {
                  model.set('parent', 1);
                  model.set('parent@', false);
                  return eip.beginAdd({
                     item: model
                  })
                     .then(function() {
                        assert.instanceOf(eip._editingItem, entity.Model);
                        assert.isTrue(eip._isAdd);
                        assert.equal(eip._editingItemData.level, 2);
                        assert.equal(eip._editingItemData.index, 4);
                     });
               });
         });

         it('add item to the top of the list', function(done) {
            Object.assign(eip._options, {
               listViewModel: listViewModel,
               source: source,
               editingConfig: {
                  addPosition: 'top'
               }
            });

            eip.beginAdd()
               .addCallback(function() {
                  assert.instanceOf(eip._editingItem, entity.Model);
                  assert.equal(eip._editingItemData.index, 0);
                  assert.isTrue(eip._isAdd);
                  done();
               });
         });

         it('add item to a folder to the top of the list', function(done) {
            Object.assign(eip._options, {
               listViewModel: treeModel,
               source: source,
               editingConfig: {
                  addPosition: 'top'
               }
            });
            treeModel.setExpandedItems([1]);

            source.create()
               .addCallback(function(model) {
                  model.set('parent', 1);
                  model.set('parent@', false);
                  eip.beginAdd({
                     item: model
                  })
                     .addCallback(function() {
                        assert.instanceOf(eip._editingItem, entity.Model);
                        assert.isTrue(eip._isAdd);
                        assert.equal(1, eip._editingItemData.index);
                        done();
                     });
               });
         });

         it('add item to the top of the grouped list', async function() {
            /*
            * 0 --goods-----
            * 1    Первый
            * 2    Второй
            * 3 --services--
            * 4    Третий
            * */
            Object.assign(eip._options, {
               listViewModel: listViewModelWithGroups,
               editingConfig: {
                  addPosition: 'top'
               }
            });

            // Без группировки, в начало
            await eip.beginAdd({ item: newItem });
            assert.equal(eip._editingItemData.index, 0); // First item of list
            await eip.cancelEdit();

            // C группировкой, в начало группы goods
            newItem.set('type', 'goods');
            await eip.beginAdd({ item: newItem });
            assert.equal(eip._editingItemData.index, 1);
            await eip.cancelEdit();

            // C группировкой, в начало группы services
            newItem.set('type', 'services');
            await eip.beginAdd({ item: newItem });
            assert.equal(eip._editingItemData.index, 4);
            await eip.cancelEdit();

            // С группировкой, в новую, не существующую ранее группу
            newItem.set('type', 'new');
            await eip.beginAdd({ item: newItem });
            assert.equal(eip._editingItemData.index, 0);
            await eip.cancelEdit();
         });

         it('add item to the bottom of the grouped list', async function() {
            /*
            * 0 --goods-----
            * 1    Первый
            * 2    Второй
            * 3 --services--
            * 4    Третий
            * */
            Object.assign(eip._options, {
               listViewModel: listViewModelWithGroups,
               source: source,
               editingConfig: {
                  addPosition: 'bottom'
               }
            });

            // Без группировки, в конец
            await eip.beginAdd({ item: newItem });
            assert.equal(eip._editingItemData.index, 5);
            await eip.cancelEdit();

            // С группировкой, в конец группы goods
            newItem.set('type', 'goods');
            await eip.beginAdd({ item: newItem });
            assert.equal(eip._editingItemData.index, 3);
            await eip.cancelEdit();

            // С группировкой, в конец группы services
            newItem.set('type', 'services');
            await eip.beginAdd({ item: newItem });
            assert.equal(eip._editingItemData.index, 5);
            await eip.cancelEdit();

            // С группировкой, в новую, не существующую ранее группу
            newItem.set('type', 'new');
            await eip.beginAdd({ item: newItem });
            assert.equal(eip._editingItemData.index, 5);
            await eip.cancelEdit();
         });
      });

      describe('commitEdit', function() {
         it('Without editing item', function() {
            Object.assign(eip._options, {
               listViewModel: listViewModel
            });

            return eip.commitEdit();
         });

         it('Without handler', async function() {
            Object.assign(eip._options, {
               listViewModel: listViewModel
            });

            await eip.beginEdit({
               item: listViewModel.at(0)
                  .getContents()
            });
            eip._editingItem.set('title', '1234');
            return eip.commitEdit()
               .then(() => {
                  assert.equal(listViewModel.at(0)
                     .getContents()
                     .get('title'), '1234');
               });

         });

         it('Cancel', async function() {
            eip._options.notify = function(e) {
               if (e === 'beforeEndEdit') {
                  return Constants.editing.CANCEL;
               }
            };

            Object.assign(eip._options, {
               listViewModel: listViewModel
            });

            await eip.beginEdit({
               item: listViewModel.at(0)
                  .getContents()
            });
            return eip.commitEdit();
         });

         it('Deferred', async function() {
            eip._options.notify = function(e) {
               if (e === 'beforeEndEdit') {
                  return Promise.resolve();
               }
            };
            Object.assign(eip._options, {
               listViewModel: listViewModel
            });

            await eip.beginEdit({
               item: listViewModel.at(0)
                  .getContents()
            });
            return eip.commitEdit();
         });

         it.skip('Two deferreds', async function() {
            let pResolve;
            const deferred = new Promise((resolve) => {
               pResolve = resolve;
            });
            eip._options.notify = function(e) {
               if (e === 'beforeEndEdit') {
                  return deferred;
               }
            };
            Object.assign(eip._options, {
               listViewModel: listViewModel
            });

            await eip.beginEdit({
               item: listViewModel.at(0)
                  .getContents()
            });
            eip.commitEdit();
            assert.isTrue(!!eip._endEditDeferred);
            pResolve();
            return eip.commitEdit();
         });

         describe('Two async commits', () => {
            it('validation success', function(done) {
               let
                  validationResultDef,
                  firstCommitDef,
                  secondCommitDef;

               Object.assign(eip._options, {
                  listViewModel: listViewModel
               });

               eip.beginEdit({
                  item: listViewModel.at(0)
                     .getContents()
               });
               eip._formController.submit = () => {
                  return validationResultDef;
               };

               validationResultDef = new Deferred();
               firstCommitDef = eip.commitEdit();
               secondCommitDef = eip.commitEdit();
               assert.equal(firstCommitDef, secondCommitDef);
               assert.equal(eip._commitPromise, firstCommitDef);
               assert.isTrue(eip._isCommitInProcess);

               firstCommitDef.addCallback(() => {
                  assert.isFalse(eip._isCommitInProcess);
                  assert.isTrue(eip._commitPromise.isReady());
                  done();
               });

               validationResultDef.callback({});
            });

            it('validation failed', function(done) {
               let
                  validationResultDef,
                  firstCommitDef,
                  secondCommitDef;

               Object.assign(eip._options, {
                  listViewModel: listViewModel
               });

               eip.beginEdit({
                  item: listViewModel.at(0)
                     .getContents()
               });
               eip._formController.submit = () => {
                  return validationResultDef;
               };

               validationResultDef = new Deferred();
               firstCommitDef = eip.commitEdit();
               secondCommitDef = eip.commitEdit();
               assert.equal(firstCommitDef, secondCommitDef);
               assert.equal(eip._commitPromise, firstCommitDef);
               assert.isTrue(eip._isCommitInProcess);

               firstCommitDef.addCallback(() => {
                  assert.isFalse(eip._isCommitInProcess);
                  assert.isTrue(eip._commitPromise.isReady());
                  done();
               });

               validationResultDef.callback({ any: true });
            });
         });

         it('commit not in process if server validation failed', async function() {
            let
               validationResultDef;

            Object.assign(eip._options, {
               listViewModel: listViewModel
            });

            await eip.beginEdit({
               item: listViewModel.at(0)
                  .getContents()
            });
            eip._editingItem.set('title', '1234');

            eip._formController.submit = () => {
               return validationResultDef;
            };

            validationResultDef = new Deferred();
            eip._options.source = { update: () => Deferred.fail() };
            const commit = eip.commitEdit()
               .addErrback(() => {
                  assert.isFalse(eip._isCommitInProcess);
                  assert.isTrue(eip._commitPromise.isReady());
               });

            assert.isTrue(eip._isCommitInProcess);
            validationResultDef.callback({});
            await commit;
         });

         it('With source', function(done) {
            Object.assign(eip._options, {
               listViewModel: listViewModel
            });

            eip.beginEdit({
               item: listViewModel.at(0)
                  .getContents()
            })
               .then(() => {
                  eip._editingItem.set('title', '1234');
                  eip.commitEdit()
                     .addCallback(function() {
                        assert.equal(listViewModel.at(0)
                           .getContents()
                           .get('title'), '1234');
                        source.read(1)
                           .addCallback(function(result) {
                              assert.equal(result.get('title'), '1234');
                              done();
                           });
                     });
               });
         });

         it('Add item', function(done) {
            Object.assign(eip._options, {
               listViewModel: listViewModel,
               source: source
            });

            eip.beginAdd({
               item: newItem
            })
               .then(() => {
                  eip._editingItem.set('title', '1234');
                  eip.commitEdit()
                     .addCallback(function() {
                        assert.equal(listViewModel.at(3)
                           .getContents()
                           .get('title'), '1234');
                        assert.equal(listViewModel.getCount(), 4);
                        source.read(4)
                           .addCallback(function(result) {
                              assert.equal(result.get('title'), '1234');
                              done();
                           })
                           .addErrback(function(err) {
                              console.log(err);
                           });
                     });
               });
         });

         it('Validation fail', async function() {
            Object.assign(eip._options, {
               listViewModel: listViewModel
            });

            await eip.beginAdd({
               item: newItem
            });
            eip._children = {
               formController: {
                  submit: function() {
                     return Deferred.success({
                        0: [{
                           0: 'Поле обязательно для заполнения'
                        }]
                     });
                  }
               }
            };
            return eip.commitEdit();
         });


         it('Add in top without sequentialEditing. Should not edit second record after adding.', async function() {
            Object.assign(eip._options, {
               listViewModel: listViewModel,
               source: source,
               editingConfig: {
                  sequentialEditing: false,
                  addPosition: 'top'
               }
            });

            await eip.beginAdd({
               item: newItem
            });

            eip._editingItem.set('title', '1234');

            await eip.commitEdit();
            assert.equal(listViewModel.getCount(), 4);
            assert.isNull(eip._editingItem);
         });

         describe('beforeEndEdit', function() {
            it('Defered', function(done) {
               var
                  isIndicatorHasBeenShown = false,
                  isIndicatorHasBeenHiden = false,
                  isAfterEndEditHasBeenNotified = false;

               eip._options.notify = function(e) {
                  if (e === 'beforeEndEdit') {
                     return Deferred.success({});
                  } else if (e === 'afterEndEdit') {
                     isAfterEndEditHasBeenNotified = true;
                  } else if (e === 'showIndicator') {
                     isIndicatorHasBeenShown = true;
                     return '123';
                  } else if (e === 'hideIndicator') {
                     isIndicatorHasBeenHiden = true;
                  }
               };

               Object.assign(eip._options, {
                  listViewModel: listViewModel
               });

               eip.beginEdit({
                  item: listViewModel.at(0)
                     .getContents()
               })
                  .then(() => {
                     eip.cancelEdit()
                        .addCallback(function(result) {
                           assert.deepEqual(result, {});
                           assert.isTrue(isIndicatorHasBeenShown);
                           assert.isTrue(isIndicatorHasBeenHiden);
                           assert.isTrue(isAfterEndEditHasBeenNotified);
                           done();
                        });
                  });

            });

            it('Defered with cancel', function(done) {
               var
                  isIndicatorHasBeenShown = false,
                  isIndicatorHasBeenHiden = false,
                  isAfterEndEditHasBeenNotified = false;

               eip._options.notify = function(e) {
                  if (e === 'beforeEndEdit') {
                     return Deferred.success(Constants.editing.CANCEL);
                  } else if (e === 'afterEndEdit') {
                     isAfterEndEditHasBeenNotified = true;
                  } else if (e === 'showIndicator') {
                     isIndicatorHasBeenShown = true;
                     return '123';
                  } else if (e === 'hideIndicator') {
                     isIndicatorHasBeenHiden = true;
                  }
               };

               Object.assign(eip._options, {
                  listViewModel: listViewModel
               });

               eip.beginEdit({
                  item: listViewModel.at(0)
                     .getContents()
               })
                  .then(() => {
                     eip.cancelEdit()
                        .addCallback(function(result) {
                           assert.deepEqual(result, { cancelled: true });
                           assert.isTrue(isIndicatorHasBeenShown);
                           assert.isTrue(isIndicatorHasBeenHiden);
                           assert.isFalse(isAfterEndEditHasBeenNotified);
                           done();
                        });
                  });

            });

            it('Defered with errback', (done) => {
               let
                  isIndicatorHasBeenShown = false,
                  isIndicatorHasBeenHidden = false,
                  isAfterEndEditHasBeenNotified = false;

               eip._options.notify = (e) => {
                  if (e === 'beforeEndEdit') {
                     return Deferred.success()
                        .addCallback(() => {
                           return (new Deferred()).errback();
                        });
                  } else if (e === 'afterEndEdit') {
                     isAfterEndEditHasBeenNotified = true;
                  } else if (e === 'showIndicator') {
                     isIndicatorHasBeenShown = true;
                     return '123';
                  } else if (e === 'hideIndicator') {
                     isIndicatorHasBeenHidden = true;
                  }
               };

               Object.assign(eip._options, {
                  listViewModel: listViewModel
               });

               eip.beginEdit({
                  item: listViewModel.at(0)
                     .getContents()
               })
                  .then(() => {
                     eip.cancelEdit()
                        .addCallback(function(result) {
                           assert.deepEqual(result, { cancelled: true });
                           assert.isTrue(isIndicatorHasBeenShown);
                           assert.isTrue(isIndicatorHasBeenHidden);
                           assert.isFalse(isAfterEndEditHasBeenNotified);
                           done();
                        });
                  });

            });

            it('Cancel', function(done) {
               var
                  isIndicatorHasBeenShown = false,
                  isIndicatorHasBeenHiden = false;

               eip._options.notify = function(e) {
                  if (e === 'beforeEndEdit') {
                     return Constants.editing.CANCEL;
                  } else if (e === 'showIndicator') {
                     isIndicatorHasBeenShown = true;
                  } else if (e === 'hideIndicator') {
                     isIndicatorHasBeenHiden = true;
                  }
               };

               Object.assign(eip._options, {
                  listViewModel: listViewModel
               });

               eip.beginEdit({
                  item: listViewModel.at(0)
                     .getContents()
               })
                  .then(() => {
                     eip.cancelEdit()
                        .addCallback(function(result) {
                           assert.deepEqual(result, { cancelled: true });
                           assert.isFalse(isIndicatorHasBeenShown);
                           assert.isFalse(isIndicatorHasBeenHiden);
                           done();
                        });
                  });
            });
         });

         describe('afterEndEdit', function() {
            it('add item', function(done) {
               Object.assign(eip._options, {
                  listViewModel: listViewModel,
                  source: source
               });

               eip.beginAdd({
                  item: newItem
               })
                  .then(() => {
                     eip._editingItem.set('title', '1234');

                     let editingItem;
                     eip._options.notify = function(event, args) {
                        if (event === 'beforeEndEdit') {
                           editingItem = eip._editingItem;
                           assert.isNotNull(listViewModel.getEditingItemData());
                        }
                        if (event === 'afterEndEdit') {
                           assert.equal(editingItem, args[0]);
                           assert.isTrue(args[1]);
                           assert.isNull(listViewModel.getEditingItemData());
                           done();
                        }
                     };
                     eip.commitEdit();
                  });

            });

            it('edit item', function(done) {
               Object.assign(eip._options, {
                  listViewModel: listViewModel,
                  source: source
               });

               eip.beginEdit({
                  item: listViewModel.at(0)
                     .getContents()
               })
                  .then(() => {
                     eip._editingItem.set('title', '1234');

                     eip._options.notify = function(event, args) {
                        if (event === 'afterEndEdit') {
                           assert.equal(listViewModel.at(0)
                              .getContents(), args[0]);
                           assert.isNotOk(args[1]);
                           done();
                        }
                     };
                     eip.commitEdit();
                  });
            });

            it.skip('destroyed in process of end edit item (stack closed for ex.)', function(done) {
               Object.assign(eip._options, {
                  listViewModel: listViewModel,
                  source: source
               });

               eip.beginEdit({
                  item: listViewModel.at(0)
                     .getContents()
               })
                  .then(() => {
                     eip._editingItem.set('title', '1234');

                     let setEditingItemDataCalled = false;
                     eip._setEditingItemData = () => setEditingItemDataCalled = true;

                     const originalAfterEndEdit = EditInPlace._private.afterEndEdit;
                     EditInPlace._private.afterEndEdit = (self, commit) => {
                        originalAfterEndEdit.call(null, self, commit);
                        EditInPlace._private.afterEndEdit = originalAfterEndEdit;
                        assert.isFalse(setEditingItemDataCalled);
                        done();
                     };

                     eip._options.notify = function(event, args) {
                        if (event === 'beforeEndEdit') {
                           eip._destroyed = true;
                        }
                     };

                     eip.commitEdit();
                  });
            });

            it('accept changes on recordset', function(done) {
               Object.assign(eip._options, {
                  listViewModel: listViewModel,
                  source: source
               });

               eip.beginEdit({
                  item: listViewModel.at(0)
                     .getContents()
               })
                  .then(() => {
                     eip._editingItem.set('title', '1234');

                     eip.commitEdit()
                        .then(() => {
                           assert.isFalse(listViewModel._items.isChanged());
                           done();
                        });
                  });
            });
         });

         describe('update model', function() {
            let
               sourceUpdated;

            beforeEach(function() {
               sourceUpdated = false;
               source.update = () => {
                  sourceUpdated = true;
                  return Deferred.success({})
               };
            });

            it('existing item, nothing changed', function() {
               Object.assign(eip._options, {
                  listViewModel: listViewModel,
                  source: source
               });

               eip.beginEdit({
                  item: listViewModel.at(0)
                     .getContents()
               });
               eip.commitEdit();
               assert.isFalse(sourceUpdated);
            });

            it('existing item, has changed', async function() {
               Object.assign(eip._options, {
                  listViewModel: listViewModel,
                  source: source
               });
               await eip.beginEdit({
                  item: listViewModel.at(0)
                     .getContents()
               });
               eip._editingItem.isChanged = () => true;
               await eip.commitEdit();
               assert.isTrue(sourceUpdated);
            });

            it('added item, nothing changed', async function() {
               Object.assign(eip._options, {
                  listViewModel: listViewModel,
                  source: source
               });

               await eip.beginAdd({ item: newItem });
               await eip.commitEdit();
               assert.isTrue(sourceUpdated);
            });

            it('added item, has changed', async function() {
               Object.assign(eip._options, {
                  listViewModel: listViewModel,
                  source: source
               });
               await eip.beginAdd({ item: newItem });
               eip._editingItem.isChanged = () => true;
               await eip.commitEdit();
               assert.isTrue(sourceUpdated);
            });
         });
      });

      describe('cancelEdit', function() {
         it('Without editing item', function() {
            Object.assign(eip._options, {
               listViewModel: listViewModel
            });

            return eip.cancelEdit();
         });

         it('With item', async function() {
            Object.assign(eip._options, {
               listViewModel: listViewModel
            });

            await eip.beginEdit({
               item: listViewModel.at(0)
                  .getContents()
            });
            eip._editingItem.set('title', '1234');
            return eip.cancelEdit()
               .then(() => {
                  assert.equal(listViewModel.at(0)
                     .getContents()
                     .get('title'), 'Первый');
               });
         });

         it('cancel called while commit is in process', (done) => {
            let
               pResolve,
               validationResultDef = new Promise((resolve) => {
                  pResolve = resolve
               }),
               commitDef,
               cancelDef,
               notifyBeforeEndEditCount = 0;

            Object.assign(eip._options, {
               listViewModel: listViewModel
            });

            eip.beginEdit({
               item: listViewModel.at(0)
                  .getContents()
            })
               .then(() => {
                  eip._formController.submit = () => {
                     return validationResultDef;
                  };
                  eip._options.notify = (eName) => {
                     if (eName === 'beforeEndEdit') {
                        notifyBeforeEndEditCount++;
                     }
                  };
                  commitDef = eip.commitEdit();
                  cancelDef = eip.cancelEdit();

                  assert.equal(eip._commitPromise, commitDef);
                  assert.isTrue(eip._isCommitInProcess);

                  commitDef.then(() => {
                     assert.isFalse(eip._isCommitInProcess);
                     assert.isTrue(eip._commitPromise.isReady());
                  });

                  cancelDef.then(() => {
                     assert.isNull(eip._editingItem);
                     assert.equal(notifyBeforeEndEditCount, 1);
                     done();
                  });

                  pResolve({});
               })
         });
      });

      describe('editNextRow', function() {
         it('Enter with autoAddByApplyButton', async function() {
            eip.beginEdit = function(options) {
               assert.equal(options.item, listViewModel.at(1)
                  .getContents());
            };
            Object.assign(eip._options, {
               listViewModel: listViewModel,
               editingConfig: {
                  autoAddByApplyButton: true
               }
            });
            eip._editingItem = listViewModel.at(0)
               .getContents();

            eip._setEditingItemData(listViewModel.at(0)
               .getContents(), eip._options.listViewModel, eip._options);
            await eip.editNextRow();
            assert.isNull(eip._editingItem);
         });

         it('Enter on last item', function(done) {
            eip.commitEdit = function() {
               done();
            };
            eip.beginEdit = function() {
               throw new Error('beginEdit shouldn\'t be called');
            };
            eip.beginAdd = function() {
               throw new Error('beginAdd shouldn\'t be called');
            };
            Object.assign(eip._options, {
               listViewModel: listViewModel
            });
            eip._editingItem = listViewModel.at(2)
               .getContents();
            eip._setEditingItemData(listViewModel.at(2)
               .getContents(), eip._options.listViewModel, eip._options);
            eip.editNextRow();
         });

         it('Enter on last item, autoAdd', function(done) {
            eip.beginAdd = function() {
               done();
            };
            Object.assign(eip._options, {
               listViewModel: listViewModel,
               editingConfig: {
                  autoAdd: true
               }
            });
            eip._sequentialEditing = true;
            eip._editingItem = listViewModel.at(2)
               .getContents();
            eip._setEditingItemData(listViewModel.at(2)
               .getContents(), eip._options.listViewModel, eip._options);
            eip.editNextRow();
         });

         it('Enter on adding item', async function() {
            let addCount = 0;
            const secondAddItem = new entity.Model({
               rawData: {
                  id: 5,
                  title: 'Пятый'
               },
               keyProperty: 'id'
            });
            Object.assign(eip._options, {
               listViewModel: listViewModel,
               editingConfig: {
                  autoAddByApplyButton: true
               }
            });

            eip._options.notify = (eName, args) => {
               if (eName === 'beforeBeginEdit' && args[1]) {
                  if (addCount === 0) {
                     addCount++;
                     return {
                        item: newItem
                     };
                  } else if (addCount === 1) {
                     addCount++;
                     return {
                        item: secondAddItem
                     };
                  }
                  throw new Error('beginEdit should be called only twice');
               }
            };

            await eip.beginAdd();

            assert.equal(eip._editingItem.getId(), newItem.getId());

            await eip.editNextRow();

            assert.equal(eip._editingItem.getId(), secondAddItem.getId());
         });

         it('Enter, sequentialEditing: false', function(done) {
            eip.commitEdit = function() {
               done();
            };
            eip.beginEdit = function() {
               throw new Error('beginEdit shouldn\'t be called');
            };
            eip.beginAdd = function() {
               throw new Error('beginAdd shouldn\'t be called');
            };
            Object.assign(eip._options, {
               listViewModel: listViewModel,
               editingConfig: {
                  sequentialEditing: false
               }
            });
            eip._editingItem = listViewModel.at(0)
               .getContents();
            eip._setEditingItemData(listViewModel.at(0)
               .getContents(), eip._options.listViewModel, eip._options);
            eip.editNextRow();
         });

         it('Tab', function(done) {
            eip.beginEdit = function(options) {
               assert.equal(options.item, listViewModel.at(1)
                  .getContents());
               done();
            };
            Object.assign(eip._options, {
               listViewModel: listViewModel
            });
            eip._editingItem = listViewModel.at(0)
               .getContents();
            eip._setEditingItemData(listViewModel.at(0)
               .getContents(), eip._options.listViewModel, eip._options);
            eip.onRowDeactivated({
               stopPropagation: function() {

               }
            }, {
               isTabPressed: true
            });
         });

         it('Tab but next item is a group', function(done) {
            eip.beginEdit = function(options) {
               assert.equal(options.item, listViewModelWithGroups.at(4)
                  .getContents());
               done();
            };
            Object.assign(eip._options, {
               listViewModel: listViewModelWithGroups
            });
            eip._editingItem = listViewModelWithGroups.at(2)
               .getContents();
            eip._setEditingItemData(listViewModelWithGroups.at(2)
               .getContents(), eip._options.listViewModel, eip._options);
            eip.onRowDeactivated({
               stopPropagation: function() {

               }
            }, {
               isTabPressed: true
            });
         });

         it('Tab on last item', function(done) {
            eip.commitEdit = function() {
               done();
            };
            eip.beginEdit = function() {
               throw new Error('beginEdit shouldn\'t be called');
            };
            eip.beginAdd = function() {
               throw new Error('beginAdd shouldn\'t be called');
            };
            Object.assign(eip._options, {
               listViewModel: listViewModel
            });
            eip._editingItem = listViewModel.at(2)
               .getContents();
            eip._setEditingItemData(listViewModel.at(2)
               .getContents(), eip._options.listViewModel, eip._options);
            eip.onRowDeactivated({
               stopPropagation: function() {

               }
            }, {
               isTabPressed: true
            });
         });

         it('Tab on third to last item but next two items are groups', function(done) {
            eip.commitEdit = function() {
               done();
            };
            eip.beginEdit = function() {
               throw new Error('beginEdit shouldn\'t be called');
            };
            eip.beginAdd = function() {
               throw new Error('beginAdd shouldn\'t be called');
            };
            eip.beginEdit = function() {
               throw new Error('beginEdit shouldn\'t be called.');
            };
            eip.beginAdd = function() {
               throw new Error('beginAdd shouldn\'t be called.');
            };
            Object.assign(eip._options, {
               listViewModel: listViewModelWithGroups
            });
            listViewModelWithGroups.toggleGroup('services');
            listViewModelWithGroups.toggleGroup('whatever');
            eip._editingItem = listViewModelWithGroups.at(2)
               .getContents();
            eip._setEditingItemData(listViewModelWithGroups.at(2)
               .getContents(), eip._options.listViewModel, eip._options);
            eip.onRowDeactivated({
               stopPropagation: function() {

               }
            }, {
               isTabPressed: true
            });
         });

         it('Tab on last item, autoAdd', function(done) {
            eip.beginAdd = function() {
               done();
            };
            Object.assign(eip._options, {
               listViewModel: listViewModel,
               editingConfig: {
                  autoAdd: true
               }
            });
            eip._editingItem = listViewModel.at(2)
               .getContents();
            eip._setEditingItemData(listViewModel.at(2)
               .getContents(), eip._options.listViewModel, eip._options);
            eip.onRowDeactivated({
               stopPropagation: function() {

               }
            }, {
               isTabPressed: true
            });
         });

         it('Tab on third to last item but next two items are groups, autoAdd: true', function(done) {
            eip.commitEdit = function() {
               throw new Error('commitEdit shouldn\'t be called.');
            };
            eip.beginEdit = function() {
               throw new Error('beginEdit shouldn\'t be called.');
            };
            eip.beginAdd = function() {
               done();
            };
            Object.assign(eip._options, {
               listViewModel: listViewModelWithGroups,
               editingConfig: {
                  autoAdd: true
               }
            });
            listViewModelWithGroups.toggleGroup('services');
            listViewModelWithGroups.toggleGroup('whatever');
            eip._editingItem = listViewModelWithGroups.at(2)
               .getContents();
            eip._setEditingItemData(listViewModelWithGroups.at(2)
               .getContents(), eip._options.listViewModel, eip._options);
            eip.onRowDeactivated({
               stopPropagation: function() {

               }
            }, {
               isTabPressed: true
            });
         });

         it('Shift+Tab', function(done) {
            eip.beginEdit = function(options) {
               assert.equal(options.item, eip._options.listViewModel.at(0)
                  .getContents());
               done();
            };
            Object.assign(eip._options, {
               listViewModel: listViewModel
            });
            eip._editingItem = listViewModel.at(1)
               .getContents();
            eip._setEditingItemData(listViewModel.at(1)
               .getContents(), eip._options.listViewModel, eip._options);
            eip.onRowDeactivated({
               stopPropagation: function() {

               }
            }, {
               isTabPressed: true,
               isShiftKey: true
            });
         });

         it('Shift+Tab but previous item is a group', function(done) {
            eip.beginEdit = function(options) {
               assert.equal(options.item, listViewModelWithGroups.at(2)
                  .getContents());
               done();
            };
            Object.assign(eip._options, {
               listViewModel: listViewModelWithGroups
            });
            eip._editingItem = listViewModelWithGroups.at(4)
               .getContents();
            eip._setEditingItemData(listViewModelWithGroups.at(4)
               .getContents(), eip._options.listViewModel, eip._options);
            eip.onRowDeactivated({
               stopPropagation: function() {

               }
            }, {
               isTabPressed: true,
               isShiftKey: true
            });
         });

         it('Shift+Tab on first item', function(done) {
            eip.commitEdit = function() {
               done();
            };
            eip.beginEdit = function() {
               throw new Error('beginEdit shouldn\'t be called.');
            };
            Object.assign(eip._options, {
               listViewModel: listViewModel
            });
            eip._editingItem = listViewModel.at(0)
               .getContents();
            eip._setEditingItemData(listViewModel.at(0)
               .getContents(), eip._options.listViewModel, eip._options);
            eip.onRowDeactivated({
               stopPropagation: function() {

               }
            }, {
               isTabPressed: true,
               isShiftKey: true
            });
         });

         it('Shift+Tab on third item, but first two items are groups', function(done) {
            eip.commitEdit = function() {
               done();
            };
            eip.beginEdit = function() {
               throw new Error('beginEdit shouldn\'t be called.');
            };
            Object.assign(eip._options, {
               listViewModel: listViewModelWithGroups
            });
            listViewModelWithGroups.toggleGroup('goods');
            eip._editingItem = listViewModelWithGroups.at(2)
               .getContents();
            eip._setEditingItemData(listViewModelWithGroups.at(2)
               .getContents(), eip._options.listViewModel, eip._options);
            eip.onRowDeactivated({
               stopPropagation: function() {

               }
            }, {
               isTabPressed: true,
               isShiftKey: true
            });
         });

         describe('Tree', function() {
            it('Enter inside a folder', function() {
               eip.beginEdit = function(options) {
                  assert.equal(options.item, treeModel.at(2)
                     .getContents());
               };
               Object.assign(eip._options, {
                  listViewModel: treeModel
               });
               treeModel.setExpandedItems([1]);
               eip._editingItem = treeModel.at(1)
                  .getContents();
               eip._setEditingItemData(treeModel.at(1)
                  .getContents(), eip._options.listViewModel, eip._options);
               eip.editNextRow();
            });

            it('Enter inside a second folder', function() {
               eip.beginEdit = function(options) {
                  assert.equal(options.item, treeModel.at(6)
                     .getContents());
               };
               eip.commitEdit = function() {
                  throw new Error('commitEdit shouldn\'t be called.');
               };
               Object.assign(eip._options, {
                  listViewModel: treeModel
               });
               treeModel.setExpandedItems([1, 2]);
               eip._editingItem = treeModel.at(5)
                  .getContents();
               eip._setEditingItemData(treeModel.at(5)
                  .getContents(), eip._options.listViewModel, eip._options);
               eip.editNextRow();
            });

            it('Enter on last item inside a folder', function(done) {
               eip.commitEdit = function() {
                  done();
               };
               eip.beginEdit = function() {
                  throw new Error('beginEdit shouldn\'t be called');
               };
               eip.beginAdd = function() {
                  throw new Error('beginAdd shouldn\'t be called');
               };
               Object.assign(eip._options, {
                  listViewModel: treeModel
               });
               treeModel.setExpandedItems([1]);
               eip._editingItem = treeModel.at(3)
                  .getContents();
               eip._setEditingItemData(treeModel.at(3)
                  .getContents(), eip._options.listViewModel, eip._options);
               eip.editNextRow();
            });

            it('Enter on last item inside a folder, autoAdd', function(done) {
               eip.beginAdd = function() {
                  done();
               };
               Object.assign(eip._options, {
                  listViewModel: treeModel,
                  editingConfig: {
                     autoAdd: true
                  }
               });
               treeModel.setExpandedItems([1]);
               eip._sequentialEditing = true;
               eip._editingItem = treeModel.at(3)
                  .getContents();
               eip._setEditingItemData(treeModel.at(3)
                  .getContents(), eip._options.listViewModel, eip._options);
               eip.editNextRow();
            });

            it('Enter inside a folder, sequentialEditing: false', function(done) {
               eip.commitEdit = function() {
                  done();
               };
               eip.beginEdit = function() {
                  throw new Error('beginEdit shouldn\'t be called');
               };
               eip.beginAdd = function() {
                  throw new Error('beginAdd shouldn\'t be called');
               };
               Object.assign(eip._options, {
                  listViewModel: treeModel,
                  editingConfig: {
                     sequentialEditing: false
                  }
               });
               treeModel.setExpandedItems([1]);
               eip._editingItem = treeModel.at(1)
                  .getContents();
               eip._setEditingItemData(treeModel.at(1)
                  .getContents(), eip._options.listViewModel, eip._options);
               eip.editNextRow({
                  stopPropagation: function() {
                  }
               }, {
                  keyCode: 13,
                  stopPropagation: function() {
                  }
               });
            });

            it('Tab inside a folder', function(done) {
               eip.beginEdit = function(options) {
                  assert.equal(options.item, treeModel.at(2)
                     .getContents());
                  done();
               };
               Object.assign(eip._options, {
                  listViewModel: treeModel
               });
               treeModel.setExpandedItems([1]);
               eip._editingItem = treeModel.at(1)
                  .getContents();
               eip._setEditingItemData(treeModel.at(1)
                  .getContents(), eip._options.listViewModel, eip._options);
               eip.onRowDeactivated({
                  stopPropagation: function() {

                  }
               }, {
                  isTabPressed: true
               });
            });

            it('Tab on last item inside a folder', function(done) {
               eip.commitEdit = function() {
                  done();
               };
               eip.beginEdit = function() {
                  throw new Error('beginEdit shouldn\'t be called');
               };
               eip.beginAdd = function() {
                  throw new Error('beginAdd shouldn\'t be called');
               };
               Object.assign(eip._options, {
                  listViewModel: treeModel
               });
               treeModel.setExpandedItems([1]);
               eip._editingItem = treeModel.at(3)
                  .getContents();
               eip._setEditingItemData(treeModel.at(3)
                  .getContents(), eip._options.listViewModel, eip._options);
               eip.onRowDeactivated({
                  stopPropagation: function() {

                  }
               }, {
                  isTabPressed: true
               });
            });

            it('Tab on last item inside a folder, autoAdd', function(done) {
               eip.beginAdd = function() {
                  done();
               };
               Object.assign(eip._options, {
                  listViewModel: treeModel,
                  editingConfig: {
                     autoAdd: true
                  }
               });
               treeModel.setExpandedItems([1]);
               eip._editingItem = treeModel.at(3)
                  .getContents();
               eip._setEditingItemData(treeModel.at(3)
                  .getContents(), eip._options.listViewModel, eip._options);
               eip.onRowDeactivated({
                  stopPropagation: function() {

                  }
               }, {
                  isTabPressed: true
               });
            });

            it('Shift+Tab inside a folder', function(done) {
               eip.beginEdit = function(options) {
                  assert.equal(options.item, eip._options.listViewModel.at(1)
                     .getContents());
                  done();
               };
               Object.assign(eip._options, {
                  listViewModel: treeModel
               });
               treeModel.setExpandedItems([1]);
               eip._editingItem = treeModel.at(2)
                  .getContents();
               eip._setEditingItemData(treeModel.at(2)
                  .getContents(), eip._options.listViewModel, eip._options);
               eip.onRowDeactivated({
                  stopPropagation: function() {

                  }
               }, {
                  isTabPressed: true,
                  isShiftKey: true
               });
            });
         });
      });

      describe('onItemClick', function() {
         it('clickItemInfo', async function() {
            var
               clickPropagationStopped = false;
            eip.beginEdit = function() {
               return Deferred.success({});
            };
            Object.assign(eip._options, {
               editingConfig: {
                  editOnClick: true
               }
            });
            await eip.beginEditByClick({
               stopPropagation: function() {
                  clickPropagationStopped = true;
               }
            }, newItem, {
               target: {
                  closest: function() {
                     return false;
                  }
               },
               nativeEvent: {
                  clientX: 10,
                  clientY: 20
               },
               type: 'click'
            });
            assert.equal(eip._clickItemInfo.item, newItem);
            assert.equal(eip._clickItemInfo.clientX, 10);
            assert.equal(eip._clickItemInfo.clientY, 20);
         });

         it('clickItemInfo with editing canceled', function() {
            var
               clickPropagationStopped = false;
            eip.beginEdit = function() {
               return Deferred.success({ cancelled: true });
            };
            Object.assign(eip._options, {
               editingConfig: {
                  editOnClick: true
               }
            });
            eip.beginEditByClick({
               stopPropagation: function() {
                  clickPropagationStopped = true;
               }
            }, newItem, {
               target: {
                  closest: function() {
                     return false;
                  }
               },
               nativeEvent: {
                  clientX: 10,
                  clientY: 20
               },
               type: 'click'
            });
            assert.equal(null, eip._clickItemInfo);
         });

         it('editOnClick: true, notEditable element', function(done) {
            eip.commitEdit = function() {
               done();
            };
            Object.assign(eip._options, {
               editingConfig: {
                  editOnClick: true
               }
            });

            eip.beginEditByClick({}, newItem, {
               target: {
                  closest: function() {
                     return true;
                  }
               },
               nativeEvent: {
                  clientX: 0,
                  clientY: 0
               },
               type: 'click'
            });
         });

         it('editOnClick: true', function(done) {
            eip.beginEdit = function(options) {
               assert.equal(options.item, newItem);
               done();
            };
            Object.assign(eip._options, {
               editingConfig: {
                  editOnClick: true
               }
            });

            eip.beginEditByClick({}, newItem, {
               target: {
                  closest: function() {
                     return false;
                  }
               },
               nativeEvent: {
                  clientX: 0,
                  clientY: 0
               },
               type: 'click'
            });
         });

         it('editOnClick: false', function() {
            eip.beginEdit = function() {
               throw new Error('beginEdit shouldn\'t be called if editOnClick is false');
            };
            eip.beginEditByClick({}, newItem);
         });

         it('readOnly, commitEdit', function() {
            eip.commitEdit = function() {
               throw new Error('commitEdit shouldn\'t be called if EditInPlace is readOnly');
            };
            Object.assign(eip._options, {
               editingConfig: {
                  editOnClick: true
               },
               readOnly: true
            });

            eip.beginEditByClick({}, newItem, {
               target: {
                  closest: function() {
                     return true;
                  }
               },
               nativeEvent: {
                  clientX: 0,
                  clientY: 0
               },
               type: 'click'
            });
         });

         it('readOnly, beginEdit', function() {
            eip.beginEdit = function() {
               throw new Error('beginEdit shouldn\'t be called if EditInPlace is readOnly');
            };
            Object.assign(eip._options, {
               editingConfig: {
                  editOnClick: true
               },
               readOnly: true
            });

            eip.beginEditByClick({}, newItem, {
               target: {
                  closest: function() {
                     return false;
                  }
               },
               nativeEvent: {
                  clientX: 0,
                  clientY: 0
               },
               type: 'click'
            });
         });
      });

      describe('editing list in popup', function() {
         const failedValidationFormController = {
            submit: function() {
               return Deferred.success({
                  0: [{
                     0: 'Поле обязательно для заполнения'
                  }]
               });
            }
         };

         const successValidationFormController = {
            submit: function() {
               return Deferred.success({});
            }
         };

         it('dont close popup if validation failed', async function() {
            Object.assign(eip._options, {
               listViewModel: listViewModel
            });

            await eip.beginAdd({
               item: newItem
            });

            eip._formController = failedValidationFormController;
            eip._editingItem.isChanged = () => true;

            // Emulate closing popup. It will call _formOperationHandler;
            let result = new Deferred();
            eip._formOperationHandler(undefined, result);

            assert.isFalse(result.isReady());
         });
      });

      describe('commitAndMoveNextRow (commitEdit by itemAction click)', () => {
         it('commit edit existing record without autoAddByApplyButton', async function() {
            Object.assign(eip._options, {
               listViewModel: listViewModel,
            });
            await eip.beginEdit({
               item: listViewModel.at(0)
                  .getContents()
            });
            assert.isNotNull(eip._editingItemData);
            await (new Promise((resolve) => {
               eip.commitAndMoveNextRow();
               setTimeout(resolve, 10);
            }));
            assert.isNull(eip._editingItemData);
         });

         it('commit edit existing record with autoAddByApplyButton', async function() {
            Object.assign(eip._options, {
               listViewModel: listViewModel,
               editingConfig: {
                  autoAddByApplyButton: true
               }
            });
            await eip.beginEdit({
               item: listViewModel.at(0)
                  .getContents()
            });
            assert.isNotNull(eip._editingItemData);
            await (new Promise((resolve) => {
               eip.commitAndMoveNextRow();
               setTimeout(resolve, 10);
            }));
            assert.isNull(eip._editingItemData);
         });

         it('commit edit new record without autoAddByApplyButton', async function() {
            Object.assign(eip._options, {
               listViewModel: listViewModel,
               source
            });
            await eip.beginAdd({
               item: newItem
            });
            assert.isNotNull(eip._editingItemData);
            await (new Promise((resolve) => {
               eip.commitAndMoveNextRow();
               setTimeout(resolve, 10);
            }));
            assert.isNull(eip._editingItemData);
         });

         it('commit edit new record with autoAddByApplyButton', async function() {
            Object.assign(eip._options, {
               listViewModel: listViewModel,
               source,
               editingConfig: {
                  autoAddByApplyButton: true
               }
            });
            await eip.beginAdd({
               item: newItem
            });
            assert.isNotNull(eip._editingItemData);
            await (new Promise((resolve) => {
               eip.commitAndMoveNextRow();
               setTimeout(resolve, 10);
            }));
            assert.isNotNull(eip._editingItemData);
            assert.equal(eip._editingItemData.index, 4);
            assert.isTrue(eip._editingItemData.item !== newItem);
         });
      });

      describe('updateEditingData', function() {
         it('editingConfig has sequential editing', function() {
            eip.updateEditingData({
               editingConfig: {
                  sequentialEditing: false
               }
            });
            assert.isFalse(eip._sequentialEditing);
            eip.updateEditingData({
               editingConfig: {
                  sequentialEditing: true
               }
            });
            assert.isTrue(eip._sequentialEditing);
         });

         it('editingConfig doesn\'t have sequential editing', function() {
            eip.updateEditingData({
               editingConfig: {}
            });
            assert.isTrue(eip._sequentialEditing);
         });

         it('editing config doesn\'t exist', function() {
            eip.updateEditingData({});
            assert.isTrue(eip._sequentialEditing);
         });

         it('multiSelectVisibility on list has been changed while editing', async function() {
            let
               isItemDataRegenerated = false;

            Object.assign(eip._options, {
               listViewModel: listViewModel,
               source: source,
               multiSelectVisibility: 'hidden'
            });

            await eip.beginAdd();

            eip._setEditingItemData = (editingItem) => {
               isItemDataRegenerated = true;
               assert.equal(editingItem, eip._editingItemData.item);
               assert.equal(eip._options.multiSelectVisibility, 'visible');
            };
            eip.updateEditingData({
               multiSelectVisibility: 'visible',
               listViewModel: listViewModel
            });
            assert.isTrue(isItemDataRegenerated);
         });

         it('should suscribe onCollectionChange once', async() => {
            let
               isItemDataRegenerated = false;

            Object.assign(eip._options, {
               listViewModel: listViewModel,
               source: source,
               multiSelectVisibility: 'visible'
            });

            await eip.beginAdd();

            eip._editingItemData = Object.assign({}, eip._editingItemData);

            let spy = sinon.spy(listViewModel, 'subscribe');

            eip.updateEditingData({
               listViewModel: listViewModel,
               multiSelectVisibility: 'visible'
            });
            eip.updateEditingData({
               listViewModel: listViewModel,
               multiSelectVisibility: 'visible'
            });

            assert.isTrue(spy.calledOnceWith('onCollectionChange', eip._updateIndex));
         });

         it('should suscribe updateEditingData once', async() => {
            Object.assign(eip._options, {
               listViewModel: listViewModel,
               source: source
            });

            await eip.beginAdd();

            eip._editingItemData = Object.assign({}, eip._editingItemData);
            let spy = sinon.spy(eip, 'registerFormOperation');
            eip._options.readOnly = true;
            eip.updateEditingData({ listViewModel: listViewModel });

            assert.isTrue(spy.notCalled);
         });

         it('should reset editing data if readoonly', async(done) => {
            sinon.stub(eip, '_setEditingItemData')
               .callsFake(() => {
                  done();
               });
            eip._editingItemData = {};
            eip.updateEditingData({
               readOnly: true
            });
         });
      });

      it('property change of an editing item should reset validation', function() {
         var setValidationResultCalled = false;
         Object.assign(eip._options, {
            listViewModel: listViewModel
         });
         eip._formController = {
            setValidationResult: function() {
               setValidationResultCalled = true;
            },
            deferSubmit: function() {
               return this.submit();
            },
            submit: function() {
               return Deferred.success();
            }
         };
         return eip.beginEdit({
            item: listViewModel.at(0)
               .getContents()
         })
            .then(() => {
               eip._editingItem.set('title', 'test');
               assert.isTrue(setValidationResultCalled);
            });

      });

      it('index of a new item should update if the list gets changed', async function() {
         Object.assign(eip._options, {
            listViewModel: listViewModel,
            source: source
         });

         await eip.beginAdd();
         assert.equal(eip._editingItemData.index, 3);
         listViewModel._items.append([new entity.Record({
            rawData: {
               id: 4,
               title: 'test'
            }
         })]);
         assert.equal(eip._editingItemData.index, 4);
      });

      describe('_private block', function() {
         it('hasParentInItems', function() {
            Object.assign(eip._options, {
               listViewModel: listViewModel
            });

            assert.isFalse(EditInPlace._private.hasParentInItems({}, listViewModel));
         });
      });

      describe('.processBeforeBeginEditResult()', () => {
         it('should return result cancelled', async() => {
            const eventResult = Promise.resolve('Cancel');
            const result = await EditInPlace._private.processBeforeBeginEditResult(eip, {}, eventResult, false);
            assert.deepEqual({ cancelled: true }, result);
         });

         it('should return result cancelled when event result throw catch', async() => {
            const eventResult = Promise.reject(new Error('!!!!'));
            const result = await EditInPlace._private.processBeforeBeginEditResult(eip, {}, eventResult, false);
            assert.deepEqual({ cancelled: true }, result);
         });
      });

      describe('.registerFormOperation()', () => {
         const formController = {};
         it('should set form controller', async() => {
            eip.registerFormOperation(formController);

            assert.equal(eip._formController, formController);
         });

         it('should notify registerFormOperation', async() => {
            const spyNotify = sinon.spy(eip, '_notify');
            eip.registerFormOperation(formController);

            assert.equal(spyNotify.firstCall.args[0], 'registerFormOperation');
         });

         it('should do nothing if formController was undefined', async() => {
            eip._formController = formController;
            eip.registerFormOperation();

            assert.equal(eip._formController, formController);
         });
      });

      it('multi call showIndicator. Should be shown only one indicator', () => {
         const globalIndicatorId = 123;
         let showCount = 0;
         let hideCount = 0;

         eip._notify = (eName, args) => {
            if (eName === 'showIndicator') {
               showCount++;
               return globalIndicatorId;
            } else if (eName === 'hideIndicator') {
               hideCount++;
               assert.equal(args[0], globalIndicatorId);
            }
         };

         eip._showIndicator();
         eip._showIndicator();

         eip._hideIndicator();
         eip._hideIndicator();

         assert.equal(1, showCount);
         assert.equal(1, hideCount);
      });

      describe('.processError()', () => {
         it('should show error', (done) => {
            eip._errorController = {
               process: () => Promise.resolve({})
            };
            eip._errorContainer = {
               show: () => {done()}
            };
            let error = new Error();
            EditInPlace._private.processError(eip, error).catch(() => undefined);
         });
      });

   });



});
