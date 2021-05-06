define([
   'Controls/scroll'
], function(
   scroll
) {
   describe('Controls/scroll:scrollToElement', function() {

      var documentElement = {};
      function mockDOM(bodyScrollTop, bodyClientHeight) {
         document = {
            body: {
               overflowY: 'scroll',
               scrollTop: bodyScrollTop || 0,
               clientHeight: bodyClientHeight || 0,
               className: '',
               closest: () => [],
               getBoundingClientRect: () => { return { height: 100 }; }
            },
            documentElement: documentElement
         };
         document.body.scrollHeight = document.body.clientHeight + 10;
         window = {
            pageYOffset: 0,
            getComputedStyle: function(element) {
               return {
                  overflowY: element.overflowY,
                  scrollHeight: element.scrollHeight,
                  clientHeight: element.clientHeight
               };
            }
         };
      }

      afterEach(function() {
         document = undefined;
         window = undefined;
      });

      describe('scroll down', function() {
         it('to top', function() {
            mockDOM();
            var element = {
               classList: {
                  contains: () => false
               },
               querySelector: () => null,
               parentElement: {
                  overflowY: 'scroll',
                  scrollHeight: 110,
                  clientHeight: 100,
                  top: 10,
                  getBoundingClientRect: function() {
                     return {
                        top: this.top,
                        height: this.clientHeight
                     };
                  },
                  scrollTop: 0,
                  className: '',
                  closest: () => []
               },
               getBoundingClientRect: function() {
                  return {
                     top: 15,
                     height: 150
                  };
               }
            };
            scroll.scrollToElement(element);
            assert.equal(element.parentElement.scrollTop, 5);
         });

         it('to top force', function() {
            mockDOM();
            var element = {
               classList: {
                  contains: () => false
               },
               querySelector: () => null,
               parentElement: {
                  overflowY: 'scroll',
                  scrollHeight: 110,
                  clientHeight: 100,
                  top: 10,
                  getBoundingClientRect: function() {
                     return {
                        top: this.top,
                        height: this.clientHeight
                     };
                  },
                  scrollTop: 0,
                  className: '',
                  closest: () => []
               },
               getBoundingClientRect: function() {
                  return {
                     top: 15,
                     height: 150
                  };
               }
            };
            scroll.scrollToElement(element, false, true);
            assert.equal(element.parentElement.scrollTop, 5);
         });

         it('to center', function() {
            mockDOM();
            var element = {
               classList: {
                  contains: () => false
               },
               querySelector: () => null,
               parentElement: {
                  overflowY: 'scroll',
                  scrollHeight: 1000,
                  clientHeight: 100,
                  top: 10,
                  getBoundingClientRect: function() {
                     return {
                        top: this.top,
                        height: this.clientHeight
                     };
                  },
                  scrollTop: 300,
                  className: '',
                  closest: () => []
               },
               getBoundingClientRect: function() {
                  return {
                     top: 200,
                     height: 10
                  };
               }
            };
            scroll.scrollToElement(element, 'center');
            assert.equal(element.parentElement.scrollTop, 445);
         });

         it('to bottom', function() {
            mockDOM();
            var element = {
               classList: {
                  contains: () => false
               },
               querySelector: () => null,
               parentElement: {
                  overflowY: 'scroll',
                  scrollHeight: 110,
                  clientHeight: 100,
                  top: 10,
                  getBoundingClientRect: function() {
                     return {
                        top: this.top,
                        height: this.clientHeight
                     };
                  },
                  scrollTop: 0,
                  className: '',
                  closest: () => []
               },
               getBoundingClientRect: function() {
                  return {
                     top: 15,
                     height: 150
                  };
               }
            };
            scroll.scrollToElement(element, true);
            assert.equal(element.parentElement.scrollTop, 55);
         });

         it('should scroll only first parentElement', function () {
            mockDOM();
            let element = {
               classList: {
                  contains: () => false
               },
               querySelector: () => null,
               parentElement: {
                  overflowY: 'scroll',
                  scrollHeight: 110,
                  clientHeight: 100,
                  top: 15,
                  getBoundingClientRect: function() {
                     return {
                        top: this.top,
                        height: this.clientHeight
                     };
                  },
                  scrollTop: 0,
                  className: '',
                  parentElement: {
                     overflowY: 'scroll',
                     scrollHeight: 110,
                     clientHeight: 100,
                     top: 5,
                     getBoundingClientRect: function() {
                        return {
                           top: this.top,
                           height: this.clientHeight
                        };
                     },
                     scrollTop: 0,
                     className: '',
                     closest: () => []
                  },
                  closest: () => []
               },
               getBoundingClientRect: function() {
                  return {
                     top: 25,
                     height: 20
                  };
               },
               closest: () => []
            };
            scroll.scrollToElement(element, false, true);
            assert.equal(element.parentElement.parentElement.scrollTop, 0);
            assert.equal(element.parentElement.scrollTop, 10);
         });

         it('to bottom with fractional coords', function() {
            mockDOM();
            var element = {
               classList: {
                  contains: () => false
               },
               querySelector: () => null,
               parentElement: {
                  overflowY: 'scroll',
                  scrollHeight: 110,
                  clientHeight: 100,
                  top: 10.6,
                  getBoundingClientRect: function() {
                     return {
                        top: this.top,
                        height: this.clientHeight
                     };
                  },
                  scrollTop: 0,
                  className: '',
                  closest: () => []
               },
               getBoundingClientRect: function() {
                  return {
                     top: 15,
                     height: 150
                  };
               }
            };
            scroll.scrollToElement(element, true);
            assert.equal(element.parentElement.scrollTop, 54);
         });

         describe('scroll body', function() {
            it('to top', function() {
               mockDOM(10, 100);
               var element = {
                  classList: {
                     contains: () => false
                  },
                  querySelector: () => null,
                  parentElement: document.body,
                  className: '',
                  getBoundingClientRect: function() {
                     return {
                        top: 15,
                        height: 150
                     };
                  }
               };
               scroll.scrollToElement(element);
               assert.equal(element.parentElement.scrollTop, 15);
            });

            it('to bottom', function() {
               mockDOM(10, 100);
               var element = {
                  classList: {
                     contains: () => false
                  },
                  querySelector: () => null,
                  parentElement: document.body,
                  getBoundingClientRect: function() {
                     return {
                        top: 15,
                        height: 150
                     };
                  },
                  className: ''
               };
               scroll.scrollToElement(element, true);
               assert.equal(element.parentElement.scrollTop, 75);
            });

            it('to bottom with fractional coords', function() {
               mockDOM(10, 100);
               var element = {
                  classList: {
                     contains: () => false
                  },
                  querySelector: () => null,
                  parentElement: document.body,
                  getBoundingClientRect: function() {
                     return {
                        top: 14.6,
                        height: 150
                     };
                  },
                  className: ''
               };
               scroll.scrollToElement(element, true);
               assert.equal(element.parentElement.scrollTop, 75);
            });
         });
      });

      describe('scroll up', function() {
         it('to top', function() {
            mockDOM();
            var element = {
               classList: {
                  contains: () => false
               },
               querySelector: () => null,
               parentElement: {
                  overflowY: 'scroll',
                  scrollHeight: 160,
                  clientHeight: 150,
                  top: 15,
                  className: '',
                  getBoundingClientRect: function() {
                     return {
                        top: this.top,
                        height: this.clientHeight
                     };
                  },
                  scrollTop: 0,
                  closest: () => []
               },
               getBoundingClientRect: function() {
                  return {
                     top: 10,
                     height: 100
                  };
               }
            };
            scroll.scrollToElement(element);
            assert.equal(element.parentElement.scrollTop, -5);
         });

         it('to top force', function() {
            mockDOM();
            var element = {
               classList: {
                  contains: () => false
               },
               querySelector: () => null,
               parentElement: {
                  overflowY: 'scroll',
                  scrollHeight: 160,
                  clientHeight: 150,
                  top: 15,
                  className: '',
                  getBoundingClientRect: function() {
                     return {
                        top: this.top,
                        height: this.clientHeight
                     };
                  },
                  scrollTop: 0,
                  closest: () => []
               },
               getBoundingClientRect: function() {
                  return {
                     top: 10,
                     height: 100
                  };
               }
            };
            scroll.scrollToElement(element, false, true);
            assert.equal(element.parentElement.scrollTop, -5);
         });

         it('to bottom', function() {
            mockDOM();
            var element = {
               classList: {
                  contains: () => false
               },
               querySelector: () => null,
               parentElement: {
                  overflowY: 'scroll',
                  scrollHeight: 160,
                  clientHeight: 150,
                  top: 15,
                  className: '',
                  getBoundingClientRect: function() {
                     return {
                        top: this.top,
                        height: this.clientHeight
                     };
                  },
                  scrollTop: 0,
                  closest: () => []
               },
               getBoundingClientRect: function() {
                  return {
                     top: 10,
                     height: 100
                  };
               }
            };
            scroll.scrollToElement(element, true);
            assert.equal(element.parentElement.scrollTop, -55);
         });

         describe('scroll body', function() {
            it('to top', function() {
               mockDOM(15, 150);
               var element = {
                  classList: {
                     contains: () => false
                  },
                  querySelector: () => null,
                  parentElement: document.body,
                  className: '',
                  getBoundingClientRect: function() {
                     return {
                        top: 10,
                        height: 100
                     };
                  }
               };
               scroll.scrollToElement(element);
               assert.equal(element.parentElement.scrollTop, 10);
            });

            it('to bottom', function() {
               mockDOM(15, 150);
               var element = {
                  classList: {
                     contains: () => false
                  },
                  querySelector: () => null,
                  parentElement: document.body,
                  className: '',
                  getBoundingClientRect: function() {
                     return {
                        top: 10,
                        height: 100
                     };
                  }
               };
               scroll.scrollToElement(element, true);
               assert.equal(element.parentElement.scrollTop, -25);
            });
         });
      });
   });
});
