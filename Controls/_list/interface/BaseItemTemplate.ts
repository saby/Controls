/**
 * @typedef {String} TCursor
 * @description Значения, с помощью которых задается вид курсора мыши.
 * @variant default Стандартный указатель (стрелка).
 * @variant pointer Указатель.
 */
export type TCursor = 'default' | 'pointer' | 'right';

/**
 * @typedef {String} TMarkerClassName
 * @description Значения, с помощью которых задается размер маркера.
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
 * Интерфейс для шаблона отображения элемента в {@link /doc/platform/developmentapl/interface-development/controls/list/ списке}.
 * @interface Controls/_list/interface/IBaseItemTemplate
 * @author Авраменко А.С.
 * @public
 */

export default interface IBaseItemTemplateOptions {
   /**
    * @name Controls/_list/interface/IBaseItemTemplate#highlightOnHover
    * @cfg {Boolean} Видимость подсветки строки при наведении курсора мыши.
    * @remark
    * В значении false элементы списка не будут подсвечиваться при наведении курсора мыши.
    * @default true
    * @demo Controls-demo/list_new/ItemTemplate/NoHighlightOnHover/Index
    */
   highlightOnHover?: boolean;
   /**
    * @name Controls/_list/interface/IBaseItemTemplate#cursor
    * @cfg {TCursor} Вид {@link https://developer.mozilla.org/ru/docs/Web/CSS/cursor курсора мыши} при наведении на строку.
    * @default pointer
    */
   cursor?: TCursor;
   /**
    * @name Controls/_list/interface/IBaseItemTemplate#marker
    * @cfg {Boolean} Когда опция установлена в значение true, активный элемент будет выделяться {@link /doc/platform/developmentapl/interface-development/controls/list/actions/marker/ маркером}.
    * @default true
    */
   marker?: boolean;
   /**
    * @typedef {String} ItemActionsClass
    * @description Классы, с помощью которых задается позиционирование панели опций записи внутри элемента.
    * @variant controls-itemActionsV_position_bottomRight В правом нижнем углу элемента.
    * @variant controls-itemActionsV_position_topRight В правом верхнем углу элемента.
    */
   /**
    * @name Controls/_list/interface/IBaseItemTemplate#itemActionsClass
    * @cfg {ItemActionsClass} Класс, используемый для позиционирования {@link /doc/platform/developmentapl/interface-development/controls/list/actions/item-actions/ панели опций записи} при отображении её внутри элемента списка (опция {@link Controls/_itemActions/interface/IItemActionsOptions#itemActionsPosition itemActionsPosition}).
    * @default controls-itemActionsV_position_bottomRight
    * @remark
    * Панель опций записи абсолютно позиционируется относительно элемента списка.
    * 
    * Опция может использоваться для определения угла элемента списка, к которому прижимается панель опций.
    * Поддерживаются следующие значения:
    * * .controls-itemActionsV_position_bottomRight — панель опций записи отображается в правом нижмем углу элемента.
    * * .controls-itemActionsV_position_topRight — панель опций записи отображается в правом верхнем углу элемента списка.
    * 
    * Также можно задавать собственный класс, таким образом управляя местоположением панели опций записи.
    * @demo Controls-demo/list_new/ItemTemplate/ItemActionsClass/Index
    */
   itemActionsClass?: string;
   /**
    * @name Controls/_list/interface/IBaseItemTemplate#checkboxReadOnly
    * @cfg {Boolean} Флаг, позволяющий установить у checkbox в multiSelect режим "только для чтения".
    * @remark
    * В значении true режим "только для чтения" включен.
    * @default false
    */
   /*
    * @cfg {boolean} Flag, allowing to set "readonly" state for checkbox within multiSelect.
    * @default false
    */
   checkboxReadOnly?: boolean;
   /**
    * @typedef {String} BackgroundColorStyle
    * @description Значения, с помощью которых задается фон строки.
    * @variant danger
    * @variant success
    * @variant warning
    * @variant primary
    * @variant secondary
    * @variant unaccented
    * @variant readonly
    */
   /**
    * @name Controls/_list/interface/IBaseItemTemplate#backgroundColorStyle
    * @cfg {BackgroundColorStyle} Настройка фона строки.
    * @remark 
    * См. {@link /doc/platform/developmentapl/interface-development/controls/list/list/background/#highlight руководство разработчика}.
    * @demo Controls-demo/list_new/ItemTemplate/BackgroundColorStyle/Index
    */
   backgroundColorStyle?: string;

   /**
    * @name Controls/_list/interface/IBaseItemTemplate#markerClassName
    * @cfg {TMarkerClassName} Размер маркера.
    * @default default
    */
   markerClassName?: TMarkerClassName;
}
