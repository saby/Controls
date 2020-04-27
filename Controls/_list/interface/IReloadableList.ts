/**
 * Интерфейс списочных контролов, для перезагрузки данных из источника.
 * @interface Controls/_list/interface/IReloadableList
 * @public
 * @author Авраменко А.С.
 */

/**
 * Перезагружает данные из источника данных.
 * При перезагрузке в фильтр уходит список развернутых узлов (с целью восстановить пользователю структуру, которая была до перезагрузки).
 * Принимает опционально {@link Controls/_interface/INavigation/INavigationSourceConfig.typedef конфигурацию навигации }, если нужно перезагрузить список с навигацией, отличной от указанной в опциях контрола.
 * @function
 * @name Controls/_list/interface/IReloadableList#reload
 * @param {boolean} keepScroll Сохранить ли позицию скролла после перезагрузки.
 * @param {object} sourceConfig {@link Controls/_interface/INavigation/INavigationSourceConfig.typedef Конфигурация навигации } для перезагрузки.
 */

/*
 * Reloads list data and view.
 * @function Controls/_list/interface/IReloadableList#reload
 */