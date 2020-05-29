import Control = require('Core/Control');
import template = require('wml!Controls/_dragnDrop/Controller/Controller');
import 'Controls/_dragnDrop/DraggingTemplate';
      /**
       * Контроллер обеспечивает взаимосвязь между контейнерами перемещения Controls/dragnDrop:Container.
       * Он отслеживает события контейнеров и оповещает о них другие контейнеры.
       * 
       * @remark
       * Контроллер отвечает за отображение и позиционирование шаблона, указанного в опции draggingTemplate в контейнерах.
       * Перетаскивание элементов работает только внутри Controls/dragnDrop:Container.
       * 
       * Полезные ссылки:
       * * <a href="/doc/platform/developmentapl/interface-development/controls/tools/drag-n-drop/">руководство разработчика</a>
       * * <a href="https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/aliases/_dragnDrop.less">переменные тем оформления</a>
       * 
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
      Controller._styles = ['Controls/dragnDrop'];
      export = Controller;
