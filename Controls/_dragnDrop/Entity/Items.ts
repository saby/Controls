import Entity from 'Controls/_dragnDrop/Entity';

interface IItemsOptions {
    items: Array<string|number>;
}

/**
 * Базовый класс, от которого наследуется объект перемещения в списке.
 * Объект можно любым образом кастомизировать, записав туда любые необходимые данные.
 * Подробнее читайте <a href="/doc/platform/developmentapl/interface-development/controls/tools/drag-n-drop/">здесь</a>.
 * @class Controls/_dragnDrop/Entity/Items
 * @public
 * @author Авраменко А.С.
 */

/*
 * The base class for the inheritors of the drag'n'drop entity in the list.
 * You can customize an entity in any way by passing any data to the options.
 * More information you can read <a href="/doc/platform/developmentapl/interface-development/controls/drag-n-drop/">here</a>.
 * @class Controls/_dragnDrop/Entity/Items
 * @public
 * @author Авраменко А.С.
 */
export default class Items extends Entity {
    protected _options: IItemsOptions;

    getItems(): Array<string|number> {
        return this._options.items;
    }
}
/**
 * @name Controls/_dragnDrop/Entity/Items#items
 * @cfg {Array.<String>} Список перемещаемых элементов.
 * @remark В процессе перемещения рядом с курсором отображается миниатюра перемещаемой сущности.
 * @see Controls/_interface/IDraggable#dragStart
 */

/*
 * @name Controls/_dragnDrop/Entity/Items#items
 * @cfg {Array.<String>} The list of items to move.
 * @remark In the process of moving, a thumbnail of the entity being moved is shown near the cursor.
 * @see Controls/_interface/IDraggable#dragStart
 */