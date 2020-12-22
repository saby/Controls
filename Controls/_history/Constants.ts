var Constants = {


/**
 * Константы, необходимые для работы с историей выбора.
 * @remark
 * Список констант:
 * 
 * * MAX_HISTORY — максимальное число элементов, которые сохраняются историей выбора.
 * * MAX_HISTORY_REPORTS — максимальное число элементов на <a href="/doc/platform/developmentapl/interface-development/controls/list/filter-and-search/filter-view/">Панели фильтров</a>, которые сохраняются историей выбора.
 * * MIN_RECENT — минимальное число элементов <a href="/doc/platform/developmentapl/interface-development/controls/list/filter-and-search/filter-view/">Панели фильтров</a>, сохраняемых для блока "Ранее отбирались".
 * @class Controls/_history/Constants
 * @public
 * @author Герасимов А.М.
 */
    /**
     * The maximum count of history
     */
    MAX_HISTORY: 10,

    /**
     * The maximum count of history in filter panel of reports
     */
    MAX_HISTORY_REPORTS: 7,

    /**
     * The minimum count of recent item
     */
    MIN_RECENT: 3
};

export = Constants;