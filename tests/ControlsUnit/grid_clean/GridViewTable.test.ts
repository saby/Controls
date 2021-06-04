import GridViewTable from 'Controls/_grid/GridViewTable';
import {CssClassesAssert as assertClasses} from 'ControlsUnit/CustomAsserts';


describe('Controls/grid_clean/GridViewTable', () => {

    const listModel = {
        isDragging: () => false
    };

    let gridView: typeof GridViewTable;
    let options;

    beforeEach(() => {
        options = {};
    });

    it('_getGridViewClasses', () => {
        gridView = new GridViewTable(options);
        gridView._listModel = listModel;
        assertClasses.include(
            gridView._getGridViewClasses(options),
            'controls-Grid_table-layout controls-Grid_table-layout_fixed'
        );
    });
});
