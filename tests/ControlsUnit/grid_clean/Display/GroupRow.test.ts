import {GridGroupRow} from 'Controls/grid';
import {assert} from 'chai';

const getMockedOwner = () => ({
    getColumnsConfig: () => [{}, {}]
});

describe('Controls/grid_clean/Display/GroupRow', () => {
    it('readonly states', () => {
        const groupRow = new GridGroupRow({ owner: getMockedOwner() });
        assert.isFalse(groupRow.Markable);
        assert.isFalse(groupRow.SelectableItem);
        assert.isFalse(groupRow.DisplayItemActions);
        assert.isFalse(groupRow.DraggableItem);
        assert.isFalse(groupRow.LadderSupport);
        assert.isFalse(groupRow.ItemActionsItem);
    });
});
