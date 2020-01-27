/* eslint-disable */
define('Controls/interface/ITreeGridItemTemplate', [
], function() {

   /**
    * Интерфейс для настройки отображения элементов в {@link Controls/treeGrid:View дереве}.
    *
    * @interface Controls/interface/ITreeGridItemTemplate
    * @public
    * @author Авраменко А.С.
    */
   /*
    * Interface for components with customizable display of elements in TreeGrid control.
    *
    * @interface Controls/interface/ITreeGridItemTemplate
    * @public
    */

   /**
    * @name Controls/interface/ITreeGridItemTemplate#itemTemplate
    * @cfg {Function} Устанавливает шаблон отображения элемента.
    * @default Controls/treeGrid:ItemTemplate
    * @remark
    * См. <a href="/materials/demo-ws4-tree-grid-item-template">демо-пример</a>.
    * Подробнее о параметрах шаблона Controls/treeGrid:ItemTemplate читайте {@link Controls/treeGrid:ItemTemplate здесь}.
    * Подробнее о работе с шаблоном читайте {@link https://wi.sbis.ru/doc/platform/developmentapl/interface-development/controls/list/tree/templates/item/ здесь}.
    * Шаблон может быть переопределён с помощью {@link Controls/interface/ITreeGridItemTemplate#itemTemplateProperty itemTemplateProperty}.
    * @example
    * <pre class="brush: html">
    * <Controls.treeGrid:View>
    *    <ws:itemTemplate>
    *       <ws:partial template="Controls/treeGrid:ItemTemplate" levelIndentSize="null" expanderSize="l" expanderIcon="node" scope="{{itemTemplate}}">
    *          <ws:contentTemplate>
    *             <div title="{{contentTemplate.itemData.item.Name}}">
    *                {{contentTemplate.itemData.item.Name}}
    *             </div>
    *          </ws:contentTemplate>
    *       </ws:partial>
    *    </ws:itemTemplate>
    * </Controls.treeGrid:View>
    * </pre>
    * @see Controls/interface/ITreeGridItemTemplate#itemTemplateProperty
    * @see Controls/treeGrid:ItemTemplate
    */

   /*
    * @name Controls/interface/ITreeGridItemTemplate#itemTemplate
    * @cfg {Function} Template for item render.
    * <a href="/materials/demo-ws4-tree-grid-item-template">Example</a>.
    * @remark
    * Base itemTemplate for Controls.treeGrid:View: "Controls/treeGrid:ItemTemplate".
    * Inside the template scope, object itemData is available, allowing you to access the render data (for example: item, key, etc.).
    * @example
    * Using custom template for item rendering:
    * <pre>
    *    <Controls.treeGrid:View>
    *       <ws:itemTemplate>
    *          <ws:partial template="Controls/treeGrid:ItemTemplate" levelIndentSize="null" expanderSize="l" expanderIcon="node" />
    *       </ws:itemTemplate>
    *    </Controls.treeGrid:View>
    * </pre>
    */

   /**
    * @name Controls/interface/ITreeGridItemTemplate#itemTemplateProperty
    * @cfg {String} Устанавливает имя свойства элемента, которое содержит имя шаблона, используемого для отрисовки элементов.
    * @remark
    * См. <a href="/materials/demo-ws4-tree-grid-item-template">демо-пример</a>.
    * Если не задано значение в опции itemTemplateProperty или в свойстве элемента, то используется шаблон из {@link Controls/interface/ITreeGridItemTemplate#itemTemplate itemTemplate}.
    * @see Controls/interface/ITreeGridItemTemplate#itemTemplate
    */
   /*
    * @name Controls/interface/ITreeGridItemTemplate#itemTemplateProperty
    * @cfg {String} Name of the item property that contains template for item render. If not set, itemTemplate is used instead.
    * <a href="/materials/demo-ws4-tree-grid-item-template">Example</a>.
    */

});
