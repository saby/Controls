define(
   [
      'Env/Env',
      'Controls/input',
      'ControlsUnit/resources/ProxyCall',
      'ControlsUnit/resources/TemplateUtil',
      'Vdom/Vdom',
      'UI/Utils',

      'wml!ControlsUnit/Input/Area/LinkInReadMode'
   ],
   function(Env, input, ProxyCall, TemplateUtil, Vdom, UIUtils, linkInReadMode) {
      'use strict';

      var SyntheticEvent = Vdom.SyntheticEvent;

      describe('Controls.Input.Area', function() {
         var ctrl, calls;

         beforeEach(function() {
            calls = [];
            ctrl = new input.Area();
         });
         describe('Template', function() {
            describe('ReadOnly', function() {
               var template;

               beforeEach(function() {
                  ctrl._beforeMount({
                     value: ''
                  });
                  template = TemplateUtil.clearTemplate(ctrl._readOnlyField.template);
               });
               it('Insert in the text field "Hi https://www.google.ru/"', function() {
                  ctrl._readOnlyField.scope.value = 'Hi https://www.google.ru/';
                  ctrl._readOnlyField.scope.options = {
                     theme: 'default'
                  };

                  assert.equal(template(ctrl._readOnlyField.scope), linkInReadMode({}));
               });
            });
         });
         describe('Move to new line', function() {
            var event;
            var preventDefault = function() {
            };
            var stopPropagation = function() {
            };

            beforeEach(function() {
               ctrl.paste = ProxyCall.apply(ctrl.paste, 'paste', calls, true);
               preventDefault = ProxyCall.apply(preventDefault, 'preventDefault', calls, true);
               stopPropagation = ProxyCall.apply(stopPropagation, 'stopPropagation', calls, true);
            });

            it('The option newLineKey is equal to enter. Press enter.', function() {
               event = new SyntheticEvent({
                  keyCode: Env.constants.key.enter,
                  ctrlKey: false,
                  altKey: false,
                  shiftKey: false,
                  preventDefault: preventDefault,
                  stopPropagation: stopPropagation
               });
               ctrl._options.newLineKey = 'enter';

               ctrl._keyDownHandler(event);

               assert.deepEqual(calls, [{
                  name: 'stopPropagation',
                  arguments: []
               }]);
            });
            it('The option newLineKey is equal to enter. Press ctrl + enter.', function() {
               event = new SyntheticEvent({
                  keyCode: Env.constants.key.enter,
                  altKey: false,
                  ctrlKey: true,
                  shiftKey: false,
                  preventDefault: preventDefault,
                  stopPropagation: stopPropagation
               });
               ctrl._options.newLineKey = 'enter';

               ctrl._keyDownHandler(event);

               assert.deepEqual(calls, [{
                  name: 'preventDefault',
                  arguments: []
               }]);
            });
            it('The option newLineKey is equal to enter. Press shift + enter.', function() {
               event = new SyntheticEvent({
                  keyCode: Env.constants.key.enter,
                  altKey: false,
                  ctrlKey: false,
                  shiftKey: true,
                  preventDefault: preventDefault,
                  stopPropagation: stopPropagation
               });
               ctrl._options.newLineKey = 'enter';

               ctrl._keyDownHandler(event);

               assert.deepEqual(calls, [{
                  name: 'preventDefault',
                  arguments: []
               }]);
            });
            it('The option newLineKey is equal to enter. Press alt + enter.', function() {
               event = new SyntheticEvent({
                  keyCode: Env.constants.key.enter,
                  altKey: true,
                  ctrlKey: false,
                  shiftKey: false,
                  preventDefault: preventDefault,
                  stopPropagation: stopPropagation
               });
               ctrl._options.newLineKey = 'enter';

               ctrl._keyDownHandler(event);

               assert.deepEqual(calls, [{
                  name: 'preventDefault',
                  arguments: []
               }]);
            });
            it('The option newLineKey is equal to enter. Press ctrl + shift + enter.', function() {
               event = new SyntheticEvent({
                  keyCode: Env.constants.key.enter,
                  altKey: false,
                  ctrlKey: true,
                  shiftKey: true,
                  preventDefault: preventDefault,
                  stopPropagation: stopPropagation
               });
               ctrl._options.newLineKey = 'enter';

               ctrl._keyDownHandler(event);

               assert.deepEqual(calls, [{
                  name: 'preventDefault',
                  arguments: []
               }]);
            });
            it('The option newLineKey is equal to enter. Press ctrl + alt + enter.', function() {
               event = new SyntheticEvent({
                  keyCode: Env.constants.key.enter,
                  altKey: true,
                  ctrlKey: true,
                  shiftKey: false,
                  preventDefault: preventDefault,
                  stopPropagation: stopPropagation
               });
               ctrl._options.newLineKey = 'enter';

               ctrl._keyDownHandler(event);

               assert.deepEqual(calls, [{
                  name: 'preventDefault',
                  arguments: []
               }]);
            });
            it('The option newLineKey is equal to enter. Press shift + alt + enter.', function() {
               event = new SyntheticEvent({
                  keyCode: Env.constants.key.enter,
                  altKey: true,
                  ctrlKey: false,
                  shiftKey: true,
                  preventDefault: preventDefault,
                  stopPropagation: stopPropagation
               });
               ctrl._options.newLineKey = 'enter';

               ctrl._keyDownHandler(event);

               assert.deepEqual(calls, [{
                  name: 'preventDefault',
                  arguments: []
               }]);
            });
            it('The option newLineKey is equal to enter. Press ctrl + shift + alt + enter.', function() {
               event = new SyntheticEvent({
                  keyCode: Env.constants.key.enter,
                  altKey: true,
                  ctrlKey: true,
                  shiftKey: true,
                  preventDefault: preventDefault,
                  stopPropagation: stopPropagation
               });
               ctrl._options.newLineKey = 'enter';

               ctrl._keyDownHandler(event);

               assert.deepEqual(calls, [{
                  name: 'preventDefault',
                  arguments: []
               }]);
            });
            it('The option newLineKey is equal to enter. Press b.', function() {
               event = new SyntheticEvent({
                  keyCode: Env.constants.key.b,
                  altKey: false,
                  ctrlKey: false,
                  shiftKey: false,
                  preventDefault: preventDefault,
                  stopPropagation: stopPropagation
               });
               ctrl._options.newLineKey = 'enter';

               ctrl._keyDownHandler(event);

               assert.deepEqual(calls.length, 0);
            });
            it('The option newLineKey is equal to ctrlEnter. Press enter.', function() {
               event = new SyntheticEvent({
                  keyCode: Env.constants.key.enter,
                  altKey: false,
                  ctrlKey: false,
                  shiftKey: false,
                  preventDefault: preventDefault,
                  stopPropagation: stopPropagation
               });
               ctrl._options.newLineKey = 'ctrlEnter';

               ctrl._keyDownHandler(event);

               assert.deepEqual(calls, [{
                  name: 'preventDefault',
                  arguments: []
               }]);
            });
            it('The option newLineKey is equal to ctrlEnter. Press ctrl + enter.', function() {
               event = new SyntheticEvent({
                  keyCode: Env.constants.key.enter,
                  altKey: false,
                  ctrlKey: true,
                  shiftKey: false,
                  preventDefault: preventDefault,
                  stopPropagation: stopPropagation
               });
               ctrl._options.newLineKey = 'ctrlEnter';

               ctrl._keyDownHandler(event);

               assert.deepEqual(calls, [
                  {
                     name: 'paste',
                     arguments: ['\n']
                  },
                  {
                     name: 'stopPropagation',
                     arguments: []
                  }
               ]);
            });
         });

         describe('Validate lines', function() {
            var stubLogger;
            beforeEach(function() {
               stubLogger = sinon.stub(UIUtils.Logger, 'error').callsFake(() => undefined);
            });
            afterEach(function() {
               stubLogger.restore();
            });
            it('min > max', function() {
               ctrl._beforeMount({
                  minLines: 10,
                  maxLines: 1
               });

               assert.equal(ctrl._minLines, 1);
               assert.equal(ctrl._maxLines, 10);
            });

            it('min < 1 and max < 1', function() {
               ctrl._beforeMount({
                  minLines: -5,
                  maxLines: -5
               });

               assert.equal(ctrl._minLines, 1);
               assert.equal(ctrl._maxLines, 1);
            });

            it('min > 10 and max > 10', function() {
               ctrl._beforeMount({
                  minLines: 15,
                  maxLines: 15
               });

               assert.equal(ctrl._minLines, 10);
               assert.equal(ctrl._maxLines, 10);
            });
         });
      });
   }
);
