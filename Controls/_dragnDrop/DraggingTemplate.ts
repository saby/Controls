import Control = require('Core/Control');
import template = require('wml!Controls/_dragnDrop/DraggingTemplate/DraggingTemplate');

   var MAX_ITEMS_COUNT = 999;

   var _private = {
      getCounterText: function(itemsCount) {
         var result;
         if (itemsCount > MAX_ITEMS_COUNT) {
            result = MAX_ITEMS_COUNT + '+';
         } else if (itemsCount > 1) {
            result = itemsCount;
         }
         return result;
      }
   };

   /**
    * Стандартный шаблон перемещения для списка.
    * 
    * @remark
    * Полезные ссылки:
    * * <a href="/doc/platform/developmentapl/interface-development/controls/drag-n-drop/">руководство разработчика</a>
    * * <a href="https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/aliases/_dragnDrop.less">переменные тем оформления</a>
    *
    * @class Controls/_dragnDrop/DraggingTemplate
    * @extends Core/Control
    * @control
    * @private
    * @author Авраменко А.С.
    * @category DragNDrop
    */

   /*
    * Standard dragging template for the list.
    * More information you can read <a href="/doc/platform/developmentapl/interface-development/controls/drag-n-drop/">here</a>.
    * @class Controls/_dragnDrop/DraggingTemplate
    * @extends Core/Control
    * @control
    * @private
    * @author Авраменко А.С.
    * @category DragNDrop
    */

   /**
    * @name Controls/_dragnDrop/DraggingTemplate#mainText
    * @cfg {String} Основная информация о перемещаемой сущности.
    * @default Запись реестра
    * @example
    * В следующем примере показано, как использовать стандартный шаблон перемещения.
    * <pre>
    *    <Controls.list:View source="{{_viewSource}}"
    *                   keyProperty="id"
    *                   on:dragStart="_onDragStart()"
    *                   itemsDragNDrop="{{true}}">
    *       <ws:draggingTemplate>
    *          <ws:partial template="Controls/_dragnDrop/DraggingTemplate"
    *                      mainText="{{draggingTemplate.entity._options.mainText}}"
    *                      image="{{draggingTemplate.entity._options.image}}"
    *                      additionalText="{{draggingTemplate.entity._options.additionalText}}">
    *          </ws:partial>
    *       </ws:draggingTemplate>
    *    </Controls.list:View>
    * </pre>
    *
    * <pre>
    *   define(...['Types/source', 'Controls/dragnDrop'], function(source, dragnDrop) {
    *        _onDragStart: function(event, items) {
    *            var mainItem = this._items.getRecordById(items[0]);
    *            return new dragnDrop.Entity({
    *                items: items,
    *                mainText: mainItem.get('FIO'),
    *                additionalText: mainItem.get('title'),
    *                image: mainItem.get('userPhoto')
    *           });
    *       },
    *       _beforeMount: function() {
    *                this._viewSource = new source.SbisService({
    *                    ...
    *               });
    *           }
    *           ...
    *       return new dragnDrop.Entity({
    *            ...
    *       });
    *   });
    * </pre>
    */

   /*
    * @name Controls/_dragnDrop/DraggingTemplate#mainText
    * @cfg {String} Main information about the entity being moved.
    * @default Запись реестра
    * @example
    * The following example shows how to use a standard dragging template.
    * <pre>
    *    <Controls.list:View source="{{_viewSource}}"
    *                   keyProperty="id"
    *                   on:dragStart="_onDragStart()"
    *                   itemsDragNDrop="{{true}}">
    *       <ws:draggingTemplate>
    *          <ws:partial template="Controls/_dragnDrop/DraggingTemplate"
    *                      mainText="{{draggingTemplate.entity._options.mainText}}"
    *                      image="{{draggingTemplate.entity._options.image}}"
    *                      additionalText="{{draggingTemplate.entity._options.additionalText}}">
    *          </ws:partial>
    *       </ws:draggingTemplate>
    *    </Controls.list:View>
    * </pre>
    *
    * <pre>
    *   define(...['Types/source', 'Controls/dragnDrop'], function(source, dragnDrop) {
    *        _onDragStart: function(event, items) {
    *            var mainItem = this._items.getRecordById(items[0]);
    *            return new dragnDrop.Entity({
    *                items: items,
    *                mainText: mainItem.get('FIO'),
    *                additionalText: mainItem.get('title'),
    *                image: mainItem.get('userPhoto')
    *           });
    *       },
    *       _beforeMount: function() {
    *                this._viewSource = new source.SbisService({
    *                    ...
    *               });
    *           }
    *           ...
    *       return new dragnDrop.Entity({
    *            ...
    *       });
    *   });
    * </pre>
    */

   /**
    * @name Controls/_dragnDrop/DraggingTemplate#additionalText
    * @cfg {String} Дополнительная информация о перемещаемой сущности (комментарий).
    * @example
    * В следующем примере показано, как использовать стандартный шаблон перемещения.
    * <pre>
    *    <Controls.list:View source="{{_viewSource}}"
    *                   keyProperty="id"
    *                   on:dragStart="_onDragStart()"
    *                   itemsDragNDrop="{{true}}">
    *       <ws:draggingTemplate>
    *          <ws:partial template="Controls/_dragnDrop/DraggingTemplate"
    *                      mainText="{{draggingTemplate.entity._options.mainText}}"
    *                      image="{{draggingTemplate.entity._options.image}}"
    *                      additionalText="{{draggingTemplate.entity._options.additionalText}}">
    *          </ws:partial>
    *       </ws:draggingTemplate>
    *    </Controls.list:View>
    * </pre>
    *
    * <pre>
    *   define(...['Types/source', 'Controls/dragnDrop'], function(source, dragnDrop) {
    *        _onDragStart: function(event, items) {
    *            var mainItem = this._items.getRecordById(items[0]);
    *            return new dragnDrop.Entity({
    *                items: items,
    *                mainText: mainItem.get('FIO'),
    *                additionalText: mainItem.get('title'),
    *                image: mainItem.get('userPhoto')
    *           });
    *       },
    *       _beforeMount: function() {
    *                this._viewSource = new source.SbisService({
    *                    ...
    *               });
    *           }
    *           ...
    *       return new dragnDrop.Entity({
    *            ...
    *       });
    *   });
    * </pre>
    */

   /*
    * @name Controls/_dragnDrop/DraggingTemplate#additionalText
    * @cfg {String} Additional information about the entity being moved.
    * @example
    * The following example shows how to use a standard dragging template.
    * <pre>
    *    <Controls.list:View source="{{_viewSource}}"
    *                   keyProperty="id"
    *                   on:dragStart="_onDragStart()"
    *                   itemsDragNDrop="{{true}}">
    *       <ws:draggingTemplate>
    *          <ws:partial template="Controls/_dragnDrop/DraggingTemplate"
    *                      mainText="{{draggingTemplate.entity._options.mainText}}"
    *                      image="{{draggingTemplate.entity._options.image}}"
    *                      additionalText="{{draggingTemplate.entity._options.additionalText}}">
    *          </ws:partial>
    *       </ws:draggingTemplate>
    *    </Controls.list:View>
    * </pre>
    *
    * <pre>
    *   define(...['Types/source', 'Controls/dragnDrop'], function(source, dragnDrop) {
    *        _onDragStart: function(event, items) {
    *            var mainItem = this._items.getRecordById(items[0]);
    *            return new dragnDrop.Entity({
    *                items: items,
    *                mainText: mainItem.get('FIO'),
    *                additionalText: mainItem.get('title'),
    *                image: mainItem.get('userPhoto')
    *           });
    *       },
    *       _beforeMount: function() {
    *                this._viewSource = new source.SbisService({
    *                    ...
    *               });
    *           }
    *           ...
    *       return new dragnDrop.Entity({
    *            ...
    *       });
    *   });
    * </pre>
    */

   /**
    * @name Controls/_dragnDrop/DraggingTemplate#image
    * @cfg {String} Ссылка на изображение перемещаемого объекта.
    * @remark Опция должна содержать ссылку на изображение. Если этот параметр указан, параметр {@link logo} не применяется.
    * @example
    * В следующем примере показано, как использовать стандартный шаблон перемещения.
    * <pre>
    *    <Controls.list:View source="{{_viewSource}}"
    *                   keyProperty="id"
    *                   on:dragStart="_onDragStart()"
    *                   itemsDragNDrop="{{true}}">
    *       <ws:draggingTemplate>
    *          <ws:partial template="Controls/_dragnDrop/DraggingTemplate"
    *                      mainText="{{draggingTemplate.entity._options.mainText}}"
    *                      image="/resources/imageForDragTemplate.jpg"
    *                      additionalText="{{draggingTemplate.entity._options.additionalText}}">
    *          </ws:partial>
    *       </ws:draggingTemplate>
    *    </Controls.list:View>
    * </pre>
    *
    * <pre>
    *   define(...['Types/source', 'Controls/dragnDrop'], function(source, dragnDrop) {
    *        _onDragStart: function(event, items) {
    *            var mainItem = this._items.getRecordById(items[0]);
    *            return new dragnDrop.Entity({
    *               items: items,
    *               mainText: mainItem.get('FIO'),
    *               additionalText: mainItem.get('title')
    *           });
    *       },
    *       _beforeMount: function() {
    *                this._viewSource = new source.SbisService({
    *                    ...
    *               });
    *           }
    *           ...
    *       return new dragnDrop.Entity({
    *            ...
    *       });
    *   });
    * </pre>
    */

   /*
    * @name Controls/_dragnDrop/DraggingTemplate#image
    * @cfg {String} A image of the entity being moved.
    * @remark The option must contain a link to the image. If this option is specified, the logo option is not applied.
    * @example
    * The following example shows how to use a standard dragging template.
    * <pre>
    *    <Controls.list:View source="{{_viewSource}}"
    *                   keyProperty="id"
    *                   on:dragStart="_onDragStart()"
    *                   itemsDragNDrop="{{true}}">
    *       <ws:draggingTemplate>
    *          <ws:partial template="Controls/_dragnDrop/DraggingTemplate"
    *                      mainText="{{draggingTemplate.entity._options.mainText}}"
    *                      image="/resources/imageForDragTemplate.jpg"
    *                      additionalText="{{draggingTemplate.entity._options.additionalText}}">
    *          </ws:partial>
    *       </ws:draggingTemplate>
    *    </Controls.list:View>
    * </pre>
    *
    * <pre>
    *   define(...['Types/source', 'Controls/dragnDrop'], function(source, dragnDrop) {
    *     _onDragStart: function(event, items) {
    *          var mainItem = this._items.getRecordById(items[0]);
    *          return new dragnDrop.Entity({
    *              items: items,
    *              mainText: mainItem.get('FIO'),
    *              additionalText: mainItem.get('title')
    *         });
    *      },
    *      _beforeMount: function() {
    *                this._viewSource = new source.SbisService({
    *                    ...
    *               });
    *            }
    *            ...
    *      return new dragnDrop.Entity({
    *            ...
    *     });
    *   });
    * </pre>
    */

   /**
    * @name Controls/_dragnDrop/DraggingTemplate#imageTemplate
    * @cfg {String} Шаблон с изображением перемещаемого объекта.
    * @remark Опция должна содержать ссылку на изображение. Если этот параметр указан, то параметр logo и параметр image не применяются.
    * @example
    * В следующем примере показано, как использовать стандартный шаблон перемещения.
    * <pre>
    *    <Controls.list:View source="{{_viewSource}}"
    *                   keyProperty="id"
    *                   on:dragStart="_onDragStart()"
    *                   itemsDragNDrop="{{true}}">
    *       <ws:draggingTemplate>
    *          <ws:partial template="Controls/_dragnDrop/DraggingTemplate"
    *                      mainText="{{draggingTemplate.entity._options.mainText}}"
    *                      imageTemplate="wml!MyModule/draggingImageTemplate"
    *                      additionalText="{{draggingTemplate.entity._options.additionalText}}">
    *          </ws:partial>
    *       </ws:draggingTemplate>
    *    </Controls.list:View>
    * </pre>
    *
    * <pre>
    *   define(...['Types/source', 'Controls/dragnDrop'], function(source, dragnDrop) {
    *        _onDragStart: function(event, items) {
    *            var mainItem = this._items.getRecordById(items[0]);
    *            return new dragnDrop.Entity({
    *               items: items,
    *               mainText: mainItem.get('FIO'),
    *               additionalText: mainItem.get('title')
    *           });
    *       },
    *       _beforeMount: function() {
    *                this._viewSource = new source.SbisService({
    *                    ...
    *               });
    *           }
    *           ...
    *       return new dragnDrop.Entity({
    *            ...
    *       });
    *   });
    * </pre>
    */

   /*
    * @name Controls/_dragnDrop/DraggingTemplate#imageTemplate
    * @cfg {String} Template with image of the entity being moved.
    * @remark The option must contain a link to the image. If this option is specified, the logo option and image option is not applied.
    * @example
    * The following example shows how to use a standard dragging template.
    * <pre>
    *    <Controls.list:View source="{{_viewSource}}"
    *                   keyProperty="id"
    *                   on:dragStart="_onDragStart()"
    *                   itemsDragNDrop="{{true}}">
    *       <ws:draggingTemplate>
    *          <ws:partial template="Controls/_dragnDrop/DraggingTemplate"
    *                      mainText="{{draggingTemplate.entity._options.mainText}}"
    *                      imageTemplate="wml!MyModule/draggingImageTemplate"
    *                      additionalText="{{draggingTemplate.entity._options.additionalText}}">
    *          </ws:partial>
    *       </ws:draggingTemplate>
    *    </Controls.list:View>
    * </pre>
    *
    * <pre>
    *   define(...['Types/source', 'Controls/dragnDrop'], function(source, dragnDrop) {
    *        _onDragStart: function(event, items) {
    *            var mainItem = this._items.getRecordById(items[0]);
    *            return new dragnDrop.Entity({
    *               items: items,
    *               mainText: mainItem.get('FIO'),
    *               additionalText: mainItem.get('title')
    *           });
    *       },
    *       _beforeMount: function() {
    *               this._viewSource = new source.SbisService({
    *                    ...
    *               });
    *           }
    *           ...
    *       return new dragnDrop.Entity({
    *            ...
    *       });
    *   });
    * </pre>
    */

   /**
    * @name Controls/_dragnDrop/DraggingTemplate#logo
    * @cfg {String} Логотип перемещаемого объекта.
    * @default icon-DocumentUnknownType
    * @remark Подробнее читайте <a href="/docs/js/icons/">здесь</a>. Этот параметр используется, если параметр {@link image} не указан.
    * @example
    * В следующем примере показано, как использовать стандартный шаблон перемещения.
    * <pre>
    *    <Controls.list:View source="{{_viewSource}}"
    *                   keyProperty="id"
    *                   on:dragStart="_onDragStart()"
    *                   itemsDragNDrop="{{true}}">
    *       <ws:draggingTemplate>
    *          <ws:partial template="Controls/_dragnDrop/DraggingTemplate"
    *                      mainText="{{draggingTemplate.entity._options.mainText}}"
    *                      logo="icon-Album"
    *                      additionalText="{{draggingTemplate.entity._options.additionalText}}">
    *          </ws:partial>
    *       </ws:draggingTemplate>
    *    </Controls.list:View>
    * </pre>
    *
    * <pre>
    *   define(...['Types/source', 'Controls/dragnDrop'], function(source, dragnDrop) {
    *        _onDragStart: function(event, items) {
    *            var mainItem = this._items.getRecordById(items[0]);
    *           return new dragnDrop.Entity({
    *                items: items,
    *                mainText: mainItem.get('FIO'),
    *                additionalText: mainItem.get('title')
    *           });
    *       },
    *       _beforeMount: function() {
    *                this._viewSource = new source.SbisService({
    *                    ...
    *               });
    *           }
    *           ...
    *       return new dragnDrop.Entity({
    *         ...
    *       });
    *   });
    * </pre>
    */

   /*
    * @name Controls/_dragnDrop/DraggingTemplate#logo
    * @cfg {String} A logo of the entity being moved.
    * @default icon-DocumentUnknownType
    * @remark The full list of possible values can be found <a href="/docs/js/icons/">here</a>. This option is used if the image option is not specified.
    * @example
    * The following example shows how to use a standard dragging template.
    * <pre>
    *    <Controls.list:View source="{{_viewSource}}"
    *                   keyProperty="id"
    *                   on:dragStart="_onDragStart()"
    *                   itemsDragNDrop="{{true}}">
    *       <ws:draggingTemplate>
    *          <ws:partial template="Controls/_dragnDrop/DraggingTemplate"
    *                      mainText="{{draggingTemplate.entity._options.mainText}}"
    *                      logo="icon-Album"
    *                      additionalText="{{draggingTemplate.entity._options.additionalText}}">
    *          </ws:partial>
    *       </ws:draggingTemplate>
    *    </Controls.list:View>
    * </pre>
    *
    * <pre>
    *   define(...['Types/source', 'Controls/dragnDrop'], function(source, dragnDrop) {
    *        _onDragStart: function(event, items) {
    *            var mainItem = this._items.getRecordById(items[0]);
    *           return new dragnDrop.Entity({
    *                items: items,
    *                mainText: mainItem.get('FIO'),
    *                additionalText: mainItem.get('title')
    *           });
    *       },
    *       _beforeMount: function() {
    *                this._viewSource = new source.SbisService({
    *                    ...
    *               });
    *           }
    *           ...
    *       return new dragnDrop.Entity({
    *         ...
    *       });
    *   });
    * </pre>
    */

   var DraggingTemplate = Control.extend({
      _theme: ['Controls/dragnDrop'],
      _template: template,

      _beforeMount: function(options) {
         this._itemsCount = _private.getCounterText(options.entity.getItems().length);
      }
   });

   export = DraggingTemplate;
