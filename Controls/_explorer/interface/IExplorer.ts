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
 * Режим отображения списка
 * @typedef {String} TExplorerViewMode
 * @variant table Таблица.
 * @variant search Режим поиска.
 * @variant tile Плитка.
 * @variant list Список.
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
 * @cfg {TExplorerViewMode} Режим отображения списка.
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
 * @cfg {Boolean} Определяет, должна ли отображаться стрелка рядом с кнопкой «назад».
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
