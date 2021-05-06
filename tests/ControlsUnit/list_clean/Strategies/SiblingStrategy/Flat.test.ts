import {assert} from 'chai';
import {CrudEntityKey} from 'Types/source';
import {FlatSiblingStrategy} from 'Controls/_list/Strategies/Flat';
import {ISiblingStrategy} from 'Controls/_list/interface/ISiblingStrategy';
import {Collection} from 'Controls/display';

describe('Controls/list_clean/Strategies/SiblingStrategy/Flat', () => {
    let strategy: ISiblingStrategy;

    const mockCollection = {
        getCollection: () => ({
            getIndexByValue: (keyProperty: string, key: CrudEntityKey) => key as number - 1,
            at: (index: number) => index >= 0 && index <= 2 ? { getKey: () => index + 1} : undefined,
            getKeyProperty: () => 'id'
        })
    } as unknown as Collection;

    beforeEach(() => {
        strategy = new FlatSiblingStrategy({
            collection: mockCollection
        });
    });

    it('returns next record', () => {
        assert.equal(strategy.getNextByKey(2).getKey(), 3);
    });

    it('returns previous record', () => {
        assert.equal(strategy.getPrevByKey(2).getKey(), 1);
    });

    it('returns undefined for last', () => {
        assert.equal(strategy.getNextByKey(3), undefined);
    });

    it('returns undefined for first', () => {
        assert.equal(strategy.getPrevByKey(1), undefined);
    });
});
