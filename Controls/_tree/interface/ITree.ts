export type TExpanderVisibility = 'visible'|'hasChildren'|'hasChildrenOrHover';

export interface IOptions {
    parentProperty: string;
    nodeProperty: string;
    groupProperty?: string;
    hasChildrenProperty?: string;
    expanderVisibility?: TExpanderVisibility;
}

/**
 * Интерфейс дерева
 * @mixes Controls/interface/IGroupedList
 *
 * @public
 * @author Авраменко А.А.
 */
export default interface ITree {
    readonly '[Controls/_treeGrid/interface/ITree]': true;
}
