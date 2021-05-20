/* eslint-disable */
define('Controls/interface/IGroupedGrid', [
], function() {

   /**
    * Интерфейс для контролов, реализующих {@link /doc/platform/developmentapl/interface-development/controls/list/grouping/ группировку} элементов.
    *
    * @interface Controls/interface/IGroupedGrid
    * @public
    * @author Авраменко А.С.
    */

   /**
    * @name Controls/interface/IGroupedGrid#groupProperty
    * @cfg {String} Имя поля записи, в котором хранится идентификатор {@link /doc/platform/developmentapl/interface-development/controls/list/grouping/ группы} элемента списка.
    * @see groupTemplate
    * @see collapsedGroups
    * @see groupHistoryId
    * @see groupExpanded
    * @see groupCollapsed
    */

   /**
    * @name Controls/interface/IGroupedGrid#groupTemplate
    * @cfg {String|TemplateFunction} Шаблон отображения {@link /doc/platform/developmentapl/interface-development/controls/list/grouping/visual/ заголовка группы}.
    * @default undefined
    * @remark
    * Конфигурация визуального представления группировки задаётся в опции groupTemplate путём настройки шаблона группировки {@link Controls/grid:GroupTemplate}.
    * @demo Controls-demo/grid/Grouped/Custom/Index
    * @see groupHistoryId
    * @see collapsedGroups
    * @see groupExpanded
    * @see groupCollapsed
    * @see groupProperty
    */

   /**
    * @name Controls/interface/IGroupedGrid#collapsedGroups
    * @cfg {Array.<String>} Идентификаторы {@link /doc/platform/developmentapl/interface-development/controls/list/grouping/ групп}, которые будут свернуты при инициализации списка.
    * @remark
    * Подробнее об управлении состоянием развернутости групп читайте {@link /doc/platform/developmentapl/interface-development/controls/list/grouping/group/ здесь}.
    * @see groupProperty
    * @see groupExpanded
    * @see groupCollapsed
    */

   /**
    * @name Controls/interface/IGroupedGrid#groupHistoryId
    * @cfg {String} Идентификатор, по которому на {@link /doc/platform/developmentapl/middleware/parameter_service/ Сервисе параметров} сохраняется текущее {@link /doc/platform/developmentapl/interface-development/controls/list/grouping/group/#history состояние развернутости групп}.
    */

});
/**
 * @event Controls/interface/IGroupedGrid#groupExpanded Происходит при развертывании {@link /doc/platform/developmentapl/interface-development/controls/list/grouping/ группы}.
 * @param {UICommon/Events:SyntheticEvent} eventObject Дескриптор события.
 * @param {String} changes Идентификатор группы.
 * @see groupCollapsed
 * @remark
 * Подробнее о событиях изменения состояния развернутости группы читайте {@link /doc/platform/developmentapl/interface-development/controls/list/grouping/action/ здесь}.
 */

/**
 * @event Controls/interface/IGroupedGrid#groupCollapsed Происходит при сворачивании {@link /doc/platform/developmentapl/interface-development/controls/list/grouping/ группы}.
 * @param {UICommon/Events:SyntheticEvent} eventObject Дескриптор события.
 * @param {String} changes Идентификатор группы.
 * @see groupExpanded
 * @remark
 * Подробнее о событиях изменения состояния развернутости группы читайте {@link /doc/platform/developmentapl/interface-development/controls/list/grouping/action/ здесь}.
 */