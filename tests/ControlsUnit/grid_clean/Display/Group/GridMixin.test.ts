import { assert } from 'chai';

import { Model } from 'Types/entity';
import { IColumn } from 'Controls/interface';

import {
    GridGroupCell as GroupCell,
    GridGroupRow as GroupItem
} from 'Controls/grid';
import {CssClassesAssert} from 'ControlsUnit/CustomAsserts';

describe('Controls/grid/Display/Group/GridMixin', () => {
    let column: IColumn;
    let hasMultiSelectColumn: boolean;

    function getGroupCell(): GroupCell<Model> {
        const owner = {
            hasMultiSelectColumn: () => hasMultiSelectColumn,
            getGroupPaddingClasses: () => 'controls-ListView__groupContent__rightPadding_s'
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

    describe('getContentTextClasses', () => {
        it('should contain placeholder class when no separator and textAlign === right', () => {
            const classes = getGroupCell().getContentTextClasses(false, 'right');
            CssClassesAssert.include(classes, ['controls-ListView__groupContent-withoutGroupSeparator']);
        });

        it('should contain placeholder class when no separator', () => {
            const classes = getGroupCell().getContentTextClasses(false, 'left');
            CssClassesAssert.include(classes, ['controls-ListView__groupContent-withoutGroupSeparator']);
        });

        it('should contain align class', () => {
            let classes: string;
            classes = getGroupCell().getContentTextClasses(false, 'left');
            CssClassesAssert.include(classes, ['controls-ListView__groupContent_left']);

            classes = getGroupCell().getContentTextClasses(false, 'right');
            CssClassesAssert.include(classes, ['controls-ListView__groupContent_right']);

            classes = getGroupCell().getContentTextClasses(false, undefined);
            CssClassesAssert.include(classes, ['controls-ListView__groupContent_center']);
        });

        it('should NOT contain placeholder class when separator and textAlign === right', () => {
            const classes = getGroupCell().getContentTextClasses(true, 'right');
            CssClassesAssert.notInclude(classes, ['controls-ListView__groupContent-withoutGroupSeparator']);
        });
    });
});
