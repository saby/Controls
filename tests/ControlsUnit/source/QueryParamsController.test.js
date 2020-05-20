/**
 * Created by kraynovdo on 29.08.2017.
 */
/* global define, beforeEach, afterEach, describe, context, it, assert, $ws */
define(
   [
      'Controls/_source/QueryParamsController/PageQueryParamsController',
      'Controls/_source/QueryParamsController/PositionQueryParamsController',
      'Types/collection',
      'Types/source'
   ],
   function (PageQueryParamsController,
             PositionQueryParamsController, collection, sourceLib) {

      'use strict';

      describe('Controls.Controllers.QueryParamsController in Old-BaseControl-style', function () {
         var data, databyLoad, dataRs, dataRsbyLoad;

         beforeEach(function() {
            data = [
               {id : 1, title : 'Первый', field: 1},
               {id : 2, title : 'Второй', field: 1},
               {id : 3, title : 'Третий', field: 2},
               {id : 4, title : 'Четвертый', field: 2}
            ];
            databyLoad = [
               {id : 5, title : 'Первый', field: 3},
               {id : 6, title : 'Второй', field: 3},
               {id : 7, title : 'Третий', field: 3},
               {id : 8, title : 'Четвертый', field: 3}
            ];
            dataRs = new collection.RecordSet({
               rawData: data,
               idProperty : 'id'
            });

            dataRsbyLoad = new collection.RecordSet({
               rawData: databyLoad,
               keyProperty : 'id'
            })

         });

         describe('PageQueryParamsController', function () {
            it('init', function () {
               var pNav = new PageQueryParamsController.default({
                  page: 1,
                  pageSize: 4
               });
               assert.equal(2, pNav._nextPage, 'State nextPage is incorrect');
               assert.equal(0, pNav._prevPage, 'State prevPage is incorrect');
            });

            it('should correctly calculate hasMoreData() when hasMore is not set false', function () {
               var pNav = new PageQueryParamsController.default({
                  page: 1,
                  pageSize: 4
               });
               dataRs.setMetaData({more: true});

               pNav.updateQueryProperties(dataRs, null);

               assert.isTrue(pNav.hasMoreData('down'), 'Method hasMoreData returns incorrect value after reload');
               assert.isTrue(pNav.hasMoreData('up'), 'Method hasMoreData returns incorrect value after reload');


               dataRsbyLoad.setMetaData({more: false});
               pNav.updateQueryProperties(dataRsbyLoad, 'down');

               assert.isFalse(pNav.hasMoreData('down'), 'Method hasMoreData returns incorrect value after reload');
               assert.isTrue(pNav.hasMoreData('up'), 'Method hasMoreData returns incorrect value after reload');
            });

            it('should correctly calculate hasMoreData() and allDataCount() when hasMore is set false', function () {
               var pNav = new PageQueryParamsController.default({
                  page: 0,
                  hasMore: false,
                  pageSize: 4
               });
               dataRs.setMetaData({more: 8});

               pNav.updateQueryProperties(dataRs, null);
               assert.equal(8, pNav.getAllDataCount(), 'State more is incorrect  after reload');
               assert.equal(4, pNav.getLoadedDataCount(), 'State more is incorrect after load down');

               assert.isTrue(pNav.hasMoreData('down'), 'Method hasMoreData returns incorrect value after reload');
               assert.isFalse(pNav.hasMoreData('up'), 'Method hasMoreData returns incorrect value after reload');

               dataRsbyLoad.setMetaData({more: 8});
               pNav.updateQueryProperties(dataRsbyLoad, 'down');
               assert.equal(8, pNav.getAllDataCount(), 'State more is incorrect after load down');
               assert.isFalse(pNav.hasMoreData('down'), 'Method hasMoreData returns incorrect value after load down');
               assert.isFalse(pNav.hasMoreData('up'), 'Method hasMoreData returns incorrect value after load down');
            });

            describe('loading edges', () => {
               const TOTAL_ITEMS = 100;
               const PAGE_SIZE = 5;
               const TOTAL_PAGES = TOTAL_ITEMS / PAGE_SIZE;

               it('should set first page for top edge', () => {
                  const pageNav = new PageQueryParamsController.default({
                     page: 10,
                     hasMore: false,
                     pageSize: PAGE_SIZE
                  });
                  pageNav.updateQueryProperties({
                     getMetaData: () => ({ more: TOTAL_ITEMS })
                  });

                  pageNav.setEdgeState('up');
                  assert.strictEqual(pageNav.prepareQueryParams().offset, 0);
               });

               it('should set last page for bottom edge (known pages count)', () => {
                  const pageNav = new PageQueryParamsController.default({
                     page: 10,
                     hasMore: false,
                     pageSize: PAGE_SIZE
                  });
                  pageNav.updateQueryProperties({
                     getMetaData: () => ({ more: TOTAL_ITEMS })
                  });

                  pageNav.setEdgeState('down');
                  assert.strictEqual(pageNav.prepareQueryParams().offset, (TOTAL_PAGES - 1) * PAGE_SIZE);
               });

               it('should set last page for bottom edge (unknown pages count)', () => {
                  const pageNav = new PageQueryParamsController.default({
                     page: 10,
                     hasMore: false,
                     pageSize: PAGE_SIZE
                  });
                  pageNav.updateQueryProperties({
                     getMetaData: () => ({ more: undefined })
                  });

                  pageNav.setEdgeState('down');
                  assert.strictEqual(pageNav.prepareQueryParams().offset, -PAGE_SIZE);
               });
            });
         });

         describe('PositionQueryParamsController', function () {
            it('calculate hasMoreData() with first query', function () {
               var pNav = new PositionQueryParamsController.default({
                  field: 'field',
                  limit: 100,
                  direction: 'forward',
                  position: 1
               });

               assert.isFalse(!!pNav.hasMoreData('down'));
            });

            it('should calculate hasMoreData() with load to direction query', function () {
               var pNav = new PositionQueryParamsController.default({
                  field: 'field',
                  direction: 'forward',
                  position: 1,
                  limit: 100
               });

               //first query with direction: after
               dataRs.setMetaData({more: true});
               pNav.updateQueryProperties(dataRs, null);
               assert.isTrue(pNav.hasMoreData('down'), 'Wrong hasMoreData result');

               //load down
               dataRsbyLoad.setMetaData({more: false});
               pNav.updateQueryProperties(dataRsbyLoad, 'down');
               assert.isFalse(pNav.hasMoreData('down'), 'Wrong hasMoreData result');

               pNav = new PositionQueryParamsController.default({
                  field: ['field', 'id'],
                  direction: 'bothways',
                  position: 1,
                  limit: 100
               });

               //first query with direction: both
               dataRs.setMetaData({more: {forward: true, backward: true}});
               pNav.updateQueryProperties(dataRs, null);
               assert.isTrue(pNav.hasMoreData('up'), 'Wrong hasMoreData result');

               //load up
               dataRsbyLoad.setMetaData({more: true});
               pNav.updateQueryProperties(dataRsbyLoad, 'up');
               assert.isTrue(pNav.hasMoreData('up'), 'Wrong hasMoreData result');
            });

            it('prepare query params first load', function () {
               var params, pNav;
               pNav = new PositionQueryParamsController.default({
                  field: 'field',
                  limit: 100,
                  direction: 'forward',
                  position: 1
               });

               params = pNav.prepareQueryParams();
               assert.deepEqual({filter : {'field>=' : 1}, limit: 100, meta: { navigationType: sourceLib.SbisService.NAVIGATION_TYPE.POSITION } }, params, 'Wrong query params');


               pNav = new PositionQueryParamsController.default({
                  field: ['field', 'id'],
                  limit: 50,
                  direction: 'backward',
                  position: [2, 1]
               });

               params = pNav.prepareQueryParams();
               assert.deepEqual({filter : {'field<=' : 2, 'id<=' : 1}, limit: 50, meta: { navigationType: sourceLib.SbisService.NAVIGATION_TYPE.POSITION } }, params, 'Wrong query params');


               pNav = new PositionQueryParamsController.default({
                  field: ['field'],
                  limit: 100,
                  direction: 'bothways',
                  position: [3]
               });

               params = pNav.prepareQueryParams();
               assert.deepEqual({filter : {'field~' : 3}, limit: 100, meta: { navigationType: sourceLib.SbisService.NAVIGATION_TYPE.POSITION } }, params, 'Wrong query params');
            });

            describe('loading edges', () => {
               it('should set initial parameters for top edge', () => {
                  const positionNav = new PositionQueryParamsController.default({
                     field: ['field'],
                     limit: 100,
                     direction: 'bothways',
                     position: [3]
                  });
                  positionNav.setEdgeState('up');

                  assert.deepEqual(
                     {
                        filter : {'field~' : 3},
                        limit: 100,
                        meta: {
                           navigationType: sourceLib.SbisService.NAVIGATION_TYPE.POSITION
                        }
                     },
                     positionNav.prepareQueryParams()
                  );
               });

               it('should set end parameters for bottom edge', () => {
                  const positionNav = new PositionQueryParamsController.default({
                     field: ['field'],
                     limit: 100,
                     direction: 'bothways',
                     position: [3]
                  });
                  positionNav.setEdgeState('down');

                  assert.deepEqual(
                     {
                        filter : {'field~' : 3},
                        limit: 100,
                        meta: {
                           navigationType: sourceLib.SbisService.NAVIGATION_TYPE.POSITION
                        },
                        offset: -1
                     },
                     positionNav.prepareQueryParams()
                  );
               });
            });
         });
      });
   });
