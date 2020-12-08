import { assert } from 'chai';
import { GridCollection, GridRow } from 'Controls/display';
import { RecordSet } from 'Types/collection';
import { Model } from 'Types/entity';

describe('Controls/display/GridCollection/SpaceAfterItemsContainer.test', () => {
    let rs: RecordSet;
    let multiSelectVisibility: string;

    function initCollection(): GridCollection<Model, GridRow<Model>> {
        return new GridCollection({
            collection: rs,
            keyProperty: 'id',
            multiSelectVisibility,
            columns: [
                {
                    width: '1fr'
                },
                {
                    width: '10px'
                }
            ]
        });
    }

    beforeEach(() => {
        const items = [
            { id: 1, name: 'Ivan', surname: 'Kashitsyn' },
            { id: 2, name: 'Alexey', surname: 'Kudryavcev' },
            { id: 3, name: 'Olga', surname: 'Samokhvalova' }
        ];
        multiSelectVisibility = 'hidden';
        rs = new RecordSet({
            rawData: items,
            keyProperty: 'key'
        });
    });

    it('getSpaceAfterItemsContainerClasses should return spacing class', () => {
        const classes = initCollection().getSpaceAfterItemsContainerClasses('default');
        assert.include(classes, 'controls-itemActionsV_outside-spacing_theme-default');
    });

    it('getSpaceAfterItemsContainerStyles should return grid-column style', () => {
        const styles = initCollection().getSpaceAfterItemsContainerStyles();
        assert.include(styles, 'grid-column: 1 / 3');
    });

    it('getSpaceAfterItemsContainerStyles should return grid-column style considering multiSelect', () => {
        multiSelectVisibility = 'visible';
        const styles = initCollection().getSpaceAfterItemsContainerStyles();
        assert.include(styles, 'grid-column: 1 / 4');
    });
});
