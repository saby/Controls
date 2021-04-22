import {TMarkerClassName} from 'Controls/display';

/**
 * @typedef {String} Controls/_list/interface/IBaseItemTemplate/TCursor
 * @description Значения, с помощью которых задается вид курсора мыши.
 * @variant default Стандартный указатель (стрелка).
 * @variant pointer Указатель.
 */
export type TCursor = 'default' | 'pointer' | 'right';

export default interface IBaseItemTemplateOptions {
   highlightOnHover?: boolean;
   cursor?: TCursor;
   marker?: boolean;
   itemActionsClass?: string;
   checkboxReadOnly?: boolean;
   backgroundColorStyle?: string;
   markerClassName?: TMarkerClassName;
}

/**
 * Интерфейс для шаблона отображения элемента в {@link /doc/platform/developmentapl/interface-development/controls/list/ списке}.
 * @interface Controls/_list/interface/IBaseItemTemplate
 * @author Авраменко А.С.
 * @public
 */
/**
* @name Controls/_list/interface/IBaseItemTemplate#highlightOnHover
* @cfg {Boolean} Видимость подсветки строки при наведении курсора мыши.
* @remark
* В значении false элементы списка не будут подсвечиваться при наведении курсора мыши.
* Дополнительно о подсветке строки читайте {@link /doc/platform/developmentapl/interface-development/controls/list/list/background/#highlight здесь}.
* @default true
* @demo Controls-demo/list_new/ItemTemplate/NoHighlightOnHover/Index
*/
/**
 * @name Controls/_list/interface/IBaseItemTemplate#cursor
 * @cfg {Controls/_list/interface/IBaseItemTemplate/TCursor.typedef} Вид {@link https://developer.mozilla.org/ru/docs/Web/CSS/cursor курсора мыши} при наведении на строку.
 * @default pointer
 * @demo Controls-demo/list_new/ItemTemplate/Clickable/Index
 */
/**
* @name Controls/_list/interface/IBaseItemTemplate#marker
* @cfg {Boolean} Позволяет отключить видимость {@link /doc/platform/developmentapl/interface-development/controls/list/actions/marker/ маркера} для отдельной записи списка.
* @default true
* @demo Controls-demo/list_new/ItemTemplate/Marker/Index В следующем примере выделение маркером отключено для всех записей.
* @remark Отключение видимости маркера для всех записей описано {@link /doc/platform/developmentapl/interface-development/controls/list/actions/marker/#all здесь}.
* @see markerClassName
* @see Controls/marker:IMarkerList#markerVisibility
*/
/**
 * @typedef {String} Controls/_list/interface/IBaseItemTemplate/ItemActionsClass
 * @description Классы, с помощью которых задается {@link /doc/platform/developmentapl/interface-development/controls/list/actions/item-actions/position/ позиционирование панели опций записи} внутри элемента.
 * @variant controls-itemActionsV_position_bottomRight В правом нижнем углу элемента.
 * @variant controls-itemActionsV_position_topRight В правом верхнем углу элемента.
 */
/**
 * @name Controls/_list/interface/IBaseItemTemplate#itemActionsClass
 * @cfg {Controls/_list/interface/IBaseItemTemplate/ItemActionsClass.typedef} Класс, используемый для позиционирования {@link /doc/platform/developmentapl/interface-development/controls/list/actions/item-actions/ панели опций записи} при отображении её внутри элемента списка (опция {@link Controls/itemActions:IItemActions#itemActionsPosition itemActionsPosition}).
 * @default controls-itemActionsV_position_bottomRight
 * @remark
 * Дополнительно об использовании опции читайте {@link /doc/platform/developmentapl/interface-development/controls/list/actions/item-actions/position/#inside здесь}.
 * @demo Controls-demo/list_new/ItemTemplate/ItemActionsClass/Index
 */
/*
 * @cfg {boolean} Flag, allowing to set "readonly" state for checkbox within multiSelect.
 * @default false
 */
/**
 * @typedef {String} Controls/_list/interface/IBaseItemTemplate/BackgroundColorStyle
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
 * @cfg {Controls/_list/interface/IBaseItemTemplate/BackgroundColorStyle.typedef} Настройка фона строки.
 * @remark
 * Подробнее о настройке фона строки читайте {@link /doc/platform/developmentapl/interface-development/controls/list/list/background/#highlight здесь}.
 * @demo Controls-demo/list_new/ItemTemplate/BackgroundColorStyle/Index
 */

/**
 * @typedef {String} Controls/_list/interface/IBaseItemTemplate/TMarkerClassName
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

/**
 * @name Controls/_list/interface/IBaseItemTemplate#markerClassName
 * @cfg {Controls/_list/interface/IBaseItemTemplate/TMarkerClassName.typedef} Размер {@link /doc/platform/developmentapl/interface-development/controls/list/actions/marker/ маркера}.
 * @default default
 * @see marker
 */
