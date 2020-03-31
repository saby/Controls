/**
 * @typedef {String} TCursor
 * @description Значения для типа курсора, отображаемого при наведении на элемент списка.
 * @variant default Стандартный указатель (стрелка).
 * @variant pointer Указатель.
 */
export type TCursor = 'default' | 'pointer' | 'right';

/**
 * Интерфейс для шаблона отображения элемента в {@link https://wi.sbis.ru/doc/platform/developmentapl/interface-development/controls/list/ списочном контроле}.
 * @interface Controls/list:BaseItemTemplate
 * @author Авраменко А.С.
 * @public
 */

export default interface IBaseItemTemplateOptions {
   /**
    * @name Controls/list:BaseItemTemplate#highlightOnHover
    * @cfg {Boolean} Когда опция установлена в значение true, элемент будет подсвечиваться при наведении курсора мыши.
    * @default true
    */
   highlightOnHover?: boolean;
   /**
    * @name Controls/list:BaseItemTemplate#cursor
    * @cfg {TCursor} Тип {@link https://developer.mozilla.org/ru/docs/Web/CSS/cursor курсора}, когда он находится в пределах элемента списка.
    * @default pointer
    */
   cursor?: TCursor;
   /**
    * @name Controls/list:BaseItemTemplate#marker
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
    * @name Controls/list:BaseItemTemplate#itemActionsClass
    * @cfg {ItemActionsClass} Расположение панели с {@link https://wi.sbis.ru/doc/platform/developmentapl/interface-development/controls/list/list/item-actions/ опциями записи} внутри элемента.
    * @default controls-itemActionsV_position_bottomRight
    */
   itemActionsClass?: string;
   /**
    * @name Controls/interface/IItemTemplate#checkboxReadOnly
    * @cfg {boolean} Флаг, позволяющий установить у checkbox в multiSelect режим "только для чтения".
    * @default false
    */
   /*
    * @name Controls/interface/IItemTemplate#checkboxReadOnly
    * @cfg {boolean} Flag, allowing to set "readonly" state for checkbox within multiSelect.
    * @default false
    */
   checkboxReadOnly?: boolean;
}
