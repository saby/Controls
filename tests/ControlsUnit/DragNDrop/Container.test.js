define([
   'Controls/dragnDrop'
], function(dragnDrop) {
   'use strict';

   describe('Controls.DragNDrop.Container', function() {
      var
         endDetected = false,
         startDetected = false,
         container = new dragnDrop.Controller();
      container._controllerClass = new dragnDrop.ControllerClass();

      container._controllerClass._registers.documentDragStart.start = function() {
         startDetected = true;
      };

      container._controllerClass._registers.documentDragEnd.start = function() {
         endDetected = true;
      };

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
         container._controllerClass._dialogOpener.open = (options) => {
            openTemplate = options.templateOptions.draggingTemplate;
            openTemplateOptions = options.templateOptions.draggingTemplateOptions;
         };
         container._updateDraggingTemplate(null, draggingTemplateOptions, draggingTemplate);
         assert.equal(openTemplateOptions, draggingTemplateOptions);
         assert.equal(openTemplate, draggingTemplate);
      });
   });
});
