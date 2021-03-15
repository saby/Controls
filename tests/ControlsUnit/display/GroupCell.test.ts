import { assert } from 'chai';

import { Model } from 'Types/entity';
import { IColumn } from 'Controls/interface';

import {
    GridGroupCell as GroupCell,
    GridGroupRow as GroupItem
} from 'Controls/gridNew';
import {CssClassesAssert} from 'ControlsUnit/CustomAsserts';

describe('Controls/_display/GroupCell', () => {
    let column: IColumn;
    let hasMultiSelectColumn: boolean;

    function getGroupCell(): GroupCell<Model> {
        const owner = {
            hasMultiSelectColumn: () => hasMultiSelectColumn,
            getGroupPaddingClasses: () => 'controls-ListView__groupContent__rightPadding_s_theme-default'
        } as undefined as GroupItem<Model>;
        return new GroupCell({
            contents: {},
            columnsLength: 4,
            column,
            owner
        });
    }

    beforeEach(() => {
        hasMultiSelectColumn = false;
        column = { width: '150' };
    });

    describe('getRightTemplateClasses', () => {
        it('should not add rightPadding_s class', () => {
            const classes = getGroupCell().getRightTemplateClasses(true, undefined, 2, 'left', 'default');
            CssClassesAssert.notInclude(classes, ['controls-ListView__groupContent__rightPadding_s_theme-default']);
        });

        it('should add rightPadding_st class when columnAlignGroup === columns.length', () => {
            const classes = getGroupCell().getRightTemplateClasses(true, undefined, 4, 'left', 'default');
            CssClassesAssert.include(classes, ['controls-ListView__groupContent__rightPadding_s_theme-default']);
        });

        it('should add rightPadding_s class when columnAlignGroup is not defined', () => {
            const classes = getGroupCell().getRightTemplateClasses(true, undefined, undefined, 'left', 'default');
            CssClassesAssert.include(classes, ['controls-ListView__groupContent__rightPadding_s_theme-default']);
        });

        it('should add rightPadding_s class when textVisible === false', () => {
            const classes = getGroupCell().getRightTemplateClasses(true, false, 2, 'left', 'default');
            CssClassesAssert.include(classes, ['controls-ListView__groupContent__rightPadding_s_theme-default']);
        });

        it('should add separator placeholder when textVisible === false', () => {
            const classes = getGroupCell().getRightTemplateClasses(false, false, 2, 'right', 'default');
            CssClassesAssert.include(classes, ['controls-ListView__groupContent-withoutGroupSeparator']);
        });

        it('should add separator placeholder when columnAlignGroup is not defined and textAlign !== "right"', () => {
            const classes = getGroupCell().getRightTemplateClasses(false, undefined, undefined, 'left', 'default');
            CssClassesAssert.include(classes, ['controls-ListView__groupContent-withoutGroupSeparator']);
        });

        it('should not add separator placeholder when separatorVisibility === true', () => {
            const classes = getGroupCell().getRightTemplateClasses(true, false, undefined, 'left', 'default');
            CssClassesAssert.notInclude(classes, ['controls-ListView__groupContent-withoutGroupSeparator']);
        });

        it('should not add separator placeholder when columnAlignGroup is defined and textAlign === "right" && textVisible === true', () => {
            const classes = getGroupCell().getRightTemplateClasses(false, true, 2, 'right', 'default');
            CssClassesAssert.notInclude(classes, ['controls-ListView__groupContent-withoutGroupSeparator']);
        });
    });

    describe('shouldDisplayLeftSeparator', () => {
        it('should return true when columnAlignGroup !== undefined and textAlign === \'left\'', () => {
            const result = getGroupCell().shouldDisplayLeftSeparator(true, undefined, 2, 'left');
            assert.isTrue(result);
        });

        it('should return true when columnAlignGroup === undefined and textAlign !== \'left\'', () => {
            const result = getGroupCell().shouldDisplayLeftSeparator(true, undefined, undefined, 'right');
            assert.isTrue(result);
        });

        it('should not return true when columnAlignGroup === undefined and textAlign === \'left\'', () => {
            const result = getGroupCell().shouldDisplayLeftSeparator(true, undefined, undefined, 'left');
            assert.isFalse(result);
        });

        it('should not return true when textVisible === false', () => {
            const result = getGroupCell().shouldDisplayLeftSeparator(true, false, 2, 'right');
            assert.isFalse(result);
        });

        it('should not return true when separatorVisibility === false', () => {
            const result = getGroupCell().shouldDisplayLeftSeparator(false, undefined, 2, 'right');
            assert.isFalse(result);
        });
    });

    describe('shouldDisplayRightSeparator', () => {
        it('should return true when columnAlignGroup !== undefined and textVisible === false and textAlign === \'right\'', () => {
            const result = getGroupCell().shouldDisplayRightSeparator(true, false, 2, 'right');
            assert.isTrue(result);
        });

        it('should return true when columnAlignGroup === undefined', () => {
            const result = getGroupCell().shouldDisplayRightSeparator(true, false, undefined, 'left');
            assert.isTrue(result);
        });

        it('should return true when textVisible !== false', () => {
            const result = getGroupCell().shouldDisplayRightSeparator(true, undefined, 2, 'left');
            assert.isTrue(result);
        });

        it('should return false when columnAlignGroup === undefined and textVisible !== false and textAlign === \'right\'', () => {
            const result = getGroupCell().shouldDisplayRightSeparator(true, undefined, undefined, 'right');
            assert.isFalse(result);
        });

        it('should return false when separatorVisibility === false', () => {
            const result = getGroupCell().shouldDisplayRightSeparator(false, false, 2, 'left');
            assert.isFalse(result);
        });
    });
});
