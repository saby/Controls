import TreeCheckboxCell from "Controls/_treeGrid/display/TreeCheckboxCell";
import {CssClassesAssert} from "ControlsUnit/CustomAsserts";

describe('Controls/_treeGrid/display/TreeGridNodeFooterCell', () => {
    let mockedOwner;

    beforeEach(() => {
        mockedOwner = {
            getHoverBackgroundStyle: () => 'default',
            isDragged: () => false,
            hasItemActionsSeparatedCell: () => false,
            getTopPadding: () => 'default',
            getBottomPadding: () => 'default',
            getLeftPadding: () => 'default',
            getRightPadding: () => 'default',
            getEditingConfig: () => ({
                mode: 'cell'
            }),
            getColumnIndex: () => 0,
            getColumnsCount: () => 1,
            getMultiSelectVisibility: () => 'hidden',
            getEditingBackgroundStyle: () => '',
            getColumnsConfig: () => [1],
            getStickyColumnsCount: () => 0,
            hasMultiSelectColumn: () => false,
            isFullGridSupport: () => false,
            isActive: () => false,
            hasColumnScroll: () => false,
            isEditing: () => false
        };
    });

    describe('getWrapperClasses', () => {
        it('is drag target node', () => {
            mockedOwner.isDragTargetNode = () => true;
            const cell = new TreeCheckboxCell({owner: mockedOwner});
            const classes = cell.getWrapperClasses('default');
            CssClassesAssert.include(classes, 'controls-TreeGridView__dragTargetNode controls-TreeGridView__dragTargetNode_first');
        });

        it('is not drag target node', () => {
            mockedOwner.isDragTargetNode = () => false;
            const cell = new TreeCheckboxCell({owner: mockedOwner});
            const classes = cell.getWrapperClasses('default');
            CssClassesAssert.notInclude(classes, 'controls-TreeGridView__dragTargetNode controls-TreeGridView__dragTargetNode_first');
        });
    });
});
