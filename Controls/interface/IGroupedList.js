/* eslint-disable */
define('Controls/interface/IGroupedList', [
], function() {

   /**
    * Интерфейс для контролов, реализующих {@link /doc/platform/developmentapl/interface-development/controls/list/grouping/ группировку} элементов.
    *
    * @interface Controls/interface/IGroupedList
    * @public
    * @author Авраменко А.С.
    */

   /**
    * @name Controls/interface/IGroupedList#groupProperty
    * @cfg {String} Имя свойства, содержащего идентификатор {@link /doc/platform/developmentapl/interface-development/controls/list/grouping/ группы} элемента списка.
    * @see groupTemplate
    * @see collapsedGroups
    * @see groupHistoryId
    * @see groupExpanded
    * @see groupCollapsed
    */

   /**
    * @name Controls/interface/IGroupedList#groupTemplate
    * @cfg {String|TemplateFunction} Устанавливает пользовательский шаблон, с помощью которого настраивается {@link /doc/platform/developmentapl/interface-development/controls/list/grouping/visual/ визуальное представление заголовка группы}.
    * @default undefined
    * @remark
    * Конфигурация визуального представления группировки задаётся в опции groupTemplate путём настройки шаблона группировки {@link Controls/list:GroupTemplate}.
    * @example
    * Далее показано как изменить параметры шаблона на примере контрола Controls/list:View, однако то же самое справедливо и для других {@link /doc/platform/developmentapl/interface-development/controls/list/ списочных контролов}.
    * <pre class="brush: html">
    * <Controls.list:View>
    *    <ws:groupTemplate>
    *       <ws:partial template="Controls/list:GroupTemplate"
    *          separatorVisibility="{{false}}"
    *          expanderVisible="{{false}}"
    *          textAlign="left"
    *          scope="{{groupTemplate}}">
    *          <ws:contentTemplate>
    *             <ws:if data="{{contentTemplate.item.contents === 'nonexclusive'}}">Неисключительные права</ws:if>
    *             <ws:if data="{{contentTemplate.item.contents === 'works'}}">Работы</ws:if>
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
    * @cfg {Array.<String>} Идентификаторы {@link /doc/platform/developmentapl/interface-development/controls/list/grouping/ групп}, которые будут свернуты при инициализации списка.
    * @remark
    * Подробнее об управлении состоянием развернутости групп читайте {@link /doc/platform/developmentapl/interface-development/controls/list/grouping/group/ здесь}.
    * @see groupProperty
    * @see groupExpanded
    * @see groupCollapsed
    */

   /**
    * @name Controls/interface/IGroupedList#groupHistoryId
    * @cfg {String} Идентификатор, по которому на {@link /doc/platform/developmentapl/middleware/parameter_service/ Сервисе параметров} сохраняется текущее {@link /doc/platform/developmentapl/interface-development/controls/list/grouping/group/ состояние развернутости групп}.
    */

   /**
    * @name Controls/interface/IGroupedList#hiddenGroupPosition
    * @cfg {Controls/list:IHiddenGroupPosition} Позиция скрытой группы
    */

});

/**
 * @event Controls/interface/IGroupedList#groupExpanded Происходит при развертывании {@link /doc/platform/developmentapl/interface-development/controls/list/grouping/ группы}.
 * @param {UICommon/Events:SyntheticEvent} eventObject Дескриптор события.
 * @param {String} changes Идентификатор группы.
 * @demo Controls-demo/list_new/Grouped/OnGroupCollapsed/Index
 * @see groupCollapsed
 * @remark
 * Подробнее о событиях изменения состояния развернутости группы читайте {@link /doc/platform/developmentapl/interface-development/controls/list/grouping/action/ здесь}.
 */

/**
 * @event Controls/interface/IGroupedList#groupCollapsed Происходит при сворачивании {@link /doc/platform/developmentapl/interface-development/controls/list/grouping/ группы}.
 * @param {UICommon/Events:SyntheticEvent} eventObject Дескриптор события.
 * @param {String} changes Идентификатор группы.
 * @demo Controls-demo/list_new/Grouped/OnGroupCollapsed/Index
 * @see groupExpanded
 * @remark
 * Подробнее о событиях изменения состояния развернутости группы читайте {@link /doc/platform/developmentapl/interface-development/controls/list/grouping/action/ здесь}.
 */