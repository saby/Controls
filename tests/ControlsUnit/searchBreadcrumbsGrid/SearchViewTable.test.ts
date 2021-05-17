import SearchViewTable from 'Controls/_searchBreadcrumbsGrid/SearchViewTable';
import {CssClassesAssert} from 'ControlsUnit/CustomAsserts';

describe('Controls/_searchBreadcrumbsGrid/SearchViewTable', () => {
    const searchView = new SearchViewTable();
    searchView._listModel = {
        isDragging: () => false
    };

    it('_getGridViewClasses', () => {
        const result = searchView._getGridViewClasses({});
        CssClassesAssert.include(result, 'controls-Grid_table-layout controls-Grid_table-layout_fixed');
    });

    it('_getGridViewStyles', () => {
        const result = searchView._getGridViewStyles({});
        CssClassesAssert.isSame(result, '');
    });
});
