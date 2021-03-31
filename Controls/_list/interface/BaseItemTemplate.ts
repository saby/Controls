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
 * @cfg {Controls/_list/interface/IBaseItemTemplate/ItemActionsClass.typedef} Класс, используемый для позиционирования {@link /doc/platform/developmentapl/interface-development/controls/list/actions/item-actions/ панели опций записи} при отображении её внутри элемента списка (опция {@link Controls/_itemActions/interface/IItemActionsOptions#itemActionsPosition itemActionsPosition}).
 * @default controls-itemActionsV_position_bottomRight
 * @remark
 * Дополнительно об использовании опции читайте {@link /doc/platform/developmentapl/interface-development/controls/list/actions/item-actions/position/#inside здесь}.
 * @demo Controls-demo/list_new/ItemTemplate/ItemActionsClass/Index
 */
/**
 * @name Controls/_list/interface/IBaseItemTemplate#checkboxReadOnly
 * @cfg {Boolean} Флаг, позволяющий установить у checkbox в multiSelect режим "только для чтения".
 * @remark
 * В значении true режим "только для чтения" включен.
 * @default false
 * @deprecated Опция устарела. Используйте опцию {@link Controls/list:IList#multiSelectAccessibilityProperty multiSelectAccessibilityProperty}, чтобы перевести чекбокс в режим "только для чтения".
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
 * @name Controls/_list/interface/IBaseItemTemplate#markerClassName
 * @cfg {Controls/_display/interface/IMarkable/TMarkerClassName.typedef} Размер {@link /doc/platform/developmentapl/interface-development/controls/list/actions/marker/ маркера}.
 * @default default
 * @see marker
 */
