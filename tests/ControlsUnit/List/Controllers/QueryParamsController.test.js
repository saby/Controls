/**
 * Created by kraynovdo on 29.08.2017.
 */
/* global define, beforeEach, afterEach, describe, context, it, assert, $ws */
define(
   [
      'Controls/_source/QueryParamsController/Page',
      'Controls/_source/QueryParamsController/Position',
      'Types/collection',
      'Types/source'
   ],
   function (PageNavigation,
             PositionNavigation, collection, sourceLib) {

      'use strict';

      describe('Controls.Controllers.QueryParamsController', function () {
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

         describe('Page', function () {
            it('init', function () {
               var pNav = new PageNavigation.default({
                  page: 1,
                  pageSize: 4
               });
               assert.equal(2, pNav._nextPage, 'State nextPage is incorrect');
               assert.equal(0, pNav._prevPage, 'State prevPage is incorrect');
            });

            it('calculateState', function () {
               var pNav = new PageNavigation.default({
                  page: 1,
                  pageSize: 4
               });
               dataRs.setMetaData({more: true});
               dataRs.setMetaData({more: true});

               pNav.calculateState(dataRs);

               assert.equal(2, pNav._nextPage, 'State nextPage is incorrect after reload');
               assert.isTrue(pNav._more.getMoreMeta(), 'State more is incorrect  after reload');
               assert.isTrue(pNav.hasMoreData('down'), 'Method hasMoreData returns incorrect value after reload');
               assert.isTrue(pNav.hasMoreData('up'), 'Method hasMoreData returns incorrect value after reload');


               dataRsbyLoad.setMetaData({more: false});
               pNav.calculateState(dataRsbyLoad, 'down');

               assert.equal(3, pNav._nextPage, 'State nextPage is incorrect after load down');
               assert.isFalse(pNav._more.getMoreMeta(), 'State more is incorrect after load down');
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
               pNav.calculateState(dataRsbyLoad);
               assert.equal(2, pNav._nextPage, 'State nextPage is incorrect after reload');
               assert.isTrue(pNav._more.getMoreMeta(), 'State more is incorrect after reload');
               assert.isTrue(pNav._more.getMoreMeta(1), 'State more is incorrect after reload');
               assert.isFalse(pNav._more.getMoreMeta(2), 'State more is incorrect after reload');
               assert.isTrue(pNav.hasMoreData('down', 0), 'Method hasMoreData returns incorrect value for root "0" after reload');
               assert.isTrue(pNav.hasMoreData('down', 1), 'Method hasMoreData returns incorrect value for root "1" after reload');
               assert.isFalse(pNav.hasMoreData('down', 2), 'Method hasMoreData returns incorrect value for root "2" after reload');
               assert.isTrue(pNav.hasMoreData('down', 1234) === undefined, 'Method hasMoreData returns incorrect value for root "1234" after reload');

            });

            it('calculateState + withHasMore=False', function () {
               var pNav = new PageNavigation.default({
                  page: 0,
                  hasMore: false,
                  pageSize: 4
               });
               dataRs.setMetaData({more: 8});

               pNav.calculateState(dataRs);
               assert.equal(1, pNav._nextPage, 'State nextPage is incorrect after reload');
               assert.equal(8, pNav.getAllDataCount(), 'State more is incorrect  after reload');
               assert.equal(4, pNav.getLoadedDataCount(), 'State more is incorrect after load down');

               assert.isTrue(pNav.hasMoreData('down'), 'Method hasMoreData returns incorrect value after reload');
               assert.isFalse(pNav.hasMoreData('up'), 'Method hasMoreData returns incorrect value after reload');

               dataRsbyLoad.setMetaData({more: 8});
               pNav.calculateState(dataRsbyLoad, 'down');
               assert.equal(2, pNav._nextPage, 'State nextPage is incorrect after load down');
               assert.equal(8, pNav.getAllDataCount(), 'State more is incorrect after load down');
               assert.isFalse(pNav.hasMoreData('down'), 'Method hasMoreData returns incorrect value after load down');
               assert.isFalse(pNav.hasMoreData('up'), 'Method hasMoreData returns incorrect value after load down');
            });

            it('prepareQueryParams', function () {
               var params;
               var pNav = new PageNavigation.default({
                  page: 1,
                  pageSize: 4
               });

               params = pNav.prepareQueryParams();
               assert.deepEqual({limit: 4, offset: 4, meta: { navigationType: sourceLib.SbisService.NAVIGATION_TYPE.PAGE } }, params, 'Method prepareQueryParams returns incorrect parameters before reload');

               params = pNav.prepareQueryParams('down');
               assert.deepEqual({limit: 4, offset: 8, meta: { navigationType: sourceLib.SbisService.NAVIGATION_TYPE.PAGE } }, params, 'Method prepareQueryParams returns incorrect parameters before load down');

               params = pNav.prepareQueryParams('up');
               assert.deepEqual({limit: 4, offset: 0, meta: { navigationType: sourceLib.SbisService.NAVIGATION_TYPE.PAGE } }, params, 'Method prepareQueryParams returns incorrect parameters before load up');
            })

            it('validateNavigation', function () {
               var pNav = new PageNavigation.default({
                  page: 1,
                  pageSize: 4
               });
               pNav.validateNavigation(true);
               pNav.validateNavigation(undefined);
               pNav.destroy();
               pNav = new PageNavigation.default({
                  page: 1,
                  pageSize: 4,
                  hasMore: false
               });
               pNav.validateNavigation(1);
               pNav.validateNavigation(undefined);
               pNav.destroy();
            });

         });

         describe('PositionNavigation', function () {
            it('calculate state with first query', function () {
               var pNav = new PositionNavigation.default({
                  field: 'field',
                  limit: 100,
                  direction: 'after',
                  position: 1
               });

               assert.isFalse(!!pNav.hasMoreData('down'));
               assert.isFalse(pNav._isMoreCreated(), '_more created before meta set');
               assert.deepEqual({before: false, after: false}, pNav._getMore().getMoreMeta(), 'Calculate state: wrong _more value');

               //first query with direction: after
               dataRs.setMetaData({more: true});
               pNav.calculateState(dataRs);
               assert.deepEqual({before: false, after: true}, pNav._getMore().getMoreMeta(), 'Calculate state: wrong _more value');
               assert.deepEqual([1], pNav._beforePosition, 'Calculate state: wrong _beforePosition value');
               assert.deepEqual([2], pNav._afterPosition, 'Calculate state: wrong _afterPosition value');

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
               pNav.calculateState(dataRs);
               assert.deepEqual({before: false, after: true}, pNav._getMore().getMoreMeta(), 'Calculate state: wrong _more value');
               assert.deepEqual({before: false, after: false}, pNav._getMore().getMoreMeta(2), 'Calculate state: wrong _more value');
               assert.deepEqual({before: false, after: true}, pNav._getMore().getMoreMeta(3), 'Calculate state: wrong _more value');
               assert.isTrue(pNav.hasMoreData('down'), 'Method hasMoreData returns incorrect value after reload');
               assert.isTrue(pNav.hasMoreData('down', 1), 'Method hasMoreData returns incorrect value for root "1" after reload');
               assert.isFalse(pNav.hasMoreData('down', 2), 'Method hasMoreData returns incorrect value for root "2" after reload');
               assert.deepEqual([1], pNav._beforePosition, 'Calculate state: wrong _beforePosition value');
               assert.deepEqual([2], pNav._afterPosition, 'Calculate state: wrong _afterPosition value');


               pNav = new PositionNavigation.default({
                  field: ['field', 'id'],
                  direction: 'both',
                  position: 1,
                  limit: 100
               });

               //first query with direction: both and multiple "field" value
               dataRs.setMetaData({more: {after: true, before: false}});
               pNav.calculateState(dataRs);
               assert.deepEqual({before: false, after: true}, pNav._getMore().getMoreMeta(), 'Calculate state: wrong _more value');
               assert.deepEqual([1, 1], pNav._beforePosition, 'Calculate state: wrong _beforePosition value');
               assert.deepEqual([2, 4], pNav._afterPosition, 'Calculate state: wrong _afterPosition value');
            });

            it('calculate state with load to direction query', function () {
               var pNav = new PositionNavigation.default({
                  field: 'field',
                  direction: 'after',
                  position: 1,
                  limit: 100
               });

               //first query with direction: after
               dataRs.setMetaData({more: true});
               pNav.calculateState(dataRs);
               assert.isTrue(pNav.hasMoreData('down'), 'Wrong hasMoreData result');
               assert.isUndefined(pNav.hasMoreData('down', 'testId'), 'Wrong hasMoredata for root');

               //load down
               dataRsbyLoad.setMetaData({more: false});
               pNav.calculateState(dataRsbyLoad, 'down');
               assert.isFalse(pNav.hasMoreData('down'), 'Wrong hasMoreData result');
               assert.isUndefined(pNav.hasMoreData('down', 'testId'), 'Wrong hasMoredata for root');
               assert.deepEqual({before: false, after: false}, pNav._getMore().getMoreMeta(), 'Calculate state: wrong _more value');
               assert.deepEqual([1], pNav._beforePosition, 'Calculate state: wrong _beforePosition value');
               assert.deepEqual([3], pNav._afterPosition, 'Calculate state: wrong _afterPosition value');

               /**/

               pNav = new PositionNavigation.default({
                  field: ['field', 'id'],
                  direction: 'both',
                  position: 1,
                  limit: 100
               });

               //first query with direction: both
               dataRs.setMetaData({more: {after: true, before: true}});
               pNav.calculateState(dataRs);
               assert.isTrue(pNav.hasMoreData('up'), 'Wrong hasMoreData result');
               assert.isUndefined(pNav.hasMoreData('up', 'testId'), 'Wrong hasMoredata for root');

               //load up
               dataRsbyLoad.setMetaData({more: true});
               pNav.calculateState(dataRsbyLoad, 'up');
               assert.isTrue(pNav.hasMoreData('up'), 'Wrong hasMoreData result');
               assert.isUndefined(pNav.hasMoreData('up', 'testId'), 'Wrong hasMoredata for root');
               assert.deepEqual({before: true, after: true}, pNav._getMore().getMoreMeta(), 'Calculate state: wrong _more value');
               assert.deepEqual([3, 5], pNav._beforePosition, 'Calculate state: wrong _beforePosition value');
               assert.deepEqual([2, 4], pNav._afterPosition, 'Calculate state: wrong _afterPosition value');


               //first query  with multiNavigation
               pNav = new PositionNavigation.default({
                  field: ['field', 'id'],
                  direction: 'both',
                  position: 1,
                  limit: 100
               });
               let moreDataRs = new collection.RecordSet({
                  keyProperty: 'id',
                  rawData: [
                     {
                        id: 1,
                        nav_result: {
                           after: true,
                           before: false
                        }
                     }
                  ]
               });

               dataRsbyLoad.setMetaData({ more: moreDataRs });
               pNav.calculateState(dataRsbyLoad);
               assert.deepStrictEqual(pNav._getMore().getMoreMeta(), { after: true, before: false });
            });


            it('calculate state with nextPosition', function () {
               var pNav = new PositionNavigation.default({
                  field: 'field',
                  direction: 'both',
                  position: 5,
                  limit: 100
               });

               //first query with direction: after
               dataRs.setMetaData({more: true, nextPosition:{before: [1], after: [7]}});
               pNav.calculateState(dataRs);
               assert.deepEqual([1], pNav._beforePosition, 'Calculate state: wrong _beforePosition value');
               assert.deepEqual([7], pNav._afterPosition, 'Calculate state: wrong _afterPosition value');


               //first query with direction: after
               pNav = new PositionNavigation.default({
                  field: 'field',
                  direction: 'after',
                  position: 5,
                  limit: 100
               });


               dataRs.setMetaData({more: true, nextPosition:[7]});
               pNav.calculateState(dataRs);
               assert.deepEqual([7], pNav._afterPosition, 'Calculate state: wrong _afterPosition value');

               pNav = new PositionNavigation.default({
                  field: 'field',
                  direction: 'before',
                  position: 5,
                  limit: 100
               });

               //first query with direction: before
               dataRs.setMetaData({more: true, nextPosition:[1]});
               pNav.calculateState(dataRs);
               assert.deepEqual([1], pNav._beforePosition, 'Calculate state: wrong _beforePosition value');


               /*any first query, but having "load to direction query"*/
               pNav = new PositionNavigation.default({
                  field: 'field',
                  direction: 'both',
                  position: 5,
                  limit: 100
               });

               //first query with direction: after
               dataRs.setMetaData({more: true, nextPosition:[7]});
               pNav.calculateState(dataRs, 'down');
               assert.deepEqual([7], pNav._afterPosition, 'Calculate state: wrong _afterPosition value');

               //first query with direction: after
               dataRs.setMetaData({more: true, nextPosition:[666]});
               pNav.calculateState(dataRs, 'up');
               assert.deepEqual([666], pNav._beforePosition, 'Calculate state: wrong _afterPosition value');
            });


            it('prepare query params first load', function () {
               var params, pNav;
               pNav = new PositionNavigation.default({
                  field: 'field',
                  limit: 100,
                  direction: 'after',
                  position: 1
               });

               params = pNav.prepareQueryParams();
               assert.deepEqual({filter : {'field>=' : 1}, limit: 100, meta: { navigationType: sourceLib.SbisService.NAVIGATION_TYPE.POSITION } }, params, 'Wrong query params');


               pNav = new PositionNavigation.default({
                  field: ['field', 'id'],
                  limit: 50,
                  direction: 'before',
                  position: [2, 1]
               });

               params = pNav.prepareQueryParams();
               assert.deepEqual({filter : {'field<=' : 2, 'id<=' : 1}, limit: 50, meta: { navigationType: sourceLib.SbisService.NAVIGATION_TYPE.POSITION } }, params, 'Wrong query params');


               pNav = new PositionNavigation.default({
                  field: ['field'],
                  limit: 100,
                  direction: 'both',
                  position: [3]
               });

               params = pNav.prepareQueryParams();
               assert.deepEqual({filter : {'field~' : 3}, limit: 100, meta: { navigationType: sourceLib.SbisService.NAVIGATION_TYPE.POSITION } }, params, 'Wrong query params');
            });

            it('prepare query params load to direction', function () {
               var params, pNav;
               pNav = new PositionNavigation.default({
                  field: ['field', 'id'],
                  direction: 'both',
                  position: 1,
                  limit: 100
               });

               //first query with direction: both
               dataRs.setMetaData({more: {after: true, before: true}});
               pNav.calculateState(dataRs);

               params = pNav.prepareQueryParams('up');
               assert.deepEqual({filter : {'field<=' : 1, 'id<=' : 1}, limit: 100, meta: { navigationType: sourceLib.SbisService.NAVIGATION_TYPE.POSITION } }, params, 'Wrong query params');


               params = pNav.prepareQueryParams('down');
               assert.deepEqual({filter : {'field>=' : 2, 'id>=' : 4}, limit: 100, meta: { navigationType: sourceLib.SbisService.NAVIGATION_TYPE.POSITION } }, params, 'Wrong query params');
            });
         });
      });
   });
