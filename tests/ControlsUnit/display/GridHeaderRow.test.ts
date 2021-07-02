import { assert } from 'chai';
import { GridHeaderRow } from 'Controls/grid';

describe('Controls/_display:GridHeaderRow', () => {

    it('.getItemClasses()', () => {
        const headerRow = new GridHeaderRow({});
        assert.equal(
            headerRow.getItemClasses({ theme: 'themeName' }),
            'controls-Grid__header'
        )
    });

    it('should add multiselect with rowspan if it is multi-line header', function () {
        const header = [{}];
        const headerRow = new GridHeaderRow({
            owner: {
                hasItemActionsSeparatedCell: () => false,
                hasMultiSelectColumn: () => true,
                getHeaderConfig: () => header,
                getGridColumnsConfig: () => [{}],
                isFullGridSupport: () => true,
                getStickyColumnsCount: () => {}
            },
            columnsConfig: header,
            gridColumnsConfig: [{}],
            headerModel: {
                getBounds: () => ({ row: {start: 1, end: 3} }),
                isMultiline: (): boolean => true
            }
        });
        assert.equal(headerRow.getColumns().length, 2);
        assert.equal(headerRow.getColumns()[0].getRowspanStyles(), 'grid-row: 1 / 3;');
    });
});
