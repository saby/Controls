import { TreeGridFooterCell } from 'Controls/treeGrid';
import {CssClassesAssert} from 'ControlsUnit/CustomAsserts';

describe('Controls/treeGrid_clean/Display/HasNodeWithChildren/TreeGridFooterCell', () => {
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

    it('exists item with expander', () => {
        const footerCell = new TreeGridFooterCell({
            hasNodeWithChildren: true,
            column: {},
            owner: mockedOwner
        });

        CssClassesAssert.include(
            footerCell.getWrapperClasses('mockedTheme', 'mockedBG', 'mockedStyle', false),
            'controls-TreeGridView__footer__expanderPadding-default'
        );
    });

    it('not exists item with expander', () => {
        const footerCell = new TreeGridFooterCell({
            hasNodeWithChildren: false,
            column: {},
            owner: mockedOwner
        });

        CssClassesAssert.notInclude(
            footerCell.getWrapperClasses('mockedTheme', 'mockedBG', 'mockedStyle', false),
            'controls-TreeGridView__footer__expanderPadding-default'
        );
    });

    it('setHasNodeWithChildren', () => {
        const footerCell = new TreeGridFooterCell({
            hasNodeWithChildren: false,
            column: {},
            owner: mockedOwner
        });

        CssClassesAssert.notInclude(
            footerCell.getWrapperClasses('mockedTheme', 'mockedBG', 'mockedStyle', false),
            'controls-TreeGridView__footer__expanderPadding-default'
        );

        footerCell.setHasNodeWithChildren(true);
        CssClassesAssert.include(
            footerCell.getWrapperClasses('mockedTheme', 'mockedBG', 'mockedStyle', false),
            'controls-TreeGridView__footer__expanderPadding-default'
        );
    });

    it('custom expander position', () => {
        mockedOwner.getExpanderPosition = () => 'custom';
        const footerCell = new TreeGridFooterCell({
            hasNodeWithChildren: true,
            column: {},
            owner: mockedOwner
        });

        CssClassesAssert.notInclude(
            footerCell.getWrapperClasses('mockedTheme', 'mockedBG', 'mockedStyle', false),
            'controls-TreeGridView__footer__expanderPadding-default'
        );
    });

    it('expander icon is none', () => {
        mockedOwner.getExpanderIcon = () => 'none';
        const footerCell = new TreeGridFooterCell({
            hasNodeWithChildren: true,
            column: {},
            owner: mockedOwner
        });

        CssClassesAssert.notInclude(
            footerCell.getWrapperClasses('mockedTheme', 'mockedBG', 'mockedStyle', false),
            'controls-TreeGridView__footer__expanderPadding-default'
        );
    });

    it('expander visibility is visible', () => {
        mockedOwner.getExpanderVisibility = () => 'visible';
        const footerCell = new TreeGridFooterCell({
            hasNodeWithChildren: false,
            column: {},
            owner: mockedOwner
        });

        CssClassesAssert.include(
            footerCell.getWrapperClasses('mockedTheme', 'mockedBG', 'mockedStyle', false),
            'controls-TreeGridView__footer__expanderPadding-default'
        );
    });

    describe('not full grid support', () => {
        beforeEach(() => {
            mockedOwner.isFullGridSupport = () => false;
        });

        it('wrapper classes don\'t include expander padding classes', () => {
            mockedOwner.getExpanderVisibility = () => 'visible';
            const footerCell = new TreeGridFooterCell({
                hasNodeWithChildren: false,
                column: {},
                owner: mockedOwner
            });

            CssClassesAssert.notInclude(
                footerCell.getWrapperClasses('mockedTheme', 'mockedBG', 'mockedStyle', false),
                'controls-TreeGridView__footer__expanderPadding-default'
            );
        });

        it('content classes include expander padding classes', () => {
            mockedOwner.getExpanderVisibility = () => 'visible';
            const footerCell = new TreeGridFooterCell({
                hasNodeWithChildren: false,
                column: {},
                owner: mockedOwner
            });

            CssClassesAssert.include(
                footerCell.getContentClasses(),
                'controls-TreeGridView__footer__expanderPadding-default'
            );
        });
    });
});
