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
 * @typedef {String} ExplorerViewMode
 * @variant table Таблица.
 * @variant search Режим поиска.
 * @variant tile Плитка.
 * @variant list Список.
 */

/*
 * @typedef {String} ExplorerViewMode
 * @variant table Table.
 * @variant search Search.
 * @variant tile Tiles.
 */

/**
 * @name Controls/_explorer/interface/IExplorer#viewMode
 * @cfg {ExplorerViewMode} Режим отображения списка.
 * @demo Controls-demo/Explorer/Explorer
 */

/*
 * @name Controls/_explorer/interface/IExplorer#viewMode
 * @cfg {explorerViewMode} List view mode.
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
 * @event Controls/_explorer/interface/IExplorer#rootChanged Происходит при изменении корня иерархии (например, при переходе пользователя по хлебным крошкам).
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
 * @cfg {Boolean} Определяет, должна ли отображаться стрелка рядом с кнопкой «назад».
 * @default false
 */

/*
 * @name Controls/_explorer/interface/IExplorer#showActionButton
 * @cfg {Boolean} Determines whether the arrow near "back" button should be shown.
 * @default
 * false
 */
