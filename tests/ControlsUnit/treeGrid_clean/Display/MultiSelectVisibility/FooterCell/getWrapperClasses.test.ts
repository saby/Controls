import { assert } from 'chai';
import { TreeGridFooterCell } from 'Controls/treeGrid';
import { createRegExpForTestMatchClass } from 'ControlsUnit/_unitUtils/RegExp';

describe('Controls/treeGrid_clean/Display/MultiSelectVisibility/FooterCell/getWrapperClasses', () => {

    it('hasMultiSelectColumn() returns false, check first cell', () => {
        const mockedOwner = {
            getColumnsConfig: () => [{}],
            getColumnsCount: () => 1,
            getStickyColumnsCount: () => 0,
            getExpanderSize: () => '',
            getExpanderIcon: () => '',
            getExpanderPosition: () => 'default',
            getExpanderVisibility: () => 'hasChildren',
            getActionsTemplateConfig: ()=> {},
            hasMultiSelectColumn: () => false,
            getMultiSelectVisibility: () => 'hidden',
            hasColumnScroll: () => false,
            getLeftPadding: () => '',
            getRightPadding: () => '',
            hasItemActionsSeparatedCell: () => false,
            getColumnIndex: () => 0
        } as any;

        const footerCell = new TreeGridFooterCell({
            owner: mockedOwner,
            column: {}
        });
        assert.match(
            footerCell.getWrapperClasses('mockedTheme', 'mockedBG', 'mockedStyle', false),
            createRegExpForTestMatchClass('controls-TreeGridView__footer__expanderPadding'));
    });

    it('hasMultiSelectColumn() returns true, check first cell (checkbox cell)', () => {
        const mockedOwner = {
            getColumnsConfig: () => [{}],
            getColumnsCount: () => 2,
            getStickyColumnsCount: () => 0,
            getExpanderSize: () => '',
            getExpanderIcon: () => '',
            getExpanderPosition: () => 'default',
            getExpanderVisibility: () => 'hasChildren',
            getActionsTemplateConfig: ()=> {},
            hasMultiSelectColumn: () => true,
            getMultiSelectVisibility: () => 'visible',
            hasColumnScroll: () => false,
            getLeftPadding: () => '',
            getRightPadding: () => '',
            hasItemActionsSeparatedCell: () => false,
            getColumnIndex: () => 0
        } as any;

        const footerCell = new TreeGridFooterCell({
            owner: mockedOwner,
            column: {}
        });

        assert.notMatch(
            footerCell.getWrapperClasses('mockedTheme', 'mockedBG', 'mockedStyle', false),
            createRegExpForTestMatchClass('controls-TreeGridView__footer__expanderPadding'));
    });

    it('hasMultiSelectColumn() returns true, check second cell', () => {
        const mockedOwner = {
            getColumnsConfig: () => [{}],
            getColumnsCount: () => 2,
            getStickyColumnsCount: () => 0,
            getExpanderSize: () => '',
            getExpanderIcon: () => '',
            getExpanderPosition: () => 'default',
            getExpanderVisibility: () => 'hasChildren',
            getActionsTemplateConfig: ()=> {},
            hasMultiSelectColumn: () => true,
            getMultiSelectVisibility: () => 'visible',
            hasColumnScroll: () => false,
            getLeftPadding: () => '',
            getRightPadding: () => '',
            hasItemActionsSeparatedCell: () => false,
            getColumnIndex: () => 1
        } as any;

        const footerCell = new TreeGridFooterCell({
            owner: mockedOwner,
            column: {}
        });

        assert.match(
            footerCell.getWrapperClasses('mockedTheme', 'mockedBG', 'mockedStyle', false),
            createRegExpForTestMatchClass('controls-TreeGridView__footer__expanderPadding'));
    });

});
