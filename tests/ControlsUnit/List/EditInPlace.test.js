define([
   'Controls/_list/EditInPlace',
   'Types/collection',
   'Types/entity',
   'Core/Deferred',
   'Types/source',
   'Controls/list',
   'Controls/treeGrid',
   'Controls/Constants'
], function(
   EditInPlace,
   collection,
   entity,
   Deferred,
   sourceLib,
   lists,
   treeGrid,
   Constants
) {
   describe('Controls.List.EditInPlace', function() {
      var eip, items, newItem, listModel, listModelWithGroups, data, treeData, treeModel;
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
         listModel = new lists.ListViewModel({
            items: items.clone(),
            keyProperty: 'id',
            displayProperty: 'title'
         });
         treeModel = new treeGrid.TreeViewModel({
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
         listModelWithGroups = new lists.ListViewModel({
            items: items.clone(),
            keyProperty: 'id',
            displayProperty: 'title',
            groupingKeyCallback: function(item) {
               return item.get('type');
            }
         });
         eip = new EditInPlace();
         eip._children = {
            formController: {
               submit: function() {
                  return Deferred.success();
               },
               setValidationResult: function() {
                  return;
               }
            }
         };
      });

      afterEach(function() {
         eip.destroy();
         listModel.destroy();
         listModelWithGroups.destroy();
         eip = undefined;
         listModel = undefined;
         listModelWithGroups = undefined;
         newItem = undefined;
         items = undefined;
      });

      describe('_beforeMount', function() {
         it('Edit', function() {
            eip._beforeMount({
               listModel: listModel,
               editingConfig: {
                  item: listModel.at(0).getContents()
               }
            });
            assert.equal(listModel.at(0).getContents(), eip._editingItem);
            assert.equal(listModel.at(0).getContents(), eip._originalItem);
         });

         it('Add', function() {
            eip._beforeMount({
               listModel: listModel,
               editingConfig: {
                  item: newItem,
                  toolbarVisibility: true
               }
            });
            assert.equal(newItem, eip._editingItem);
            assert.isTrue(eip._isAdd);
            assert.isTrue(eip._editingItemData.drawActions);
         });

         it('Adding to the top of the list', function() {
            eip._beforeMount({
               listModel: listModel,
               editingConfig: {
                  item: newItem,
                  addPosition: 'top'
               }
            });
            assert.equal(newItem, eip._editingItem);
            assert.isTrue(eip._isAdd);
            assert.equal(0, eip._editingItemData.index);
         });
      });

      describe('beginEdit', function() {
         it('Cancel', function() {
            eip._notify = function(e) {
               if (e === 'beforeBeginEdit') {
                  return Constants.editing.CANCEL;
               }
            };

            eip.saveOptions({
               listModel: listModel
            });

            var result = eip.beginEdit({
               item: listModel.at(0).getContents()
            });
            assert.isTrue(result.isSuccessful());
         });

         it('Without handler', function() {
            eip.saveOptions({
               listModel: listModel
            });

            eip.beginEdit({
               item: listModel.at(0).getContents()
            });
            assert.isTrue(listModel.at(0).getContents().isEqual(eip._editingItem));
            assert.equal(listModel.at(0).getContents(), eip._originalItem);
         });

         it('Without changes', async function() {
            var validateCalled;
            eip.saveOptions({
               listModel: listModel
            });
            eip._children = {
               formController: {
                  submit: function() {
                     validateCalled = true;
                     return Deferred.success();
                  }
               }
            };
            await eip.beginEdit({
               item: listModel.at(0).getContents()
            });
            validateCalled = false;
            await eip.beginEdit({
               item: listModel.at(1).getContents()
            });
            assert.isFalse(validateCalled);
            eip._editingItem.set('title', 'test');
            await eip.beginEdit({
               item: listModel.at(2).getContents()
            });
            assert.isTrue(validateCalled);
         });

         it('Deferred', function() {
            eip._notify = function(e) {
               if (e === 'beforeBeginEdit') {
                  return Deferred.success({
                     item: listModel.at(1).getContents()
                  });
               }
            };

            eip.saveOptions({
               listModel: listModel
            });

            eip.beginEdit({
               item: listModel.at(0).getContents()
            });
            assert.isTrue(listModel.at(1).getContents().isEqual(eip._editingItem));
            assert.equal(listModel.at(0).getContents(), eip._originalItem);
         });

         it('Record', function() {
            eip._notify = function(e) {
               if (e === 'beforeBeginEdit') {
                  return {
                     item: listModel.at(1).getContents()
                  };
               }
            };

            eip.saveOptions({
               listModel: listModel
            });

            eip.beginEdit({
               item: listModel.at(0).getContents()
            });
            assert.isTrue(listModel.at(1).getContents().isEqual(eip._editingItem));
            assert.equal(listModel.at(0).getContents(), eip._originalItem);
         });

         it('afterBeginEdit', function(done) {
            var source = new sourceLib.Memory({
               keyProperty: 'id',
               data: items
            });
            let afterBeginEditNotified = false;
            eip.saveOptions({
               listModel: listModel,
               source: source
            });
            eip._setEditingItemData = function() {
               assert.isFalse(afterBeginEditNotified);
            };
            eip._notify = function(event, args) {
               if (event === 'afterBeginEdit') {
                  assert.equal(eip._editingItem, args[0]);
                  assert.isNotOk(args[1]);
                  done();
                  afterBeginEditNotified = true;
               }
            };

            eip.beginEdit({
               item: listModel.at(0).getContents()
            });
         });

         it('beginEdit always returns Promise', function() {
            eip._notify = function(e) {
               if (e === 'beforeBeginEdit') {
                  return {
                     item: listModel.at(1).getContents()
                  };
               }
            };

            eip.saveOptions({
               listModel: listModel
            });

            eip.beginEdit({
               item: listModel.at(0).getContents()
            });
            assert.isTrue(listModel.at(1).getContents().isEqual(eip._editingItem));
            assert.equal(listModel.at(0).getContents(), eip._originalItem);

            // This item edit already editing, so begin edit canceled
            const result = eip.beginEdit({
               item: listModel.at(0).getContents()
            });

            assert.isTrue(result instanceof Promise);
         });
      });

      describe('beginAdd', function() {
         it('new item should not take itemActions from existing items', async function() {
            var source = new sourceLib.Memory({
               keyProperty: 'id',
               data: items
            });

            eip.saveOptions({
               listModel: listModel,
               source: source
            });

            listModel.setItemActions(listModel.at(0).getContents(), [{
               id: 0,
               title: 'Удалить'
            }]);

            await eip.beginAdd();
            assert.isUndefined(eip._editingItemData.itemActions);
         });

         it('Without handler', function(done) {
            var source = new sourceLib.Memory({
               keyProperty: 'id',
               data: items
            });

            eip.saveOptions({
               listModel: listModel,
               source: source
            });

            eip.beginAdd().addCallback(function() {
               assert.instanceOf(eip._editingItem, entity.Model);
               assert.isTrue(eip._isAdd);
               done();
            });
         });

         it('Empty list', function(done) {
            listModel.setItems(new collection.RecordSet({
               rawData: [],
               keyProperty: 'id'
            }));
            var source = new sourceLib.Memory({
               keyProperty: 'id',
               data: listModel._items
            });

            eip.saveOptions({
               listModel: listModel,
               source: source
            });

            eip.beginAdd().addCallback(function() {
               assert.instanceOf(eip._editingItem, entity.Model);
               assert.equal(eip._editingItemData.index, 0);
               assert.isTrue(eip._isAdd);
               done();
            });
         });

         it('Object without item', function(done) {
            var source = new sourceLib.Memory({
               keyProperty: 'id',
               data: items
            });
            eip._notify = function(e) {
               if (e === 'beforeBeginEdit') {
                  return {
                     addPosition: 'bottom'
                  };
               }
            };

            eip.saveOptions({
               listModel: listModel,
               source: source
            });

            eip.beginAdd().addCallback(function() {
               assert.instanceOf(eip._editingItem, entity.Model);
               assert.isTrue(eip._isAdd);
               done();
            });
         });

         it('afterBeginEdit', function(done) {
            var source = new sourceLib.Memory({
               keyProperty: 'id',
               data: items
            });

            eip.saveOptions({
               listModel: listModel,
               source: source
            });

            eip._notify = function(event, args) {
               if (event === 'afterBeginEdit') {
                  assert.equal(eip._editingItem, args[0]);
                  assert.isTrue(args[1]);
                  done();
               }
            };

            eip.beginAdd({
               item: newItem
            });
         });

         it('add item to a folder', function(done) {
            var source = new sourceLib.Memory({
               keyProperty: 'id',
               data: treeModel._items
            });

            eip.saveOptions({
               listModel: treeModel,
               source: source
            });
            treeModel.setExpandedItems([1]);

            source.create().addCallback(function(model) {
               model.set('parent', 1);
               model.set('parent@', false);
               eip.beginAdd({
                  item: model
               }).addCallback(function() {
                  assert.instanceOf(eip._editingItem, entity.Model);
                  assert.isTrue(eip._isAdd);
                  assert.equal(2, eip._editingItemData.level);
                  done();
               });
            });
         });

         it('add item to the top of the list', function(done) {
            var source = new sourceLib.Memory({
               keyProperty: 'id',
               data: items
            });

            eip.saveOptions({
               listModel: listModel,
               source: source,
               editingConfig: {
                  addPosition: 'top'
               }
            });

            eip.beginAdd().addCallback(function() {
               assert.instanceOf(eip._editingItem, entity.Model);
               assert.equal(eip._editingItemData.index, 0);
               assert.isTrue(eip._isAdd);
               done();
            });
         });

         it('add item to a folder to the top of the list', function(done) {
            var source = new sourceLib.Memory({
               keyProperty: 'id',
               data: treeModel._items
            });

            eip.saveOptions({
               listModel: treeModel,
               source: source,
               editingConfig: {
                  addPosition: 'top'
               }
            });
            treeModel.setExpandedItems([1]);

            source.create().addCallback(function(model) {
               model.set('parent', 1);
               model.set('parent@', false);
               eip.beginAdd({
                  item: model
               }).addCallback(function() {
                  assert.instanceOf(eip._editingItem, entity.Model);
                  assert.isTrue(eip._isAdd);
                  assert.equal(1, eip._editingItemData.index);
                  done();
               });
            });
         });

         it('add item to the top of the grouped list', async function() {
            var source = new sourceLib.Memory({
               keyProperty: 'id',
               data: items
            });

            eip.saveOptions({
               listModel: listModelWithGroups,
               source: source,
               editingConfig: {
                  addPosition: 'top'
               }
            });

            await eip.beginAdd({ item: newItem });
            assert.equal(eip._editingItemData.index, 0); // First item of list
            await eip.cancelEdit();

            newItem.set('type', 'goods');
            await eip.beginAdd({ item: newItem });
            assert.equal(eip._editingItemData.index, 1);
            await eip.cancelEdit();

            newItem.set('type', 'services');
            await eip.beginAdd({ item: newItem });
            assert.equal(eip._editingItemData.index, 4);
            await eip.cancelEdit();
         });

         it('add item to the bottom of the grouped list', async function() {
            var source = new sourceLib.Memory({
               keyProperty: 'id',
               data: items
            });

            eip.saveOptions({
               listModel: listModelWithGroups,
               source: source,
               editingConfig: {
                  addPosition: 'bottom'
               }
            });

            await eip.beginAdd({ item: newItem });
            assert.equal(eip._editingItemData.index, 4);
            await eip.cancelEdit();

            newItem.set('type', 'goods');
            await eip.beginAdd({ item: newItem });
            assert.equal(eip._editingItemData.index, 2);
            await eip.cancelEdit();

            newItem.set('type', 'services');
            await eip.beginAdd({ item: newItem });
            assert.equal(eip._editingItemData.index, 4);
            await eip.cancelEdit();
         });
      });

      describe('commitEdit', function() {
         it('Without editing item', function() {
            eip.saveOptions({
               listModel: listModel
            });

            var result = eip.commitEdit();
            assert.isTrue(result.isSuccessful());
         });

         it('Without handler', function() {
            eip.saveOptions({
               listModel: listModel
            });

            eip.beginEdit({
               item: listModel.at(0).getContents()
            });
            eip._editingItem.set('title', '1234');
            var result = eip.commitEdit();
            assert.isTrue(result.isSuccessful());
            assert.equal(listModel.at(0).getContents().get('title'), '1234');
         });

         it('Cancel', function() {
            eip._notify = function(e) {
               if (e === 'beforeEndEdit') {
                  return Constants.editing.CANCEL;
               }
            };

            eip.saveOptions({
               listModel: listModel
            });

            eip.beginEdit({
               item: listModel.at(0).getContents()
            });
            var result = eip.commitEdit();

            assert.isTrue(result.isSuccessful());
         });

         it('Deferred', function() {
            eip._notify = function(e) {
               if (e === 'beforeEndEdit') {
                  return Deferred.success();
               }
            };
            eip.saveOptions({
               listModel: listModel
            });

            eip.beginEdit({
               item: listModel.at(0).getContents()
            });
            var result = eip.commitEdit();
            assert.isTrue(result.isSuccessful());
         });

          it('Two deferreds', function() {
             const deferred = new Deferred();
              eip._notify = function(e) {
                  if (e === 'beforeEndEdit') {
                      return deferred;
                  }
              };
              eip.saveOptions({
                  listModel: listModel
              });

              eip.beginEdit({
                  item: listModel.at(0).getContents()
              });
              eip.commitEdit();
              assert.isTrue(!!eip._endEditDeferred);
              var result = eip.commitEdit();
              deferred.callback();
              assert.isTrue(result.isSuccessful());
          });

         it('With source', function(done) {
            var source = new sourceLib.Memory({
               keyProperty: 'id',
               data: data
            });
            eip.saveOptions({
               listModel: listModel,
               source: source
            });

            eip.beginEdit({
               item: listModel.at(0).getContents()
            });
            eip._editingItem.set('title', '1234');
            eip.commitEdit().addCallback(function() {
               assert.equal(listModel.at(0).getContents().get('title'), '1234');
               source.read(1).addCallback(function(result) {
                  assert.equal(result.get('title'), '1234');
                  done();
               });
            });
         });

         it('Add item', function(done) {
            var source = new sourceLib.Memory({
               keyProperty: 'id',
               data: data
            });
            eip.saveOptions({
               listModel: listModel,
               source: source
            });

            eip.beginAdd({
               item: newItem
            });

            eip._editingItem.set('title', '1234');
            eip.commitEdit().addCallback(function() {
               assert.equal(listModel.at(3).getContents().get('title'), '1234');
               assert.equal(listModel.getCount(), 4);
               source.read(4).addCallback(function(result) {
                  assert.equal(result.get('title'), '1234');
                  done();
               }).addErrback(function(err) {
                  console.log(err);
               });
            });
         });

         it('Validation fail', function() {
            eip.saveOptions({
               listModel: listModel
            });

            eip.beginAdd({
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
            var result = eip.commitEdit();
            assert.isTrue(result.isSuccessful());
         });

         describe('beforeEndEdit', function() {
            it('Defered', function(done) {
               var
                   isIndicatorHasBeenShown = false,
                   isIndicatorHasBeenHiden = false,
                   isAfterEndEditHasBeenNotified = false;

               eip._notify = function(e) {
                  if (e === 'beforeEndEdit') {
                     return Deferred.success({});
                  } else if (e === 'afterEndEdit') {
                     isAfterEndEditHasBeenNotified = true;
                  } else if (e === 'showIndicator') {
                     isIndicatorHasBeenShown = true;
                  } else if (e === 'hideIndicator') {
                     isIndicatorHasBeenHiden = true;
                  }
               };

               eip.saveOptions({
                  listModel: listModel
               });

               eip.beginEdit({
                  item: listModel.at(0).getContents()
               });

               eip.cancelEdit().addCallback(function (result) {
                  assert.deepEqual(result, {});
                  assert.isTrue(isIndicatorHasBeenShown);
                  assert.isTrue(isIndicatorHasBeenHiden);
                  assert.isTrue(isAfterEndEditHasBeenNotified);
                  done();
               });

            });

            it('Defered with cancel', function (done) {
               var
                   isIndicatorHasBeenShown = false,
                   isIndicatorHasBeenHiden = false,
                   isAfterEndEditHasBeenNotified = false;

               eip._notify = function (e) {
                  if (e === 'beforeEndEdit') {
                     return Deferred.success(Constants.editing.CANCEL);
                  } else if (e === 'afterEndEdit') {
                     isAfterEndEditHasBeenNotified = true;
                  } else if (e === 'showIndicator') {
                     isIndicatorHasBeenShown = true;
                  } else if (e === 'hideIndicator') {
                     isIndicatorHasBeenHiden = true;
                  }
               };

               eip.saveOptions({
                  listModel: listModel
               });

               eip.beginEdit({
                  item: listModel.at(0).getContents()
               });

               eip.cancelEdit().addCallback(function (result) {
                  assert.deepEqual(result, {cancelled: true});
                  assert.isTrue(isIndicatorHasBeenShown);
                  assert.isTrue(isIndicatorHasBeenHiden);
                  assert.isFalse(isAfterEndEditHasBeenNotified);
                  done();
               });

            });

            it('Defered with errback', (done) => {
               let
                   isIndicatorHasBeenShown = false,
                   isIndicatorHasBeenHidden = false,
                   isAfterEndEditHasBeenNotified = false;

               eip._notify = (e) => {
                  if (e === 'beforeEndEdit') {
                     return Deferred.success().addCallback(() => {
                        return (new Deferred()).errback();
                     });
                  } else if (e === 'afterEndEdit') {
                     isAfterEndEditHasBeenNotified = true;
                  } else if (e === 'showIndicator') {
                     isIndicatorHasBeenShown = true;
                  } else if (e === 'hideIndicator') {
                     isIndicatorHasBeenHidden = true;
                  }
               };

               eip.saveOptions({
                  listModel: listModel
               });

               eip.beginEdit({
                  item: listModel.at(0).getContents()
               });

               eip.cancelEdit().addErrback(function () {
                  assert.isTrue(isIndicatorHasBeenShown);
                  assert.isTrue(isIndicatorHasBeenHidden);
                  assert.isTrue(isAfterEndEditHasBeenNotified);
                  done();
               });

            });

            it('Cancel', function(done) {
               var
                   source = new sourceLib.Memory({
                      keyProperty: 'id',
                      data: data
                   }),
                   isIndicatorHasBeenShown = false,
                   isIndicatorHasBeenHiden = false;

               eip._notify = function(e) {
                  if (e === 'beforeEndEdit') {
                     return Constants.editing.CANCEL;
                  } else if (e === 'showIndicator') {
                     isIndicatorHasBeenShown = true;
                  } else if (e === 'hideIndicator') {
                     isIndicatorHasBeenHiden = true;
                  }
               };

               eip.saveOptions({
                  listModel: listModel
               });

               eip.beginEdit({
                  item: listModel.at(0).getContents()
               });

               eip.cancelEdit().addCallback(function (result) {
                  assert.deepEqual(result, {cancelled: true});
                  assert.isFalse(isIndicatorHasBeenShown);
                  assert.isFalse(isIndicatorHasBeenHiden);
                  done();
               });

            });

         });

         describe('afterEndEdit', function() {
            it('add item', function(done) {
               var source = new sourceLib.Memory({
                  keyProperty: 'id',
                  data: data
               });
               eip.saveOptions({
                  listModel: listModel,
                  source: source
               });

               eip.beginAdd({
                  item: newItem
               });

               eip._editingItem.set('title', '1234');

               eip._notify = function(event, args) {
                  if (event === 'afterEndEdit') {
                     assert.equal(eip._editingItem, args[0]);
                     assert.isTrue(args[1]);
                     done();
                  }
               };
               eip.commitEdit();
            });

            it('edit item', function(done) {
               var source = new sourceLib.Memory({
                  keyProperty: 'id',
                  data: data
               });
               eip.saveOptions({
                  listModel: listModel,
                  source: source
               });

               eip.beginEdit({
                  item: listModel.at(0).getContents()
               });

               eip._editingItem.set('title', '1234');

               eip._notify = function(event, args) {
                  if (event === 'afterEndEdit') {
                     assert.equal(listModel.at(0).getContents(), args[0]);
                     assert.isNotOk(args[1]);
                     done();
                  }
               };
               eip.commitEdit();
            });
         });
      });

      describe('cancelEdit', function() {
         it('Without editing item', function() {
            eip.saveOptions({
               listModel: listModel
            });

            var result = eip.cancelEdit();
            assert.isTrue(result.isSuccessful());
         });

         it('With item', function() {
            eip.saveOptions({
               listModel: listModel
            });

            eip.beginEdit({
               item: listModel.at(0).getContents()
            });
            eip._editingItem.set('title', '1234');
            var result = eip.cancelEdit();
            assert.isTrue(result.isSuccessful());
            assert.equal(listModel.at(0).getContents().get('title'), 'Первый');
         });
      });

      describe('_onKeyDown', function() {
         it('Enter', function() {
            eip.beginEdit = function(options) {
               assert.equal(options.item, listModel.at(1).getContents());
            };
            eip.saveOptions({
               listModel: listModel
            });
            eip._editingItem = listModel.at(0).getContents();
            eip._setEditingItemData(listModel.at(0).getContents(), eip._options.listModel, eip._options);
            eip._onKeyDown({}, {
               keyCode: 13,
               stopPropagation: function() {}
            });
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
            eip.saveOptions({
               listModel: listModel
            });
            eip._editingItem = listModel.at(2).getContents();
            eip._setEditingItemData(listModel.at(2).getContents(), eip._options.listModel, eip._options);
            eip._onKeyDown({}, {
               keyCode: 13,
               stopPropagation: function() {}
            });
         });

         it('Enter on last item, autoAdd', function(done) {
            eip.beginAdd = function() {
               done();
            };
            eip.saveOptions({
               listModel: listModel,
               editingConfig: {
                  autoAdd: true
               }
            });
            eip._sequentialEditing = true;
            eip._editingItem = listModel.at(2).getContents();
            eip._setEditingItemData(listModel.at(2).getContents(), eip._options.listModel, eip._options);
            eip._onKeyDown({}, {
               keyCode: 13,
               stopPropagation: function() {}
            });
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
            eip.saveOptions({
               listModel: listModel,
               editingConfig: {
                  sequentialEditing: false
               }
            });
            eip._editingItem = listModel.at(0).getContents();
            eip._setEditingItemData(listModel.at(0).getContents(), eip._options.listModel, eip._options);
            eip._onKeyDown({}, {
               keyCode: 13,
               stopPropagation: function() {}
            });
         });

         it('Esc', function(done) {
            eip.cancelEdit = function() {
               done();
            };
            eip.saveOptions({
               listModel: listModel,
               editingConfig: {
                  sequentialEditing: false
               }
            });
            eip._editingItem = listModel.at(0).getContents();
            eip._setEditingItemData(listModel.at(0).getContents(), eip._options.listModel, eip._options);
            eip._onKeyDown({}, {
               keyCode: 27,
               stopPropagation: function() {}
            });
         });

         it('Tab', function(done) {
            eip.beginEdit = function(options) {
               assert.equal(options.item, listModel.at(1).getContents());
               done();
            };
            eip.saveOptions({
               listModel: listModel
            });
            eip._editingItem = listModel.at(0).getContents();
            eip._setEditingItemData(listModel.at(0).getContents(), eip._options.listModel, eip._options);
            eip._onRowDeactivated({
               stopPropagation: function() {

               }
            }, {
               isTabPressed: true
            });
         });

         it('Tab but next item is a group', function(done) {
            eip.beginEdit = function(options) {
               assert.equal(options.item, listModelWithGroups.at(4).getContents());
               done();
            };
            eip.saveOptions({
               listModel: listModelWithGroups
            });
            eip._editingItem = listModelWithGroups.at(2).getContents();
            eip._setEditingItemData(listModelWithGroups.at(2).getContents(), eip._options.listModel, eip._options);
            eip._onRowDeactivated({
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
            eip.saveOptions({
               listModel: listModel
            });
            eip._editingItem = listModel.at(2).getContents();
            eip._setEditingItemData(listModel.at(2).getContents(), eip._options.listModel, eip._options);
            eip._onRowDeactivated({
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
            eip.saveOptions({
               listModel: listModelWithGroups
            });
            listModelWithGroups.toggleGroup('services');
            listModelWithGroups.toggleGroup('whatever');
            eip._editingItem = listModelWithGroups.at(2).getContents();
            eip._setEditingItemData(listModelWithGroups.at(2).getContents(), eip._options.listModel, eip._options);
            eip._onRowDeactivated({
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
            eip.saveOptions({
               listModel: listModel,
               editingConfig: {
                  autoAdd: true
               }
            });
            eip._editingItem = listModel.at(2).getContents();
            eip._setEditingItemData(listModel.at(2).getContents(), eip._options.listModel, eip._options);
            eip._onRowDeactivated({
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
            eip.saveOptions({
               listModel: listModelWithGroups,
               editingConfig: {
                  autoAdd: true
               }
            });
            listModelWithGroups.toggleGroup('services');
            listModelWithGroups.toggleGroup('whatever');
            eip._editingItem = listModelWithGroups.at(2).getContents();
            eip._setEditingItemData(listModelWithGroups.at(2).getContents(), eip._options.listModel, eip._options);
            eip._onRowDeactivated({
               stopPropagation: function() {

               }
            }, {
               isTabPressed: true
            });
         });

         it('Shift+Tab', function(done) {
            eip.beginEdit = function(options) {
               assert.equal(options.item, eip._options.listModel.at(0).getContents());
               done();
            };
            eip.saveOptions({
               listModel: listModel
            });
            eip._editingItem = listModel.at(1).getContents();
            eip._setEditingItemData(listModel.at(1).getContents(), eip._options.listModel, eip._options);
            eip._onRowDeactivated({
               stopPropagation: function() {

               }
            }, {
               isTabPressed: true,
               isShiftKey: true
            });
         });

         it('Shift+Tab but previous item is a group', function(done) {
            eip.beginEdit = function(options) {
               assert.equal(options.item, listModelWithGroups.at(2).getContents());
               done();
            };
            eip.saveOptions({
               listModel: listModelWithGroups
            });
            eip._editingItem = listModelWithGroups.at(4).getContents();
            eip._setEditingItemData(listModelWithGroups.at(4).getContents(), eip._options.listModel, eip._options);
            eip._onRowDeactivated({
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
            eip.saveOptions({
               listModel: listModel
            });
            eip._editingItem = listModel.at(0).getContents();
            eip._setEditingItemData(listModel.at(0).getContents(), eip._options.listModel, eip._options);
            eip._onRowDeactivated({
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
            eip.saveOptions({
               listModel: listModelWithGroups
            });
            listModelWithGroups.toggleGroup('goods');
            eip._editingItem = listModelWithGroups.at(2).getContents();
            eip._setEditingItemData(listModelWithGroups.at(2).getContents(), eip._options.listModel, eip._options);
            eip._onRowDeactivated({
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
                  assert.equal(options.item, treeModel.at(2).getContents());
               };
               eip.saveOptions({
                  listModel: treeModel
               });
               treeModel.setExpandedItems([1]);
               eip._editingItem = treeModel.at(1).getContents();
               eip._setEditingItemData(treeModel.at(1).getContents(), eip._options.listModel, eip._options);
               eip._onKeyDown({}, {
                  keyCode: 13,
                  stopPropagation: function() {}
               });
            });

            it('Enter inside a second folder', function() {
               eip.beginEdit = function(options) {
                  assert.equal(options.item, treeModel.at(6).getContents());
               };
               eip.commitEdit = function() {
                  throw new Error('commitEdit shouldn\'t be called.');
               };
               eip.saveOptions({
                  listModel: treeModel
               });
               treeModel.setExpandedItems([1, 2]);
               eip._editingItem = treeModel.at(5).getContents();
               eip._setEditingItemData(treeModel.at(5).getContents(), eip._options.listModel, eip._options);
               eip._onKeyDown({}, {
                  keyCode: 13,
                  stopPropagation: function() {}
               });
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
               eip.saveOptions({
                  listModel: treeModel
               });
               treeModel.setExpandedItems([1]);
               eip._editingItem = treeModel.at(3).getContents();
               eip._setEditingItemData(treeModel.at(3).getContents(), eip._options.listModel, eip._options);
               eip._onKeyDown({}, {
                  keyCode: 13,
                  stopPropagation: function() {}
               });
            });

            it('Enter on last item inside a folder, autoAdd', function(done) {
               eip.beginAdd = function() {
                  done();
               };
               eip.saveOptions({
                  listModel: treeModel,
                  editingConfig: {
                     autoAdd: true
                  }
               });
               treeModel.setExpandedItems([1]);
               eip._sequentialEditing = true;
               eip._editingItem = treeModel.at(3).getContents();
               eip._setEditingItemData(treeModel.at(3).getContents(), eip._options.listModel, eip._options);
               eip._onKeyDown({}, {
                  keyCode: 13,
                  stopPropagation: function() {}
               });
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
               eip.saveOptions({
                  listModel: treeModel,
                  editingConfig: {
                     sequentialEditing: false
                  }
               });
               treeModel.setExpandedItems([1]);
               eip._editingItem = treeModel.at(1).getContents();
               eip._setEditingItemData(treeModel.at(1).getContents(), eip._options.listModel, eip._options);
               eip._onKeyDown({}, {
                  keyCode: 13,
                  stopPropagation: function() {}
               });
            });

            it('Tab inside a folder', function(done) {
               eip.beginEdit = function(options) {
                  assert.equal(options.item, treeModel.at(2).getContents());
                  done();
               };
               eip.saveOptions({
                  listModel: treeModel
               });
               treeModel.setExpandedItems([1]);
               eip._editingItem = treeModel.at(1).getContents();
               eip._setEditingItemData(treeModel.at(1).getContents(), eip._options.listModel, eip._options);
               eip._onRowDeactivated({
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
               eip.saveOptions({
                  listModel: treeModel
               });
               treeModel.setExpandedItems([1]);
               eip._editingItem = treeModel.at(3).getContents();
               eip._setEditingItemData(treeModel.at(3).getContents(), eip._options.listModel, eip._options);
               eip._onRowDeactivated({
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
               eip.saveOptions({
                  listModel: treeModel,
                  editingConfig: {
                     autoAdd: true
                  }
               });
               treeModel.setExpandedItems([1]);
               eip._editingItem = treeModel.at(3).getContents();
               eip._setEditingItemData(treeModel.at(3).getContents(), eip._options.listModel, eip._options);
               eip._onRowDeactivated({
                  stopPropagation: function() {

                  }
               }, {
                  isTabPressed: true
               });
            });

            it('Shift+Tab inside a folder', function(done) {
               eip.beginEdit = function(options) {
                  assert.equal(options.item, eip._options.listModel.at(1).getContents());
                  done();
               };
               eip.saveOptions({
                  listModel: treeModel
               });
               treeModel.setExpandedItems([1]);
               eip._editingItem = treeModel.at(2).getContents();
               eip._setEditingItemData(treeModel.at(2).getContents(), eip._options.listModel, eip._options);
               eip._onRowDeactivated({
                  stopPropagation: function() {

                  }
               }, {
                  isTabPressed: true,
                  isShiftKey: true
               });
            });
         });
      });

      describe('_onItemClick', function() {
         it('clickItemInfo', function() {
            var
               clickPropagationStopped = false;
            eip.beginEdit = function() {
               return Deferred.success({});
            };
            eip.saveOptions({
               editingConfig: {
                  editOnClick: true
               }
            });
            eip._onItemClick({
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
            assert.isTrue(clickPropagationStopped);
         });

         it('clickItemInfo with editing canceled', function() {
            var
               clickPropagationStopped = false;
            eip.beginEdit = function() {
               return Deferred.success({ cancelled: true });
            };
            eip.saveOptions({
               editingConfig: {
                  editOnClick: true
               }
            });
            eip._onItemClick({
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
            assert.isTrue(clickPropagationStopped);
         });

         it('editOnClick: true, notEditable element', function(done) {
            eip.commitEdit = function() {
               done();
            };
            eip.saveOptions({
               editingConfig: {
                  editOnClick: true
               }
            });

            eip._onItemClick({}, newItem, {
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
            eip.saveOptions({
               editingConfig: {
                  editOnClick: true
               }
            });

            eip._onItemClick({}, newItem, {
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
            eip._onItemClick({}, newItem);
         });

         it('readOnly, commitEdit', function() {
            eip.commitEdit = function() {
               throw new Error('commitEdit shouldn\'t be called if EditInPlace is readOnly');
            };
            eip.saveOptions({
               editingConfig: {
                  editOnClick: true
               },
               readOnly: true
            });

            eip._onItemClick({}, newItem, {
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
            eip.saveOptions({
               editingConfig: {
                  editOnClick: true
               },
               readOnly: true
            });

            eip._onItemClick({}, newItem, {
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

      describe('editing list in popup', function () {
         const failedValidationFormController = {
            submit: function () {
               return Deferred.success({
                  0: [{
                     0: 'Поле обязательно для заполнения'
                  }]
               });
            }
         };

         const successValidationFormController = {
            submit: function () {
               return Deferred.success({});
            }
         };

         it('register and cancel pending events should bubble', function () {
            let
                isPendingStarted = false,
                isPendingCanceled = false;

            eip.saveOptions({
               listModel: listModel
            });

            eip._notify = (eName, args, params) => {
               if (eName === 'registerPending') {
                  assert.isTrue(params.bubbling);
                  isPendingStarted = true;
               }
               if (eName === 'cancelFinishingPending') {
                  assert.isTrue(params.bubbling);
                  isPendingCanceled = true;
               }
            };

            eip.beginAdd({
               item: newItem
            });

            eip._children.formController = failedValidationFormController;
            eip._editingItem.isChanged = () => true;
            // Emulate closing popup. It will call _onPendingFail;
            eip._onPendingFail(undefined, new Deferred());

            assert.isTrue(isPendingStarted);
            assert.isTrue(isPendingCanceled);
         });
         it('dont close popup if validation failed', function () {
            let
                isPendingStarted = false,
                isPendingCanceled = false;

            eip.saveOptions({
               listModel: listModel
            });

            eip._notify = (eName, args, params) => {
               if (eName === 'registerPending') {
                  assert.isTrue(params.bubbling);
                  assert.equal(args[0], eip._pendingDeferred);
                  isPendingStarted = true;
               }
               if (eName === 'cancelFinishingPending') {
                  assert.isTrue(params.bubbling);
                  isPendingCanceled = true;
               }
            };

            assert.isNull(eip._pendingDeferred);

            eip.beginAdd({
               item: newItem
            });

            assert.isTrue(eip._pendingDeferred instanceof Deferred);

            eip._children.formController = failedValidationFormController;
            eip._editingItem.isChanged = () => true;

            // Emulate closing popup. It will call _onPendingFail;
            let result = new Deferred();
            eip._onPendingFail(undefined, result);

            assert.isTrue(isPendingStarted);
            assert.isFalse(result.isReady());
            assert.isTrue(isPendingCanceled);
         });
         it('commit changes and close popup if validation passed', async function () {
            let
                isPendingStarted = false,
                isPendingCanceled = false,
                isPendingDeferredFired = false;

            eip.saveOptions({
               listModel: listModel
            });

            eip._notify = (eName, args, params) => {
               if (eName === 'registerPending') {
                  assert.isTrue(params.bubbling);
                  assert.equal(args[0], eip._pendingDeferred);
                  isPendingStarted = true;
               }
               if (eName === 'cancelFinishingPending') {
                  assert.isTrue(params.bubbling);
                  isPendingCanceled = true;
               }
            };

            assert.isNull(eip._pendingDeferred);

            await eip.beginAdd({
               item: newItem
            });

            assert.isTrue(eip._pendingDeferred instanceof Deferred);
            const nativeCallback = eip._pendingDeferred.callback;
            eip._pendingDeferred.callback = () => {
               nativeCallback.apply(eip._pendingDeferred, arguments);
               isPendingDeferredFired = true;
            };

            eip._children.formController = successValidationFormController;
            eip._editingItem.isChanged = () => true;

            // Emulate closing popup. It will call _onPendingFail;
            eip._onPendingFail(undefined, eip._pendingDeferred);

            assert.isTrue(isPendingStarted);
            assert.isTrue(!!listModel.getItemById(4));
            assert.isTrue(isPendingDeferredFired);
            assert.isNull(eip._pendingDeferred);
            assert.isFalse(isPendingCanceled);
         });
         it('unregister pending if editing has been canceled', async function () {
            let
                isPendingStarted = false,
                isPendingCanceled = false;

            eip.saveOptions({
               listModel: listModel
            });

            eip._notify = (eName, args, params) => {
               if (eName === 'registerPending') {
                  assert.isTrue(params.bubbling);
                  assert.equal(args[0], eip._pendingDeferred);
                  isPendingStarted = true;
               }
               if (eName === 'cancelFinishingPending') {
                  assert.isTrue(params.bubbling);
                  isPendingCanceled = true;
               }
            };

            assert.isNull(eip._pendingDeferred);

            await eip.beginAdd({
               item: newItem
            });

            eip._children.formController = failedValidationFormController;

            await eip.cancelEdit();

            assert.isTrue(isPendingStarted);
            assert.isFalse(isPendingCanceled);
            assert.isNull(eip._pendingDeferred);
         });
         it('cancel edit if there is no changes', function () {
            let
                isPendingStarted = false,
                isPendingCanceled = false;

            eip.saveOptions({
               listModel: listModel
            });

            eip._notify = (eName, args, params) => {
               if (eName === 'registerPending') {
                  assert.isTrue(params.bubbling);
                  isPendingStarted = true;
               }
               if (eName === 'cancelFinishingPending') {
                  assert.isTrue(params.bubbling);
                  isPendingCanceled = true;
               }
            };

            eip.beginAdd({
               item: newItem
            });

            eip._children.formController = failedValidationFormController;
            eip._editingItem.isChanged = () => false;
            // Emulate closing popup. It will call _onPendingFail;
            eip._onPendingFail(undefined, new Deferred());

            assert.isTrue(isPendingStarted);
            assert.isFalse(isPendingCanceled);
         });
      });

      describe('commitAndMoveNextRow (commitEdit by itemAction click)', () => {
         it('commit edit existing record', async function () {
            let
                source = new sourceLib.Memory({
                   keyProperty: 'id',
                   data: data
                });
            eip.saveOptions({
               listModel: listModel
            });
            eip.beginEdit({
               item: listModel.at(0).getContents()
            });
            assert.isNotNull(eip._editingItemData);
            await (new Promise((resolve) => {
               eip.commitAndMoveNextRow();
               setTimeout(resolve, 10);
            }));
            assert.isNull(eip._editingItemData);
         });
         it('commit edit new record', async function () {
            let
                source = new sourceLib.Memory({
                   keyProperty: 'id',
                   data: data
                });
            eip.saveOptions({
               listModel: listModel,
               source
            });
            eip.beginAdd({
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

      describe('_beforeUpdate', function() {
         it('editingConfig has sequential editing', function() {
            eip._beforeUpdate({
               editingConfig: {
                  sequentialEditing: false
               }
            });
            assert.isFalse(eip._sequentialEditing);
            eip._beforeUpdate({
               editingConfig: {
                  sequentialEditing: true
               }
            });
            assert.isTrue(eip._sequentialEditing);
         });

         it('editingConfig doesn\'t have sequential editing', function() {
            eip._beforeUpdate({
               editingConfig: {

               }
            });
            assert.isTrue(eip._sequentialEditing);
         });

         it('editing config doesn\'t exist', function() {
            eip._beforeUpdate({});
            assert.isTrue(eip._sequentialEditing);
         });

         it('multiSelectVisibility on list has been changed while editing', async function () {
            let
                isItemDataRegenerated = false,
                source = new sourceLib.Memory({
                   keyProperty: 'id',
                   data: items
                });

            eip.saveOptions({
               listModel: listModel,
               source: source
            });

            await eip.beginAdd();

            eip._setEditingItemData = (editingItem, model, options) => {
               isItemDataRegenerated = true;
               assert.equal(editingItem, eip._editingItemData.item);
               assert.equal(options.multiSelectVisibility, 'visible');
            };

            eip._beforeUpdate({multiSelectVisibility: 'visible', listModel: listModel});
            assert.isTrue(isItemDataRegenerated);
         });
      });

      it('property change of an editing item should reset validation', function() {
         var setValidationResultCalled = false;
         eip.saveOptions({
            listModel: listModel
         });

         eip.beginEdit({
            item: listModel.at(0).getContents()
         });
         eip._children = {
            formController: {
               setValidationResult: function() {
                  setValidationResultCalled = true;
               }
            }
         };
         eip._editingItem.set('title', 'test');
         assert.isTrue(setValidationResultCalled);
      });

      it('index of a new item should update if the list gets changed', async function() {
         const source = new sourceLib.Memory({
            keyProperty: 'id',
            data: items
         });

         eip.saveOptions({
            listModel: listModel,
            source: source
         });

         await eip.beginAdd();
         assert.equal(eip._editingItemData.index, 3);
         listModel._items.append([new entity.Record({
            rawData: {
               id: 4,
               title: 'test'
            }
         })]);
         assert.equal(eip._editingItemData.index, 4);
      });

      describe('_private block', function () {
         it('hasParentInItems', function () {
            eip.saveOptions({
               listModel: listModel
            });

            assert.isFalse(EditInPlace._private.hasParentInItems({}, listModel));
         });
      });

   });
});
