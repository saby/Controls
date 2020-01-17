/**
 * Интерфейс для шаблона отображения элемента в {@link https://wi.sbis.ru/doc/platform/developmentapl/interface-development/controls/list/ списочном контроле}.
 * @interface Controls/list:BaseItemTemplate
 * @author Авраменко А.С.
 * @public
 */

/**
 * @name Controls/list:BaseItemTemplate#marker
 * @cfg {Boolean} Когда опция установлена в значение true, активный элемент будет выделяться {@link https://wi.sbis.ru/doc/platform/developmentapl/interface-development/controls/list/list/select/marker/ маркером}.
 * @default true
 */

/**
 * @name Controls/list:BaseItemTemplate#highlightOnHover
 * @cfg {Boolean} Когда опция установлена в значение true, элемент будет подсвечиваться при наведении курсора мыши.
 * @default true
 */

/**
 * @name Controls/list:BaseItemTemplate#clickable
 * @cfg {Boolean} Когда опция установлена в значение true, элемент доступен для клика, и используется {@link https://developer.mozilla.org/ru/docs/Web/CSS/cursor курсор} pointer. В значении false элемент недоступен для клика, и используется курсор default.
 * @default true
 */

/**
 * @typedef {String} ItemActionsClass
 * @variant controls-itemActionsV_position_bottomRight В правом нижнем углу элемента. 
 * @variant controls-itemActionsV_position_topRight В правом верхнем углу элемента.
 */

/**
 * @name Controls/list:BaseItemTemplate#itemActionsClass
 * @cfg {ItemActionsClass} Задаёт расположение для панели с {@link https://wi.sbis.ru/doc/platform/developmentapl/interface-development/controls/list/list/item-actions/ опциями записи} внутри элемента.
 * @default controls-itemActionsV_position_bottomRight
 */

/**
 * @name Controls/list:BaseItemTemplate#contentTemplate
 * @cfg {String|Function|undefined} Устанавливает пользовательский шаблон, описывающий содержимое элемента.
 * @default undefined
 * @remark
 * В области видимости шаблона доступен объект **itemData**. Из него можно получить доступ к свойству **item** — это объект, который содержит данные обрабатываемого элемента.
 * 
 * Также в области видимости шаблона есть переменная **itemActionsTemplate**, с помощью которой можно отобразить панель {@link https://wi.sbis.ru/doc/platform/developmentapl/interface-development/controls/list/list/item-actions/ опций записи} в пользовательском шаблоне. Переменную достаточно встроить в нужное место contentTemplate с помощью директивы {@link https://wi.sbis.ru/doc/platform/developmentapl/interface-development/ui-library/template-engine/#ws-partial ws:partial}, что показано в примере № 4.
 * 
 * @example
 * 
 * В следующих примерах показано, как изменять опции шаблона для контрола {@link Controls/list:View}, однако то же самое справедливо и для других {@link https://wi.sbis.ru/doc/platform/developmentapl/interface-development/controls/list/ списочных контролов}.
 * В примерах №№ 1, 2 и 3 показано, как получить доступ к переменной itemData из области видимости шаблона.
 * 
 * **Пример 1.** Контрол и шаблон настроены в одном WML-файле.
 * <pre class="brush: html">
 * <!-- file1.wml -->
 * <Controls.list:View>
 *    <ws:itemTemplate>
 *       <ws:partial template="Controls/list:ItemTemplate" scope="{{itemTemplate}}">
 *          <ws:contentTemplate>
 *             {{contentTemplate.itemData.item.title}}
 *          </ws:contentTemplate>
 *       </ws:partial>
 *    </ws:itemTemplate>
 * </Controls.list:View>
 * </pre>
 * 
 * **Пример 2.** Контрол и шаблон itemTemplate настроены в отдельных WML-файлах.
 * <pre class="brush: html">
 * <!-- file1.wml --> 
 * <Controls.list:View>
 *    <ws:itemTemplate>
 *       <ws:partial template="wml!file2" scope="{{itemTemplate}}"/>
 *    </ws:itemTemplate>
 * </Controls.list:View>
 * </pre>
 * 
 * <pre class="brush: html">
 * <!-- file2.wml -->
 * <ws:partial template="Controls/list:ItemTemplate">
 *    <ws:contentTemplate>
 *       {{contentTemplate.itemData.item.title}}
 *    </ws:contentTemplate>
 * </ws:partial>
 * </pre>
 * 
 * **Пример 3.** Контрол и шаблон contentTemplate настроены в отдельных WML-файлах.
 * 
 * <pre class="brush: html">
 * <!-- file1.wml --> 
 * <Controls.list:View>
 *    <ws:itemTemplate>
 *       <ws:partial template="Controls/list:ItemTemplate">
 *          <ws:contentTemplate>
 *             <ws:partial template="wml!file2" scope="{{contentTemplate}}"/>
 *          </ws:contentTemplate>
 *       </ws:partial>
 *    </ws:itemTemplate>
 * </Controls.list:View>
 * </pre>
 * 
 * <pre class="brush: html">
 * <!-- file2.wml -->
 * {{contentTemplate.itemData.item.title}}
 * </pre>
 * 
 * **Пример 4.** Контрол и шаблон настроены в одном WML-файле. В пользовательском шаблоне задано отображение опций записи.
 * <pre class="brush: html; highlight: [7]">
 * <!-- file1.wml --> 
 * <Controls.list:View>
 *    <ws:itemTemplate>
 *       <ws:partial template="Controls/list:ItemTemplate" scope="{{itemTemplate}}">
 *          <ws:contentTemplate>
 *             {{contentTemplate.itemData.item.title}}
 *             <ws:partial template="{{contentTemplate.itemActionsTemplate}}" />
 *          </ws:contentTemplate>
 *       </ws:partial>
 *    </ws:itemTemplate>
 * </Controls.list:View>
 * </pre>
 */

export default interface IBaseItemTemplateOptions {
   highlightOnHover?: boolean;
   clickable?: boolean;
   marker?: boolean;
   itemActionsClass?: string;
   contentTemplate?: string;
}