import {assert} from 'chai';

import {GridCell, GridCollection, GridRow} from 'Controls/display';
import {Model} from 'Types/entity';
import {IColumn} from 'Controls/grid';

const createCell = (cell: IColumn) => {
    const gridCollection = new GridCollection({
        collection: [{id: 1}],
        columns: [cell]
    });
    const gridRow = new GridRow({owner: gridCollection, columns: [cell], colspanCallback: () => 'end'});
    const gridCell = new GridCell({owner: gridRow, column: cell});

    return gridCell;
};

interface ICase<T> {
    caseName: string;
    assertValue: T;
    cellConfig: IColumn;
}

type TCaseSet<T> = Array<ICase<T>>;

describe('Controls/display:Cell', () => {

    // region Аспект "Кнопка редактирования"

    describe('editArrow', () => {
        let cell: GridCell<Model, GridRow<Model>>;

        beforeEach(() => {
            cell = new GridCell();
        });

        it('shouldDisplayEditArrow', () => {
            assert.isFalse(cell.shouldDisplayEditArrow());
        });
    });

    describe('isMultiSelectColumn', () => {
        const grid = new GridCollection({
            collection: [{id: 1}],
            keyProperty: 'id',
            multiSelectVisibility: 'visible',
            multiSelectPosition: 'default'
        });
        const gridRow = new GridRow({owner: grid});
        const gridCell = new GridCell({owner: gridRow, column: {}});
        gridRow._$columnItems = [gridCell];

        assert.isTrue(gridCell.isMultiSelectColumn());

        gridRow.getColumns().unshift(new GridCell({owner: gridRow, column: {}}));
        assert.isFalse(gridCell.isMultiSelectColumn());

        gridRow.getColumns().shift(new GridCell({owner: gridRow, column: {}}));
        grid.setMultiSelectVisibility('hidden');
        assert.isFalse(gridCell.isMultiSelectColumn());

        gridRow.setMultiSelectVisibility('visible');
        grid.setMultiSelectPosition('custom');
        assert.isFalse(gridCell.isMultiSelectColumn());
    });

    describe('.hasCellContentRender()', () => {
        const cases: TCaseSet<boolean> = [{
            caseName: "doesn't have cell content render",
            assertValue: false,
            cellConfig: {}
        }, {
            caseName: 'has content cell render cause of display type',
            assertValue: true,
            cellConfig: {
                displayType: 'number'
            }
        }, {
            caseName: 'has content cell render cause of text overflow',
            assertValue: true,
            cellConfig: {
                textOverflow: 'ellipsis'
            }
        }, {
            caseName: 'has content cell render cause of font color style',
            assertValue: true,
            cellConfig: {
                fontColorStyle: 'primary'
            }
        }, {
            caseName: 'has content cell render cause of font size',
            assertValue: true,
            cellConfig: {
                fontSize: 'm'
            }
        }];

        cases.forEach((item) => {
            it(item.caseName, () => {
               const gridCell = createCell(item.cellConfig);

               assert.equal(gridCell.hasCellContentRender(), item.assertValue);
            });
        });
    });

    describe('.getCellContentRender()', () => {
        const cases: TCaseSet<string> = [{
            caseName: 'money render',
            assertValue: 'Controls/gridNew:MoneyTypeRender',
            cellConfig: {
                displayType: 'money'
            }
        }, {
            caseName: 'number render',
            assertValue: 'Controls/gridNew:NumberTypeRender',
            cellConfig: {
                displayType: 'number'
            }
        }, {
            caseName: 'default render',
            assertValue: 'Controls/gridNew:StringTypeRender',
            cellConfig: {}
        }];

        cases.forEach((item) => {
            it(item.caseName, () => {
                const gridCell = createCell(item.cellConfig);

                assert.equal(gridCell.getCellContentRender(), item.assertValue);
            });
        });
    });
});
