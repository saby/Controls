import ExtendedVirtualScroll from 'Controls/_display/utils/ExtendedVirtualScrollManager';
import {assert} from 'chai';
import { Collection, CollectionItem } from 'Controls/display';
import { List } from 'Types/collection';

interface IListItem {
    id: number;
    visits: number;
}

describe('Controls/_display/utils/VirtualScrollManager', () => {
    let list: List<IListItem>;
    let collection: Collection<IListItem>;
    let manager: ExtendedVirtualScroll;

    beforeEach(() => {
        list = new List({
            items: [
                { id: 1, visits: 0 },
                { id: 2, visits: 0 },
                { id: 3, visits: 0 },
                { id: 4, visits: 0 },
                { id: 5, visits: 0 }
            ]
        });
        collection = new Collection({
            collection: list
        });
        manager = new ExtendedVirtualScroll(collection);
        collection.each((item) => {
            item.setRendered(true);
        })
    });

    afterEach(() => {
        collection.destroy();
        list.destroy();
    });

    it('.each()', () => {
        it('iterates over each item once with correct indices', () => {
            manager.each((item, index) => {
                const contents = (item as CollectionItem<IListItem>).getContents();
                assert.strictEqual(
                    contents,
                    list.at(index),
                    `indices do not match. original list: ${list.getIndex(contents)}, collection: ${index}`
                );
                contents.visits++;
            });

            list.each((item, index) => {
                assert.strictEqual(item.visits, 1, `item at position ${index} was visited ${item.visits} times`);
            });
        });
    });

    it('.isItemVisible()', () => {
        it('return correct value', () => {
            collection.setViewIndices(0, 2);
            list.each((item, index) => {
                if (index < 2) {
                    assert.isTrue(manager.isItemVisible(index));
                } else {
                    assert.isFalse(manager.isItemVisible(index));
                }
            });
        });
    })
});


