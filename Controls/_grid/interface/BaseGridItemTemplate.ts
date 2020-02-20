/**
 * Интерфейс для шаблона отображения элемента в {@link https://wi.sbis.ru/doc/platform/developmentapl/interface-development/controls/grid/ таблице}.
 * @interface Controls/grid:BaseGridItemTemplate
 * @author Авраменко А.С.
 * @public
 */

export default interface IBaseItemTemplateOptions {
    /**
     * @name Controls/grid:BaseGridItemTemplate#highlightOnHover
     * @cfg {Boolean} Когда опция установлена в значение true, элемент будет подсвечиваться при наведении курсора мыши.
     * @default true
     */
    highlightOnHover?: boolean;
    /**
     * @name Controls/grid:BaseGridItemTemplate#clickable
     * @cfg {Boolean} Когда опция установлена в значение true, элемент доступен для клика, и используется {@link https://developer.mozilla.org/ru/docs/Web/CSS/cursor курсор} pointer. В значении false элемент недоступен для клика, и используется курсор default.
     * @default true
     */
    clickable?: boolean;
    /**
     * @name Controls/grid:BaseGridItemTemplate#marker
     * @cfg {Boolean} Когда опция установлена в значение true, активный элемент будет выделяться {@link https://wi.sbis.ru/doc/platform/developmentapl/interface-development/controls/list/list/select/marker/ маркером}.
     * @default true
     */
    marker?: boolean;
    /**
     * @typedef {String} ItemActionsClass
     * @variant controls-itemActionsV_position_bottomRight В правом нижнем углу элемента. 
     * @variant controls-itemActionsV_position_topRight В правом верхнем углу элемента.
     */
    /**
     * @name Controls/grid:BaseGridItemTemplate#itemActionsClass
     * @cfg {ItemActionsClass} Расположение панели с {@link https://wi.sbis.ru/doc/platform/developmentapl/interface-development/controls/list/list/item-actions/ опциями записи} внутри элемента.
     * @default controls-itemActionsV_position_bottomRight
     */
    itemActionsClass?: string;
 }
 