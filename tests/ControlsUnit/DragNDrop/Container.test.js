define([
   'Controls/dragnDrop'
], function(dragnDrop) {
   'use strict';

   describe('Controls.DragNDrop.Container', function() {
      var
         endDetected = false,
         startDetected = false,
         container = new dragnDrop.Controller();
      container.controllerClass = new dragnDrop.ControllerClass();

      container.controllerClass._registers.documentDragStart.start = function() {
         startDetected = true;
      }

      container.controllerClass._registers.documentDragEnd.start = function() {
         endDetected = true;
      }

      it('documentDragStart', function() {
         container._documentDragStart();
         assert.isTrue(startDetected);
      });

      it('documentDragEnd', function() {
         container._documentDragEnd();
         assert.isTrue(endDetected);
      });

      it('updateDraggingTemplate', function() {
         var
            draggingTemplateOptions = {
               position: {
                  x: 1,
                  y: 2
               }
            },
            draggingTemplate = 'draggingTemplate';
         let openTemplate;
         let openTemplateOptions;
         container._dialogOpener.open = (options) => {
            openTemplate = options.templateOptions.draggingTemplate;
            openTemplateOptions = options.templateOptions.draggingTemplateOptions;
         };
         container._updateDraggingTemplate(null, draggingTemplateOptions, draggingTemplate);
         assert.equal(openTemplateOptions, draggingTemplateOptions);
         assert.equal(openTemplate, draggingTemplate);
      });
   });
});
