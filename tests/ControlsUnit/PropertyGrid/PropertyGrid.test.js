define([
   'Controls/propertyGrid',
   'Controls/_propertyGrid/Constants',
   'Controls/display',
   'Types/entity',
   'Types/collection',
   'Controls/itemActions'
], function(
   propertyGridLib,
   Constants,
   display,
   entity,
   collection,
   itemActions
) {
    describe('Controls/_propertyGrid/PropertyGrid', () => {
        const ViewInstance = new propertyGridLib.PropertyGrid();
        let source, editingObject, editors;
        beforeEach(() => {
            source = [
                {name: 'stringField', group: 'text'},
                {name: 'booleanField', editorOptions: {icon: 'testIcon'}},
                {name: 'stringField1'}];
            editingObject = {
                booleanField: false,
                stringField: 'stringValue',
                stringField1: 'stringValue1'
            };
            editors = {
                stringField: Constants.DEFAULT_EDITORS.string,
                booleanField: Constants.DEFAULT_EDITORS.boolean,
                stringField1: Constants.DEFAULT_EDITORS.string
            };
        });

        describe('_getCollapsedGroups', () => {
            const groups = [1, 2, 3];
            const result = {
                1: true,
                2: true,
                3: true
            };
            const collapsedGroups = ViewInstance._getCollapsedGroups(groups);
            assert.deepEqual(collapsedGroups, result);
        });

        describe('_updatePropertyValue', () => {
            it('with different propertyValue type', () => {
                let propertyValue = new entity.Model({
                    rawData: []
                });
                let resultPropertyValue = ViewInstance._updatePropertyValue(propertyValue, 'test', 2);
                assert.equal(resultPropertyValue.get('test'), 2);
                propertyValue = {};
                resultPropertyValue = ViewInstance._updatePropertyValue(propertyValue, 'test', 2);
                assert.equal(resultPropertyValue.test, 2);
                propertyValue = new entity.Model({
                    rawData: {},
                    adapter: 'adapter.sbis'
                });
                resultPropertyValue = ViewInstance._updatePropertyValue(propertyValue, 'test', 2);
                assert.equal(resultPropertyValue.get('test'), 2);
            });
        });

        describe('displayFilter', () => {
            it('not filtered item from collapsed group', () => {
                const options = {
                   nodeProperty: 'node',
                   parentProperty: 'parent',
                   editingObject,
                   source,
                   keyProperty: 'name'
                };
                const collection = ViewInstance._getCollection(options);
                const collapsedItem = collection.getItemBySourceKey('stringField');
                ViewInstance._collapsedGroups = {
                    text: true
                };
                const resultDisplay = ViewInstance._displayFilter(collapsedItem.getContents());
                assert.isFalse(resultDisplay);
            });
            it('filtered groupItem', () => {
               const options = {
                  nodeProperty: 'node',
                  parentProperty: 'parent',
                  editingObject,
                  source,
                  keyProperty: 'name'
               };
                const collection = ViewInstance._getCollection(options);
                const group = collection.at(0);
                const resultDisplay = ViewInstance._displayFilter(group.getContents());
                assert.isTrue(resultDisplay);
            });
        });
        describe('groupClick', () => {
            it('toggle expand state on group item', () => {
               const options = {
                  nodeProperty: 'node',
                  parentProperty: 'parent',
                  editingObject,
                  source,
                  keyProperty: 'name'
               };
                const collection = ViewInstance._getCollection(options);
                const groupItem = collection.at(2);
                const expandedState = groupItem.isExpanded();
                let controlResizeNotified = false;
                const clickEvent = {
                    target: {
                        closest: () => true
                    }
                };
                ViewInstance._collapsedGroups = {};
                ViewInstance._listModel = collection;
                ViewInstance._notify = (eventName) => {
                   if (eventName === 'controlResize') {
                      controlResizeNotified = true;
                   }
                };
                ViewInstance._groupClick(null, groupItem, clickEvent);
                assert.isTrue(expandedState !== groupItem.isExpanded());
                assert.isTrue(controlResizeNotified);
            });
        });

       describe('toggledEditors', () => {

           it('collection filtered by toggled editors', () => {
               source[0].toggleEditorButtonIcon = 'testIcon';
               ViewInstance._beforeMount({
                   source,
                   editingObject,
                   keyProperty: 'name'
               });
               assert.deepEqual(ViewInstance._toggledEditors, {stringField: false});
           });

       });

      describe('itemActions', () => {
         before(() => {
            ViewInstance._itemActionsController = new itemActions.Controller();
         });

         it('_updateItemActions', () => {
            const options = {
               nodeProperty: '',
               parentProperty: '',
               editingObject,
               source,
               keyProperty: 'name'
            };
            const collection = ViewInstance._getCollection(options);
            ViewInstance._updateItemActions(collection, {
               itemActions: []
            });

            assert.isOk(ViewInstance._itemActionsController);
         });

         it('_onItemActionsMenuResult', () => {
            let isApplyAction = false;
            let isClosed = false;
            const propertyGrid = new propertyGridLib.PropertyGrid({});
            propertyGrid._itemActionsController = {
               getActiveItem: () => ({
                  getContents: () => {}
               })
            };
            propertyGrid._itemActionSticky = {
               close: () => {isClosed = true;}
            };
            propertyGrid._onItemActionsMenuResult('itemClick', new entity.Model({
               rawData: {
                  handler: () => {isApplyAction = true;}
               }
            }));

            assert.isTrue(isApplyAction);
            assert.isTrue(isClosed);
         });

         it('_openItemActionMenu', () => {
            let isOpened = false;
            let actualConfig;
            const propertyGrid = new propertyGridLib.PropertyGrid({});
            propertyGrid._itemActionsController = {
               prepareActionsMenuConfig: () => ({ param: 'menuConfig' }),
               setActiveItem: () => {}
            };
            propertyGrid._itemActionSticky = {
               open: (menuConfig) => {
                  actualConfig = menuConfig;
                  isOpened = true;
               }
            };
            propertyGrid._openItemActionMenu('item', {}, null);
            assert.isTrue(isOpened);
            assert.isOk(actualConfig.eventHandlers);
         });
      });
   });
});
