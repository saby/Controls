import {Model} from 'Types/entity';
import {GridCollection, GridDataRow} from 'Controls/grid';
import {CssClassesAssert} from 'ControlsUnit/CustomAsserts';

describe('Controls/grid/Display/Row/firstAndLastItem', () => {
    let groupRow: GridDataRow<Model>;
    let navigationView: string;
    let hasMoreData: boolean;
    const owner = {
        getNavigation: () => ({
            view: navigationView
        }),
        getItems: () => ([groupRow]),
        getCount: () => 1,
        getCollectionCount: () => 1,
        getSourceIndexByItem: () => 0,
        getHasMoreData: () => hasMoreData
    } as undefined as GridCollection<any>;

    beforeEach(() => {
        navigationView = 'page';
        hasMoreData = false;
    });

    it('getItemClasses() should return classes for last group item', () => {
        groupRow = new GridDataRow({
            contents: new Model({
                rawData: { id: 1 },
                keyProperty: 'id'
            }),
            columns: [
                { width: '100px' }
            ],
            isLastItem: true,
            owner
        });
        CssClassesAssert.include(groupRow.getItemClasses({ theme: 'default' }), ['controls-Grid__row_last']);
    });

    it('getItemClasses() should not return classes for last group item when hasMoreData', () => {
        hasMoreData = true;

        groupRow = new GridDataRow({
            contents: new Model({
                rawData: { id: 1 },
                keyProperty: 'id'
            }),
            columns: [
                { width: '100px' }
            ],
            isLastItem: true,
            owner
        });
        CssClassesAssert.include(groupRow.getItemClasses({ theme: 'default' }), ['controls-Grid__row_last']);
    });

    it('getItemClasses() should not return classes for last group item when navigation === \'infinity\'', () => {
        navigationView = 'infinity';

        groupRow = new GridDataRow({
            contents: new Model({
                rawData: { id: 1 },
                keyProperty: 'id'
            }),
            columns: [
                { width: '100px' }
            ],
            isLastItem: true,
            owner
        });
        CssClassesAssert.include(groupRow.getItemClasses({ theme: 'default' }), ['controls-Grid__row_last']);
    });

    it('getItemClasses() should return classes for first group item', () => {
        groupRow = new GridDataRow({
            contents: new Model({
                rawData: { id: 1 },
                keyProperty: 'id'
            }),
            columns: [
                { width: '100px' }
            ],
            isFirstItem: true,
            owner
        });
        CssClassesAssert.include(groupRow.getItemClasses({ theme: 'default' }), ['controls-Grid__row_first']);
    });
});
