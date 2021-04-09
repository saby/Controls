import {TreeGridGroupDataRow, TreeGridGroupDataCell} from 'Controls/treeGrid';
import {CssClassesAssert} from 'ControlsUnit/CustomAsserts';

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

    const groupCell = new TreeGridGroupDataCell({
        owner,
        column: {displayProperty: 'key'}
    });

    it('getContentClasses should return group cell content classes', () => {
        CssClassesAssert.include(groupCell.getContentClasses('default'), [
            'controls-Grid__row-cell__content_baseline_S',
            'controls-TreeGrid__row-cell__firstColumn__contentSpacing_null',
            'controls-ListView__groupContent']);
    });

    it('getExpanderClasses should include expander js-class', () => {
        CssClassesAssert.include(groupCell.getExpanderClasses(true, 'right', 'default'),
            'js-controls-Tree__row-expander');
    });

    it('getWrapperClasses should return group cell wrapper classes', () => {
        CssClassesAssert.include(groupCell.getWrapperClasses('default', 'default'), [
            'controls-Grid__row-cell',
            'controls-Grid__cell_default',
            'controls-Grid__row-cell_default',
            'controls-Grid__row-cell_small_min_height',
            'controls-Grid__no-rowSeparator',
            'controls-Grid__row-cell_withRowSeparator_size-null'
        ]);
    });

    it('getWrapperClasses should not include spacingFirstCol class', () => {
        CssClassesAssert.notInclude(groupCell.getWrapperClasses('default', 'default'),
            'controls-Grid__cell_spacingFirstCol_default');
    });
});
