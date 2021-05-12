import { assert } from 'chai';

import { Model } from 'Types/entity';
import { IColumn } from 'Controls/interface';

import {
    GridGroupCell as GroupCell,
    GridGroupRow as GroupItem
} from 'Controls/grid';
import {CssClassesAssert} from 'ControlsUnit/CustomAsserts';

describe('Controls/_display/GroupCell', () => {
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

    describe('getRightTemplateClasses', () => {
        it('should not add rightPadding_s class', () => {
            const classes = getGroupCell().getRightTemplateClasses(true, undefined, 2);
            CssClassesAssert.notInclude(classes, ['controls-ListView__groupContent__rightPadding_s']);
        });

        it('should add rightPadding_st class when columnAlignGroup === columns.length', () => {
            const classes = getGroupCell().getRightTemplateClasses(true, undefined, 4);
            CssClassesAssert.include(classes, ['controls-ListView__groupContent__rightPadding_s']);
        });

        it('should add rightPadding_s class when columnAlignGroup is not defined', () => {
            const classes = getGroupCell().getRightTemplateClasses(true, undefined, undefined);
            CssClassesAssert.include(classes, ['controls-ListView__groupContent__rightPadding_s']);
        });

        it('should add rightPadding_s class when textVisible === false', () => {
            const classes = getGroupCell().getRightTemplateClasses(true, false, 2);
            CssClassesAssert.include(classes, ['controls-ListView__groupContent__rightPadding_s']);
        });

        it('should add separator placeholder when textVisible === false', () => {
            const classes = getGroupCell().getRightTemplateClasses(false, false, 2);
            CssClassesAssert.include(classes, ['controls-ListView__groupContent-withoutGroupSeparator']);
        });

        it('should not add separator placeholder when separatorVisibility === true', () => {
            const classes = getGroupCell().getRightTemplateClasses(true, false, undefined);
            CssClassesAssert.notInclude(classes, ['controls-ListView__groupContent-withoutGroupSeparator']);
        });

        it('should not add separator placeholder when columnAlignGroup is defined and textAlign === "right" && textVisible === true', () => {
            const classes = getGroupCell().getRightTemplateClasses(false, true, 2);
            CssClassesAssert.notInclude(classes, ['controls-ListView__groupContent-withoutGroupSeparator']);
        });
    });
});
