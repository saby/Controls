import { assert } from 'chai';
import { GridEmptyRow } from 'Controls/gridNew';

describe('Controls/grid_clean/Display/EmptyRow', () => {
    describe('single editable cell', () => {
        const mockedOwner = {
            getHoverBackgroundStyle: () => 'default',
            isDragged: () => false,
            hasItemActionsSeparatedCell: () => false,
            getTopPadding: () => 'default',
            getBottomPadding: () => 'default',
            getLeftPadding: () => 'default',
            getRightPadding: () => 'default',
            getMultiSelectVisibility: () => 'hidden',
            hasMultiSelectColumn: () => false,
            isFullGridSupport: () => true,
            getStickyColumnsCount: () => 1
        };

        describe('.getColumns()', () => {
            describe('in grid with ladder', () => {
                it('in full grid support browser', () => {
                    const row = new GridEmptyRow({
                        owner: {
                            ...mockedOwner,
                            getColumnsConfig: () => [{displayProperty: 'key', stickyProperty: 'key'}]
                        },
                        emptyTemplate: 'EMPTY_TEMPLATE',
                        columns: [{displayProperty: 'key', stickyProperty: 'key'}]
                    });

                    assert.equal(row.getColumns()[0].getColspan(), 'grid-column: 1 / 3;');
                });

                it('in old browser', () => {
                    const row = new GridEmptyRow({
                        owner: {
                            ...mockedOwner,
                            getColumnsConfig: () => [{displayProperty: 'key', stickyProperty: 'key'}],
                            isFullGridSupport: () => false
                        },
                        emptyTemplate: 'EMPTY_TEMPLATE',
                        columns: [{displayProperty: 'key', stickyProperty: 'key'}]
                    });

                    assert.equal(row.getColumns()[0].getColspan(), '');
                });
            });

            describe('in grid without ladder', () => {
                it('in full grid support browser', () => {
                    const row = new GridEmptyRow({
                        owner: {
                            ...mockedOwner,
                            getColumnsConfig: () => [{displayProperty: 'key'}]
                        },
                        emptyTemplate: 'EMPTY_TEMPLATE',
                        columns: [{displayProperty: 'key'}]
                    });

                    assert.equal(row.getColumns()[0].getColspan(), '');
                });

                it('in old browser', () => {
                    const row = new GridEmptyRow({
                        owner: {
                            ...mockedOwner,
                            getColumnsConfig: () => [{displayProperty: 'key'}],
                            isFullGridSupport: () => false
                        },
                        emptyTemplate: 'EMPTY_TEMPLATE',
                        columns: [{displayProperty: 'key'}]
                    });

                    assert.equal(row.getColumns()[0].getColspan(), '');
                });
            });
        });
    });

});
