/**
 * Интерфейс для иерархических списков с возможностью проваливания в папки.
 *
 * @interface Controls/_explorer/interface/IExplorer
 * @public
 * @author Авраменко А.С.
 */

/*
 * Interface for hierarchical lists that can open folders.
 *
 * @interface Controls/_explorer/interface/IExplorer
 * @public
 * @author Авраменко А.С.
 */

/**
 * @typedef {String} Controls/_explorer/interface/IExplorer/TExplorerViewMode
 * @description Допустимые значения для опции {@link viewMode}.
 * @variant table Таблица.
 * @variant search Поиск.
 * @variant tile Плитка.
 * @variant list Плоский список.
 */

/*
 * @typedef {String} TExplorerViewMode
 * @variant table Table.
 * @variant search Search.
 * @variant tile Tiles.
 * @variant list List.
 */

export type TExplorerViewMode = 'table' | 'search' | 'tile' | 'list';

/**
 * @name Controls/_explorer/interface/IExplorer#viewMode
 * @cfg {Controls/_explorer/interface/IExplorer/TExplorerViewMode.typedef} Режим отображения списка.
 * @demo Controls-demo/Explorer/Explorer
 */

/*
 * @name Controls/_explorer/interface/IExplorer#viewMode
 * @cfg {TExplorerViewMode} List view mode.
 * @demo Controls-demo/Explorer/Explorer
 */

/**
 * @name Controls/_explorer/interface/IExplorer#root
 * @cfg {Number|String} Идентификатор корневого узла.
 */

/*
 * @name Controls/_explorer/interface/IExplorer#root
 * @cfg {Number|String} Identifier of the root node.
 */

/**
 * @event Происходит при изменении корня иерархии (например, при переходе пользователя по хлебным крошкам).
 * @name Controls/_explorer/interface/IExplorer#rootChanged
 * @param event {eventObject} Дескриптор события.
 * @param root {String|Number} Идентификатор корневой записи.
 */

/**
 * @name Controls/_explorer/interface/IExplorer#backButtonIconStyle
 * @cfg {String} Стиль отображения иконки кнопки "Назад".
 * @see Controls/_heading/Back#iconStyle
 */

/**
 * @name Controls/_explorer/interface/IExplorer#backButtonFontColorStyle
 * @cfg {String} Стиль цвета кнопки "Назад".
 * @see Controls/_heading/Back#fontColorStyle
 */

/**
 * @name Controls/_explorer/interface/IExplorer#showActionButton
 * @cfg {Boolean} Определяет, должна ли отображаться стрелка рядом с кнопкой "Назад".
 * @default false
 */

/*
 * @name Controls/_explorer/interface/IExplorer#showActionButton
 * @cfg {Boolean} Determines whether the arrow near "back" button should be shown.
 * @default
 * false
 */

/**
 * @name Controls/_explorer/interface/IExplorer#dedicatedItemProperty
 * @cfg {String} Имя свойства узла дерева, которое определяет, что при поиске этот узел должен быть показан отдельной хлебной крошкой.
 */

/**
 * @typedef {String} Controls/_explorer/interface/IExplorer/SearchStartingWith
 * @description Допустимые значения для опции {@link searchStartingWith}.
 * @variant root Поиск происходит в корне.
 * @variant current Поиск происходит в текущем резделе.
 */

/**
 * @name Controls/_explorer/interface/IExplorer#searchStartingWith
 * @cfg {Controls/_explorer/interface/IExplorer/SearchStartingWith.typedef} Режим поиска в иерархическом списке.
 * @default root
 */

/**
 * @typedef {String} Controls/_explorer/interface/IExplorer/SearchNavigationMode
 * @description Допустимые значения для опции {@link searchNavigationMode}.
 * @variant open В {@link Controls/_explorer/interface/IExplorer#viewMode режиме поиска} при клике на хлебную крошку происходит проваливание в данный узел.
 * @variant expand В режиме поиска при клике на хлебную крошку данные отображаются от корня, путь до узла разворачивается.
 */
/**
 * @name Controls/_explorer/interface/IExplorer#searchNavigationMode
 * @cfg {Controls/_explorer/interface/IExplorer/SearchNavigationMode.typedef} Режим навигации при поиске в иерархическом списке.
 * @default open
 */