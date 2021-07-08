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
     * @cfg {Boolean} Когда опция установлена в значение true, то при изменении страницы с помощью кнопок {@link /doc/platform/developmentapl/interface-development/controls/list/navigation/ навигации} ("К следующей странице", "К предыдущей странице" и т.д.) {@link /doc/platform/developmentapl/interface-development/controls/list/actions/marker/ маркер} будет установлен на первую полностью видимую запись на новой странице.
     * @default false
     * @see Controls/marker:IMarkerList#markedKey
     * @see Controls/marker:IMarkerList#markerVisibility
     * @see Controls/marker:IMarkerList#markedKeyChanged
     * @see Controls/marker:IMarkerList#beforeMarkedKeyChanged
     */
    moveMarkerOnScrollPaging: boolean;
}

/**
 * @event Происходит при изменении параметров {@link Controls/interface:INavigation#navigation навигации}.
 * @name Controls/_list/interface/IListNavigation#navigationParamsChanged
 * @param {UICommon/Events:SyntheticEvent} eventObject Дескриптор события.
 * @param {IBaseSourceConfig} params Параметры, с которыми происходила последнаяя загрузка данных в списке.
 */