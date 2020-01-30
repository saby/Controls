/* eslint-disable */
define('Controls/interface/IGroupedGrid', [
], function() {

   /**
    * Интерфейс для компонентов, реализующих группировку элементов.
    *
    * @interface Controls/interface/IGroupedGrid
    * @public
    * @author Авраменко А.С.
    */

   /**
    * @name Controls/interface/IGroupedGrid#groupProperty
    * @cfg {String} Имя свойства, содержащего идентификатор группы элемента списка.
    * @remark
    * См. <a href="/materials/demo-ws4-list-group">демо-пример</a>.
    * @see groupTemplate
    * @see collapsedGroups
    * @see groupHistoryId
    * @see groupExpanded
    * @see groupCollapsed
    */

   /**
    * @name Controls/interface/IGroupedGrid#groupTemplate
    * @cfg {String|Function} Устанавливает шаблон отображения заголовка группы.
    * @default Controls/grid:GroupTemplate
    * @remark
    * См. <a href="/materials/demo-ws4-grid-group">демо-пример</a>.
    * Подробнее о параметрах шаблона Controls/grid:GroupTemplate читайте {@link Controls/grid:GroupTemplate здесь}.
    * Подробнее о работе с шаблоном читайте {@link https://wi.sbis.ru/doc/platform/developmentapl/interface-development/controls/list/list/grouping/group-template/ здесь}.
    * @see groupHistoryId
    * @see collapsedGroups
    * @see groupExpanded
    * @see groupCollapsed
    * @see groupProperty
    */

   /**
    * @name Controls/interface/IGroupedGrid#collapsedGroups
    * @cfg {Array.<String>} Список идентификаторов свернутых групп. Идентификаторы групп получаются из свойства {@link groupProperty}.
    * @remark
    * См. <a href="/materials/demo-ws4-grid-group">демо-пример</a>.
    * @see groupTemplate
    * @see groupHistoryId
    * @see groupExpanded
    * @see groupCollapsed
    * @see groupProperty
    */

   /**
    * @name Controls/interface/IGroupedGrid#groupHistoryId
    * @cfg {String} Идентификатор для сохранения в истории списка идентификаторов свернутых групп.
    * @see groupTemplate
    * @see collapsedGroups
    * @see groupExpanded
    * @see groupCollapsed
    * @see groupProperty
    */

   /**
    * @event Происходит при развертывании группы.
    * @name Controls/interface/IGroupedGrid#groupExpanded
    * @param {Vdom/Vdom:SyntheticEvent} eventObject Дескриптор события.
    * @param {Array.<String>} changes Массив с идентификаторами групп.
    * @remark
    * См. <a href="/materials/demo-ws4-grid-group">демо-пример</a>.
    * @see groupTemplate
    * @see collapsedGroups
    * @see groupHistoryId
    * @see groupCollapsed
    * @see groupProperty
    */

   /**
    * @event Происходит при сворачивании группы.
    * @name Controls/interface/IGroupedGrid#groupCollapsed
    * @param {Vdom/Vdom:SyntheticEvent} eventObject Дескриптор события.
    * @param {Array.<String>} changes Массив с идентификаторами групп.
    * @remark
    * См. <a href="/materials/demo-ws4-grid-group">демо-пример</a>.
    * @see groupTemplate
    * @see collapsedGroups
    * @see groupHistoryId
    * @see groupExpanded
    * @see groupProperty
    */

});
