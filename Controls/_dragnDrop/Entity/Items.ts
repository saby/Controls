import Entity = require('Controls/_dragnDrop/Entity');


   /**
    * Базовый класс, от которого наследуется объект перемещения в списке.
    * Объект можно любым образом кастомизировать, записав туда любые необходимые данные.
    * 
    * @remark
    * Полезные ссылки:
    * * <a href="/doc/platform/developmentapl/interface-development/controls/tools/drag-n-drop/">руководство разработчика</a>
    * * <a href="https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/aliases/_dragnDrop.less">переменные тем оформления</a>
    * 
    * @class Controls/_dragnDrop/Entity/Items
    * @public
    * @author Авраменко А.С.
    * @category DragNDrop
    */

   /*
    * The base class for the inheritors of the drag'n'drop entity in the list.
    * You can customize an entity in any way by passing any data to the options.
    * More information you can read <a href="/doc/platform/developmentapl/interface-development/controls/drag-n-drop/">here</a>.
    * @class Controls/_dragnDrop/Entity/Items
    * @public
    * @author Авраменко А.С.
    * @category DragNDrop
    */

   /**
    * @name Controls/_dragnDrop/Entity/Items#items
    * @cfg {Array.<String>} Список перемещаемых элементов.
    * @remark В процессе перемещения рядом с курсором отображается миниатюра перемещаемой сущности.
    * @see Controls/interface/IDraggable#dragStart
    */

   /*
    * @name Controls/_dragnDrop/Entity/Items#items
    * @cfg {Array.<String>} The list of items to move.
    * @remark In the process of moving, a thumbnail of the entity being moved is shown near the cursor.
    * @see Controls/interface/IDraggable#dragStart
    */

    var Items = Entity.extend({
      getItems: function() {
         return this._options.items;
      }
   });

   export = Items;
