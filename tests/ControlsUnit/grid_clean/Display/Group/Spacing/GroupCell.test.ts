import {GridGroupRow, GridCollection} from 'Controls/grid';
import {CssClassesAssert} from 'ControlsUnit/CustomAsserts';

describe('ControlsUnit/grid_clean/Display/Group/Spacing/GroupCell', () => {
    let hasColumnsScroll: boolean;
    let multiSelectVisibility: string;

    const mockedCollection: GridCollection<any> = {
        getColumnsConfig: () => [{}, {}, {}, {}, {}],
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
        getMultiSelectVisibility: () => multiSelectVisibility,
        isAnimatedForSelection: () => false
    } as undefined as GridCollection<any>;

    beforeEach(() => {
        hasColumnsScroll = false;
        multiSelectVisibility = 'hidden';
    });

    // слева и справа от группировки должен быть разделитель
    it('getContentClasses should return classes for the only column', () => {
        const groupRow = new GridGroupRow({
            owner: mockedCollection,
            columns: mockedCollection.getColumnsConfig()
        });

        const columns = groupRow.getColumns();
        CssClassesAssert.notInclude(columns[0].getContentClasses(''), [
            'controls-controls-Grid__cell_spacingFirstCol_default',
            'controls-controls-Grid__cell_spacingLastCol_default'
        ]);
    });

    // слева и справа от группировки должен быть разделитель даже если включен multiSelect
    it('getContentClasses should return classes for the only column + multiselect', () => {
        multiSelectVisibility = 'visible';
        const groupRow = new GridGroupRow({
            owner: mockedCollection,
            columns: mockedCollection.getColumnsConfig()
        });

        const columns = groupRow.getColumns();
        CssClassesAssert.notInclude(columns[0].getContentClasses(''), [
            'controls-controls-Grid__cell_spacingFirstCol_default',
            'controls-controls-Grid__cell_spacingLastCol_default'
        ]);
    });
});
