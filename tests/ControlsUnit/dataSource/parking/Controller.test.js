/* global define, beforeEach, afterEach, describe, it, assert, sinon */
define([
   'Controls/dataSource',
   'Env/Env'
], function(
   { parking: { Controller } },
   { constants }
) {
   function getAppConfig() {
      let appConfig = constants.ApplicationConfig;
      if (!appConfig) {
         appConfig = constants.ApplicationConfig = {};
      }
      return appConfig;
   }

   const configField = 'test-parking-controller';

   class HandlerTest {
      constructor(controller) {
         this.calls = [];
         this.controller = controller;
      }

      createHandler(id, result) {
         return () => {
            this.calls.push(id);
            return result;
         };
      }

      addHandler(id, result) {
         this.controller.addHandler(this.createHandler(id, result));
         return this;
      }

      addPostHandler(id, result) {
         this.controller.addHandler(this.createHandler(id, result), true);
         return this;
      }

      addAppHandler(id, result) {
         const appHandlers = getAppConfig()[configField];
         if (!appHandlers) {
            getAppConfig()[configField] = [];
         }
         appHandlers.push(this.createHandler(id, result));
         return this;
      }
   }

   describe('Controls/dataSource:parking.Controller', function() {
      it('is defined', function() {
         assert.isDefined(Controller);
      });
      it('is a constructor', function() {
         assert.isFunction(Controller);
         var controller = new Controller();
         assert.instanceOf(controller, Controller);
      });

      describe('handlers', function() {
         const controller = new Controller();
         let handler;

         beforeEach(() => {
            handler = () => undefined;
         });

         it('addHandler is a function', function() {
            assert.isFunction(controller.addHandler);
         });

         it('removeHandler is a function', function() {
            assert.isFunction(controller.removeHandler);
         });

         function test(title, isPost) {
            it(title, function() {
               const property = isPost ? '_postHandlers' : '_handlers';
               const otherProperty = isPost ? '_handlers' : '_postHandlers';

               controller.addHandler(handler, isPost);
               assert.include(controller[property], handler, `must add to ${property}`);
               assert.notInclude(controller[otherProperty], handler, `must not add to ${otherProperty}`);

               controller.addHandler(handler, isPost);
               assert.equal(
                  controller[property].indexOf(handler),
                  controller[property].lastIndexOf(handler),
                  'must not add a handler twice');

               controller.removeHandler(handler, isPost);
               assert.notInclude(controller[property], handler, `must remove from ${property}`);
            });
         }

         test('adds and removes a handler', false);
         test('adds and removes a post-handler', true);
      });
      describe('process', function() {
         let controller;
         let error;
         let helper;

         function addHandlerPromise(isPost) {
            return new Promise(resolve => controller.addHandler(resolve, isPost));
         }

         beforeEach(function() {
            controller = new Controller({ configField });
            error = new Error('test error');
            helper = new HandlerTest(controller);

            const appConfig = getAppConfig();
            appConfig[configField] = [];
         });
         afterEach(function() {
            controller.destroy();
            controller = null;
            helper = null;

            const appConfig = getAppConfig();
            delete appConfig[configField];
         });

         it('is function', function() {
            assert.isFunction(controller.process);
         });
         it('returns Promise', function() {
            assert.instanceOf(
               controller.process({}),
               Promise
            );
         });
         it('calls registered handler', function(done) {
            var handler = function() {
               done();
            };
            controller.addHandler(handler);
            controller.process({}).then();
         });
         it('call with current args', function(done) {
            var ARGS = {
               test: 123
            };
            var handler = function(args) {
               assert.deepEqual(args, ARGS);
               done();
            };
            controller.addHandler(handler);
            controller.process(ARGS);
         });
         it('calls all registered handlers', function() {
            helper
               .addHandler(1)
               .addHandler(2)
               .addAppHandler(3)
               .addAppHandler(4)
               .addPostHandler(5)
               .addPostHandler(6);

            return controller.process({ error }).then(() => {
               assert.deepEqual(helper.calls, [1, 2, 3, 4, 5, 6]);
            });
         });
         it('stops calling handlers when a handler returns result', function() {
            const viewConfig = {
               template: 'test',
               options: {}
            };

            helper
               .addHandler(1)
               .addHandler(2, viewConfig)
               .addAppHandler(3)
               .addAppHandler(4)
               .addPostHandler(5)
               .addPostHandler(6);

            return controller.process({ error }).then((processResult) => {
               assert.deepEqual(
                  helper.calls,
                  [1, 2],
                  'must stop calling handlers after getting result');
               assert.deepEqual(processResult, viewConfig, 'must return handler result');
            });
         });
         it('stops calling handlers when an app handler returns result', function() {
            const viewConfig = {
               template: 'test',
               options: {}
            };

            helper
               .addHandler(1)
               .addHandler(2)
               .addAppHandler(3)
               .addAppHandler(4, viewConfig)
               .addPostHandler(5)
               .addPostHandler(6);

            return controller.process({ error }).then((processResult) => {
               assert.deepEqual(
                  helper.calls,
                  [1, 2, 3, 4],
                  'must stop calling handlers after getting result');
               assert.deepEqual(processResult, viewConfig, 'must return handler result');
            });
         });
         it('stops calling handlers when a post handler returns result', function() {
            const viewConfig = {
               template: 'test',
               options: {}
            };

            helper
               .addHandler(1)
               .addHandler(2)
               .addAppHandler(3)
               .addAppHandler(4)
               .addPostHandler(5, viewConfig)
               .addPostHandler(6);

            return controller.process({ error }).then((processResult) => {
               assert.deepEqual(
                  helper.calls,
                  [1, 2, 3, 4, 5],
                  'must stop calling handlers after getting result');
               assert.deepEqual(processResult, viewConfig, 'must return handler result');
            });
         });
         it('merges preset viewConfig with result', function() {
            controller = new Controller({
               configField,
               viewConfig: {
                  mode: 'page',
                  options: {
                     size: 'small'
                  }
               }
            });
            helper = new HandlerTest(controller);

            helper.addHandler(1, {
               template: 'test',
               options: {
                  message: 'test-message'
               }
            });

            return controller.process({ error }).then((processResult) => {
               assert.deepEqual(processResult, {
                  mode: 'page',
                  template: 'test',
                  options: {
                     size: 'small',
                     message: 'test-message'
                  }
               });
            });
         });
         it('overwrites preset viewConfig with result', function() {
            controller = new Controller({
               configField,
               viewConfig: {
                  mode: 'page',
                  options: {
                     size: 'small',
                     message: 'preset-message'
                  }
               }
            });
            helper = new HandlerTest(controller);

            helper.addHandler(1, {
               template: 'test',
               options: {
                  message: 'test-message'
               }
            });

            return controller.process({ error }).then((processResult) => {
               assert.deepEqual(processResult, {
                  mode: 'page',
                  template: 'test',
                  options: {
                     size: 'small',
                     message: 'test-message'
                  }
               });
            });
         });
      });
   });
});
