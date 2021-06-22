import { TreeGridFooterCell } from 'Controls/treeGrid';
import {CssClassesAssert} from 'ControlsUnit/CustomAsserts';

describe('Controls/treeGrid_clean/Display/HasNode/TreeGridFooterCell', () => {
    let mockedOwner;

    beforeEach(() => {
        mockedOwner = {
            getColumnsConfig: () => [{}],
            getColumnsCount: () => 2,
            getStickyColumnsCount: () => 0,
            getExpanderSize: () => '',
            getExpanderIcon: () => '',
            getExpanderPosition: () => 'default',
            getExpanderVisibility: () => 'visible',
            getActionsTemplateConfig: () => {},
            hasMultiSelectColumn: () => false,
            getMultiSelectVisibility: () => 'visible',
            hasColumnScroll: () => false,
            getLeftPadding: () => '',
            getRightPadding: () => '',
            hasItemActionsSeparatedCell: () => false,
            getColumnIndex: () => 0,
            isFullGridSupport: () => true
        } as any;
    });

    it('exists node in list', () => {
        const footerCell = new TreeGridFooterCell({
            hasNode: true,
            column: {},
            owner: mockedOwner
        });

        CssClassesAssert.include(
            footerCell.getWrapperClasses('mockedTheme', 'mockedBG', 'mockedStyle', false),
            'controls-TreeGridView__footer__expanderPadding-default'
        );
    });

    it('not exists node in list', () => {
        const footerCell = new TreeGridFooterCell({
            hasNode: false,
            column: {},
            owner: mockedOwner
        });

        CssClassesAssert.notInclude(
            footerCell.getWrapperClasses('mockedTheme', 'mockedBG', 'mockedStyle', false),
            'controls-TreeGridView__footer__expanderPadding-default'
        );
    });
});
