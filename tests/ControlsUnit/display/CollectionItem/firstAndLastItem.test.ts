import {Model} from 'Types/entity';
import {Collection, CollectionItem} from 'Controls/display';
import {CssClassesAssert} from 'ControlsUnit/CustomAsserts';

describe('Controls/display/CollectionItem/firstAndLastItem', () => {
    let item: CollectionItem<Model>;
    let navigationView: string;
    let hasMoreData: boolean;
    const owner = {
        getNavigation: () => ({
            view: navigationView
        }),
        getItems: () => ([item]),
        getCount: () => 1,
        getCollectionCount: () => 1,
        getSourceIndexByItem: () => 0,
        getHasMoreData: () => hasMoreData,
        getRowSeparatorSize: () => 's',
        getTopPadding: () => 'default',
        getBottomPadding: () => 'default',
        getRightPadding: () => 'default',
        getLeftPadding: () => 'default'
    } as undefined as Collection<any>;

    beforeEach(() => {
        navigationView = 'page';
        hasMoreData = false;
    });

    it('getContentClasses() should return classes for last group item', () => {
        item = new CollectionItem({
            contents: new Model({
                rawData: { id: 1 },
                keyProperty: 'id'
            }),
            isLastItem: true,
            owner
        });
        CssClassesAssert.include(item.getContentClasses('default'), ['controls-ListView__itemV_last']);
    });

    it('getContentClasses() should not return classes for last group item when hasMoreData', () => {
        hasMoreData = true;

        item = new CollectionItem({
            contents: new Model({
                rawData: { id: 1 },
                keyProperty: 'id'
            }),
            isLastItem: true,
            owner
        });
        CssClassesAssert.include(item.getContentClasses('default'), ['controls-ListView__itemV_last']);
    });

    it('getContentClasses() should not return classes for last group item when navigation === \'infinity\'', () => {
        navigationView = 'infinity';

        item = new CollectionItem({
            contents: new Model({
                rawData: { id: 1 },
                keyProperty: 'id'
            }),
            isLastItem: true,
            owner
        });
        CssClassesAssert.include(item.getContentClasses('default'), ['controls-ListView__itemV_last']);
    });

    it('getContentClasses() should return classes for first group item', () => {
        item = new CollectionItem({
            contents: new Model({
                rawData: { id: 1 },
                keyProperty: 'id'
            }),
            isFirstItem: true,
            owner
        });
        CssClassesAssert.include(item.getContentClasses('default'), ['controls-ListView__itemV_first']);
    });
});
