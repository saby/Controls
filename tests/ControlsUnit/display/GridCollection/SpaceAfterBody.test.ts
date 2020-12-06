import { assert } from 'chai';
import { GridCollection, GridRow } from 'Controls/display';
import { RecordSet } from 'Types/collection';
import { Model } from 'Types/entity';
import GridSpaceAfterBodyRow from 'Controls/_display/GridSpaceAfterBodyRow';

describe('Controls/display/GridCollection/SpaceAfterBody', () => {
    let collection: GridCollection<Model, GridRow<Model>>;
    let rs: RecordSet;

    it('should init collection with itemActionsPosition', () => {
        const items = [
            { id: 1, name: 'Ivan', surname: 'Kashitsyn' },
            { id: 2, name: 'Alexey', surname: 'Kudryavcev' },
            { id: 3, name: 'Olga', surname: 'Samokhvalova' }
        ];
        rs = new RecordSet({
            rawData: items,
            keyProperty: 'key'
        });
        collection = new GridCollection({
            collection: rs,
            keyProperty: 'id',
            itemActionsPosition: 'outside',
            columns: [
                {
                    width: '1fr'
                },
                {
                    width: '10px'
                }
            ]
        });
        assert.instanceOf(collection.getSpaceAfterBody(), GridSpaceAfterBodyRow);
    });
});
