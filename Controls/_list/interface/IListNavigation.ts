/**
 * Интерфейс для контролов, поддерживающих навигацию по списку
 *
 * @interface Controls/_list/interface/IListNavigation
 * @public
 * @author Авраменко А.С.
 */
export default interface IListNavigation {
    readonly '[Controls/_list/interface/IListNavigation]': boolean;
}

export interface IListNavigationOptions {
    /**
     * @name Controls/_list/interface/IListNavigation#moveMarkerOnScrollPaging
     * @cfg {Boolean} Когда опция установлена в значение true, то при изменении страницы с помощью кнопок навигации ("К следующей странице", "К предыдущей странице" и т.д.) <a href="/doc/platform/developmentapl/interface-development/controls/list/actions/marker/">маркер</a> будет установлен на первую полностью видимую запись на новой странице.
     * @default false
     */
    moveMarkerOnScrollPaging: boolean;
}

/**
 * @event Происходит при изменении параметров навигации.
 * @name Controls/_list/interface/IListNavigation#navigationParamsChanged
 * @param {Vdom/Vdom:SyntheticEvent} eventObject Дескриптор события.
 * @param {IBaseSourceConfig} params Параметры, с которыми происходила последнаяя загрузка данных в списке.
 */