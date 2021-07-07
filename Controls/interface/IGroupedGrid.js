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
    * Примечание: Для отображения элементов вне группы необходимо передавать в качестве значений поля, по которому производится группировка CONTROLS_HIDDEN_GROUP
    * @demo Controls-demo/List/List/GroupPG
    * @see groupTemplate
    * @see collapsedGroups
    * @see groupHistoryId
    * @see groupExpanded
    * @see groupCollapsed
    */

   /**
    * @name Controls/interface/IGroupedGrid#groupTemplate
    * @cfg {String|Function} Шаблон отображения заголовка группы.
    * @default undefined
    * @remark
    * Подробнее о параметрах шаблона Controls/grid:GroupTemplate читайте {@link Controls/grid:GroupTemplate здесь}.
    * Подробнее о работе с шаблоном читайте {@link https://wi.sbis.ru/doc/platform/developmentapl/interface-development/controls/list/list/grouping/basic/#header-group здесь}.
    * @demo Controls-demo/List/Grid/GroupPG
    * @see groupHistoryId
    * @see collapsedGroups
    * @see groupExpanded
    * @see groupCollapsed
    * @see groupProperty
    */

   /**
    * @name Controls/interface/IGroupedGrid#collapsedGroups
    * @cfg {Array.<String>} Список идентификаторов свернутых групп. Идентификаторы групп получаются из свойства {@link groupProperty}.
    * @demo Controls-demo/List/Grid/GroupPG
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
    * @event Controls/interface/IGroupedGrid#groupExpanded Происходит при развертывании группы.
    * @param {Vdom/Vdom:SyntheticEvent} eventObject Дескриптор события.
    * @param {String} changes Идентификатор группы.
    * @demo Controls-demo/List/Grid/GroupPG
    * @see groupTemplate
    * @see collapsedGroups
    * @see groupHistoryId
    * @see groupCollapsed
    * @see groupProperty
    */

   /**
    * @event Controls/interface/IGroupedGrid#groupCollapsed Происходит при сворачивании группы.
    * @param {Vdom/Vdom:SyntheticEvent} eventObject Дескриптор события.
    * @param {String} changes Идентификатор группы.
    * @demo Controls-demo/List/Grid/GroupPG
    * @see groupTemplate
    * @see collapsedGroups
    * @see groupHistoryId
    * @see groupExpanded
    * @see groupProperty
    */

});
