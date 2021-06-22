import { TreeGridFooterCell } from 'Controls/treeGrid';
import {CssClassesAssert} from 'ControlsUnit/CustomAsserts';

describe('Controls/treeGrid_clean/Display/ExpanderPadding/TreeGridFooterCell', () => {
    let mockedOwner;

    beforeEach(() => {
        mockedOwner = {
            getColumnsConfig: () => [{}],
            getColumnsCount: () => 2,
            getStickyColumnsCount: () => 0,
            getExpanderSize: () => '',
            getExpanderIcon: () => '',
            getExpanderPosition: () => 'default',
            getExpanderVisibility: () => 'hasChildren',
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

    it('display expander padding', () => {
        const footerCell = new TreeGridFooterCell({
            displayExpanderPadding: true,
            column: {},
            owner: mockedOwner
        });

        CssClassesAssert.include(
            footerCell.getWrapperClasses('mockedTheme', 'mockedBG', 'mockedStyle', false),
            'controls-TreeGridView__expanderPadding-default'
        );
    });

    it('not display expander padding', () => {
        const footerCell = new TreeGridFooterCell({
            displayExpanderPadding: false,
            column: {},
            owner: mockedOwner
        });

        CssClassesAssert.notInclude(
            footerCell.getWrapperClasses('mockedTheme', 'mockedBG', 'mockedStyle', false),
            'controls-TreeGridView__expanderPadding-default'
        );
    });

    it('setDisplayExpanderPadding', () => {
        const footerCell = new TreeGridFooterCell({
            displayExpanderPadding: false,
            column: {},
            owner: mockedOwner
        });

        CssClassesAssert.notInclude(
            footerCell.getWrapperClasses('mockedTheme', 'mockedBG', 'mockedStyle', false),
            'controls-TreeGridView__expanderPadding-default'
        );

        footerCell.setDisplayExpanderPadding(true);
        CssClassesAssert.include(
            footerCell.getWrapperClasses('mockedTheme', 'mockedBG', 'mockedStyle', false),
            'controls-TreeGridView__expanderPadding-default'
        );
    });

    describe('not full grid support', () => {
        beforeEach(() => {
            mockedOwner.isFullGridSupport = () => false;
        });

        it('wrapper classes don\'t include expander padding classes', () => {
            mockedOwner.getExpanderVisibility = () => 'visible';
            const footerCell = new TreeGridFooterCell({
                displayExpanderPadding: false,
                column: {},
                owner: mockedOwner
            });

            CssClassesAssert.notInclude(
                footerCell.getWrapperClasses('mockedTheme', 'mockedBG', 'mockedStyle', false),
                'controls-TreeGridView__expanderPadding-default'
            );
        });

        it('content classes include expander padding classes', () => {
            const footerCell = new TreeGridFooterCell({
                displayExpanderPadding: true,
                column: {},
                owner: mockedOwner
            });

            CssClassesAssert.include(
                footerCell.getContentClasses(),
                'controls-TreeGridView__expanderPadding-default'
            );
        });
    });
});
