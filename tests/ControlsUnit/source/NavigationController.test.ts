import 'Core/polyfill/PromiseAPIDeferred';

import {assert} from 'chai';
import {NavigationController} from 'Controls/source';
import {INavigationOptionValue} from 'Controls/interface';
import {RecordSet} from 'Types/collection';
import {
    INavigationPageSourceConfig, INavigationPositionSourceConfig, INavigationSourceConfig, TNavigationDirection
} from 'Controls/_interface/INavigation';
import {CursorDirection} from 'Controls/Constants';
import {
    Direction,
    IAdditionalQueryParams,
    IAdditionQueryParamsMeta
} from 'Controls/_source/interface/IAdditionalQueryParams';
import {SourceFaker} from 'Controls-demo/List/Utils/listDataGenerator';

const fakePageNavigationConfig = (hasMore?: boolean, page: number = 0): INavigationOptionValue<INavigationPageSourceConfig> => {
    return {
        source: 'page',
        sourceConfig: {
            pageSize: 3,
            page,
            hasMore: hasMore !== undefined ? hasMore : false
        } as INavigationPageSourceConfig
    };
};

const fakePositionNavigationConfig = (direction?: TNavigationDirection | CursorDirection): INavigationOptionValue<INavigationPositionSourceConfig> => {
    return {
        source: 'position',
        sourceConfig: {
            limit: 5,
            position: 55,
            direction: direction ? direction : CursorDirection.forward,
            field: 'key'
        } as INavigationPositionSourceConfig
    };
};

const NUMBER_OF_ITEMS = 50;

/*
 * Это действие в контролах производится контролом пейджера при нажатии на кнопку >> или <<
 * @param currentPage
 * @param direction
 */
const pagerFaker = (currentPage: number): (direction: Direction) => number => {
    let page = currentPage;
    return (direction: Direction) => {
        if (direction === 'down') {
            page++;
        } else if (direction === 'up') {
            page--;
        }
        return page;
    };
};

/*
 * считает последнее значение ключевого поля от выбранного набора данных
 * @param rs
 * @param direction
 */
const lastKey = (rs: RecordSet, direction?: Direction): number => {
    return rs.at(rs.getCount() - 1).getKey() + (direction === 'up' ? 1 : 0);
};

/**
 * @see also tests/ControlsUnit/Controllers/SourceController.test.js
 */
