define([
   'Controls/Utils/scrollToElement'
], function(
   scrollToElement
) {
   describe('Controls/Utils/scrollToElement', function() {

      var documentElement = {};
      function mockDOM(bodyScrollTop, bodyClientHeight) {
         document = {
            body: {
               overflowY: 'scroll',
               scrollTop: bodyScrollTop || 0,
               clientHeight: bodyClientHeight || 0,
               className: '',
               parentElement: {
                  className: ''
               }
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
                  parentElement: {
                     className: ''
                  }
               },
               getBoundingClientRect: function() {
                  return {
                     top: 15,
                     height: 150
                  };
               }
            };
            scrollToElement(element);
            assert.equal(element.parentElement.scrollTop, 5);
         });

         it('to top force', function() {
            mockDOM();
            var element = {
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
                  parentElement: {
                     className: ''
                  }
               },
               getBoundingClientRect: function() {
                  return {
                     top: 15,
                     height: 150
                  };
               }
            };
            scrollToElement(element, false, true);
            assert.equal(element.parentElement.scrollTop, 5);
         });

         it('to bottom', function() {
            mockDOM();
            var element = {
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
                  parentElement: {
                     className: ''
                  }
               },
               getBoundingClientRect: function() {
                  return {
                     top: 15,
                     height: 150
                  };
               }
            };
            scrollToElement(element, true);
            assert.equal(element.parentElement.scrollTop, 55);
         });

         it('should scroll only first parentElement', function () {
            mockDOM();
            let element = {
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
                     parentElement: {
                        className: ''
                     }
                  }
               },
               getBoundingClientRect: function() {
                  return {
                     top: 25,
                     height: 20
                  };
               }
            };
            scrollToElement(element, false, true);
            assert.equal(element.parentElement.parentElement.scrollTop, 0);
            assert.equal(element.parentElement.scrollTop, 10);
         });

         it('to bottom with fractional coords', function() {
            mockDOM();
            var element = {
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
                  parentElement: {
                     className: ''
                  }
               },
               getBoundingClientRect: function() {
                  return {
                     top: 15,
                     height: 150
                  };
               }
            };
            scrollToElement(element, true);
            assert.equal(element.parentElement.scrollTop, 55);
         });

         describe('scroll body', function() {
            it('to top', function() {
               mockDOM(10, 100);
               var element = {
                  parentElement: document.body,
                  className: '',
                  getBoundingClientRect: function() {
                     return {
                        top: 15,
                        height: 150
                     };
                  }
               };
               scrollToElement(element);
               assert.equal(element.parentElement.scrollTop, 15);
            });

            it('to bottom', function() {
               mockDOM(10, 100);
               var element = {
                  parentElement: document.body,
                  getBoundingClientRect: function() {
                     return {
                        top: 15,
                        height: 150
                     };
                  },
                  className: ''
               };
               scrollToElement(element, true);
               assert.equal(element.parentElement.scrollTop, 75);
            });

            it('to bottom with fractional coords', function() {
               mockDOM(10, 100);
               var element = {
                  parentElement: document.body,
                  getBoundingClientRect: function() {
                     return {
                        top: 14.6,
                        height: 150
                     };
                  },
                  className: ''
               };
               scrollToElement(element, true);
               assert.equal(element.parentElement.scrollTop, 75);
            });
         });
      });

      describe('scroll up', function() {
         it('to top', function() {
            mockDOM();
            var element = {
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
                  parentElement: {
                     className: ''
                  }
               },
               getBoundingClientRect: function() {
                  return {
                     top: 10,
                     height: 100
                  };
               }
            };
            scrollToElement(element);
            assert.equal(element.parentElement.scrollTop, -5);
         });

         it('to top force', function() {
            mockDOM();
            var element = {
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
                  parentElement: {
                     className: ''
                  }
               },
               getBoundingClientRect: function() {
                  return {
                     top: 10,
                     height: 100
                  };
               }
            };
            scrollToElement(element, false, true);
            assert.equal(element.parentElement.scrollTop, -5);
         });

         it('to bottom', function() {
            mockDOM();
            var element = {
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
                  parentElement: {
                     className: ''
                  }
               },
               getBoundingClientRect: function() {
                  return {
                     top: 10,
                     height: 100
                  };
               }
            };
            scrollToElement(element, true);
            assert.equal(element.parentElement.scrollTop, -55);
         });

         describe('scroll body', function() {
            it('to top', function() {
               mockDOM(15, 150);
               var element = {
                  parentElement: document.body,
                  className: '',
                  getBoundingClientRect: function() {
                     return {
                        top: 10,
                        height: 100
                     };
                  }
               };
               scrollToElement(element);
               assert.equal(element.parentElement.scrollTop, 10);
            });

            it('to bottom', function() {
               mockDOM(15, 150);
               var element = {
                  parentElement: document.body,
                  className: '',
                  getBoundingClientRect: function() {
                     return {
                        top: 10,
                        height: 100
                     };
                  }
               };
               scrollToElement(element, true);
               assert.equal(element.parentElement.scrollTop, -25);
            });
         });
      });
   });
});
