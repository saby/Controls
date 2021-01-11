import { assert } from 'chai';
import { GridHeaderRow } from 'Controls/display';

describe('Controls/_display:GridHeaderRow', () => {

    it('.getItemClasses()', () => {
        const headerRow = new GridHeaderRow({});
        assert.equal(
            headerRow.getItemClasses({ theme: 'themeName' }),
            'controls-Grid__header controls-Grid__header_theme-themeName'
        )
    });

    it('should add multiselect with rowspan if it is multi-line header', function () {
        const header = [{}];
        const headerRow = new GridHeaderRow({
            owner: {
                hasItemActionsSeparatedCell: () => false,
                hasMultiSelectColumn: () => true,
                getHeaderConfig: () => header,
                getColumnsConfig: () => [{}],
                isFullGridSupport: () => true,
                getStickyColumnsCount: () => {}
            },
            header,
            columns: [{}],
            headerModel: {
                getBounds: () => ({ row: {start: 1, end: 3} })
            }
        });
        assert.equal(headerRow.getColumns().length, 2);
        assert.equal(headerRow.getColumns()[0].getRowspan(), 'grid-row: 1 / 3;');
    });
});
