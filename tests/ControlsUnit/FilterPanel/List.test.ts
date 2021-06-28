import {ListEditor} from 'Controls/filterPanel';
import {Model} from 'Types/entity';
import {RecordSet} from 'Types/collection';
import {assert} from 'chai';

describe('Controls/filterPanel:ListEditor', () => {

    describe('_beforeMount', () => {
        const filter = {
            testParam: 'testValue'
        };
        const getEditorOptions = () => {
            return {
                propertyValue: [1],
                filter,
                keyProperty: 'id'
            };
        };

        it('filter without selected items', () => {
            const listEditor = new ListEditor({});
            listEditor._beforeMount(getEditorOptions());
            assert.deepEqual(listEditor._filter, filter);
        });
    });

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
});
