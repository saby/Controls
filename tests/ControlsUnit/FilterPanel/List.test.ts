import {ListEditor} from 'Controls/filterPanel';
import {assert} from 'chai';

describe('Controls/filterPanel:ListEditor', () => {

    it('_beforeMount', () => {
        const listEditor = new ListEditor({});
        const options = {
            propertyValue: null,
            filter: {},
            keyProperty: 'id'
        };
        listEditor._beforeMount(options);
        assert.deepEqual(listEditor._selectedKeys, []);
    });

    describe('_beforeUpdate', () => {
        const listEditor = new ListEditor({});
        const options = {
            propertyValue: [1],
            filter: {},
            keyProperty: 'id'
        };
        listEditor._beforeMount(options);

        it('propertyValue changed', () => {
            const newPropertyValue = [2];
            options.propertyValue = newPropertyValue;
            listEditor._beforeUpdate(options);
            assert.equal(listEditor._filter['id'], newPropertyValue);
        });

        it('propertyValue changed with multiSelect', () => {
            const newPropertyValue = [1];
            options.propertyValue = newPropertyValue;
            options.filter = listEditor._options.filter;
            options.multiSelect = true;
            listEditor._beforeUpdate(options);
            assert.notEqual(listEditor._filter['id'], newPropertyValue);
        });
    });
});
