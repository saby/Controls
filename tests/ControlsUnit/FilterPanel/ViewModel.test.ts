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

        it('filterItem textValue is updated', () => {
            viewModel.resetFilterItem('owners');
            assert.equal(viewModel._groupItems['owners'].textValue, '');
        });
    });

    describe('resetFilter', () => {
        const source = [
            {
                group: 'owners',
                name: 'owner',
                value: 'Test owner',
                textValue: 'Test owner',
                resetValue: null,
                viewMode: 'basic',
                editorOptions: {
                    extendedCaption: 'Owner'
                }
            }
        ];
        const collapsedGroups = [];
        const viewModel = new ViewModel({
            source,
            collapsedGroups
        });

        it('view mode changed', () => {
            viewModel.resetFilter();
            assert.equal(viewModel._source[0].viewMode,  'extended');
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

    describe('setEditingObject', () => {
        const source = [
            {
                group: 'owners',
                name: 'owner',
                value: null,
                textValue: 'Test owner',
                resetValue: null
            }
        ];
        const collapsedGroups = [];
        const viewModel = new ViewModel({
            source,
            collapsedGroups
        });

        it('collapsed groups reseted', () => {
            const editingObject = {
                owner: null
            };
            viewModel.collapseGroup('owners');
            viewModel.setEditingObject(editingObject);
            assert.isEmpty(viewModel._collapsedGroups);
        });
    });

    describe('handleGroupClick', () => {
        const source = [
            {
                group: 'owners',
                name: 'owner',
                value: null,
                textValue: 'Test owner',
                resetValue: null
            }
        ];
        const collapsedGroups = [];
        const viewModel = new ViewModel({
            source,
            collapsedGroups
        });

        it('value added to collapsed groups', () => {
            viewModel.handleGroupClick('owners', true);
            assert.deepEqual(viewModel._collapsedGroups, ['owners']);
        });

        it('value removed from collapsed groups', () => {
            viewModel.handleGroupClick('owners', true);
            assert.deepEqual(viewModel._collapsedGroups, []);
        });
    });
});
