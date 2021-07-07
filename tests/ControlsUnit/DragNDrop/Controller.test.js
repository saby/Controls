define([
   'Controls/dragnDrop',
   'Vdom/Vdom'
], function(dragnDrop, Vdom) {
   'use strict';

   dragnDrop.Container._getSelection = function() {
      return {};
   };

   function createNativeEvent(type, pageX, pageY) {
      //mock dom event
      var result =  {
         preventDefault: function() {
            // Check don't call preventDefault (preventDefault "mousedown" event stops closing popup windows).
            if (type === 'mousedown') {
               throw new Error('preventDefault called');
            }
         },
         type: type,
         buttons: 1,
         target: {
            closest: () => false,
            classList: {
               add: () => true,
               remove: () => true
            }
         }
      };
      if (type === 'touchstart' || type === 'touchmove') {
         result.touches = [{
            pageX: pageX,
            pageY: pageY
         }];
      } else if (type === 'touchend') {
         result.changedTouches = [{
            pageX: pageX,
            pageY: pageY
         }];
      } else {
         result.pageX = pageX;
         result.pageY = pageY;
      }

      return result;
   }

   function createSyntheticEvent(type, pageX, pageY) {
      return new Vdom.SyntheticEvent(createNativeEvent(type, pageX, pageY));
   }

   var startEvent = createNativeEvent('mousedown', 20, 10);

   describe('Controls.DragNDrop.Controller', function() {
      var events = [];

      it('isDragStarted', function() {
         assert.isTrue(dragnDrop.Container._isDragStarted(startEvent, createNativeEvent('mousemove', 25, 10)));
         assert.isTrue(dragnDrop.Container._isDragStarted(startEvent, createNativeEvent('mousemove', 20, 15)));
         assert.isTrue(dragnDrop.Container._isDragStarted(startEvent, createNativeEvent('mousemove', 20, 5)));
         assert.isTrue(dragnDrop.Container._isDragStarted(startEvent, createNativeEvent('mousemove', 15, 10)));
         assert.isFalse(dragnDrop.Container._isDragStarted(startEvent, createNativeEvent('mousemove', 24, 10)));
         assert.isFalse(dragnDrop.Container._isDragStarted(startEvent, createNativeEvent('mousemove', 20, 14)));
         assert.isFalse(dragnDrop.Container._isDragStarted(startEvent, createNativeEvent('mousemove', 16, 10)));
         assert.isFalse(dragnDrop.Container._isDragStarted(startEvent, createNativeEvent('mousemove', 20, 6)));
         assert.isTrue(dragnDrop.Container._isDragStarted(startEvent, createNativeEvent('mousemove', 24, 10), true));
         assert.isTrue(dragnDrop.Container._isDragStarted(startEvent, createNativeEvent('mousemove', 20, 14), true));
         assert.isTrue(dragnDrop.Container._isDragStarted(startEvent, createNativeEvent('mousemove', 16, 10), true));
         assert.isTrue(dragnDrop.Container._isDragStarted(startEvent, createNativeEvent('mousemove', 20, 6), true));
      });
      it('class controls-DragNDrop__notDraggable does`t start drag', function() {
         var controller = new dragnDrop.Container();
         var event = createSyntheticEvent('mousedown', 20, 10);
         var sandbox = sinon.createSandbox();
         sandbox.stub(controller, '_registerMouseMove');
         event.target.closest = (value) => value === '.controls-DragNDrop__notDraggable';
         controller.startDragNDrop({}, event);

         sinon.assert.notCalled(controller._registerMouseMove);
      });
      it('_beforeUnmount', function() {
         var controller = new dragnDrop.Container();
         var sandbox = sinon.createSandbox();
         sandbox.stub(controller, '_onMouseUp');

         controller._afterMount();
         controller.startDragNDrop({}, createSyntheticEvent('mousedown', 20, 10));
         controller._beforeUnmount();

         sinon.assert.called(controller._onMouseUp);
      });
      it('getDragOffset', function() {
         assert.deepEqual(dragnDrop.Container._getDragOffset(startEvent, createNativeEvent('mousemove', 40, 20)), {x: -20, y: -10});
         assert.deepEqual(dragnDrop.Container._getDragOffset(startEvent, createNativeEvent('mousemove', 0, 0)), {x: 20, y: 10});
         assert.deepEqual(dragnDrop.Container._getDragOffset(startEvent, createNativeEvent('mousemove', -10, -10)), {x: 30, y: 20});
      });
      describe('getPageXY', function() {
         it('touchstart and touchmove', function() {
            var
               touchmove = createNativeEvent('touchmove', 40, 10),
               touchstart = createNativeEvent('touchstart', 30, 20),
               touchmoveXY = dragnDrop.Container._getPageXY(touchmove),
               touchstartXY = dragnDrop.Container._getPageXY(touchstart);

            assert.deepEqual(touchmoveXY, {x: 40, y: 10});
            assert.deepEqual(touchstartXY, {x: 30, y: 20});
         });
         it('touchend', function() {
            var
               touchend = createNativeEvent('touchend', 50, 60),
               touchendXY = dragnDrop.Container._getPageXY(touchend);

            assert.deepEqual(touchendXY, {x: 50, y: 60});
         });
         it('mouse events', function() {
            var
               mouseup = createNativeEvent('mouseup', 15, 25),
               mouseupXY = dragnDrop.Container._getPageXY(mouseup);

            assert.deepEqual(mouseupXY, {x: 15, y: 25});
         });
      });
      it('dragStart because of mouse leave', function() {
         var
            controller = new dragnDrop.Container(),
            startEvent = createSyntheticEvent('mousedown', 20, 10);

         controller._afterMount();
         controller.startDragNDrop({}, startEvent);

         controller._mouseLeave(createSyntheticEvent('mouseleave', 20, 10));

         assert.isTrue(controller._insideDragging);
      });
      describe('Controls.DragNDrop.Controller phase', function() {
         var
            dragObject,
            entity = {},
            controller = new dragnDrop.Container(),
            startEvent = createSyntheticEvent('mousedown', 20, 10);

         controller._afterMount();

         controller.saveOptions({
            draggingTemplate: 'template'
         });

         controller._notify = function(eventName, args) {
            if (eventName === 'register' || eventName === 'unregister') {
               eventName = eventName + args[0];
            }
            events.push(eventName);
            if (eventName === '_documentDragStart') {
               this._documentDragStart();
            }
            if (eventName === '_documentDragEnd') {
               this._documentDragEnd();
            }
            if (eventName === 'dragMove') {
               dragObject = args[0];
            }
         };

         afterEach(function() {
            events = [];
            dragObject = null;
         });

         describe('mouse', function() {
            it('dragStart', function() {
               events = [];
               controller.startDragNDrop(entity, startEvent);
               assert.equal(startEvent.nativeEvent, controller._startEvent);
               assert.equal(events.join(', '), 'registermousemove, registertouchmove, registermouseup, registertouchend');
            });
            it('mouseMove without start dragMove', function() {
               controller._onMouseMove(createSyntheticEvent('mousemove', 20, 10));
               assert.equal(events.join(', '), '');
               assert.isFalse(controller._documentDragging);
               assert.isFalse(controller._insideDragging);
            });
            it('start dragMove', function() {
               controller._onMouseMove(createSyntheticEvent('mousemove', 25, 10));
               assert.equal(events.join(', '), '_documentDragStart, dragStart, documentDragStart, dragMove, _updateDraggingTemplate');
               assert.isTrue(controller._documentDragging);
               assert.isTrue(controller._insideDragging);
            });
            it('dragMove', function() {
               controller._onMouseMove(createSyntheticEvent('mousemove', 30, 15));
               assert.equal(events.join(', '), 'dragMove, _updateDraggingTemplate');
               assert.deepEqual(dragObject.offset, {x: 10, y: 5});
               assert.deepEqual(dragObject.position, {x: 30, y: 15});
            });
            it('dragLeave', function() {
               controller._mouseLeave(createSyntheticEvent());
               assert.equal(events.join(', '), 'dragLeave');
               assert.isFalse(controller._insideDragging);
            });
            it('dragEnter', function() {
               controller._mouseEnter(createSyntheticEvent());
               assert.equal(events.join(', '), 'dragEnter');
               assert.isTrue(controller._insideDragging);
            });
            it('dragEnd', function() {
               controller._onMouseUp(createSyntheticEvent('mouseup', 50, 45));
               assert.equal(events.join(', '), '_documentDragEnd, dragEnd, documentDragEnd, unregistermousemove, unregistertouchmove, unregistermouseup, unregistertouchend');
               assert.isFalse(controller._documentDragging);
               assert.isFalse(controller._insideDragging);
               assert.isFalse(!!controller._startEvent);
               assert.isFalse(!!controller._dragEntity);
            });
         });
         describe('mouse with pageleave', function() {
            it('dragStart', function() {
               events = [];
               controller.startDragNDrop(entity, startEvent);
               assert.equal(startEvent.nativeEvent, controller._startEvent);
               assert.equal(events.join(', '), 'registermousemove, registertouchmove, registermouseup, registertouchend');
            });
            it('start dragMove', function() {
               controller._onMouseMove(createSyntheticEvent('mousemove', 25, 10));
               assert.equal(events.join(', '), '_documentDragStart, dragStart, documentDragStart, dragMove, _updateDraggingTemplate');
               assert.isTrue(controller._documentDragging);
               assert.isTrue(controller._insideDragging);
            });
            it('dragMove', function() {
               controller._onMouseMove(createSyntheticEvent('mousemove', 30, 15));
               assert.equal(events.join(', '), 'dragMove, _updateDraggingTemplate');
               assert.deepEqual(dragObject.offset, {x: 10, y: 5});
               assert.deepEqual(dragObject.position, {x: 30, y: 15});
            });
            it('pageleave', function() {
               controller._onMouseMove(createSyntheticEvent('mouseleave', 50, 45));
               assert.isTrue(controller._documentDragging);
            });
         });
         describe('touch', function() {
            it('dragStart', function() {
               controller.startDragNDrop(entity, startEvent);
               assert.equal(startEvent.nativeEvent, controller._startEvent);
               assert.equal(events.join(', '), 'registermousemove, registertouchmove, registermouseup, registertouchend');
            });
            it('touchmove without start dragMove', function() {
               controller._documentDragging = false;
               controller._insideDragging = false;
               controller._onTouchMove(createSyntheticEvent('touchmove', 20, 10));
               assert.equal(events.join(', '), '');
               assert.isFalse(controller._documentDragging);
               assert.isFalse(controller._insideDragging);
            });
            it('start dragMove', function() {
               controller._onTouchMove(createSyntheticEvent('touchmove', 25, 10));
               assert.equal(events.join(', '), '_documentDragStart, dragStart, documentDragStart, dragMove, _updateDraggingTemplate');
               assert.isTrue(controller._documentDragging);
               assert.isTrue(controller._insideDragging);
            });
            it('dragMove', function() {
               controller._onTouchMove(createSyntheticEvent('touchmove', 30, 15));
               assert.equal(events.join(', '), 'dragMove, _updateDraggingTemplate');
               assert.deepEqual(dragObject.offset, {x: 10, y: 5});
               assert.deepEqual(dragObject.position, {x: 30, y: 15});
            });
            it('dragLeave', function() {
               controller._mouseLeave(createSyntheticEvent());
               assert.equal(events.join(', '), 'dragLeave');
               assert.isFalse(controller._insideDragging);
            });
            it('dragEnter', function() {
               controller._mouseEnter(createSyntheticEvent());
               assert.equal(events.join(', '), 'dragEnter');
               assert.isTrue(controller._insideDragging);
            });
            it('dragEnd', function() {
               controller._onMouseUp(createSyntheticEvent('mouseup', 50, 45));
               assert.equal(events.join(', '), '_documentDragEnd, dragEnd, documentDragEnd, unregistermousemove, unregistertouchmove, unregistermouseup, unregistertouchend');
               assert.isFalse(controller._documentDragging);
               assert.isFalse(controller._insideDragging);
               assert.isFalse(!!controller._startEvent);
               assert.isFalse(!!controller._dragEntity);
            });
         });
      });
   });
});
