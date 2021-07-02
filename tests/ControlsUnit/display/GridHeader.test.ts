import { assert } from 'chai';
import { GridHeader, GridHeaderRow } from 'Controls/grid';

describe('Controls/grid:GridHeader', () => {

    describe('.isSticked()', () => {
        const getOwnerMock = (isStickyHeader, isFullGridSupport) => ({
            isStickyHeader: () => isStickyHeader,
            isFullGridSupport: () => isFullGridSupport
        });

        it('should sticky header if options.stickyHeader === true in full grid support browsers', function () {
            const header = new GridHeader({
                owner: getOwnerMock(true, true),
                columnsConfig: [{}],
                gridColumnsConfig: [{}]
            });
            assert.isTrue(header.isSticked());
        });

        it('should not sticky header if options.stickyHeader === false in full grid support browsers', function () {
            const header = new GridHeader({
                owner: getOwnerMock(false, true),
                columnsConfig: [{}],
                gridColumnsConfig: [{}]
            });
            assert.isFalse(header.isSticked());
        });

        it('should not sticky header in browsers without grid support', function () {
            const header = new GridHeader({
                owner: getOwnerMock(true, false),
                columnsConfig: [{}],
                gridColumnsConfig: [{}]
            });
            assert.isFalse(header.isSticked());
        });
    });

    describe('.isMultiline()', () => {
        it('should returns false for solo row header', function () {
            const header = new GridHeader({
                owner: {},
                columnsConfig: [{}],
                gridColumnsConfig: [{}]
            });
            assert.isFalse(header.isMultiline());
        });
    });

    describe('.getRow()', () => {
        const getOwnerMock = () => ({
            isFullGridSupport: () => true
        });

        it('should returns GridHeaderRow', function () {
            const header = new GridHeader({
                owner: getOwnerMock(),
                columnsConfig: [{}],
                gridColumnsConfig: [{}]
            });
            const row = header.getRow();
            assert.instanceOf(row, GridHeaderRow);
        });
    });

    describe('.getBounds()', () => {
        const getOwnerMock = () => ({
            isFullGridSupport: () => true
        });

        it('simple header', function () {
            const header = new GridHeader({
                owner: getOwnerMock(),
                columnsConfig: [{}, {}],
                gridColumnsConfig: [{}, {}]
            });
            assert.deepEqual({
                row: {start: 1, end: 2},
                column: {start: 1, end: 3}
            }, header.getBounds());
        });

        it('two line header', function () {
            const header = new GridHeader({
                owner: getOwnerMock(),
                columnsConfig: [
                    {startRow: 1, endRow: 3, startColumn: 1, endColumn: 2},
                    {startRow: 1, endRow: 2, startColumn: 2, endColumn: 3},
                    {startRow: 2, endRow: 3, startColumn: 2, endColumn: 3},
                ],
                gridColumnsConfig: [{}, {}]
            });
            assert.deepEqual({
                row: {start: 1, end: 3},
                column: {start: 1, end: 3}
            }, header.getBounds());
        });

        it('invalid configuration', function () {
            const header = new GridHeader({
                owner: getOwnerMock(),
                columnsConfig: [
                    {startRow: 1, endRow: 3, startColumn: 1, endColumn: 2},
                    {},
                    {startRow: 2, endRow: 3, startColumn: 2, endColumn: 3},
                ],
                gridColumnsConfig: [{}, {}]
            });
            assert.deepEqual({
                row: {start: 1, end: 2},
                column: {start: 1, end: 3}
            }, header.getBounds());
        });
    });
});
