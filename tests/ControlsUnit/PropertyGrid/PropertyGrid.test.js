define([
    'Controls/_propertyGrid/PropertyGrid',
    'Controls/_propertyGrid/Constants',
    'Controls/display'
], function (
    PropertyGrid,
    Constants,
    display
) {
    describe('Controls/_propertyGrid/PropertyGrid', () => {
        const ViewInstance = new PropertyGrid.default();
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
        describe('getPropertyGridItems', () => {
            it('returns merged editingObject and source items', () => {
                const itemsRS = ViewInstance._getPropertyGridItems(source, editingObject);
                const items = itemsRS.getRawData();
                const propertyValueMerged = items.every((item => item.propertyValue === editingObject[item.name]));
                assert.isTrue(propertyValueMerged);
            });
            it('returns editor templates by value type', () => {
                const itemsRS = ViewInstance._getPropertyGridItems(source, editingObject);
                let result = false;
                itemsRS.each((item) => {
                    result = item.get('editorTemplateName') === editors[item.get('name')];
                });
                assert.isTrue(result);
            });
        });

        describe('getCollection', () => {
            it('returns flat collection', () => {
                const collection = ViewInstance._getCollection(null, null, editingObject, source);
                assert.isTrue(collection instanceof display.Collection);
            });
            it('returns tree Collection', () => {
                const collection = ViewInstance._getCollection('node', 'parent', editingObject, source);
                assert.isTrue(collection instanceof display.Tree);
            });
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

        describe('displayFilter', () => {
            it('not filtered item from collapsed group', () => {
                const collection = ViewInstance._getCollection('node', 'parent', editingObject, source);
                const collapsedItem = collection.getItemBySourceKey('stringField');
                ViewInstance._collapsedGroups = {
                    text: true
                };
                const resultDisplay = ViewInstance._displayFilter(collapsedItem.getContents());
                assert.isFalse(resultDisplay);
            });
            it('filtered groupItem', () => {
                const collection = ViewInstance._getCollection('node', 'parent', editingObject, source);
                collection.moveToFirst();
                const group = collection.getCurrent();
                const resultDisplay = ViewInstance._displayFilter(group.getContents());
                assert.isTrue(resultDisplay);
            });
        });
        describe('itemClick', () => {
            it('toggle expand state on group item', () => {
                const collection = ViewInstance._getCollection('node', 'parent', editingObject, source);
                collection.moveToFirst();
                const groupItem = collection.getCurrent();
                const expandedState = groupItem.isExpanded();
                const clickEvent = {
                    target: {
                        closest: () => true
                    }
                };
                ViewInstance._collapsedGroups = {};
                ViewInstance._listModel = collection;
                ViewInstance._itemClick(null, groupItem, clickEvent);
                assert.isTrue(expandedState !== groupItem.isExpanded());
            });
        });
    });
});