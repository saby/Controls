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
    * @cfg {String|Function} Шаблон отображения элемента.
    * @default Controls/list:ItemTemplate
    * @demo Controls-demo/list_new/ItemTemplate/CustomContent/Index
    * @remark
    * По умолчанию для отображения всех элементов контрола используется шаблон Controls/list:ItemTemplate.
    * Он настроен таким образом, чтобы выводить значение поля title, если такое присутствует в элементе.
    * Помните об этой особенности шаблона при настройке источника данных.
    *
    * Использование других шаблонов для отображения элементов контрола не допускается.
    *
    * Шаблон Controls/list:ItemTemplate поддерживает параметры, с помощью которых можно изменить отображение элемента.
    * Список параметров доступен {@link Controls/list:ItemTemplate здесь}.
    * Подробнее о работе с шаблоном вы можете прочитать {@link https://wi.sbis.ru/doc/platform/developmentapl/interface-development/controls/list/list/templates/item/ здесь}.
    * 
    * Для конкретных элементов контрола можно задать собственный шаблон отображения.
    * Для этого используйте опцию {@link Controls/interface/IItemTemplate#itemTemplateProperty itemTemplateProperty}.
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
    * @demo Controls-demo/list_new/ItemTemplate/CustomContent/Index
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
    * @cfg {String|undefined} Имя поля элемента, где содержится имя шаблона отображения элемента. С помощью этой настройки отдельным элементам можно задать собственный шаблон отображения.
    * @demo Controls-demo/list_new/ItemTemplate/ItemTemplateProperty/Index
    * @remark
    * Если не задано значение в опции itemTemplateProperty или в свойстве элемента, то используется шаблон из {@link Controls/interface/IItemTemplate#itemTemplate itemTemplate}.
    * @see Controls/interface/IItemTemplate#itemTemplate
    */

   /*
    * @name Controls/interface/IItemTemplate#itemTemplateProperty
    * @cfg {String} Name of the item property that contains template for item render. If not set, itemTemplate is used instead.
    * @demo Controls-demo/list_new/ItemTemplate/ItemTemplateProperty/Index
    */
});
