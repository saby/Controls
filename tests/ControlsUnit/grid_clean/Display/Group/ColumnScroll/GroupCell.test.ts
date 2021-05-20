import {GridGroupRow, GridGroupCell, GridItemActionsCell, GridCollection} from 'Controls/grid';
import {assert} from 'chai';
import {CssClassesAssert} from 'ControlsUnit/CustomAsserts';

describe('Controls/grid_clean/Display/Group/ColumnScroll/GroupCell', () => {
    let getStickyColumnsCount: number;
    let hasColumnsScroll: boolean;

    const mockedCollection: GridCollection<any> = {
        getColumnsConfig: () => [{}, {}, {}, {}, {}],
        getStickyColumnsCount: () => getStickyColumnsCount,
        isFullGridSupport: () => true,
        hasMultiSelectColumn: () => false,
        hasColumnScroll: () => hasColumnsScroll,
        hasItemActionsSeparatedCell: () => true,
        isStickyHeader: () => false,
        hasHeader: () => false,
        getResultsPosition: () => undefined,
        getHoverBackgroundStyle: () => 'default',
        isDragged: () => false,
        getTopPadding: () => 'default',
        getBottomPadding: () => 'default',
        getLeftPadding: () => 'default',
        getRightPadding: () => 'default',
        getEditingConfig: () => ({}),
        getColumnIndex: () => 0,
        getColumnsCount: () => 0,
        getMultiSelectVisibility: () => 'hidden',
        isAnimatedForSelection: () => false
    } as undefined as GridCollection<any>;

    beforeEach(() => {
        getStickyColumnsCount = 2;
        hasColumnsScroll = true;
    });

    it('split group on two parts for column scroll: fixed and scrollable', () => {
        const groupRow = new GridGroupRow({
            owner: mockedCollection,
            columns: mockedCollection.getColumnsConfig()
        });

        assert.equal(groupRow.getColumnsCount(), 3);

        assert.instanceOf(groupRow.getColumns()[0], GridGroupCell);
        assert.equal(groupRow.getColumns()[0].getColspan(), 2);

        assert.instanceOf(groupRow.getColumns()[1], GridGroupCell);
        assert.equal(groupRow.getColumns()[1].getColspan(), 3);

        assert.instanceOf(groupRow.getColumns()[2], GridItemActionsCell);
    });

    // Если делим группу на колонки, то надо не только правильный colspan иметь, но и правильные grid-column
    it('has correct getColspanStyles for columns when no column', () => {
        const groupRow = new GridGroupRow({
            owner: mockedCollection,
            columns: mockedCollection.getColumnsConfig()
        });

        const columns = groupRow.getColumns();

        assert.equal(columns[0].getColspanStyles(), 'grid-column: 1 / 3;');
        assert.equal(columns[1].getColspanStyles(), 'grid-column: 3 / 6;');
    });

    // Если никакого columnScroll нет, то и деления на колонки нет
    it('has correct getColspanStyles for columns', () => {
        getStickyColumnsCount = 0;
        hasColumnsScroll = false;
        const groupRow = new GridGroupRow({
            owner: mockedCollection,
            columns: mockedCollection.getColumnsConfig()
        });

        const columns = groupRow.getColumns();

        assert.equal(columns[0].getColspanStyles(), 'grid-column: 1 / 6;');
    });

    // При делении на колонки не надо добавлять межколоночные отступы, т.к. линия разделителя не должна прерыватьсся
    it('getContentClasses should not return classes for padding between columns', () => {
        const groupRow = new GridGroupRow({
            owner: mockedCollection,
            columns: mockedCollection.getColumnsConfig()
        });

        assert.equal(groupRow.getColumnsCount(), 3);

        const columns = groupRow.getColumns();
        CssClassesAssert.notInclude(columns[0].getContentClasses(''), [
            'controls-Grid__cell_spacingLeft',
            'controls-Grid__cell_spacingRight'
        ]);
    });
});
