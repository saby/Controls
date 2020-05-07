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
     * @cfg {Function} Шаблон группировки.
     * @remark
     * Для определения шаблона вызовите базовый шаблон - "Controls/dropdown:GroupTemplate".
     * Шаблон должен быть помещен в компонент с помощью тега <ws:partial> с атрибутом "template".
     * Базовый шаблон Controls/dropdown/GroupTemplate по умолчанию отображает только разделитель.
     * Вы можете изменить отображение разделителя, установив опцию:
     *    -  showText - определяет, отображается ли название группы.
     * Содержимое можно переопределить с помощью параметра "contentTemplate".
     * Параметр "groupProperty" тоже должен быть установлен.
     * @example
     * <pre>
     * <!-- WML -->
     *    <Controls.dropdown:Menu
     *          keyProperty="id"
     *          icon="icon-small icon-AddButtonNew"
     *          groupProperty="group"
     *          source="{{_source}}">
     *       <ws:groupTemplate>
     *          <ws:partial template="Controls/dropdown:GroupTemplate" showText="{{true}}" />
     *       </ws:groupTemplate>
     *    </Controls.dropdown:Menu>
     * </pre>
     * <pre>
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
     * @param item элемент списка.
     * @example
     * <pre>
     * <!-- WML -->
     *    <Controls.dropdown:Menu
     *          keyProperty="id"
     *          icon="icon-small icon-AddButtonNew"
     *          source="{{_source}}"
     *          groupProperty="group"/>
     * </pre>
     * <pre>
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
