/**
 * Шаблон, который по умолчанию используется для отображения элементов в дополнительном меню {@link Controls/toolbars:View тулбара}.
 * @class Controls/toolbars:ItemTemplate
 * @author Красильников А.С.
 * @public
 * @see Controls/toolbars:View
 * @see Controls/toolbars
 * @example
 * В следующем примере показано, как изменить параметры шаблона.
 * <pre>
 * <Controls.toolbars:View source="{{_source}}">
 *    <ws:itemTemplate>
 *       <ws:partial
 *          template="Controls/toolbars:ItemTemplate"
 *          buttonStyle="{{myStyle}}"
 *          buttonReadOnly="{{readOnlyButton}}"
 *          buttonTransparent="{{myButtonTransparent}}"
 *          buttonViewMode="{{myButtonViewMode}}"
 *          displayProperty="title"
 *          iconStyleProperty="iconStyle"
 *          iconProperty="icon"
 *       />
 *    </ws:itemTemplate>
 * </Controls.toolbars:View>
 * </pre>
 * 
 * @remark
 * Полезные ссылки:
 * * <a href="/doc/platform/developmentapl/interface-development/controls/buttons-switches/toolbar/#template-standart">руководство разработчика</a>
 */

/**
 * @name Controls/toolbars:ItemTemplate#buttonStyle
 * @cfg {String} Определяет стиль отображения кнопки.
 * @default secondary
 * @remark
 * Доступные значение:
 * 
 * * **primary** 
 * * **secondary**
 * 
 * @example
 * <pre>
 * <Controls.toolbars:View source="{{_source}}">
 *    <ws:itemTemplate>
 *       <ws:partial
 *          template="Controls/toolbars:ItemTemplate"
 *          buttonStyle="primary"
 *       />
 *    </ws:itemTemplate>
 * </Controls.toolbars:View>
 * </pre>
 */

/**
 * @name Controls/toolbars:ItemTemplate#buttonReadOnly
 * @cfg {Boolean} Устанавливает режим "только для чтения".
 * @default false
 * 
 * @example
 * <pre>
 * <Controls.toolbars:View source="{{_source}}">
 *    <ws:itemTemplate>
 *       <ws:partial
 *          template="Controls/toolbars:ItemTemplate"
 *          buttonReadOnly="true"
 *       />
 *    </ws:itemTemplate>
 * </Controls.toolbars:View>
 * </pre>
 */

/**
 * @name Controls/toolbars:ItemTemplate#buttonTransparent
 * @cfg {Boolean} Определяет, имеет ли кнопка фон.
 * @default false
 * 
 * @example
 * <pre>
 * <Controls.toolbars:View source="{{_source}}">
 *    <ws:itemTemplate>
 *       <ws:partial
 *          template="Controls/toolbars:ItemTemplate"
 *          buttonTransparent="true"
 *       />
 *    </ws:itemTemplate>
 * </Controls.toolbars:View>
 * </pre>
 */ 

/**
 * @name Controls/toolbars:ItemTemplate#buttonViewMode
 * @cfg {String} Определяет режим отображения кнопки.
 * @default button
 * @remark
 * 
 * **button** - отображается в виде обычной кнопки по-умолчанию;
 * **link** - отображается в виде гиперссылки;
 * **toolButton** - отображается в виде кнопки для панели инструментов.
 * 
 * @example
 * <pre>
 * <Controls.toolbars:View source="{{_source}}">
 *    <ws:itemTemplate>
 *       <ws:partial
 *          template="Controls/toolbars:ItemTemplate"
 *          buttonViewMode="link"
 *       />
 *    </ws:itemTemplate>
 * </Controls.toolbars:View>
 * </pre>
 */

/**
 * @name Controls/toolbars:ItemTemplate#displayProperty
 * @cfg {String} Имя свойства элемента, содержимое которого будет отображаться.
 * @default title
 * 
 * @example
 * <pre>
 * <Controls.toolbars:View source="{{_source}}">
 *    <ws:itemTemplate>
 *       <ws:partial
 *          template="Controls/toolbars:ItemTemplate"
 *          displayProperty="title"
 *       />
 *    </ws:itemTemplate>
 * </Controls.toolbars:View>
 * </pre>
 */

/**
 * @name Controls/toolbars:ItemTemplate#iconStyleProperty
 * @cfg {String} Устанавливает стиль отображения иконки.
 * @default secondary
 * @remark
 * Доступные значения:
 * 
 * **primary**
 * **secondary**
 * **success**
 * **warning**
 * **danger**
 * **info**
 * **default**
 * 
 * @example
 * <pre>
 * <Controls.toolbars:View source="{{_source}}">
 *    <ws:itemTemplate>
 *       <ws:partial
 *          template="Controls/toolbars:ItemTemplate"
 *          iconStyleProperty="success"
 *       />
 *    </ws:itemTemplate>
 * </Controls.toolbars:View>
 * </pre>
 */

/**
 * @name Controls/toolbars:ItemTemplate#iconProperty
 * @cfg {String} Определяет иконку кнопки.
 * @default Undefined
 * @example
 * <pre>
 * <Controls.toolbars:View source="{{_source}}">
 *    <ws:itemTemplate>
 *       <ws:partial
 *          template="Controls/toolbars:ItemTemplate"
 *          iconProperty="icon"
 *       />
 *    </ws:itemTemplate>
 * </Controls.toolbars:View>
 * </pre>
 */

/**
 * @name Controls/toolbars:ItemTemplate#contentTemplate
 * @cfg {String|Function} Шаблон, описывающий содержимое кнопки.
 * @remark
 * В области видимости шаблона доступен объект **itemData**. Из него можно получить доступ к свойству **item** - это объект, который содержит данные обрабатываемого элемента.
 * @example
 * <pre>
 * <Controls.toolbars:View 
 *    contentTemplate="Controls/toolbars:defaultContentTemplate">
 * </Controls.toolbars:View>
 * </pre>
 */

export default interface IItemTemplateOptions {
    buttonStyle?: string;
    buttonReadOnly?: boolean;
    buttonTransparent?: boolean;
    buttonViewMode?: string;
    displayProperty?: string;
    iconStyleProperty?: string;
    iconProperty?: string;
    contentTemplate?: string;
 }
 