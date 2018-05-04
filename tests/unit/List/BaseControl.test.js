/**
 * Created by kraynovdo on 23.10.2017.
 */
define([
   'Controls/List/BaseControl',
   'Controls/List/resources/utils/ItemsUtil',
   'WS.Data/Source/Memory',
   'WS.Data/Collection/RecordSet',
   'Controls/List/ListViewModel',
   'Controls/List/ListView'
], function(BaseControl, ItemsUtil, MemorySource, RecordSet, ListViewModel){
   describe('Controls.List.BaseControl', function () {
      var data, display, result, source, rs;
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
            },
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
         source = new MemorySource({
            idProperty: 'id',
            data: data
         });
         rs = new RecordSet({
            idProperty: 'id',
            rawData: data
         })
      });
      it('life cycle', function (done) {

         var filter = {1: 1, 2: 2};
         var cfg = {
            viewName : 'Controls/List/ListView',
            viewConfig: {
               keyProperty: 'id'
            },
            viewModelConfig: {
               items : [],
               keyProperty: 'id'
            },
            viewModelConstructor: ListViewModel,
            source: source,
            filter: filter
         };
         var ctrl = new BaseControl(cfg);
         ctrl.saveOptions(cfg);
         var mountResult = ctrl._beforeMount(cfg);
         assert.isTrue(!!mountResult.addCallback, '_beforeMount doesn\'t return deferred');

         assert.isTrue(!!ctrl._sourceController, '_dataSourceController wasn\'t created before mounting');
         assert.deepEqual(filter, ctrl._filter, 'incorrect filter before mounting');

         //received state 3'rd argument
         mountResult = ctrl._beforeMount(cfg, {}, rs);
         assert.isFalse(!!(mountResult && mountResult.addCallback), '_beforeMount return deferred with received state');

         assert.isTrue(!!ctrl._sourceController, '_dataSourceController wasn\'t created before mounting');
         assert.deepEqual(filter, ctrl._filter, 'incorrect filter before mounting');

         //создаем новый сорс
         var oldSourceCtrl = ctrl._sourceController;

         source = new MemorySource({
            idProperty: 'id',
            data: data
         });

         var filter2 = {3: 3};
         cfg = {
            viewName : 'Controls/List/ListView',
            source: source,
            viewModelConstructor: ListViewModel,
            viewModelConfig: {
               items : [],
               keyProperty: 'id'
            },
            filter : filter2
         };

         ctrl._beforeUpdate(cfg);
         assert.isTrue(ctrl._sourceController !== oldSourceCtrl, '_dataSourceController wasn\'t changed before updating');
         assert.deepEqual(filter2, ctrl._filter, 'incorrect filter before updating');

         //сорс грузит асинхронном
         setTimeout(function(){
            ctrl._afterUpdate();
            ctrl._beforeUnmount();
            done();
         },100);



      });

      it('loadToDirection down', function (done) {

         var source = new MemorySource({
            idProperty: 'id',
            data: data
         });

         var cfg = {
            viewName : 'Controls/List/ListView',
            source: source,
            viewConfig: {
               keyProperty: 'id'
            },
            viewModelConfig: {
               items : [],
               keyProperty: 'id'
            },
            viewModelConstructor: ListViewModel,
            navigation: {
               source: 'page',
               sourceConfig: {
                  pageSize: 3,
                  page: 0,
                  mode: 'totalCount'
               }
            }
         };
         var dataLoadFired = false;
         var ctrl = new BaseControl(cfg);
         
         var originNotify = ctrl._notify;
         ctrl._notify = function(event) {
            if (event === 'onDataLoad') {
               dataLoadFired = true;
            }
            originNotify.apply(ctrl, arguments);
         };
         
         ctrl.saveOptions(cfg);
         ctrl._beforeMount(cfg);

         setTimeout(function(){
            BaseControl._private.loadToDirection(ctrl, 'down');
            setTimeout(function(){
               assert.equal(6, BaseControl._private.getItemsCount(ctrl), 'Items wasn\'t load');
               assert.isTrue(dataLoadFired, 'onDataLoad event is not fired');
               done();
            }, 100)
         },100);

      });

      it('loadToDirection down', function (done) {
         var source = new MemorySource({
            idProperty: 'id',
            data: data
         });

         var cfg = {
            viewName : 'Controls/List/ListView',
            source: source,
            viewConfig: {
               keyProperty: 'id'
            },
            viewModelConfig: {
               items : rs,
               keyProperty: 'id'
            },
            viewModelConstructor: ListViewModel,
            navigation: {
               source: 'page',
               sourceConfig: {
                  pageSize: 3,
                  page: 1,
                  mode: 'totalCount'
               }
            }
         };
         var ctrl = new BaseControl(cfg);
         ctrl.saveOptions(cfg);
         ctrl._beforeMount(cfg);

         setTimeout(function(){
            BaseControl._private.loadToDirection(ctrl, 'up');
            setTimeout(function(){
               assert.equal(6, BaseControl._private.getItemsCount(ctrl), 'Items wasn\'t load');
               done();
            }, 100)
         },100);

      });

      it('onScrollLoadEdge', function (done) {
         var rs = new RecordSet({
            idProperty: 'id',
            rawData: data
         });

         var source = new MemorySource({
            idProperty: 'id',
            data: data
         });

         var cfg = {
            viewName : 'Controls/List/ListView',
            source: source,
            viewConfig: {
               keyProperty: 'id'
            },
            viewModelConfig: {
               items : rs,
               keyProperty: 'id'
            },
            viewModelConstructor: ListViewModel,
            navigation: {
               view : 'infinity',
               source: 'page',
               sourceConfig: {
                  pageSize: 3,
                  page: 0,
                  mode: 'totalCount'
               }
            }
         };
         var ctrl = new BaseControl(cfg);
         ctrl.saveOptions(cfg);
         ctrl._beforeMount(cfg);

         //два таймаута, первый - загрузка начального рекордсета, второй - на последюущий запрос
         setTimeout(function(){
            BaseControl._private.onScrollLoadEdge(ctrl, 'down');
            setTimeout(function() {
               assert.equal(6, ctrl._listViewModel.getCount(), 'Items wasn\'t load');
               done();
            },100);
         }, 100);


      });

      it('processLoadError', function () {
         var cfg = {};
         var ctrl = new BaseControl(cfg);
         var error = {message: 'error'};

         result = false;
         ctrl._notify = function(eventName, error) {
            result = error[0];
         };
         BaseControl._private.processLoadError(ctrl, error);

         assert.equal(error, result, 'Event doesn\'t return instance of Error');
      });

      it('indicator', function () {
         var cfg = {};
         var ctrl = new BaseControl(cfg);

         BaseControl._private.showIndicator(ctrl);
         assert.equal(ctrl._loadingState, 'all', 'Wrong loading state');
         assert.equal(ctrl._loadingIndicatorState, 'all', 'Wrong loading state');
         //картинка должен появляться через 2000 мс, проверим, что её нет сразу
         assert.isFalse(!!ctrl._showLoadingIndicatorImage, 'Wrong loading indicator image state');

         //искуственно покажем картинку
         ctrl._showLoadingIndicatorImage = true;
         //и вызовем скрытие
         BaseControl._private.hideIndicator(ctrl);
         assert.equal(ctrl._loadingState, null, 'Wrong loading state');
         assert.equal(ctrl._loadingIndicatorState, null, 'Wrong loading indicator state');
         assert.isFalse(!!ctrl._showLoadingIndicatorImage, 'Wrong loading indicator image state');
      });

      it('scrollToEdge_load', function (done) {
         var rs = new RecordSet({
            idProperty: 'id',
            rawData: data
         });

         var source = new MemorySource({
            idProperty: 'id',
            data: data
         });

         var cfg = {
            viewName : 'Controls/List/ListView',
            source: source,
            viewConfig: {
               keyProperty: 'id'
            },
            viewModelConfig: {
               items : rs,
               keyProperty: 'id'
            },
            viewModelConstructor: ListViewModel,
            navigation: {
               source: 'page',
               sourceConfig: {
                  pageSize: 3,
                  page: 0,
                  mode: 'totalCount'
               }
            }
         };
         var ctrl = new BaseControl(cfg);
         ctrl.saveOptions(cfg);
         ctrl._beforeMount(cfg);


         //два таймаута, первый - загрузка начального рекордсета, второй - на последюущий запрос
         setTimeout(function(){
            BaseControl._private.scrollToEdge(ctrl, 'down');
            setTimeout(function() {
               assert.equal(3, ctrl._listViewModel.getCount(), 'Items wasn\'t load');
               done();
            },100);
         }, 100);

      });

      it('ScrollPagingController', function (done) {
         var rs = new RecordSet({
            idProperty: 'id',
            rawData: data
         });

         var source = new MemorySource({
            idProperty: 'id',
            data: data
         });

         var cfg = {
            viewName : 'Controls/List/ListView',
            source: source,
            viewConfig: {
               keyProperty: 'id'
            },
            viewModelConfig: {
               items : rs,
               keyProperty: 'id'
            },
            viewModelConstructor: ListViewModel,
            navigation: {
               view : 'infinity',
               viewConfig: {
                  pagingMode: 'direct'
               }
            }
         };
         var ctrl = new BaseControl(cfg);
         ctrl.saveOptions(cfg);
         ctrl._beforeMount(cfg);

         //эмулируем появление скролла
         BaseControl._private.onScrollShow(ctrl);

         //скроллпэйджиг контроллер создается асинхронном
         setTimeout(function(){
            assert.isTrue(!!ctrl._scrollPagingCtr, 'ScrollPagingController wasn\'t created');


            //прокручиваем к низу, проверяем состояние пэйджинга
            BaseControl._private.onScrollListEdge(ctrl, 'down');
            assert.deepEqual({stateBegin: "normal", statePrev: "normal", stateNext: "disabled", stateEnd: "disabled"}, ctrl._pagingCfg, 'Wrong state of paging arrows after scroll to bottom');

            BaseControl._private.handleListScroll(ctrl, '200');
            assert.deepEqual({stateBegin: "normal", statePrev: "normal", stateNext: "normal", stateEnd: "normal"}, ctrl._pagingCfg, 'Wrong state of paging arrows after scroll');

            BaseControl._private.onScrollHide(ctrl);
            assert.deepEqual(null, ctrl._pagingCfg, 'Wrong state of paging');

            done();
         }, 100)
      });

      it('scrollToEdge without load', function (done) {
         var rs = new RecordSet({
            idProperty: 'id',
            rawData: data
         });

         var source = new MemorySource({
            idProperty: 'id',
            data: data
         });

         var cfg = {
            viewName : 'Controls/List/ListView',
            source: source,
            viewConfig: {
               keyProperty: 'id'
            },
            viewModelConfig: {
               items : rs,
               keyProperty: 'id'
            },
            viewModelConstructor: ListViewModel,
            navigation: {
               source: 'page',
               sourceConfig: {
                  pageSize: 6,
                  page: 0,
                  mode: 'totalCount'
               },
               view : 'infinity',
               viewConfig: {
                  pagingMode: 'direct'
               }
            }
         };
         var ctrl = new BaseControl(cfg);
         ctrl.saveOptions(cfg);
         ctrl._beforeMount(cfg);

         //дождемся загрузки списка
         setTimeout(function(){
            result = false;
            ctrl._notify = function(event, dir) {
               result = dir;
            };
            //прокручиваем к низу, проверяем состояние пэйджинга
            BaseControl._private.scrollToEdge(ctrl, 'down');
            assert.equal(result, 'bottom', 'List wasn\'t scrolled to bottom');

            BaseControl._private.scrollToEdge(ctrl, 'up');
            assert.equal(result, 'top', 'List wasn\'t scrolled to top');

            done();
         }, 100)
      });

      it('__onPagingArrowClick', function (done) {
         var rs = new RecordSet({
            idProperty: 'id',
            rawData: data
         });

         var source = new MemorySource({
            idProperty: 'id',
            data: data
         });

         var cfg = {
            viewName : 'Controls/List/ListView',
            source: source,
            viewConfig: {
               keyProperty: 'id'
            },
            viewModelConfig: {
               items : rs,
               keyProperty: 'id'
            },
            viewModelConstructor: ListViewModel,
            navigation: {
               source: 'page',
               sourceConfig: {
                  pageSize: 6,
                  page: 0,
                  mode: 'totalCount'
               },
               view : 'infinity',
               viewConfig: {
                  pagingMode: 'direct'
               }
            }
         };
         var ctrl = new BaseControl(cfg);
         ctrl.saveOptions(cfg);
         ctrl._beforeMount(cfg);

         //эмулируем появление скролла
         BaseControl._private.onScrollShow(ctrl);

         //скроллпэйджиг контроллер создается асинхронном
         setTimeout(function(){
            ctrl._notify = function(eventName, type) {
               result = type;
            };

            //прокручиваем к низу, проверяем состояние пэйджинга
            result = false;
            ctrl.__onPagingArrowClick({}, 'End');
            assert.equal('bottom', result[0], 'Wrong state of scroll after clicking to End');

            //прокручиваем к верху, проверяем состояние пэйджинга
            ctrl.__onPagingArrowClick({}, 'Begin');
            assert.equal('top', result[0], 'Wrong state of scroll after clicking to Begin');

            //прокручиваем страницу вверх и вниз, проверяем состояние пэйджинга
            ctrl.__onPagingArrowClick({}, 'Next');
            assert.equal('pageDown', result[0], 'Wrong state of scroll after clicking to Next');

            ctrl.__onPagingArrowClick({}, 'Prev');
            assert.equal('pageUp', result[0], 'Wrong state of scroll after clicking to Prev');

            done();
         }, 100)
      });

      it('__onEmitScroll', function (done) {
         var rs = new RecordSet({
            idProperty: 'id',
            rawData: data
         });

         var source = new MemorySource({
            idProperty: 'id',
            data: data
         });

         var cfg = {
            viewName : 'Controls/List/ListView',
            source: source,
            viewConfig: {
               keyProperty: 'id'
            },
            viewModelConfig: {
               items : rs,
               keyProperty: 'id'
            },
            viewModelConstructor: ListViewModel,
            navigation: {
               source: 'page',
               sourceConfig: {
                  pageSize: 6,
                  page: 0,
                  mode: 'totalCount'
               },
               view : 'infinity',
               viewConfig: {
                  pagingMode: 'direct'
               }
            }
         };
         var ctrl = new BaseControl(cfg);
         ctrl.saveOptions(cfg);
         ctrl._beforeMount(cfg);

         //эмулируем появление скролла
         BaseControl._private.onScrollShow(ctrl);

         //скроллпэйджиг контроллер создается асинхронном
         setTimeout(function(){
            ctrl._notify = function(eventName, type) {
               result = type;
            };

            //прогоняем все варианты, без проверки, т.к. все ветки уже тестируются выше
            ctrl.__onEmitScroll({}, 'loadTop');
            ctrl.__onEmitScroll({}, 'loadBottom');
            ctrl.__onEmitScroll({}, 'listTop');
            ctrl.__onEmitScroll({}, 'listBottom');
            ctrl.__onEmitScroll({}, 'scrollMove', {scrollTop: 200});
            ctrl.__onEmitScroll({}, 'canScroll');
            ctrl.__onEmitScroll({}, 'cantScroll');

            ctrl.reload();

            done();
         }, 100)
      });

      it('_onCheckBoxClick', function () {
         var rs = new RecordSet({
            idProperty: 'id',
            rawData: data
         });

         var source = new MemorySource({
            idProperty: 'id',
            data: data
         });

         var cfg = {
            selectedKeys : [1, 3],
            viewName : 'Controls/List/ListView',
            source: source,
            viewConfig: {
               keyProperty: 'id'
            },
            viewModelConfig: {
               items : rs,
               keyProperty: 'id',
               selectedKeys : [1, 3]
            },
            viewModelConstructor: ListViewModel,
            navigation: {
               source: 'page',
               sourceConfig: {
                  pageSize: 6,
                  page: 0,
                  mode: 'totalCount'
               },
               view : 'infinity',
               viewConfig: {
                  pagingMode: 'direct'
               }
            }
         };
         var ctrl = new BaseControl(cfg);
         ctrl.saveOptions(cfg);
         ctrl._beforeMount(cfg);

         ctrl._onCheckBoxClick({}, 2, 0);
         assert.deepEqual([1, 3, 2], ctrl._listViewModel._multiselection._selectedKeys, 'BaseControl: MultiSelection has wrong selected keys');

         ctrl._onCheckBoxClick({}, 1, 1);
         assert.deepEqual([3, 2], ctrl._listViewModel._multiselection._selectedKeys, 'BaseControl: MultiSelection has wrong selected keys');
      });

      describe('EditInPlace', function() {
         it('editItem', function(done) {
            var opt = {
               test: 'test'
            };
            var cfg = {
               viewName : 'Controls/List/ListView',
               source: source,
               viewConfig: {
                  keyProperty: 'id'
               },
               viewModelConfig: {
                  items : rs,
                  keyProperty: 'id',
                  selectedKeys : [1, 3]
               },
               viewModelConstructor: ListViewModel,
               navigation: {
                  source: 'page',
                  sourceConfig: {
                     pageSize: 6,
                     page: 0,
                     mode: 'totalCount'
                  },
                  view : 'infinity',
                  viewConfig: {
                     pagingMode: 'direct'
                  }
               }
            };
            var ctrl = new BaseControl(cfg);
            ctrl._children = {
               editInPlace: {
                  editItem: function(options) {
                     assert.equal(options, opt);
                     done();
                  }
               }
            };
            ctrl.editItem(opt);
         });

         it('addItem', function(done) {
            var opt = {
               test: 'test'
            };
            var cfg = {
               viewName : 'Controls/List/ListView',
               source: source,
               viewConfig: {
                  keyProperty: 'id'
               },
               viewModelConfig: {
                  items : rs,
                  keyProperty: 'id',
                  selectedKeys : [1, 3]
               },
               viewModelConstructor: ListViewModel,
               navigation: {
                  source: 'page',
                  sourceConfig: {
                     pageSize: 6,
                     page: 0,
                     mode: 'totalCount'
                  },
                  view : 'infinity',
                  viewConfig: {
                     pagingMode: 'direct'
                  }
               }
            };
            var ctrl = new BaseControl(cfg);
            ctrl._children = {
               editInPlace: {
                  addItem: function(options) {
                     assert.equal(options, opt);
                     done();
                  }
               }
            };
            ctrl.addItem(opt);
         });

         it('_onBeforeItemAdd', function() {
            var opt = {
               test: 'test'
            };
            var newOpt = {
               test2: 'test'
            };
            var cfg = {
               viewName : 'Controls/List/ListView',
               source: source,
               viewConfig: {
                  keyProperty: 'id'
               },
               viewModelConfig: {
                  items : rs,
                  keyProperty: 'id',
                  selectedKeys : [1, 3]
               },
               viewModelConstructor: ListViewModel,
               navigation: {
                  source: 'page',
                  sourceConfig: {
                     pageSize: 6,
                     page: 0,
                     mode: 'totalCount'
                  },
                  view : 'infinity',
                  viewConfig: {
                     pagingMode: 'direct'
                  }
               }
            };
            var ctrl = new BaseControl(cfg);
            ctrl._notify = function(e, options) {
               assert.equal(options[0], opt);
               return newOpt;
            };
            var result = ctrl._onBeforeItemAdd({}, opt);
            assert.equal(result, newOpt);
         });

         it('_onBeforeItemEdit', function() {
            var opt = {
               test: 'test'
            };
            var newOpt = {
               test2: 'test'
            };
            var cfg = {
               viewName : 'Controls/List/ListView',
               source: source,
               viewConfig: {
                  keyProperty: 'id'
               },
               viewModelConfig: {
                  items : rs,
                  keyProperty: 'id',
                  selectedKeys : [1, 3]
               },
               viewModelConstructor: ListViewModel,
               navigation: {
                  source: 'page',
                  sourceConfig: {
                     pageSize: 6,
                     page: 0,
                     mode: 'totalCount'
                  },
                  view : 'infinity',
                  viewConfig: {
                     pagingMode: 'direct'
                  }
               }
            };
            var ctrl = new BaseControl(cfg);
            ctrl._notify = function(e, options) {
               assert.equal(options[0], opt);
               return newOpt;
            };
            var result = ctrl._onBeforeItemEdit({}, opt);
            assert.equal(result, newOpt);
         });

         it('_onAfterItemEdit', function() {
            var opt = {
               test: 'test'
            };
            var cfg = {
               viewName : 'Controls/List/ListView',
               source: source,
               viewConfig: {
                  keyProperty: 'id'
               },
               viewModelConfig: {
                  items : rs,
                  keyProperty: 'id',
                  selectedKeys : [1, 3]
               },
               viewModelConstructor: ListViewModel,
               navigation: {
                  source: 'page',
                  sourceConfig: {
                     pageSize: 6,
                     page: 0,
                     mode: 'totalCount'
                  },
                  view : 'infinity',
                  viewConfig: {
                     pagingMode: 'direct'
                  }
               }
            };
            var ctrl = new BaseControl(cfg);
            ctrl._listViewModel = new ListViewModel({ //аналог beforemount
               items : rs,
               keyProperty: 'id',
               selectedKeys : [1, 3]
            });
            ctrl._children = {itemActions: {updateItemActions : function() {}}};
            ctrl._notify = function(e, options) {
               assert.equal(options[0], opt);
            };
            ctrl._onAfterItemEdit({}, opt);
         });

         it('_onBeforeItemEndEdit', function() {
            var opt = {
               test: 'test'
            };
            var newOpt = {
               test2: 'test'
            };
            var cfg = {
               viewName : 'Controls/List/ListView',
               source: source,
               viewConfig: {
                  keyProperty: 'id'
               },
               viewModelConfig: {
                  items : rs,
                  keyProperty: 'id',
                  selectedKeys : [1, 3]
               },
               viewModelConstructor: ListViewModel,
               navigation: {
                  source: 'page',
                  sourceConfig: {
                     pageSize: 6,
                     page: 0,
                     mode: 'totalCount'
                  },
                  view : 'infinity',
                  viewConfig: {
                     pagingMode: 'direct'
                  }
               }
            };
            var ctrl = new BaseControl(cfg);
            ctrl._listViewModel = new ListViewModel({ //аналог beforemount
               items : rs,
               keyProperty: 'id',
               selectedKeys : [1, 3]
            });
            ctrl._children = {itemActions: {updateItemActions : function() {}}};
            ctrl._notify = function(e, options) {
               assert.equal(options[0], opt);
               return newOpt;
            };
            var result = ctrl._onBeforeItemEndEdit({}, opt);
            assert.equal(result, newOpt);
         });

         it('_onAfterItemEndEdit', function() {
            var opt = {
               test: 'test'
            };
            var cfg = {
               viewName : 'Controls/List/ListView',
               source: source,
               viewConfig: {
                  keyProperty: 'id'
               },
               viewModelConfig: {
                  items : rs,
                  keyProperty: 'id',
                  selectedKeys : [1, 3]
               },
               viewModelConstructor: ListViewModel,
               navigation: {
                  source: 'page',
                  sourceConfig: {
                     pageSize: 6,
                     page: 0,
                     mode: 'totalCount'
                  },
                  view : 'infinity',
                  viewConfig: {
                     pagingMode: 'direct'
                  }
               }
            };
            var ctrl = new BaseControl(cfg);
            ctrl._listViewModel = new ListViewModel({ //аналог beforemount
               items : rs,
               keyProperty: 'id',
               selectedKeys : [1, 3]
            });
            ctrl._children = {itemActions: {updateItemActions : function() {}}};
            ctrl._notify = function(e, options) {
               assert.equal(options[0], opt);
            };
            ctrl._onAfterItemEndEdit({}, opt);
         });
      });
   })
});