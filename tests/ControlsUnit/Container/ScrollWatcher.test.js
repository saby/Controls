/**
 * Created by kraynovdo on 22.02.2018.
 */
/**
 * Created by kraynovdo on 07.02.2018.
 */
define([
   'Controls/scroll',
   'Types/source',
   'Core/core-instance'
], function(scrollMod, source, cInstance){

   const global = (function() {
      return this || (0, eval)('this');
   })();

   describe('Controls.Container.Scroll.Watcher', function () {
      var registrarMock, evType = [];
      beforeEach(function() {
         registrarMock = {
            start: function(eType) {
               evType.push(eType);
            },
            destroy: function(){},
            unregister: function(){}
         };

      });

      it('sendCanScroll', function () {
         var ins = new scrollMod.Watcher(), clientHeight, scrollHeight;

         var clientRect = {
            test: 1
         };
         var afterMountSendCliendRect = false;
         var originalSendCanScroll = scrollMod.Watcher._private.sendCanScroll;
         scrollMod.Watcher._private.sendCanScroll = function(e, clientHeight, scrollHeight, rect) {
            if (rect === clientRect) {
               afterMountSendCliendRect = true;
            }
         };
         ins._registrar = {
            registry: {
               test: 1
            }
         };
         ins._container = {
            get: function() {
               return {
                  getBoundingClientRect: function() {
                     return clientRect;
                  }
               };
            }
         };
         ins._afterMount({});
         assert.isTrue(afterMountSendCliendRect);
         scrollMod.Watcher._private.sendCanScroll = originalSendCanScroll;

         ins._registrar = registrarMock;

         clientHeight = 300;
         scrollHeight = 300;
         evType = [];
         scrollMod.Watcher._private.sendCanScroll(ins, clientHeight, scrollHeight);
         assert.deepEqual(['cantScroll'], evType, 'Wrong scroll possibility');
         assert.isFalse(ins._canScrollCache, 'Wrong scroll possibility cache');

         clientHeight = 200;
         scrollHeight = 200;
         evType = [];
         scrollMod.Watcher._private.sendCanScroll(ins, clientHeight, scrollHeight);
         assert.deepEqual([], evType, 'Similar event twice');

         scrollHeight = 400;
         evType = [];
         scrollMod.Watcher._private.sendCanScroll(ins, clientHeight, scrollHeight);
         assert.deepEqual(['canScroll'], evType, 'Wrong can scroll value');

         clientHeight = 200;
         scrollHeight = 201;
         evType = [];
         scrollMod.Watcher._private.sendCanScroll(ins, clientHeight, scrollHeight);
         assert.deepEqual(['cantScroll'], evType, 'Wrong scroll possibility');
      });

      it('sendEdgePositions', function () {
         var ins = new scrollMod.Watcher(), clientHeight, scrollHeight, scrollTop;
         ins._registrar = registrarMock;

         clientHeight = 300;
         scrollHeight = 3000;
         scrollTop = 0;
         evType = [];
         scrollMod.Watcher._private.sendEdgePositions(ins, clientHeight, scrollHeight, scrollTop);
         assert.deepEqual(['listTop', 'loadTopStart', 'loadBottomStop'], evType, 'Wrong scroll commands');

         scrollTop = 99;
         evType = [];
         scrollMod.Watcher._private.sendEdgePositions(ins, clientHeight, scrollHeight, scrollTop);
         assert.deepEqual(['loadTopStart', 'loadBottomStop'], evType, 'Wrong scroll commands');

         scrollTop = 2700;
         evType = [];
         scrollMod.Watcher._private.sendEdgePositions(ins, clientHeight, scrollHeight, scrollTop);
         assert.deepEqual(['listBottom', 'loadTopStop', 'loadBottomStart'], evType, 'Wrong scroll commands');

         scrollTop = 2601;
         evType = [];
         scrollMod.Watcher._private.sendEdgePositions(ins, clientHeight, scrollHeight, scrollTop);
         assert.deepEqual(['loadTopStop', 'loadBottomStart'], evType, 'Wrong scroll commands');

         scrollTop = 1500;
         evType = [];
         scrollMod.Watcher._private.sendEdgePositions(ins, clientHeight, scrollHeight, scrollTop);
         assert.deepEqual(['loadTopStop', 'loadBottomStop'], evType, 'Wrong scroll commands');
      });

      it('calcSizeCache', function () {
         let ins = new scrollMod.Watcher();
         let containerMock = {
            clientHeight: 300,
            scrollHeight: 3000
         };
         let zeroContainerMock = {
            clientHeight: 0,
            scrollHeight: 0
         };
         
         scrollMod.Watcher._private.calcSizeCache(ins, zeroContainerMock);
         assert.deepEqual(zeroContainerMock, ins._sizeCache, 'Must cache zero values if cache is empty');
         
         scrollMod.Watcher._private.calcSizeCache(ins, containerMock);
         assert.deepEqual(containerMock, ins._sizeCache, 'Wrong size cache values');

         scrollMod.Watcher._private.calcSizeCache(ins, zeroContainerMock);
         assert.deepEqual(containerMock, ins._sizeCache, 'Must keep old values if cache is non-empty');
      });

      it('onResizeContainer', function () {
         var ins = new scrollMod.Watcher();
         ins._registrar = registrarMock;
         var containerMock = {
            scrollTop: 10,
            clientHeight: 300,
            scrollHeight: 400,
            getBoundingClientRect: () => {}
         };

         ins._scrollTopCache = 111;
         evType = [];
         scrollMod.Watcher._private.onResizeContainer(ins, containerMock, true);
         assert.deepEqual({clientHeight: 300, scrollHeight: 400}, ins._sizeCache, 'Wrong size cache values');
         assert.deepEqual(10, containerMock.scrollTop, 'Wrong scrollTop value after resize');
         assert.deepEqual(['canScroll'], evType, 'Wrong can scroll value');

         evType = [];
         scrollMod.Watcher._private.onResizeContainer(ins, containerMock);
         assert.deepEqual(['listBottom', 'loadTopStop', 'loadBottomStart'], evType, 'Not send edge positions without observer');
      });

      it('onResizeContainer: notify \'viewPortResize\' if need', function () {
         var ins = new scrollMod.Watcher();
         ins._registrar = registrarMock;
         const nativeMockStart = ins._registrar.start;
         ins._registrar.start = (eType, params) => {
            if (eType === 'viewportResize') {
               assert.equal(params.clientHeight, 300, 'Wrong new height of container');
            }
            nativeMockStart(eType);
         };
         ins._sizeCache = {
            clientHeight: 500,
            scrollHeight: 800
         };
         var containerMock = {
            scrollTop: 10,
            clientHeight: 300,
            scrollHeight: 400,
            getBoundingClientRect: () => {}
         };

         ins._scrollTopCache = 111;
         evType = [];
         scrollMod.Watcher._private.onResizeContainer(ins, containerMock, true);
         assert.deepEqual({clientHeight: 300, scrollHeight: 400}, ins._sizeCache, 'Wrong size cache values');
         assert.deepEqual(['canScroll', 'viewportResize', 'scrollResize'], evType);
         registrarMock.start = nativeMockStart;
      });

      it('onScrollContainer', function() {
         return new Promise(function(resolve, reject) {
            var ins = new scrollMod.Watcher();
            ins._registrar = registrarMock;
            var containerMock = {
               scrollTop: 111,
               clientHeight: 300,
               scrollHeight: 400
            };

            evType = [];
            scrollMod.Watcher._private.onScrollContainer(ins, containerMock);
            setTimeout(function() {
               try {
                  assert.deepEqual(['scrollMoveSync', 'scrollMove', 'listBottom', 'loadTopStop', 'loadBottomStart'], evType, 'Wrong scroll commands on change scroll without observer');

                  evType = [];
                  ins._scrollPositionCache = null;
                  ins._scrollTopCache = 110;
                  scrollMod.Watcher._private.onScrollContainer(ins, containerMock, true);
                  setTimeout(function() {
                     try {
                        assert.deepEqual(['scrollMoveSync', 'scrollMove'], evType, 'Wrong scroll commands on change scroll with observer');
                        assert.equal(111, ins._scrollTopCache, 'Wrong scrollTop cache value after scroll');
                        resolve();
                     } catch (e) {
                        reject(e);
                     }
                  });
               } catch(e) {
                  reject(e);
               }
            });
         });
      });

      it('onScrollContainer debounce 3', function (done) {
         //fast scrolling: 3 scroll events and check after 100ms
         var ins = new scrollMod.Watcher();
         var registrarMockDebounce = {
            start: function(type, args) {
               if (type === 'scrollMove') {
                   evType.push({
                       eType: type,
                       eArgs: args
                   });
               }
            }
         };
         ins._registrar = registrarMockDebounce;
         var containerMock = {
            scrollTop: 2,
            clientHeight: 300,
            scrollHeight: 400
         };

         evType = [];
         ins._scrollPositionCache = 'middle';
         //fast scrolling: 3 scroll events and check after 100ms
         scrollMod.Watcher._private.onScrollContainer(ins, containerMock, true);

         containerMock.scrollTop = 12;
         scrollMod.Watcher._private.onScrollContainer(ins, containerMock, true);

         containerMock.scrollTop = 22;
         scrollMod.Watcher._private.onScrollContainer(ins, containerMock, true);

         setTimeout(function(){
            assert.deepEqual([
               {eType: 'scrollMove', eArgs : {position : "middle", scrollTop: 22, clientHeight: 300, scrollHeight: 400}}
            ], evType, 'Wrong scroll commands on change scroll without observer');
            done();
         }, 100);
      });

      it('onScrollContainer 3 scroll events + start scrollPositionCache="up"', function (done) {
         var ins = new scrollMod.Watcher();
         var registrarMockDebounce = {
            start: function(type, args) {
               if (type === 'scrollMove') {
                  evType.push({
                     eType: type,
                     eArgs: args
                  });
               }
            }
         };
         ins._registrar = registrarMockDebounce;
         var containerMock = {
            scrollTop: 0,
            clientHeight: 300,
            scrollHeight: 400
         };
         ins._scrollPositionCache = 'up';

         evType = [];
         containerMock.scrollTop = 2;
         scrollMod.Watcher._private.onScrollContainer(ins, containerMock, true);
         setTimeout(function() {
            containerMock.scrollTop = 12;
            scrollMod.Watcher._private.onScrollContainer(ins, containerMock, true);
            setTimeout(function(){
               containerMock.scrollTop = 22;
               scrollMod.Watcher._private.onScrollContainer(ins, containerMock, true);
               setTimeout(function() {
                  assert.deepEqual([
                     {eType: 'scrollMove', eArgs: {position: "middle", scrollTop: 2, clientHeight: 300, scrollHeight: 400}},
                     {eType: 'scrollMove', eArgs: {position: "middle", scrollTop: 12, clientHeight: 300, scrollHeight: 400}},
                     {eType: 'scrollMove', eArgs: {position: "middle", scrollTop: 22, clientHeight: 300, scrollHeight: 400}}
                  ], evType, 'Wrong scroll commands on change scroll without observer');
                  done();
               }, 100);
            }, 100);
         }, 10);
      });

      it('onScrollContainer debounce 2 + 1', function (done) {
         //fast scrolling: 3 scroll events and check after 100ms
         var ins = new scrollMod.Watcher();
         var registrarMockDebounce = {
            start: function(type, args) {
               if (type === 'scrollMove') {
                  evType.push({
                     eType: type,
                     eArgs: args
                  });
               }
            }
         };
         ins._registrar = registrarMockDebounce;
         var containerMock = {
            scrollTop: 2,
            clientHeight: 300,
            scrollHeight: 400
         };
         ins._scrollPositionCache = 'middle';

         evType = [];
         //fast scrolling
         scrollMod.Watcher._private.onScrollContainer(ins, containerMock, true);

         containerMock.scrollTop = 12;
         scrollMod.Watcher._private.onScrollContainer(ins, containerMock, true);


         setTimeout(function(){
            containerMock.scrollTop = 22;
            scrollMod.Watcher._private.onScrollContainer(ins, containerMock, true);
            setTimeout(function() {
               assert.deepEqual([
                  {eType: 'scrollMove', eArgs: {position: "middle", scrollTop: 12, clientHeight: 300, scrollHeight: 400}},
                  {eType: 'scrollMove', eArgs: {position: "middle", scrollTop: 22, clientHeight: 300, scrollHeight: 400}}
               ], evType, 'Wrong scroll commands on change scroll without observer');
               done();
            }, 100);

         }, 100);

      });

      it('doScroll', function () {
         var ins = new scrollMod.Watcher(), clientHeight, scrollHeight;
         ins._registrar = registrarMock;
         var containerMock = {
            scrollTop: 20,
            clientHeight: 300,
            scrollHeight: 3000
         };
         ins._container = containerMock;
         ins._scrollTopCache = containerMock.scrollTop;
         scrollMod.Watcher._private.calcSizeCache(ins, containerMock);


         scrollMod.Watcher._private.doScroll(ins, 'top', containerMock);
         assert.deepEqual(0, containerMock.scrollTop, 'Wrong scrollTop');

         scrollMod.Watcher._private.doScroll(ins, 'bottom', containerMock);
         assert.deepEqual(2700, containerMock.scrollTop, 'Wrong scrollTop');

         containerMock.scrollTop = 0;
         scrollMod.Watcher._private.doScroll(ins, 'pageDown', containerMock);
         assert.deepEqual(300, containerMock.scrollTop, 'Wrong scrollTop');

         containerMock.scrollTop = 1000;
         scrollMod.Watcher._private.doScroll(ins, 'pageUp', containerMock);
         assert.deepEqual(700, containerMock.scrollTop, 'Wrong scrollTop');
      });

      it('doScroll with virtual placeholder', function() {
         const
            ins = new scrollMod.Watcher(),
            containerMock = {
               scrollTop: 20,
               clientHeight: 300,
               scrollHeight: 3000
            };

         ins._registrar = registrarMock;
         ins._container = containerMock;
         ins._scrollTopCache = containerMock.scrollTop;
         scrollMod.Watcher._private.calcSizeCache(ins, containerMock);

         ins._topPlaceholderSize = 30;
         scrollMod.Watcher._private.doScroll(ins, 'pageDown', containerMock);
         assert.deepEqual(320, containerMock.scrollTop);

         containerMock.scrollTop = 1000;
         scrollMod.Watcher._private.doScroll(ins, 'pageUp', containerMock);
         assert.deepEqual(700, containerMock.scrollTop);

         containerMock.scrollTop = 200;
         ins._topPlaceholderSize = 0;
         scrollMod.Watcher._private.doScroll(ins, 'pageUp', containerMock);
         assert.deepEqual(-100, containerMock.scrollTop);

         containerMock.scrollTop = 200;
         ins._topPlaceholderSize = 200;
         const sendByRegistrar = scrollMod.Watcher._private.sendByRegistrar;
         scrollMod.Watcher._private.sendByRegistrar = (self, event, params) => {
            ins._topPlaceholderSize = 0;
            params.applyScrollTopCallback();
         }
         scrollMod.Watcher._private.doScroll(ins, 'pageUp', containerMock);
         assert.deepEqual(100, containerMock.scrollTop);
         scrollMod.Watcher._private.sendByRegistrar = sendByRegistrar;

         containerMock.scrollTop = 2500;
         ins._bottomPlaceholderSize = 0;
         scrollMod.Watcher._private.doScroll(ins, 'pageDown', containerMock);
         assert.deepEqual(2800, containerMock.scrollTop);

      });
   })
});
