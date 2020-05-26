define([
   'Env/Env',
   'Controls/scroll',
   'Core/core-merge',
    'Controls/_scroll/StickyHeader/Utils'
], function(
   Env,
   scroll,
   coreMerge,
   StickyHeaderUtils
) {
   'use strict';

   const
      createComponent = function(Component, cfg) {
         let mv;
         if (Component.getDefaultOptions) {
            cfg = coreMerge(cfg, Component.getDefaultOptions(), {preferSource: true});
         }
         mv = new Component(cfg);
         mv.saveOptions(cfg);
         mv._beforeMount(cfg);
         return mv;
      },
      getRegisterObject = function(cfg) {
         return {
            id: scroll.getNextStickyId(),
            position: (cfg && cfg.position) || 'top',
            container: {
               offsetParent: {}
            },
            inst: {
               getOffset: function() {
                  return 0;
               },
               height: 10,
               resetSticky: sinon.fake(),
               restoreSticky: sinon.fake()
            }
         };
      },
      options = {
      },
      data = {
            id: 2,
            position: 'top',
            mode: 'stackable',
            inst: {
               getOffset: function() {
                  return 0;
               },
               height: 10,
               resetSticky: sinon.fake(),
               restoreSticky: sinon.fake()
            }
         };

   describe('Controls/_scroll/StickyHeader/Controller', function() {
      let component, result;

      beforeEach(function() {
         component = createComponent(scroll._stickyHeaderController, {});
         component._children.stickyFixed = {
            start: sinon.fake()
         };
         component._container = {
            scrollTop: 0,
            scrollHeight: 100,
            clientHeight: 100
         };
         sinon.stub(StickyHeaderUtils, 'isHidden').returns(false);
         // sinon.stub(scroll._stickyHeaderController, '_isVisible').returns(true);
      });

      afterEach(function() {
         sinon.restore();
      });

      describe('_stickyRegisterHandler', function() {
         const event = {
            stopImmediatePropagation: function() {}
         };

         it('should stopImmediatePropagation event', function() {
            let event = {
               blockUpdate: false,
               stopImmediatePropagation: sinon.fake()
            };
            component._afterMount({});
            sinon.stub(component, '_updateTopBottom');
            return component._stickyRegisterHandler(event, data, true).then(function() {
               sinon.assert.calledOnce(event.stopImmediatePropagation);
            });
         });

         [{
            position: 'top'
         }, {
            position: 'bottom',
         }, {
            position: 'topbottom'
         }].forEach(function(test) {
            it(`should register new header on position ${test.position}`, function() {
               let
                  event = {
                     stopImmediatePropagation: sinon.fake()
                  },
                  data = getRegisterObject(test);
               component._afterMount({});
               sinon.stub(component, '_updateTopBottom');
               return component._stickyRegisterHandler(event, data, true).then(function() {
                  assert.deepOwnInclude(component._headers[data.id], data);
                  if (test.position === 'topbottom') {
                     assert.include(component._headersStack['top'], data.id);
                     assert.include(component._headersStack['bottom'], data.id);
                  } else {
                     assert.include(component._headersStack[test.position], data.id);
                  }
               });
            });
         });

         [{
            position: 'top'
         }, {
            position: 'bottom',
         }, {
            position: 'topbottom'
         }].forEach(function(test) {
            it(`should put headers in delayedHeaders collection, after afterMount register on position ${test.position}`, function() {
               let
                  event = {
                     stopImmediatePropagation: sinon.fake()
                  },
                  data = getRegisterObject(test);
               return new Promise((resolve) => {
                  Promise.all([
                     component._stickyRegisterHandler(event, data, true),
                     component._stickyRegisterHandler(event, data, true)
                  ]).then(function() {
                     sinon.stub(component, '_updateTopBottom');
                     assert.equal(component._delayedHeaders.length, 2);
                     component._afterMount({});
                     Promise.resolve().then(() => {
                        assert.equal(component._delayedHeaders.length, 0);
                        if (test.position === 'topbottom'){
                           assert.equal(component._headersStack['top'].length, 2);
                           assert.equal(component._headersStack['bottom'].length, 2);
                        } else{
                           assert.equal(component._headersStack[test.position].length, 2);
                        }
                        resolve();
                     });

                  });
               });
            });
         });



         [{
            position: 'top',
            result: true,
         }, {
            position: 'bottom',
            result: true,
         }, {
            position: 'topbottom',
            result: true,
         }, {
            position: 'top',
            scrollTop: 10,
            result: false,
         }, {
            position: 'bottom',
            clientHeight: 50,
            result: false,
         }].forEach(function(test) {
            it(`should set correct fixedInitially. position: ${test.position}`, function() {
               let
                  event = {
                     stopImmediatePropagation: sinon.fake()
                  },
                  data = getRegisterObject(test);

               component._afterMount({});
               component._container.scrollTop = test.scrollTop || 0;
               component._container.scrollHeight = test.scrollHeight || 100;
               component._container.clientHeight = test.clientHeight || 100;
               return component._stickyRegisterHandler(event, data, true).then(function() {
                  if (test.result) {
                     assert.isTrue(component._headers[data.id].fixedInitially);
                  } else {
                     assert.isFalse(component._headers[data.id].fixedInitially);
                  }
               });
            });
         });

         [{
            position: 'top'
         }, {
            position: 'bottom',
         }, {
            position: 'topbottom'
         }].forEach(function(test) {
            it(`should unregister deleted header on position ${test.position}`, function() {
               sinon.stub(component._stickyHeaderObserver, 'unobserve');
               let event = {
                     blockUpdate: false,
                     stopImmediatePropagation: sinon.fake()
                  },
                  data = getRegisterObject(test);

               component._headers[data.id] = data;
               if (test.position === 'topbottom') {
                  component._headersStack['top'].push(data.id);
                  component._headersStack['bottom'].push(data.id);
               } else {
                  component._headersStack[test.position].push(data.id);
               }
               return component._stickyRegisterHandler(event, data, false).then(function() {
                  assert.isUndefined(component._headers[data.id]);
                  if (test.position === 'topbottom') {
                     assert.notInclude(component._headersStack['top'], data.id);
                     assert.notInclude(component._headersStack['bottom'], data.id);
                  } else {
                     assert.notInclude(component._headersStack[test.position], data.id);
                  }
               });
            });
         });

         it('should remove header from delayedHeaders when its unregister', function () {
            sinon.stub(component._stickyHeaderObserver, 'unobserve');
            let event = {
                   blockUpdate: false,
                   stopImmediatePropagation: sinon.fake()
                },
                data = getRegisterObject({position: 'top'});

            component._headers[data.id] = data;
            component._delayedHeaders[0] = data;
            return component._stickyRegisterHandler(event, data, false).then(function() {
               assert.equal(component._delayedHeaders.length, 0);
            });
         });

         it('should insert header in proper position', function() {
            component._afterMount({});
            return Promise.all([0, 20, 10].map(function(offset, index) {
               const header = {
                  container: {parentElement: 1},
                  id: index,
                  position: 'top',
                  mode: 'stackable',
                  inst: {
                     getOffset: function() {
                        return offset;
                     },
                     resetSticky: sinon.fake(),
                     restoreSticky: sinon.fake()
                  }
               };
               component._stickyRegisterHandler(event, header, true);
            })).then(function() {
               assert.deepEqual(component._headersStack.top, [0, 2, 1]);
            });
         });
      });

      describe('StickyHeader', function() {
         var event = {
            stopImmediatePropagation: function() {}
         };

         describe('_fixedHandler', function() {
            beforeEach(function() {
               component._headers = {
                  sticky1: {
                     mode: 'stackable',
                     inst: {
                        height: 10
                     }
                  },
                  sticky2: {
                     mode: 'stackable',
                     inst: {
                        height: 10
                     }
                  },
                  sticky3: {
                     mode: 'stackable',
                     inst: {
                        height: 10
                     }
                  }
               };
            });
            it('Header with id equal to "sticky" stops being fixed', function() {
               component._fixedHandler(event, coreMerge({
                  id: 'sticky1',
                  fixedPosition: '',
                  shadowVisible: true
               }, data, {preferSource: true}));

               assert.isEmpty(component._fixedHeadersStack.top);
               assert.isEmpty(component._fixedHeadersStack.bottom);
            });
            it('Header with id equal to "sticky" fixed', function() {
               component._fixedHandler(event, {
                  id: 'sticky1',
                  fixedPosition: 'top',
                  shadowVisible: true
               });
               assert.include(component._fixedHeadersStack.top, 'sticky1');

               component._fixedHandler(event, {
                  id: 'sticky2',
                  fixedPosition: 'bottom',
                  shadowVisible: true
               });
               assert.include(component._fixedHeadersStack.bottom, 'sticky2');
            });
            it('Header with id equal to "sticky" fixed and then stop being fixed', function() {
               component._fixedHandler(event, {
                  id: 'sticky1',
                  fixedPosition: 'top',
                  shadowVisible: true
               });
               component._fixedHandler(event, {
                  id: 'sticky1',
                  fixedPosition: '',
                  prevPosition: 'top',
                  shadowVisible: true
               });

               assert.isEmpty(component._fixedHeadersStack.top);
               assert.isEmpty(component._fixedHeadersStack.bottom);
            });
            it('Header with id equal to "sticky" fixed to another position', function() {
               component._fixedHandler(event, {
                  id: 'sticky1',
                  fixedPosition: 'top',
                  prevPosition: '',
                  shadowVisible: true,
                  isFakeFixed: false
               });
               component._fixedHandler(event, {
                  id: 'sticky1',
                  fixedPosition: 'bottom',
                  prevPosition: 'top',
                  shadowVisible: true,
                  isFakeFixed: false
               });

               assert.isEmpty(component._fixedHeadersStack.top);
               assert.include(component._fixedHeadersStack.bottom, 'sticky1');
            });
            it('Header with id equal to "sticky1" fixed, Header with id equal to "sticky2" stop being fixed', function() {
               component._fixedHandler(event, {
                  id: 'sticky1',
                  fixedPosition: 'top',
                  shadowVisible: true
               });
               component._fixedHandler(event, {
                  id: 'sticky2',
                  fixedPosition: '',
                  prevPosition: 'top',
                  shadowVisible: true
               });

               assert.include(component._fixedHeadersStack.top, 'sticky1');
               assert.notInclude(component._fixedHeadersStack.top, 'sticky2');
            });
            it('Header with id equal to "sticky1" stop being fixed, Header with id equal to "sticky2" fixed', function() {
               component._fixedHandler(event, {
                  id: 'sticky1',
                  fixedPosition: '',
                  prevPosition: 'top'
               });
               component._fixedHandler(event, {
                  id: 'sticky2',
                  fixedPosition: 'top'
               });

               assert.include(component._fixedHeadersStack.top, 'sticky2');
               assert.notInclude(component._fixedHeadersStack.top, 'sticky1');
            });
            it('Shadow Optimization Check', function() {
               component._fixedHeadersStack.top = [];
               component._fixedHandler(event, {
                  id: 'sticky1',
                  fixedPosition: 'top',
                  prevPosition: '',
                  mode: 'stackable',
                  height: 10,
                  shadowVisible: true
               });
               sinon.assert.notCalled(component._children.stickyFixed.start);
               component._fixedHandler(event, {
                  id: 'sticky2',
                  fixedPosition: 'top',
                  prevPosition: '',
                  mode: 'stackable',
                  height: 10,
                  shadowVisible: true
               });
               sinon.assert.called(component._children.stickyFixed.start);
               component._fixedHandler(event, {
                  id: 'sticky3',
                  fixedPosition: 'top',
                  prevPosition: '',
                  mode: 'stackable',
                  height: 10,
                  shadowVisible: true
               });
               sinon.assert.called(component._children.stickyFixed.start);
            });
            it('Should not notify new state if one header registered', function() {
               component._fixedHandler(event, {
                  id: 'sticky1',
                  fixedPosition: 'top',
                  mode: 'stackable',
                  height: 10,
                  shadowVisible: true
               });
               sinon.assert.notCalled(component._children.stickyFixed.start);
            });
         });
      });

      describe('getHeadersHeight', function() {
         var event = {
            stopImmediatePropagation: function() {}
         };
         it('should return the correct height without registred headers.', function () {
            assert.equal(component.getHeadersHeight('top'), 0);
            assert.equal(component.getHeadersHeight('bottom'), 0);
            assert.equal(component.getHeadersHeight('top', 'allFixed'), 0);
            assert.equal(component.getHeadersHeight('bottom', 'allFixed'), 0);
         });
         it('should return the correct height after a new header has been registered.', function () {
            return component._stickyRegisterHandler(event, data, true).then(function() {
               assert.equal(component.getHeadersHeight('top'), 0);
               assert.equal(component.getHeadersHeight('bottom'), 0);
               assert.equal(component.getHeadersHeight('top', 'allFixed'), 0);
               assert.equal(component.getHeadersHeight('bottom', 'allFixed'), 0);
            });
         });
         it('should return the correct height after a new replaceable header has been registered and fixed.', function () {
            component._afterMount({});
            return component._stickyRegisterHandler(event, data, true).then(function() {
               component._fixedHandler(event, {
                  container: {parentElement: 1},
                  id: data.id,
                  fixedPosition: 'top',
                  prevPosition: '',
                  height: 10,
                  shadowVisible: true
               });
               assert.equal(component.getHeadersHeight('top'), 10);
               assert.equal(component.getHeadersHeight('bottom'), 0);
               assert.equal(component.getHeadersHeight('top', 'allFixed'), 10);
               assert.equal(component.getHeadersHeight('bottom', 'allFixed'), 0);
            });
         });

         it('should return the correct height after a new header is not at the very top has been registered and fixed.', function () {
            const data = {
               id: 2,
               position: 'top',
               mode: 'stackable',
               inst: {
                  getOffset: function() {
                     return 10;
                  },
                  height: 10,
                  resetSticky: sinon.fake(),
                  restoreSticky: sinon.fake()
               }
            };
            component._afterMount({});
            return component._stickyRegisterHandler(event, data, true).then(function() {
               component._fixedHandler(event, {
                  id: data.id,
                  fixedPosition: 'top',
                  prevPosition: '',
                  height: 10,
                  shadowVisible: true
               });
               assert.equal(component.getHeadersHeight('top'), 0);
               assert.equal(component.getHeadersHeight('bottom'), 0);
               assert.equal(component.getHeadersHeight('top', 'allFixed'), 10);
               assert.equal(component.getHeadersHeight('bottom', 'allFixed'), 0);
            });
         });

         it('should return the correct height after a new stackable header has been registered and fixed.', function () {
            component._afterMount({});
            return component._stickyRegisterHandler(event, coreMerge({ mode: 'stackable' }, data, { preferSource: true }), true).then(function() {
               component._fixedHandler(event, {
                  id: data.id,
                  fixedPosition: 'top',
                  prevPosition: '',
                  height: 10,
                  shadowVisible: true
               });
               assert.equal(component.getHeadersHeight('top'), 10);
               assert.equal(component.getHeadersHeight('bottom'), 0);
               assert.equal(component.getHeadersHeight('top', 'allFixed'), 10);
               assert.equal(component.getHeadersHeight('bottom', 'allFixed'), 0);
            });
         });
      });

   });
});
