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
    * @cfg {String|Function} Шаблон отображения элемента.
    * @default undefined
    * @remark
    * Позволяет установить прикладной шаблон отображения элемента (**именно шаблон**, а не контрол!). При установке прикладного шаблона **ОБЯЗАТЕЛЕН** вызов базового шаблона {@link Controls/treeGrid:ItemTemplate}.
    *
    * Шаблон Controls/treeGrid:ItemTemplate поддерживает {@link Controls/treeGrid:ItemTemplate параметры}, с помощью которых можно изменить отображение элемента.
    *
    * В разделе "Примеры" показано как с помощью директивы {@link https://wi.sbis.ru/doc/platform/developmentapl/interface-development/ui-library/template-engine/#ws-partial ws:partial} задать прикладной шаблон. Также в опцию itemTemplate можно передавать и более сложные шаблоны, которые содержат иные директивы, например {@link https://wi.sbis.ru/doc/platform/developmentapl/interface-development/ui-library/template-engine/#ws-if ws:if}. В этом случае каждая ветка вычисления шаблона должна заканчиваться директивой ws:partial, которая встраивает Controls/treeGrid:ItemTemplate.
    *
    * Дополнительно о работе с шаблоном вы можете прочитать в {@link https://wi.sbis.ru/doc/platform/developmentapl/interface-development/controls/list/tree/templates/item/ руководстве разработчика}.
    * @example
    * <pre class="brush: html">
    * <Controls.treeGrid:View>
    *    <ws:itemTemplate>
    *       <ws:partial template="Controls/treeGrid:ItemTemplate" highlightOnHover="{{false}}" />
    *    </ws:itemTemplate>
    * </Controls.treeGrid:View>
    * </pre>
    * @demo Controls-demo/treeGrid/ItemTemplate/NoHighlightOnHover/Index
    * @see Controls/interface/ITreeGridItemTemplate#itemTemplateProperty
    * @see Controls/treeGrid:ItemTemplate
    */

   /*
    * @name Controls/interface/ITreeGridItemTemplate#itemTemplate
    * @cfg {Function} Template for item render.
    * <a href="/materials/Controls-demo/app/Controls-demo%2FList%2FTreeGrid%2FItemTemplatePG">Example</a>.
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
    * @cfg {String} Имя поля элемента, которое содержит имя шаблона отображения элемента. С помощью этой настройки отдельным элементам можно задать собственный шаблон отображения.
    * @default undefined
    * @remark
    * Если не задано значение в опции itemTemplateProperty или в свойстве элемента, то используется шаблон из {@link Controls/interface/ITreeGridItemTemplate#itemTemplate itemTemplate}.
    * @see Controls/interface/ITreeGridItemTemplate#itemTemplate
    */
   /*
    * @name Controls/interface/ITreeGridItemTemplate#itemTemplateProperty
    * @cfg {String} Name of the item property that contains template for item render. If not set, itemTemplate is used instead.
    */

});
