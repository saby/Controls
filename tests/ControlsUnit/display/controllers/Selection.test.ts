/*
import { assert } from 'chai';

import * as SelectionController from 'Controls/_display/controllers/Selection';

describe('Controls/_display/controllers/Selection', () => {
    function makeSelectionItem(key: string) {
        const item = {
            _$key: key,
            _$selected: false,
            getContents: () => ({
                getKey: () => item._$key
            }),
            isSelected: () => item._$selected,
            setSelected: (selected) => item._$selected = selected
        };
        return item;
    }

    it('selectItems()', () => {
        const items = [
            makeSelectionItem('default'),
            makeSelectionItem('selected'),
            makeSelectionItem('not-selected'),
            makeSelectionItem('null-selected')
        ];

        let nextVersionCalled = false;
        const collection = {
            each: Array.prototype.forEach.bind(items),
            nextVersion: () => nextVersionCalled = true
        };

        const testMap = new Map<string, boolean>([
            ['selected', true],
            ['not-selected', false],
            ['null-selected', null]
        ]);

        SelectionController.selectItems(collection, testMap);

        assert.isFalse(items[0].isSelected());
        assert.isTrue(items[1].isSelected());
        assert.isFalse(items[2].isSelected());
        assert.isNull(items[3].isSelected());
        assert.isTrue(nextVersionCalled);
    });
});
*/
