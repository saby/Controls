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
      getRegisterObject = function(cfg) {
         return {
            id: scroll.getNextStickyId(),
            position: (cfg && cfg.position) || 'top',
            container: {
               offsetParent: {},
               getBoundingClientRect() {
                  return {height: 500};
               }
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
            },
            container: {
               getBoundingClientRect() {
                  return {height: 500};
               }
            }
         };

   describe('Controls/_scroll/StickyHeader/Controller', function() {
      let component, container, result;

      beforeEach(function() {
         component = new scroll._stickyHeaderController({
            _notify: () => undefined

         });
         container = {
            scrollTop: 0,
            scrollHeight: 100,
            clientHeight: 100
         };
         component._canScroll = true;
         sinon.stub(StickyHeaderUtils, 'isHidden').returns(false);
         // sinon.stub(scroll._stickyHeaderController, '_isVisible').returns(true);
      });

      afterEach(function() {
         sinon.restore();
      });


      describe('setCanScroll', function() {
         it('should update value from true to false and should not register waiting headers', function() {
            sinon.stub(component, '_registerDelayed');
            component.setCanScroll(false);
            assert.isFalse(component._canScroll);
            sinon.assert.notCalled(component._registerDelayed);
         });
         it('should update value from false to true and register waiting headers', function() {
            sinon.stub(component, '_registerDelayed');
            component._canScroll = false;
            component.setCanScroll(true);
            assert.isTrue(component._canScroll);
            sinon.assert.called(component._registerDelayed);
         });
      });

      describe('registerHandler', function() {
         const event = {
            stopImmediatePropagation: function() {}
         };

         it('should stopImmediatePropagation event', function() {
            let event = {
               blockUpdate: false,
               stopImmediatePropagation: sinon.fake()
            };
            component.init(container);
            sinon.stub(component, '_updateTopBottom');
            
            return component.registerHandler(event, data, true).then(function() {
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
               component.init(container);
               sinon.stub(component, '_updateTopBottom');
               return component.registerHandler(event, data, true).then(function() {
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
               sinon.stub(component, '_observeStickyHeader');

               return new Promise((resolve) => {
                  Promise.all([
                     component.registerHandler(event, data, true),
                     component.registerHandler(event, data, true)
                  ]).then(function() {
                     sinon.stub(component, '_updateTopBottom');
                     assert.equal(component._delayedHeaders.length, 2);
                     component.init(container);
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

               component.init(container);
               component._container.scrollTop = test.scrollTop || 0;
               component._container.scrollHeight = test.scrollHeight || 100;
               component._container.clientHeight = test.clientHeight || 100;
               return component.registerHandler(event, data, true).then(function() {
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
               sinon.stub(component, '_unobserveStickyHeader');
               let event = {
                     blockUpdate: false,
                     stopImmediatePropagation: sinon.fake()
                  },
                  data = getRegisterObject(test);
               component._headers[data.id] = data;
               if (test.position === 'topbottom') {
                  component._headersStack['top'].push(data.id);
                  component._headersStack['bottom'].push(data.id);
                  component._fixedHeadersStack['bottom'].push(data.id);
               } else {
                  component._headersStack[test.position].push(data.id);
                  component._fixedHeadersStack[test.position].push(data.id);
               }
               return component.registerHandler(event, data, false).then(function() {
                  assert.isUndefined(component._headers[data.id]);
                  if (test.position === 'topbottom') {
                     assert.notInclude(component._headersStack['top'], data.id);
                     assert.notInclude(component._headersStack['bottom'], data.id);
                     assert.notInclude(component._fixedHeadersStack['bottom'], data.id);
                  } else {
                     assert.notInclude(component._headersStack[test.position], data.id);
                     assert.notInclude(component._fixedHeadersStack[test.position], data.id);
                  }
               });
            });
         });

         it('should remove header from delayedHeaders when its unregister', function () {
            sinon.stub(component, '_unobserveStickyHeader');
            let event = {
                   blockUpdate: false,
                   stopImmediatePropagation: sinon.fake()
                },
                data = getRegisterObject({position: 'top'});

            component._headers[data.id] = data;
            component._delayedHeaders[0] = data;
            return component.registerHandler(event, data, false).then(function() {
               assert.equal(component._delayedHeaders.length, 0);
            });
         });

         it('should insert header in proper position', function() {
            component.init(container);
            return Promise.all([0, 20, 10].map(function(offset, index) {
               const header = {
                  container: {
                     parentElement: 1,
                     getBoundingClientRect() {
                        return {height: 500};
                     }
                  },
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
               component.registerHandler(event, header, true);
            })).then(function() {
               assert.deepEqual(component._headersStack.top, [0, 2, 1]);
            });
         });
      });

      describe('_getStickyHeaderElements', function() {
         it('should returns [header.container]', function() {
            const header = getRegisterObject();
            component._getStickyHeaderElements(header);
            assert.deepEqual(component._getStickyHeaderElements(header), [header.container]);
         });
         it('should returns array of all headers in group', function() {
            const header = getRegisterObject();
            header.inst.getChildrenHeaders = function() {
               return [{
                     container: 'container1'
                  }, {
                     container: 'container2'
                  }]
            };
            component._getStickyHeaderElements(header);
            assert.deepEqual(component._getStickyHeaderElements(header), ['container1', 'container2']);
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
                        height: 10,
                        updateFixed: sinon.fake()
                     }
                  },
                  sticky2: {
                     mode: 'stackable',
                     inst: {
                        height: 10,
                        updateFixed: sinon.fake()
                     }
                  },
                  sticky3: {
                     mode: 'stackable',
                     inst: {
                        height: 10,
                        updateFixed: sinon.fake()
                     }
                  }
               };
            });
            it('Header with id equal to "sticky" stops being fixed', function() {
               component.fixedHandler(event, coreMerge({
                  id: 'sticky1',
                  fixedPosition: '',
                  shadowVisible: true
               }, data, {preferSource: true}));

               assert.isEmpty(component._fixedHeadersStack.top);
               assert.isEmpty(component._fixedHeadersStack.bottom);
            });
            it('Header with id equal to "sticky" fixed', function() {
               component.fixedHandler(event, {
                  id: 'sticky1',
                  fixedPosition: 'top',
                  shadowVisible: true
               });
               assert.include(component._fixedHeadersStack.top, 'sticky1');

               component.fixedHandler(event, {
                  id: 'sticky2',
                  fixedPosition: 'bottom',
                  shadowVisible: true
               });
               assert.include(component._fixedHeadersStack.bottom, 'sticky2');
            });
            it('Header with id equal to "sticky" fixed and then stop being fixed', function() {
               component.fixedHandler(event, {
                  id: 'sticky1',
                  fixedPosition: 'top',
                  shadowVisible: true
               });
               component.fixedHandler(event, {
                  id: 'sticky1',
                  fixedPosition: '',
                  prevPosition: 'top',
                  shadowVisible: true
               });

               assert.isEmpty(component._fixedHeadersStack.top);
               assert.isEmpty(component._fixedHeadersStack.bottom);
            });
            it('Header with id equal to "sticky" fixed to another position', function() {
               component.fixedHandler(event, {
                  id: 'sticky1',
                  fixedPosition: 'top',
                  prevPosition: '',
                  shadowVisible: true,
                  isFakeFixed: false
               });
               component.fixedHandler(event, {
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
               component.fixedHandler(event, {
                  id: 'sticky1',
                  fixedPosition: 'top',
                  shadowVisible: true
               });
               component.fixedHandler(event, {
                  id: 'sticky2',
                  fixedPosition: '',
                  prevPosition: 'top',
                  shadowVisible: true
               });

               assert.include(component._fixedHeadersStack.top, 'sticky1');
               assert.notInclude(component._fixedHeadersStack.top, 'sticky2');
            });
            it('Header with id equal to "sticky1" stop being fixed, Header with id equal to "sticky2" fixed', function() {
               component.fixedHandler(event, {
                  id: 'sticky1',
                  fixedPosition: '',
                  prevPosition: 'top'
               });
               component.fixedHandler(event, {
                  id: 'sticky2',
                  fixedPosition: 'top'
               });

               assert.include(component._fixedHeadersStack.top, 'sticky2');
               assert.notInclude(component._fixedHeadersStack.top, 'sticky1');
            });
            it('Shadow Optimization Check', function() {
               component._fixedHeadersStack.top = [];
               component.fixedHandler(event, {
                  id: 'sticky1',
                  fixedPosition: 'top',
                  prevPosition: '',
                  mode: 'stackable',
                  height: 10,
                  shadowVisible: true
               });
               sinon.assert.notCalled(component._headers['sticky1'].inst.updateFixed);
               component.fixedHandler(event, {
                  id: 'sticky2',
                  fixedPosition: 'top',
                  prevPosition: '',
                  mode: 'stackable',
                  height: 10,
                  shadowVisible: true
               });
               sinon.assert.called(component._headers['sticky1'].inst.updateFixed);
               component.fixedHandler(event, {
                  id: 'sticky3',
                  fixedPosition: 'top',
                  prevPosition: '',
                  mode: 'stackable',
                  height: 10,
                  shadowVisible: true
               });
               sinon.assert.called(component._headers['sticky1'].inst.updateFixed);
            });
            it('Should not notify new state if one header registered', function() {
               component.fixedHandler(event, {
                  id: 'sticky1',
                  fixedPosition: 'top',
                  mode: 'stackable',
                  height: 10,
                  shadowVisible: true
               });
               sinon.assert.notCalled(component._headers['sticky1'].inst.updateFixed);
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
            sinon.stub(component, '_observeStickyHeader');
            return component.registerHandler(event, data, true).then(function() {
               assert.equal(component.getHeadersHeight('top'), 0);
               assert.equal(component.getHeadersHeight('bottom'), 0);
               assert.equal(component.getHeadersHeight('top', 'allFixed'), 0);
               assert.equal(component.getHeadersHeight('bottom', 'allFixed'), 0);
            });
         });
         it('should return the correct height after a new replaceable header has been registered and fixed.', function () {
            component.init(container);
            return component.registerHandler(event, data, true).then(function() {
               component.fixedHandler(event, {
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
               },
               container: {
                  getBoundingClientRect() {
                     return {height: 500};
                  }
               }
            };
            component.init(container);
            return component.registerHandler(event, data, true).then(function() {
               component.fixedHandler(event, {
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
            component.init(container);
            return component.registerHandler(event, coreMerge({ mode: 'stackable' }, data, { preferSource: true }), true).then(function() {
               component.fixedHandler(event, {
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
