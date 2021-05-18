export type TExpanderVisibility = 'visible'|'hasChildren'|'hasChildrenOrHover';

export interface IOptions {
    parentProperty: string;
    nodeProperty: string;
    nodeTypeProperty?: string;
    groupProperty?: string;
    hasChildrenProperty?: string;
    expanderVisibility?: TExpanderVisibility;
}

/**
 * Интерфейс дерева
 * @mixes Controls/interface/IGroupedList
 *
 * @public
 * @author Аверкиев П.А.
 */
export default interface ITreeGrid {
    readonly '[Controls/_treeGrid/interface/ITreeGrid]': true;
}

/**
 * @name Controls/_treeGrid/interface/ITreeGrid#nodeTypeProperty
 * @cfg {String} Имя свойства, содержащего информацию о типе узла.
 * @remark
 * Используется для отображения узлов в виде групп. (См. {{Controls/_treeGrid/interface/GroupColumnTemplate Шаблон ячейки группы}})
 * Если в RecordSet в указанном свойстве с БЛ приходит значение 'group', то такой узел должен будет отобразиться как группа.
 * При любом другом значении узел отображается как обычно с учётом nodeProperty
 * @example
 * В следующем примере показано, как настроить список на использование узлов-групп
 * <pre class="brush: html">
 * <!-- WML -->
 * <Controls.treeGrid:View
 *    source="{{_source}}"
 *    nodeProperty="{{parent@}}"
 *    parentProperty="{{parent}}"
 *    nodeTypeProperty="customNodeType"/>
 * </pre>
 *
 * <pre class="brush: js">
 * // TypeScript
 * class MyControl extends Control<IControlOptions> {
 *    _source: new RecordSet({
 *        rawData: [
 *            {
 *                id: 1,
 *                customNodeType: 'group',
 *                'parent@': true,
 *                parent: null
 *            },
 *            {
 *                id: 2,
 *                customNodeType: null,
 *                ...
 *            },
 *            {
 *                id: 3,
 *                customNodeType: 'group',
 *                'parent@': true,
 *                parent: null
 *            },
 *        ]
 *    })
 * }
 * </pre>
 */
