/**
 * Интерфейс списочных контролов, для перезагрузки данных из источника.
 * @interface Controls/_list/interface/IReloadableList
 * @public
 * @author Авраменко А.С.
 */

/**
 * @typedef {Object} SourceConfig
 * @description Конфигурация навигации ({@link Controls/interface:INavigation.INavigationPositionSourceConfig по курсору} или {@link Controls/interface:INavigation.INavigationPageSourceConfig постраничная}).,
 * так же в конфигурации можно передать опцию multiNavigation, если метод БЛ поддержимает работу с {@link /doc/platform/developmentapl/interface-development/controls/list/tree/navigation/multi-navigation/ множественной навигацией}.
 */

/**
 * Перезагружает данные из источника данных.
 * При перезагрузке в фильтр уходит список развернутых узлов (с целью восстановить пользователю структуру, которая была до перезагрузки).
 * Принимает опционально конфигурацию источника данных для: {@link Controls/_interface/INavigation/IBasePositionSourceConfig.typedef навигации по курсору }, {@link Controls/_interface/INavigation/IBasePageSourceConfig.typedef постраничной навигации}, если нужно перезагрузить список с навигацией, отличной от указанной в опциях контрола.
 * @function
 * @name Controls/_list/interface/IReloadableList#reload
 * @param {Boolean} [keepScroll=false] Сохранить ли позицию скролла после перезагрузки.
 * @param {SourceConfig} [sourceConfig=undefined] Конфигурация навигации источника данных (например размер и номер страницы для постраничной навигации), 
 * которую можно передать при вызове reload, чтобы перезагрузка произошла с этими параметрами. 
 * По умолчанию, перезагрузка происходит с параметрами, переданными в опции {@link Controls/_interface/INavigation#navigation navigation}.
 * @example
 * В следующем примере показано, как выполнить перезагрузку списка с параметрами навигации.
 * WML:
 * <pre class="brush: html">
 *    <Controls.list:View name='list'>
 *       ....
 *    </Controls.list:View>
 * </pre>
 * TS:
 * <pre class="brush: js">
 *    this._children.list.reload(true, {
 *       limit: 25,
 *       position: [null, new Date(), null, null, null],
 *       direction: 'both',
 *       field: ['@Документ', 'Веха.Дата', 'ДокументРасширение.Название', 'Раздел', 'Раздел@']
 *    })
 * </pre>
 *
 * В следующем примере показано, как выполнить перезагрузку с сохранением развёрнутых узлов.
 * WML:
 * <pre class="brush: html">
 *    <Controls.list:View name='list'>
 *       ....
 *    </Controls.list:View>
 * </pre>
 * TS:
 * <pre class="brush: js">
 *    this._children.list.reload(true, {
 *       multiNavigation: true
 *    })
 * </pre>
 * </pre>
 */

/*
 * Reloads list data and view.
 * @function Controls/_list/interface/IReloadableList#reload
 */
