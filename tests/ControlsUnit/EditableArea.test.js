define([
   'Controls/editableArea',
   'Types/entity',
   'Core/Deferred',
   'Controls/Constants'
], function(
   editableArea,
   entity,
   Deferred,
   Constants
) {
   'use strict';

   describe('Controls.editableArea:View', function() {
      var
         eventQueue,
         instance,
         cfg,
         cfg2;
      beforeEach(function() {
         eventQueue = [];
         instance = new editableArea.View();
         cfg = {
            editWhenFirstRendered: true,
            editObject: entity.Model.fromObject({
               text: 'qwerty'
            })
         };
         cfg2 = {
            editWhenFirstRendered: false,
            editObject: entity.Model.fromObject({
               text: 'test'
            })
         };
      });
      afterEach(function() {
         instance = null;
      });

      function mockNotify(returnValue) {
         return function(event, eventArgs, eventOptions) {
            eventQueue.push({
               event: event,
               eventArgs: eventArgs,
               eventOptions: eventOptions
            });
            return returnValue;
         };
      }

      it('_beforeMount', function() {
         instance._beforeMount(cfg);
         assert.equal(cfg.isEditing, instance.editWhenFirstRendered);
      });

      it('_afterUpdate', function() {
         var focusCalled = false;
         instance._beginEditTarget = {
            getElementsByTagName: function(tagName) {
               if (tagName === 'input') {
                  return [{
                     focus: function() {
                        focusCalled = true;
                     }
                  }];
               }
            }
         };
         instance._afterUpdate();
         assert.isTrue(focusCalled);
         assert.isNull(instance._beginEditTarget);
      });

      describe('_onClickHandler', function() {
         it('isEditing: true', function() {
            var result = false;
            instance.saveOptions({
               readOnly: false
            });
            instance._beforeMount(cfg);
            instance.beginEdit = function() {
               result = true;
            };
            instance._onClickHandler();
            assert.isFalse(result);
         });
         it('isEditing: false', function() {
            var result = false;
            instance.saveOptions({
               readOnly: false
            });
            instance._beforeMount(cfg2);
            instance.beginEdit = function() {
               result = true;
            };
            instance._onClickHandler();
            assert.isTrue(result);
         });
      });

      describe('_onDeactivatedHandler', function() {
         var result = null;
         beforeEach(function() {
            instance.commitEdit = function() {
               result = true;
            };
         });
         afterEach(function() {
            result = null;
         });

         it('commitOnDeactivate: true, isEditing: true', function(done) {
            instance.saveOptions({
               readOnly: false
            });
            instance._beforeMount(cfg);
            instance.commitEdit = function() {
               done();
            };
            instance._onDeactivatedHandler();
         });

         it('if EditableArea has toolbar then changes should not commit on deactivated', function() {
            instance.saveOptions({
               readOnly: false,
               toolbarVisibility: true
            });
            instance._beforeMount(cfg);
            instance._onDeactivatedHandler();
            assert.isNotOk(result);
         });
      });

      describe('_onKeyDown', function() {
         it('Enter', function(done) {
            var result = false;
            instance._beforeMount(cfg);
            instance.commitEdit = function() {
               done();
            };
            instance._onKeyDown({
               nativeEvent: {
                  keyCode: 13
               }
            });
         });
         it('Esc', function() {
            var result = false;
            instance._beforeMount(cfg);
            instance.cancelEdit = function() {
               result = true;
            };
            instance._onKeyDown({
               nativeEvent: {
                  keyCode: 27
               }
            });
            assert.isTrue(result);
         });
      });

      describe('beginEdit', function() {
         var
            event = {
               target: {
                  closest: function(selector) {
                     return selector === '.controls-EditableArea__editorWrapper';
                  }
               }
            };

         it('without cancelling', function() {
            instance.saveOptions(cfg);
            instance._beforeMount(cfg);
            instance._notify = mockNotify();
            instance.beginEdit(event);
            assert.equal(eventQueue[0].event, 'beforeBeginEdit');
            assert.isTrue(eventQueue[0].eventArgs[0].isEqual(instance._options.editObject));
            assert.isTrue(eventQueue[0].eventOptions.bubbling);
            assert.isTrue(instance._isEditing);
            assert.isTrue(instance._beginEditTarget);
         });

         it('without arguments', function() {
            instance.saveOptions(cfg);
            instance._beforeMount(cfg);
            instance._notify = mockNotify();
            instance.beginEdit();
            assert.equal(eventQueue[0].event, 'beforeBeginEdit');
            assert.isTrue(eventQueue[0].eventArgs[0].isEqual(instance._options.editObject));
            assert.isTrue(eventQueue[0].eventOptions.bubbling);
            assert.isTrue(instance._isEditing);
            assert.isNull(instance._beginEditTarget);
         });

         it('cancel', function() {
            instance.saveOptions(cfg2);
            instance._beforeMount(cfg2);
            instance._notify = mockNotify(Constants.editing.CANCEL);
            instance.beginEdit(event);
            assert.equal(eventQueue[0].event, 'beforeBeginEdit');
            assert.isTrue(eventQueue[0].eventArgs[0].isEqual(instance._options.editObject));
            assert.isTrue(eventQueue[0].eventOptions.bubbling);
            assert.isFalse(instance._isEditing);
            assert.isNotOk(instance._beginEditTarget);
         });
      });

      describe('cancelEdit', function() {
         it('without cancelling', function() {
            instance._beforeMount(cfg);
            instance.saveOptions(cfg);
            instance._notify = mockNotify();
            instance._editObject.set('text', 'changed');
            instance.cancelEdit();
            assert.equal(eventQueue.length, 2);
            assert.equal(eventQueue[0].event, 'beforeEndEdit');
            assert.equal(eventQueue[0].eventArgs[0], instance._editObject);
            assert.equal(eventQueue[1].event, 'afterEndEdit');
            assert.equal(eventQueue[1].eventArgs[0], instance._editObject);
            assert.equal(instance._editObject.get('text'), 'qwerty');
            assert.isFalse(instance._editObject.isChanged());
            assert.isFalse(instance._options.editObject.isChanged());
            assert.isFalse(instance._isEditing);
         });

         it('cancel', function() {
            instance.saveOptions(cfg);
            instance._beforeMount(cfg);
            instance._notify = mockNotify(Constants.editing.CANCEL);
            instance._editObject.set('text', 'changed');
            instance.cancelEdit();
            assert.equal(eventQueue.length, 1);
            assert.equal(eventQueue[0].event, 'beforeEndEdit');
            assert.equal(eventQueue[0].eventArgs[0], instance._editObject);
            assert.equal(instance._editObject.get('text'), 'changed');
            assert.isTrue(instance._editObject.isChanged());
            assert.isFalse(instance._options.editObject.isChanged());
         });

         it('deferred', async function() {
            instance.saveOptions(cfg);
            instance._beforeMount(cfg);
            instance._notify = mockNotify(Deferred.success());
            instance._editObject.set('text', 'changed');
            await instance.cancelEdit();
            assert.equal(eventQueue.length, 2);
            assert.equal(eventQueue[0].event, 'beforeEndEdit');
            assert.equal(eventQueue[0].eventArgs[0], instance._editObject);
            assert.equal(instance._editObject.get('text'), 'qwerty');
            assert.equal(eventQueue[1].event, 'afterEndEdit');
            assert.equal(eventQueue[1].eventArgs[0], instance._editObject);
            assert.isFalse(instance._isEditing);
            assert.isFalse(instance._editObject.isChanged());
            assert.isFalse(instance._options.editObject.isChanged());
         });
      });

      describe('commitEdit', function() {
         it('without cancelling, successful validation', async function() {
            instance._children = {
               formController: {
                  submit: function() {
                     return Deferred.success({});
                  }
               }
            };
            instance.saveOptions(cfg);
            instance._beforeMount(cfg);
            instance._notify = mockNotify();
            instance._editObject.set('text', 'asdf');
            await instance.commitEdit();
            assert.equal(eventQueue.length, 2);
            assert.equal(eventQueue[0].event, 'beforeEndEdit');
            assert.equal(eventQueue[0].eventArgs[0], instance._editObject);
            assert.equal(eventQueue[1].event, 'afterEndEdit');
            assert.equal(eventQueue[1].eventArgs[0], instance._editObject);
            assert.equal(cfg.editObject.get('text'), 'asdf');
            assert.isFalse(instance._editObject.isChanged());
            assert.isTrue(instance._options.editObject.isChanged());
            assert.isFalse(instance._isEditing);
         });

         it('cancel, successful validation', async function() {
            instance._children = {
               formController: {
                  submit: function() {
                     return Deferred.success({});
                  }
               }
            };
            instance.saveOptions(cfg);
            instance._beforeMount(cfg);
            instance._notify = mockNotify(Constants.editing.CANCEL);
            instance._editObject.set('text', 'asdf');
            await instance.commitEdit();
            assert.equal(eventQueue.length, 1);
            assert.equal(eventQueue[0].event, 'beforeEndEdit');
            assert.equal(eventQueue[0].eventArgs[0], instance._editObject);
            assert.equal(instance._editObject.get('text'), 'asdf');
            assert.isTrue(instance._editObject.isChanged());
            assert.isFalse(instance._options.editObject.isChanged());
            assert.isTrue(instance._isEditing);
         });

         it('unsuccessful validation', async function() {
            instance._children = {
               formController: {
                  submit: function() {
                     return Deferred.success({
                        0: 'Поле является обязательным для заполнения'
                     });
                  }
               }
            };
            instance.saveOptions(cfg);
            instance._beforeMount(cfg);
            instance._notify = mockNotify();
            instance._editObject.set('text', 'asdf');
            await instance.commitEdit();
            assert.equal(eventQueue.length, 0);
            assert.isTrue(instance._isEditing);
            assert.equal(instance._editObject.get('text'), 'asdf');
            assert.isTrue(instance._editObject.isChanged());
            assert.isFalse(instance._options.editObject.isChanged());
         });

         it('deferred', async function() {
            instance._children = {
               formController: {
                  submit: function() {
                     return Deferred.success({});
                  }
               }
            };
            instance.saveOptions(cfg);
            instance._beforeMount(cfg);
            instance._notify = mockNotify(Deferred.success());
            instance._editObject.set('text', 'asdf');
            await instance.commitEdit();
            assert.equal(eventQueue.length, 2);
            assert.equal(eventQueue[0].event, 'beforeEndEdit');
            assert.equal(eventQueue[0].eventArgs[0], instance._editObject);
            assert.equal(eventQueue[1].event, 'afterEndEdit');
            assert.equal(eventQueue[1].eventArgs[0], instance._editObject);
            assert.equal(cfg.editObject.get('text'), 'asdf');
            assert.isFalse(instance._isEditing);
            assert.isFalse(instance._editObject.isChanged());
            assert.isTrue(instance._options.editObject.isChanged());
         });
      });
   });
});
