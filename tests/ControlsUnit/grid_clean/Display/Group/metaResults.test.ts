import { assert } from 'chai';

import { Model } from 'Types/entity';
import { RecordSet } from 'Types/collection';
import { GridCollection, GridGroupItem } from 'Controls/gridNew';

const rawData = [
    { key: 1, col1: 'c1-1', col2: 'с2-1', group: 'g1' },
    { key: 2, col1: 'c1-2', col2: 'с2-2', group: 'g1' },
    { key: 3, col1: 'c1-3', col2: 'с2-3', group: 'g1' },
    { key: 4, col1: 'c1-4', col2: 'с2-4', group: 'g1' }
];
const columns = [
    { displayProperty: 'col1' },
    { displayProperty: 'col2' }
];

describe('Controls/grid_clean/Display/Group/metaResults', () => {
    const createRecordSet = (metaData?) => new RecordSet({
        keyProperty: 'id',
        rawData,
        metaData
    });

    it('should set meta results to GroupRow when creates a group', () => {
        const results = new Model({rawData: {}});
        const recordSet = createRecordSet({results});

        const gridCollection = new GridCollection({
            keyProperty: 'id',
            collection: recordSet,
            groupProperty: 'group',
            columns
        });

        assert.equal((gridCollection.at(0) as GridGroupItem<any>).getMetaResults(), results);
    });
});
