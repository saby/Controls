import {CssClassesAssert} from './../../CustomAsserts';
import {CollectionItem} from 'Controls/display';
import {Model} from 'Types/entity';

describe('Controls/display/CollectionItem/ItemActions', () => {
    let rowSeparatorSize;
    let bottomSeparatorVisible;

    const owner = {
        getRowSeparatorSize: () => rowSeparatorSize,
        isBottomSeparatorEnabled: () => bottomSeparatorVisible
    };

    function getItem(options?: object): CollectionItem {
        return new CollectionItem({
            owner,
            ...options,
            isBottomSeparatorEnabled: bottomSeparatorVisible,
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
        bottomSeparatorVisible = false;
    });

    describe('getItemActionClasses', () => {
        it('itemActionsPosition=outside, rowSeparatorSize=s, bottomSeparatorVisible=true', () => {
            rowSeparatorSize = 's';
            bottomSeparatorVisible = true;
            const classes = getItem().getItemActionClasses('outside');
            CssClassesAssert.include(classes, 'controls-itemActionsV__outside_bottom_size-s');
        });

        it('itemActionsPosition=inside, rowSeparatorSize=s, bottomSeparatorVisible=true', () => {
            rowSeparatorSize = 's';
            bottomSeparatorVisible = true;
            const classes = getItem().getItemActionClasses('inside');
            CssClassesAssert.notInclude(classes, 'controls-itemActionsV__outside_bottom_size-s');
            CssClassesAssert.notInclude(classes, 'controls-itemActionsV__outside_bottom_size-default');
        });

        it('itemActionsPosition=outside, rowSeparatorSize=s, bottomSeparatorVisible=false', () => {
            rowSeparatorSize = 's';
            bottomSeparatorVisible = false;
            const classes = getItem().getItemActionClasses('outside');
            CssClassesAssert.notInclude(classes, 'controls-itemActionsV__outside_bottom_size-s');
            CssClassesAssert.include(classes, 'controls-itemActionsV__outside_bottom_size-default');
        });

        it('itemActionsPosition=outside, rowSeparatorSize=null, bottomSeparatorVisible=true', () => {
            bottomSeparatorVisible = true;
            const classes = getItem().getItemActionClasses('outside');
            CssClassesAssert.notInclude(classes, 'controls-itemActionsV__outside_bottom_size-s');
            CssClassesAssert.include(classes, 'controls-itemActionsV__outside_bottom_size-default');
        });
    });
});
