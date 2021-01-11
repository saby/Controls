export interface IGroupingOptions {
    groupProperty?: string;
    groupingKeyCallback?: Function;
    groupHistoryId?: string;
    historyIdCollapsedGroups?: string;
}

/**
 * Интерфейс для контролов, которые поддерживают группировку записей.
 *
 * @public
 * @author Авраменко А.С.
 */
export default interface IGrouping {
    readonly '[Controls/_interface/IHeight]': boolean;
}