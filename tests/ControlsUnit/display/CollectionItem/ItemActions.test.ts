import {CssClassesAssert} from './../../CustomAsserts';
import {CollectionItem} from 'Controls/display';
import {Model} from 'Types/entity';

describe('Controls/display/CollectionItem/ItemActions', () => {
    let rowSeparatorSize;
    let isLastItem;

    const owner = {
        getRowSeparatorSize: () => rowSeparatorSize,
        isLastItem: () => isLastItem
    };

    function getItem(options?: object): CollectionItem {
        return new CollectionItem({
            owner,
            ...options,
            contents: new Model({
                keyProperty: 'key',
                rawData: {
                    key: 0
                }
            })
        });
    }

    beforeEach(() => {
        rowSeparatorSize = null;
        isLastItem = false;
    });

    describe('getItemActionClasses', () => {
        it('itemActionsPosition=outside, rowSeparatorSize=s, isLastItem=true', () => {
            rowSeparatorSize = 's';
            isLastItem = true;
            const classes = getItem().getItemActionClasses('outside');
            CssClassesAssert.include(classes, 'controls-itemActionsV__outside_bottom_size-s');
        });

        it('itemActionsPosition=inside, rowSeparatorSize=s, isLastItem=true', () => {
            rowSeparatorSize = 's';
            isLastItem = true;
            const classes = getItem().getItemActionClasses('inside');
            CssClassesAssert.notInclude(classes, 'controls-itemActionsV__outside_bottom_size-s');
            CssClassesAssert.notInclude(classes, 'controls-itemActionsV__outside_bottom_size-default');
        });

        it('itemActionsPosition=outside, rowSeparatorSize=s, isLastItem=false', () => {
            rowSeparatorSize = 's';
            isLastItem = false;
            const classes = getItem().getItemActionClasses('outside');
            CssClassesAssert.notInclude(classes, 'controls-itemActionsV__outside_bottom_size-s');
            CssClassesAssert.include(classes, 'controls-itemActionsV__outside_bottom_size-default');
        });

        it('itemActionsPosition=outside, rowSeparatorSize=null, isLastItem=true', () => {
            isLastItem = true;
            const classes = getItem().getItemActionClasses('outside');
            CssClassesAssert.notInclude(classes, 'controls-itemActionsV__outside_bottom_size-s');
            CssClassesAssert.include(classes, 'controls-itemActionsV__outside_bottom_size-default');
        });
    });
});
