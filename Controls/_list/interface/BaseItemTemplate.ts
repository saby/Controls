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
    * @cfg {Boolean} В значении false элементы списка не будут подсвечиваться при наведении курсора мыши.
    * @default true
    */
   highlightOnHover?: boolean;
   /**
    * @name Controls/list:BaseItemTemplate#cursor
    * @cfg {TCursor} Вид {@link https://developer.mozilla.org/ru/docs/Web/CSS/cursor курсора}, когда он находится в пределах элемента списка.
    * @default pointer
    */
   cursor?: TCursor;
   /**
    * @name Controls/list:BaseItemTemplate#marker
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
    * @name Controls/list:BaseItemTemplate#itemActionsClass
    * @cfg {ItemActionsClass} Класс, используемый для позиционирования {@link https://wi.sbis.ru/doc/platform/developmentapl/interface-development/controls/list/actions/item-actions/ панели опций записи} при отображении её внутри элемента списка (опция {@link Controls/_itemActions/interface/IItemActionsOptions#itemActionsPosition itemActionsPosition}).
    * @default controls-itemActionsV_position_bottomRight
    * @remark
    * Панель опций записи абсолютно позиционируется относительно элемента списка.
    * 
    * Опция может использоваться для определения угла элемента списка, к которому прижимается панель опций.
    * Поддерживаются следующие значения:
    * * .controls-itemActionsV_position_bottomRight — панель опций записи отображается в правом нижмем углу элемента списка.
    * * .controls-itemActionsV_position_topRight — панель опций записи отображается в правом верхнем углу элемента списка.
    * 
    * Также можно задавать собственный класс, таким образом управляя местоположением панели опций записи.
    * @demo Controls-demo/list_new/ItemTemplate/ItemActionsClass/Index
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
    * @typedef {String} backgroundColorStyle
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
    * @cfg {backgroundColorStyle} Стиль фона элемента.
    */
   backgroundColorStyle?: string;
}
