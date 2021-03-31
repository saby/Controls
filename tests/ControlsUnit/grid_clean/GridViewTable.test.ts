import GridViewTable from 'Controls/_grid/GridViewTable';
import {CssClassesAssert as assertClasses} from 'ControlsUnit/CustomAsserts';


describe('Controls/grid_clean/GridViewTable', () => {

    let gridView: typeof GridViewTable;
    let options = {};

    beforeEach(() => {
        gridView = new GridViewTable(options);
    });

    it('_getGridViewClasses', () => {
        assertClasses.include(
            gridView._getGridViewClasses(options),
            'controls-Grid_table-layout controls-Grid_table-layout_fixed'
        );
    });
});
