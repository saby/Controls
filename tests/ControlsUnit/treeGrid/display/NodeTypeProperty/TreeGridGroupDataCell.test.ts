import {assert} from 'chai';
import {CssClassesAssert} from 'ControlsUnit/CustomAsserts';

import {TreeGridGroupDataRow, TreeGridGroupDataCell} from 'Controls/treeGrid';

describe('Controls/treeGrid/display/NodeTypeProperty/TreeGridGroupDataCell', () => {

    const owner = {
        getHoverBackgroundStyle: () => 'default',
        isDragged: () => false,
        hasItemActionsSeparatedCell: () => false,
        getTopPadding: () => 'default',
        getBottomPadding: () => 'default',
        getLeftPadding: () => 'default',
        getRightPadding: () => 'default',
        getEditingConfig: () => null,
        getColumnIndex: () => 0,
        getColumnsCount: () => 0,
        getMultiSelectVisibility: () => 'hidden',
        hasMultiSelectColumn: () => false,
        hasColumnScroll: () => false,
        isDragTargetNode: () => false,
        isEditing: () => false,
        shouldDisplayMarker: () => false
    } as undefined as TreeGridGroupDataRow<any>;

    function getGroupCell(options?: object): TreeGridGroupDataCell<any> {
        return new TreeGridGroupDataCell({
            column: {displayProperty: 'key'},
            ...options,
            owner
        });
    }

    it('getContentClasses should return group cell content classes', () => {
        CssClassesAssert.include(getGroupCell().getContentClasses('default'), [
            'controls-ListView__groupContent_baseline_default',
            'controls-ListView__groupContent']);
    });

    it('getExpanderClasses should include expander js-class', () => {
        CssClassesAssert.include(getGroupCell().getExpanderClasses(true, 'right', 'default'),
            'js-controls-Tree__row-expander');
    });

    it('getWrapperClasses should return group cell wrapper classes', () => {
        CssClassesAssert.include(getGroupCell().getWrapperClasses('default', 'default'), [
            'controls-Grid__row-cell',
            'controls-Grid__cell_default',
            'controls-Grid__row-cell_default',
            'controls-Grid__row-cell_small_min_height',
            'controls-Grid__no-rowSeparator',
            'controls-Grid__row-cell_withRowSeparator_size-null'
        ]);
    });

    it('getWrapperClasses should not include spacingFirstCol class', () => {
        CssClassesAssert.notInclude(getGroupCell().getWrapperClasses('default', 'default'),
            'controls-Grid__cell_spacingFirstCol_default');
    });

    it('return default column template when no groupNodeConfig', () => {
        const groupCell = getGroupCell({column: {displayProperty: 'key',  width: '100px'}});
        assert.equal(groupCell.getTemplate(), 'Controls/grid:ColumnTemplate');
    });

    it('return group column template when groupNodeConfig', () => {
        const groupCell = getGroupCell({column: {
            displayProperty: 'key',
            width: '100px',
            groupNodeConfig: {
                textAlign: 'center'
            }
        }});
        assert.equal(groupCell.getTemplate(), 'Controls/treeGrid:GroupColumnTemplate');
    });
});
