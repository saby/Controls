import GridViewTable from 'Controls/_grid/GridViewTable';
import {CssClassesAssert as assertClasses} from 'ControlsUnit/CustomAsserts';


describe('Controls/grid_clean/GridViewTable', () => {

    let gridView: typeof GridViewTable;
    let options;

    beforeEach(() => {
        options = {};
    });

    describe('_getGridViewClasses', () => {
        it('without columnScroll', () => {
            gridView = new GridViewTable(options);
            assertClasses.include(
                gridView._getGridViewClasses(options),
                'controls-Grid_table-layout controls-Grid_table-layout_fixed'
            );
        });

        it('with columnScroll', () => {
            options = {...options, columnScroll: true};
            gridView = new GridViewTable(options);
            assertClasses.include(
                gridView._getGridViewClasses(options),
                'controls-Grid_table-layout controls-Grid_table-layout_auto'
            );
        });
    });
});
