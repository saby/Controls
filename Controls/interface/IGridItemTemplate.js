/* eslint-disable */
define('Controls/interface/IGridItemTemplate', [
], function() {

   /**
    * Интерфейс для настройки отображения элементов в контроле {@link Controls/grid:View Таблица}.
    *
    * @interface Controls/interface/IGridItemTemplate
    * @public
    * @author Авраменко А.С.
    */

   /*
    * Interface for components with customizable display of elements in Grid control.
    *
    * @interface Controls/interface/IGridItemTemplate
    * @public
    * @author Авраменко А.С.
    */

   /**
    * @name Controls/interface/IGridItemTemplate#itemTemplate
    * @cfg {String|Function} Устанавливает шаблон отображения элемента.
    * @default Controls/grid:ItemTemplate
    * @remark
    * См. <a href="/materials/demo-ws4-grid-item-template">демо-пример</a>.
    * Подробнее о параметрах шаблона Controls/grid:ItemTemplate читайте {@link Controls/grid:ItemTemplate здесь}.
    * Подробнее о работе с шаблоном читайте {@link https://wi.sbis.ru/doc/platform/developmentapl/interface-development/controls/list/grid/templates/item/ здесь}.
    * Шаблон может быть переопределён с помощью опции {@link Controls/interface/IGridItemTemplate#itemTemplateProperty itemTemplateProperty}.
    * @example
    * В следующем примере показано, как изменить параметры шаблона.
    * <pre class="brush: html">
    * <Controls.grid:View>
    *    <ws:itemTemplate>
    *       <ws:partial template="Controls/grid:ItemTemplate" marker="{{false}}" scope="{{itemTemplate}}">
    *          <ws:contentTemplate>
    *             {{contentTemplate.itemData.item.title}}
    *          </ws:contentTemplate>
    *       </ws:partial>
    *    </ws:itemTemplate>
    * </Controls.grid:View>
    * </pre>
    * @see Controls/interface/IGridItemTemplate#itemTemplateProperty
    * @see Controls/grid:ItemTemplate
    */

   /*
    * @name Controls/interface/IGridItemTemplate#itemTemplate
    * @cfg {Function} Template for item render.
    * <a href="/materials/demo-ws4-grid-item-template">Example</a>.
    * @remark
    * Base itemTemplate for Controls.grid:View: "Controls/grid:ItemTemplate".
    * Inside the template scope, object itemData is available, allowing you to access the render data (for example: item, key, etc.).
    * Base itemTemplate supports these parameters:
    * <ul>
    *    <li>highlightOnHover {Boolean} - Enable highlighting item by hover.</li>
    *    <li>
    *       clickable {Boolean} - Cursor type (default или pointer).
    *       <ul>
    *          <li>true - cursor pointer</li>
    *          <li>false - cursor default</li>
    *       </ul>
    *       By default: <b>true</b>
    *    </li>
    * </ul>
    * @example
    * Using custom template for item rendering:
    * <pre>
    *    <Controls.grid:View>
    *       <ws:itemTemplate>
    *          <ws:partial template="Controls/grid:ItemTemplate" highlightOnHover="{{false}}"/>
    *       </ws:itemTemplate>
    *    </Controls.grid:View>
    * </pre>
    */

   /**
    * @name Controls/interface/IGridItemTemplate#itemTemplateProperty
    * @cfg {String|undefined} Устанавливает имя поля элемента, где содержится имя шаблона. С помощью этой настройки отдельным элементам можно задать собственный шаблон отображения.
    * @remark
    * См. <a href="/materials/demo-ws4-grid-item-template">демо-пример</a>.
    * Если не задано значение в опции itemTemplateProperty или в свойстве элемента, то используется шаблон из {@link Controls/interface/IGridItemTemplate#itemTemplate itemTemplate}.
    * @see Controls/interface/IGridItemTemplate#itemTemplate
    */

   /*
    * @name Controls/interface/IGridItemTemplate#itemTemplateProperty
    * @cfg {String} Name of the item property that contains template for item render. If not set, itemTemplate is used instead.
    * <a href="/materials/demo-ws4-grid-item-template">Example</a>.
    */

});
