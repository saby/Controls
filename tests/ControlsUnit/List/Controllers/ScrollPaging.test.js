/**
 * Created by kraynovdo on 20.02.2018.
 */
/**
 * Created by kraynovdo on 07.02.2018.
 */
define([
   'Controls/_list/Controllers/ScrollPaging',
   'Types/source',
   'Core/core-instance'
], function(ScrollPaging, sourceLib, cInstance){
   describe('Controls.Controllers.ScrollPaging', function () {
      var data, source;
      beforeEach(function() {
         data = [
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
         source = new sourceLib.Memory({
            data: data,
            keyProperty: 'id'
         });

      });

      it('constructor', function () {
         var result;
         var spInstance = new ScrollPaging({
            pagingCfgTrigger: function(cfg) {
               result = cfg;
            }
         });
         assert.equal('top', spInstance._curState, 'Wrong curState after ctor');

         assert.deepEqual({
            stateBegin: 'disabled',
            statePrev: 'disabled',
            stateNext: 'normal',
            stateEnd: 'normal'
         }, result, 'Wrong pagingCfg after ctor');
      });

      it('scroll', function () {
         var result;
         var spInstance = new ScrollPaging({
            pagingCfgTrigger: function(cfg) {
               result = cfg;
            }
         });

         spInstance.handleScroll();
         assert.equal('middle', spInstance._curState, 'Wrong curState after scroll');
         assert.deepEqual({
            stateBegin: 'normal',
            statePrev: 'normal',
            stateNext: 'normal',
            stateEnd: 'normal'
         }, result, 'Wrong pagingCfg after scroll');

         spInstance.handleScrollTop(false);
         assert.equal('top', spInstance._curState, 'Wrong curState after scroll to top');
         assert.deepEqual({
            stateBegin: 'disabled',
            statePrev: 'disabled',
            stateNext: 'normal',
            stateEnd: 'normal'
         }, result, 'Wrong pagingCfg after scroll');

         spInstance.handleScrollBottom(false);
         assert.equal('bottom', spInstance._curState, 'Wrong curState after scroll to bottom');
         assert.deepEqual({
            stateBegin: 'normal',
            statePrev: 'normal',
            stateNext: 'disabled',
            stateEnd: 'disabled'
         }, result, 'Wrong pagingCfg after scroll');

         spInstance.handleScroll();//to reset _curState
         spInstance.handleScrollBottom(true);
         assert.equal('middle', spInstance._curState, 'Wrong curState after scroll to bottom');
         assert.deepEqual({
            stateBegin: 'normal',
            statePrev: 'normal',
            stateNext: 'normal',
            stateEnd: 'normal'
         }, result, 'Wrong pagingCfg after scroll');

         spInstance.handleScrollEdge('up', {down: true, up: false});
         assert.equal('top', spInstance._curState, 'Wrong curState after scroll to edge up');
         assert.deepEqual({
            stateBegin: 'disabled',
            statePrev: 'disabled',
            stateNext: 'normal',
            stateEnd: 'normal'
         }, result, 'Wrong pagingCfg after scroll');

         spInstance.handleScrollEdge('down', {down: false, up: true});
         assert.equal('bottom', spInstance._curState, 'Wrong curState after scroll to edge down');
         assert.deepEqual({
            stateBegin: 'normal',
            statePrev: 'normal',
            stateNext: 'disabled',
            stateEnd: 'disabled'
         }, result, 'Wrong pagingCfg after scroll');

         spInstance.handleScroll();//to reset _curState
         spInstance.handleScrollEdge('down', {down: true, up: false});
         assert.equal('middle', spInstance._curState, 'Wrong curState after scroll to edge down');
         assert.deepEqual({
            stateBegin: 'normal',
            statePrev: 'normal',
            stateNext: 'normal',
            stateEnd: 'normal'
         }, result, 'Wrong pagingCfg after scroll');

      });

      it('_private.getStateByHasMore', function() {
         assert.equal(ScrollPaging._private.getStateByHasMoreData(true), 'normal');
         assert.equal(ScrollPaging._private.getStateByHasMoreData(false), 'disabled');
      });
   })
});
