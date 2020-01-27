/* eslint-disable */
define('Controls/interface/IItemTemplate', [
], function() {

   /**
    * Интерфейс для контролов с возможностью настройки отображения элементов.
    *
    * @interface Controls/interface/IItemTemplate
    * @public
    * @author Авраменко А.С.
    */

   /*
    * Interface for components with customizable display of elements.
    *
    * @interface Controls/interface/IItemTemplate
    * @public
    * @author Авраменко А.С.
    */

   /**
    * @name Controls/interface/IItemTemplate#itemTemplate
    * @cfg {String|Function} Устанавливает шаблон отображения элемента.
    * @default Controls/list:ItemTemplate
    * @remark
    * См. <a href="/materials/demo-ws4-list-item-template">демо-пример</a>.
    * Подробнее о параметрах шаблона Controls/list:ItemTemplate читайте {@link Controls/list:ItemTemplate здесь}.
    * Подробнее о работе с шаблоном читайте в {@link https://wi.sbis.ru/doc/platform/developmentapl/interface-development/controls/list/list/templates/item/ здесь}.
    * Шаблон может быть переопределён с помощью опции {@link Controls/interface/IItemTemplate#itemTemplateProperty itemTemplateProperty}.
    * @example
    * <pre class="brush: html">
    * <Controls.list:View>
    *    <ws:itemTemplate>
    *       <ws:partial template="Controls/list:ItemTemplate" marker="{{false}}" scope="{{itemTemplate}}"> 
    *          <ws:contentTemplate>
    *             {{contentTemplate.itemData.item.title}}
    *          </ws:contentTemplate>
    *       </ws:partial>
    *    </ws:itemTemplate>
    * </Controls.list:View>
    * </pre>
    * @see Controls/interface/IItemTemplate#itemTemplateProperty
    * @see Controls/list:ItemTemplate
    */

   /*
    * @name Controls/interface/IItemTemplate#itemTemplate
    * @cfg {Function} Template for item render.
    * <a href="/materials/demo-ws4-list-item-template">Example</a>.
    * @remark
    * Base itemTemplate for Controls.list:View: "Controls/list:ItemTemplate".
    * Inside the template scope, object itemData is available, allowing you to access the render data (for example: item, key, etc.).
    * Base itemTemplate supports these parameters:
    * <ul>
    *    <li>contentTemplate {Function} - Template for render item content.</li>
    *    <li>highlightOnHover {Boolean} - Enable highlighting item by hover.</li>
    *    <li>clickable {Boolean} - Cursor type (false - default or true - pointer) By default: true.</li>
    * </ul>
    * @example
    * Using custom template for item rendering:
    * <pre>
    *    <Controls.list:View>
    *       <ws:itemTemplate>
    *          <ws:partial template="Controls/list:ItemTemplate" scope="{{itemTemplate}}"> 
    *             <ws:contentTemplate>
    *                <span>{{contentTemplate.itemData.item.description}}</span>
    *             </ws:contentTemplate>
    *          </ws:partial>
    *       </ws:itemTemplate>
    *    </Controls.list:View>
    * </pre>
    */

   /**
    * @name Controls/interface/IItemTemplate#itemTemplateProperty
    * @cfg {String|undefined} Устанавливает имя поля элемента, где содержится имя шаблона. С помощью этой настройки отдельным элементам можно задать собственный шаблон отображения.
    * @remark
    * См. <a href="/materials/demo-ws4-list-item-template">демо-пример</a>.
    * Если не задано значение в опции itemTemplateProperty или в свойстве элемента, то используется шаблон из {@link Controls/interface/IItemTemplate#itemTemplate itemTemplate}.
    * @see Controls/interface/IItemTemplate#itemTemplate
    */

   /*
    * @name Controls/interface/IItemTemplate#itemTemplateProperty
    * @cfg {String} Name of the item property that contains template for item render. If not set, itemTemplate is used instead.
    * <a href="/materials/demo-ws4-list-item-template">Example</a>.
    */
});
