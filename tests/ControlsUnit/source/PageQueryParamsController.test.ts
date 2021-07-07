import {default as PageQueryParamsController} from 'Controls/_source/QueryParamsController/PageQueryParamsController';
import {RecordSet} from 'Types/collection';
import {deepEqual , equal} from 'assert';

describe('PageQueryParamsController', () => {
    it('prepareQueryParams', () => {
        let sourceConfig = {
            page: 0,
            pageSize: 25
        }
        let controller = new PageQueryParamsController(sourceConfig);

        // без дополнительного sourceConfig
        deepEqual(controller.prepareQueryParams(null, null, null), {
            meta: { navigationType: 'Page' },
            limit: 25,
            offset: 0
        }, 'wrong params for prepareQueryParams without config and direction');

        deepEqual(controller.prepareQueryParams('down', null, null), {
            meta: { navigationType: 'Page' },
            limit: 25,
            offset: 25
        }, 'wrong params for prepareQueryParams without config and down direction');

        deepEqual(controller.prepareQueryParams('up', null, null), {
            meta: { navigationType: 'Page' },
            limit: 25,
            offset: -25
        }, 'wrong params for prepareQueryParams without config and up direction');

        // перезагрузка с переданным sourceConfig
        let sourceConfigForReload = {
            page: 0,
            pageSize: 50
        }

        deepEqual(controller.prepareQueryParams(null, null, sourceConfigForReload), {
            meta: { navigationType: 'Page' },
            limit: 50,
            offset: 0
        }, 'wrong params for prepareQueryParams without config and direction');
    });
    describe('updateQueryProperties', () => {
        let sourceConfig = {
            page: 0,
            pageSize: 25
        }
        let list = new RecordSet({keyProperty: 'id' , rawData: []});
        let controller = new PageQueryParamsController(sourceConfig);
        let expectedParams = {};
        let testN = 0;
        let callback = (params) => {
            deepEqual(params, expectedParams, 'wrong params calculated at test ' + testN )
        }

        let sourceConfigForReload = {
            page: 0,
            pageSize: 50
        }

        beforeEach(() => {
            controller = new PageQueryParamsController(sourceConfig);
            testN++;
        });
        afterEach(() => {
            controller.destroy();
        });

        it('test 1. direction = null', () => {
            expectedParams = {
                page: 0,
                pageSize: 25
            };
            controller.updateQueryProperties(list, null, null, callback);
        });
        it('test 2. direction = down', () => {
            expectedParams = {
                page: 1,
                pageSize: 25
            };
            controller.updateQueryProperties(list, 'down', null, callback);
        });
        it('test 3. direction = up', () => {
            expectedParams = {
                page: -1,
                pageSize: 25
            };
            controller.updateQueryProperties(list, 'up', null, callback);
        });

        it('test 4. direction = null, with sourceConfig', () => {
            expectedParams = {
                page: 1,
                pageSize: 25
            };
            controller.updateQueryProperties(list, null, sourceConfigForReload, callback);
            equal(controller.hasMoreData('up', void 0), false, 'wrong hasMoreData up');
        });
    });
});
