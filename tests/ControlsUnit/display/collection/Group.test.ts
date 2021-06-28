import {RecordSet} from 'Types/collection';
import {Collection as DisplayCollection} from 'Controls/display';
import {assert} from 'chai';

describe('onCollectionChange', () => {
    it('should update collection when item group was changed', () => {
        const recordSet = new RecordSet({
            keyProperty: 'key',
            rawData: [
                {key: 1, group: 1},
                {key: 2, group: 2},
                {key: 3, group: 1},
                {key: 4, group: 3}
            ]
        });
        const display = new DisplayCollection({ collection: recordSet });
        const displayItemAt3 = display.at(3);
        let handlerCalledTimes = 0;
        const handler = (event, action, newItems, newItemsIndex, oldItems, oldItemsIndex) => {
            assert.equal(action, 'ch');
            assert.equal(newItems[0], displayItemAt3);
            handlerCalledTimes++;
        };

        assert.equal(display.getVersion(), 0);

        display.subscribe('onCollectionChange', handler);
        displayItemAt3.getContents().set('group', 2);
        display.unsubscribe('onCollectionChange', handler);

        assert.equal(display.getVersion(), 1);
        assert.equal(handlerCalledTimes, 1);

        // handler assertions are above;
    });
});
