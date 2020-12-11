import {TemplateFunction} from 'UI/Base';

/**
 * Интерфейс для контрола "Выпадающий список" с возможностью группировки элементов.
 *
 * @interface Controls/_dropdown/interface/IGrouped
 * @public
 * @author Золотова Э.Е.
 */
interface IGrouped {
    readonly '[Controls/_dropdown/interface/IGrouped]': boolean;
}

export default IGrouped;

export interface IGroupedOptions {
    /**
     * @name Controls/_dropdown/interface/IGrouped#groupTemplate
     * @cfg {Function} Шаблон отображения заголовка группы.
     * @remark
     * Позволяет установить пользовательский шаблон отображения заголовка группы (**именно шаблон**, а не контрол!). При установке шаблона **ОБЯЗАТЕЛЕН** вызов базового шаблона {@link Controls/dropdown:GroupTemplate}. Шаблон Controls/dropdown:GroupTemplate поддерживает параметры, с помощью которых можно изменить отображение заголовка группы.
     * 
     * В разделе "Примеры" показано как с помощью директивы {@link /doc/platform/developmentapl/interface-development/ui-library/template-engine/#ws-partial ws:partial} задать пользовательский шаблон. Также в опцию groupTemplate можно передавать и более сложные шаблоны, которые содержат иные директивы, например {@link /doc/platform/developmentapl/interface-development/ui-library/template-engine/#ws-if ws:if}. В этом случае каждая ветка вычисления шаблона должна заканчиваться директивой ws:partial, которая встраивает Controls/dropdown:GroupTemplate.
     * @demo Controls-demo/Menu/Control/GroupProperty/GroupTemplate/Index
     * @see groupProperty
     * @example
     * <pre class="brush: html; highlight: [5,7,8,9]">
     * <!-- WML -->
     * <Controls.dropdown:Menu
     *    keyProperty="id"
     *    icon="icon-small icon-AddButtonNew"
     *    groupProperty="group"
     *    source="{{_source}}">
     *    <ws:groupTemplate>
     *       <ws:partial template="Controls/dropdown:GroupTemplate" showText="{{true}}" />
     *    </ws:groupTemplate>
     * </Controls.dropdown:Menu>
     * </pre>
     * <pre class="brush: js">
     * // JavaScript
     * this._source = new Memory({
     *    data: [
     *       { id: 1, title: 'Task in development', group: 'Select' },
     *       { id: 2, title: 'Error in development', group: 'Select' },
     *       { id: 3, title: 'Application', group: 'Select' },
     *       { id: 4, title: 'Assignment', group: 'Create' },
     *       { id: 5, title: 'Approval', group: 'Create' },
     *       { id: 6, title: 'Working out', group: 'Create' },
     *       { id: 7, title: 'Assignment for accounting', group: 'Create' },
     *       { id: 8, title: 'Assignment for delivery', group: 'Create' },
     *       { id: 9, title: 'Assignment for logisticians', group: 'Create' }
     *    ],
     *    keyProperty: 'id'
     * });
     * </pre>
     */
    groupTemplate: TemplateFunction;
    /**
     * @name Controls/_dropdown/interface/IGrouped#groupProperty
     * @cfg {String} Имя свойства, содержащего идентификатор группы элемента списка.
     * @param item Элемент списка.
     * @see groupTemplate
     * @demo Controls-demo/Menu/Control/GroupProperty/Index
     * @example
     * <pre class="brush: html; highlight: [6]">
     * <!-- WML -->
     * <Controls.dropdown:Menu
     *    keyProperty="id"
     *    icon="icon-small icon-AddButtonNew"
     *    source="{{_source}}"
     *    groupProperty="group"/>
     * </pre>
     * <pre class="brush: js;">
     * // JavaScript
     * this._source = new Memory({
     *    data: [
     *       { id: 1, title: 'Task in development', group: 'Select' },
     *       { id: 2, title: 'Error in development', group: 'Select' },
     *       { id: 3, title: 'Application', group: 'Select' },
     *       { id: 4, title: 'Assignment', group: 'Create' },
     *       { id: 5, title: 'Approval', group: 'Create' },
     *       { id: 6, title: 'Working out', group: 'Create' },
     *       { id: 7, title: 'Assignment for accounting', group: 'Create' },
     *       { id: 8, title: 'Assignment for delivery', group: 'Create' },
     *       { id: 9, title: 'Assignment for logisticians', group: 'Create' }
     *    ],
     *    keyProperty: 'id'
     * });
     * </pre>
     */
    groupProperty: string;
}