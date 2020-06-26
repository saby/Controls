import {assert} from 'chai';
import {Memory} from 'Types/source';
import {Record} from 'Types/entity';
import {RecordSet} from 'Types/collection';
import {NavigationController} from 'Controls/source';

const dataPrev = [
    {
        id : 1,
        title : 'Первый',
        type: 1
    },
    {
        id : 2,
        title : 'Второй',
        type: 2
    },
    {
        id : 3,
        title : 'Третий',
        type: 2
    }
];

const data = [
    {
        id : 4,
        title : 'Четвертый',
        type: 1
    },
    {
        id : 5,
        title : 'Пятый',
        type: 2
    },
    {
        id : 6,
        title : 'Шестой',
        type: 2
    }
];

const dataNext = [
    {
        id : 7,
        title : 'Седьмой',
        type: 1
    },
    {
        id : 8,
        title : 'Восьмой',
        type: 2
    },
    {
        id : 9,
        title : 'Девятый',
        type: 2
    }
];

const defFilter = {a: 'a', b: 'b'};
const defSorting = [{x: 'DESC'}, {y: 'ASC'}];
const TEST_PAGE_SIZE = 3;

describe('Controls/_source/NavigationController', () => {
    describe('Page navigation', () => {
        describe('Without config', () => {
            it('getQueryParams root', () => {
                const nc = new NavigationController({
                    navigationType: 'page',
                    navigationConfig: {
                        page: 0,
                        pageSize: TEST_PAGE_SIZE,
                        hasMore: true
                    }
                });

                const params = nc.getQueryParams({filter: defFilter, sorting: defSorting});
                assert.equal(TEST_PAGE_SIZE, params.limit, 'Wrong query params');
                assert.equal(0, params.offset, 'Wrong query params');
            });

            it('getQueryParams root + forward', () => {
                const nc = new NavigationController({
                    navigationType: 'page',
                    navigationConfig: {
                        page: 0,
                        pageSize: TEST_PAGE_SIZE,
                        hasMore: true
                    }
                });

                const params = nc.getQueryParams({filter: defFilter, sorting: defSorting}, null, 'forward');
                assert.equal(TEST_PAGE_SIZE, params.limit, 'Wrong query params');
                assert.equal(TEST_PAGE_SIZE, params.offset, 'Wrong query params');
            });

            it('getQueryParams root + backward', () => {
                const nc = new NavigationController({
                    navigationType: 'page',
                    navigationConfig: {
                        page: 2,
                        pageSize: TEST_PAGE_SIZE,
                        hasMore: true
                    }
                });

                const params = nc.getQueryParams({filter: defFilter, sorting: defSorting}, null, 'backward');
                assert.equal(TEST_PAGE_SIZE, params.limit, 'Wrong query params');
                assert.equal(TEST_PAGE_SIZE, params.offset, 'Wrong query params');
            });

            it('updateQueryProperties root', () => {
                const nc = new NavigationController({
                    navigationType: 'page',
                    navigationConfig: {
                        page: 0,
                        pageSize: TEST_PAGE_SIZE,
                        hasMore: true
                    }
                });

                const rs = new RecordSet({
                    rawData: data,
                    keyProperty: 'id'
                });

                const params = nc.updateQueryProperties(rs);
                assert.equal(1, params.nextPage, 'Wrong query properties');
                assert.equal(-1, params.prevPage, 'Wrong query properties');
            });

            it('updateQueryProperties root + forward', () => {
                const START_PAGE = 0;
                const nc = new NavigationController({
                    navigationType: 'page',
                    navigationConfig: {
                        page: START_PAGE,
                        pageSize: TEST_PAGE_SIZE,
                        hasMore: true
                    }
                });

                const rs = new RecordSet({
                    rawData: data,
                    keyProperty: 'id'
                });

                const params = nc.updateQueryProperties(rs, null, undefined, 'forward');
                assert.equal(START_PAGE + 2, params.nextPage, 'Wrong query properties');
                assert.equal(START_PAGE - 1, params.prevPage, 'Wrong query properties');
            });

            it('updateQueryProperties root + backward', () => {
                const START_PAGE = 2;
                const nc = new NavigationController({
                    navigationType: 'page',
                    navigationConfig: {
                        page: START_PAGE,
                        pageSize: TEST_PAGE_SIZE,
                        hasMore: true
                    }
                });

                const rs = new RecordSet({
                    rawData: data,
                    keyProperty: 'id'
                });

                const params = nc.updateQueryProperties(rs, null, undefined, 'backward');
                assert.equal(START_PAGE + 1, params.nextPage, 'Wrong query properties');
                assert.equal(START_PAGE - 2, params.prevPage, 'Wrong query properties');
            });

            it('hasMoreData undefined false root', () => {
                const START_PAGE = 0;
                const nc = new NavigationController({
                    navigationType: 'page',
                    navigationConfig: {
                        page: START_PAGE,
                        pageSize: TEST_PAGE_SIZE,
                        hasMore: false
                    }
                });

                const rs = new RecordSet({
                    rawData: data,
                    keyProperty: 'id'
                });

                const params = nc.updateQueryProperties(rs);
                let hasMore = nc.hasMoreData('forward');
                assert.isFalse(hasMore, 'Wrong more value');
                hasMore = nc.hasMoreData('backward');
                assert.isFalse(hasMore, 'Wrong more value');
            });

            it('hasMoreData integer false root', () => {
                const START_PAGE = 0;
                const nc = new NavigationController({
                    navigationType: 'page',
                    navigationConfig: {
                        page: START_PAGE,
                        pageSize: TEST_PAGE_SIZE,
                        hasMore: false
                    }
                });

                const rs = new RecordSet({
                    rawData: data,
                    keyProperty: 'id'
                });

                rs.setMetaData({more: 3});

                const params = nc.updateQueryProperties(rs);
                let hasMore = nc.hasMoreData('forward');
                assert.isFalse(hasMore, 'Wrong more value');
                hasMore = nc.hasMoreData('backward');
                assert.isFalse(hasMore, 'Wrong more value');
            });

            it('hasMoreData integer true root', () => {
                const START_PAGE = 2;
                const nc = new NavigationController({
                    navigationType: 'page',
                    navigationConfig: {
                        page: START_PAGE,
                        pageSize: TEST_PAGE_SIZE,
                        hasMore: false
                    }
                });

                const rs = new RecordSet({
                    rawData: data,
                    keyProperty: 'id'
                });

                rs.setMetaData({more: 10});

                const params = nc.updateQueryProperties(rs);
                let hasMore = nc.hasMoreData('forward');
                assert.isTrue(hasMore, 'Wrong more value');
                hasMore = nc.hasMoreData('backward');
                assert.isTrue(hasMore, 'Wrong more value');
            });

            it('hasMoreData boolean true root', () => {
                const START_PAGE = 0;
                const nc = new NavigationController({
                    navigationType: 'page',
                    navigationConfig: {
                        page: START_PAGE,
                        pageSize: TEST_PAGE_SIZE,
                        hasMore: true
                    }
                });

                const rs = new RecordSet({
                    rawData: data,
                    keyProperty: 'id'
                });

                rs.setMetaData({more: false});

                const params = nc.updateQueryProperties(rs);
                let hasMore = nc.hasMoreData('forward');
                assert.isFalse(hasMore, 'Wrong more value');
                hasMore = nc.hasMoreData('backward');
                assert.isFalse(hasMore, 'Wrong more value');
            });
        });

    });
    describe('Position navigation', () => {
        describe('Without config', () => {
            it('getQueryParams compatible direction=bothways', () => {
                const QUERY_LIMIT = 3;
                let nc = new NavigationController({
                    navigationType: 'position',
                    navigationConfig: {
                        position: 1,
                        field: 'id',
                        direction: 'both',
                        limit: QUERY_LIMIT
                    }
                });

                let params = nc.getQueryParams({filter: defFilter, sorting: defSorting});
                assert.equal(1, params.filter['id~'], 'Wrong query params');
                assert.equal(QUERY_LIMIT, params.limit, 'Wrong query params');

                nc = new NavigationController({
                    navigationType: 'position',
                    navigationConfig: {
                        position: 1,
                        field: 'id',
                        direction: 'after',
                        limit: 3
                    }
                });

                params = nc.getQueryParams({filter: defFilter, sorting: defSorting});
                assert.equal(1, params.filter['id>='], 'Wrong query params');

                nc = new NavigationController({
                    navigationType: 'position',
                    navigationConfig: {
                        position: 1,
                        field: 'id',
                        direction: 'before',
                        limit: 3
                    }
                });

                params = nc.getQueryParams({filter: defFilter, sorting: defSorting});
                assert.equal(1, params.filter['id<='], 'Wrong query params');
            });

            it('getQueryParams root direction=bothways', () => {
                const QUERY_LIMIT = 3;
                const nc = new NavigationController({
                    navigationType: 'position',
                    navigationConfig: {
                        position: 1,
                        field: 'id',
                        direction: 'bothways',
                        limit: QUERY_LIMIT
                    }
                });

                const params = nc.getQueryParams({filter: defFilter, sorting: defSorting});
                assert.equal(1, params.filter['id~'], 'Wrong query params');
                assert.equal(QUERY_LIMIT, params.limit, 'Wrong query params');
            });

            it('getQueryParams root direction=forward', () => {
                const nc = new NavigationController({
                    navigationType: 'position',
                    navigationConfig: {
                        position: 1,
                        field: 'id',
                        direction: 'forward',
                        limit: 3
                    }
                });

                const params = nc.getQueryParams({filter: defFilter, sorting: defSorting});
                assert.equal(1, params.filter['id>='], 'Wrong query params');
            });

            it('getQueryParams root direction=backward', () => {
                const nc = new NavigationController({
                    navigationType: 'position',
                    navigationConfig: {
                        position: 1,
                        field: 'id',
                        direction: 'backward',
                        limit: 3
                    }
                });

                const params = nc.getQueryParams({filter: defFilter, sorting: defSorting});
                assert.equal(1, params.filter['id<='], 'Wrong query params');
            });

            it('getQueryParams root direction=bothways load forward', () => {
                const nc = new NavigationController({
                    navigationType: 'position',
                    navigationConfig: {
                        position: 1,
                        field: 'id',
                        direction: 'bothways',
                        limit: 3
                    }
                });

                // if it is first call without updateQueryProperties before it, position should be null
                // because backwardPosition isn't initialized
                const params = nc.getQueryParams({filter: defFilter, sorting: defSorting}, null, 'forward');
                assert.equal(null, params.filter['id>='], 'Wrong query params');
            });

            it('getQueryParams root direction=bothways load backward', () => {
                const nc = new NavigationController({
                    navigationType: 'position',
                    navigationConfig: {
                        position: 1,
                        field: 'id',
                        direction: 'bothways',
                        limit: 3
                    }
                });

                // if it is first call without updateQueryProperties before it, position should be null
                // because backwardPosition isn't initialized
                const params = nc.getQueryParams({filter: defFilter, sorting: defSorting}, null, 'backward');
                assert.equal(null, params.filter['id<='], 'Wrong query params');
            });

            it('updateQueryProperties root', () => {
                const nc = new NavigationController({
                    navigationType: 'position',
                    navigationConfig: {
                        field: 'id',
                        direction: 'bothways'
                    }
                });

                const rs = new RecordSet({
                    rawData: data,
                    keyProperty: 'id'
                });

                let params = nc.updateQueryProperties(rs);
                assert.deepEqual([6], params.forwardPosition, 'Wrong query properties');
                assert.deepEqual([4], params.backwardPosition, 'Wrong query properties');

                const rsforward = new RecordSet({
                    rawData: dataNext,
                    keyProperty: 'id'
                });

                params = nc.updateQueryProperties(rsforward, null, undefined, 'forward');
                assert.deepEqual([9], params.forwardPosition, 'Wrong query properties');
                assert.deepEqual([4], params.backwardPosition, 'Wrong query properties');

                const rsbackward = new RecordSet({
                    rawData: dataPrev,
                    keyProperty: 'id'
                });

                params = nc.updateQueryProperties(rsbackward, null, undefined, 'backward');
                assert.deepEqual([9], params.forwardPosition, 'Wrong query properties');
                assert.deepEqual([1], params.backwardPosition, 'Wrong query properties');
            });

            it('updateQueryProperties compatible + meta.NextPosition root', () => {
                const nc = new NavigationController({
                    navigationType: 'position',
                    navigationConfig: {
                        field: 'id',
                        direction: 'bothways'
                    }
                });

                const rs = new RecordSet({
                    rawData: data,
                    keyProperty: 'id'
                });

                rs.setMetaData({nextPosition : {before: [-1], after: [10]}});

                const params = nc.updateQueryProperties(rs);
                assert.deepEqual([10], params.forwardPosition, 'Wrong query properties');
                assert.deepEqual([-1], params.backwardPosition, 'Wrong query properties');
            });

            it('updateQueryProperties bothways + meta.NextPosition root', () => {
                const nc = new NavigationController({
                    navigationType: 'position',
                    navigationConfig: {
                        field: 'id',
                        direction: 'bothways'
                    }
                });

                const rs = new RecordSet({
                    rawData: data,
                    keyProperty: 'id'
                });

                rs.setMetaData({nextPosition : {backward: [-1], forward: [10]}});

                const params = nc.updateQueryProperties(rs);
                assert.deepEqual([10], params.forwardPosition, 'Wrong query properties');
                assert.deepEqual([-1], params.backwardPosition, 'Wrong query properties');
            });

            it('updateQueryProperties forward + meta.NextPosition root', () => {
                const nc = new NavigationController({
                    navigationType: 'position',
                    navigationConfig: {
                        field: 'id',
                        direction: 'forward'
                    }
                });

                const rs = new RecordSet({
                    rawData: data,
                    keyProperty: 'id'
                });

                rs.setMetaData({nextPosition : [10]});

                const params = nc.updateQueryProperties(rs);
                assert.deepEqual([10], params.forwardPosition, 'Wrong query properties');
            });

            it('updateQueryProperties forward + meta.NextPosition root', () => {
                const nc = new NavigationController({
                    navigationType: 'position',
                    navigationConfig: {
                        field: 'id',
                        direction: 'backward'
                    }
                });

                const rs = new RecordSet({
                    rawData: data,
                    keyProperty: 'id'
                });

                rs.setMetaData({nextPosition : [-1]});

                const params = nc.updateQueryProperties(rs);
                assert.deepEqual([-1], params.backwardPosition, 'Wrong query properties');
            });

            it('hasMoreData botways compatible values false root', () => {
                const nc = new NavigationController({
                    navigationType: 'position',
                    navigationConfig: {
                        field: 'id',
                        direction: 'bothways'
                    }
                });

                const rs = new RecordSet({
                    rawData: data,
                    keyProperty: 'id'
                });

                rs.setMetaData({more : {before: true, after: false}});

                const params = nc.updateQueryProperties(rs);
                let hasMore = nc.hasMoreData('forward');
                assert.isFalse(hasMore, 'Wrong more value');
                hasMore = nc.hasMoreData('backward');
                assert.isTrue(hasMore, 'Wrong more value');
            });

            it('hasMoreData bothways values false root', () => {
                const nc = new NavigationController({
                    navigationType: 'position',
                    navigationConfig: {
                        field: 'id',
                        direction: 'bothways'
                    }
                });

                const rs = new RecordSet({
                    rawData: data,
                    keyProperty: 'id'
                });

                rs.setMetaData({more : {backward: true, forward: false}});

                const params = nc.updateQueryProperties(rs);
                let hasMore = nc.hasMoreData('forward');
                assert.isFalse(hasMore, 'Wrong more value');
                hasMore = nc.hasMoreData('backward');
                assert.isTrue(hasMore, 'Wrong more value');
            });

            it('hasMoreData forward values false root', () => {
                const nc = new NavigationController({
                    navigationType: 'position',
                    navigationConfig: {
                        field: 'id',
                        direction: 'forward'
                    }
                });

                const rs = new RecordSet({
                    rawData: data,
                    keyProperty: 'id'
                });

                rs.setMetaData({more : true});

                const params = nc.updateQueryProperties(rs);
                let hasMore = nc.hasMoreData('forward');
                assert.isTrue(hasMore, 'Wrong more value');
                hasMore = nc.hasMoreData('backward');
                assert.isFalse(hasMore, 'Wrong more value');
            });

            it('hasMoreData forward values false root', () => {
                const nc = new NavigationController({
                    navigationType: 'position',
                    navigationConfig: {
                        field: 'id',
                        direction: 'backward'
                    }
                });

                const rs = new RecordSet({
                    rawData: data,
                    keyProperty: 'id'
                });

                rs.setMetaData({more : true});

                const params = nc.updateQueryProperties(rs);
                let hasMore = nc.hasMoreData('forward');
                assert.isFalse(hasMore, 'Wrong more value');
                hasMore = nc.hasMoreData('backward');
                assert.isTrue(hasMore, 'Wrong more value');
            });

        });
    });
});
