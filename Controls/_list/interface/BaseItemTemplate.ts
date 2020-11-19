/**
 * @typedef {String} TCursor
 * @description Значения для типа курсора, отображаемого при наведении на элемент списка.
 * @variant default Стандартный указатель (стрелка).
 * @variant pointer Указатель.
 */
export type TCursor = 'default' | 'pointer' | 'right';

/**
 * @typedef {String} TMarkerClassName
 * @variant default Маркер по высоте растягивается на весь контейнер записи.
 * @variant image-l Используется для размещения маркера рядом с изображением размера "l".
 * @variant image-m Используется для размещения маркера рядом с изображением размера "m".
 * @variant image-s Используется для размещения маркера рядом с изображением размера "s".
 * @variant image-xs Используется для размещения маркера рядом с изображением размера "xs".
 * @variant text-2xl Используется для размещения маркера рядом с текстом размера "2xl".
 * @variant text-xl Используется для размещения маркера рядом с текстом размера "xl".
 * @variant text-l Используется для размещения маркера рядом с текстом размера "l".
 * @variant text-m Используется для размещения маркера рядом с текстом размера "m".
 * @variant text-xs Используется для размещения маркера рядом с текстом размера "xs".
 */
type TMarkerClassName = 'default' | 'image-l' | 'image-m' | 'image-s' | 'image-xl' |
    'text-2xl' | 'text-xl' | 'text-l' | 'text-m' | 'text-xs';

/**
 * Интерфейс для шаблона отображения элемента в {@link https://wi.sbis.ru/doc/platform/developmentapl/interface-development/controls/list/ списочном контроле}.
 * @interface Controls/_list/interface/BaseItemTemplate
 * @author Авраменко А.С.
 * @public
 */

export default interface IBaseItemTemplateOptions {
   /**
    * @name Controls/_list/interface/BaseItemTemplate#highlightOnHover
    * @cfg {Boolean} Видимость подсветки строки при наведении курсора мыши.
    * @remark
    * В значении false элементы списка не будут подсвечиваться при наведении курсора мыши.
    * @default true
    * @demo Controls-demo/list_new/ItemTemplate/NoHighlightOnHover/Index
    */
   highlightOnHover?: boolean;
   /**
    * @name Controls/_list/interface/BaseItemTemplate#cursor
    * @cfg {Controls/_list/interface/BaseItemTemplate/TCursor.typedef} Вид {@link https://developer.mozilla.org/ru/docs/Web/CSS/cursor курсора мыши} при наведении на строку.
    * @default pointer
    */
   cursor?: TCursor;
   /**
    * @name Controls/_list/interface/BaseItemTemplate#marker
    * @cfg {Boolean} Когда опция установлена в значение true, активный элемент будет выделяться {@link https://wi.sbis.ru/doc/platform/developmentapl/interface-development/controls/list/actions/marker/ маркером}.
    * @default true
    */
   marker?: boolean;
   /**
    * @typedef {String} ItemActionsClass
    * @variant controls-itemActionsV_position_bottomRight В правом нижнем углу элемента.
    * @variant controls-itemActionsV_position_topRight В правом верхнем углу элемента.
    */
   /**
    * @name Controls/_list/interface/BaseItemTemplate#itemActionsClass
    * @cfg {Controls/_list/interface/BaseItemTemplate/ItemActionsClass.typedef} Расположение панели с {@link https://wi.sbis.ru/doc/platform/developmentapl/interface-development/controls/list/actions/item-actions/ опциями записи} внутри элемента.
    * @default controls-itemActionsV_position_bottomRight
    */
   itemActionsClass?: string;
   /**
    * @name Controls/interface/IItemTemplate#checkboxReadOnly
    * @cfg {boolean} Флаг, позволяющий установить у checkbox в multiSelect режим "только для чтения".
    * @remark
    * В значении true режим "только для чтения" включен.
    * @default false
    */
   /*
    * @name Controls/interface/IItemTemplate#checkboxReadOnly
    * @cfg {boolean} Flag, allowing to set "readonly" state for checkbox within multiSelect.
    * @default false
    */
   checkboxReadOnly?: boolean;
   /**
    * @typedef {String} BackgroundColorStyle
    * @variant danger
    * @variant success
    * @variant warning
    * @variant primary
    * @variant secondary
    * @variant unaccented
    * @variant readonly
    */
   /**
    * @name Controls/interface/IItemTemplate#backgroundColorStyle
    * @cfg {Controls/_list/interface/BaseItemTemplate/BackgroundColorStyle.typedef} Настройка фона строки.
    * @remark 
    * См. <a href="/doc/platform/developmentapl/interface-development/controls/list/list/background/#highlight">руководство разработчика</a>.
    * @demo Controls-demo/list_new/ItemTemplate/BackgroundColorStyle/Index
    */
   backgroundColorStyle?: string;

   /**
    * @name Controls/interface/IItemTemplate#markerClassName
    * @cfg {Controls/_list/interface/BaseItemTemplate/TMarkerClassName.typedef} Размер маркера.
    * @default default
    */
   markerClassName?: TMarkerClassName;
}
