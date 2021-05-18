import { assert } from 'chai';

import { GridCollection } from 'Controls/grid';
import {RecordSet} from 'Types/collection';

describe('Controls/grid_clean/display/GridCollection/hasItemActionsSeparatedCell', () => {
    const createDisplay = (columnScroll, items) => {
        return new GridCollection({
            collection: new RecordSet({
                rawData: items,
                keyProperty: 'id'
            }),
            columnScroll: columnScroll,
            columns: [{}, {}]
        });
    };

    it('columnScroll = true, no items', () => {
        const display = createDisplay(true, []);
        assert.isFalse(display.hasItemActionsSeparatedCell());
    });

    it('columnScroll = false, no items', () => {
        const display = createDisplay(false, []);
        assert.isFalse(display.hasItemActionsSeparatedCell());
    });

    it('columnScroll = true, has items', () => {
        const display = createDisplay(true, [{title: 'title'}]);
        assert.isTrue(display.hasItemActionsSeparatedCell());
    });

    it('columnScroll = false, has items', () => {
        const display = createDisplay(false, [{title: 'title'}]);
        assert.isFalse(display.hasItemActionsSeparatedCell());
    });
});
