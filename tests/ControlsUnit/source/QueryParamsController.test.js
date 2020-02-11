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

               let moreDataRs = new collection.RecordSet({
                  keyProperty: 'id',
                  rawData: [
                     {
                        id: 0,
                        nav_result: true
                     },
                     {
                        id: 1,
                        nav_result: true
                     },
                     {
                        id: 2,
                        nav_result: false
                     }
                  ]
               });
               dataRsbyLoad.setMetaData({more: moreDataRs});
               pNav.updateQueryProperties(dataRsbyLoad, null);
               assert.isTrue(pNav.hasMoreData('down', 0), 'Method hasMoreData returns incorrect value for root "0" after reload');
               assert.isTrue(pNav.hasMoreData('down', 1), 'Method hasMoreData returns incorrect value for root "1" after reload');
               assert.isFalse(pNav.hasMoreData('down', 2), 'Method hasMoreData returns incorrect value for root "2" after reload');
               assert.isTrue(pNav.hasMoreData('down', 1234) === undefined, 'Method hasMoreData returns incorrect value for root "1234" after reload');

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
         });

         describe('PositionQueryParamsController', function () {
            it('calculate hasMoreData() with first query', function () {
               var pNav = new PositionQueryParamsController.default({
                  field: 'field',
                  limit: 100,
                  direction: 'after',
                  position: 1
               });

               assert.isFalse(!!pNav.hasMoreData('down'));

               //first query with direction: after
               dataRs.setMetaData({more: true});
               pNav.updateQueryProperties(dataRs, null);

               let moreDataRs = new collection.RecordSet({
                  keyProperty: 'id',
                  rawData: [
                     {
                        id: 1,
                        nav_result: true
                     },
                     {
                        id: 2,
                        nav_result: false
                     },
                     {
                        id: 3,
                        nav_result: true
                     }
                  ]
               });
               dataRs.setMetaData({more: moreDataRs});
               pNav.updateQueryProperties(dataRs, null);
               assert.isTrue(pNav.hasMoreData('down'), 'Method hasMoreData returns incorrect value after reload');
               assert.isTrue(pNav.hasMoreData('down', 1), 'Method hasMoreData returns incorrect value for root "1" after reload');
               assert.isFalse(pNav.hasMoreData('down', 2), 'Method hasMoreData returns incorrect value for root "2" after reload');
            });

            it('should calculate hasMoreData() with load to direction query', function () {
               var pNav = new PositionQueryParamsController.default({
                  field: 'field',
                  direction: 'after',
                  position: 1,
                  limit: 100
               });

               //first query with direction: after
               dataRs.setMetaData({more: true});
               pNav.updateQueryProperties(dataRs, null);
               assert.isTrue(pNav.hasMoreData('down'), 'Wrong hasMoreData result');
               assert.isUndefined(pNav.hasMoreData('down', 'testId'), 'Wrong hasMoredata for root');

               //load down
               dataRsbyLoad.setMetaData({more: false});
               pNav.updateQueryProperties(dataRsbyLoad, 'down');
               assert.isFalse(pNav.hasMoreData('down'), 'Wrong hasMoreData result');
               assert.isUndefined(pNav.hasMoreData('down', 'testId'), 'Wrong hasMoredata for root');

               pNav = new PositionQueryParamsController.default({
                  field: ['field', 'id'],
                  direction: 'both',
                  position: 1,
                  limit: 100
               });

               //first query with direction: both
               dataRs.setMetaData({more: {after: true, before: true}});
               pNav.updateQueryProperties(dataRs, null);
               assert.isTrue(pNav.hasMoreData('up'), 'Wrong hasMoreData result');
               assert.isUndefined(pNav.hasMoreData('up', 'testId'), 'Wrong hasMoredata for root');

               //load up
               dataRsbyLoad.setMetaData({more: true});
               pNav.updateQueryProperties(dataRsbyLoad, 'up');
               assert.isTrue(pNav.hasMoreData('up'), 'Wrong hasMoreData result');
               assert.isUndefined(pNav.hasMoreData('up', 'testId'), 'Wrong hasMoredata for root');
            });

            it('prepare query params first load', function () {
               var params, pNav;
               pNav = new PositionQueryParamsController.default({
                  field: 'field',
                  limit: 100,
                  direction: 'after',
                  position: 1
               });

               params = pNav.prepareQueryParams();
               assert.deepEqual({filter : {'field>=' : 1}, limit: 100, meta: { navigationType: sourceLib.SbisService.NAVIGATION_TYPE.POSITION } }, params, 'Wrong query params');


               pNav = new PositionQueryParamsController.default({
                  field: ['field', 'id'],
                  limit: 50,
                  direction: 'before',
                  position: [2, 1]
               });

               params = pNav.prepareQueryParams();
               assert.deepEqual({filter : {'field<=' : 2, 'id<=' : 1}, limit: 50, meta: { navigationType: sourceLib.SbisService.NAVIGATION_TYPE.POSITION } }, params, 'Wrong query params');


               pNav = new PositionQueryParamsController.default({
                  field: ['field'],
                  limit: 100,
                  direction: 'both',
                  position: [3]
               });

               params = pNav.prepareQueryParams();
               assert.deepEqual({filter : {'field~' : 3}, limit: 100, meta: { navigationType: sourceLib.SbisService.NAVIGATION_TYPE.POSITION } }, params, 'Wrong query params');
            });
         });
      });
   });
