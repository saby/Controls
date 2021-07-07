import {assert} from 'chai';
import {Memory} from 'Types/source';
import {Record} from 'Types/entity';
import {RecordSet} from 'Types/collection';
import {NavigationController} from 'Controls/source';
import {CrudWrapper} from "../../../Controls/_dataSource/CrudWrapper";

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

                const params = nc.getQueryParams({filter: defFilter, sorting: defSorting}, null, {}, 'forward');
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

                const params = nc.getQueryParams({filter: defFilter, sorting: defSorting}, null, {}, 'backward');
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
                assert.equal(1, params[0].nextPage, 'Wrong query properties');
                assert.equal(-1, params[0].prevPage, 'Wrong query properties');
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
                assert.equal(START_PAGE + 2, params[0].nextPage, 'Wrong query properties');
                assert.equal(START_PAGE - 1, params[0].prevPage, 'Wrong query properties');
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
                assert.equal(START_PAGE + 1, params[0].nextPage, 'Wrong query properties');
                assert.equal(START_PAGE - 2, params[0].prevPage, 'Wrong query properties');
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

            it('hasMoreData (hasMore is undefined) boolean true root', () => {
                const START_PAGE = 0;
                const nc = new NavigationController({
                    navigationType: 'page',
                    navigationConfig: {
                        page: START_PAGE,
                        pageSize: TEST_PAGE_SIZE
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
                        position: null,
                        field: 'id',
                        direction: 'bothways',
                        limit: QUERY_LIMIT
                    }
                });

                const params = nc.getQueryParams({filter: defFilter, sorting: defSorting});
                assert.equal(null, params.filter['id~'], 'Wrong query params');
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
                const params = nc.getQueryParams({filter: defFilter, sorting: defSorting}, null, {}, 'forward');
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
                const params = nc.getQueryParams({filter: defFilter, sorting: defSorting}, null, {}, 'backward');
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
                assert.deepEqual([6], params[0].forwardPosition, 'Wrong query properties');
                assert.deepEqual([4], params[0].backwardPosition, 'Wrong query properties');

                const rsforward = new RecordSet({
                    rawData: dataNext,
                    keyProperty: 'id'
                });

                params = nc.updateQueryProperties(rsforward, null, undefined, 'forward');
                assert.deepEqual([9], params[0].forwardPosition, 'Wrong query properties');
                assert.deepEqual([4], params[0].backwardPosition, 'Wrong query properties');

                const rsbackward = new RecordSet({
                    rawData: dataPrev,
                    keyProperty: 'id'
                });

                params = nc.updateQueryProperties(rsbackward, null, undefined, 'backward');
                assert.deepEqual([9], params[0].forwardPosition, 'Wrong query properties');
                assert.deepEqual([1], params[0].backwardPosition, 'Wrong query properties');
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
                assert.deepEqual([10], params[0].forwardPosition, 'Wrong query properties');
                assert.deepEqual([-1], params[0].backwardPosition, 'Wrong query properties');
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
                assert.deepEqual([10], params[0].forwardPosition, 'Wrong query properties');
                assert.deepEqual([-1], params[0].backwardPosition, 'Wrong query properties');
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
                assert.deepEqual([10], params[0].forwardPosition, 'Wrong query properties');
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
                assert.deepEqual([-1], params[0].backwardPosition, 'Wrong query properties');
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
    describe('Both navigation types + multiroot', () => {
        describe('getQueryParams', () => {
            it ('Page', () => {
                const nc = new NavigationController({
                    navigationType: 'page',
                    navigationConfig: {
                        page: 0,
                        pageSize: TEST_PAGE_SIZE,
                        hasMore: true
                    }
                });

                // creating some stores in Navigation controller
                nc.getQueryParams({}, '1');
                nc.getQueryParams({}, '2');

                const params = nc.getQueryParamsForHierarchy({filter: defFilter, sorting: defSorting});
                assert.equal(2, params.length, 'Wrong query params');
                assert.equal('1', params[0].filter.__root.valueOf(), 'Wrong query params');
                assert.equal('2', params[1].filter.__root.valueOf(), 'Wrong query params');
            });

            it ('Position', () => {
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

                // creating some stores in Navigation controller
                nc.getQueryParams({});
                nc.getQueryParams({}, '1');
                nc.getQueryParams({}, '2');

                const params = nc.getQueryParamsForHierarchy({filter: defFilter, sorting: defSorting});
                assert.equal(3, params.length, 'Wrong query params');
                assert.equal(null, params[0].filter.__root.valueOf(), 'Wrong query params');
                assert.equal('1', params[1].filter.__root.valueOf(), 'Wrong query params');
                assert.equal('2', params[2].filter.__root.valueOf(), 'Wrong query params');
            });
        });

        describe('updateQueryProperties', () => {
            it ('Position', () => {
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

                const metaRS = new RecordSet({
                    rawData: [
                        {
                            id: '1',
                            nav_result: true
                        },
                        {
                            id: '2',
                            nav_result: false
                        }
                    ]
                });

                rs.setMetaData({more: metaRS});

                const params = nc.updateQueryProperties(rs);

                assert.equal(2, params.length, 'Wrong query properties');
                assert.equal('id', params[0].field, 'Wrong query properties');
                assert.equal('id', params[1].field, 'Wrong query properties');
            });
        });
    });
    describe('updateOptions', () => {
        it('new navigation type', () => {
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

            // апдейтим параметры -> спрашиваем -> меняем конфиг -> спрашиваем параметры опять, должны быть сброшены
            nc.updateQueryProperties(rs);
            let params = nc.getQueryParams({filter: {}, sorting: []}, null, {}, 'forward');
            assert.equal(6, params.filter['id>='], 'Wrong query params');

            nc.updateOptions({
                navigationType: 'page',
                navigationConfig: {
                    field: 'id',
                    direction: 'bothways'
                }
            });

            params = nc.getQueryParams({filter: {}, sorting: []}, null, {}, 'forward');
            assert.equal(null, params.filter['id>='], 'Wrong query params');

        });

        it('new navigation config', () => {
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

            // апдейтим параметры -> спрашиваем -> меняем конфиг -> спрашиваем параметры опять, должны быть сброшены
            nc.updateQueryProperties(rs);
            let params = nc.getQueryParams({filter: {}, sorting: []}, null, {}, 'forward');
            assert.equal(6, params.filter['id>='], 'Wrong query params');

            nc.updateOptions({
                navigationType: 'position',
                navigationConfig: {
                    field: 'id',
                    direction: 'forward'
                }
            });

            params = nc.getQueryParams({filter: {}, sorting: []}, null, {}, 'forward');
            assert.equal(null, params.filter['id>='], 'Wrong query params');

        });
    });
});
