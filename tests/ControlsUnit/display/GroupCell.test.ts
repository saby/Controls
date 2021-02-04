import { assert } from 'chai';

import { Model } from 'Types/entity';
import { IColumn } from 'Controls/grid';

import {
    GridGroupCell as GroupCell,
    GridGroupItem as GroupItem
} from 'Controls/gridNew';

describe('Controls/_display/GroupCell', () => {
    let columns: IColumn[];
    let column: IColumn;
    let hasMultiSelectColumn: boolean;

    function getGroupCell(): GroupCell<Model> {
        const owner = {
            hasMultiSelectColumn: () => hasMultiSelectColumn,
            getGroupPaddingClasses: () => 'controls-Grid__groupContent__spacingRight_s_theme-default'
        } as undefined as GroupItem<Model>;
        return new GroupCell({
            columns,
            column,
            owner
        });
    }

    beforeEach(() => {
        hasMultiSelectColumn = false;
        columns = [
            {width: '1px'},
            {width: '1px'},
            {width: '1px'},
            {width: '1px'}
        ];
        column = columns[1];
    });

    describe('getRightTemplateClasses', () => {
        it('should not add groupContent__spacingRight class', () => {
            const classes = getGroupCell().getRightTemplateClasses(true, undefined, 2, 'left', 'default');
            assert.notInclude(classes, 'controls-Grid__groupContent__spacingRight_s_theme-default');
        });

        it('should add groupContent__spacingRight class when columnAlignGroup === columns.length', () => {
            const classes = getGroupCell().getRightTemplateClasses(true, undefined, 4, 'left', 'default');
            assert.include(classes, 'controls-Grid__groupContent__spacingRight_s_theme-default');
        });

        it('should not add groupContent__spacingRight class when columnAlignGroup is not defined', () => {
            const classes = getGroupCell().getRightTemplateClasses(true, undefined, undefined, 'left', 'default');
            assert.include(classes, 'controls-Grid__groupContent__spacingRight_s_theme-default');
        });

        it('should not add groupContent__spacingRight class when textVisible === false', () => {
            const classes = getGroupCell().getRightTemplateClasses(true, false, 2, 'left', 'default');
            assert.include(classes, 'controls-Grid__groupContent__spacingRight_s_theme-default');
        });

        it('should add separator placeholder when textVisible === false', () => {
            const classes = getGroupCell().getRightTemplateClasses(false, false, 2, 'right', 'default');
            assert.include(classes, 'controls-ListView__groupContent-withoutGroupSeparator');
        });

        it('should add separator placeholder when columnAlignGroup is not defined and textAlign !== "right"', () => {
            const classes = getGroupCell().getRightTemplateClasses(false, undefined, undefined, 'left', 'default');
            assert.include(classes, 'controls-ListView__groupContent-withoutGroupSeparator');
        });

        it('should not add separator placeholder when separatorVisibility === true', () => {
            const classes = getGroupCell().getRightTemplateClasses(true, false, undefined, 'left', 'default');
            assert.notInclude(classes, 'controls-ListView__groupContent-withoutGroupSeparator');
        });

        it('should not add separator placeholder when columnAlignGroup is defined and textAlign === "right" && textVisible === true', () => {
            const classes = getGroupCell().getRightTemplateClasses(false, true, 2, 'right', 'default');
            assert.notInclude(classes, 'controls-ListView__groupContent-withoutGroupSeparator');
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
