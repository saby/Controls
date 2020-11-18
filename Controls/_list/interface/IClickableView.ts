/**
 * Интерфейс для списков, которые поддерживают событие клика по элементу.
 * @interface Controls/_list/interface/IClickableView
 * @public
 * @author Авраменко А.С.
 */

/*
 * Interface for lists.
 * @interface Controls/_list/interface/IClickableView
 * @public
 * @author Авраменко А.С.
 */
export default interface IClickableView {
    readonly '[Controls/_list/interface/IClickableView]': boolean;
}
/**
 * @event Происходит при клике на элемент списка.
 * @name Controls/_list/interface/IClickableView#itemClick
 * @param {Vdom/Vdom:SyntheticEvent} event Объект события.
 * @param {Types/entity:Record} item Элемент, по которому кликнули.
 * @param {Object} nativeEvent Объект нативного события браузера.
 * @param {Number} columnIndex Индекс колонки, по которой кликнули. Параметр актуален только для {@link Controls/grid:View} и {@link Controls/treeGrid:View}.
 */

/*
 * @event Occurs when a mouse button is pressed over a list item.
 * @name Controls/_list/interface/IClickableView#itemClick
 * @param {Vdom/Vdom:SyntheticEvent} event Event object.
 * @param {Types/entity:Record} item Item that the mouse button was pressed over.
 * @param {Object} nativeEvent Native event object.
 * @remark
 * From the itemClick event this event differs in the following:
 * 1. It works when you click on any mouse button (left, right, middle);
 * 2. It works when the button is down (itemClick fires after it is released).
 */