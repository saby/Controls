import {ListEditor} from 'Controls/filterPanel';
import {Model} from 'Types/entity';
import {assert} from 'chai';
import {RecordSet} from 'Types/collection';

describe('Controls/filterPanel:ListEditor', () => {

    describe('_beforeUpdate', () => {
        const getEditorOptions = () => {
            return {
                propertyValue: [1],
                filter: {},
                keyProperty: 'id'
            };
        };
        const getEditor = () => {
            const listEditor = new ListEditor({});
            const options = getEditorOptions();
            listEditor._beforeMount(options);
            listEditor.saveOptions(options);
            return listEditor;
        };

        it('propertyValue changed', () => {
            const newPropertyValue = [];
            const listEditor = getEditor();
            const options = getEditorOptions();
            options.propertyValue = newPropertyValue;
            listEditor._beforeUpdate(options);
            assert.deepEqual(listEditor._filter, {});
        });

        it('filter updated after propertyValue changed', () => {
            const newPropertyValue = [2];
            const listEditor = getEditor();
            const options = getEditorOptions();
            options.propertyValue = newPropertyValue;
            listEditor._beforeUpdate(options);
            assert.deepEqual(listEditor._filter[options.keyProperty], newPropertyValue);
        });

        it('propertyValue changed with multiSelect', () => {
            const listEditor = getEditor();
            const newPropertyValue = [1];
            const options = getEditorOptions();
            options.propertyValue = newPropertyValue;
            options.filter = listEditor._options.filter;
            options.multiSelect = true;
            listEditor._beforeUpdate(options);
            assert.notEqual(listEditor._filter['id'], newPropertyValue);
        });

        it('_beforeUpdate with same value in propertyValue', () => {
            const listEditor = getEditor();
            const newPropertyValue = [2];
            const options = getEditorOptions();
            options.propertyValue = newPropertyValue;

            listEditor._selectedKeys = [2];
            listEditor._beforeUpdate(options);
            assert.notEqual(listEditor._filter['id'], newPropertyValue);
        });
    });

    describe('_handleItemClick', () => {
        const getEditorOptions = () => {
            return {
                propertyValue: [1],
                filter: {},
                keyProperty: 'id'
            };
        };

        const getEditorOptionsWithMultiSelet = () => {
            return {
                propertyValue: [1],
                filter: {},
                keyProperty: 'id',
                multiSelect: true
            };
        };
        const getEditor = (multiSelect) => {
            const listEditor = new ListEditor({});
            const options = multiSelect ? getEditorOptionsWithMultiSelet() : getEditorOptions();
            listEditor._beforeMount(options);
            listEditor.saveOptions(options);
            return listEditor;
        };

        it('selectedKeys are not empty', () => {
            const listEditor = getEditor(true);
            listEditor._getTextValue = () => '';
            const nativeEvent = {
                target: {
                    closest: () => true
                }
            };
            const item = new Model({
                rawData: { id: 2, title: 'second'},
                keyProperty: 'id'
            });
            listEditor._handleItemClick(null, item, nativeEvent);
            assert.deepEqual(listEditor._selectedKeys, [2, 1]);
        });

        it('multiSelect is false', () => {
            const listEditor = getEditor(false);
            listEditor._getTextValue = () => '';
            const nativeEvent = {
                target: {
                    closest: () => true
                }
            };
            const item = new Model({
                rawData: { id: 2, title: 'second'},
                keyProperty: 'id'
            });
            listEditor._handleItemClick(null, item, nativeEvent);
            assert.deepEqual(listEditor._selectedKeys, [2]);
        });

        it('empty _selectedKeys', () => {
            const listEditor = new ListEditor({});
            const options = getEditorOptionsWithMultiSelet();
            options.propertyValue = null;
            listEditor._beforeMount(options);
            listEditor._getTextValue = () => '';
            const nativeEvent = {
                target: {
                    closest: () => true
                }
            };
            const item = new Model({
                rawData: { id: 2, title: 'second'},
                keyProperty: 'id'
            });
            let hasError = false;

            try {
                listEditor._handleItemClick(null, item, nativeEvent);
            } catch (e) {
                hasError = true;
            }
            assert.isFalse(hasError);
        });
    });

    describe('_handleSelectorResult', () => {
        const getEditorOptions = () => {
            return {
                propertyValue: [],
                filter: {},
                keyProperty: 'id',
                multiSelect: true,
                displayProperty: 'title'
            };
        };
        const getEditor = () => {
            const listEditor = new ListEditor({});
            const options = getEditorOptions();
            listEditor._beforeMount(options);
            listEditor.saveOptions(options);
            listEditor._items = new RecordSet({
                rawData: [],
                keyProperty: 'id'
            });
            return listEditor;
        };

        it('navigation is null', () => {
            const listEditor = getEditor();
            const result = [
                new Model({
                    rawData: {
                        id: 1,
                        title: 'Test'
                    },
                    keyProperty: 'id'
                })
            ];
            listEditor._handleSelectorResult(result);
            assert.isNull(listEditor._navigation);
        });
    });
});
