import { assert } from 'chai';
import { GridCollection } from 'Controls/display';
import { Model } from 'Types/entity';
import {RecordSet} from 'Types/collection';
import {TEditArrowVisibilityCallback} from 'Controls/_display/GridMixin';

describe('Controls/display/GridCollection/EditArrow', () => {
    let rs: RecordSet;
    let showEditArrow: boolean;
    let editArrowVisibilityCallback: TEditArrowVisibilityCallback;

    function initCollection(): GridCollection<Model> {
        return new GridCollection({
            collection: rs,
            keyProperty: 'id',
            showEditArrow,
            editArrowVisibilityCallback,
            columns: [
                {
                    width: '1fr'
                },
                {
                    width: '1px'
                },
                {
                    width: '1px'
                }
            ]
        });
    }

    beforeEach(() => {
        showEditArrow = true;
        editArrowVisibilityCallback = undefined;
        const items = [
            { id: 1, name: 'Ivan', surname: 'Kashitsyn' },
            { id: 2, name: 'Alexey', surname: 'Kudryavcev' },
            { id: 3, name: 'Olga', surname: 'Samokhvalova' }
        ];
        rs = new RecordSet({
            rawData: items,
            keyProperty: 'id'
        });
    });

    it('editArrowIsVisible === true when showEditArrow === true', () => {
        assert.isTrue(initCollection().editArrowIsVisible(rs.at(0)));
    });

    it('editArrowIsVisible === false when showEditArrow === false', () => {
        showEditArrow = false;
        assert.isFalse(initCollection().editArrowIsVisible(rs.at(0)));
    });

    it('should call editArrowVisibilityCallback', () => {
        editArrowVisibilityCallback = (item: Model) => {
            return item.getKey() !== 1;
        };
        assert.isFalse(initCollection().editArrowIsVisible(rs.at(0)));
        assert.isTrue(initCollection().editArrowIsVisible(rs.at(1)));
    });
});
