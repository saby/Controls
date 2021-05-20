import {ViewModel} from 'Controls/filterPanel';
import {assert} from 'chai';

describe('Controls/filterPanel:ViewModel', () => {
    describe('resetFilterItem', () => {
        const source = [
            {
                group: 'owners',
                name: 'owner',
                value: 'Test owner',
                textValue: 'Test owner',
                resetValue: null
            }
        ];
        const collapsedGroups = [];
        const viewModel = new ViewModel({
            source,
            collapsedGroups
        });

        it('editingObject is updated', () => {
            viewModel.resetFilterItem('owners');
            assert.isNull(viewModel._editingObject['owner']);
        });
    });

    describe('setEditingObjectValue', () => {
        const source = [
            {
                group: 'owners',
                name: 'owner',
                value: 'Test owner',
                textValue: 'Test owner',
                resetValue: null
            }
        ];
        const collapsedGroups = [];
        const viewModel = new ViewModel({
            source,
            collapsedGroups
        });

        it('source value is not an object', () => {
            const editorValue = {
                value: 'New owner',
                textValue: 'New text owner'
            };
            viewModel.setEditingObjectValue('owner', editorValue);

            const item = viewModel._source[0];
            assert.equal(item.value, 'New owner');
            assert.equal(item.textValue, 'New text owner');
        });
    });
});
