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
});
