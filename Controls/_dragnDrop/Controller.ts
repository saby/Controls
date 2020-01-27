import Control = require('Core/Control');
import template = require('wml!Controls/_dragnDrop/Controller/Controller');
import 'Controls/_dragnDrop/DraggingTemplate';
      /**
       * Контроллер обеспечивает взаимосвязь между контейнерами перемещения Controls/dragnDrop:Container.
       * Он отслеживает события контейнеров и оповещает о них другие контейнеры.
       * Контроллер отвечает за отображение и позиционирование шаблона, указанного в опции draggingTemplate в контейнерах.
       * Перетаскивание элементов работает только внутри Controls/dragnDrop:Container.
       * Подробнее читайте <a href="/doc/platform/developmentapl/interface-development/controls/tools/drag-n-drop/">здесь</a>.
       * @class Controls/_dragnDrop/Controller
       * @extends Core/Control
       * @control
       * @public
       * @author Авраменко А.С.
       * @category DragNDrop
       */

      /*
       * The drag'n'drop Controller provides a relationship between different Controls/dragnDrop:Container.
       * It tracks Container events and notifies other Containers about them.
       * The Controller is responsible for displaying and positioning the template specified in the draggingTemplate option at the Containers.
       * Drag and drop the entity only works inside Controls/dragnDrop:Container.
       * More information you can read <a href="/doc/platform/developmentapl/interface-development/controls/drag-n-drop/">here</a>.
       * @class Controls/_dragnDrop/Controller
       * @extends Core/Control
       * @control
       * @public
       * @author Авраменко А.С.
       * @category DragNDrop
       */

       var Controller =  Control.extend({
         _template: template,
         _draggingTemplateOptions: undefined,
         _draggingTemplate: undefined,

          _documentDragEnter: function (event) {
             this._children.dragEnterDetect.start(event.nativeEvent);
          },
          _documentDragOver: function (event) {
             this._children.dragOverDetect.start(event.nativeEvent);
          },
          _documentDragLeave: function (event) {
             this._children.dragLeaveDetect.start(event.nativeEvent);
          },
          _documentDrop: function (event) {
             this._children.dragDropDetect.start(event.nativeEvent);
          },
         _documentDragStart: function(event, dragObject) {
            this._children.dragStartDetect.start(dragObject);
            this._notify('dragStart');
         },

         _documentDragEnd: function(event, dragObject) {
            this._children.dragEndDetect.start(dragObject);
            this._draggingTemplate = null;
            this._draggingTemplateOptions = null;
             this._notify('dragEnd');
         },

         _updateDraggingTemplate: function(event, draggingTemplateOptions, draggingTemplate) {
            this._draggingTemplateOptions = draggingTemplateOptions;
            this._draggingTemplate = draggingTemplate;
         },

         _beforeUnmount: function() {
             this._draggingTemplateOptions = null;
             this._draggingTemplate = null;
         }
      });

      export = Controller;
