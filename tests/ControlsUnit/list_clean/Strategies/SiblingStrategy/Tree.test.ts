import {assert} from 'chai';
import {CrudEntityKey} from 'Types/source';
import {TreeSiblingStrategy} from 'Controls/_list/Strategies/SiblingStategy/Tree';
import {ISiblingStrategy} from 'Controls/_list/Strategies/SiblingStategy/ISiblingStrategy';
import {Tree} from 'Controls/display';

describe('Controls/list_clean/Strategies/SiblingStrategy/Tree', () => {
    let strategy: ISiblingStrategy;

    const mockCollection = {
        getChildrenByRecordSet: (parent: CrudEntityKey) => ([
            {getKey: () => 1}, {getKey: () => 2}, {getKey: () => 3}
        ]),
        getCollection: () => ({
            getIndexByValue: (key: CrudEntityKey, keyProperty: string) => key as number - 1,
            at: (index: number) => ({getKey: () => index + 1}),
            getKeyProperty: () => 'id'
        })
    } as unknown as Tree;

    beforeEach(() => {
        strategy = new TreeSiblingStrategy({
            collection: mockCollection
        });
    });

    it('returns next record', () => {
        assert.equal(strategy.getNextByKey(2).getKey(), 3);
    });

    it('returns previous record', () => {
        assert.equal(strategy.getPrevByKey(3).getKey(), 1);
    });

    it('returns undefined for last', () => {
        assert.equal(strategy.getNextByKey(3), undefined);
    });

    it('returns undefined for first', () => {
        assert.equal(strategy.getPrevByKey(1), undefined);
    });
});
