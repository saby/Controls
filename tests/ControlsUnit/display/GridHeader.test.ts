import { assert } from 'chai';
import { GridHeader, GridHeaderRow } from 'Controls/display';

describe('Controls/display:GridHeader', () => {

    describe('.isSticked()', () => {
        const getOwnerMock = (isStickyHeader, isFullGridSupport) => ({
            isStickyHeader: () => isStickyHeader,
            isFullGridSupport: () => isFullGridSupport
        });

        it('should sticky header if options.stickyHeader === true in full grid support browsers', function () {
            const header = new GridHeader({
                owner: getOwnerMock(true, true),
                header: [{}],
                columns: [{}]
            });
            assert.isTrue(header.isSticked());
        });

        it('should not sticky header if options.stickyHeader === false in full grid support browsers', function () {
            const header = new GridHeader({
                owner: getOwnerMock(false, true),
                header: [{}],
                columns: [{}]
            });
            assert.isFalse(header.isSticked());
        });

        it('should not sticky header in browsers without grid support', function () {
            const header = new GridHeader({
                owner: getOwnerMock(true, false),
                header: [{}],
                columns: [{}]
            });
            assert.isFalse(header.isSticked());
        });
    });

    describe('.isMultiline()', () => {
        it('should returns false for solo row header', function () {
            const header = new GridHeader({
                owner: {},
                header: [{}],
                columns: [{}]
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
                header: [{}],
                columns: [{}]
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
                header: [{}, {}],
                columns: [{}, {}]
            });
            assert.deepEqual({
                row: {start: 1, end: 2},
                column: {start: 1, end: 3}
            }, header.getBounds());
        });

        it('two line header', function () {
            const header = new GridHeader({
                owner: getOwnerMock(),
                header: [
                    {startRow: 1, endRow: 3, startColumn: 1, endColumn: 2},
                    {startRow: 1, endRow: 2, startColumn: 2, endColumn: 3},
                    {startRow: 2, endRow: 3, startColumn: 2, endColumn: 3},
                ],
                columns: [{}, {}]
            });
            assert.deepEqual({
                row: {start: 1, end: 3},
                column: {start: 1, end: 3}
            }, header.getBounds());
        });

        it('invalid configuration', function () {
            const header = new GridHeader({
                owner: getOwnerMock(),
                header: [
                    {startRow: 1, endRow: 3, startColumn: 1, endColumn: 2},
                    {},
                    {startRow: 2, endRow: 3, startColumn: 2, endColumn: 3},
                ],
                columns: [{}, {}]
            });
            assert.deepEqual({
                row: {start: 1, end: 2},
                column: {start: 1, end: 3}
            }, header.getBounds());
        });
    });
});
