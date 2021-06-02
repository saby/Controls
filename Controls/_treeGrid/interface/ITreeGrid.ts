import { ITree, IOptions as ITreeOptions } from 'Controls/tree';

/**
 * @typedef {String} Controls/_treeGrid/interface/ITreeGrid/TGroupNodeVisibility
 * Доступные значения для {@link Controls/_treeGrid/interface/ITreeGrid#groupNodeVisibility видимости групп в иерархической группировке}
 * @variant visible Всегда показывать полученные из источника данных группы в иерархической группировке.
 * @variant hasdata Показывать полученные из источника данных группы в иерархической группировке только если в метаданных передан параметр singleGroupNode со значением, отличным от true.
 */
export type TGroupNodeVisibility = 'hasdata' | 'visible';

export interface IOptions extends ITreeOptions {
    nodeTypeProperty?: string;
    groupNodeVisibility?: TGroupNodeVisibility;
}

/**
 * Интерфейс дерева-таблицы
 * @mixes Controls/interface/IGroupedList
 *
 * @public
 * @author Аверкиев П.А.
 */
export default interface ITreeGrid extends ITree {
    readonly '[Controls/_treeGrid/interface/ITreeGrid]': true;
}

/**
 * @name Controls/_treeGrid/interface/ITreeGrid#nodeTypeProperty
 * @cfg {String} Имя свойства, содержащего информацию о типе узла.
 * @remark
 * Используется для отображения узлов в виде групп. (См. {@link Controls/treeGrid:IGroupNodeColumn Колонка списка с иерархической группировкой.})
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
 *    _source: new Memory({
 *        keyProperty: 'id',
 *        data: [
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
 *
 * @name Controls/_treeGrid/interface/ITreeGrid#groupNodeVisibility
 * @cfg {TGroupNodeVisibility} Видимость групп в иерархической группировке
 * @variant visible Всегда показывать полученные из источника данных группы в иерархической группировке.
 * @variant hasdata Показывать полученные из источника данных группы в иерархической группировке только если в метаданных передан параметр singleGroupNode со значением, отличным от true.
 * @default visible
 */
