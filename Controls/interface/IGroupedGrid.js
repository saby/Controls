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
    * @name Controls/interface/IGroupedGrid#groupTemplate
    * @cfg {Function} Устанавливает шаблон группировки списка.
    * @default Controls/grid:GroupTemplate
    * @remark
    * См. <a href="/materials/demo-ws4-grid-group">демо-пример</a>.
    * Подробнее о параметрах шаблона Controls/grid:GroupTemplate читайте {@link Controls/grid:GroupTemplate здесь}.
    * Подробнее о работе с шаблоном читайте {@link https://wi.sbis.ru/doc/platform/developmentapl/interface-development/controls/list/grid/templates/grouping/ здесь}.
    * @see groupHistoryId
    * @see collapsedGroups
    * @see groupExpanded
    * @see groupCollapsed
    * @see groupProperty
    */

   /**
    * @name Controls/interface/IGroupedGrid#collapsedGroups
    * @cfg {Array} Список идентификаторов свернутых групп. Идентификаторы групп получаются из свойства {@link groupProperty}.
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
    * @event Controls/interface/IGroupedGrid#groupExpanded Происходит при развертывании группы.
    * @param {Vdom/Vdom:SyntheticEvent} eventObject Дескриптор события.
    * @remark
    * См. <a href="/materials/demo-ws4-grid-group">демо-пример</a>.
    * @see groupTemplate
    * @see collapsedGroups
    * @see groupHistoryId
    * @see groupCollapsed
    * @see groupProperty
    */

   /**
    * @event Controls/interface/IGroupedGrid#groupCollapsed Происходит при сворачивании группы.
    * @param {Vdom/Vdom:SyntheticEvent} eventObject Дескриптор события.
    * @remark
    * См. <a href="/materials/demo-ws4-grid-group">демо-пример</a>.
    * @see groupTemplate
    * @see collapsedGroups
    * @see groupHistoryId
    * @see groupExpanded
    * @see groupProperty
    */

});
