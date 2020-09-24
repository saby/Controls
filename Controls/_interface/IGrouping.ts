export interface IGroupingOptions {
    groupProperty?: string;
    groupingKeyCallback?: Function;
    groupHistoryId?: string;
    historyIdCollapsedGroups?: string;
}

/**
 * Интерфейс для контролов, которые поддерживают группировку записей.
 *
 * @interface Controls/_interface/IGrouping
 * @public
 */
export default interface IGrouping {
    readonly '[Controls/_interface/IHeight]': boolean;
}