import { TreeGridFooterCell } from 'Controls/treeGridNew';
import {CssClassesAssert} from 'ControlsUnit/CustomAsserts';

describe('Controls/treeGrid_clean/Display/MultiSelectVisibility/FooterCell/getWrapperClasses', () => {

    it('exists item with expander', () => {
        const mockedItems = [
            {shouldDisplayExpander: () => true}
        ];

        const mockedOwner = {
            getColumnsConfig: () => [{}],
            getColumnsCount: () => 1,
            getStickyColumnsCount: () => 0,
            getExpanderSize: () => '',
            getActionsTemplateConfig: ()=> {},
            hasMultiSelectColumn: () => false,
            getMultiSelectVisibility: () => 'hidden',
            hasColumnScroll: () => false,
            getLeftPadding: () => '',
            getRightPadding: () => '',
            hasItemActionsSeparatedCell: () => false,
            getColumnIndex: () => 0,
            getOwner: () => {
                return {
                    find: (pred) => mockedItems.find(pred)
                };
            }
        } as any;

        const footerCell = new TreeGridFooterCell({
            owner: mockedOwner,
            column: {}
        });

        CssClassesAssert.include(
            footerCell.getWrapperClasses('mockedTheme', 'mockedBG', 'mockedStyle', false),
            'controls-TreeGridView__footer__expanderPadding-default_theme-mockedTheme'
        );
    });

    it('not exists item with expander', () => {
        const mockedItems = [
            {shouldDisplayExpander: () => false}
        ];

        const mockedOwner = {
            getColumnsConfig: () => [{}],
            getColumnsCount: () => 1,
            getStickyColumnsCount: () => 0,
            getExpanderSize: () => '',
            getActionsTemplateConfig: ()=> {},
            hasMultiSelectColumn: () => false,
            getMultiSelectVisibility: () => 'hidden',
            hasColumnScroll: () => false,
            getLeftPadding: () => '',
            getRightPadding: () => '',
            hasItemActionsSeparatedCell: () => false,
            getColumnIndex: () => 0,
            getOwner: () => {
                return {
                    find: (pred) => mockedItems.find(pred)
                };
            }
        } as any;

        const footerCell = new TreeGridFooterCell({
            owner: mockedOwner,
            column: {}
        });

        CssClassesAssert.notInclude(
            footerCell.getWrapperClasses('mockedTheme', 'mockedBG', 'mockedStyle', false),
            'controls-TreeGridView__footer__expanderPadding-default_theme-mockedTheme'
        );
    });
});