describe('Controls/_source/NavigationController', () => {
    let source: SourceFaker;

    let recordSet: RecordSet;
    let moreRecordSet: RecordSet;
    let more2RecordSet: RecordSet;

    beforeEach(() => {
        source = new SourceFaker({perPage: NUMBER_OF_ITEMS, keyProperty: 'key'});
        recordSet = source.querySync().getAll();
        moreRecordSet = source.resetSource(lastKey(recordSet, 'up')).querySync().getAll();
        more2RecordSet = source.resetSource(lastKey(moreRecordSet, 'up')).querySync().getAll();
    });

    describe('getQueryParams with source="page" and hasMore=false', () => {
        let navigation: INavigationOptionValue<INavigationPageSourceConfig>;
        let controller: NavigationController;
        let query: IAdditionalQueryParams;
        let queryMeta: IAdditionQueryParamsMeta;

        beforeEach(() => {
            navigation = fakePageNavigationConfig();
            controller = new NavigationController({navigation});
        });

        it('should build query using PageQueryParamsController', () => {
            query = controller.getQueryParams();
            queryMeta = query.meta;
            assert.equal(queryMeta.navigationType, 'Page');
            assert.equal(query.limit, navigation.sourceConfig.pageSize);
            assert.equal(query.offset, 0);
        });

        it('should correctly set particular page number', () => {
            navigation.sourceConfig.page = 1;
            controller.setConfig(navigation.sourceConfig);
            query = controller.getQueryParams();
            queryMeta = query.meta;
            assert.equal(query.offset, query.limit);
        });

        it('should correctly calculate next and then previous page params', () => {
            const pager = pagerFaker(0);

            // query params for page 0;
            query = controller.getQueryParams();

            // click >>
            query = controller.getQueryParams('down');
            navigation.sourceConfig.page = pager('down');
            controller.setConfig(navigation.sourceConfig);

            // click <<
            query = controller.getQueryParams('up');

            assert.equal(query.offset, 0);
        });
    });

    describe('getQueryParams with "page" navigation in Old-BaseControl-style', () => {
        let navigation: INavigationOptionValue<INavigationPageSourceConfig>;
        let controller: NavigationController;
        let query: IAdditionalQueryParams;

        // Please consider, that QueryParamsController can not calculate 'up' after 'down' or
        // 'down' after 'up' w/o resetting current pager config :(
        describe('should correctly calculate query params with hasMore=false', () => {
            it('should correctly calculate next page params w/o setting particular page', () => {
                navigation = fakePageNavigationConfig(false, 0);
                controller = new NavigationController({navigation});
                recordSet.setMetaData({
                    /*
                     * valid when INavigationOptionValue.hasMore === false
                     */
                    more: NUMBER_OF_ITEMS
                });
                query = controller.getQueryParams();
                assert.equal(query.offset, 0);

                // click >> (correctly calculates the first query params exactly with this direction values ...)
                controller.updateQueryProperties(recordSet, null);
                query = controller.getQueryParams('down');

                assert.equal(query.offset, query.limit);

                moreRecordSet.setMetaData({
                    /*
                     * valid when INavigationOptionValue.direction !== false'
                     */
                    more: NUMBER_OF_ITEMS
                });

                // click >>
                controller.updateQueryProperties(moreRecordSet, 'down');
                query = controller.getQueryParams('down');

                assert.equal(query.offset, query.limit * 2);
            });

            it('should correctly calculate previous page params w/o setting particular page', () => {
                navigation = fakePageNavigationConfig(false, 2);
                controller = new NavigationController({navigation});
                recordSet.setMetaData({
                    /*
                     * valid when INavigationOptionValue.hasMore === false
                     */
                    more: NUMBER_OF_ITEMS
                });

                // click << (correctly calculates the first query params exactly with this direction values ...)
                controller.updateQueryProperties(moreRecordSet, null);
                query = controller.getQueryParams('up');

                assert.equal(query.offset, query.limit);

                moreRecordSet.setMetaData({
                    /*
                     * valid when INavigationOptionValue.direction !== false'
                     */
                    more: NUMBER_OF_ITEMS
                });

                // click <<
                controller.updateQueryProperties(moreRecordSet, 'up');
                query = controller.getQueryParams('up');

                assert.equal(query.offset, 0);
            });
        });

        describe('should correctly calculate query params with hasMore=true', () => {
            it('should correctly calculate next page params w/o setting particular page', () => {
                navigation = fakePageNavigationConfig(true, 0);
                controller = new NavigationController({navigation});
                recordSet.setMetaData({
                    /*
                     * valid when INavigationOptionValue.hasMore === false
                     */
                    more: true
                });
                query = controller.getQueryParams();
                assert.equal(query.offset, 0);

                // click >> (correctly calculates the first query params exactly with this direction values ...)
                controller.updateQueryProperties(recordSet, null);
                query = controller.getQueryParams('down');

                assert.equal(query.offset, query.limit);

                moreRecordSet.setMetaData({
                    /*
                     * valid when INavigationOptionValue.direction !== false'
                     */
                    more: true
                });

                // click >>
                controller.updateQueryProperties(moreRecordSet, 'down');
                query = controller.getQueryParams('down');

                assert.equal(query.offset, query.limit * 2);
            });

            it('should correctly calculate previous page params w/o setting particular page', () => {
                navigation = fakePageNavigationConfig(true, 2);
                controller = new NavigationController({navigation});
                recordSet.setMetaData({
                    /*
                     * valid when INavigationOptionValue.hasMore === false
                     */
                    more: true
                });

                // click << (correctly calculates the first query params exactly with this direction values ...)
                controller.updateQueryProperties(moreRecordSet, null);
                query = controller.getQueryParams('up');

                assert.equal(query.offset, query.limit);

                moreRecordSet.setMetaData({
                    /*
                     * valid when INavigationOptionValue.direction !== false'
                     */
                    more: true
                });

                // click <<
                controller.updateQueryProperties(moreRecordSet, 'up');
                query = controller.getQueryParams('up');

                assert.equal(query.offset, 0);
            });
        });
    });

    describe('getQueryParams with source="position" and direction="forward"', () => {
        let navigation: INavigationOptionValue<INavigationPositionSourceConfig>;
        let controller: NavigationController;
        let query: IAdditionalQueryParams;

        beforeEach(() => {
            navigation = fakePositionNavigationConfig(CursorDirection.forward);
            controller = new NavigationController({navigation});
        });

        it('should build query using PositionQueryParamsController', () => {
            query = controller.getQueryParams();
            const queryMeta = query.meta;
            assert.equal(queryMeta.navigationType, 'Position');
            assert.equal(query.limit, navigation.sourceConfig.limit);
            const where = query.filter;
            assert.equal(where['key>='], navigation.sourceConfig.position);
        });

        it('should correctly build params for first query', () => {
            recordSet.setMetaData({
                /*
                 * valid when INavigationOptionValue.direction !== 'bothways'
                 * OR updateQueryProperties.direction is set
                 */
                more: true
            });
            controller.updateQueryProperties(recordSet, null);
            query = controller.getQueryParams();
            const where = query.filter;
            assert.equal(where['key>='], navigation.sourceConfig.position);
        });
    });

    describe('getQueryParams with source="position" and direction="bothways"', () => {
        let navigation: INavigationOptionValue<INavigationPositionSourceConfig>;
        let controller: NavigationController;
        let query: IAdditionalQueryParams;

        beforeEach(() => {
            navigation = fakePositionNavigationConfig(CursorDirection.bothways);
            controller = new NavigationController({navigation});
        });

        it('Should correctly calculate query params', () => {
            let where;
            moreRecordSet.setMetaData({
                more: {
                    /*
                     * valid when INavigationOptionValue.direction === 'bothways'
                     * and updateQueryProperties.direction isn't set
                     */
                    after: true, before: true
                }
            });
            controller.updateQueryProperties(moreRecordSet, null);

            // when we want to go next before current position
            query = controller.getQueryParams('up');
            where = query.filter;
            assert.equal(where['key<='], lastKey(recordSet, 'up'));

            // when we want to go next after current position
            query = controller.getQueryParams('down');
            where = query.filter;
            assert.equal(where['key>='], lastKey(moreRecordSet, 'down'));

            // when we want to calculate params for current position
            query = controller.getQueryParams();
            where = query.filter;
            assert.equal(where['key~'], navigation.sourceConfig.position);
        });

        it('should correctly calculate previous page params', () => {
            moreRecordSet.setMetaData({
                more: {
                    /*
                     * valid when INavigationOptionValue.direction === 'bothways'
                     * and updateQueryProperties.direction isn't set
                     */
                    after: true, before: true
                }
            });
            controller.updateQueryProperties(moreRecordSet, null);
            more2RecordSet.setMetaData({
                /*
                 * valid when INavigationOptionValue.direction !== 'bothways'
                 * OR updateQueryProperties.direction is set
                 */
                more: true
            });
            controller.updateQueryProperties(more2RecordSet, 'up');
            query = controller.getQueryParams('up');
            const where = query.filter;
            assert.equal(where['key<='], lastKey(moreRecordSet, 'up'));
        });
    });

    describe('getQueryParams with user defined filter and sort', () => {
        let navigation: INavigationOptionValue<INavigationSourceConfig>;
        let controller: NavigationController;
        let query: IAdditionalQueryParams;

        it('Should correctly merge query params + source="position" + direction="forward"', () => {
            navigation = fakePositionNavigationConfig(CursorDirection.forward);
            controller = new NavigationController({navigation});
            recordSet.setMetaData({
                /*
                 * valid when INavigationOptionValue.direction !== 'bothways'
                 * OR updateQueryProperties.direction is set
                 */
                more: true
            });
            controller.updateQueryProperties(recordSet, null);
            const sorting = [{amount: false}, {buyerId: true}];
            query = controller.getQueryParams(null, {
                'buyerId>': 2
            }, sorting);

            const where = query.filter;
            assert.equal(where['buyerId>'], 2);
            assert.equal(where['key>='], (navigation.sourceConfig as INavigationPositionSourceConfig).position);
            assert.equal(query.sorting[1], sorting[1]);
        });
    });
});
