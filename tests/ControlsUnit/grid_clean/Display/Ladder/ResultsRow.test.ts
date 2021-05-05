import { assert } from 'chai';
import { GridCollection, GridResultsRow } from 'Controls/grid';
import * as sinon from 'sinon';

const getMockedOwner = (extendedProps = {}): GridCollection<unknown> => {
    return {
        getStickyColumnsCount: () => 0,
        hasMultiSelectColumn: () => false,
        hasItemActionsSeparatedCell: () => false,
        hasColumnScroll: () => false,
        ...extendedProps
    } as GridCollection<unknown>;
};

describe('Controls/grid_clean/Display/Ladder/ResultsRow', () => {
    let sandbox: sinon.SinonSandbox;

    beforeEach(() => {
        sandbox = sinon.createSandbox();
    });

    afterEach(() => {
        sandbox.restore();
    });

    describe('no grid support', () => {
        it('should not add sticky columns in table layout', () => {
            const columns = [{ title: 'firstColumn' }];
            const resultsRow = new GridResultsRow({
                owner: getMockedOwner({
                    isFullGridSupport: () => false,
                    getStickyLadder: () => ({
                        first: {ladderLength: 2}
                    }),
                    getColumnsConfig: () => columns,
                    getStickyLadderProperties: () => ['first'],
                    isStickyHeader: () => false
                }),
                columns
            });

            const fakeFactoryMethod = (options) => {
                assert.isNotTrue(options.ladderCell);
            };
            sandbox.replace(resultsRow, 'getColumnsFactory', () => fakeFactoryMethod);

            assert.isArray(resultsRow.getColumns());
            assert.equal(resultsRow.getColumns().length, 1);
        });
    });
});
