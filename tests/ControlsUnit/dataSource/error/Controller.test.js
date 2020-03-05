/* global define, beforeEach, afterEach, describe, it, assert */
define([
   'Controls/dataSource',
   'Env/Env',
   'Browser/Transport'
], function(dataSource, Env, Transport) {
   describe('Controls/dataSource:error.Controller', function() {
      const Controller = dataSource.error.Controller;

      Controller.prototype._getDefault = () => undefined;

      it('is defined', function() {
         assert.isDefined(Controller);
      });

      it('is constructor', function() {
         assert.isFunction(Controller);
         const controller = new Controller({});
         assert.instanceOf(controller, Controller);
      });

      describe('addHandler()', function() {
         const controller = new Controller({});

         it('adds to __handlers', function() {
            const handler = () => undefined;
            controller.addHandler(handler);
            assert.include(controller.__controller.__handlers, handler);
         });

         it('doesn\'t add to __handlers twice', function() {
            const handler = () => undefined;
            controller.addHandler(handler);
            controller.addHandler(handler);
            assert.equal(
               controller.__controller.__handlers.indexOf(handler),
               controller.__controller.__handlers.lastIndexOf(handler)
            );
         });
      });

      describe('removeHandler()', function() {
         const controller = new Controller({});

         it('is function', function() {
            assert.isFunction(controller.removeHandler);
         });

         it('removes from __handlers', function() {
            const handler = () => undefined;
            controller.addHandler(handler);
            controller.removeHandler(handler);
            assert.notInclude(controller.__controller.__handlers, handler);
         });

         it('doesn\'t remove other handlers', function() {
            const handler1 = () => undefined;
            const handler2 = () => undefined;
            controller.addHandler(handler1);
            controller.addHandler(handler2);
            controller.removeHandler(handler1);
            assert.include(controller.__controller.__handlers, handler2);
         });
      });

      describe('process()', function() {
         let controller;
         let error;

         beforeEach(function() {
            controller = new Controller({});
            error = new Error('test error');
         });

         afterEach(function() {
            controller.destroy();
            controller = null;
            error = null;
         });

         const addHandlerPromise =
            () => new Promise(resolve => controller.addHandler(resolve));

         const addFailHandler =
            () => controller.addHandler(() => assert.fail('handler should not be called'));

         it('returns Promise', function() {
            assert.instanceOf(controller.process(error), Promise);
         });

         it('calls registered handler', function() {
            const handlerPromise = addHandlerPromise();
            return controller.process(error).then(() => handlerPromise);
         });

         it('doesn\'t call handler with processed error', function() {
            addFailHandler();
            error.processed = true;
            return controller.process(error);
         });

         it('doesn\'t call handler with canceled error', function() {
            addFailHandler();
            error.canceled = true;
            return controller.process(error);
         });

         it('doesn\'t call with Abort error', function() {
            addFailHandler();
            return controller.process(new Transport.fetch.Errors.Abort('test page'));
         });

         it('calls handler with current args', function() {
            const ARGS = {
               error: error,
               mode: dataSource.error.Mode.include
            };
            const handlerPromise = addHandlerPromise();
            return controller.process(ARGS)
               .then(() => handlerPromise)
               .then(args => assert.deepEqual(args, ARGS));
         });

         it('calls all registered handlers', function() {
            const promises = [];
            for (let i = 0; i < 5; i++) {
               promises.push(addHandlerPromise());
            }
            return controller.process(error).then(() => Promise.all(promises));
         });

         it('stop calling when find answer', function() {
            for (let i = 0; i < 5; i++) {
               controller.addHandler(() => undefined);
            }
            controller.addHandler(() => ({
               template: 'test',
               options: {}
            }));
            addFailHandler();
            return controller.process(error);
         });

         it('returns current handler result', function() {
            const RESULT = {
               template: 'test',
               options: {},
               mode: dataSource.error.Mode.include
            };
            controller.addHandler(() => RESULT);
            return controller.process(error).then((result) => {
               assert.deepEqual(RESULT, {
                  mode: result.mode,
                  template: result.template,
                  options: result.options
               });
            });
         });

         // call application handler
         // default mode in handler's config
         // default mode in result
         // dafault template
      });
   });
});
