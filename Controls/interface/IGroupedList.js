/* eslint-disable */
define('Controls/interface/IGroupedList', [
], function() {

   /**
    * Интерфейс для контролов, реализующих группировку элементов.
    *
    * @interface Controls/interface/IGroupedList
    * @public
    * @author Авраменко А.С.
    */

   /**
    * @name Controls/interface/IGroupedGrid#groupProperty
    * @cfg {String} Имя свойства, содержащего идентификатор группы элемента списка.
    * <a href="/materials/demo-ws4-list-group">Example</a>.
    * @remark
    * Среди групп списка существует "скрытая группа".
    * Для такой группы не создаётся заголовок, а её элементы визуально размещены в начале списка.
    * Чтобы отнести элемент к скрытой группе, в качестве идентификатора группы необходимо использовать константу view.hiddenGroup, которая принадлежит библиотеке {@link Controls/Constants}.
    * Передачу идентификатора view.hiddenGroup можно оргиназовать двумя способами - возвращая его из источника данных и описав собственное поле модели.
    * Подробнее про описание собственных свойств модели в разделе {@ling https://wi.sbis.ru/docs/js/Types/entity/Model/options/properties}.
    * @see groupTemplate
    * @see collapsedGroups
    * @see groupHistoryId
    * @see groupExpanded
    * @see groupCollapsed
    */

   /**
    * @name Controls/interface/IGroupedList#groupTemplate
    * @cfg {Function} Устанавливает шаблон отображения разделителя {@link https://wi.sbis.ru/doc/platform/developmentapl/interface-development/controls/list/list/grouping/ группы}.
    * @default Controls/list:GroupTemplate
    * @remark
    * См. <a href="/materials/demo-ws4-list-group">демо-пример</a>.
    * Подробнее о параметрах шаблона Controls/list:GroupTemplate читайте {@link Controls/list:GroupTemplate здесь}.
    * Подробнее о работе с шаблоном читайте {@link https://wi.sbis.ru/doc/platform/developmentapl/interface-development/controls/list/list/templates/grouping/ здесь}.
    * @example
    * Далее показано как изменить параметры шаблона на примере контрола Controls/list:View, однако то же самое справедливо и для других {@link https://wi.sbis.ru/doc/platform/developmentapl/interface-development/controls/list/ списочных контролов}..
    * <pre class="brush: html">
    * <Controls.list:View>
    *    <ws:groupTemplate>
    *       <ws:partial template="Controls/list:GroupTemplate"
    *          separatorVisibility="{{false}}"
    *          expanderVisible="{{false}}"
    *          textAlign="left"
    *          scope="{{groupTemplate}}">
    *          <ws:contentTemplate>
    *             <ws:if data="{{contentTemplate.itemData.item === 'nonexclusive'}}">Неисключительные права</ws:if>
    *             <ws:if data="{{contentTemplate.itemData.item === 'works'}}">Работы</ws:if>
    *          </ws:contentTemplate>
    *       </ws:partial>
    *    </ws:groupTemplate>
    * </Controls.list:View>
    * </pre>
    * @see collapsedGroups
    * @see groupProperty
    * @see groupHistoryId
    */

   /**
    * @name Controls/interface/IGroupedList#collapsedGroups
    * @cfg {Array} Список идентификаторов свернутых групп. Идентификаторы групп получаются из свойства {@link groupProperty}.
    * <a href="/materials/demo-ws4-list-group">Example</a>.
    * @see groupTemplate
    * @see groupProperty
    * @see groupHistoryId
    */

   /**
    * @name Controls/interface/IGroupedList#groupHistoryId
    * @cfg {String} Идентификатор для сохранения в истории списка идентификаторов свернутых групп.
    * @see groupTemplate
    * @see groupProperty
    * @see collapsedGroups
    */

   /**
    * @event Controls/interface/IGroupedList#groupExpanded Происходит при развертывании группы.
    * @param {Vdom/Vdom:SyntheticEvent} eventObject Дескриптор события.
    * <a href="/materials/demo-ws4-list-group">Example</a>.
    */

   /**
    * @event Controls/interface/IGroupedList#groupCollapsed Происходит при сворачивании группы.
    * @param {Vdom/Vdom:SyntheticEvent} eventObject Дескриптор события.
    * <a href="/materials/demo-ws4-list-group">Example</a>.
    */

});

